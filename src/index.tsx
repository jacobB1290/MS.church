// Version: 1.49.16 - /visit intro gets a clean line-art handshake illustration below the lead paragraph. SVG path provided by user (matching the desired editorial reference style); restyled to the site palette (stroke=#1a1a2e ink, no fill, vector-effect: non-scaling-stroke so the stroke stays 2px regardless of the inner scale(2.81) transform). Animation: a one-time entry (handshake-entry) over 1.4s scales the illustration up from 0.88 with a soft Y drop and opacity fade-in (cubic-bezier 0.22,1,0.36,1), then an infinite handshake-shake animation kicks in starting at the 1.4s delay — damped vertical oscillation (-8 → 7 → -6 → 5 → -4 → 3 → -2 → 1 → 0 px) over 4.5s with a calm hold between cycles so the shake reads as natural and settling rather than a robotic loop. The two animations are layered in CSS with both keyframes carrying scale(1) so the entry's settled scale isn't clobbered by the shake. prefers-reduced-motion: animations off, illustration sits at full scale + opacity. Bug fix during build: needed a nested-group structure so the SVG's static transform="translate(...) scale(2.81)" lives on an inner <g> while the CSS animation transforms the outer .handshake-art group — otherwise CSS transform completely overrides the static scale and the illustration renders at ~1/3 size.
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
