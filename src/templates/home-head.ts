import { homeStyles } from './home-styles.js'
import { prefetchSnippet } from './shared/prefetch.js'

function getNextSundayISO(): { start: string; end: string } {
    const now = new Date()
    const day = now.getUTCDay() // 0 = Sunday
    const daysUntilSunday = day === 0 ? 7 : 7 - day // always next Sunday, not today
    const next = new Date(now)
    next.setUTCDate(next.getUTCDate() + daysUntilSunday)
    const yyyy = next.getUTCFullYear()
    const mm = String(next.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(next.getUTCDate()).padStart(2, '0')
    // America/Boise: MST = -07:00 (Nov–Mar), MDT = -06:00 (Mar–Nov)
    // Approximate: DST runs second Sunday of March through first Sunday of November
    const month = next.getUTCMonth() // 0-indexed
    const dateNum = next.getUTCDate()
    // Find second Sunday of March and first Sunday of November for this year
    const marchFirst = new Date(yyyy, 2, 1)
    const marchSecondSun = 14 - marchFirst.getDay() || 14 // second Sunday
    const novFirst = new Date(yyyy, 10, 1)
    const novFirstSun = novFirst.getDay() === 0 ? 1 : 8 - novFirst.getDay()
    const isDST = (month > 2 && month < 10) ||
        (month === 2 && dateNum >= marchSecondSun) ||
        (month === 10 && dateNum < novFirstSun)
    const offset = isDST ? '-06:00' : '-07:00'
    return {
        start: `${yyyy}-${mm}-${dd}T09:00:00${offset}`,
        end: `${yyyy}-${mm}-${dd}T11:00:00${offset}`
    }
}

export const homeHead = (): string => {
    const nextSunday = getNextSundayISO()
    return `
    <head>
        <meta charset="UTF-8">
        <script>
            /* Synchronously, before any layout (v1.49.24):
               1) Skip section entrance animation on non-fresh visits
                  (back/forward, refresh, same-origin nav, bfcache,
                  hash-load) by tagging <html class="no-entrance">.
               2) Tag <html class="js-reveals"> synchronously so the
                  CSS that hides .reveal-* elements lands BEFORE first
                  paint. Without this, the elements paint at opacity 1,
                  then the DOMContentLoaded handler adds .js-reveals
                  and they snap to opacity 0, then the IntersectionObserver
                  animates them back in — that's the "page jumps to a
                  new frame after the fade" the user reported.
               3) Stash + strip the URL hash so the browser doesn't do
                  its native scroll-to-fragment. We re-scroll smoothly
                  and put the hash back once layout is stable.
               4) Safety net: if JS fails to fire the reveal observer
                  within 4s, force .reveal-* elements visible so the
                  page is never permanently invisible.
            */
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
                // Manual scroll restoration so the view-transition snapshot
                // is taken at the correct scroll position. With default
                // 'auto' restoration on cross-doc @view-transition, the
                // browser captures the new-page snapshot at scrollY=0
                // BEFORE its restoration kicks in, then the fade plays
                // against that scrolled-to-top snapshot, and the live DOM
                // finally shows at the saved scroll position — user sees
                // "hero first, then jump" (the v1.49.25 complaint).
                // 'manual' + pagereveal-driven scrollTo gives us the timing
                // we need: scroll is set BEFORE snapshot, so the fade plays
                // at the correct position and no jump occurs.
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
                // pagereveal fires BEFORE the cross-doc view-transition
                // snapshot is captured (Chrome 124+, iOS Safari 18+) —
                // this is the only event hook that lets us seed the right
                // scroll position into the snapshot.
                // Restore on back/forward AND on reload — both are cases
                // where the user expects to land at their previous scroll
                // position (and our manual scrollRestoration setting above
                // means the browser won't restore for us on reload either).
                addEventListener('pagereveal', function(){
                    if (isBackForward || isReload) restoreScroll();
                });
                // Fallback for browsers without pagereveal: restore on
                // pageshow (fires after the transition; jump may be
                // visible but at least the page lands at the right spot).
                addEventListener('pageshow', function(e){
                    if (isBackForward || isReload || e.persisted) restoreScroll();
                });
                // Always tag js-reveals synchronously so the hidden-state
                // CSS rule applies on first paint. The observer adds
                // .is-revealed; the .no-entrance CSS bypass treats every
                // reveal as already-revealed for non-fresh visits.
                html.classList.add('js-reveals');
                addEventListener('pageshow',function(e){
                    if(e.persisted) html.classList.add('no-entrance');
                });
                if(location.hash && location.hash !== '#'){
                    window.__targetHash = location.hash;
                    try {
                        history.replaceState(null, '', location.pathname + location.search);
                    } catch(e){}
                }
                // Watchdog — if the reveal observer NEVER fires (JS
                // error, very slow device), force every reveal element
                // visible after 12s so the page is recoverable. The
                // reveal observer setup cancels this timer once it
                // initializes, so under normal conditions it never
                // runs — reveals only fire when scrolled into view.
                // Bug fix (v1.49.30): previously fired unconditionally
                // at 4s, which marked every reveal below-the-fold as
                // already-revealed before the user could scroll there
                // — the elements past About finished their transitions
                // off-screen and looked static when finally seen.
                window.__revealWatchdogTimer = setTimeout(function(){
                    var sel='.reveal,.reveal-scale,.reveal-eyebrow,.reveal-rise,.reveal-rise-slow,.reveal-tight,.reveal-from-left,.reveal-from-right,.reveal-from-above,.reveal-photo,.reveal-power,.reveal-pop,.reveal-fill';
                    document.querySelectorAll(sel).forEach(function(el){ el.classList.add('is-revealed'); });
                }, 12000);

                // Pre-paint nav-shell.scrolled-mobile state — when the
                // browser restores scroll position (bfcache, back/forward,
                // or session-history), the nav-shell would otherwise
                // paint in its unscrolled "tall pill" state and then
                // JS would add .scrolled-mobile via a 600ms transition,
                // visibly shrinking the pill + sliding the brand away.
                // We pre-tag the html with the right state so the
                // .nav-shell CSS lands correct on first paint, AND
                // register an early scroll listener so any later scroll
                // restoration (which can fire after parse-end) syncs the
                // nav-shell class as soon as it happens — before
                // handleMobileNav's DOMContentLoaded handler runs.
                function syncNavScrolled(){
                    if (window.innerWidth > 960) {
                        html.classList.remove('nav-prerender-scrolled');
                        var navOff = document.querySelector('.nav-shell');
                        if (navOff) navOff.classList.remove('scrolled-mobile');
                        return;
                    }
                    var sy = window.pageYOffset || document.documentElement.scrollTop || 0;
                    if (sy > 19) {
                        html.classList.add('nav-prerender-scrolled');
                        var nav = document.querySelector('.nav-shell');
                        if (nav) nav.classList.add('scrolled-mobile');
                    }
                }
                syncNavScrolled();
                addEventListener('pageshow', syncNavScrolled);
                // Catch scroll-restoration that fires after this head
                // script but before DOMContentLoaded. Once handleMobileNav
                // takes over on DOMContentLoaded, we remove this listener.
                addEventListener('scroll', syncNavScrolled, { passive: true });
                addEventListener('DOMContentLoaded', function(){
                    removeEventListener('scroll', syncNavScrolled);
                }, { once: true });
            })();
        </script>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
        <!-- iOS: make status bar blend with hero image olive tones -->
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

        <!-- Primary Meta Tags -->
        <title>Morning Star Christian Church in Boise, Idaho | Sunday Worship at 9 AM</title>
        <meta name="title" content="Morning Star Christian Church in Boise, Idaho | Sunday Worship at 9 AM">
        <meta name="description" content="Morning Star Christian Church is a welcoming, Bible-believing church in Boise, Idaho. Sundays at 9 AM with free community breakfast, Bible study Tuesdays & Thursdays, youth service Fridays. We confess Jesus Christ as Lord and Savior and teach the whole counsel of Scripture — mending the broken through faith and community.">
        <meta name="keywords" content="Morning Star Christian Church, church in Boise Idaho, Christian church Boise, Bible-believing church Boise, nondenominational church Boise, churches near me Boise, Sunday worship service Boise, Bible study Boise, community church Boise Idaho, Boise churches, church near me, best church in Boise, new church Boise, family church Boise, Sunday service Boise Idaho">
        <meta name="author" content="Morning Star Christian Church">
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
        <meta name="googlebot" content="index, follow">
        <link rel="canonical" href="https://ms.church/">

        <!-- Geographic Meta Tags (Local SEO) -->
        <meta name="geo.region" content="US-ID">
        <meta name="geo.placename" content="Boise, Idaho">
        <meta name="geo.position" content="43.6150;-116.2023">
        <meta name="ICBM" content="43.6150, -116.2023">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://ms.church/">
        <meta property="og:title" content="Morning Star Christian Church in Boise, Idaho | Sunday Worship at 9 AM">
        <meta property="og:description" content="A welcoming, Bible-believing church in Boise, Idaho. Sunday worship at 9 AM with free community breakfast, Bible study groups, and community outreach. Rooted in Scripture, centered on Jesus — all are welcome!">
        <meta property="og:image" content="https://ms.church/static/church-building.jpg">
        <meta property="og:image:width" content="1920">
        <meta property="og:image:height" content="1038">
        <meta property="og:image:alt" content="Morning Star Christian Church building in Boise, Idaho">
        <meta property="og:site_name" content="Morning Star Christian Church">
        <meta property="og:locale" content="en_US">

        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="https://ms.church/">
        <meta name="twitter:title" content="Morning Star Christian Church in Boise, Idaho | Sunday Worship at 9 AM">
        <meta name="twitter:description" content="A welcoming, Bible-believing church in Boise, Idaho. Sunday worship at 9 AM with free community breakfast, Bible study groups, and community outreach. Rooted in Scripture, centered on Jesus.">
        <meta name="twitter:image" content="https://ms.church/static/church-building.jpg">
        <meta name="twitter:image:alt" content="Morning Star Christian Church building in Boise, Idaho">

        <!-- Safari iOS theme-color — olive green blends with hero image top -->
        <meta name="theme-color" content="#3d3a2a">
        <meta name="theme-color" content="#3d3a2a" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="#1a1a2e" media="(prefers-color-scheme: dark)">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-title" content="Morning Star Church">
        <meta name="application-name" content="Morning Star Church">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="format-detection" content="telephone=yes">

        <!-- Favicon and App Icons -->
        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon-32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon-16.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png">
        <link rel="manifest" href="/site.webmanifest">

        <!-- RSS feed of upcoming events — feed-discovery signal for Google Discover and AI crawlers -->
        <link rel="alternate" type="application/rss+xml" title="Morning Star Christian Church — Events &amp; News" href="/feed.xml">

        <!-- Preconnect for Performance -->
        <link rel="preconnect" href="https://www.youtube-nocookie.com">
        <link rel="preconnect" href="https://engagehub.app">
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossorigin>
        <link rel="dns-prefetch" href="https://www.youtube-nocookie.com">
        <link rel="dns-prefetch" href="https://engagehub.app">
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com">

        <!-- Preload LCP hero image — three preload candidates, one per format.
             Browsers preload only the format whose type they support, so an
             AVIF-capable browser preloads the AVIF (~139 KB) and skips the
             others, while older browsers fall through to JPG (~308 KB).
             Avoids the double-load you'd get from a single JPG preload
             plus an AVIF CSS background. -->
        <link rel="preload" as="image" href="https://ms.church/static/church-building.avif" type="image/avif" fetchpriority="high">
        <link rel="preload" as="image" href="https://ms.church/static/church-building.webp" type="image/webp" fetchpriority="high">
        <link rel="preload" as="image" href="https://ms.church/static/church-building.jpg" type="image/jpeg" fetchpriority="high">

        <!-- Eager prefetch of the primary hero CTA target. Speculation
             Rules (below) covers hover/touch intent for /about, /outreach,
             /beliefs, etc. — but /visit is the home page's "Plan a Visit"
             button, the single highest-confidence next page, so we
             pay the bandwidth up front to guarantee an instant tap. -->
        <link rel="prefetch" href="/visit" as="document">

        <!-- Schema.org Structured Data for Rich Results -->
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": ["Church", "PlaceOfWorship", "LocalBusiness"],
                    "@id": "https://ms.church/#church",
                    "name": "Morning Star Christian Church",
                    "alternateName": ["Morning Star Church", "MS Church Boise", "Morning Star Boise"],
                    "description": "Morning Star Christian Church is a welcoming, Bible-believing Christian church in Boise, Idaho. We confess Jesus Christ as Lord and Savior and teach the whole counsel of Scripture — grace and truth, with no watered-down version. Join us Sundays at 9 AM for worship and a free community breakfast, Tuesday Bible reading at Caffeina State Street, Wednesday Activity Day (open gym + crochet circle), Thursday Bible study, and Friday Youth Service. We are dedicated to mending the broken through faith, community, and service.",
                    "keywords": "Boise church, Christian church Boise, nondenominational church Boise, Bible-believing church Boise, family church Boise, Sunday worship Boise, free community breakfast Boise, Bible study Boise, youth group Boise, church 83713, Wildwood Street church Boise, Morning Star Christian Church",
                    "url": "https://ms.church",
                    "email": "support@ms.church",
                    "contactPoint": {
                        "@type": "ContactPoint",
                        "contactType": "customer service",
                        "email": "support@ms.church",
                        "availableLanguage": "English",
                        "areaServed": "US"
                    },
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "3080 Wildwood St",
                        "addressLocality": "Boise",
                        "addressRegion": "ID",
                        "postalCode": "83713",
                        "addressCountry": "US"
                    },
                    "geo": {
                        "@type": "GeoCoordinates",
                        "latitude": 43.6150,
                        "longitude": -116.2023
                    },
                    "image": "https://ms.church/static/church-building.jpg",
                    "logo": "https://ms.church/static/church-building.jpg",
                    "sameAs": [
                        "https://www.instagram.com/morningstarboise/",
                        "https://www.instagram.com/mschurchboise",
                        "https://www.facebook.com/MorningStarBoise/",
                        "https://www.youtube.com/@morningstarboise"
                    ],
                    "photo": [
                        {
                            "@type": "ImageObject",
                            "contentUrl": "https://ms.church/static/church-building.jpg",
                            "caption": "Morning Star Christian Church building exterior at 3080 Wildwood Street, Boise, Idaho",
                            "keywords": "Morning Star Christian Church, Boise church exterior, Wildwood Street church"
                        },
                        {
                            "@type": "ImageObject",
                            "contentUrl": "https://ms.church/static/about-congregation.jpg",
                            "caption": "Morning Star Christian Church congregation worshiping together on a Sunday in Boise, Idaho",
                            "keywords": "Boise church congregation, Sunday worship Boise, nondenominational church service"
                        },
                        {
                            "@type": "ImageObject",
                            "contentUrl": "https://ms.church/static/worship.jpg",
                            "caption": "Sunday morning worship service at Morning Star Christian Church in Boise, with congregation and worship team leading songs",
                            "keywords": "Sunday worship Boise, church worship team Boise, Bible-believing service"
                        },
                        {
                            "@type": "ImageObject",
                            "contentUrl": "https://ms.church/static/worship-desktop.jpg?v=2",
                            "caption": "Pastor teaching from the pulpit at the 9 AM Sunday service at Morning Star Christian Church in Boise, Idaho",
                            "keywords": "Boise pastor preaching, Sunday teaching Boise, Bible-grounded preaching, nondenominational pulpit Boise"
                        },
                        {
                            "@type": "ImageObject",
                            "contentUrl": "https://ms.church/static/cooking-ministry.jpg",
                            "caption": "Morning Star Christian Church cooking ministry volunteers preparing meals for the Boise homeless shelter and the free Sunday community breakfast",
                            "keywords": "cooking ministry Boise, free breakfast church Boise, church homeless outreach Boise"
                        },
                        {
                            "@type": "ImageObject",
                            "contentUrl": "https://ms.church/static/community-events.jpg",
                            "caption": "Morning Star Christian Church community outreach event in a Boise park bringing families and neighbors together",
                            "keywords": "Boise community outreach, church community events Boise"
                        },
                        {
                            "@type": "ImageObject",
                            "contentUrl": "https://ms.church/static/youth.jpg?v=2",
                            "caption": "Morning Star Christian Church youth group gathering on a Friday evening — open to high school and college-age students in Boise",
                            "keywords": "youth group Boise, Friday youth church Boise, teen Christian community Boise"
                        }
                    ],
                    "openingHoursSpecification": [
                        {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": "Sunday",
                            "opens": "09:00",
                            "closes": "11:00",
                            "description": "Sunday Worship Service with free community breakfast"
                        },
                        {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": "Tuesday",
                            "opens": "08:30",
                            "closes": "10:00",
                            "description": "Tuesday Bible Reading at Caffeina State Street"
                        },
                        {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": "Wednesday",
                            "opens": "18:00",
                            "closes": "21:00",
                            "description": "Wednesday Activity Day — open gym (basketball, volleyball) and a crochet circle"
                        },
                        {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": "Thursday",
                            "opens": "18:00",
                            "closes": "19:30",
                            "description": "Thursday Evening Bible Study"
                        },
                        {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": "Friday",
                            "opens": "19:00",
                            "closes": "20:30",
                            "description": "Friday Evening Youth Service"
                        }
                    ],
                    "hasOfferCatalog": {
                        "@type": "OfferCatalog",
                        "name": "Church Services & Programs",
                        "itemListElement": [
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Sunday Worship Service",
                                    "description": "Weekly Sunday worship service at 9 AM with live streaming on YouTube and free community breakfast"
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Bible Study & Reading Groups",
                                    "description": "Tuesday morning Bible reading and Thursday evening Bible study with free coffee"
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Activity Day (Fellowship)",
                                    "description": "Wednesday evening open gym (basketball and volleyball) and a crochet circle — about three hours of fellowship, all ages welcome"
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Youth Service",
                                    "description": "Friday evening service for high schoolers and older (15 and up) — worship, teaching, and time to actually talk to each other. About an hour, with fellowship after."
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Sunday School (Kids)",
                                    "description": "Children's classroom during the Sunday service — Bible-storyline lesson at their level, preschool through about 5th grade, drop-in welcome any Sunday"
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Community Outreach",
                                    "description": "Monthly homeless-shelter cooking, free Sunday community breakfast with shelter transportation, and seasonal city-wide events"
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Prayer Requests",
                                    "description": "Submit prayer requests through our online contact form"
                                }
                            }
                        ]
                    },
                    "areaServed": [
                        {
                            "@type": "City",
                            "name": "Boise",
                            "containedInPlace": {
                                "@type": "State",
                                "name": "Idaho",
                                "containedInPlace": {
                                    "@type": "Country",
                                    "name": "United States"
                                }
                            }
                        },
                        {
                            "@type": "City",
                            "name": "Meridian"
                        },
                        {
                            "@type": "City",
                            "name": "Eagle"
                        },
                        {
                            "@type": "City",
                            "name": "Garden City"
                        }
                    ],
                    "priceRange": "Free",
                    "isAccessibleForFree": true,
                    "publicAccess": true
                },
                {
                    "@type": "WebSite",
                    "@id": "https://ms.church/#website",
                    "url": "https://ms.church",
                    "name": "Morning Star Christian Church",
                    "description": "Official website of Morning Star Christian Church — a Bible-believing Christian church in Boise, Idaho",
                    "publisher": {
                        "@id": "https://ms.church/#church"
                    },
                    "inLanguage": "en-US",
                    "potentialAction": {
                        "@type": "SearchAction",
                        "target": "https://ms.church/?q={search_term_string}",
                        "query-input": "required name=search_term_string"
                    }
                },
                {
                    "@type": "WebPage",
                    "@id": "https://ms.church/#webpage",
                    "url": "https://ms.church",
                    "name": "Morning Star Christian Church in Boise, Idaho | Sunday Worship, Bible Study & Community Outreach",
                    "isPartOf": {
                        "@id": "https://ms.church/#website"
                    },
                    "about": {
                        "@id": "https://ms.church/#church"
                    },
                    "description": "Morning Star Christian Church is a welcoming, Bible-believing church in Boise, Idaho. Sunday worship at 9 AM, Tuesday Bible reading, Thursday Bible study, Friday youth service, community outreach, and free breakfast. Rooted in Scripture, centered on Jesus — all are welcome.",
                    "inLanguage": "en-US",
                    "potentialAction": [
                        {
                            "@type": "ReadAction",
                            "target": ["https://ms.church"]
                        }
                    ]
                },
                {
                    "@type": "Organization",
                    "@id": "https://ms.church/#organization",
                    "name": "Morning Star Christian Church",
                    "url": "https://ms.church",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://ms.church/static/church-building.jpg",
                        "width": 1200,
                        "height": 630
                    },
                    "contactPoint": {
                        "@type": "ContactPoint",
                        "contactType": "customer service",
                        "email": "support@ms.church",
                        "availableLanguage": "English"
                    },
                    "sameAs": [
                        "https://www.instagram.com/morningstarboise/",
                        "https://www.instagram.com/mschurchboise",
                        "https://www.facebook.com/MorningStarBoise/",
                        "https://www.youtube.com/@morningstarboise"
                    ]
                },
                {
                    "@type": "BreadcrumbList",
                    "@id": "https://ms.church/#breadcrumb",
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": 1,
                            "name": "Home",
                            "item": "https://ms.church"
                        }
                    ]
                },
                {
                    "@type": "Event",
                    "@id": "https://ms.church/#sunday-service",
                    "name": "Sunday Worship Service at Morning Star Christian Church",
                    "description": "Join Morning Star Christian Church for Sunday worship at 9 AM in Boise, Idaho. Free community breakfast served after service. Free transportation from select shelters. Live stream available on YouTube.",
                    "startDate": "${nextSunday.start}",
                    "endDate": "${nextSunday.end}",
                    "eventSchedule": {
                        "@type": "Schedule",
                        "repeatFrequency": "P1W",
                        "byDay": "https://schema.org/Sunday",
                        "startTime": "09:00:00",
                        "endTime": "11:00:00",
                        "scheduleTimezone": "America/Boise"
                    },
                    "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
                    "eventStatus": "https://schema.org/EventScheduled",
                    "location": [
                        {
                            "@type": "Place",
                            "name": "Morning Star Christian Church",
                            "address": {
                                "@type": "PostalAddress",
                                "streetAddress": "3080 Wildwood St",
                                "addressLocality": "Boise",
                                "addressRegion": "ID",
                                "postalCode": "83713",
                                "addressCountry": "US"
                            }
                        },
                        {
                            "@type": "VirtualLocation",
                            "url": "https://www.youtube.com/@morningstarboise"
                        }
                    ],
                    "organizer": {
                        "@id": "https://ms.church/#church"
                    },
                    "isAccessibleForFree": true,
                    "image": "https://ms.church/static/church-building.jpg"
                },
                {
                    "@type": "Event",
                    "@id": "https://ms.church/#tuesday-bible-reading",
                    "name": "Tuesday Bible Reading at Caffeina State Street",
                    "description": "Join Morning Star Christian Church for Tuesday morning Bible reading at 8:30 AM at Caffeina State Street in Boise, Idaho. Open to everyone — come enjoy fellowship and free coffee.",
                    "eventSchedule": {
                        "@type": "Schedule",
                        "repeatFrequency": "P1W",
                        "byDay": "https://schema.org/Tuesday",
                        "startTime": "08:30:00",
                        "endTime": "10:00:00",
                        "scheduleTimezone": "America/Boise"
                    },
                    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                    "eventStatus": "https://schema.org/EventScheduled",
                    "location": {
                        "@type": "Place",
                        "name": "Caffeina State Street",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Boise",
                            "addressRegion": "ID",
                            "addressCountry": "US"
                        }
                    },
                    "organizer": {
                        "@id": "https://ms.church/#church"
                    },
                    "isAccessibleForFree": true
                },
                {
                    "@type": "Event",
                    "@id": "https://ms.church/#wednesday-activity-day",
                    "name": "Wednesday Activity Day at Morning Star Christian Church",
                    "description": "Open gym for basketball and volleyball plus a crochet circle, all ages welcome — Wednesdays at 6 PM at Morning Star Christian Church in Boise. About three hours, no signup, no fee.",
                    "eventSchedule": {
                        "@type": "Schedule",
                        "repeatFrequency": "P1W",
                        "byDay": "https://schema.org/Wednesday",
                        "startTime": "18:00:00",
                        "endTime": "21:00:00",
                        "scheduleTimezone": "America/Boise"
                    },
                    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                    "eventStatus": "https://schema.org/EventScheduled",
                    "location": {
                        "@type": "Place",
                        "name": "Morning Star Christian Church",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "3080 Wildwood St",
                            "addressLocality": "Boise",
                            "addressRegion": "ID",
                            "postalCode": "83713",
                            "addressCountry": "US"
                        }
                    },
                    "organizer": {
                        "@id": "https://ms.church/#church"
                    },
                    "isAccessibleForFree": true
                },
                {
                    "@type": "Event",
                    "@id": "https://ms.church/#thursday-bible-study",
                    "name": "Thursday Evening Bible Study at Morning Star Christian Church",
                    "description": "Join Morning Star Christian Church for Thursday evening Bible study at 6 PM in Boise, Idaho. Free coffee provided. All are welcome.",
                    "eventSchedule": {
                        "@type": "Schedule",
                        "repeatFrequency": "P1W",
                        "byDay": "https://schema.org/Thursday",
                        "startTime": "18:00:00",
                        "endTime": "19:30:00",
                        "scheduleTimezone": "America/Boise"
                    },
                    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                    "eventStatus": "https://schema.org/EventScheduled",
                    "location": {
                        "@type": "Place",
                        "name": "Morning Star Christian Church",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "3080 Wildwood St",
                            "addressLocality": "Boise",
                            "addressRegion": "ID",
                            "postalCode": "83713",
                            "addressCountry": "US"
                        }
                    },
                    "organizer": {
                        "@id": "https://ms.church/#church"
                    },
                    "isAccessibleForFree": true
                },
                {
                    "@type": "Event",
                    "@id": "https://ms.church/#friday-youth-service",
                    "name": "Friday Youth Service at Morning Star Christian Church",
                    "description": "Weekly Friday-night service for high schoolers and older (15 and up) — worship, teaching, and time to actually talk to each other. About an hour, with fellowship after.",
                    "eventSchedule": {
                        "@type": "Schedule",
                        "repeatFrequency": "P1W",
                        "byDay": "https://schema.org/Friday",
                        "startTime": "19:00:00",
                        "endTime": "20:30:00",
                        "scheduleTimezone": "America/Boise"
                    },
                    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                    "eventStatus": "https://schema.org/EventScheduled",
                    "audience": {
                        "@type": "PeopleAudience",
                        "suggestedMinAge": 15,
                        "audienceType": "High school youth and young adults"
                    },
                    "location": {
                        "@type": "Place",
                        "name": "Morning Star Christian Church",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "3080 Wildwood St",
                            "addressLocality": "Boise",
                            "addressRegion": "ID",
                            "postalCode": "83713",
                            "addressCountry": "US"
                        }
                    },
                    "organizer": {
                        "@id": "https://ms.church/#church"
                    },
                    "isAccessibleForFree": true
                },
                {
                    "@type": "FAQPage",
                    "@id": "https://ms.church/#faq",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": "What time is Sunday service at Morning Star Christian Church?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Sunday worship service begins at 9:00 AM every Sunday at 3080 Wildwood St, Boise, Idaho. A free community breakfast is served after the service."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "What does Morning Star Christian Church believe?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Morning Star is a welcoming, Bible-believing Christian church in Boise, Idaho. We confess Jesus Christ as Lord and Savior, teach the whole counsel of Scripture (grace and truth, with no watered-down version), and believe salvation is by grace through faith alone. All are welcome — every seat at our table is a free one."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Does Morning Star Church offer Bible study groups?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Yes, we offer Tuesday morning Bible reading at 8:30 AM at Caffeina State Street and Thursday evening Bible study at 6:00 PM at the church. Free coffee is provided at both gatherings."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Where is Morning Star Christian Church located?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Morning Star Christian Church is located at 3080 Wildwood St, Boise, Idaho 83713. We serve the Boise, Meridian, Eagle, and Garden City communities."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Can I watch Sunday service online?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Yes, our Sunday worship service is live streamed on our YouTube channel at youtube.com/@morningstarboise. You can also watch past services in our full playlist."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "What should I wear to Sunday service?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "There is no strict dress code beyond keeping it modest. Most folks land on the casual side — jeans and a shirt are completely fine — and you'll see plenty of people dressed more formally. Both fit in. Come as you are."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Where do I park at Morning Star Christian Church?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Parking is right next to the building. As soon as you pull up to 3080 Wildwood St, you'll see the lot — free, no permit needed, only a short walk to the front door."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "What happens when I arrive? Who will greet me?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Greeters meet everyone at the door for the main Sunday service. If you have a question or need a hand finding something — a seat, the kids' classroom, the bathroom — they're there to help. No pressure to introduce yourself or sign anything."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "What about kids? Do you have a Sunday School?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Yes — Sunday School runs in a separate classroom during the 9 AM service, for kids from preschool through about 5th grade. Children head to the room after the two opening worship songs. Drop-off is welcome any Sunday — no signup, no waiver, no ID required. Older kids usually stay in the service with their family."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "What ages is Youth Service for?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Youth Service is for 15 and up — high schoolers through college age. It runs Fridays at 7:00 PM for about an hour, with fellowship after."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Is Morning Star Christian Church nondenominational?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Yes, Morning Star Christian Church is a nondenominational Christian church in Boise, Idaho. We are not affiliated with any single denomination — Baptist, Methodist, Presbyterian, or otherwise — and base our teaching directly on the Bible while affirming the historic foundations of Christian faith shared across evangelical traditions."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "What is a nondenominational Christian church?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "A nondenominational Christian church operates independently of established denominational hierarchies such as Baptist, Catholic, Presbyterian, Lutheran, or Methodist organizations. Nondenominational churches teach directly from the Bible, are led by local elders and pastors, and emphasize the core foundations of Christian faith shared across all evangelical traditions."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Does Morning Star Christian Church offer a free community breakfast?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Yes. Every Sunday after our 9:00 AM worship service at 3080 Wildwood St, Boise, we serve a free community breakfast open to everyone — members, visitors, and neighbors alike. There is no charge and no expectation of attending the service."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Is the free community breakfast really free?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Yes. The Sunday breakfast at Morning Star Christian Church is genuinely free — no donation expected, no menu pricing, no signup. Anyone can come. We serve breakfast as part of our calling to mend the broken in the Boise community."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "How long is the Sunday service at Morning Star?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Sunday worship at Morning Star Christian Church typically runs about 60 to 75 minutes — beginning at 9:00 AM and ending around 10:15 AM — followed by free community breakfast in our fellowship space."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "What is Morning Star's cooking ministry?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Morning Star's cooking ministry is a team of volunteers who prepare meals served to the Boise homeless shelter on a monthly schedule, plus the weekly Sunday breakfast served free to anyone who attends or stops by the church on Wildwood Street."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Is Morning Star Christian Church a good fit for families with young kids?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Yes. Sunday school runs in a dedicated classroom during the 9 AM service for children from preschool through about 5th grade. Older kids stay with their families. After service, kids and parents are welcome to the free community breakfast — no signup, no waiver, no charge."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Do I need to register or sign up before visiting Morning Star?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "No registration is required. Visitors are welcome to walk in any Sunday at 9 AM at 3080 Wildwood St. There is no signup, no waiver, no mandatory contact card, and no introduction required at the front. Greeters at the door will help you find a seat or the kids' classroom if needed."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "What is the worship style at Morning Star Christian Church?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Morning Star's worship is reverent, contemporary, and Bible-centered. We sing both modern worship songs and traditional hymns each Sunday, and the message is grounded directly in Scripture — the whole counsel of God, no watered-down version."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Is Morning Star welcoming to people new to faith or unfamiliar with church?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Yes. Morning Star Christian Church is a welcoming place for anyone exploring Christian faith, returning to church after time away, or attending church for the first time. There is no pressure to participate, contribute, or commit. Come as you are and stay as long as feels right."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "What is Wednesday Activity Day at Morning Star?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Wednesday Activity Day at Morning Star runs 6:00 to 9:00 PM at our 3080 Wildwood St location. It includes an open gym (basketball, volleyball, and other activities) and a crochet circle for fellowship. All ages and skill levels are welcome."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Where is the closest nondenominational church to Five Mile Road and Ustick in Boise?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Morning Star Christian Church at 3080 Wildwood St is located in the Five Mile and Ustick area of West Boise in the 83713 ZIP code, roughly a mile east of Eagle Road and a short drive from Maple Grove Road."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Where can I watch past sermons from Morning Star Christian Church?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Past sermons, services, and special messages from Morning Star Christian Church are available on our YouTube channel at youtube.com/@morningstarboise. Sunday worship is live streamed there each week and remains available for later viewing."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Can I submit a prayer request to Morning Star Christian Church?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Yes. Prayer requests can be submitted through our contact form at ms.church/form. Requests are kept confidential and prayed over by the pastoral team at Morning Star Christian Church."
                            }
                        }
                    ]
                }
            ]
        }
        </script>
${prefetchSnippet()}

        <!-- Self-hosted Inter + Playfair Display (v1.62.7). The @font-face
             rules live in home-styles.ts; here we preload the two weights
             most critical for first-paint (400 body + 700 display headings)
             so the font files are fetched in parallel with the HTML parse.
             Eliminates the cross-origin Google Fonts roundtrip and the
             font-flash during cross-document view transitions. -->
        <link rel="preload" as="font" type="font/woff2" href="/static/fonts/inter-400.woff2" crossorigin>
        <link rel="preload" as="font" type="font/woff2" href="/static/fonts/playfair-display-700.woff2" crossorigin>
        <style>
            /* Metric-matched fallbacks. Layout boxes are computed against
               these adjusted Georgia/system metrics; when Playfair / Inter
               loads (cached or optional), the swap is invisible because
               glyph dimensions already match. */
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
                speedInsightsScript.onload = function() {
                    if (window.si) { window.si('start'); }
                };
                document.head.appendChild(speedInsightsScript);
            } else {
                console.log('Analytics & Speed Insights tracking disabled via ?notrack=true parameter');
                window.va = function() {};
                window.si = function() {};
                if (window.navigator && window.navigator.sendBeacon) {
                    const originalSendBeacon = window.navigator.sendBeacon.bind(window.navigator);
                    window.navigator.sendBeacon = function(url, data) {
                        if (url && (url.includes('vercel') || url.includes('analytics') || url.includes('speed-insights'))) {
                            return true;
                        }
                        return originalSendBeacon(url, data);
                    };
                }
            }
        </script>

        <style>${homeStyles()}</style>
    </head>`
}
