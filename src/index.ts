// Version: 1.49.31 - Align beliefs + identity copy with the parent church (morningstar-church.com). The /about beliefs section now leads with "Bible-Believing, Bible-Teaching" (whole counsel of God, no watered-down version) and "Lord and Savior" (Jesus crucified, risen, coming again; real daily relationship), keeping the Grace and Community cards. "Nondenominational" descriptive copy is replaced with "Bible-believing" across the home About teaser, /about intro + Schema.org, and home meta + Schema descriptions (kept in keywords for SEO). The home FAQ entry is rewritten from "Is Morning Star nondenominational?" to "What does Morning Star believe?" with an answer that mirrors the parent church's theology. No layout, schedule, or visual changes — copy-only.
// Vercel entry point (used via api/index.ts).
// Only difference from src/index.tsx (Cloudflare): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.tsx,
// keeping the hono/cloudflare-workers import intact in that file.

import { serveStatic } from '@hono/node-server/serve-static'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
