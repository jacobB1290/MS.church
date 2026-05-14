// Version: 1.49.5 - Hashload landing accuracy: invisible-stability watchdog. After window.load + fonts + rIC, do instant scrollTo, then re-measure every 100ms while still invisible; if position shifts (e.g. calendar carousel mounts late), instant-correct. Fade-in fires only after 3 consecutive stable readings (300ms of no shift), or 1500ms hard cap. Settle distance bumped 16px→40px (~5%). Harness: added network-throttled hashload + anchor scenarios so the landing-accuracy check exercises the calendar-mounts-after-scrollTo path that localhost was too fast to surface.
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
