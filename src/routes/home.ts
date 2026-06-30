import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody, type HomeWatchView } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'
import { watchHandoffScript } from '../templates/watch-handoff.js'
import { fetchAllPublishedSermons, type PublishedSermon } from '../sermons-feed.js'
import {
  mmss,
  longDate,
  lengthLabel,
  speakerLine,
  formatNoun,
  primarySegment,
  SEGMENT_LABEL,
} from '../templates/watch-shared.js'

// The raw livestream title is machine boilerplate (identical every week, carries
// a duplicate date). Until a service earns a real generated title, show a clean
// label so the home caption reads as authored content. (Kept in step with the
// same cleaner in watch-body.ts.)
function cleanServiceTitle(raw: string): string {
  const t = (raw || '').trim()
  if (!t) return 'Sunday service'
  if (/^live\b/i.test(t) || /morning star church/i.test(t) || /\|\s*\d{1,2}\/\d{1,2}\/\d{2,4}\s*\|/.test(t)) {
    return 'Sunday service'
  }
  return t
}

/**
 * True when this week's Sunday service has already aired but the newest
 * published service is still last week's (it hasn't been chaptered yet). The
 * home plate then shows the generic "being prepared" state rather than passing
 * last week's service off as the most recent. Compares the latest published
 * service's Mountain-Time calendar date against the most recent Sunday whose
 * 9:00 AM service has already started. Coarse by design (the window is hours,
 * not seconds), so the ~5-min edge cache on the home page is fine.
 */
function pendingSegmentation(publishedAtISO: string | null, now: Date): boolean {
  if (!publishedAtISO) return false
  // MT wall-clock "now" (same America/Denver hack the client countdown uses).
  const mtNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Denver' }))
  const lastSunday = new Date(mtNow)
  lastSunday.setHours(9, 0, 0, 0)
  const day = mtNow.getDay()
  if (day === 0) {
    if (mtNow.getHours() < 9) lastSunday.setDate(lastSunday.getDate() - 7)
  } else {
    lastSunday.setDate(lastSunday.getDate() - day)
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  // lastSunday already holds MT wall-clock fields, so read them directly (don't
  // re-project through a tz formatter, which would double-shift).
  const lastSundayStr = `${lastSunday.getFullYear()}-${pad(lastSunday.getMonth() + 1)}-${pad(lastSunday.getDate())}`
  // The published service is a real instant; project it to its MT calendar date.
  const pubStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Denver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(publishedAtISO))
  return pubStr < lastSundayStr
}

/** Compose the home "latest service" plate view from the published-sermon feed.
 *  Library when the newest service is chaptered; fallback (just the live video +
 *  evergreen blurb) otherwise. Songs are folded into their worship chapter. */
function buildHomeWatch(all: PublishedSermon[]): HomeWatchView {
  const s = all[0]
  if (!s || s.segments.length === 0) {
    return {
      mode: 'fallback',
      slug: s?.slug ?? null,
      videoId: s?.youtubeVideoId ?? null,
      publishedAt: s?.publishedAt ?? null,
      formatNoun: null,
      title: null,
      dateLabel: null,
      speaker: null,
      lengthLabel: null,
      summary: null,
      scriptureRefs: [],
      chapters: [],
      pendingSegmentation: false,
    }
  }
  const primary = primarySegment(s)
  const chapters = s.segments.map((seg) => {
    const songs =
      seg.type === 'worship'
        ? s.songs
            .filter((sg) => {
              const mid = (sg.startSec + sg.endSec) / 2
              return mid >= seg.startSec && mid < seg.endSec
            })
            .map((sg) => ({ title: sg.title, leader: sg.leader }))
        : []
    return {
      time: mmss(seg.startSec),
      startSec: Math.floor(seg.startSec),
      title: seg.title,
      kind: SEGMENT_LABEL[seg.type] ?? seg.type,
      isMessage: !!primary && Math.floor(seg.startSec) === Math.floor(primary.startSec),
      note: seg.summary || null,
      songs,
    }
  })
  const scriptureRefs = Array.from(
    new Set(s.segments.flatMap((x) => x.scriptureRefs).filter(Boolean)),
  ).slice(0, 6)
  return {
    mode: 'library',
    slug: s.slug,
    videoId: s.youtubeVideoId,
    publishedAt: s.publishedAt,
    formatNoun: formatNoun(s.format),
    title: cleanServiceTitle(s.title),
    dateLabel: longDate(s.publishedAt),
    speaker: speakerLine(s.speakers),
    lengthLabel: lengthLabel(s.durationSec),
    summary: s.summary,
    scriptureRefs,
    chapters,
    pendingSegmentation: pendingSegmentation(s.publishedAt, new Date()),
  }
}

// A representative chaptered service for previewing the library-mode plate
// (?watchdemo=1) when the CRM feed is empty — e.g. on a fresh preview deploy.
// Not used in normal rendering; purely a design-review aid.
const DEMO_SERMON: PublishedSermon = {
  slug: 'faith-comes-by-hearing',
  youtubeVideoId: 'dQw4w9WgXcQ',
  title: 'Faith comes by hearing',
  format: 'sermon',
  speakers: ['Pastor John'],
  topics: ['Faith'],
  publishedAt: '2026-06-21T16:00:00Z',
  thumbnailUrl: null,
  durationSec: 48 * 60,
  summary:
    'Where real faith actually comes from, worked through Romans 10, and what it means to keep listening for it.',
  seo: null,
  segments: [
    { startSec: 0, endSec: 200, type: 'welcome', title: 'Welcome', summary: '', scriptureRefs: [] },
    { startSec: 200, endSec: 725, type: 'worship', title: 'Worship', summary: '', scriptureRefs: [] },
    { startSec: 725, endSec: 880, type: 'scripture', title: 'Scripture reading', summary: '', scriptureRefs: ['Romans 10'] },
    { startSec: 880, endSec: 2350, type: 'sermon', title: 'The Message', summary: 'Faith comes by hearing', scriptureRefs: ['Romans 10:14-17'] },
    { startSec: 2350, endSec: 2670, type: 'prayer', title: 'Prayer & response', summary: '', scriptureRefs: [] },
    { startSec: 2670, endSec: 2880, type: 'worship', title: 'Closing song', summary: '', scriptureRefs: [] },
  ],
  songs: [
    { title: 'Goodness of God', leader: 'Anna', kind: 'worship', topic: null, startSec: 230, endSec: 480 },
    { title: 'King of Kings', leader: null, kind: 'worship', topic: null, startSec: 480, endSec: 720 },
    { title: 'Doxology', leader: null, kind: 'worship', topic: null, startSec: 2690, endSec: 2870 },
  ],
  transcript: null,
}

export function registerHomeRoute(app: Hono) {
  app.get('/', async (c) => {
    // The home "latest service" plate renders server-side from the published
    // sermon feed (chapters + songs), degrading to the live video when nothing
    // is chaptered yet. Degrade-to-empty on any feed error, exactly like /watch.
    const demo = c.req.query('watchdemo') === '1'
    const all = demo
      ? [DEMO_SERMON]
      : await fetchAllPublishedSermons().catch(() => [] as PublishedSermon[])
    const watch = buildHomeWatch(all)

    // Split browser vs edge so new content (the calendar feed) is never served
    // 24h-stale from the browser cache: the browser revalidates every load
    // (max-age=0), while the edge holds a 5-min cache + short SWR so origin load
    // stays near-zero. The dynamic bit (events) lives behind its own in-memory
    // cache, so the page is never more than a few minutes stale.
    c.header('Cache-Control', 'public, max-age=0, must-revalidate')
    c.header('CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return c.html(`<!DOCTYPE html>
<html lang="en">
${homeHead()}
${homeBody(watch)}
${homeScripts()}
${watchHandoffScript()}
</html>`)
  })
}
