// Version: 1.49.34 - Two fixes to /outreach landing behavior from the home teaser cards. (1) The Cooking Ministry and Community Breakfast teaser cards on the home page now both link to /outreach#meals-hospitality (the section top) instead of /outreach#cooking-ministry and /outreach#community-breakfast (the inner article anchors). Users now land on the "MEALS & HOSPITALITY" eyebrow + "Two tables, one mission." heading + team photo + both ministries together, rather than dropping straight into the Cooking Ministry article mid-section. (2) Removed the #meals-hospitality { padding-bottom: clamp(140px, 30vh, 320px); } scroll-buffer rule from home-styles.ts — it was added so hash-jumps to the inner articles could reach the canonical 75/90px offset, but with the new landing target at the section top, the buffer is no longer needed and was creating an oversized empty area before the footer on mobile (up to 320px). The inner article IDs (#cooking-ministry, #community-breakfast) are preserved so external deep links still resolve to those articles, they just no longer get the dedicated bottom buffer. Footer now sits naturally below the last ministry block.
// Vercel entry point (used via api/index.ts).
// Only difference from src/index.tsx (Cloudflare): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.tsx,
// keeping the hono/cloudflare-workers import intact in that file.

import { serveStatic } from '@hono/node-server/serve-static'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
