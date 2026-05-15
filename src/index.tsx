// Version: 1.49.14 - /outreach intro gets an animated Boise-map graphic below the lead paragraph: stylized city blob outline + Boise River curve + three gold pins + a glowing two-layer comet line that travels through the pins in an 8s loop, signifying outreach reaching across the city. Comet is two paths on the same loop — thicker low-opacity blurred halo lags 0.18s behind a thin bright drop-shadow-glowing core, giving a true head-bright / tail-fading streak instead of a uniform moving rectangle. Pin pulses fire at even thirds (0 / 2.66 / 5.33s) and scale up to 1.4× with a halo bloom as the comet arrives. Pure SVG + CSS keyframes, no JS, no scroll observer. prefers-reduced-motion disables all animation, pins stay lit statically, comet hidden. role=img + aria-label make it a single accessible image.
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
