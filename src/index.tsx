// Version: 1.49.23 - Fix bug: hash-anchor reload always re-jumped to the section. After a successful hashload, both the subpage (subpage-header.ts) and home (home-scripts.ts) flows restored the hash in the URL via history.replaceState so the URL would be bookmarkable. The side effect: reload always rebuilt the hashload from scratch, jumping back to the anchor regardless of where the user had scrolled to. Fix: after restoring the hash, attach a one-time scroll listener (with 1.5s delay to ignore residual settle scroll from our own animations) that clears the hash on the FIRST user scroll. Result — if you reload without scrolling, the hash is preserved and you land at the anchor; if you scrolled away (i.e., moved past the anchor on purpose) the hash is gone and reload preserves your actual scroll position via the browser's default behavior.
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
