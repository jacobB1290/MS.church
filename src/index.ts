// Version: 1.49.7 - Flip hashload settle direction (translateY -40→0 instead of +40→0) so content slides DOWN from above its final spot — reads as "page auto-scrolled DOWN to reveal this section." Animation now applies to ALL subpage content (brand, back, top fog, main, footer) so the whole viewport slides in together — previously only main animated which felt frozen-everywhere-except-one-element.
// Vercel entry point (used via api/index.ts).
// Only difference from src/index.tsx (Cloudflare): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.tsx,
// keeping the hono/cloudflare-workers import intact in that file.

import { serveStatic } from '@hono/node-server/serve-static'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
