// Core Hono application — every route + middleware lives here.
// Platform-specific serveStatic is added in src/index.ts (Node/Vercel).

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { registerCalendarRoute } from './routes/calendar.js'
import { registerYouTubeRoute } from './routes/youtube.js'
import { registerHomeRoute } from './routes/home.js'
import { registerAboutRoute } from './routes/about.js'
import { registerBeliefsRoute } from './routes/beliefs.js'
import { registerOutreachRoute } from './routes/outreach.js'
import { registerVisitRoute } from './routes/visit.js'
import { registerMinistriesRoute } from './routes/ministries.js'
import { registerPrivacyRoute } from './routes/privacy.js'
import { registerContactRoute } from './routes/contact.js'
import { registerMiscRoutes } from './routes/misc.js'
import { pageHead } from './templates/shared/page-head.js'
import { notFoundBody } from './templates/not-found-body.js'

const app = new Hono()

// Server-Timing header — exposes Hono render time to DevTools, Lighthouse,
// and Vercel Speed Insights so we can see request-phase cost separately
// from network/CDN. Must be the FIRST middleware so it wraps every route.
app.use('*', async (c, next) => {
  const start = performance.now()
  await next()
  const dur = (performance.now() - start).toFixed(1)
  c.header('Server-Timing', `hono;dur=${dur};desc="render"`)
})

// Security headers for all responses
app.use('*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'SAMEORIGIN')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
})

app.use('/api/*', cors())

registerCalendarRoute(app)
registerYouTubeRoute(app)
registerHomeRoute(app)
registerAboutRoute(app)
registerBeliefsRoute(app)
registerOutreachRoute(app)
registerVisitRoute(app)
registerMinistriesRoute(app)
registerPrivacyRoute(app)
registerContactRoute(app)
registerMiscRoutes(app)

// 404 handler — standard subpage chrome (warm palette, entrance fade)
// so the error page reads as part of the site, not a fallback document.
app.notFound((c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
${pageHead({
  title: 'Page Not Found · Morning Star Christian Church, Boise',
  description:
    'The page you are looking for does not exist. Find service times, ministries, outreach, and contact information for Morning Star Christian Church in Boise, Idaho.',
  canonical: 'https://ms.church/',
  ogImageAlt: 'Morning Star Christian Church building in Boise, Idaho',
  robots: 'noindex, nofollow',
})}
${notFoundBody()}
</html>`, 404)
})

export default app
