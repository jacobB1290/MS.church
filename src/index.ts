// Version: 1.49.19 - /visit handshake gets a "two people walking toward each other" approach animation. The single handshake illustration is duplicated into two side-by-side clipped halves: .handshake-half-left clipped to inset(0 50% 0 0) shows only the left half of the SVG, .handshake-half-right clipped to inset(0 0 0 50%) shows only the right half. Each half slides in from its off-screen side via translateX from ±90% to 0 over a 2s cubic-bezier(0.22, 0.6, 0.36, 1) approach (decelerated arrival — like steps slowing as the hands meet). Once both halves settle at translateX 0 they form the complete illustration seamlessly. The 4.5s damped natural-shake loop on .handshake-art (present inside both halves with identical timing) kicks in at the 2s mark so both halves shake in perfect sync, appearing as one continuous illustration. Approach truly reads as "two hands approaching, meeting, and shaking" — even though each half is technically a clipped slice of the final image rather than a separately-drawn complete hand. Avoided hand-drawing two separate complete hand outlines (which had failed six previous iterations).
// Vercel entry point (used via api/index.ts).
// Only difference from src/index.tsx (Cloudflare): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.tsx,
// keeping the hono/cloudflare-workers import intact in that file.

import { serveStatic } from '@hono/node-server/serve-static'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
