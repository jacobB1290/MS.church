import { type Hono } from 'hono'
import { GOOGLE_CALENDAR_CONFIG } from '../config.js'

// In-memory cache for calendar API responses (shared across requests in the same worker instance)
let _cache: { data: unknown; ts: number } | null = null

export function registerCalendarRoute(app: Hono) {
  app.get('/api/calendar/events', async (c) => {
    try {
      const now = Date.now()

      // Return cached response if still fresh
      if (_cache && now - _cache.ts < GOOGLE_CALENDAR_CONFIG.CACHE_TTL) {
        c.header('X-Cache', 'HIT')
        return c.json(_cache.data)
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
      // Only user-created events, not holidays/birthdays/etc.
      apiUrl.searchParams.set('eventTypes', 'default')
      // Required to receive file attachment metadata (for event flyer images)
      apiUrl.searchParams.set('supportsAttachments', 'true')

      // Include the past year so past events show in the gallery modal
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      apiUrl.searchParams.set('timeMin', oneYearAgo.toISOString())

      // The API key has HTTP-referrer restrictions set to ms.church.
      // Server-side requests don't carry a browser Referer header, so we
      // must set it explicitly or Google returns 403 "API key not valid".
      const response = await fetch(apiUrl.toString(), {
        headers: { Referer: 'https://ms.church/' },
      })

      if (!response.ok) {
        const errorData = await response.json() as { error?: { message?: string } }
        console.error('Google Calendar API error:', errorData)
        return c.json(
          {
            success: false,
            error: `Google Calendar API error: ${errorData.error?.message ?? 'Unknown error'}`,
            events: [],
          },
          response.status as 400 | 401 | 403 | 404 | 500
        )
      }

      const data = await response.json() as {
        items?: unknown[]
        summary?: string
        timeZone?: string
      }

      const events = ((data.items ?? []) as Array<{
        status?: string
        creator?: { email?: string }
        eventType?: string
        start?: { date?: string; dateTime?: string }
        attachments?: Array<{ mimeType?: string; fileId?: string; fileUrl?: string }>
        description?: string
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
          const startDate = gcalEvent.start?.date ?? gcalEvent.start?.dateTime ?? ''
          const eventDate = new Date(startDate)
          const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
          const displayDate = `${months[eventDate.getMonth()]} ${eventDate.getDate()}`

          // Resolve event flyer image from Google Drive attachment
          // Uses lh3.googleusercontent.com for reliable public image loading
          let imageUrl = ''
          if (gcalEvent.attachments && gcalEvent.attachments.length > 0) {
            const imageAttachment = gcalEvent.attachments.find(
              (att) => att.mimeType?.startsWith('image/')
            )
            const attachment = imageAttachment ?? gcalEvent.attachments[0]
            if (attachment.fileId) {
              imageUrl = `https://lh3.googleusercontent.com/d/${attachment.fileId}=w1000`
            } else if (attachment.fileUrl) {
              const match = attachment.fileUrl.match(/\/d\/([a-zA-Z0-9_-]+)|[?&]id=([a-zA-Z0-9_-]+)/)
              if (match) {
                imageUrl = `https://lh3.googleusercontent.com/d/${match[1] ?? match[2]}=w1000`
              }
            }
          }

          // Parse optional CTA from event description: [CTA: BUTTON TEXT | URL]
          let ctaText = 'LEARN MORE'
          let ctaLink = '#contact'
          if (gcalEvent.description) {
            const ctaMatch = gcalEvent.description.match(/\[CTA:\s*([^|]+)\s*\|\s*([^\]]+)\]/)
            if (ctaMatch) {
              ctaText = ctaMatch[1].trim()
              ctaLink = ctaMatch[2].trim()
            }
          }

          return {
            id: gcalEvent.id,
            title: gcalEvent.summary ?? 'Untitled Event',
            description: gcalEvent.description?.replace(/\[CTA:[^\]]+\]/, '').trim() ?? '',
            date: eventDate.toISOString().split('T')[0],
            displayDate,
            image: imageUrl,
            cta: { text: ctaText, link: ctaLink },
          }
        })

      const result = {
        success: true,
        calendarId,
        calendarName: data.summary ?? '',
        timezone: data.timeZone ?? GOOGLE_CALENDAR_CONFIG.TIME_ZONE,
        events,
        totalEvents: events.length,
      }

      _cache = { data: result, ts: now }
      c.header('X-Cache', 'MISS')
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
