import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Cache the rendered HTML at the CDN edge for 60s, serve stale up to 5min while revalidating
    c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.49.13 - /outreach Cooking + Community Breakfast merged into one "Meals & Hospitality" section. Drops both cards. Shared banner image at top (21:9 desktop, 16:9 mobile), 2-col grid below on desktop / stacked on mobile with a small gold tab marking each ministry block. Inner article IDs preserve home teaser anchor navigation. -->
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
