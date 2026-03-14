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

      const apiUrl = new URL(
        'https://www.googleapis.com/youtube/v3/playlistItems'
      )
      apiUrl.searchParams.set('part', 'snippet')
      apiUrl.searchParams.set('playlistId', YOUTUBE_CONFIG.PLAYLIST_ID)
      apiUrl.searchParams.set('maxResults', '1')
      apiUrl.searchParams.set('key', YOUTUBE_CONFIG.API_KEY)

      const response = await fetch(apiUrl.toString(), {
        headers: { Referer: 'https://ms.church/' },
      })

      if (!response.ok) {
        const body = await response.text().catch(() => '')
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorData = JSON.parse(body) as { error?: { message?: string } }
          errorMessage = errorData.error?.message ?? errorMessage
        } catch {
          // Google sometimes returns HTML error pages
        }
        console.error('YouTube API error:', response.status, errorMessage)
        return c.json(
          { success: false, error: `YouTube API error: ${errorMessage}`, videoId: null },
          response.status as 400 | 401 | 403 | 404 | 500
        )
      }

      const data = (await response.json()) as {
        items?: Array<{
          snippet?: {
            title?: string
            resourceId?: { videoId?: string }
          }
        }>
      }

      const firstItem = data.items?.[0]
      const videoId = firstItem?.snippet?.resourceId?.videoId

      if (!videoId) {
        return c.json(
          { success: false, error: 'No videos found in playlist', videoId: null },
          404
        )
      }

      const result = {
        success: true,
        videoId,
        title: firstItem?.snippet?.title ?? 'Sunday Service',
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      }

      _cache = { data: result, ts: now }
      c.header('X-Cache', 'MISS')
      c.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
      return c.json(result)
    } catch (error) {
      console.error('YouTube API error:', error)
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
