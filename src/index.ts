// Version: 1.49.13 - /outreach Cooking Ministry + Community Breakfast merged into ONE "Meals & Hospitality" section with a shared banner image and parallel ministry blocks. Drops .section-card on both. Eyebrow "Meals & Hospitality" + h2 "Two tables, one mission." unifies them while inner <article> blocks (each with own ID + eyebrow + title + body + CTA) keep them clearly distinct. #cooking-ministry and #community-breakfast moved onto the inner articles so home teaser links still scroll directly. DESKTOP: 21:9 banner + 2-col grid (columns provide visual separation). MOBILE has its own design: 16:9 banner (landscape-tuned for phone aspect, not just collapsed desktop), small gold gradient "tab" above each ministry block as a section-start marker since the stack lacks the desktop 2-col separation, generous 36-48px gap between blocks so they read as discrete sections, tighter mobile typography. scroll-margin-top tracks 90/75 subpage offsets.
// Vercel entry point (used via api/index.ts).
// Only difference from src/index.tsx (Cloudflare): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.tsx,
// keeping the hono/cloudflare-workers import intact in that file.

import { serveStatic } from '@hono/node-server/serve-static'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
