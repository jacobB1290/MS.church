import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Split browser vs edge so new content (the calendar feed) is never served
    // 24h-stale from the browser cache: the browser revalidates every load
    // (max-age=0), while the edge holds a 5-min cache + short SWR so origin load
    // stays near-zero. The dynamic bit (events) lives behind its own in-memory
    // cache, so the page is never more than a few minutes stale.
    c.header('Cache-Control', 'public, max-age=0, must-revalidate')
    c.header('CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return c.html(`<!DOCTYPE html>
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
