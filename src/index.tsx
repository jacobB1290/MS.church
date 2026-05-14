// Version: 1.49.9 - Narrow the left-slide eyebrow motion to ONLY the section-heading pills (Schedule, About, Outreach, Watch, Contact). Schedule tab eyebrows (Sunday Gatherings, Bible Reading, Activity Day, Bible Study, Youth Service) revert to pure opacity (their previous motion). Selector scoped via .section-eyebrow.reveal-eyebrow. Subpage eyebrows still untouched.
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
