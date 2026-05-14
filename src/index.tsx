// Version: 1.49.12 - Redesign /visit Sunday School section: drop the .section-card box, switch to editorial split. Desktop ≥961px: 2-col grid (video left ~280px, text right) inside 880px max-width centered container, video capped at max-height 440px (~247×440 down from 360×640). Mobile ≤960px: single-column stack, video centered with max-width 240px / max-height 426px (~17% side air, reads as intentional centering not dead space). New scannable facts list (When / Focus / Drop-in) below the paragraph fills the right column on desktop and adds content density on mobile so the section doesn't feel like "video then one short paragraph." Replaces .section-card.section-card-video and .section-card-text (both only used here).
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
