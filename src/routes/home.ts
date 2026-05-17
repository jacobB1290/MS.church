import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Cache the rendered HTML at the CDN edge for 60s, serve stale up to 5min while revalidating
    c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.49.30 - Drop real images into the Cooking Ministry teaser and the About teaser on the home page. Modern browsers get AVIF/WebP via <picture>; old browsers fall back to JPEG. Cooking object-position 30% 62% keeps volunteer + food in frame at every viewport. About placeholder styling scoped via :not(:has(picture, img)). See src/index.tsx for the full change log. -->
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
