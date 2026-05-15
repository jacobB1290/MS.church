// Version: 1.49.26 - Three connected fixes for the iteration the user landed on. (1) v1.49.25 fixed the "hero shown then jump" by skipping the view-transition on back-nav, but that left back-nav with NO fade at all (Safari) and broke scroll restoration in Chrome (page landed at hero). Replaced the skip with a SHORT QUICK CROSSFADE for back-nav (110/150ms opacity-only) AND manual scroll restoration: history.scrollRestoration = 'manual', scrollY saved on pagehide, restored in pagereveal BEFORE the view-transition snapshot is captured. The fade now plays at the correct scroll position from frame one — short, unintrusive exit fade, no jump. (2) Explicit cream background on ::view-transition root pseudo. Safari iOS was rendering the brief low-opacity overlap during the dip-through-blank gap as dark/dim, which read as "dimming screen flicker." The page-bg color now shows through any opacity gap. (3) Exclude subpage chrome (.subpage-brand + .subpage-back) from BOTH the cross-document fade AND the hash-fade entrance slide. View-transition-name "subpage-chrome-brand"/"subpage-chrome-back" with animation:none + opacity:1 keeps them solid throughout the page fade; the hash-fade slide rule no longer includes them (only main + footer translate from -40px). subpage-header.ts's scroll-hide is gated behind a 1200ms entrance lock so the brand doesn't transition to .hidden as a side effect of the hash-load auto-scroll. Two new harness scenarios (115/116) verify the subpage-brand stays anchored within 10px during hash-load entrance. All 18 flicker scenarios pass.
// Vercel entry point (used via api/index.ts).
// Only difference from src/index.tsx (Cloudflare): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.tsx,
// keeping the hono/cloudflare-workers import intact in that file.

import { serveStatic } from '@hono/node-server/serve-static'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
