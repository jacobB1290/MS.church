// Version: 1.49.18 - Recolor the /visit handshake stroke from dark navy to site gold (var(--gold-dark) = #c89860). The dark-navy stroke (v1.49.17) read as a separate dark logo on the cream page; switching to the site's gold accent color pairs the illustration into the same warm ink language used by section eyebrows, the BOISE map label, pin gradients, and other gold accents — making it feel like an integrated piece of the site rather than a foreign icon. Drop-shadow also retinted to a warm gold tone (rgba(200,152,96,0.18)) to match the stroke warmth.
// Vercel entry point (used via api/index.ts).
// Only difference from src/index.tsx (Cloudflare): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.tsx,
// keeping the hono/cloudflare-workers import intact in that file.

import { serveStatic } from '@hono/node-server/serve-static'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
