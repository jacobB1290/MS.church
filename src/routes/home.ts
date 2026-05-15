import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Cache the rendered HTML at the CDN edge for 60s, serve stale up to 5min while revalidating
    c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.49.23 - Fix hash-anchor reload bug: navigating to /#contact (or any anchor) then reloading always rebuilt the hashload and re-jumped to the section, regardless of where the user had scrolled to. Fix: after the URL hash is restored, attach a one-time scroll listener that clears the hash on the first user scroll. Reload preserved-at-anchor if you didn't scroll; reload preserves your actual scroll position if you did. -->
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
