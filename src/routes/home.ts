import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Cache the rendered HTML at the CDN edge for 60s, serve stale up to 5min while revalidating
    c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.49.29 - Schedule banner on desktop reimagined as a polaroid-album collage: 5 tiles cascade down the left in alternating order, each tinted + rotated + with a soft gold tape strip. Hover (or auto-cycle) lifts the focal tile 1.42x with a deep gold shadow; the matching schedule card on the right gets an intensified gold underglow. Mobile unchanged. See src/index.tsx for the full change log. -->
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
