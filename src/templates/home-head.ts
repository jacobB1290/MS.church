import { homeStyles } from './home-styles.js'

export const homeHead = (): string => `
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
        <!-- iOS: make status bar blend with hero image olive tones -->
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

        <!-- Primary Meta Tags -->
        <title>Morning Star Christian Church in Boise, Idaho | Sunday Worship at 9 AM</title>
        <meta name="title" content="Morning Star Christian Church in Boise, Idaho | Sunday Worship at 9 AM">
        <meta name="description" content="Morning Star Christian Church is a welcoming nondenominational church in Boise, Idaho. Join us Sundays at 9 AM for worship and free community breakfast. Bible study groups on Tuesdays and Thursdays. All are welcome — mending the broken through faith and community.">
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
        <meta name="twitter:description" content="A welcoming nondenominational church in Boise, Idaho. Sunday worship at 9 AM with free community breakfast, Bible study, and community outreach.">
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
                    "description": "Morning Star Christian Church is a welcoming nondenominational Christian church in Boise, Idaho. Join us Sundays at 9 AM for worship, free community breakfast, Tuesday Bible reading, and Thursday Bible study. We are dedicated to mending the broken through faith, community, and service.",
                    "url": "https://ms.church",
                    "email": "morningstarchurchboise@gmail.com",
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
                    "description": "Morning Star Christian Church is a welcoming nondenominational church in Boise, Idaho. Sunday worship at 9 AM, Tuesday Bible reading, Thursday Bible study, community outreach, and free breakfast. All are welcome.",
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
                    "startDate": "2026-03-29T09:00:00-06:00",
                    "endDate": "2026-03-29T11:00:00-06:00",
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
                }
            ]
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
