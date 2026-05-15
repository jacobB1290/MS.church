import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Cache the rendered HTML at the CDN edge for 60s, serve stale up to 5min while revalidating
    c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.49.16 - /visit intro gets a clean line-art handshake illustration below the lead paragraph. Stroke-only outline matching the editorial style. Animation: 1.4s entry (scale up + Y drop + fade in), then infinite damped natural shake (8px → 0 over 4.5s with a calm hold between cycles). Nested-group structure separates the SVG's static scale(2.81) transform from the CSS animation transform on the outer group. -->
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
