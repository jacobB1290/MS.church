// Version: 1.49.4 - Drop smooth-scroll on hashload entirely. Now: paint main invisible + translateY(16px) before first paint, wait for window.load + fonts.ready + rIC for layout to settle, do an INSTANT scrollTo(target), then transition opacity 0→1 and translateY 16→0 over ~800ms with easeOut. Reads as the tail end of a smooth-scroll that's 98% done — no long visible animation to be janky, no fighting layout shifts.
// Vercel entry point (used via api/index.ts).
// Only difference from src/index.tsx (Cloudflare): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.tsx,
// keeping the hono/cloudflare-workers import intact in that file.

import { serveStatic } from '@hono/node-server/serve-static'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
