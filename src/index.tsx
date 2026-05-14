// Version: 1.49.3 - Hashload fade-in: subpage <main> paints at opacity 0 and animates to 1 over 1100ms concurrent with the smooth-scroll. Hides the wait-for-settle delay + any late layout shift behind a single coherent motion. Brand + back stay anchored so chrome doesn't move. Respects prefers-reduced-motion.
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
