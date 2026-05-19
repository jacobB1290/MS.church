import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Cache the rendered HTML at the CDN edge for 5min, serve stale up to 1 day while
    // revalidating. The home page changes infrequently (calendar feed is the dynamic
    // bit and lives behind its own 5-min in-memory cache), so a long SWR window keeps
    // origin load near-zero while never serving content that is more than 5 min stale.
    c.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400')
    return c.html(`<!DOCTYPE html>
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
