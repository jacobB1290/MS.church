import { type Hono } from 'hono'
import { GOOGLE_CALENDAR_CONFIG } from '../config.js'

// In-memory cache for calendar API responses (shared across requests in the same worker instance)
let _cache: { data: unknown; ts: number } | null = null

// In production on Vercel, route event images through Vercel Image
// Optimization for automatic WebP/AVIF conversion + CDN edge caching
// (configured in vercel.json). Local dev (and any non-Vercel runtime)
// uses the direct Google CDN URL.
const isVercel = typeof process !== 'undefined' && !!process.env?.VERCEL

function toImageUrl(fileId: string): string {
  const raw = `https://lh3.googleusercontent.com/d/${fileId}=w800`
  return isVercel ? `/_vercel/image?url=${encodeURIComponent(raw)}&w=800&q=80` : raw
}

// Parse a time value directly from an ISO 8601 dateTime string (e.g. "2026-04-04T11:00:00-07:00").
// Reads the wall-clock time embedded in the string so we never convert to UTC.
function parseWallTime(dt: string): { h: number; m: number } | null {
  const match = dt.match(/T(\d{2}):(\d{2})/)
  if (!match) return null
  return { h: parseInt(match[1]), m: parseInt(match[2]) }
}

function to12h(t: { h: number; m: number }): { digits: string; ampm: string } {
  const ampm = t.h >= 12 ? 'PM' : 'AM'
  const h = t.h % 12 || 12
  const mins = t.m === 0 ? '' : `:${String(t.m).padStart(2, '0')}`
  return { digits: `${h}${mins}`, ampm }
}

// Returns a formatted time range string like "11 AM – 3 PM" or null for all-day events.
function formatEventTime(startDT: string, endDT?: string): string | null {
  const start = parseWallTime(startDT)
  if (!start) return null
  const s = to12h(start)
  if (endDT) {
    const end = parseWallTime(endDT)
    if (end) {
      const e = to12h(end)
      // Omit shared AM/PM on the start side when both sides share it (e.g. "11 AM – 3 PM")
      if (s.ampm === e.ampm) return `${s.digits} – ${e.digits} ${e.ampm}`
      return `${s.digits} ${s.ampm} – ${e.digits} ${e.ampm}`
    }
  }
  return `${s.digits} ${s.ampm}`
}

export type EventCta = { text: string; link: string }

export type CalendarEvent = {
  id: string
  title: string
  // Body with every structured tag stripped (and, for hand-authored events
  // without a [CTA:] tag, the detected link removed). Shown in the detail view.
  description: string
  date: string
  displayDate: string
  time: string | null
  image: string
  location: string
  cost: string
  ages: string
  rsvpBy: string
  // Every CTA whose link is a real http(s) URL, primary first. Rendered as
  // button(s) on the card (primary) and in the detail view (all).
  ctas: EventCta[]
  // Primary CTA (back-compat for any older reader): ctas[0] or a #contact stub.
  cta: EventCta
}

// ── Structured description parser ───────────────────────────────────────────
// The CRM (ms-management) authors the calendar event description as a body plus
// a block of `[Key: value]` tags; this parses them back out. Kept verbatim in
// lockstep with the CRM's src/server/google/eventMapping.ts (its
// scripts/events/verify-mapping.ts re-reads THIS file and asserts the regexes
// below are unchanged — the drift guard). A hand-authored "Label: https://…"
// or bare URL still becomes a button when no [CTA:] tag is present.
const CTA_REGEX = /\[CTA:\s*([^|\]]+?)\s*\|\s*([^\]]+?)\s*\]/g
const COST_REGEX = /\[Cost:\s*([^\]]+?)\s*\]/i
const AGES_REGEX = /\[Ages:\s*([^\]]+?)\s*\]/i
const RSVP_REGEX = /\[RSVP by:\s*([^\]]+?)\s*\]/i
const TAG_STRIP_REGEX = /\[(?:CTA|Cost|Ages|RSVP by):[^\]]*\]/gi
const LABELED_LINK_REGEX = /([A-Za-z][A-Za-z0-9 ]{0,30}?)\s*:\s*(https?:\/\/[^\s<>"']+)/
const BARE_LINK_REGEX = /https?:\/\/[^\s<>"']+/
const TRAILING_PUNCT = /[.,;)\]]+$/

function parseEventContent(raw: string | undefined): {
  body: string
  ctas: EventCta[]
  cost: string
  ages: string
  rsvpBy: string
} {
  const text = raw ?? ''
  const ctas: EventCta[] = []
  for (const m of text.matchAll(CTA_REGEX)) {
    ctas.push({ text: m[1].trim(), link: m[2].trim() })
  }
  const cost = text.match(COST_REGEX)?.[1].trim() ?? ''
  const ages = text.match(AGES_REGEX)?.[1].trim() ?? ''
  const rsvpBy = text.match(RSVP_REGEX)?.[1].trim() ?? ''

  let body = text.replace(TAG_STRIP_REGEX, '')
  if (ctas.length === 0) {
    const labeled = body.match(LABELED_LINK_REGEX)
    if (labeled) {
      ctas.push({ text: labeled[1].trim(), link: labeled[2].replace(TRAILING_PUNCT, '') })
      body = body.replace(labeled[0], '')
    } else {
      const bare = body.match(BARE_LINK_REGEX)
      if (bare) {
        ctas.push({ text: 'Learn more', link: bare[0].replace(TRAILING_PUNCT, '') })
        body = body.replace(bare[0], '')
      }
    }
  }
  body = body.replace(/\n{3,}/g, '\n\n').trim()
  return { body, ctas, cost, ages, rsvpBy }
}

export type CalendarResult = {
  success: boolean
  error?: string
  calendarId?: string
  calendarName?: string
  timezone?: string
  events: CalendarEvent[]
  totalEvents?: number
  status?: number
}

// Shared fetcher — used by /api/calendar/events (JSON) and /feed.xml (RSS).
// Returns null on success-with-data, or { error, status } on failure.
export async function fetchCalendarEvents(): Promise<CalendarResult> {
  const now = Date.now()

  // Return cached response if still fresh
  if (_cache && now - _cache.ts < GOOGLE_CALENDAR_CONFIG.CACHE_TTL) {
    return _cache.data as CalendarResult
  }

  const calendarId = GOOGLE_CALENDAR_CONFIG.CALENDAR_ID
  const apiUrl = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
  )

  apiUrl.searchParams.set('key', GOOGLE_CALENDAR_CONFIG.API_KEY)
  apiUrl.searchParams.set('singleEvents', 'true')
  apiUrl.searchParams.set('orderBy', 'startTime')
  apiUrl.searchParams.set('maxResults', String(GOOGLE_CALENDAR_CONFIG.MAX_RESULTS))
  apiUrl.searchParams.set('timeZone', GOOGLE_CALENDAR_CONFIG.TIME_ZONE)
  apiUrl.searchParams.set('eventTypes', 'default')
  apiUrl.searchParams.set('supportsAttachments', 'true')

  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  apiUrl.searchParams.set('timeMin', oneYearAgo.toISOString())

  const response = await fetch(apiUrl.toString(), {
    headers: { Referer: 'https://ms.church/' },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    let errorMessage = `HTTP ${response.status}`
    try {
      const errorData = JSON.parse(body) as { error?: { message?: string } }
      errorMessage = errorData.error?.message ?? errorMessage
    } catch {
      // non-JSON error body
    }
    console.error('Google Calendar API error:', response.status, errorMessage)
    return {
      success: false,
      error: `Google Calendar API error: ${errorMessage}`,
      events: [],
      status: response.status,
    }
  }

  const data = await response.json() as {
    items?: unknown[]
    summary?: string
    timeZone?: string
  }

  const events: CalendarEvent[] = ((data.items ?? []) as Array<{
    status?: string
    creator?: { email?: string }
    eventType?: string
    start?: { date?: string; dateTime?: string }
    end?: { date?: string; dateTime?: string }
    attachments?: Array<{ mimeType?: string; fileId?: string; fileUrl?: string }>
    description?: string
    location?: string
    id: string
    summary?: string
    htmlLink?: string
    updated?: string
  }>)
    .filter((gcalEvent) => {
      if (gcalEvent.status === 'cancelled') return false
      const creatorEmail = gcalEvent.creator?.email ?? ''
      if (creatorEmail.includes('holiday@group.v.calendar.google.com')) return false
      if (gcalEvent.eventType && gcalEvent.eventType !== 'default') return false
      return true
    })
    .map((gcalEvent) => {
      const isAllDay = !!gcalEvent.start?.date && !gcalEvent.start?.dateTime
      const startDate = gcalEvent.start?.date ?? gcalEvent.start?.dateTime ?? ''
      const eventDate = new Date(startDate)
      const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
      const displayDate = `${months[eventDate.getMonth()]} ${eventDate.getDate()}`

      const displayTime = isAllDay
        ? null
        : formatEventTime(gcalEvent.start?.dateTime ?? '', gcalEvent.end?.dateTime)

      let imageUrl = ''
      if (gcalEvent.attachments && gcalEvent.attachments.length > 0) {
        const imageAttachment = gcalEvent.attachments.find(
          (att) => att.mimeType?.startsWith('image/')
        )
        const attachment = imageAttachment ?? gcalEvent.attachments[0]
        if (attachment.fileId) {
          imageUrl = toImageUrl(attachment.fileId)
        } else if (attachment.fileUrl) {
          const match = attachment.fileUrl.match(/\/d\/([a-zA-Z0-9_-]+)|[?&]id=([a-zA-Z0-9_-]+)/)
          if (match) {
            imageUrl = toImageUrl(match[1] ?? match[2])
          }
        }
      }

      const { body, ctas, cost, ages, rsvpBy } = parseEventContent(gcalEvent.description)
      // Only real http(s) links render as buttons (anchors like #contact don't).
      const liveCtas = ctas.filter((c) => /^https?:\/\//i.test(c.link))

      return {
        id: gcalEvent.id,
        title: gcalEvent.summary ?? 'Untitled Event',
        description: body,
        date: eventDate.toISOString().split('T')[0],
        displayDate,
        time: displayTime,
        image: imageUrl,
        location: gcalEvent.location?.trim() ?? '',
        cost,
        ages,
        rsvpBy,
        ctas: liveCtas,
        cta: liveCtas[0] ?? { text: 'LEARN MORE', link: '#contact' },
      }
    })

  const result: CalendarResult = {
    success: true,
    calendarId,
    calendarName: data.summary ?? '',
    timezone: data.timeZone ?? GOOGLE_CALENDAR_CONFIG.TIME_ZONE,
    events,
    totalEvents: events.length,
  }

  _cache = { data: result, ts: now }
  return result
}

// Whether the cached response was served fresh from memory (for X-Cache header).
export function isCalendarCacheFresh(): boolean {
  return !!_cache && (Date.now() - _cache.ts) < GOOGLE_CALENDAR_CONFIG.CACHE_TTL
}

export function registerCalendarRoute(app: Hono) {
  app.get('/api/calendar/events', async (c) => {
    try {
      const cacheWasFresh = isCalendarCacheFresh()
      const result = await fetchCalendarEvents()

      if (!result.success) {
        return c.json(
          {
            success: false,
            error: result.error,
            events: [],
          },
          (result.status ?? 500) as 400 | 401 | 403 | 404 | 500
        )
      }

      c.header('X-Cache', cacheWasFresh ? 'HIT' : 'MISS')
      c.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
      return c.json(result)
    } catch (error) {
      console.error('Calendar API error:', error)
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          events: [],
        },
        500
      )
    }
  })
}

