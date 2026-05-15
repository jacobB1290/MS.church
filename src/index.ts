// Version: 1.49.24 - Eliminate the "two pages flashing between each other" view-transition flicker, the "logo expands then jumps" post-fade flicker, and the reveal-FOUC site-wide. Three fixes: (1) Replace the default ::view-transition-old/new(root) crossfade — which put both documents at ~50% opacity simultaneously for ~450ms — with a SEQUENCED dip-through-blank fade: old fades to 0 over 180ms with ease-in, new fades from 0 over 200ms with a 140ms backwards-fill delay. The perceived overlap window is ~40ms (below the human flicker threshold). Page background briefly shows during the gap; reads as a clean dissolve. (2) Keep view-transition-name: site-brand on .brand + .subpage-brand so the wordmark smoothly INTERPOLATES between subpage-centered-top and home-in-nav-pill positions over 360ms with cubic-bezier(0.22, 1, 0.36, 1) — no more "logo appears again at a different spot" jump. (3) Sync-tag <html class="js-reveals"> in the inline head script BEFORE first paint so the reveal-* hidden state lands without FOUC; add html.no-entrance bypass that treats every reveal as already-revealed on back/forward/bfcache navigations (eliminates the "fade completes, then reveals animate in" jump). Plus: font-display: swap → optional with metric-matched Playfair/Inter fallbacks so the post-fade font-swap repaint stops shifting layout; will-change: auto on resolved reveals to release lingering GPU layers on iOS Safari; transition: all → explicit transition properties on .nav-shell to prevent unintended scroll-restore animations; nav-prerender-scrolled class on html for pre-paint sync of .nav-shell.scrolled-mobile state on bfcache restore. New flicker harness suite (14 scenarios) samples DOM + pixels every ~30ms across navigation events and flags blank frames, brand position jumps, brand hidden→visible toggles, see-through frames showing both pages overlapping, post-fade animation leaks, and nav-shell class flips after first paint. Harness was extended with a tiny PNG decoder for pixel-level signature comparison so "is this frame a blend of old + new" can be answered programmatically.
// Vercel entry point (used via api/index.ts).
// Only difference from src/index.tsx (Cloudflare): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.tsx,
// keeping the hono/cloudflare-workers import intact in that file.

import { serveStatic } from '@hono/node-server/serve-static'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
