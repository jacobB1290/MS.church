// Version: 1.49.27 - Bring back the brand morph and put the brand+back in the cross-document fade — v1.49.26 over-corrected. The user wanted them excluded ONLY from the hash-fade scroll/slide entrance, not from the page fade itself. Specifically the brand should glide between home's nav-shell position and the subpage's centered-top position (the "logo in the nav moves into the position of the logo in the sub pages" animation). Fix: removed the unique view-transition-names (subpage-chrome-brand / subpage-chrome-back) and the animation:none + opacity:1 overrides on them. Restored view-transition-name: site-brand on BOTH .brand and .subpage-brand so the browser interpolates between positions over 360ms (forward) / 160ms (back) with cubic-bezier(0.22, 1, 0.36, 1). The back button is part of the root fade — fades in on forward nav (no equivalent on home), fades out on back nav. The hash-fade entrance slide rule still excludes brand/back/top-fog (only main + footer translate from -40px) so they don't move when the page auto-scrolls into a hash target. subpage-header.ts's scroll-hide entrance lock stays. Kept v1.49.26's manual scroll restoration (history.scrollRestoration = 'manual' + pagereveal restore) and the explicit cream ::view-transition background. All 18 flicker scenarios pass; visual frame inspection confirms the brand morph is visible mid-transition (two MORNING STAR snapshots overlap, interpolating between positions).
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
