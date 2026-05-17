// Version: 1.49.30 - Drop real images into the Cooking Ministry teaser card and the About teaser on the home page, replacing the dashed-border SVG placeholders. Ships AVIF + WebP + JPEG via <picture> with fallback so modern browsers get ~65% smaller payloads (cooking: 55 KB AVIF / 86 KB WebP / 159 KB JPEG; about: 155 KB AVIF / 235 KB WebP / 351 KB JPEG). Cooking image uses object-position: 30% 62% so the volunteer stays in frame at narrow viewports (where the side-by-side mobile slot crops horizontally) and the cutting board / red peppers stay prominent at desktop (4:3 image-on-top where the crop happens vertically). About-image placeholder gradient + dashed border + centered SVG are now scoped via :not(:has(picture, img)) so they don't show through the new image but still render for any other future placeholder slot. Layout unchanged from v1.49.28.
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
