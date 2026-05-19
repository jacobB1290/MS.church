import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Cache the rendered HTML at the CDN edge for 60s, serve stale up to 5min while revalidating
    c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.59.1 - Fix cropping regression on /ministries (Youth, Worship) and /outreach (Meals & Hospitality) — picture-wrapper introduced in v1.59.0 made the inner <img> a grandchild that CSS selectors targeting direct children no longer matched. Updated rules to also target picture > img. See src/index.tsx for the full change log. -->
<!-- v1.59.0 - Fully self-hosted images (no third-party image deps). Every image served as AVIF/WebP/JPG via <picture> + CSS image-set(). Restored church-building hero from git (was inline ref to an external image host), optimized + multi-format. Deleted 3 unused images. Total static weight on home dropped to 521 KB on AVIF-capable browsers. See src/index.tsx for the full change log. -->
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
