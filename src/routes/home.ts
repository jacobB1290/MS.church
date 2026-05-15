import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Cache the rendered HTML at the CDN edge for 60s, serve stale up to 5min while revalidating
    c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.49.15 - Full redesign of the /outreach Boise-map graphic: top-down city map with foothills contour + two-tier street grid + Boise River + dashed greenbelt + three teardrop map-pins (gradient + shadow + indicator) + six-layer comet trail with sweeping over-the-foothills return + BOISE map-signature label. Replaces the v1.49.14 blob-with-dots version. -->
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
