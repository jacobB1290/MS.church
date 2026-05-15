import { homeStyles } from './home-styles.js'

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
                if(location.hash) skip=true;
                try{
                    var n=performance.getEntriesByType('navigation')[0];
                    if(n&&n.type==='back_forward'){ skip=true; isBackForward=true; }
                    if(n&&n.type==='reload') skip=true;
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
                addEventListener('pagereveal', function(){
                    if (isBackForward) restoreScroll();
                });
                // Fallback for browsers without pagereveal: restore on
                // pageshow (fires after the transition; jump may be
                // visible but at least the page lands at the right spot).
                addEventListener('pageshow', function(e){
                    if (isBackForward || e.persisted) restoreScroll();
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
                // Watchdog — if the reveal observer never fires (JS
                // error, very slow device), force everything visible
                // after 4s so the page is recoverable.
                setTimeout(function(){
                    var sel='.reveal,.reveal-scale,.reveal-eyebrow,.reveal-rise,.reveal-rise-slow,.reveal-tight,.reveal-from-left,.reveal-from-right,.reveal-from-above,.reveal-photo,.reveal-power,.reveal-pop,.reveal-fill';
                    document.querySelectorAll(sel).forEach(function(el){ el.classList.add('is-revealed'); });
                }, 4000);

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
        <meta name="description" content="Morning Star Christian Church is a welcoming nondenominational church in Boise, Idaho. Sundays at 9 AM with free community breakfast, Bible study Tuesdays & Thursdays, youth service Fridays. Sunday School, monthly homeless-shelter cooking, and community outreach — mending the broken through faith and community.">
        <meta name="keywords" content="Morning Star Christian Church, church in Boise Idaho, Christian church Boise, nondenominational church Boise, churches near me Boise, Sunday worship service Boise, Bible study Boise, community church Boise Idaho, Boise churches, church near me, best church in Boise, new church Boise, family church Boise, Sunday service Boise Idaho">
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
        <meta property="og:description" content="A welcoming nondenominational church in Boise, Idaho. Sunday worship at 9 AM with free community breakfast, Bible study groups, and community outreach. All are welcome!">
        <meta property="og:image" content="https://page.gensparksite.com/v1/base64_upload/2ed08492a85ab5d976704d29fdd46025">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="Morning Star Christian Church building in Boise, Idaho">
        <meta property="og:site_name" content="Morning Star Christian Church">
        <meta property="og:locale" content="en_US">

        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="https://ms.church/">
        <meta name="twitter:title" content="Morning Star Christian Church in Boise, Idaho | Sunday Worship at 9 AM">
        <meta name="twitter:description" content="A welcoming nondenominational church in Boise, Idaho. Sunday worship at 9 AM with free community breakfast, Bible study groups, and community outreach.">
        <meta name="twitter:image" content="https://page.gensparksite.com/v1/base64_upload/2ed08492a85ab5d976704d29fdd46025">
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
        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        <link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png">

        <!-- Preconnect for Performance -->
        <link rel="preconnect" href="https://www.youtube-nocookie.com">
        <link rel="preconnect" href="https://engagehub.app">
        <link rel="preconnect" href="https://page.gensparksite.com">
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossorigin>
        <link rel="dns-prefetch" href="https://www.youtube-nocookie.com">
        <link rel="dns-prefetch" href="https://engagehub.app">
        <link rel="dns-prefetch" href="https://page.gensparksite.com">
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com">

        <!-- Preload LCP hero image -->
        <link rel="preload" as="image" href="https://page.gensparksite.com/v1/base64_upload/2ed08492a85ab5d976704d29fdd46025" fetchpriority="high">

        <!-- Schema.org Structured Data for Rich Results -->
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": ["Church", "PlaceOfWorship"],
                    "@id": "https://ms.church/#church",
                    "name": "Morning Star Christian Church",
                    "alternateName": ["Morning Star Church", "MS Church Boise"],
                    "description": "Morning Star Christian Church is a welcoming nondenominational Christian church in Boise, Idaho. Join us Sundays at 9 AM for worship, free community breakfast, Tuesday Bible reading, Thursday Bible study, and Friday youth service. We are dedicated to mending the broken through faith, community, and service.",
                    "url": "https://ms.church",
                    "email": "morningstarchurchboise@gmail.com",
                    "contactPoint": {
                        "@type": "ContactPoint",
                        "contactType": "customer service",
                        "email": "morningstarchurchboise@gmail.com",
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
                    "image": "https://page.gensparksite.com/v1/base64_upload/2ed08492a85ab5d976704d29fdd46025",
                    "logo": "https://page.gensparksite.com/v1/base64_upload/2ed08492a85ab5d976704d29fdd46025",
                    "sameAs": [
                        "https://www.instagram.com/morningstarboise/",
                        "https://www.instagram.com/mschurchboise",
                        "https://www.facebook.com/MorningStarBoise/",
                        "https://www.youtube.com/@morningstarboise"
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
                            "description": "Tuesday Bible Reading at Caffiena State Street"
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
                                    "name": "Youth Service",
                                    "description": "Friday evening youth service with worship, teaching, and fellowship for the next generation"
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Community Outreach",
                                    "description": "Community breakfast, shelter transportation, and serving Boise with love and purpose"
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
                    "description": "Official website of Morning Star Christian Church — a nondenominational Christian church in Boise, Idaho",
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
                    "description": "Morning Star Christian Church is a welcoming nondenominational church in Boise, Idaho. Sunday worship at 9 AM, Tuesday Bible reading, Thursday Bible study, Friday youth service, community outreach, and free breakfast. All are welcome.",
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
                        "url": "https://page.gensparksite.com/v1/base64_upload/2ed08492a85ab5d976704d29fdd46025",
                        "width": 1200,
                        "height": 630
                    },
                    "contactPoint": {
                        "@type": "ContactPoint",
                        "contactType": "customer service",
                        "email": "morningstarchurchboise@gmail.com",
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
                    "image": "https://page.gensparksite.com/v1/base64_upload/2ed08492a85ab5d976704d29fdd46025"
                },
                {
                    "@type": "Event",
                    "@id": "https://ms.church/#tuesday-bible-reading",
                    "name": "Tuesday Bible Reading at Caffiena State Street",
                    "description": "Join Morning Star Christian Church for Tuesday morning Bible reading at 8:30 AM at Caffiena State Street in Boise, Idaho. Open to everyone — come enjoy fellowship and free coffee.",
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
                        "name": "Caffiena State Street",
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
                            "name": "Is Morning Star Christian Church a nondenominational church?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Yes, Morning Star Christian Church is a welcoming nondenominational Christian church in Boise, Idaho. All are welcome regardless of background."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Does Morning Star Church offer Bible study groups?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Yes, we offer Tuesday morning Bible reading at 8:30 AM at Caffiena State Street and Thursday evening Bible study at 6:00 PM at the church. Free coffee is provided at both gatherings."
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
                        }
                    ]
                }
            ]
        }
        </script>

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <!-- v1.49.24: swap → optional. The default Google Fonts "swap"
             behavior renders the page with a fallback (Georgia / system-ui)
             on first paint, then re-renders when the web font arrives —
             that's the "logo expands then jumps" the user reported, since
             Playfair Display has wider glyphs than the Georgia fallback.
             With "optional" the browser uses the web font only if it's
             cached / ready within ~100ms; otherwise the fallback is used
             permanently for this page load. No swap = no jump.
             The size-adjust fallbacks below match Georgia/system metrics
             to Playfair/Inter so even when the fallback IS used the layout
             matches the cached-font layout. -->
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=optional" rel="stylesheet">
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
