import { type Hono } from 'hono'
import { homeHead } from '../templates/home-head.js'
import { homeBody } from '../templates/home-body.js'
import { homeScripts } from '../templates/home-scripts.js'

export function registerHomeRoute(app: Hono) {
  app.get('/', (c) => {
    // Cache the rendered HTML at the CDN edge for 60s, serve stale up to 5min while revalidating
    c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return c.html(`<!DOCTYPE html>
<!-- v1.53.0 - Schema.org JSON-LD audit + sync: Wednesday Activity Day added to opening hours / offer catalog / Events; Friday Youth Service added as Event with 15+ PeopleAudience; 4 new FAQ entries (dress, parking, greeting, kids, youth ages); /visit + /ministries + /privacy structured data refreshed; gensparksite.com image URLs → /static/. See src/index.tsx for the full change log. -->
<html lang="en">
${homeHead()}
${homeBody()}
${homeScripts()}
</html>`)
  })
}
