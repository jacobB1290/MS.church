// Version: 1.49.36 - Instant cross-page navigation via Speculation Rules + hover/touchstart prefetch fallback. New shared module src/templates/shared/prefetch.ts emits a <script type="speculationrules"> block that prerenders same-origin internal links at "moderate" eagerness (Chrome/Edge prerender on hover or touch, so the click activates an already-rendered page in ~0ms), plus a vanilla hover/touchstart prefetch script gated behind HTMLScriptElement.supports('speculationrules') so Safari and Firefox fall back to <link rel="prefetch"> injection on first hover/touch over any internal anchor. Excludes /api/*, target=_blank, rel=external, and same-page hash links to avoid wasted bandwidth. The snippet is included in BOTH home-head.ts and shared/page-head.ts so every page benefits in both directions. Home also gets an eager static <link rel="prefetch" href="/visit"> since /visit is the hero CTA and the single highest-confidence next page. Cache-Control on /about, /beliefs, /visit bumped from s-maxage=60/swr=300 to s-maxage=600/swr=86400 so the Cloudflare edge serves stale instantly while revalidating in the background — those pages are essentially static and benefit hugely from longer caching. /outreach kept at 60s because its calendar events change. No layout, copy, or design changes.
// Vercel entry point (used via api/index.ts).
// Only difference from src/index.tsx (Cloudflare): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.tsx,
// keeping the hono/cloudflare-workers import intact in that file.

import { serveStatic } from '@hono/node-server/serve-static'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
