import { type Hono } from 'hono'
import { YOUTUBE_CONFIG } from '../config.js'

// In-memory cache (same pattern as calendar.ts)
let _cache: { data: unknown; ts: number } | null = null

function makeResult(videoId: string, title: string) {
  return {
    success: true,
    videoId,
    title,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  }
}

export function registerYouTubeRoute(app: Hono) {
  app.get('/api/youtube/latest-video', async (c) => {
    try {
      const now = Date.now()

      if (_cache && now - _cache.ts < YOUTUBE_CONFIG.CACHE_TTL) {
        c.header('X-Cache', 'HIT')
        return c.json(_cache.data)
      }

      // Use the public YouTube RSS feed — no API key required
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${YOUTUBE_CONFIG.PLAYLIST_ID}`

      let result = null

      try {
        const response = await fetch(feedUrl)

        if (response.ok) {
          const xml = await response.text()

          // Extract first video ID from <yt:videoId> tag
          const videoIdMatch = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
          if (videoIdMatch) {
            const videoId = videoIdMatch[1]
            const entryMatch = xml.match(/<entry>[\s\S]*?<title>([^<]+)<\/title>/)
            const title = entryMatch ? entryMatch[1] : 'Sunday Service'
            result = makeResult(videoId, title)
          }
        }
      } catch (feedErr) {
        console.error('YouTube RSS feed fetch failed:', feedErr)
      }

      // If RSS worked, cache and return
      if (result) {
        _cache = { data: result, ts: now }
        c.header('X-Cache', 'MISS')
        c.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
        return c.json(result)
      }

      // Serve stale cache if available — better than nothing
      if (_cache) {
        console.error('YouTube RSS feed failed, serving stale cache')
        c.header('X-Cache', 'STALE')
        return c.json(_cache.data)
      }

      // Last resort: hardcoded fallback so the player still works
      console.error('YouTube RSS feed failed, no cache, using hardcoded fallback')
      const fallback = makeResult(YOUTUBE_CONFIG.FALLBACK_VIDEO_ID, 'Sunday Service')
      c.header('X-Cache', 'FALLBACK')
      return c.json(fallback)
    } catch (error) {
      console.error('YouTube endpoint error:', error)

      // Even on unexpected errors, try stale cache or fallback
      if (_cache) {
        return c.json(_cache.data)
      }
      const fallback = makeResult(YOUTUBE_CONFIG.FALLBACK_VIDEO_ID, 'Sunday Service')
      return c.json(fallback)
    }
  })
}
