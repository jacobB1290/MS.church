import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Cache the rendered HTML at the CDN edge for 60s, serve stale up to 5min while revalidating
    c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.49.20 - Revert the /visit handshake to single-illustration entry animation (v1.49.18 design). Tried two-separate-hand approach via both clip-path halves and custom hand-drawn SVGs; the clip approach was rejected (user wanted actual separate SVGs), and my custom hand drawings landed below the craft bar (looked like loaves/socks). Honest acknowledgment that drawing anatomically-recognizable separate hand illustrations from scratch in raw SVG is beyond reliable capability without illustration tooling. Reverted to the simple 1.4s scale-up entry + 4.5s damped natural-shake loop that works. -->
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
