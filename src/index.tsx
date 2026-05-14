// Version: 1.49.1 - Fix: snap-correct fires relative to smooth-scroll firing (not script execution) so a slow-loading page can't have snap-correct's instant scrollTo cut off the smooth-scroll mid-animation (was producing "page sits then jumps" instead of visible smooth motion); also reorder home outreach teaser cards to match /outreach subpage section order (events → cooking → breakfast)
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
