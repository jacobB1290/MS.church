// Version: 1.49.0 - Subpage hashload defers smooth-scroll until window.load + fonts.ready + 2rAF + rIC so it fires on a quiet main thread (matches home anchor-click context); harness adds A/B comparison + during-scroll jerk metrics
// Vercel entry point (used via api/index.ts).
// Only difference from src/index.tsx (Cloudflare): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.tsx,
// keeping the hono/cloudflare-workers import intact in that file.

import { serveStatic } from '@hono/node-server/serve-static'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
