import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Cache the rendered HTML at the CDN edge for 60s, serve stale up to 5min while revalidating
    c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.49.26 - Short quick back-nav fade + manual scroll restoration via pagereveal (no more "hero then jump"), explicit cream view-transition background (no more Safari "dimming"), subpage brand+back excluded from both the cross-doc fade and the hash-fade entrance slide. See src/index.tsx for the full change log. -->
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
