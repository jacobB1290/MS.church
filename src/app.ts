// Core Hono application — shared by both Cloudflare and Vercel entries.
// Platform-specific middleware (serveStatic) is added in index.tsx / index.ts.

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { registerCalendarRoute } from './routes/calendar.js'
import { registerHomeRoute } from './routes/home.js'
import { registerPrivacyRoute } from './routes/privacy.js'
import { registerMiscRoutes } from './routes/misc.js'

const app = new Hono()

app.use('/api/*', cors())

registerCalendarRoute(app)
registerHomeRoute(app)
registerPrivacyRoute(app)
registerMiscRoutes(app)

export default app
