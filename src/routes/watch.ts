import { type Hono } from 'hono'
import { pageHead } from '../templates/shared/page-head.js'
import { watchBody, type WatchView, type WatchProgramItem } from '../templates/watch-body.js'
import { fetchPublishedSermons, type PublishedSermon } from '../sermons-feed.js'
import { fetchRecentVideos } from './youtube.js'
import { YOUTUBE_CONFIG } from '../config.js'

// /watch — the on-site sermons hub (sermon video + order of service + a
// take-it-into-the-week discussion guide). Replaces the home Watch section's
// old off-site jump to the YouTube playlist.
//
// The page is server-rendered from a WatchView composed here, sourced in order:
//   1. the CRM published-sermons feed (real, chaptered service) — when set up;
//   2. the live YouTube latest video + the evergreen order-of-service;
//   3. the hardcoded fallback video.
// So it fills with real chaptered content the moment a sermon is published from
// the system, with zero code change. See sermons-feed.ts + watch-body.ts.

const PLAYLIST_URL = `https://www.youtube.com/playlist?list=${YOUTUBE_CONFIG.PLAYLIST_ID}`

const EVERGREEN_BLURB =
  'Every Sunday we open the Bible and work through it together, sometimes as a sermon, sometimes as a discussion-style lesson, and always grounded in the text. About half an hour, no jargon, nothing you need to bring.'

// The true shape of a Sunday morning, used until a chaptered service is
// published from the CRM. Worship-centric; the full first-timer walkthrough
// lives on /visit (linked from the page), not duplicated here.
const EVERGREEN_PROGRAM: WatchProgramItem[] = [
  { title: 'Welcome', note: 'A brief hello from the front and a moment to settle in.' },
  { title: 'Opening worship', note: 'Two songs, led live. Lyrics on the screen, sing or just listen.' },
  { title: 'Scripture', note: 'The morning’s passage, read aloud before we open it.' },
  { title: 'The message', note: 'A sermon or a discussion-style lesson, grounded in the text, about half an hour.' },
  { title: 'Response and prayer', note: 'A few quiet minutes to respond, with prayer for anyone who wants it.' },
  { title: 'A closing song', note: 'One more, to send us out.' },
  { title: 'Breakfast', note: 'Free breakfast for everyone afterward. No rush to leave.' },
]

// Friendly chapter-type labels — mirrors the CRM segmenter's vocabulary.
const SEGMENT_LABEL: Record<string, string> = {
  welcome: 'Welcome',
  worship: 'Worship',
  scripture: 'Scripture',
  prayer: 'Prayer',
  sermon: 'Sermon',
  poem: 'Poem',
  testimony: 'Testimony',
  offering: 'Offering',
  announcement: 'Announcement',
  benediction: 'Benediction',
  other: 'Other',
}

function mmss(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

function longDate(iso: string | null): string | null {
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

function posterFor(videoId: string, thumb: string | null): string {
  return thumb || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

/** Compose the view from a published CRM sermon when present, else the latest
 *  YouTube video + the evergreen order of service. */
function buildView(
  sermon: PublishedSermon | null,
  latest: { videoId: string; title: string; publishedAt: string | null; thumbnailUrl: string },
): WatchView {
  if (sermon && sermon.segments.length > 0) {
    const videoId = sermon.youtubeVideoId
    const program: WatchProgramItem[] = sermon.segments.map((seg) => {
      const label = SEGMENT_LABEL[seg.type]
      const title =
        label && !seg.title.toLowerCase().startsWith(label.toLowerCase())
          ? `${label}: ${seg.title}`
          : seg.title
      return {
        title,
        note: seg.summary,
        time: mmss(seg.startSec),
        href: `https://youtu.be/${videoId}?t=${Math.max(0, Math.floor(seg.startSec))}`,
      }
    })
    const refs = Array.from(
      new Set(sermon.segments.flatMap((s) => s.scriptureRefs).filter(Boolean)),
    ).slice(0, 6)
    return {
      videoId,
      posterUrl: posterFor(videoId, sermon.thumbnailUrl),
      title: sermon.title,
      dateLabel: longDate(sermon.publishedAt),
      summary: sermon.summary ?? EVERGREEN_BLURB,
      scriptureRefs: refs,
      program,
      programLive: true,
      ytWatchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      playlistUrl: PLAYLIST_URL,
    }
  }

  return {
    videoId: latest.videoId,
    posterUrl: posterFor(latest.videoId, latest.thumbnailUrl),
    title: latest.title,
    dateLabel: longDate(latest.publishedAt),
    summary: EVERGREEN_BLURB,
    scriptureRefs: [],
    program: EVERGREEN_PROGRAM,
    programLive: false,
    ytWatchUrl: `https://www.youtube.com/watch?v=${latest.videoId}`,
    playlistUrl: PLAYLIST_URL,
  }
}

function buildJsonLd(view: WatchView, sermon: PublishedSermon | null): string {
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebPage',
      '@id': 'https://ms.church/watch#page',
      url: 'https://ms.church/watch',
      name: 'Watch Sermons Online · Morning Star Christian Church',
      description:
        'Watch the latest Sunday service from Morning Star Christian Church in Boise online, see the order of the morning, and use a free discussion guide to take the message into your week.',
      isPartOf: { '@id': 'https://ms.church/#website' },
      about: { '@id': 'https://ms.church/#church' },
      inLanguage: 'en-US',
      mainEntityOfPage: { '@id': 'https://ms.church/#church' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ms.church/' },
        { '@type': 'ListItem', position: 2, name: 'Watch', item: 'https://ms.church/watch' },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://ms.church/watch#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Can I watch the Morning Star Christian Church service online?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The most recent Sunday service streams free on this Watch page and on our YouTube channel, with no account or sign-up needed. You can watch the full message any time, on phone, tablet, or computer, and catch up on a Sunday you missed in Boise.',
          },
        },
        {
          '@type': 'Question',
          name: 'Where can I find past sermons from Morning Star?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Every past service is archived on our YouTube playlist, linked from this Watch page. Each Sunday at Morning Star Christian Church is recorded and added there, so you can revisit a message, share it with a friend, or work through a series at your own pace.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does Morning Star livestream the Sunday service?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The 9 AM Sunday service is streamed live on our YouTube channel, and a countdown to the next service is on the home page. If you cannot make it in person to Boise, you can join the worship and teaching live, then watch the replay here any time afterward.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does a Sunday service at Morning Star include?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A Sunday morning follows the same simple order: a welcome, two live worship songs, a scripture reading, the message (a sermon or discussion-style lesson of about half an hour), a response and prayer, a closing song, and free breakfast afterward for everyone.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is there a sermon discussion or study guide?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. This Watch page includes a short set of reflection questions to use after the message, on your own, around the dinner table, or with a small group. They are written to work with any week, and you can go deeper by joining one of our Bible studies.',
          },
        },
      ],
    },
  ]

  // Real VideoObject only when we have a genuine upload date (a published CRM
  // sermon, or the dated YouTube feed entry) — never a fabricated date.
  if (view.dateLabel) {
    const iso = sermon?.publishedAt ?? null
    const uploadDate = iso ?? undefined
    graph.push({
      '@type': 'VideoObject',
      name: view.title,
      description: view.summary,
      thumbnailUrl: [view.posterUrl],
      ...(uploadDate ? { uploadDate } : {}),
      embedUrl: `https://www.youtube.com/embed/${view.videoId}`,
      contentUrl: view.ytWatchUrl,
      ...(sermon?.durationSec
        ? { duration: `PT${Math.max(1, Math.round(sermon.durationSec / 60))}M` }
        : {}),
      publisher: { '@id': 'https://ms.church/#church' },
      isFamilyFriendly: true,
    })
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
}

export function registerWatchRoute(app: Hono) {
  app.get('/watch', async (c) => {
    // Source the featured sermon: CRM published feed first, then the live
    // YouTube latest (both cached + graceful). fetchRecentVideos always returns
    // at least the fallback video, so `latest` is never empty.
    const [sermons, videos] = await Promise.all([
      fetchPublishedSermons(1).catch(() => []),
      fetchRecentVideos(1).catch(() => []),
    ])
    const sermon = sermons[0] ?? null
    const latest =
      videos[0] ?? {
        videoId: YOUTUBE_CONFIG.FALLBACK_VIDEO_ID,
        title: 'Sunday Service',
        publishedAt: null,
        thumbnailUrl: `https://img.youtube.com/vi/${YOUTUBE_CONFIG.FALLBACK_VIDEO_ID}/maxresdefault.jpg`,
      }

    const view = buildView(sermon, latest)

    c.header('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400')
    return c.html(`<!DOCTYPE html>
<html lang="en">
${pageHead({
  title: 'Watch Sermons Online · Morning Star Christian Church, Boise',
  description:
    'Watch the latest Sunday service from Morning Star Christian Church in Boise online, see the order of the morning, and use a free discussion guide to carry the message into your week.',
  canonical: 'https://ms.church/watch',
  ogImageAlt: 'Watch Sunday services from Morning Star Christian Church in Boise, Idaho',
  jsonLd: buildJsonLd(view, sermon),
})}
${watchBody(view)}
</html>`)
  })
}
