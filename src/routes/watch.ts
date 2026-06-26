import { type Hono } from 'hono'
import { pageHead } from '../templates/shared/page-head.js'
import { watchBody, type WatchHubView } from '../templates/watch-body.js'
import { watchItemBody } from '../templates/watch-item-body.js'
import { watchTopicBody } from '../templates/watch-topic-body.js'
import {
  fetchAllPublishedSermons,
  fetchSermonBySlug,
  tallyTopics,
  topicSlug,
  itemTopic,
  type PublishedSermon,
} from '../sermons-feed.js'
import {
  longDate,
  lengthLabel,
  speakerLine,
  formatNoun,
  posterFor,
} from '../templates/watch-shared.js'
import { fetchRecentVideos } from './youtube.js'
import { YOUTUBE_CONFIG } from '../config.js'

// /watch — the on-site service library. See watch-body.ts for the hub,
// watch-item-body.ts for the per-service permalink (custom segment player), and
// watch-topic-body.ts for topic pages. The library fills itself the moment the
// CRM publishes a chaptered service; until then the page runs in fallback mode
// off the live YouTube latest video + the evergreen order of service.

const PLAYLIST_URL = `https://www.youtube.com/playlist?list=${YOUTUBE_CONFIG.PLAYLIST_ID}`

const EVERGREEN_BLURB =
  'Every Sunday we open the Bible and work through it together, sometimes as a sermon, sometimes as a discussion-style lesson, and always grounded in the text. About half an hour, no jargon, nothing you need to bring.'

function unionRefs(sermon: PublishedSermon, limit = 6): string[] {
  return Array.from(
    new Set(sermon.segments.flatMap((s) => s.scriptureRefs).filter(Boolean)),
  ).slice(0, limit)
}

function featureMetaLine(sermon: PublishedSermon): string | null {
  const speaker = speakerLine(sermon.speakers)
  const bits = [
    longDate(sermon.publishedAt),
    speaker ? `with ${speaker}` : null,
    lengthLabel(sermon.durationSec),
  ].filter(Boolean)
  return bits.length > 0 ? bits.join(' · ') : null
}

/** Compose the hub view: library when anything is published, else fallback. */
function buildHubView(
  all: PublishedSermon[],
  latest: { videoId: string; title: string; publishedAt: string | null; thumbnailUrl: string },
): WatchHubView {
  const newest = all[0] ?? null

  if (newest) {
    return {
      mode: 'library',
      feature: {
        videoId: newest.youtubeVideoId,
        posterUrl: posterFor(newest.youtubeVideoId, newest.thumbnailUrl),
        title: newest.title,
        dateLabel: longDate(newest.publishedAt),
        metaLine: featureMetaLine(newest),
        summary: newest.summary ?? EVERGREEN_BLURB,
        scriptureRefs: unionRefs(newest),
        href: `/watch/${newest.slug}`,
      },
      items: all,
      ytWatchUrl: `https://www.youtube.com/watch?v=${newest.youtubeVideoId}`,
      playlistUrl: PLAYLIST_URL,
    }
  }

  return {
    mode: 'fallback',
    feature: {
      videoId: latest.videoId,
      posterUrl: posterFor(latest.videoId, latest.thumbnailUrl),
      title: latest.title,
      dateLabel: longDate(latest.publishedAt),
      metaLine: longDate(latest.publishedAt),
      summary: EVERGREEN_BLURB,
      scriptureRefs: [],
      href: null,
    },
    items: [],
    ytWatchUrl: `https://www.youtube.com/watch?v=${latest.videoId}`,
    playlistUrl: PLAYLIST_URL,
  }
}

function isoDuration(sec: number | null): string | undefined {
  if (!sec || sec <= 0) return undefined
  const s = Math.floor(sec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  return `PT${h > 0 ? h + 'H' : ''}${m > 0 ? m + 'M' : ''}${ss > 0 ? ss + 'S' : '0S'}`
}

const WATCH_FAQ = [
  {
    '@type': 'Question',
    name: 'Can I watch the Morning Star Christian Church service online?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes. Every Sunday service streams free on this Watch page, with no account or sign-up needed. You can watch the full message any time, on phone, tablet, or computer, and catch up on a Sunday you missed in Boise.',
    },
  },
  {
    '@type': 'Question',
    name: 'Where can I find past sermons from Morning Star?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'The Watch page is a full library of past services, sorted into sermons and discussions and searchable by topic. Each one plays right on the site, so you can revisit a message, share it, or work through a theme at your own pace.',
    },
  },
  {
    '@type': 'Question',
    name: 'What is the difference between a sermon and a discussion?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Most Sundays are a sermon, a single teacher working through a passage. Some weeks are a discussion, two hosts talking through the text together with the occasional question from the room. Both are grounded in the Bible and run about half an hour.',
    },
  },
  {
    '@type': 'Question',
    name: 'What does a Sunday service at Morning Star include?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'A Sunday follows the same simple order: a welcome, two live worship songs, a scripture reading, the message (a sermon or discussion of about half an hour), a response and prayer, a closing song, and free breakfast afterward for everyone.',
    },
  },
  {
    '@type': 'Question',
    name: 'Can I jump to part of a service?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes. Open any service and the player starts on the message itself, not the whole hour. A chapter list lets you jump straight to worship, the scripture, or the prayer, and a single tap opens the full service when you want everything.',
    },
  },
]

function buildHubJsonLd(view: WatchHubView, all: PublishedSermon[]): string {
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'CollectionPage',
      '@id': 'https://ms.church/watch#page',
      url: 'https://ms.church/watch',
      name: 'Watch Sermons & Discussions Online · Morning Star Christian Church',
      description:
        'Watch every Sunday service from Morning Star Christian Church in Boise online, free. A full library of sermons and discussions, searchable by topic, each playing right on the site.',
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
    { '@type': 'FAQPage', '@id': 'https://ms.church/watch#faq', mainEntity: WATCH_FAQ },
  ]

  if (all.length > 0) {
    graph.push({
      '@type': 'ItemList',
      '@id': 'https://ms.church/watch#library',
      name: 'Sermons and discussions',
      numberOfItems: all.length,
      // List the whole library (the feed is already capped server-side); a
      // hard 50 here under-reported the catalog to search engines.
      itemListElement: all.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://ms.church/watch/${s.slug}`,
        name: s.title,
      })),
    })
  } else if (view.feature.dateLabel) {
    // Fallback mode: a real VideoObject for the live latest video.
    graph.push({
      '@type': 'VideoObject',
      name: view.feature.title,
      description: view.feature.summary,
      thumbnailUrl: [view.feature.posterUrl],
      embedUrl: `https://www.youtube.com/embed/${view.feature.videoId}`,
      contentUrl: view.ytWatchUrl,
      publisher: { '@id': 'https://ms.church/#church' },
      isFamilyFriendly: true,
    })
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
}

function buildItemJsonLd(sermon: PublishedSermon): string {
  const url = `https://ms.church/watch/${sermon.slug}`
  const poster = posterFor(sermon.youtubeVideoId, sermon.thumbnailUrl)
  const noun = formatNoun(sermon.format)
  const duration = isoDuration(sermon.durationSec)

  const video: Record<string, unknown> = {
    '@type': 'VideoObject',
    '@id': `${url}#video`,
    name: sermon.title,
    description: sermon.summary ?? sermon.seo?.description ?? `${noun} from Morning Star Christian Church in Boise, Idaho.`,
    thumbnailUrl: [poster],
    embedUrl: `https://www.youtube.com/embed/${sermon.youtubeVideoId}`,
    contentUrl: `https://www.youtube.com/watch?v=${sermon.youtubeVideoId}`,
    publisher: { '@id': 'https://ms.church/#church' },
    inLanguage: 'en-US',
    isFamilyFriendly: true,
    ...(sermon.publishedAt ? { uploadDate: sermon.publishedAt } : {}),
    ...(duration ? { duration } : {}),
    ...(sermon.transcript ? { transcript: sermon.transcript } : {}),
  }
  if (sermon.segments.length > 0) {
    // Key moments = the chapters (one Clip each, gap-free, non-overlapping — what
    // Google's key-moments feature wants). Fold each worship chapter's songs into
    // its label so song titles surface in video search without adding overlapping
    // clips that would void the key moments. The visible chapter list is untouched.
    video.hasPart = sermon.segments.map((seg) => {
      let name = seg.title
      if (seg.type === 'worship' && sermon.songs.length > 0) {
        const titles = sermon.songs
          .filter((sg) => {
            const mid = (sg.startSec + sg.endSec) / 2
            return mid >= seg.startSec && mid < seg.endSec
          })
          .map((sg) => sg.title.trim())
          .filter(Boolean)
        if (titles.length > 0) name = `${seg.title}: ${titles.join(', ')}`
      }
      return {
        '@type': 'Clip',
        name,
        startOffset: Math.floor(seg.startSec),
        endOffset: Math.floor(seg.endSec),
        url: `${url}?t=${Math.floor(seg.startSec)}`,
      }
    })
  }

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebPage',
      '@id': `${url}#page`,
      url,
      name: `${sermon.title} · Morning Star Christian Church`,
      description: sermon.seo?.description ?? sermon.summary ?? undefined,
      isPartOf: { '@id': 'https://ms.church/#website' },
      about: { '@id': 'https://ms.church/#church' },
      inLanguage: 'en-US',
      primaryImageOfPage: poster,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ms.church/' },
        { '@type': 'ListItem', position: 2, name: 'Watch', item: 'https://ms.church/watch' },
        { '@type': 'ListItem', position: 3, name: sermon.title, item: url },
      ],
    },
    video,
  ]
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
}

function buildTopicJsonLd(topic: string, slug: string, sermons: PublishedSermon[]): string {
  const url = `https://ms.church/watch/topic/${slug}`
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'CollectionPage',
      '@id': `${url}#page`,
      url,
      name: `${topic} · Sermons & discussions · Morning Star Christian Church`,
      description: `Sermons and discussions on ${topic.toLowerCase()} from Morning Star Christian Church in Boise, Idaho. Watch each one free on the site.`,
      isPartOf: { '@id': 'https://ms.church/#website' },
      about: { '@id': 'https://ms.church/#church' },
      inLanguage: 'en-US',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ms.church/' },
        { '@type': 'ListItem', position: 2, name: 'Watch', item: 'https://ms.church/watch' },
        { '@type': 'ListItem', position: 3, name: topic, item: url },
      ],
    },
    {
      '@type': 'ItemList',
      numberOfItems: sermons.length,
      itemListElement: sermons.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://ms.church/watch/${s.slug}`,
        name: s.title,
      })),
    },
  ]
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
}

export function registerWatchRoute(app: Hono) {
  // Hub
  app.get('/watch', async (c) => {
    const [all, videos] = await Promise.all([
      fetchAllPublishedSermons().catch(() => [] as PublishedSermon[]),
      fetchRecentVideos(1).catch(() => []),
    ])
    const latest =
      videos[0] ?? {
        videoId: YOUTUBE_CONFIG.FALLBACK_VIDEO_ID,
        title: 'Sunday Service',
        publishedAt: null,
        thumbnailUrl: `https://img.youtube.com/vi/${YOUTUBE_CONFIG.FALLBACK_VIDEO_ID}/maxresdefault.jpg`,
      }
    const view = buildHubView(all, latest)

    // Browser revalidates every load (max-age=0) so a freshly published service
    // shows on the next refresh instead of a 24h-stale copy needing a hard reload;
    // the edge keeps a short cache + SWR so origin load stays near-zero.
    c.header('Cache-Control', 'public, max-age=0, must-revalidate')
    c.header('CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return c.html(`<!DOCTYPE html>
<html lang="en">
${pageHead({
  title: 'Watch Sermons & Discussions Online · Morning Star Christian Church, Boise',
  description:
    'Watch every Sunday service from Morning Star Christian Church in Boise online, free. A library of sermons and discussions, searchable by topic, each playing right on the site.',
  canonical: 'https://ms.church/watch',
  ogImageAlt: 'Watch Sunday services from Morning Star Christian Church in Boise, Idaho',
  jsonLd: buildHubJsonLd(view, all),
})}
${watchBody(view)}
</html>`)
  })

  // Topic page
  app.get('/watch/topic/:slug', async (c) => {
    const slug = c.req.param('slug')
    const all = await fetchAllPublishedSermons().catch(() => [] as PublishedSermon[])
    // One tag per item: a topic page lists every message AND song tagged with it.
    const matches = all.filter((s) => {
      const t = itemTopic(s)
      return t ? topicSlug(t) === slug : false
    })
    // Songs on this topic, de-duped by title (newest occurrence + count).
    const songByTitle = new Map<string, { sermon: PublishedSermon; song: PublishedSermon['songs'][number]; count: number }>()
    for (const s of all) {
      for (const song of s.songs) {
        if (!song.topic || topicSlug(song.topic) !== slug) continue
        const k = song.title.trim().toLowerCase()
        const ex = songByTitle.get(k)
        if (ex) ex.count++
        else songByTitle.set(k, { sermon: s, song, count: 1 })
      }
    }
    const songMatches = [...songByTitle.values()]
    if (matches.length === 0 && songMatches.length === 0) return c.notFound()
    const label =
      (matches.map((s) => itemTopic(s)).find((t) => t && topicSlug(t) === slug) ||
        songMatches.map((x) => x.song.topic).find((t) => t && topicSlug(t) === slug)) ??
      slug

    // Browser revalidates every load (max-age=0) so a freshly published service
    // shows on the next refresh instead of a 24h-stale copy needing a hard reload;
    // the edge keeps a short cache + SWR so origin load stays near-zero.
    c.header('Cache-Control', 'public, max-age=0, must-revalidate')
    c.header('CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return c.html(`<!DOCTYPE html>
<html lang="en">
${pageHead({
  title: `${label} · Watch · Morning Star Christian Church, Boise`,
  description: `Sermons, discussions, and worship songs on ${label.toLowerCase()} from Morning Star Christian Church in Boise. Watch each one free, right on the site.`,
  canonical: `https://ms.church/watch/topic/${slug}`,
  ogImageAlt: `Sermons on ${label} from Morning Star Christian Church in Boise, Idaho`,
  jsonLd: buildTopicJsonLd(label, slug, matches),
})}
${watchTopicBody(label, matches, songMatches)}
</html>`)
  })

  // Per-service permalink
  app.get('/watch/:slug', async (c) => {
    const slug = c.req.param('slug')
    const sermon = await fetchSermonBySlug(slug)
    if (!sermon) return c.notFound()

    // "More to watch": a few recent items in the same format, excluding self.
    const all = await fetchAllPublishedSermons().catch(() => [] as PublishedSermon[])
    const related = all
      .filter((s) => s.slug !== sermon.slug && s.format === sermon.format)
      .slice(0, 3)

    const noun = formatNoun(sermon.format)
    const speaker = speakerLine(sermon.speakers)
    const desc =
      sermon.seo?.description ??
      sermon.summary ??
      `Watch this ${noun.toLowerCase()}${speaker ? ` with ${speaker}` : ''} from Morning Star Christian Church in Boise, Idaho.`
    const chapterNote =
      sermon.segments.length > 0 ? ` ${sermon.segments.length} chapters; jump to any moment.` : ''

    // Browser revalidates every load (max-age=0) so a freshly published service
    // shows on the next refresh instead of a 24h-stale copy needing a hard reload;
    // the edge keeps a short cache + SWR so origin load stays near-zero.
    c.header('Cache-Control', 'public, max-age=0, must-revalidate')
    c.header('CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return c.html(`<!DOCTYPE html>
<html lang="en">
${pageHead({
  title: `${sermon.title} · ${noun} · Morning Star Christian Church`,
  description: `${desc}${chapterNote}`.slice(0, 300),
  canonical: `https://ms.church/watch/${sermon.slug}`,
  ogImage: posterFor(sermon.youtubeVideoId, sermon.thumbnailUrl),
  ogImageAlt: `${sermon.title} — ${noun.toLowerCase()} from Morning Star Christian Church in Boise, Idaho`,
  jsonLd: buildItemJsonLd(sermon),
})}
${watchItemBody(sermon, related)}
</html>`)
  })
}
