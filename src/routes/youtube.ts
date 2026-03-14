import { type Hono } from 'hono'
import { YOUTUBE_CONFIG } from '../config.js'

// In-memory cache (same pattern as calendar.ts)
let _cache: { data: unknown; ts: number } | null = null

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
      const response = await fetch(feedUrl)

      if (!response.ok) {
        console.error('YouTube RSS feed error:', response.status)
        return c.json(
          { success: false, error: `YouTube RSS feed error: HTTP ${response.status}`, videoId: null },
          response.status as 400 | 404 | 500
        )
      }

      const xml = await response.text()

      // Extract first video ID from <yt:videoId> tag
      const videoIdMatch = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
      if (!videoIdMatch) {
        return c.json(
          { success: false, error: 'No videos found in playlist feed', videoId: null },
          404
        )
      }

      const videoId = videoIdMatch[1]

      // Extract title from the first <entry> block
      const entryMatch = xml.match(/<entry>[\s\S]*?<title>([^<]+)<\/title>/)
      const title = entryMatch ? entryMatch[1] : 'Sunday Service'

      const result = {
        success: true,
        videoId,
        title,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      }

      _cache = { data: result, ts: now }
      c.header('X-Cache', 'MISS')
      c.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
      return c.json(result)
    } catch (error) {
      console.error('YouTube feed error:', error)
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          videoId: null,
        },
        500
      )
    }
  })
}
