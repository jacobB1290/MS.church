// Morning Star Christian Church — Hono app entry.
// Version history lives in README.md; per-feature change notes live in
// commit messages and the HTML version comment at the top of each route.

import app from './app.js'

// ─── Platform adapter ───────────────────────────────────────────────
// Deploys to Vercel (Node serverless function via api/index.ts).
// To switch to Cloudflare Pages instead:
//   1. Swap the active import below to 'hono/cloudflare-workers'.
//   2. `npm i -D wrangler @cloudflare/workers-types @hono/vite-build`.
//   3. Restore wrangler.jsonc + the build plugin in vite.config.ts
//      (git history through v1.59.x has the previous configuration).
import { serveStatic } from '@hono/node-server/serve-static'
// import { serveStatic } from 'hono/cloudflare-workers'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
