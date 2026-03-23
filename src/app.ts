// Core Hono application — shared by both Cloudflare and Vercel entries.
// Platform-specific middleware (serveStatic) is added in index.tsx / index.ts.

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { registerCalendarRoute } from './routes/calendar.js'
import { registerYouTubeRoute } from './routes/youtube.js'
import { registerHomeRoute } from './routes/home.js'
import { registerPrivacyRoute } from './routes/privacy.js'
import { registerMiscRoutes } from './routes/misc.js'
import { GOLD } from './design-tokens.js'

const app = new Hono()

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
registerPrivacyRoute(app)
registerMiscRoutes(app)

// 404 handler — branded page with link back to home
app.notFound((c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found | Morning Star Christian Church - Boise, Idaho</title>
    <meta name="robots" content="noindex, nofollow">
    <link rel="canonical" href="https://ms.church/">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #f8f9fd;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 24px;
        }
        .container { max-width: 480px; }
        h1 {
            font-family: 'Playfair Display', serif;
            font-size: clamp(48px, 10vw, 72px);
            color: #1a1a2e;
            margin-bottom: 8px;
        }
        p { color: rgba(26,26,46,0.6); font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
        .brand {
            font-family: 'Playfair Display', serif;
            font-size: 18px;
            font-weight: 700;
            color: #1a1a2e;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        .brand-sub {
            font-size: 10px;
            color: rgba(26,26,46,0.45);
            letter-spacing: 3px;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 32px;
        }
        a.btn {
            display: inline-block;
            background: ${GOLD};
            color: white;
            padding: 14px 32px;
            border-radius: 100px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        a.btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    </style>
</head>
<body>
    <div class="container">
        <div class="brand">Morning Star</div>
        <div class="brand-sub">Christian Church</div>
        <h1>404</h1>
        <p>The page you're looking for doesn't exist. Let's get you back to our church home.</p>
        <a class="btn" href="/">Back to Home</a>
    </div>
</body>
</html>`, 404)
})

export default app
