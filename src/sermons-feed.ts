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

/** Each week's service is EITHER a sermon OR a 2-host discussion. */
export type SermonFormat = 'sermon' | 'discussion'

/** Regular congregational worship vs a program song (special/announced). */
export type SongKind = 'worship' | 'program'

/** An individual worship song within a service (the Songs library item). */
export type SermonSong = {
  title: string
  leader: string | null
  kind: SongKind
  /** One theme tag, shared with the message topic vocabulary. */
  topic: string | null
  startSec: number
  endSec: number
}

export type PublishedSermon = {
  slug: string
  youtubeVideoId: string
  title: string
  /** The message format the CRM classified — drives which library tab it lands in. */
  format: SermonFormat
  /** Who carried the message (preacher, or the discussion hosts). */
  speakers: string[]
  /** Self-managing AI topic vocabulary — powers the library's topic filter + topic pages. */
  topics: string[]
  publishedAt: string | null
  thumbnailUrl: string | null
  durationSec: number | null
  summary: string | null
  seo: { description: string; tags: string[] } | null
  segments: SermonSegment[]
  /** Individual worship songs — the Songs library. */
  songs: SermonSong[]
  /** Full caption transcript — present on the per-slug permalink for SEO; the
   *  list feed may omit it to stay lean (normalize tolerates either). */
  transcript: string | null
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

/** Validate + normalize one worship song; null if unusable. */
function normalizeSong(x: unknown): SermonSong | null {
  if (!x || typeof x !== 'object') return null
  const s = x as Record<string, unknown>
  if (typeof s.title !== 'string' || !s.title.trim()) return null
  if (typeof s.startSec !== 'number' || typeof s.endSec !== 'number') return null
  if (!(s.endSec > s.startSec)) return null
  return {
    title: s.title.trim(),
    leader: typeof s.leader === 'string' && s.leader.trim() ? s.leader.trim() : null,
    kind: s.kind === 'program' ? 'program' : 'worship',
    topic: typeof s.topic === 'string' && s.topic.trim() ? s.topic.trim() : null,
    startSec: s.startSec,
    endSec: s.endSec,
  }
}

/** Validate + normalize one feed item; returns null if it isn't a usable sermon. */
function normalize(x: unknown): PublishedSermon | null {
  if (!x || typeof x !== 'object') return null
  const s = x as Record<string, unknown>
  if (typeof s.youtubeVideoId !== 'string' || typeof s.title !== 'string') return null
  const segments = Array.isArray(s.segments) ? s.segments.filter(isSegment) : []
  const songs = Array.isArray(s.songs) ? s.songs.map(normalizeSong).filter((x): x is SermonSong => x !== null) : []
  const seo =
    s.seo && typeof s.seo === 'object' && typeof (s.seo as Record<string, unknown>).description === 'string'
      ? (s.seo as PublishedSermon['seo'])
      : null
  const stringArray = (x: unknown): string[] =>
    Array.isArray(x) ? x.filter((v): v is string => typeof v === 'string' && v.trim() !== '') : []
  return {
    slug: typeof s.slug === 'string' && s.slug ? s.slug : s.youtubeVideoId,
    youtubeVideoId: s.youtubeVideoId,
    title: s.title,
    // Default to 'sermon' for older rows or a not-yet-migrated CRM (the field is
    // additive; the library still places everything, just under Sermons).
    format: s.format === 'discussion' ? 'discussion' : 'sermon',
    speakers: stringArray(s.speakers),
    topics: stringArray(s.topics),
    publishedAt: typeof s.publishedAt === 'string' ? s.publishedAt : null,
    thumbnailUrl: typeof s.thumbnailUrl === 'string' ? s.thumbnailUrl : null,
    durationSec: typeof s.durationSec === 'number' ? s.durationSec : null,
    summary: typeof s.summary === 'string' ? s.summary : null,
    seo,
    segments,
    songs,
    transcript: typeof s.transcript === 'string' && s.transcript ? s.transcript : null,
  }
}

/**
 * The full published list, newest first, with a 5-minute in-memory cache. Empty
 * array when the feed is unconfigured, unreachable, or malformed (never throws);
 * serves a stale cache rather than nothing on a transient failure. Every public
 * read goes through here so the whole /watch surface shares one fetch + cache.
 */
async function loadSermons(): Promise<PublishedSermon[]> {
  const url = endpoint()
  if (!url) return []

  const now = Date.now()
  if (_cache && now - _cache.ts < CACHE_TTL) return _cache.sermons

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
      return sermons
    }
  } catch (err) {
    console.error('CRM sermon feed fetch failed:', err)
  }

  if (_cache) return _cache.sermons
  return []
}

/** Published items, newest first, capped at `limit`. */
export async function fetchPublishedSermons(limit = 12): Promise<PublishedSermon[]> {
  return (await loadSermons()).slice(0, limit)
}

/** Every published item, newest first — the /watch library backing list. */
export async function fetchAllPublishedSermons(): Promise<PublishedSermon[]> {
  return loadSermons()
}

/**
 * A single published item by slug, or null. Hits the CRM's per-slug endpoint
 * first because that response carries the FULL transcript (the list feed omits
 * it to stay lean); falls back to the cached list (no transcript) if that fails.
 * Permalink pages use this so the transcript SEO surface is populated.
 */
export async function fetchSermonBySlug(slug: string): Promise<PublishedSermon | null> {
  const url = endpoint()
  if (url) {
    try {
      const sep = url.includes('?') ? '&' : '?'
      const res = await fetch(`${url}${sep}slug=${encodeURIComponent(slug)}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(4000),
      })
      if (res.ok) {
        const json = (await res.json()) as { sermon?: unknown }
        const one = json && typeof json === 'object' ? normalize(json.sermon) : null
        if (one) return one
      }
    } catch (err) {
      console.error('CRM sermon slug fetch failed:', err)
    }
  }
  // Fallback: find it in the cached list (carries everything but the transcript).
  const all = await loadSermons()
  return all.find((s) => s.slug === slug) ?? null
}

/** url-safe topic slug (mirrors the CRM slugify so topic links are stable). */
export function topicSlug(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/['’"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export type TopicTally = { topic: string; slug: string; count: number }

/**
 * The one tag that represents a published item — the first topic. One tag per
 * item is a hard design rule, so the whole site (filter chips, topic pages,
 * sitemap) keys off this, never the full topics array.
 */
export function itemTopic(sermon: PublishedSermon): string | null {
  const t = sermon.topics.find((x) => x.trim())
  return t ? t.trim() : null
}

/** Distinct PRIMARY topics across the library with counts, most-used first. */
export function tallyTopics(sermons: PublishedSermon[]): TopicTally[] {
  const bySlug = new Map<string, TopicTally>()
  for (const s of sermons) {
    const topic = itemTopic(s)
    if (!topic) continue
    const slug = topicSlug(topic)
    if (!slug) continue
    const existing = bySlug.get(slug)
    if (existing) existing.count++
    else bySlug.set(slug, { topic, slug, count: 1 })
  }
  return [...bySlug.values()].sort(
    (a, b) => b.count - a.count || a.topic.localeCompare(b.topic),
  )
}
