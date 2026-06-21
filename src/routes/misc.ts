import { type Hono } from 'hono'
import { GOLD } from '../design-tokens.js'
import { fetchCalendarEvents } from './calendar.js'
import { contactTopicsClientJson } from '../contact-topics.js'

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
    const SITE_LASTMOD = '2026-06-11'
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
            loc: `${base}/static/worship-desktop.jpg?v=3`,
            title: 'Sunday worship teaching at Morning Star Christian Church',
            caption: 'Pastor teaching from the pulpit at the 9 AM Sunday service at Morning Star Christian Church in Boise, Idaho — Bible-grounded, nondenominational worship.',
          },
          {
            loc: `${base}/static/worship.jpg?v=3`,
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
          loc: `${base}/static/cooking-ministry.jpg?v=3`,
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

  // /llms.txt — curated, plain-language index of the site for AI answer
  // engines (Perplexity confirms it reads this; Anthropic respects it in
  // retrieval). Low-confidence ranking benefit and Google ignores it, but
  // it is trivial to maintain and complements the robots.txt AI-crawler
  // allow-list. Every URL and fact here is real — no placeholders.
  app.get('/llms.txt', (c) => {
    c.header('Content-Type', 'text/plain; charset=utf-8')
    c.header('Cache-Control', 'public, max-age=86400')
    return c.text(`# Morning Star Christian Church

> A welcoming, Bible-believing nondenominational Christian church in Boise, Idaho. Sunday worship at 9:00 AM at 3080 Wildwood St, with a free community breakfast after the service, weekday Bible studies, a Friday youth service, and community outreach. Mission: Mending the Broken.

## Pages
- [Home](https://ms.church/): Service times, weekly schedule, outreach, and how to watch the Sunday service online.
- [About](https://ms.church/about): The church's mission ("Mending the Broken"), story, and what to expect.
- [Plan Your Visit](https://ms.church/visit): First-time visitor guide — directions, parking, what to expect, and the Sunday service flow.
- [Ministries](https://ms.church/ministries): Sunday worship, Bible study, Bible reading, Activity Day, Youth service, and kids' Sunday School.
- [Outreach](https://ms.church/outreach): Monthly homeless-shelter cooking, the free Sunday community breakfast, and seasonal community events.
- [Statement of Beliefs](https://ms.church/beliefs): The church's eleven core doctrinal convictions, each with scripture.
- [Contact](https://ms.church/form): Submit a prayer request, ask a question, or get connected.

## Key facts
- Address: 3080 Wildwood St, Boise, ID 83713 (West Boise, Five Mile and Ustick area)
- Sunday worship: 9:00 AM, followed by a free community breakfast open to all
- Tuesday Bible reading: 8:30 AM at Caffeina State Street
- Wednesday Activity Day: 6:00 PM (open gym and crochet circle, all ages)
- Thursday Bible study: 6:00 PM at the church
- Friday Youth Service: 7:00 PM (ages 15 and up)
- Denomination: nondenominational, Bible-believing
- Email: support@ms.church
- Watch live and past services: https://www.youtube.com/@morningstarboise
`)
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
    const formJsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ContactPage',
          '@id': 'https://ms.church/form#page',
          url: 'https://ms.church/form',
          name: 'Contact Morning Star Christian Church',
          description:
            'Contact Morning Star Christian Church in Boise, Idaho — submit a prayer request, ask a question, or get connected with our community.',
          isPartOf: { '@id': 'https://ms.church/#website' },
          about: { '@id': 'https://ms.church/#church' },
          inLanguage: 'en-US',
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ms.church/' },
            { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://ms.church/form' },
          ],
        },
      ],
    })
    // Static funnel page — cache at the edge like the other subpages.
    c.header('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400')
    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">

          <!-- Primary Meta Tags -->
          <title>Contact Us · Morning Star Christian Church, Boise</title>
          <meta name="title" content="Contact Us · Morning Star Christian Church, Boise">
          <meta name="description" content="Get in touch with Morning Star Christian Church in Boise, Idaho. Submit a prayer request, ask questions, or connect with our community. We'd love to hear from you!">
          <meta name="author" content="Morning Star Christian Church">
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
          <meta name="googlebot" content="index, follow">
          <link rel="canonical" href="https://ms.church/form">

          <!-- Geographic Meta Tags (Local SEO) -->
          <meta name="geo.region" content="US-ID">
          <meta name="geo.placename" content="Boise, Idaho">
          <meta name="geo.position" content="43.6150;-116.2023">
          <meta name="ICBM" content="43.6150, -116.2023">
          
          <!-- Open Graph / Facebook -->
          <meta property="og:type" content="website">
          <meta property="og:url" content="https://ms.church/form">
          <meta property="og:title" content="Contact Us · Morning Star Christian Church">
          <meta property="og:description" content="Get in touch with Morning Star Christian Church in Boise, Idaho. Submit a prayer request or connect with our community.">
          <meta property="og:image" content="https://ms.church/static/church-building.jpg">
          <meta property="og:image:alt" content="Morning Star Christian Church building in Boise, Idaho">
          <meta property="og:site_name" content="Morning Star Christian Church">
          <meta property="og:locale" content="en_US">

          <!-- Twitter -->
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:url" content="https://ms.church/form">
          <meta name="twitter:title" content="Contact Us · Morning Star Christian Church">
          <meta name="twitter:description" content="Get in touch with Morning Star Christian Church in Boise, Idaho. Submit a prayer request or connect with our community.">
          <meta name="twitter:image" content="https://ms.church/static/church-building.jpg">
          <meta name="twitter:image:alt" content="Morning Star Christian Church building in Boise, Idaho">

          <!-- Safari iOS theme-color for status bar and tab bar background -->
          <meta name="theme-color" content="#faf8f5">
          <meta name="apple-mobile-web-app-status-bar-style" content="default">

          <!-- Favicon / manifest / feed parity with the rest of the site -->
          <link rel="icon" href="/favicon.ico" sizes="any">
          <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon-32.png">
          <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon-16.png">
          <link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png">
          <link rel="manifest" href="/site.webmanifest">
          <link rel="alternate" type="application/rss+xml" title="Morning Star Christian Church · Events &amp; News" href="/feed.xml">

          <!-- Structured data — ContactPage + breadcrumb (built above) -->
          <script type="application/ld+json">${formJsonLd}</script>

          <!-- Self-hosted fonts — same files the rest of the site uses
               (see home-styles.ts). Replaces the old Google Fonts link so
               /form matches the site's font pipeline (no third-party CSS). -->
          <link rel="preload" as="font" type="font/woff2" href="/static/fonts/inter-400.woff2" crossorigin>
          <link rel="preload" as="font" type="font/woff2" href="/static/fonts/playfair-display-700.woff2" crossorigin>
          <style>
              @font-face { font-family: 'Inter'; font-style: normal; font-weight: 400; font-display: swap; src: url('/static/fonts/inter-400.woff2') format('woff2'); }
              @font-face { font-family: 'Inter'; font-style: normal; font-weight: 500; font-display: swap; src: url('/static/fonts/inter-500.woff2') format('woff2'); }
              @font-face { font-family: 'Inter'; font-style: normal; font-weight: 600; font-display: swap; src: url('/static/fonts/inter-600.woff2') format('woff2'); }
              @font-face { font-family: 'Inter'; font-style: normal; font-weight: 700; font-display: swap; src: url('/static/fonts/inter-700.woff2') format('woff2'); }
              @font-face { font-family: 'Playfair Display'; font-style: normal; font-weight: 700; font-display: swap; src: url('/static/fonts/playfair-display-700.woff2') format('woff2'); }
          </style>

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
                  --gold-dark:   color-mix(in srgb, var(--gold) 70%, black);
                  --gold-deeper: color-mix(in srgb, var(--gold) 55%, black);
                  /* Tokens — duplicated from src/templates/home-styles.ts :root
                     because /form is a standalone route with its own inline <style>
                     (no @import from the shared catalog). Keep in sync if the home
                     scale ever changes. */
                  --surface: #fdfcfa;
                  --white:   #fefdfb;
                  --text-primary:       #1a1a2e;
                  --text-primary-soft:  rgba(26, 26, 46, 0.85);
                  --text-primary-faint: rgba(26, 26, 46, 0.55);
                  --font-body:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
                  --radius-sm:   8px;
                  --radius-pill: 100px;
                  --tracking-wide: 0.12em;
                  --motion-fast:   0.2s;
                  --motion-medium: 0.3s;
                  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
                  --btn-cta-bg:           linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
                  --btn-cta-bg-hover:     linear-gradient(135deg, var(--gold-dark) 0%, var(--gold-deeper) 100%);
                  --btn-cta-shadow:       0 6px 20px color-mix(in srgb, var(--gold) 35%, transparent);
                  --btn-cta-shadow-hover: 0 10px 28px color-mix(in srgb, var(--gold) 45%, transparent);
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
                  background: var(--btn-cta-bg);
                  color: white;
                  padding: 12px 28px;
                  border-radius: 100px;
                  opacity: 1;
                  white-space: nowrap;
              }

              .content {
                  padding: clamp(40px, 8vw, 80px) clamp(20px, 5vw, 60px);
                  max-width: 1400px;
                  margin: 0 auto;
                  width: 100%;
              }

              /* The header was desktop-only (fixed 60px padding + 40px nav
                 gaps) and overflowed the layout viewport on phones, which
                 squeezed the form card to half width. The page is a focused
                 funnel — on small screens show only the wordmark. */
              @media (max-width: 760px) {
                  .header {
                      padding: 18px 20px;
                  }
                  nav {
                      display: none;
                  }
              }
              
              h2 {
                  font-family: 'Playfair Display', serif;
                  font-size: var(--text-title);
                  color: #1a1a2e;
                  font-weight: var(--weight-bold);
                  margin-bottom: 48px;
              }

              /* Per-CTA "subject" banner — shown when /form is opened with a
                 ?topic= (e.g. from "Join the next cook"). Flat editorial gold
                 left rule + label; only opacity + transform animate. */
              .contact-topic-banner {
                  display: flex;
                  align-items: baseline;
                  flex-wrap: wrap;
                  column-gap: 12px;
                  row-gap: 4px;
                  margin: 0 0 20px;
                  padding-left: 16px;
                  border-left: 2px solid var(--gold);
                  opacity: 0;
                  transform: translateY(6px);
                  transition: opacity var(--motion-medium) var(--ease-standard),
                              transform var(--motion-medium) var(--ease-standard);
              }
              .contact-topic-banner.is-visible {
                  opacity: 1;
                  transform: translateY(0);
              }
              .contact-topic-banner-label {
                  flex: none;
                  font-family: var(--font-body);
                  font-size: var(--text-eyebrow);
                  font-weight: var(--weight-semibold);
                  letter-spacing: 0.25em;
                  text-transform: uppercase;
                  color: var(--gold-dark);
                  line-height: 1.2;
              }
              .contact-topic-banner-text {
                  font-family: 'Playfair Display', serif;
                  font-size: var(--text-lead);
                  font-weight: var(--weight-medium);
                  color: var(--text-primary);
                  line-height: 1.3;
              }
              @media (prefers-reduced-motion: reduce) {
                  .contact-topic-banner {
                      transition: none;
                      transform: none;
                  }
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
                  color: var(--text-primary-soft);
                  font-size: var(--text-small);
                  font-weight: var(--weight-semibold);
                  margin-bottom: 8px;
                  letter-spacing: normal;
                  text-transform: none;
              }

              input, textarea, select {
                  width: 100%;
                  padding: 14px 16px;
                  border: 1px solid color-mix(in srgb, var(--text-primary) 20%, transparent);
                  border-radius: var(--radius-sm);
                  font-size: var(--text-body);
                  font-family: var(--font-body);
                  color: var(--text-primary);
                  background: var(--surface);
                  transition: border-color var(--motion-fast) var(--ease-standard),
                              box-shadow var(--motion-fast) var(--ease-standard),
                              background var(--motion-fast) var(--ease-standard);
              }

              input::placeholder, textarea::placeholder {
                  color: var(--text-primary-faint);
              }

              input:focus, textarea:focus, select:focus {
                  outline: none;
                  border-color: var(--gold);
                  background: var(--white);
                  box-shadow: 0 0 0 4px color-mix(in srgb, var(--gold) 14%, transparent);
              }

              input:-webkit-autofill,
              input:-webkit-autofill:hover,
              input:-webkit-autofill:focus {
                  -webkit-text-fill-color: var(--text-primary);
                  -webkit-box-shadow: 0 0 0 1000px var(--white) inset;
              }

              textarea {
                  min-height: 132px;
                  resize: vertical;
                  line-height: 1.6;
              }

              .submit-btn {
                  background: var(--btn-cta-bg);
                  color: #fff;
                  padding: 15px 40px;
                  border-radius: var(--radius-pill);
                  border: none;
                  font-family: var(--font-body);
                  font-size: var(--text-small);
                  font-weight: var(--weight-bold);
                  letter-spacing: var(--tracking-wide);
                  text-transform: uppercase;
                  cursor: pointer;
                  transition: transform var(--motion-medium) var(--ease-standard),
                              box-shadow var(--motion-medium) var(--ease-standard),
                              background var(--motion-medium) var(--ease-standard);
                  box-shadow: var(--btn-cta-shadow);
              }

              .submit-btn:hover {
                  transform: translateY(-2px);
                  background: var(--btn-cta-bg-hover);
                  box-shadow: var(--btn-cta-shadow-hover);
              }

              .form-check {
                  display: flex;
                  align-items: flex-start;
                  gap: 12px;
                  margin-bottom: 20px;
                  font-size: var(--text-small);
                  line-height: 1.5;
                  color: rgba(26, 26, 46, 0.7);
                  text-transform: none;
                  letter-spacing: normal;
                  font-weight: var(--weight-regular);
                  cursor: pointer;
              }

              .form-check input[type="checkbox"] {
                  width: 22px;
                  height: 22px;
                  flex: 0 0 auto;
                  margin-top: 1px;
                  padding: 0;
                  border: 1px solid rgba(26, 26, 46, 0.25);
                  border-radius: 6px;
                  accent-color: var(--gold);
                  cursor: pointer;
                  -webkit-appearance: auto;
                  appearance: auto;
              }

              .form-check a { color: var(--gold); }

              .form-error {
                  margin: 0 0 16px;
                  font-size: var(--text-small);
                  font-weight: var(--weight-medium);
                  color: #b3261e;
              }

              .form-success-msg {
                  max-width: 700px;
                  background: rgba(255, 255, 255, 0.85);
                  padding: 64px 48px;
                  border-radius: 32px;
                  box-shadow: 0 32px 80px rgba(0,0,0,0.08);
                  border: 1px solid rgba(255, 255, 255, 0.6);
                  backdrop-filter: blur(20px);
                  text-align: center;
              }

              .form-success-msg .success-icon svg { width: 56px; height: 56px; filter: drop-shadow(0 2px 8px color-mix(in srgb, var(--gold) 30%, transparent)); }

              .form-success-msg h3 {
                  font-family: 'Playfair Display', serif;
                  font-size: var(--text-title);
                  color: #1a1a2e;
                  font-weight: var(--weight-bold);
                  margin: 16px 0 12px;
              }

              .form-success-msg p {
                  font-size: var(--text-lead);
                  color: rgba(26, 26, 46, 0.6);
                  line-height: 1.6;
              }

              /* Mobile — the desktop header nav doesn't wrap, which forced the
                 document wider than the viewport (horizontal overflow). Stack
                 the header, let the nav wrap, and shrink the fixed 60px gutters
                 so the page fits a phone with no sideways scroll. */
              @media (max-width: 700px) {
                  .header { padding: 18px 20px; }
                  .header-content { flex-direction: column; align-items: flex-start; gap: 14px; }
                  nav { gap: 16px 20px; flex-wrap: wrap; }
                  nav a { font-size: 11px; letter-spacing: 1.5px; }
                  nav a:last-child { padding: 10px 22px; }
                  .content { padding: 40px 20px; }
                  h2 { margin-bottom: 28px; }
                  .form-container, .form-success-msg { max-width: 100%; padding: 28px 22px; }
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
              <p class="contact-topic-banner" id="contact-topic-banner" hidden>
                  <span class="contact-topic-banner-label">Regarding</span>
                  <span class="contact-topic-banner-text" id="contact-topic-headline"></span>
              </p>
              <h2>Get in touch.</h2>
              <div class="form-container" id="form-card">
                  <form id="contact-form-el" novalidate>
                      <div class="form-group">
                          <label for="cf-first">First name</label>
                          <input type="text" id="cf-first" name="firstName" autocomplete="given-name" required aria-required="true">
                      </div>

                      <div class="form-group">
                          <label for="cf-last">Last name</label>
                          <input type="text" id="cf-last" name="lastName" autocomplete="family-name" required aria-required="true">
                      </div>

                      <div class="form-group">
                          <label for="cf-phone">Phone number</label>
                          <input type="tel" id="cf-phone" name="phone" autocomplete="tel" placeholder="(208) 000-0000" required aria-required="true">
                      </div>

                      <div class="form-group">
                          <label for="cf-email">Email address</label>
                          <input type="email" id="cf-email" name="email" autocomplete="email" placeholder="you@example.com" required aria-required="true">
                      </div>

                      <div class="form-group">
                          <label for="cf-message">Your question, prayer request, or message</label>
                          <textarea id="cf-message" name="message" required aria-required="true"></textarea>
                      </div>

                      <label class="form-check">
                          <input type="checkbox" name="updatesOptIn" id="cf-updates">
                          <span>I agree to receive church updates by email and text message from Morning Star Christian Church at the contact info I provide. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help.</span>
                      </label>

                      <label class="form-check">
                          <input type="checkbox" name="termsAccepted" id="cf-terms" required>
                          <span>I agree to the <a href="/privacy" target="_blank" rel="noopener">terms &amp; conditions</a>.</span>
                      </label>

                      <p class="form-error" id="cf-error" role="alert" hidden></p>

                      <button type="submit" class="submit-btn" id="cf-submit">Submit Form</button>
                  </form>
              </div>

              <div class="form-success-msg" id="form-success" hidden>
                  <div class="success-icon"><svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M40 8 L44 32 L68 28 L48 40 L68 52 L44 48 L40 72 L36 48 L12 52 L32 40 L12 28 L36 32 Z" fill="url(#successGoldGrad)" opacity="0.9"/><defs><linearGradient id="successGoldGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="var(--gold)"/><stop offset="100%" stop-color="var(--gold-dark)"/></linearGradient></defs></svg></div>
                  <h3>Thank you.</h3>
                  <p>Thanks for reaching out. Someone from our team will get back to you soon.</p>
              </div>
          </div>

          <script type="application/json" id="contact-topics">${contactTopicsClientJson()}</script>
          <script>
              (function () {
                  const form = document.getElementById('contact-form-el');
                  if (!form) return;
                  const submitBtn = document.getElementById('cf-submit');
                  const errorEl = document.getElementById('cf-error');
                  const card = document.getElementById('form-card');
                  const success = document.getElementById('form-success');
                  const showError = (msg) => { if (errorEl) { errorEl.textContent = msg; errorEl.hidden = false; } };

                  // Per-CTA topic: when /form is opened with ?topic=<slug>, show the
                  // tailored "subject" banner + prompt and send the slug to the CRM.
                  let activeTopicSlug = '';
                  try {
                      const rawSlug = new URLSearchParams(location.search).get('topic');
                      if (rawSlug) {
                          let topics = {};
                          const dataEl = document.getElementById('contact-topics');
                          if (dataEl) { try { topics = JSON.parse(dataEl.textContent || '{}'); } catch (_) {} }
                          const slug = rawSlug.toLowerCase();
                          const t = topics[slug];
                          if (t) {
                              activeTopicSlug = slug;
                              const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                              const headlineEl = document.getElementById('contact-topic-headline');
                              const bannerEl = document.getElementById('contact-topic-banner');
                              const msgEl = document.getElementById('cf-message');
                              if (headlineEl) headlineEl.textContent = t.headline;
                              if (msgEl && t.placeholder) msgEl.setAttribute('placeholder', t.placeholder);
                              if (bannerEl) {
                                  bannerEl.hidden = false;
                                  if (reduceMotion) { bannerEl.classList.add('is-visible'); }
                                  else { requestAnimationFrame(() => requestAnimationFrame(() => bannerEl.classList.add('is-visible'))); }
                              }
                          }
                      }
                  } catch (_) {}

                  form.addEventListener('submit', async (e) => {
                      e.preventDefault();
                      if (errorEl) errorEl.hidden = true;

                      const data = {
                          firstName: form.firstName.value,
                          lastName: form.lastName.value,
                          phone: form.phone.value,
                          email: form.email.value,
                          message: form.message.value,
                          updatesOptIn: form.updatesOptIn.checked,
                          termsAccepted: form.termsAccepted.checked,
                          sourcePage: '/form',
                          topic: activeTopicSlug || undefined
                      };

                      if (!data.firstName.trim()) { showError('Please enter your first name.'); form.firstName.focus(); return; }
                      if (!data.lastName.trim()) { showError('Please enter your last name.'); form.lastName.focus(); return; }
                      if (!data.phone.trim()) { showError('Please enter your phone number.'); form.phone.focus(); return; }
                      if (!data.email.trim()) { showError('Please enter your email address.'); form.email.focus(); return; }
                      if (!form.email.checkValidity()) { showError('Please enter a valid email address.'); form.email.focus(); return; }
                      if (!data.message.trim()) { showError('Please enter your message.'); form.message.focus(); return; }
                      if (!data.termsAccepted) { showError('Please agree to the terms & conditions.'); return; }

                      const original = submitBtn ? submitBtn.textContent : '';
                      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

                      let ok = false;
                      try {
                          const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
                          ok = res.ok;
                          if (!ok) { const payload = await res.json().catch(() => null); showError((payload && payload.error) || 'Something went wrong. Please try again.'); }
                      } catch (_) { showError('Network error. Please try again.'); }

                      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = original; }
                      if (ok && card && success) { card.hidden = true; success.hidden = false; success.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                  });
              })();
          </script>
      </body>
      </html>
    `)
  })
}
