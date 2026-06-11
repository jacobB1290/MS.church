// Shared <head> template for non-home pages (/about, /outreach, …).
// Home keeps its dedicated home-head.ts with richer LCP preload + FAQ schema.
//
// Each page passes title, description, canonical, optional OG image,
// and optional page-specific JSON-LD. Common boilerplate (geo, theme-color,
// favicon, fonts, analytics, shared CSS) is emitted here so every page
// stays SEO-consistent.

import { homeStyles } from '../home-styles.js'
import { prefetchSnippet } from './prefetch.js'

const DEFAULT_OG_IMAGE = 'https://ms.church/static/church-building.jpg'

type PageHeadOptions = {
  title: string
  description: string
  canonical: string
  ogImage?: string
  ogImageAlt?: string
  jsonLd?: string
  /** Override the robots directive (e.g. 'noindex, nofollow' for the 404 page). */
  robots?: string
}

export function pageHead({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = 'Morning Star Christian Church building in Boise, Idaho',
  jsonLd,
  robots,
}: PageHeadOptions): string {
  return `
    <head>
        <meta charset="UTF-8">
        <script>
            /* See home-head.ts for the rationale. Same script. */
            (function(){
                var html = document.documentElement;
                var skip=false;
                var isBackForward=false;
                var isReload=false;
                if(location.hash) skip=true;
                try{
                    var n=performance.getEntriesByType('navigation')[0];
                    if(n&&n.type==='back_forward'){ skip=true; isBackForward=true; }
                    if(n&&n.type==='reload'){ skip=true; isReload=true; }
                }catch(e){}
                if(document.referrer&&document.referrer.indexOf(location.origin)===0) skip=true;
                if(skip) html.classList.add('no-entrance');
                if (isBackForward) html.classList.add('nav-back-forward');
                // Manual scroll restoration so the view-transition snapshot
                // is taken at the correct scroll position. See home-head.ts
                // for the full rationale.
                try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
                function scrollKey(){ return 'mscb:sc:' + location.pathname + location.search; }
                addEventListener('pagehide', function(){
                    try { sessionStorage.setItem(scrollKey(), String(window.pageYOffset||0)); } catch (e) {}
                });
                function restoreScroll(){
                    try {
                        var v = sessionStorage.getItem(scrollKey());
                        if (v && Number(v) > 0) window.scrollTo(0, Number(v));
                    } catch (e) {}
                }
                // Restore on back/forward AND on reload — both are cases
                // where the user expects to land at their previous scroll
                // position. Manual scrollRestoration above means the browser
                // won't restore for us on reload, so we have to.
                addEventListener('pagereveal', function(){
                    if (isBackForward || isReload) restoreScroll();
                });
                addEventListener('pageshow', function(e){
                    if (isBackForward || isReload || e.persisted) restoreScroll();
                });
                // Tag js-reveals synchronously so reveal hiding CSS lands
                // before first paint (no FOUC).
                html.classList.add('js-reveals');
                addEventListener('pageshow',function(e){
                    if(e.persisted) html.classList.add('no-entrance');
                });
                if(location.hash && location.hash !== '#'){
                    window.__targetHash = location.hash;
                    // v1.49.4: paint main invisible + 16px below final
                    // before first paint. subpage-header will do an
                    // instant scrollTo + add .hash-fade-in to trigger
                    // the CSS transition (opacity 0→1, translateY 16→0
                    // over ~800ms with easeOut). Safety-net timeout
                    // guarantees the page becomes visible within 2.5s
                    // even if the subpage-header script fails to run.
                    html.classList.add('hash-fade');
                    setTimeout(function() {
                        html.classList.add('hash-fade-in');
                    }, 2500);
                    try {
                        history.replaceState(null, '', location.pathname + location.search);
                    } catch(e){}
                }
                // Watchdog — recovery only, see home-head.ts for the
                // rationale. The reveal observer cancels this timer
                // once initialized so under normal conditions it
                // never fires.
                window.__revealWatchdogTimer = setTimeout(function(){
                    var sel='.reveal,.reveal-scale,.reveal-eyebrow,.reveal-rise,.reveal-rise-slow,.reveal-tight,.reveal-from-left,.reveal-from-right,.reveal-from-above,.reveal-photo,.reveal-power,.reveal-pop,.reveal-fill';
                    document.querySelectorAll(sel).forEach(function(el){ el.classList.add('is-revealed'); });
                }, 12000);
            })();
        </script>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

        <title>${title}</title>
        <meta name="title" content="${title}">
        <meta name="description" content="${description}">
        <meta name="author" content="Morning Star Christian Church">
        <meta name="robots" content="${robots ?? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}">
        <meta name="googlebot" content="${robots ?? 'index, follow'}">
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
        <meta property="og:image:width" content="1920">
        <meta property="og:image:height" content="1038">
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

        <!-- Matches --bg (#faf8f5) so the Safari status bar tints warm like the page,
             not the cool blue-white left over from the pre-V2 palette. -->
        <meta name="theme-color" content="#faf8f5">
        <meta name="theme-color" content="#faf8f5" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="#1a1a2e" media="(prefers-color-scheme: dark)">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-title" content="Morning Star Church">
        <meta name="application-name" content="Morning Star Church">
        <meta name="mobile-web-app-capable" content="yes">

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon-32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon-16.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png">
        <link rel="manifest" href="/site.webmanifest">
        <link rel="alternate" type="application/rss+xml" title="Morning Star Christian Church · Events &amp; News" href="/feed.xml">

        <!-- Self-hosted fonts — see home-head.ts and home-styles.ts. -->
        <link rel="preload" as="font" type="font/woff2" href="/static/fonts/inter-400.woff2" crossorigin>
        <link rel="preload" as="font" type="font/woff2" href="/static/fonts/playfair-display-700.woff2" crossorigin>
        <style>
            @font-face {
                font-family: 'Playfair Display Fallback';
                src: local('Georgia'), local('Times New Roman');
                size-adjust: 106%;
                ascent-override: 99%;
                descent-override: 25%;
                line-gap-override: 0%;
            }
            @font-face {
                font-family: 'Inter Fallback';
                src: local('-apple-system'), local('BlinkMacSystemFont'), local('Segoe UI'), local('Arial');
                size-adjust: 107%;
                ascent-override: 90%;
                descent-override: 22%;
                line-gap-override: 0%;
            }
        </style>

        ${jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : ''}
${prefetchSnippet()}

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
