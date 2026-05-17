// Version: 1.49.35 - Combines the /about page's Our Mission and Our Story sections into one unified section, and drops the section-card frame in favor of the editorial split layout used by the home page's About teaser (.about-content + .about-image + .about-text). The combined content opens with the origin (planted in Boise, young, small, gospel-driven) and rolls naturally into the mission (point people to Jesus, build a family, serve Boise), then anchors "Mending the Broken" as the operating lens and closes with the open-table invitation. Eyebrow is "Our Story", heading is "Who we are and why we're here.", section ID stays as #mission. Image slot uses the .about-image placeholder (auto-renders the gradient + dashed border + centered SVG via :not(:has(picture, img))) so a real image can be dropped in later without further changes. No CSS added — reuses the existing .about-content rules from home-styles.ts. Leadership and Visit sections still use .section-card; only the combined mission/story section drops it.
// Cloudflare Pages entry point.
// Only difference from src/index.ts (Vercel): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.ts,
// keeping the @hono/node-server/serve-static import intact in that file.

import { serveStatic } from 'hono/cloudflare-workers'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
