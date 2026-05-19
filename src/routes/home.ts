import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Cache the rendered HTML at the CDN edge for 60s, serve stale up to 5min while revalidating
    c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.56.1 - Cache-bust /static/youth.jpg and /static/worship.jpg references on /ministries by appending ?v=2 so CDN/browser fetches the new portrait instead of serving the immutably-cached old 16:9 group photo. See src/index.tsx for the full change log. -->
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
