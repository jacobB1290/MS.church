// Version: 1.49.25 - Kill the "hero shown then jump to scroll position" flicker on browser back navigation. Cross-doc @view-transition captures the new-page snapshot at scrollY=0 BEFORE the browser's scroll restoration kicks in, so the user briefly sees the destination page at its top (e.g. home hero) while the fade plays, then the page jumps to their previous scroll position when the live DOM takes over. Fix: synchronously tag <html class="nav-back-forward"> in the inline head script when performance navigation type is "back_forward", and add a CSS rule that nulls all view-transition animations (root + site-brand group/old/new) when that class is set. Also call viewTransition.skipTransition() in the pagereveal event for browsers that support it (Chrome 124+, iOS Safari 18+) as a belt-and-suspenders. Forward navigation (clicking a link) keeps the sequenced dip-through-blank fade + brand morph from v1.49.24. Also fixed the html.no-entrance reveal-bypass selector — was "html.no-entrance .js-reveals .reveal-X" (descendant) which never matched because .js-reveals is on html itself, not a descendant. Corrected to "html.no-entrance.js-reveals .reveal-X" (compound). New harness scenarios 120/121 specifically detect the scroll-restore jump: scroll home to ~1800px, click an outreach link, then trigger back nav and verify that no back-nav sample shows scrollY < settled - 400px (i.e. the page never briefly shows hero-at-top before snapping to the saved position).
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
