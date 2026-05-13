// Version: 1.41.0 - Refactor: extract shared nav + footer templates (Phase 1 of multi-page)
// Vercel entry point (used via api/index.ts).
// Only difference from src/index.tsx (Cloudflare): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.tsx,
// keeping the hono/cloudflare-workers import intact in that file.

import { serveStatic } from '@hono/node-server/serve-static'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
