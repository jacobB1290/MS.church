import { homeStyles } from './home-styles.js'

export const homeHead = (): string => `
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">

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
        <meta name="geo.position" content="43.6150;-116.2023">
        <meta name="ICBM" content="43.6150, -116.2023">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://ms.church/">
        <meta property="og:title" content="Morning Star Christian Church | Boise, Idaho">
        <meta property="og:description" content="Welcome to Morning Star Christian Church in Boise, Idaho. Join us for Sunday worship services, community outreach, and fellowship. Mending the broken - all are welcome!">
        <meta property="og:image" content="https://page.gensparksite.com/v1/base64_upload/2ed08492a85ab5d976704d29fdd46025">
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
        <meta name="twitter:image" content="https://page.gensparksite.com/v1/base64_upload/2ed08492a85ab5d976704d29fdd46025">
        <meta name="twitter:image:alt" content="Morning Star Christian Church building in Boise, Idaho">

        <!-- Safari iOS theme-color for status bar and tab bar background -->
        <meta name="theme-color" content="#f8f9fd">
        <meta name="theme-color" content="#f8f9fd" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="#1a1a2e" media="(prefers-color-scheme: dark)">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
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
        <link rel="dns-prefetch" href="https://www.youtube-nocookie.com">
        <link rel="dns-prefetch" href="https://www.jotform.com">

        <!-- Schema.org Structured Data for Rich Results -->
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "Church",
                    "@id": "https://ms.church/#church",
                    "name": "Morning Star Christian Church",
                    "alternateName": "Morning Star Church",
                    "description": "A welcoming Christian church in Boise, Idaho dedicated to mending the broken through faith, community, and service. Join us for Sunday worship services, prayer meetings, and community outreach.",
                    "url": "https://ms.church",
                    "telephone": "+1-208-000-0000",
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
                        "https://www.facebook.com/MorningStarBoise/",
                        "https://www.youtube.com/@morningstarboise"
                    ],
                    "openingHoursSpecification": [
                        {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": "Sunday",
                            "opens": "10:00",
                            "closes": "12:00",
                            "description": "Sunday Worship Service"
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
                    "areaServed": {
                        "@type": "City",
                        "name": "Boise",
                        "containedInPlace": {
                            "@type": "State",
                            "name": "Idaho"
                        }
                    },
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
