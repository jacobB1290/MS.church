// Version: 1.49.17 - Soften the /visit handshake illustration to match the site's overall rounded/soft aesthetic. The v1.49.16 version used full ink (#1a1a2e) at 2px stroke which read as a stark outlined logo — too sharp for a site that uses cream backgrounds, gentle gradients, soft shadows, and warm gold accents everywhere else. Changes: (1) stroke color shifts from #1a1a2e to rgba(26,26,46,0.78) — same hue but with slight transparency so the illustration reads as the same ink language as the site's body-text color rather than a heavier logo treatment, (2) stroke-width bumps from 2 to 2.4 — slightly fuller round strokes read softer than thin sharp strokes, (3) adds a subtle drop-shadow (0 1.5px 1px rgba(26,26,46,0.06)) for a hint of warm dimensionality matching the site's pin and section-card shadows. Animation timings unchanged.
// Vercel entry point (used via api/index.ts).
// Only difference from src/index.tsx (Cloudflare): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.tsx,
// keeping the hono/cloudflare-workers import intact in that file.

import { serveStatic } from '@hono/node-server/serve-static'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
