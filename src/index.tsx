// Version: 1.49.2 - Fix: layout-shift-aware smooth-scroll. The hashload target Y can shift mid-animation (e.g. /outreach calendar mounts async after window.load and pushes sections down). A 100ms watchdog re-fires scrollTo({behavior:'smooth'}) toward the updated target whenever the section moves >10px while scrolling, so motion curves smoothly into the new position instead of landing wrong then snapping. Final correction is also smooth, never a jump.
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
