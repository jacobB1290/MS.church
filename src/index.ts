// Version: 1.49.32 - Adds /beliefs — full Statement of Beliefs page with all 11 doctrinal convictions adopted verbatim from the parent church (Scripture, Trinity, Christ, Salvation & Judgment, Holy Spirit, Resurrection, Spiritual Unity, Evangelism & Discipleship, Human Sexuality & Marriage, Dedication to Prayer & Service, Sanctity of Human Life), each with supporting Scripture references. Adds a "Read Our Full Statement of Beliefs" CTA at the bottom of the /about beliefs Core Convictions card. Registers the new route in app.ts, adds it to robots.txt and sitemap.xml. Page uses subpage-header pattern, shared page-head SEO, and a page-scoped <style> block for the numbered beliefs list (no changes to home-styles.ts).
// Vercel entry point (used via api/index.ts).
// Only difference from src/index.tsx (Cloudflare): the serveStatic import.
// SYNC RULE: Any change here must also be applied to src/index.tsx,
// keeping the hono/cloudflare-workers import intact in that file.

import { serveStatic } from '@hono/node-server/serve-static'
import app from './app.js'

app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

export default app
