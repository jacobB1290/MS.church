import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Cache the rendered HTML at the CDN edge for 60s, serve stale up to 5min while revalidating
    c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.49.25 - Kill the "hero shown then jump to scroll position" flicker on browser back navigation by skipping the view-transition fade for back/forward, plus fix the html.no-entrance reveal-bypass selector. See src/index.tsx for the full change log. -->
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
