import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Cache the rendered HTML at the CDN edge for 60s, serve stale up to 5min while revalidating
    c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.58.1 - "View Full Playlist" red CTA recentered on mobile (specificity fix on .teaser-cta.playlist-btn). /ministries Youth section copy rewritten for 15+ audience (no parent-oriented tips, no drop-off/pick-up, no "leader is always present", dress code = "loosely dressed up" matching the youth.jpg photo). Same updates cascaded to schema.org Service/Event/FAQ entries. See src/index.tsx for the full change log. -->
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
