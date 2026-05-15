// Version: 1.49.22 - Combine draw-on entry + firm-pumps gesture. The /visit handshake now: (1) draws itself onto the page via stroke-dashoffset over 2.8s with even ease-in-out so the line forming is actually visible throughout (not just a flash). Only opacity fades on the .handshake-art (1.2s) — no scale entry competing with the draw, so focus stays purely on the line writing itself. (2) After 600ms still pause (the illustration just sits, fully drawn) the handshake-gesture loop starts at 3.4s — three firm decreasing-amplitude pumps (-7 → +4 → -5 → +2 → -3 → 0 px) over 10% of a 10s cycle, then 90% complete stillness. Combined: editorial draw-in (artist sketching) → quiet moment → deliberate gesture → peaceful rest. Each phase has its own beat; no motion competes. pathLength=100 normalization on the path so dasharray/offset math is clean.
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
