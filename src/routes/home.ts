import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Cache the rendered HTML at the CDN edge for 60s, serve stale up to 5min while revalidating
    c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.49.21 - Refine the /visit handshake animation away from "cheap bounce." Real handshakes are 2-3 firm pumps then complete stillness, NOT continuous oscillation. New: 10s cycle where the first 10% plays 3 firm decreasing-amplitude pumps (-7 → +4 → -5 → +2 → -3 → 0 px) and the remaining 90% is total stillness. Ease-out timing gives each pump weight without bouncy decay. -->
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
