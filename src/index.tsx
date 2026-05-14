// Version: 1.49.10 - Opt .reveal-fill (CTA buttons) out of [data-reveal-sync] grouping so the gold-wash fill animation no longer fires the moment a tall section's parent enters viewport. Affected: About teaser CTA (was firing with the about image), Playlist button (was firing with the video card), Outreach teaser CTA (defensive — already sibling of sync). Now each fill button waits for its own viewport entry so the 1300ms wipe plays while the user is actually looking at the button.
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
