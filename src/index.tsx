// Version: 1.49.15 - Full redesign of the /outreach Boise-map graphic. The v1.49.14 "oval-blob-with-dots" version read as amateurish (featureless outline, weak dot pins, comet line landing in awkward stopped positions). New design is a proper top-down editorial city-map illustration: dashed foothills contour (north), two-tier street grid (side streets 0.10 opacity + arterials 0.20 opacity), Boise River as gold gradient stroke with a dashed greenbelt companion line, three TEARDROP map-pins with radial gradient (light-gold highlight + deep-brown shadow), thin dark outline, white inner indicator, soft ground shadow ellipse, and a SIX-LAYER comet trail (head + 5 increasingly thicker/blurrier/dimmer/lagging tails) that travels A→B→C and fades out during a high-arcing C→A return so the visible "outreach delivery" only happens on the forward legs. Pin pulses timed to comet arrival positions (0% / 17% / 45% of the 9s cycle). Tiny "BOISE" small-caps label at bottom-right as a map signature. prefers-reduced-motion: animations off, pins stay lit, comet shows a static dashed line.
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
