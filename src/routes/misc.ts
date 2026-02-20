import { type Hono } from 'hono'

export function registerMiscRoutes(app: Hono) {
  app.get('/robots.txt', (c) => {
    return c.text(`# robots.txt for Morning Star Christian Church
  # https://ms.church
  
  User-agent: *
  Allow: /
  
  # Main pages
  Allow: /
  Allow: /privacy
  Allow: /form
  
  # Sitemap location
  Sitemap: https://ms.church/sitemap.xml
  
  # Crawl-delay (be polite to our server)
  Crawl-delay: 1
  
  # Block common bot paths that don't apply
  Disallow: /api/
  Disallow: /static/
  Disallow: /*.json$
  
  # Google-specific
  User-agent: Googlebot
  Allow: /
  Crawl-delay: 0
  
  # Bing-specific  
  User-agent: Bingbot
  Allow: /
  Crawl-delay: 1
  `);
  });
  
  // SEO: sitemap.xml
  app.get('/sitemap.xml', (c) => {
    const today = new Date().toISOString().split('T')[0];
    return c.text(`<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
      
      <!-- Homepage - highest priority -->
      <url>
          <loc>https://ms.church/</loc>
          <lastmod>${today}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>1.0</priority>
      </url>
      
      <!-- Contact section (anchor on homepage) -->
      <url>
          <loc>https://ms.church/#contact</loc>
          <lastmod>${today}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.9</priority>
      </url>
      
      <!-- Outreach section (anchor on homepage) -->
      <url>
          <loc>https://ms.church/#outreach</loc>
          <lastmod>${today}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
      </url>
      
      <!-- Watch section (anchor on homepage) -->
      <url>
          <loc>https://ms.church/#watch</loc>
          <lastmod>${today}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
      </url>
      
      <!-- Legal/Privacy page -->
      <url>
          <loc>https://ms.church/privacy</loc>
          <lastmod>${today}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.5</priority>
      </url>
      
      <!-- Privacy Policy section -->
      <url>
          <loc>https://ms.church/privacy#privacy</loc>
          <lastmod>${today}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.4</priority>
      </url>
      
      <!-- Terms of Service section -->
      <url>
          <loc>https://ms.church/privacy#terms</loc>
          <lastmod>${today}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.4</priority>
      </url>
      
      <!-- Accessibility section -->
      <url>
          <loc>https://ms.church/privacy#accessibility</loc>
          <lastmod>${today}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.4</priority>
      </url>
      
      <!-- Standalone contact form page -->
      <url>
          <loc>https://ms.church/form</loc>
          <lastmod>${today}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.7</priority>
      </url>
      
  </urlset>`, 200, {
      'Content-Type': 'application/xml; charset=utf-8'
    });
  });
  
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
          <meta name="theme-color" content="#f8f9fd">
          <meta name="apple-mobile-web-app-status-bar-style" content="default">
          
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;7&display=swap" rel="stylesheet">
          
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
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: linear-gradient(135deg, #f8f9fd 0%, #e9ecf5 100%);
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
                  font-size: 22px;
                  font-weight: 700;
                  color: #1a1a2e;
                  letter-spacing: 3px;
                  text-transform: uppercase;
              }
              
              .logo span {
                  font-size: 11px;
                  color: rgba(26, 26, 46, 0.5);
                  letter-spacing: 4px;
                  text-transform: uppercase;
                  font-weight: 600;
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
                  font-size: 12px;
                  font-weight: 700;
                  letter-spacing: 2px;
                  text-transform: uppercase;
                  transition: opacity 0.3s;
                  opacity: 0.6;
              }
              
              nav a:hover {
                  opacity: 1;
              }
              
              nav a:last-child {
                  background: linear-gradient(135deg, #d4a574 0%, #c89860 100%);
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
                  font-size: 52px;
                  color: #1a1a2e;
                  font-weight: 700;
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
                  font-size: 13px;
                  font-weight: 700;
                  margin-bottom: 10px;
                  letter-spacing: 1px;
                  text-transform: uppercase;
              }
              
              input, textarea, select {
                  width: 100%;
                  padding: 16px 20px;
                  border: 1px solid rgba(26, 26, 46, 0.15);
                  border-radius: 16px;
                  font-size: 16px;
                  font-family: inherit;
                  background: rgba(255, 255, 255, 0.9);
                  transition: all 0.3s;
              }
              
              input:focus, textarea:focus, select:focus {
                  outline: none;
                  border-color: #d4a574;
                  background: white;
                  box-shadow: 0 8px 24px rgba(212, 165, 116, 0.15);
              }
              
              textarea {
                  min-height: 140px;
                  resize: vertical;
              }
              
              .submit-btn {
                  background: linear-gradient(135deg, #d4a574 0%, #c89860 100%);
                  color: white;
                  padding: 18px 40px;
                  border-radius: 100px;
                  border: none;
                  font-size: 12px;
                  font-weight: 700;
                  letter-spacing: 2px;
                  text-transform: uppercase;
                  cursor: pointer;
                  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                  width: 100%;
                  box-shadow: 0 16px 40px rgba(200, 152, 96, 0.35);
              }
              
              .submit-btn:hover {
                  transform: translateY(-4px);
                  box-shadow: 0 20px 50px rgba(200, 152, 96, 0.45);
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
                      <a href="/#home">HOME</a>
                      <a href="/#schedule">SCHEDULE</a>
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
