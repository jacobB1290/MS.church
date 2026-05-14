// Version: 1.49.11 - Compact the /visit "What to Expect" service-flow timeline via 5 combined levers: (1) desktop ≥800px lays out as 2 columns via grid-auto-flow:column (col1: steps 1-4, col2: steps 5-7), (2) numbered circle 44→38px with font 18→16px and softer shadow, (3) row gap clamp(24,3vw,32) → clamp(20,2.4vw,26), (4) body line-height loose(1.8) → normal(1.6) and h3 slightly smaller, (5) connector line hidden at item 4 in 2-col so it doesn't dangle into empty space below col 1's last item. Mobile keeps single column with the tighter typography + smaller circle.
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
