import { type Hono } from 'hono'
import { YOUTUBE_CONFIG } from '../config.js'

export type Video = {
  videoId: string
  title: string
  publishedAt: string | null
  thumbnailUrl: string
}

let _cache: { videos: Video[]; ts: number } | null = null

function makeVideo(videoId: string, title: string, publishedAt: string | null): Video {
  return {
    videoId,
    title,
    publishedAt,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  }
}

function parseEntries(xml: string, limit: number): Video[] {
  const videos: Video[] = []
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  let m: RegExpExecArray | null
  while ((m = entryRegex.exec(xml)) !== null && videos.length < limit) {
    const block = m[1]
    const idMatch = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
    if (!idMatch) continue
    const titleMatch = block.match(/<title>([^<]+)<\/title>/)
    const publishedMatch = block.match(/<published>([^<]+)<\/published>/)
    videos.push(makeVideo(
      idMatch[1],
      titleMatch ? titleMatch[1] : 'Sunday Service',
      publishedMatch ? publishedMatch[1] : null,
    ))
  }
  return videos
}

/**
 * Recent videos off the church playlist's public RSS feed (no API key), newest
 * first, with a 5-minute in-memory cache shared across callers. Returns the
 * stale cache on a feed error, and the hardcoded fallback video as a last
 * resort, so callers always get at least one video. Used by both the JSON API
 * endpoint below and the server-rendered /watch page.
 */
export async function fetchRecentVideos(limit = 3): Promise<Video[]> {
  const now = Date.now()
  if (_cache && now - _cache.ts < YOUTUBE_CONFIG.CACHE_TTL) {
    return _cache.videos.slice(0, limit)
  }

  const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${YOUTUBE_CONFIG.PLAYLIST_ID}`
  try {
    const response = await fetch(feedUrl, { signal: AbortSignal.timeout(4000) })
    if (response.ok) {
      const videos = parseEntries(await response.text(), 6)
      if (videos.length > 0) {
        _cache = { videos, ts: now }
        return videos.slice(0, limit)
      }
    }
  } catch (feedErr) {
    console.error('YouTube RSS feed fetch failed:', feedErr)
  }

  if (_cache) return _cache.videos.slice(0, limit)
  return [makeVideo(YOUTUBE_CONFIG.FALLBACK_VIDEO_ID, 'Sunday Service', null)]
}

export function registerYouTubeRoute(app: Hono) {
  app.get('/api/youtube/latest-video', async (c) => {
    try {
      const videos = await fetchRecentVideos(3)
      const fromCache = _cache && Date.now() - _cache.ts < YOUTUBE_CONFIG.CACHE_TTL
      c.header('X-Cache', fromCache ? 'HIT' : 'MISS')
      c.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
      return c.json({ success: true as const, videos })
    } catch (error) {
      console.error('YouTube endpoint error:', error)
      return c.json({
        success: true as const,
        videos: [makeVideo(YOUTUBE_CONFIG.FALLBACK_VIDEO_ID, 'Sunday Service', null)],
      })
    }
  })
}
