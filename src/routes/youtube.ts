import { type Hono } from 'hono'
import { YOUTUBE_CONFIG } from '../config.js'

type Video = {
  videoId: string
  title: string
  publishedAt: string | null
  thumbnailUrl: string
}

let _cache: { data: { success: true; videos: Video[] }; ts: number } | null = null

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

export function registerYouTubeRoute(app: Hono) {
  app.get('/api/youtube/latest-video', async (c) => {
    try {
      const now = Date.now()

      if (_cache && now - _cache.ts < YOUTUBE_CONFIG.CACHE_TTL) {
        c.header('X-Cache', 'HIT')
        return c.json(_cache.data)
      }

      const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${YOUTUBE_CONFIG.PLAYLIST_ID}`

      let videos: Video[] = []

      try {
        const response = await fetch(feedUrl)
        if (response.ok) {
          const xml = await response.text()
          videos = parseEntries(xml, 3)
        }
      } catch (feedErr) {
        console.error('YouTube RSS feed fetch failed:', feedErr)
      }

      if (videos.length > 0) {
        const payload = { success: true as const, videos }
        _cache = { data: payload, ts: now }
        c.header('X-Cache', 'MISS')
        c.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
        return c.json(payload)
      }

      if (_cache) {
        console.error('YouTube RSS feed failed, serving stale cache')
        c.header('X-Cache', 'STALE')
        return c.json(_cache.data)
      }

      console.error('YouTube RSS feed failed, no cache, using hardcoded fallback')
      const fallback = {
        success: true as const,
        videos: [makeVideo(YOUTUBE_CONFIG.FALLBACK_VIDEO_ID, 'Sunday Service', null)],
      }
      c.header('X-Cache', 'FALLBACK')
      return c.json(fallback)
    } catch (error) {
      console.error('YouTube endpoint error:', error)
      if (_cache) return c.json(_cache.data)
      return c.json({
        success: true as const,
        videos: [makeVideo(YOUTUBE_CONFIG.FALLBACK_VIDEO_ID, 'Sunday Service', null)],
      })
    }
  })
}
