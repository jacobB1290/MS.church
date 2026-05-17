// Version: 1.49.33 - Grounds the /about Core Convictions cards in the parent church's full 11-point statement now that we have the source text. Scripture card adds "the only infallible" to match statement #1 word-for-word. Jesus card expands to "virgin-born, crucified for us, bodily risen, ascended, and coming again in power and glory" so it incorporates statement #3's specifics (deity / virgin birth / atoning death / bodily resurrection / ascension / personal return). Community card opens with "All true believers are one body in Christ" to nod to statement #7 (spiritual unity of believers) before the pastoral sentence. Grace card unchanged — already echoes statement #8 ("salvation only possible by grace through faith"). Copy-only — no layout, structural, or design changes.
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
