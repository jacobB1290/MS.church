import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Cache the rendered HTML at the CDN edge for 60s, serve stale up to 5min while revalidating
    c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.49.5 - Hashload landing accuracy: invisible-stability watchdog. After scrollTo, re-measure every 100ms; if position shifts (e.g. calendar carousel mounts late), instant-correct. Fade-in waits for 300ms of layout stability before firing. Settle bumped 16→40px (~5%). Harness adds network-throttled scenarios. -->
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
