// Version: 1.49.28 - Outreach teaser on home redesigned for a cleaner uniform-card row on desktop ONLY (mobile keeps its original side-by-side layout, just edge-to-edge). Was: 3 cards in a section-card wrapper, each a side-by-side text+image with no aspect-ratio constraint — the image cells ended up varying in shape between cards and the cards felt cramped on desktop. Now (desktop ≥961px): image-on-top (4:3 landscape, edge-to-edge) + text-below; 3 columns forced so the row always shows all three uniform cards; outer .section-card wrapper dropped so the cards sit directly on the page background; the global :nth-child(even) image-on-left swap is cancelled so all three teasers keep image-on-top regardless of position. Mobile (≤960px) keeps the side-by-side card design inside the section-card but the image is now edge-to-edge in its half (card padding removed, image border-radius removed, card overflow:hidden clips the image corners to the card corner). Verified across 360 / 390 / 414 / 480 / 600 / 768 / 900 / 961 / 1024 / 1280 / 1440 / 1920 px viewports — clean breakpoint at 960/961, no overlap glitches at the small end, all 18 anchor harness scenarios still pass.
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
