// Version: 1.49.29 - Schedule banner on desktop reimagined as a photo-album collage. Was: one large crossfading image slide that auto-cycled through 5 placeholders. Now: 5 polaroid-style tiles cascade down the left column in alternating descending order so each tile sits roughly opposite its matching schedule card. Each tile has a slight rotation (-4 to +4 degrees), a white photo frame with a thicker bottom strip (like a real polaroid), a soft warm-tinted placeholder gradient, and a subtle gold "washi tape" strip at the top so they read as pinned to a board. Hover (or auto-cycle activation) lifts the tile out of the composition with a NOTICEABLE scale jump (1.42x) — un-rotates, translates up, sheds its tape, casts a deep gold-tinted shadow. Other tiles dim to 0.42 opacity and desaturate slightly so the focal tile clearly dominates. The matching schedule card on the right gets an intensified gold underglow box-shadow + slight transform, so the photo→schedule pairing reads immediately. Hover bidirectional: hovering a card highlights its tile too. Auto-cycle pauses on section hover and resumes 1.2s after the cursor leaves. Mobile (≤960px) keeps the banner display:none — this whole layout is desktop-only.
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
