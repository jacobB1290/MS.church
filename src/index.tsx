// Version: 1.49.0 - Subpage hashload defers smooth-scroll until window.load + fonts.ready + 2rAF + rIC so it fires on a quiet main thread (matches home anchor-click context); harness adds A/B comparison + during-scroll jerk metrics
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
