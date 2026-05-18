// Version: 1.50.0 - Desktop watch section redesigned as a three-card grid of the last three Sunday services. The single oversized hero video that dominated the watch card on desktop is replaced with a 1fr 1fr 1fr grid: the latest service keeps its in-page play behavior (autoplay during the 9am MT service window, postMessage-driven thumbnail reveal) and gets a "Latest Service" pill plus its publication date and title; the previous two services are lightweight thumbnail-and-meta link cards that open the video on YouTube in a new tab, so the desktop card never carries the weight of three live iframes. The backend at /api/youtube/latest-video now parses three <entry> blocks out of the playlist RSS feed and returns { success, videos: [{ videoId, title, publishedAt, thumbnailUrl }] }; the client renders dates in America/Boise so a Sunday-morning service uploaded late-UTC-Sunday still reads "Sun, May 17" rather than the Monday UTC date. Mobile (≤960px) is intentionally untouched — the new .video-card-recent siblings are display:none, and .video-card-meta is hidden so the latest card renders as the original single-video layout with no extra chrome. Self-contained: only the watch section markup, styles, scripts, and the YouTube route changed.
// Vercel entry point (used via api/index.ts).
// Only difference from src/index.tsx (Cloudflare): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.tsx,
// keeping the hono/cloudflare-workers import intact in that file.

import { serveStatic } from '@hono/node-server/serve-static'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
