// Shared rendering helpers for the /watch library, its permalink pages, and the
// topic pages. Pure + dependency-free so every watch surface renders cards,
// labels, and timestamps the same way (single source of truth — the hub, a
// topic page, and a "more like this" rail can never drift).

import type { PublishedSermon, SermonSegment, SermonFormat } from '../sermons-feed.js'
import { topicSlug } from '../sermons-feed.js'

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** "mm:ss" or "h:mm:ss". */
export function mmss(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

export function longDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Boise',
  })
}

/** "Jun 21, 2026" — compact dateline for cards. */
export function shortDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Boise',
  })
}

/** "42 min" / "1 hr 12 min". */
export function lengthLabel(totalSec: number | null): string | null {
  if (!totalSec || totalSec <= 0) return null
  const mins = Math.round(totalSec / 60)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

export function posterFor(videoId: string, thumb: string | null): string {
  return thumb || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

// Friendly chapter-type labels — mirrors the CRM segmenter's vocabulary.
export const SEGMENT_LABEL: Record<string, string> = {
  welcome: 'Welcome',
  worship: 'Worship',
  scripture: 'Scripture',
  prayer: 'Prayer',
  sermon: 'Sermon',
  discussion: 'Discussion',
  poem: 'Poem',
  testimony: 'Testimony',
  offering: 'Offering',
  announcement: 'Announcement',
  benediction: 'Benediction',
  other: 'Other',
}

/** The library-tab noun for a service's message format. */
export function formatNoun(format: SermonFormat): string {
  return format === 'discussion' ? 'Discussion' : 'Sermon'
}

/**
 * The "message" segment a permalink plays by default — the part people came for,
 * not the welcome or the worship. For a sermon that's the sermon chapter; for a
 * discussion it's the discussion chapter. Falls back to the longest substantive
 * chapter, then to the whole service when a video has no chapters.
 */
export function primarySegment(sermon: PublishedSermon): SermonSegment | null {
  const segs = sermon.segments
  if (segs.length === 0) return null
  const want = sermon.format === 'discussion' ? 'discussion' : 'sermon'
  const byType = segs.filter((s) => s.type === want)
  const longest = (list: SermonSegment[]) =>
    list.reduce<SermonSegment | null>(
      (best, s) => (!best || s.endSec - s.startSec > best.endSec - best.startSec ? s : best),
      null,
    )
  if (byType.length > 0) return longest(byType)
  // No explicit message chapter: longest chapter that isn't pure preamble.
  const substantive = segs.filter((s) => !['welcome', 'worship', 'offering', 'announcement'].includes(s.type))
  return longest(substantive.length > 0 ? substantive : segs)
}

/** A short, human speaker line ("with Pastor John" / "John and Mark"). */
export function speakerLine(speakers: string[]): string | null {
  const clean = speakers.map((s) => s.trim()).filter(Boolean)
  if (clean.length === 0) return null
  if (clean.length === 1) return clean[0]
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`
  return `${clean.slice(0, -1).join(', ')}, and ${clean[clean.length - 1]}`
}

/** The preview line under a card title: the summary, trimmed to ~150 chars. */
export function previewText(sermon: PublishedSermon): string {
  const raw = (sermon.summary ?? sermon.seo?.description ?? '').trim()
  if (raw.length <= 160) return raw
  const cut = raw.slice(0, 157)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`
}

/**
 * A library card — the same markup on the hub, a topic page, and any "more like
 * this" rail. Links in-site to the permalink (never off to YouTube). Topic chips
 * link to the topic pages. Card posters are ALWAYS lazy: they sit below the
 * featured hero (the page's real LCP), and eager-decoding them was inflating the
 * hashload entrance frame on the heavier library page.
 */
export function watchCard(sermon: PublishedSermon): string {
  const href = `/watch/${escapeHtml(sermon.slug)}`
  const poster = posterFor(sermon.youtubeVideoId, sermon.thumbnailUrl)
  const date = shortDate(sermon.publishedAt)
  const speaker = speakerLine(sermon.speakers)
  const len = lengthLabel(sermon.durationSec)
  const preview = previewText(sermon)
  const noun = formatNoun(sermon.format)
  const topics = sermon.topics.slice(0, 3)
  // Every distinct topic slug, for the hub's in-tab client-side filter.
  const topicSlugs = Array.from(new Set(sermon.topics.map((t) => topicSlug(t)).filter(Boolean))).join(' ')
  const metaBits = [date, speaker ? `with ${escapeHtml(speaker)}` : null, len]
    .filter(Boolean)
    .map((b) => `<span>${b}</span>`)
    .join('<span class="watch-card-dot" aria-hidden="true">·</span>')

  return `<article class="watch-card" data-topics="${escapeHtml(topicSlugs)}">
                        <a class="watch-card-link" href="${href}" aria-label="${escapeHtml(`${noun}: ${sermon.title}`)}">
                            <span class="watch-card-thumb">
                                <img src="${escapeHtml(poster)}"
                                     alt="${escapeHtml(`${sermon.title} — ${noun.toLowerCase()} from Morning Star Christian Church in Boise, Idaho`)}"
                                     width="1280" height="720" loading="lazy" decoding="async"
                                     onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${escapeHtml(sermon.youtubeVideoId)}/hqdefault.jpg';">
                                <span class="watch-card-play" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
                                </span>
                                <span class="watch-card-kind">${escapeHtml(noun)}</span>
                            </span>
                            <span class="watch-card-body">
                                ${metaBits ? `<span class="watch-card-meta">${metaBits}</span>` : ''}
                                <span class="watch-card-title">${escapeHtml(sermon.title)}</span>
                                ${preview ? `<span class="watch-card-preview">${escapeHtml(preview)}</span>` : ''}
                            </span>
                        </a>
                        ${
                          topics.length > 0
                            ? `<span class="watch-card-topics">${topics
                                .map(
                                  (t) =>
                                    `<a class="watch-card-topic" href="/watch/topic/${escapeHtml(topicSlug(t))}">${escapeHtml(t)}</a>`,
                                )
                                .join('')}</span>`
                            : ''
                        }
                    </article>`
}
