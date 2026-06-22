// Published-sermons feed from the church CRM (ms-management).
//
// The CRM is the authoring + publishing surface for sermons: staff run the
// pipeline (detect the Sunday video, transcribe it, segment it into chapters)
// and PUBLISH the ones they want public. Only published rows are exposed, via
// the CRM's `GET /api/public/sermons` endpoint. This module fetches that feed
// server-side so /watch can render real, chaptered sermon content into the HTML
// (good for SEO, no client-side mutation, no layout shift).
//
// Degrade-to-empty, exactly like the calendar/contact integrations: if
// CRM_SERMONS_ENDPOINT is unset, or the CRM is unreachable, or the payload is
// the wrong shape, this returns [] and /watch falls back to the live YouTube
// latest video + the evergreen order-of-service. The moment the env var points
// at the CRM and a sermon is published, the page fills itself.
//
// The PublishedSermon shape is kept in lockstep with the CRM's
// src/app/api/public/sermons/route.ts `PublicSermon` type. If the CRM changes
// the feed shape, change both together.

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes, matches the CRM's own s-maxage

export type SermonSegment = {
  startSec: number
  endSec: number
  type: string
  title: string
  summary: string
  scriptureRefs: string[]
}

export type PublishedSermon = {
  slug: string
  youtubeVideoId: string
  title: string
  publishedAt: string | null
  thumbnailUrl: string | null
  durationSec: number | null
  summary: string | null
  seo: { description: string; tags: string[] } | null
  segments: SermonSegment[]
}

let _cache: { sermons: PublishedSermon[]; ts: number } | null = null

/** The CRM feed base, e.g. https://crm.ms.church/api/public/sermons.
 *  Guarded with a typeof check to stay portable to non-Node runtimes
 *  (matches the env-access pattern in routes/contact.ts). */
function endpoint(): string | undefined {
  return typeof process !== 'undefined' ? process.env?.CRM_SERMONS_ENDPOINT : undefined
}

/** Whether the CRM sermon feed is wired up (the env var is set). */
export function hasSermonFeed(): boolean {
  return Boolean(endpoint())
}

function isSegment(x: unknown): x is SermonSegment {
  if (!x || typeof x !== 'object') return false
  const s = x as Record<string, unknown>
  return (
    typeof s.startSec === 'number' &&
    typeof s.title === 'string' &&
    typeof s.type === 'string'
  )
}

/** Validate + normalize one feed item; returns null if it isn't a usable sermon. */
function normalize(x: unknown): PublishedSermon | null {
  if (!x || typeof x !== 'object') return null
  const s = x as Record<string, unknown>
  if (typeof s.youtubeVideoId !== 'string' || typeof s.title !== 'string') return null
  const segments = Array.isArray(s.segments) ? s.segments.filter(isSegment) : []
  const seo =
    s.seo && typeof s.seo === 'object' && typeof (s.seo as Record<string, unknown>).description === 'string'
      ? (s.seo as PublishedSermon['seo'])
      : null
  return {
    slug: typeof s.slug === 'string' && s.slug ? s.slug : s.youtubeVideoId,
    youtubeVideoId: s.youtubeVideoId,
    title: s.title,
    publishedAt: typeof s.publishedAt === 'string' ? s.publishedAt : null,
    thumbnailUrl: typeof s.thumbnailUrl === 'string' ? s.thumbnailUrl : null,
    durationSec: typeof s.durationSec === 'number' ? s.durationSec : null,
    summary: typeof s.summary === 'string' ? s.summary : null,
    seo,
    segments,
  }
}

/**
 * Published sermons, newest first. Empty array when the feed is unconfigured,
 * unreachable, or malformed (never throws). 5-minute in-memory cache; serves a
 * stale cache rather than nothing on a transient failure.
 */
export async function fetchPublishedSermons(limit = 12): Promise<PublishedSermon[]> {
  const url = endpoint()
  if (!url) return []

  const now = Date.now()
  if (_cache && now - _cache.ts < CACHE_TTL) {
    return _cache.sermons.slice(0, limit)
  }

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    })
    if (res.ok) {
      const json = (await res.json()) as unknown
      const list =
        json && typeof json === 'object' && Array.isArray((json as { sermons?: unknown }).sermons)
          ? (json as { sermons: unknown[] }).sermons
          : []
      const sermons = list.map(normalize).filter((s): s is PublishedSermon => s !== null)
      _cache = { sermons, ts: now }
      return sermons.slice(0, limit)
    }
  } catch (err) {
    console.error('CRM sermon feed fetch failed:', err)
  }

  if (_cache) return _cache.sermons.slice(0, limit)
  return []
}
