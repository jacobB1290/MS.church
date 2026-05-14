// Shared <head> template for non-home pages (/about, /outreach, …).
// Home keeps its dedicated home-head.ts with richer LCP preload + FAQ schema.
//
// Each page passes title, description, canonical, optional OG image,
// and optional page-specific JSON-LD. Common boilerplate (geo, theme-color,
// favicon, fonts, analytics, shared CSS) is emitted here so every page
// stays SEO-consistent.

import { homeStyles } from '../home-styles.js'

const DEFAULT_OG_IMAGE = 'https://page.gensparksite.com/v1/base64_upload/2ed08492a85ab5d976704d29fdd46025'

type PageHeadOptions = {
  title: string
  description: string
  canonical: string
  ogImage?: string
  ogImageAlt?: string
  jsonLd?: string
}

export function pageHead({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = 'Morning Star Christian Church building in Boise, Idaho',
  jsonLd,
}: PageHeadOptions): string {
  return `
    <head>
        <meta charset="UTF-8">
        <script>
            /* See home-head.ts for the rationale. Same script. */
            (function(){
                var skip=false;
                if(location.hash) skip=true;
                try{
                    var n=performance.getEntriesByType('navigation')[0];
                    if(n&&(n.type==='back_forward'||n.type==='reload')) skip=true;
                }catch(e){}
                if(document.referrer&&document.referrer.indexOf(location.origin)===0) skip=true;
                if(skip) document.documentElement.classList.add('no-entrance');
                addEventListener('pageshow',function(e){
                    if(e.persisted) document.documentElement.classList.add('no-entrance');
                });
                if(location.hash && location.hash !== '#'){
                    window.__targetHash = location.hash;
                    // Fade-in on hashload (v1.49.3): subpage's <main> paints
                    // at opacity 0 and CSS animates it to 1 concurrent with
                    // the smooth-scroll. Hides the wait-for-settle delay
                    // and any layout shift behind a single coherent motion.
                    // The brand + back are kept steady so chrome stays
                    // anchored. Triggered by setting class synchronously
                    // before first paint so there's no opacity-1 flash.
                    document.documentElement.classList.add('hash-fade');
                    try {
                        history.replaceState(null, '', location.pathname + location.search);
                    } catch(e){}
                }
            })();
        </script>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

        <title>${title}</title>
        <meta name="title" content="${title}">
        <meta name="description" content="${description}">
        <meta name="author" content="Morning Star Christian Church">
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
        <meta name="googlebot" content="index, follow">
        <link rel="canonical" href="${canonical}">

        <!-- Geographic Meta Tags (Local SEO) -->
        <meta name="geo.region" content="US-ID">
        <meta name="geo.placename" content="Boise, Idaho">
        <meta name="geo.position" content="43.6150;-116.2023">
        <meta name="ICBM" content="43.6150, -116.2023">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="${canonical}">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${ogImage}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="${ogImageAlt}">
        <meta property="og:site_name" content="Morning Star Christian Church">
        <meta property="og:locale" content="en_US">

        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="${canonical}">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${description}">
        <meta name="twitter:image" content="${ogImage}">
        <meta name="twitter:image:alt" content="${ogImageAlt}">

        <meta name="theme-color" content="#f8f9fd">
        <meta name="theme-color" content="#f8f9fd" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="#1a1a2e" media="(prefers-color-scheme: dark)">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-title" content="Morning Star Church">
        <meta name="application-name" content="Morning Star Church">
        <meta name="mobile-web-app-capable" content="yes">

        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        <link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

        ${jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : ''}

        <!-- Vercel Analytics & Speed Insights (disabled with ?notrack=true parameter) -->
        <script>
            const urlParams = new URLSearchParams(window.location.search);
            const noTrack = urlParams.get('notrack') === 'true';
            if (!noTrack) {
                window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
                const analyticsScript = document.createElement('script');
                analyticsScript.defer = true;
                analyticsScript.src = 'https://cdn.vercel-insights.com/v1/script.js';
                document.head.appendChild(analyticsScript);
                const speedInsightsScript = document.createElement('script');
                speedInsightsScript.defer = true;
                speedInsightsScript.src = 'https://cdn.vercel-insights.com/v1/speed-insights/script.js';
                speedInsightsScript.onload = function() { if (window.si) window.si('start'); };
                document.head.appendChild(speedInsightsScript);
            } else {
                window.va = function() {};
                window.si = function() {};
            }
        </script>

        <style>${homeStyles()}</style>
    </head>`
}
