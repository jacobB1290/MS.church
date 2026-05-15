// Version: 1.49.20 - Revert the /visit handshake to the single-illustration entry animation (v1.49.18 design). Attempted two-separate-hand approach in v1.49.19-20: first via clip-path halves (user rejected — wanted actual separate SVGs not clips), then via hand-drawn approach SVGs (drawings looked like loaves/socks/lollipops — below the craft bar). Honest acknowledgment: drawing anatomically-recognizable separate hand illustrations from scratch in raw SVG path syntax is beyond my reliable capability without illustration tooling for visual iteration. The user-provided locked-grip SVG is excellent and looks correct with a simple entry + natural shake: 1.4s entry scales from 0.88 with Y drop and opacity fade-in (cubic-bezier 0.22,1,0.36,1), then 4.5s infinite damped natural-shake loop (-8 → 7 → -6 → 5 → -4 → 3 → -2 → 1 → 0 px) over the first 48% of each cycle plus a calm hold for the remaining 52% so the loop doesn't feel hyperactive. Gold stroke (var(--gold-dark)), 2.4px stroke-width with vector-effect: non-scaling-stroke, soft gold-tinted drop shadow.
// Vercel entry point (used via api/index.ts).
// Only difference from src/index.tsx (Cloudflare): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.tsx,
// keeping the hono/cloudflare-workers import intact in that file.

import { serveStatic } from '@hono/node-server/serve-static'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
