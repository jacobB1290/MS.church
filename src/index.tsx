// Version: 1.49.8 - Home reveal-eyebrow now slides in from the left (translateX -10→0) instead of pure opacity. Reads as "label arrives, heading settles in" — reinforces eyebrow → heading cascade read order. 720ms matches reveal-rise so the eyebrow and heading land on the same beat. Only affects home page; subpage eyebrows are untouched.
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
