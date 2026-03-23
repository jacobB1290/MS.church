import { homeStyles } from './home-styles.js'

export const homeHead = (): string => `
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
        <!-- iOS: make status bar blend with hero image olive tones -->
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

        <!-- Primary Meta Tags -->
        <title>Morning Star Christian Church | Boise, Idaho - Sunday Services & Community</title>
        <meta name="title" content="Morning Star Christian Church | Boise, Idaho - Sunday Services & Community">
        <meta name="description" content="Welcome to Morning Star Christian Church in Boise, Idaho. Join us for Sunday worship services, community outreach, prayer meetings, and fellowship. A welcoming church family mending the broken. All are welcome!">
        <meta name="keywords" content="Morning Star Christian Church, Boise church, Idaho church, Sunday service, Christian church Boise, worship service, community church, prayer meeting, church near me, Boise Idaho church, nondenominational church, family church">
        <meta name="author" content="Morning Star Christian Church">
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
        <meta name="googlebot" content="index, follow">
        <link rel="canonical" href="https://ms.church/">

        <!-- Geographic Meta Tags (Local SEO) -->
        <meta name="geo.region" content="US-ID">
        <meta name="geo.placename" content="Boise, Idaho">
        <meta name="geo.position" content="43.6185;-116.2816">
        <meta name="ICBM" content="43.6185, -116.2816">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://ms.church/">
        <meta property="og:title" content="Morning Star Christian Church | Boise, Idaho">
        <meta property="og:description" content="Welcome to Morning Star Christian Church in Boise, Idaho. Join us for Sunday worship services, community outreach, and fellowship. Mending the broken - all are welcome!">
        <meta property="og:image" content="https://ms.church/static/church-building.jpg">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="Morning Star Christian Church building in Boise, Idaho">
        <meta property="og:site_name" content="Morning Star Christian Church">
        <meta property="og:locale" content="en_US">

        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="https://ms.church/">
        <meta name="twitter:title" content="Morning Star Christian Church | Boise, Idaho">
        <meta name="twitter:description" content="Welcome to Morning Star Christian Church in Boise, Idaho. Join us for Sunday worship, community outreach, and fellowship. All are welcome!">
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
        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        <link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png">

        <!-- Preconnect for Performance -->
        <link rel="preconnect" href="https://www.youtube-nocookie.com">
        <link rel="preconnect" href="https://www.jotform.com">
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossorigin>
        <link rel="dns-prefetch" href="https://www.youtube-nocookie.com">
        <link rel="dns-prefetch" href="https://www.jotform.com">
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com">

        <!-- Preload LCP hero image -->
        <link rel="preload" as="image" href="/static/church-building.jpg" fetchpriority="high">

        <!-- Schema.org Structured Data for Rich Results -->
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "Church",
                    "@id": "https://ms.church/#church",
                    "name": "Morning Star Christian Church",
                    "alternateName": "MS Church",
                    "description": "Morning Star Christian Church is a welcoming, nondenominational church in Boise, Idaho. Join us Sundays at 9 AM for worship, Bible teaching, and a free community breakfast. Serving the Treasure Valley.",
                    "url": "https://ms.church",
                    "email": "support@ms.church",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "3080 N Wildwood St",
                        "addressLocality": "Boise",
                        "addressRegion": "ID",
                        "postalCode": "83713",
                        "addressCountry": "US"
                    },
                    "geo": {
                        "@type": "GeoCoordinates",
                        "latitude": 43.6185,
                        "longitude": -116.2816
                    },
                    "image": "https://ms.church/static/church-building.jpg",
                    "logo": "https://ms.church/static/church-building.jpg",
                    "sameAs": [
                        "https://www.instagram.com/mschurchboise",
                        "https://www.facebook.com/61564924058156/",
                        "https://www.youtube.com/@morningstarboise"
                    ],
                    "openingHoursSpecification": [
                        {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": "Sunday",
                            "opens": "09:00",
                            "closes": "11:00",
                            "description": "Sunday Worship Service"
                        },
                        {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": "Tuesday",
                            "opens": "08:30",
                            "closes": "10:00",
                            "description": "Tuesday Bible Reading"
                        },
                        {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": "Thursday",
                            "opens": "18:00",
                            "closes": "20:00",
                            "description": "Thursday Bible Study"
                        }
                    ],
                    "hasOfferCatalog": {
                        "@type": "OfferCatalog",
                        "name": "Church Services",
                        "itemListElement": [
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Sunday Worship Service",
                                    "description": "Weekly worship service with live streaming available"
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Community Outreach",
                                    "description": "Serving our community with love and purpose"
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Prayer Requests",
                                    "description": "Submit prayer requests through our contact form"
                                }
                            }
                        ]
                    },
                    "areaServed": [
                        { "@type": "City", "name": "Boise", "addressRegion": "ID" },
                        { "@type": "City", "name": "Meridian", "addressRegion": "ID" },
                        { "@type": "City", "name": "Eagle", "addressRegion": "ID" },
                        { "@type": "City", "name": "Star", "addressRegion": "ID" },
                        { "@type": "City", "name": "Kuna", "addressRegion": "ID" },
                        { "@type": "City", "name": "Garden City", "addressRegion": "ID" },
                        { "@type": "City", "name": "Nampa", "addressRegion": "ID" }
                    ],
                    "hasMap": "https://maps.app.goo.gl/nmYV7hSLXKVGexu38",
                    "priceRange": "Free"
                },
                {
                    "@type": "WebSite",
                    "@id": "https://ms.church/#website",
                    "url": "https://ms.church",
                    "name": "Morning Star Christian Church",
                    "description": "Official website of Morning Star Christian Church in Boise, Idaho",
                    "publisher": {
                        "@id": "https://ms.church/#church"
                    },
                    "inLanguage": "en-US"
                },
                {
                    "@type": "WebPage",
                    "@id": "https://ms.church/#webpage",
                    "url": "https://ms.church",
                    "name": "Morning Star Christian Church | Boise, Idaho - Sunday Services & Community",
                    "isPartOf": {
                        "@id": "https://ms.church/#website"
                    },
                    "about": {
                        "@id": "https://ms.church/#church"
                    },
                    "description": "Welcome to Morning Star Christian Church in Boise, Idaho. Join us for Sunday worship services, community outreach, and fellowship.",
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
                        "https://www.instagram.com/mschurchboise",
                        "https://www.facebook.com/61564924058156/",
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
                }
            ]
        }
        </script>

        <!-- FAQ Schema for Rich Results -->
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "What time are services at Morning Star Christian Church?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Sunday worship starts at 9:00 AM with a free community breakfast following the service. Bible studies are held Tuesdays at 8:30 AM and Thursdays at 6:00 PM."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Is Morning Star Church a nondenominational church?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, Morning Star Christian Church is a nondenominational, Bible-based church in Boise, Idaho welcoming people from all backgrounds."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Does Morning Star Church offer free transportation?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, Morning Star Christian Church provides free transportation from select shelters in the Boise area for Sunday services."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Does Morning Star Church have a youth group?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, Morning Star has an active youth group that meets on Friday nights. Follow @mstaryouth on Instagram for updates."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Does Morning Star Church have a free community breakfast?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, every Sunday after the 9 AM worship service, Morning Star provides a completely free breakfast for everyone — church members and visitors alike."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Where is Morning Star Christian Church located?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Morning Star Christian Church is located at 3080 N Wildwood St, Boise, ID 83713, serving Boise, Meridian, Eagle, Star, Kuna, and the greater Treasure Valley."
                    }
                }
            ]
        }
        </script>

        <!-- Event Schema for Weekly Sunday Service -->
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "Sunday Worship Service at Morning Star Christian Church",
            "description": "Weekly Sunday worship service with free community breakfast after. Free transportation from select shelters included. All are welcome.",
            "startDate": "${(() => { const now = new Date(); const day = now.getUTCDay(); const daysUntilSunday = day === 0 ? 0 : 7 - day; const next = new Date(now); next.setUTCDate(next.getUTCDate() + daysUntilSunday); return next.toISOString().split('T')[0]; })()}T09:00:00-07:00",
            "endDate": "${(() => { const now = new Date(); const day = now.getUTCDay(); const daysUntilSunday = day === 0 ? 0 : 7 - day; const next = new Date(now); next.setUTCDate(next.getUTCDate() + daysUntilSunday); return next.toISOString().split('T')[0]; })()}T11:00:00-07:00",
            "eventSchedule": {
                "@type": "Schedule",
                "repeatFrequency": "P1W",
                "byDay": "https://schema.org/Sunday",
                "startTime": "09:00:00",
                "endTime": "11:00:00"
            },
            "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
            "eventStatus": "https://schema.org/EventScheduled",
            "isAccessibleForFree": true,
            "location": {
                "@type": "Place",
                "name": "Morning Star Christian Church",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "3080 N Wildwood St",
                    "addressLocality": "Boise",
                    "addressRegion": "ID",
                    "postalCode": "83713",
                    "addressCountry": "US"
                }
            },
            "organizer": {
                "@id": "https://ms.church/#church"
            },
            "image": "https://ms.church/static/church-building.jpg",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
            }
        }
        </script>

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

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
