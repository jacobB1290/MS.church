// Version: 1.50.1 - All three watch cards play in-page via a centered video player overlay with a FLIP morph animation (desktop only). Click any thumbnail and the source card fades while a centered video frame translates+scales out of that card's bounding rect to a 1100px-wide / 88vw-capped target rect (cubic-bezier(0.32, 0.72, 0, 1), 0.6s). After ~350ms (mid-morph) the YouTube iframe is injected with autoplay so the visual cue and the playback land together. Close via the floating X (positioned above the frame), Esc, or backdrop click — the frame reverse-morphs back to the source rect, the source card fades back in, then the overlay unmounts. Body scroll is locked while the overlay is active. The backdrop uses rgba(12,12,22,0.82) with backdrop-filter blur(14px) saturate(120%) so the page reads as a film-quality dim. Cards 2 and 3 remain real <a href="..."> elements so right-click / new-tab still works; the click handler preventDefault's only on desktop (>960px). The legacy 9am-MT service-time inline auto-play path is preserved untouched — that case still loads the iframe directly into the latest card with the existing morph-to-spinner / postMessage reveal flow, so the live stream "just appears" during the service window. Mobile (≤960px) is unchanged (overlay is desktop-only; .video-card-recent siblings stay display:none). Self-contained to the watch section markup, styles, scripts, and the YouTube route. CLAUDE.md gains a "Speed is a first-class harness goal" subsection codifying parallelize-by-default / cheapest-wait / no-padding-sleeps for all tests.
// Vercel entry point (used via api/index.ts).
// Only difference from src/index.tsx (Cloudflare): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.tsx,
// keeping the hono/cloudflare-workers import intact in that file.

import { serveStatic } from '@hono/node-server/serve-static'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
