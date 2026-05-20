import { type Hono } from 'hono'
import { GOLD } from '../design-tokens.js'
import { fetchCalendarEvents } from './calendar.js'

// Escape special XML characters in body text (titles, descriptions, etc.).
const xmlEscape = (s: string): string =>
  s.replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;')
   .replace(/'/g, '&apos;')

export function registerMiscRoutes(app: Hono) {
  // robots.txt — tightened formatting + Googlebot fast lane + sitemap directive.
  // Production-correct (no leading whitespace inside the txt body).
  app.get('/robots.txt', (c) => {
    c.header('Content-Type', 'text/plain; charset=utf-8')
    c.header('Cache-Control', 'public, max-age=86400')
    return c.text(`# robots.txt for Morning Star Christian Church — https://ms.church
User-agent: *
Allow: /
Disallow: /api/
Disallow: /*.json
Crawl-delay: 1

# Googlebot — no crawl delay
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Googlebot-Image — explicit allow for image discovery
User-agent: Googlebot-Image
Allow: /static/

# Bing
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# AI search crawlers — explicit allow. ms.church welcomes inclusion in
# AI search engines (Perplexity, ChatGPT, Claude, Gemini overviews, etc.)
# because our structured-data + FAQ content is well-suited to summarization.
# Listing them by name also signals we are aware of them and intentionally
# allow access — Life Church Boise and other Squarespace sites do the same.
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: CCBot
Allow: /
User-agent: meta-externalagent
Allow: /
User-agent: Bytespider
Allow: /

Sitemap: https://ms.church/sitemap.xml
`)
  })

  // sitemap.xml — uses image:image extension so every page exposes its hero
  // image to Google Image search with descriptive caption + title.
  app.get('/sitemap.xml', (c) => {
    // Google ignores dynamically-changing lastmod values (their guidance:
    // accurate-or-don't-bother). Bump this constant when meaningful content
    // changes ship — not on every deploy. Per-entry overrides handle the
    // home page (event calendar updates weekly) below.
    const SITE_LASTMOD = '2026-05-20'
    const HOME_LASTMOD = new Date().toISOString().split('T')[0]
    const base = 'https://ms.church'
    type ImageInfo = { loc: string; title: string; caption: string }
    type Entry = {
      loc: string
      lastmod: string
      changefreq: string
      priority: string
      image?: ImageInfo
      images?: ImageInfo[]
    }
    const entries: Entry[] = [
      {
        loc: `${base}/`,
        // Home is the only page whose lastmod legitimately tracks "today" —
        // the embedded event calendar updates the rendered output weekly.
        lastmod: HOME_LASTMOD,
        changefreq: 'weekly',
        priority: '1.0',
        image: {
          loc: `${base}/static/church-building.jpg`,
          title: 'Morning Star Christian Church in Boise, Idaho',
          caption: 'Morning Star Christian Church building at 3080 Wildwood Street, Boise — a welcoming, Bible-believing nondenominational church serving West Boise.',
        },
      },
      {
        loc: `${base}/about`,
        lastmod: SITE_LASTMOD,
        changefreq: 'monthly',
        priority: '0.9',
        image: {
          loc: `${base}/static/about-congregation.jpg`,
          title: 'About Morning Star Christian Church',
          caption: 'Morning Star Christian Church congregation worshiping together on a Sunday morning in Boise, Idaho.',
        },
      },
      {
        loc: `${base}/beliefs`,
        lastmod: SITE_LASTMOD,
        changefreq: 'yearly',
        priority: '0.85',
      },
      {
        loc: `${base}/ministries`,
        lastmod: SITE_LASTMOD,
        changefreq: 'monthly',
        priority: '0.9',
        images: [
          {
            loc: `${base}/static/worship-desktop.jpg?v=2`,
            title: 'Sunday worship teaching at Morning Star Christian Church',
            caption: 'Pastor teaching from the pulpit at the 9 AM Sunday service at Morning Star Christian Church in Boise, Idaho — Bible-grounded, nondenominational worship.',
          },
          {
            loc: `${base}/static/worship.jpg`,
            title: 'Sunday worship team at Morning Star Christian Church',
            caption: 'Worship team leading songs from the platform at the Sunday service at Morning Star Christian Church in Boise — one of six weekly ministries including Bible study, youth, and Sunday school.',
          },
        ],
      },
      {
        loc: `${base}/outreach`,
        // Outreach pulls in the live calendar feed as well, so weekly lastmod
        // is honest.
        lastmod: HOME_LASTMOD,
        changefreq: 'weekly',
        priority: '0.9',
        image: {
          loc: `${base}/static/cooking-ministry.jpg`,
          title: 'Outreach at Morning Star Christian Church',
          caption: 'Morning Star Christian Church cooking ministry volunteers preparing meals for the Boise homeless shelter and the free Sunday community breakfast.',
        },
      },
      {
        loc: `${base}/visit`,
        lastmod: SITE_LASTMOD,
        changefreq: 'monthly',
        priority: '0.95',
        image: {
          loc: `${base}/static/church-building.jpg`,
          title: 'Plan Your Visit — Morning Star Christian Church',
          caption: 'Morning Star Christian Church exterior at 3080 Wildwood Street in West Boise, Idaho — plan your first Sunday visit.',
        },
      },
      {
        loc: `${base}/form`,
        lastmod: SITE_LASTMOD,
        changefreq: 'monthly',
        priority: '0.7',
      },
      {
        loc: `${base}/privacy`,
        lastmod: SITE_LASTMOD,
        changefreq: 'yearly',
        priority: '0.3',
      },
    ]

    const urls = entries
      .map((e) => {
        const renderImage = (img: ImageInfo) =>
          `\n    <image:image>\n      <image:loc>${img.loc}</image:loc>\n      <image:title>${xmlEscape(img.title)}</image:title>\n      <image:caption>${xmlEscape(img.caption)}</image:caption>\n    </image:image>`
        const imgs: ImageInfo[] = e.images ?? (e.image ? [e.image] : [])
        const imgBlock = imgs.map(renderImage).join('')
        return `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>${imgBlock}\n  </url>`
      })
      .join('\n')

    c.header('Content-Type', 'application/xml; charset=utf-8')
    c.header('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    return c.body(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`
    )
  })

  // /.well-known/security.txt — RFC 9116. Trivial trust signal; none of the
  // 6 competitors expose one beyond Squarespace's centralized default.
  app.get('/.well-known/security.txt', (c) => {
    c.header('Content-Type', 'text/plain; charset=utf-8')
    c.header('Cache-Control', 'public, max-age=86400')
    const expiry = new Date()
    expiry.setFullYear(expiry.getFullYear() + 1)
    return c.text(`Contact: mailto:support@ms.church
Expires: ${expiry.toISOString()}
Preferred-Languages: en
Canonical: https://ms.church/.well-known/security.txt
`)
  })

  // /feed.xml — RSS 2.0 of upcoming and recent events from the church
  // calendar. Cathedral is the only Boise-church competitor advertising an
  // RSS feed; this puts ms.church ahead on Google Discover + AI crawler
  // discovery (Perplexity, SearchGPT, ChatGPT prefer feed-formatted content).
  app.get('/feed.xml', async (c) => {
    c.header('Content-Type', 'application/rss+xml; charset=utf-8')
    c.header('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=86400')

    const result = await fetchCalendarEvents().catch(() => null)
    const now = new Date().toUTCString()
    const events = result?.success ? result.events : []

    // Keep both upcoming and recent past events so the feed always has
    // 10–20 items even outside event season.
    const items = events
      .slice(0, 20)
      .map((ev) => {
        const link = `https://ms.church/outreach#${ev.id}`
        const eventDate = new Date(ev.date)
        const pubDate = eventDate.toUTCString()
        const desc = ev.description || `${ev.title} at Morning Star Christian Church, Boise.`
        return `    <item>
      <title>${xmlEscape(ev.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="false">ms.church:event:${ev.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${xmlEscape(desc)}</description>${ev.image ? `\n      <enclosure url="${ev.image}" type="image/jpeg"/>` : ''}
    </item>`
      })
      .join('\n')

    return c.body(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Morning Star Christian Church — Events &amp; News</title>
    <link>https://ms.church/</link>
    <atom:link href="https://ms.church/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Upcoming events, community outreach, and Sunday service news from Morning Star Christian Church in Boise, Idaho.</description>
    <language>en-us</language>
    <copyright>Morning Star Christian Church</copyright>
    <lastBuildDate>${now}</lastBuildDate>
    <ttl>15</ttl>
${items}
  </channel>
</rss>
`)
  })
  
  // Contact form page
  app.get('/form', (c) => {
    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
          
          <!-- Primary Meta Tags -->
          <title>Contact Us | Morning Star Christian Church - Boise, Idaho</title>
          <meta name="title" content="Contact Us | Morning Star Christian Church - Boise, Idaho">
          <meta name="description" content="Get in touch with Morning Star Christian Church in Boise, Idaho. Submit a prayer request, ask questions, or connect with our community. We'd love to hear from you!">
          <meta name="robots" content="index, follow">
          <link rel="canonical" href="https://ms.church/form">
          
          <!-- Open Graph / Facebook -->
          <meta property="og:type" content="website">
          <meta property="og:url" content="https://ms.church/form">
          <meta property="og:title" content="Contact Us | Morning Star Christian Church">
          <meta property="og:description" content="Get in touch with Morning Star Christian Church in Boise, Idaho. Submit a prayer request or connect with our community.">
          <meta property="og:site_name" content="Morning Star Christian Church">
          
          <!-- Twitter -->
          <meta name="twitter:card" content="summary">
          <meta name="twitter:url" content="https://ms.church/form">
          <meta name="twitter:title" content="Contact Us | Morning Star Christian Church">
          <meta name="twitter:description" content="Get in touch with Morning Star Christian Church in Boise, Idaho. Submit a prayer request or connect with our community.">
          
          <!-- Safari iOS theme-color for status bar and tab bar background -->
          <meta name="theme-color" content="#faf8f5">
          <meta name="apple-mobile-web-app-status-bar-style" content="default">
          
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          
          <!-- Vercel Analytics & Speed Insights (disabled with ?notrack=true parameter) -->
          <script>
              // Check if notrack parameter is present in URL
              const urlParams = new URLSearchParams(window.location.search);
              const noTrack = urlParams.get('notrack') === 'true';
              
              if (!noTrack) {
                  // Load Analytics
                  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
                  const analyticsScript = document.createElement('script');
                  analyticsScript.defer = true;
                  analyticsScript.src = 'https://cdn.vercel-insights.com/v1/script.js';
                  document.head.appendChild(analyticsScript);
                  
                  // Load Speed Insights
                  const speedInsightsScript = document.createElement('script');
                  speedInsightsScript.defer = true;
                  speedInsightsScript.src = 'https://cdn.vercel-insights.com/v1/speed-insights/script.js';
                  speedInsightsScript.onload = function() {
                      if (window.si) {
                          window.si('start');
                      }
                  };
                  document.head.appendChild(speedInsightsScript);
              } else {
                  // Block all tracking
                  console.log('🚫 Analytics & Speed Insights tracking disabled via ?notrack=true parameter');
                  
                  // Override analytics functions
                  window.va = function() { 
                      console.log('Analytics call blocked'); 
                  };
                  window.si = function() {
                      console.log('Speed Insights call blocked');
                  };
                  
                  // Block Web Analytics and Speed Insights beacons
                  if (window.navigator && window.navigator.sendBeacon) {
                      const originalSendBeacon = window.navigator.sendBeacon.bind(window.navigator);
                      window.navigator.sendBeacon = function(url, data) {
                          if (url && (url.includes('vercel') || url.includes('analytics') || url.includes('speed-insights'))) {
                              console.log('Blocked Vercel beacon to:', url);
                              return true;
                          }
                          return originalSendBeacon(url, data);
                      };
                  }
              }
          </script>
          
          <style>
              :root {
                  --gold: ${GOLD};
                  /* Type tokens — duplicated from src/templates/home-styles.ts :root
                     because /form is a standalone route with its own inline <style>
                     (no @import from the shared catalog). Keep in sync if the home
                     scale ever changes. */
                  --text-title:   clamp(36px, 5vw, 52px);
                  --text-heading: clamp(20px, 2.5vw, 26px);
                  --text-lead:    clamp(17px, 1.5vw, 20px);
                  --text-body:    16px;
                  --text-small:   14px;
                  --text-label:   12px;
                  --text-eyebrow: 10px;
                  --weight-regular:  400;
                  --weight-medium:   500;
                  --weight-semibold: 600;
                  --weight-bold:     700;
              }
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: linear-gradient(135deg, #faf8f5 0%, #f0ece6 100%);
                  min-height: 100vh;
                  display: flex;
                  flex-direction: column;
              }
              
              .header {
                  background: rgba(255, 255, 255, 0.75);
                  padding: 24px 60px;
                  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
                  backdrop-filter: blur(20px);
              }
              
              .header-content {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  max-width: 1400px;
                  margin: 0 auto;
              }
              
              .logo {
                  display: flex;
                  flex-direction: column;
              }
              
              .logo h1 {
                  font-family: 'Playfair Display', serif;
                  font-size: var(--text-heading);
                  font-weight: var(--weight-bold);
                  color: #1a1a2e;
                  letter-spacing: 3px;
                  text-transform: uppercase;
              }

              .logo span {
                  font-size: var(--text-eyebrow);
                  color: rgba(26, 26, 46, 0.5);
                  letter-spacing: 4px;
                  text-transform: uppercase;
                  font-weight: var(--weight-semibold);
                  margin-top: 2px;
              }

              nav {
                  display: flex;
                  gap: 40px;
                  align-items: center;
              }

              nav a {
                  text-decoration: none;
                  color: #1a1a2e;
                  font-size: var(--text-label);
                  font-weight: var(--weight-bold);
                  letter-spacing: 2px;
                  text-transform: uppercase;
                  transition: opacity 0.3s;
                  opacity: 0.6;
              }
              
              nav a:hover {
                  opacity: 1;
              }
              
              nav a:last-child {
                  background: linear-gradient(135deg, var(--gold) 0%, var(--gold) 100%);
                  color: white;
                  padding: 12px 28px;
                  border-radius: 100px;
                  opacity: 1;
              }
              
              .content {
                  padding: 80px 60px;
                  max-width: 1400px;
                  margin: 0 auto;
                  width: 100%;
              }
              
              h2 {
                  font-family: 'Playfair Display', serif;
                  font-size: var(--text-title);
                  color: #1a1a2e;
                  font-weight: var(--weight-bold);
                  margin-bottom: 48px;
              }
              
              .form-container {
                  background: rgba(255, 255, 255, 0.85);
                  padding: 48px;
                  border-radius: 32px;
                  box-shadow: 0 32px 80px rgba(0,0,0,0.08);
                  max-width: 700px;
                  backdrop-filter: blur(20px);
                  border: 1px solid rgba(255, 255, 255, 0.6);
              }
              
              .form-group {
                  margin-bottom: 28px;
              }
              
              label {
                  display: block;
                  color: #1a1a2e;
                  font-size: var(--text-label);
                  font-weight: var(--weight-bold);
                  margin-bottom: 10px;
                  letter-spacing: 1px;
                  text-transform: uppercase;
              }

              input, textarea, select {
                  width: 100%;
                  padding: 16px 20px;
                  border: 1px solid rgba(26, 26, 46, 0.15);
                  border-radius: 16px;
                  font-size: var(--text-body);
                  font-family: inherit;
                  background: rgba(255, 255, 255, 0.9);
                  transition: all 0.3s;
              }
              
              input:focus, textarea:focus, select:focus {
                  outline: none;
                  border-color: var(--gold);
                  background: white;
                  box-shadow: 0 8px 24px color-mix(in srgb, var(--gold) 15%, transparent);
              }
              
              textarea {
                  min-height: 140px;
                  resize: vertical;
              }
              
              .submit-btn {
                  background: linear-gradient(135deg, var(--gold) 0%, var(--gold) 100%);
                  color: white;
                  padding: 18px 40px;
                  border-radius: 100px;
                  border: none;
                  font-size: var(--text-label);
                  font-weight: var(--weight-bold);
                  letter-spacing: 2px;
                  text-transform: uppercase;
                  cursor: pointer;
                  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                  width: 100%;
                  box-shadow: 0 16px 40px color-mix(in srgb, var(--gold) 35%, transparent);
              }
              
              .submit-btn:hover {
                  transform: translateY(-4px);
                  box-shadow: 0 20px 50px color-mix(in srgb, var(--gold) 45%, transparent);
              }
          </style>
      </head>
      <body>
          <header class="header">
              <div class="header-content">
                  <div class="logo">
                      <h1>MORNING STAR</h1>
                      <span>CHRISTIAN CHURCH</span>
                  </div>
                  <nav>
                      <a href="/#schedule">SCHEDULE</a>
                      <a href="/#about">ABOUT</a>
                      <a href="/#outreach">OUTREACH</a>
                      <a href="/#watch">WATCH</a>
                      <a href="/form">SUBMIT THE FORM</a>
                  </nav>
              </div>
          </header>
          
          <div class="content">
              <h2>Contact Us</h2>
              <div class="form-container">
                  <form>
                      <div class="form-group">
                          <label for="name">Name</label>
                          <input type="text" id="name" name="name" required>
                      </div>
                      
                      <div class="form-group">
                          <label for="email">Email</label>
                          <input type="email" id="email" name="email" required>
                      </div>
                      
                      <div class="form-group">
                          <label for="phone">Phone</label>
                          <input type="tel" id="phone" name="phone">
                      </div>
                      
                      <div class="form-group">
                          <label for="subject">Subject</label>
                          <select id="subject" name="subject" required>
                              <option value="">Select a subject</option>
                              <option value="general">General Inquiry</option>
                              <option value="prayer">Prayer Request</option>
                              <option value="volunteer">Volunteer</option>
                              <option value="other">Other</option>
                          </select>
                      </div>
                      
                      <div class="form-group">
                          <label for="message">Message</label>
                          <textarea id="message" name="message" required></textarea>
                      </div>
                      
                      <button type="submit" class="submit-btn">Submit Form</button>
                  </form>
              </div>
          </div>
      </body>
      </html>
    `)
  })
}
