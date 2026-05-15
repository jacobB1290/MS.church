import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Cache the rendered HTML at the CDN edge for 60s, serve stale up to 5min while revalidating
    c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.49.22 - Combine draw-on entry + firm-pumps gesture. The /visit handshake draws itself onto the page (2.8s stroke-dashoffset), pauses 600ms fully drawn, then enters the firm-pumps gesture loop (3 pumps + 9s stillness). Each phase has its own beat — editorial draw-in, quiet moment, deliberate gesture, peaceful rest. -->
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
