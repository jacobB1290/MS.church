import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Cache the rendered HTML at the CDN edge for 60s, serve stale up to 5min while revalidating
    c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.49.11 - Compact the /visit "What to Expect" timeline: 2-column desktop layout (steps 1-4 left, 5-7 right), smaller 38px circles, tighter row gap, tighter line-height, h3 slightly smaller. Mobile stays single-column with the same tightenings. -->
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
