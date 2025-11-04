import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

// Main landing page with enhanced scroll animations
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Morning Star Christian Church</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            :root {
                color-scheme: light;
                --bg-default: linear-gradient(135deg, #f8f9fd 0%, #e9ecf5 100%);
                --bg-event1: linear-gradient(135deg, #ffe8d6 0%, #ffd4d4 100%); /* Soft peach to light coral for Friendsgiving */
                --bg-event2: linear-gradient(135deg, #ffd6e8 0%, #ffe5f0 100%); /* Soft pink to lighter pink for Clothes Drive */
                --bg-event3: linear-gradient(135deg, #e8f5e8 0%, #fff5f5 50%, #f0f8f0 100%); /* Pale green to white-pink to pale green for Christmas */
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: var(--bg-default);
                color: #1a1a2e;
                min-height: 100vh;
                line-height: 1.6;
                overflow-x: hidden;
                transition: background 1.8s cubic-bezier(0.4, 0, 0.2, 1);
            }

            body.event-1-active {
                background: var(--bg-event1);
            }

            body.event-2-active {
                background: var(--bg-event2);
            }

            body.event-3-active {
                background: var(--bg-event3);
            }

            a {
                color: inherit;
                text-decoration: none;
            }

            .page {
                width: min(1280px, 94%);
                margin: 0 auto;
            }

            /* Enhanced Navigation */
            .nav-shell {
                margin: 40px auto 100px;
                padding: 20px 40px;
                background: rgba(255, 255, 255, 0.75);
                border-radius: 100px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 40px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08), 
                            0 8px 20px rgba(0, 0, 0, 0.04);
                backdrop-filter: blur(20px);
                position: sticky;
                top: 32px;
                z-index: 1000;
                border: 1px solid rgba(255, 255, 255, 0.4);
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .nav-shell:hover {
                background: rgba(255, 255, 255, 0.85);
                box-shadow: 0 24px 70px rgba(0, 0, 0, 0.1), 
                            0 10px 24px rgba(0, 0, 0, 0.05);
            }

            .brand {
                display: flex;
                flex-direction: column;
                line-height: 1;
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .brand:hover {
                transform: translateY(-2px);
            }

            .brand-title {
                font-family: 'Playfair Display', serif;
                font-size: 22px;
                font-weight: 700;
                letter-spacing: 3px;
                text-transform: uppercase;
                color: #1a1a2e;
            }

            .brand-subtitle {
                font-size: 11px;
                letter-spacing: 4px;
                text-transform: uppercase;
                color: rgba(26, 26, 46, 0.5);
                font-weight: 600;
                margin-top: 2px;
            }

            nav ul {
                list-style: none;
                display: flex;
                gap: 36px;
                text-transform: uppercase;
                letter-spacing: 2px;
                font-size: 12px;
                font-weight: 700;
            }

            nav a {
                opacity: 0.6;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                padding-bottom: 4px;
            }

            nav a::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%) scaleX(0);
                width: 100%;
                height: 2px;
                background: currentColor;
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            nav a:hover {
                opacity: 1;
                transform: translateY(-2px);
            }

            nav a:hover::after {
                transform: translateX(-50%) scaleX(1);
            }

            .nav-cta {
                padding: 14px 32px;
                border-radius: 100px;
                background: linear-gradient(135deg, #d4a574 0%, #c89860 100%);
                color: #fff;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 2px;
                box-shadow: 0 12px 28px rgba(200, 152, 96, 0.35);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }

            .nav-cta:hover {
                transform: translateY(-3px);
                box-shadow: 0 16px 36px rgba(200, 152, 96, 0.45);
                background: linear-gradient(135deg, #dbb078 0%, #d4a574 100%);
            }

            main {
                display: flex;
                flex-direction: column;
                gap: 200px;
                margin-bottom: 200px;
            }

            section {
                width: 100%;
                opacity: 0;
                transform: translateY(60px);
                animation: fadeInUp 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            @keyframes fadeInUp {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Hero Section */
            .hero {
                display: grid;
                gap: 40px;
                padding: 60px 0;
            }

            .hero .eyebrow {
                display: inline-flex;
                align-items: center;
                padding: 12px 28px;
                background: rgba(255, 255, 255, 0.7);
                border-radius: 100px;
                text-transform: uppercase;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 3px;
                color: rgba(26, 26, 46, 0.6);
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.5);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                animation: float 3s ease-in-out infinite;
            }

            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-8px); }
            }

            .hero h1 {
                font-family: 'Playfair Display', serif;
                font-size: clamp(52px, 9vw, 96px);
                line-height: 1.05;
                letter-spacing: -2px;
                color: #1a1a2e;
                font-weight: 700;
                background: linear-gradient(135deg, #1a1a2e 0%, #4a4a6e 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .hero p {
                max-width: 640px;
                font-size: 20px;
                color: rgba(26, 26, 46, 0.7);
                line-height: 1.8;
            }

            .cta-group {
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
            }

            .btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 18px 40px;
                border-radius: 100px;
                text-transform: uppercase;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 2px;
                border: none;
                cursor: pointer;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .btn-primary {
                background: linear-gradient(135deg, #d4a574 0%, #c89860 100%);
                color: #fff;
                box-shadow: 0 16px 40px rgba(200, 152, 96, 0.35);
            }

            .btn-primary:hover {
                transform: translateY(-4px);
                box-shadow: 0 20px 50px rgba(200, 152, 96, 0.45);
            }

            .btn-secondary {
                background: rgba(255, 255, 255, 0.9);
                color: #1a1a2e;
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.5);
            }

            .btn-secondary:hover {
                transform: translateY(-4px);
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
                background: #fff;
            }

            /* Section Headers */
            .section-eyebrow {
                display: inline-flex;
                padding: 12px 28px;
                border-radius: 100px;
                background: rgba(255, 255, 255, 0.8);
                text-transform: uppercase;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 3px;
                color: rgba(26, 26, 46, 0.5);
                margin-bottom: 32px;
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.5);
            }

            .section-heading {
                font-family: 'Playfair Display', serif;
                font-size: clamp(40px, 7vw, 64px);
                color: #1a1a2e;
                margin-bottom: 24px;
                max-width: 800px;
                font-weight: 700;
                line-height: 1.1;
                letter-spacing: -1px;
            }

            .section-lead {
                max-width: 720px;
                color: rgba(26, 26, 46, 0.7);
                font-size: 20px;
                margin-bottom: 16px;
                line-height: 1.8;
            }

            address {
                font-style: normal;
                font-size: 13px;
                letter-spacing: 3px;
                text-transform: uppercase;
                color: rgba(26, 26, 46, 0.5);
                margin-bottom: 48px;
                font-weight: 600;
            }

            /* Schedule Section */
            .section-card {
                background: rgba(255, 255, 255, 0.85);
                border-radius: 48px;
                padding: 56px 64px;
                box-shadow: 0 32px 80px rgba(0, 0, 0, 0.08), 
                            0 12px 32px rgba(0, 0, 0, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.6);
                backdrop-filter: blur(20px);
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .section-card:hover {
                box-shadow: 0 40px 100px rgba(0, 0, 0, 0.1), 
                            0 16px 40px rgba(0, 0, 0, 0.05);
                transform: translateY(-4px);
            }

            .schedule-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                gap: 32px;
            }

            .schedule-item {
                background: rgba(255, 255, 255, 0.9);
                border-radius: 32px;
                padding: 36px;
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.6);
                display: grid;
                gap: 16px;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .schedule-item:hover {
                transform: translateY(-6px);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
            }

            .schedule-item span {
                text-transform: uppercase;
                letter-spacing: 2.5px;
                font-size: 11px;
                font-weight: 700;
                color: rgba(26, 26, 46, 0.45);
            }

            .schedule-item h3 {
                font-size: 26px;
                font-weight: 700;
                color: #1a1a2e;
                font-family: 'Playfair Display', serif;
            }

            .schedule-item p {
                color: rgba(26, 26, 46, 0.65);
                line-height: 1.8;
                font-size: 16px;
            }

            /* Enhanced Outreach Section with Scroll Container */
            .outreach {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }

            .outreach-header {
                margin-bottom: 0;
                position: relative;
                z-index: 1;
            }

            .outreach-header .section-eyebrow {
                display: none;
            }

            .outreach-header .section-lead {
                display: none;
            }

            .outreach-title-sticky {
                position: sticky;
                top: 130px;
                z-index: 50;
                text-align: center;
                padding: 20px 0;
                margin-bottom: 60px;
                pointer-events: none;
            }

            .outreach-title-sticky h2 {
                font-family: 'Playfair Display', serif;
                font-size: clamp(28px, 5vw, 42px);
                color: #1a1a2e;
                font-weight: 700;
                line-height: 1.2;
                text-shadow: 0 2px 16px rgba(255, 255, 255, 0.9),
                             0 0 40px rgba(255, 255, 255, 0.8);
            }

            .outreach-scroll-container {
                position: relative;
                margin-top: 0;
            }

            .sticky-wrapper {
                position: sticky;
                top: 24vh;
                height: 60vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .events-container {
                width: 100%;
                max-width: 1000px;
                margin: 0 auto;
                position: relative;
            }

            .event-slide {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                opacity: 0;
                transform: translateY(40px) scale(0.96);
                transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1),
                            transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: none;
            }

            .event-slide.active {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: auto;
                position: relative;
            }

            .scroll-spacer {
                height: 300vh;
                pointer-events: none;
            }

            /* Event Cards with Enhanced Styling */
            .event-card {
                background: rgba(255, 255, 255, 0.95);
                border-radius: 32px;
                padding: 0;
                box-shadow: 0 24px 64px rgba(0, 0, 0, 0.08), 
                            0 8px 24px rgba(0, 0, 0, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(30px);
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
            }

            .event-card:hover {
                transform: translateY(-8px);
                box-shadow: 0 50px 120px rgba(0, 0, 0, 0.15), 
                            0 20px 50px rgba(0, 0, 0, 0.08);
            }

            .event-header {
                margin-bottom: 0;
                padding: 40px 48px 32px 48px;
            }

            .event-date {
                display: inline-flex;
                align-items: center;
                padding: 10px 24px;
                background: linear-gradient(135deg, #d4a574 0%, #c89860 100%);
                color: #fff;
                border-radius: 100px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 2px;
                text-transform: uppercase;
                box-shadow: 0 8px 24px rgba(200, 152, 96, 0.35);
                margin-bottom: 20px;
            }

            .event-title {
                font-family: 'Playfair Display', serif;
                font-size: clamp(32px, 5vw, 48px);
                color: #1a1a2e;
                margin-bottom: 16px;
                font-weight: 700;
                line-height: 1.2;
            }

            .event-time {
                font-size: 16px;
                color: rgba(26, 26, 46, 0.6);
                font-weight: 600;
                letter-spacing: 1px;
                text-transform: uppercase;
                margin-bottom: 24px;
            }

            .event-content {
                display: grid;
                gap: 0;
                grid-template-columns: 1fr 1fr;
                align-items: stretch;
                min-height: 400px;
            }

            .event-content.flyer-left {
                grid-template-columns: 1fr 1fr;
            }

            .event-content.flyer-left .event-flyer-container {
                order: -1;
            }

            .event-description {
                display: flex;
                flex-direction: column;
                gap: 24px;
                padding: 0 48px 40px 48px;
                justify-content: center;
            }

            .event-description p {
                color: rgba(26, 26, 46, 0.7);
                line-height: 1.9;
                font-size: 17px;
            }

            .event-description ul {
                list-style: none;
                display: grid;
                gap: 12px;
                padding-left: 0;
            }

            .event-description li {
                display: flex;
                gap: 12px;
                align-items: flex-start;
                color: rgba(26, 26, 46, 0.7);
                font-size: 16px;
            }

            .event-description li::before {
                content: '';
                width: 8px;
                height: 8px;
                background: linear-gradient(135deg, #d4a574 0%, #c89860 100%);
                border-radius: 50%;
                margin-top: 8px;
                flex-shrink: 0;
                box-shadow: 0 4px 12px rgba(200, 152, 96, 0.4);
            }

            .event-flyer-container {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 40px;
                background: linear-gradient(135deg, rgba(248, 248, 252, 0.5) 0%, rgba(242, 242, 248, 0.5) 100%);
            }

            .flyer-frame {
                width: 100%;
                max-width: 380px;
                background: #ffffff;
                border-radius: 20px;
                padding: 16px;
                box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12),
                            0 4px 16px rgba(0, 0, 0, 0.08);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .flyer-frame:hover {
                transform: translateY(-6px) scale(1.02);
                box-shadow: 0 24px 64px rgba(0, 0, 0, 0.16),
                            0 8px 24px rgba(0, 0, 0, 0.1);
            }

            .flyer-image {
                width: 100%;
                border-radius: 12px;
                display: block;
            }

            .placeholder-flyer {
                width: 100%;
                aspect-ratio: 3/4;
                background: linear-gradient(135deg, #e8e8e8 0%, #d4d4d4 100%);
                border-radius: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                color: rgba(26, 26, 46, 0.4);
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 2px;
            }

            .event-cta {
                margin-top: 8px;
            }

            /* Watch Section */
            .watch-card {
                background: linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 100%);
                border-radius: 48px;
                padding: 64px;
                display: grid;
                gap: 56px;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                color: #ffffff;
                box-shadow: 0 40px 100px rgba(0, 0, 0, 0.3);
                position: relative;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .watch-card::before {
                content: '';
                position: absolute;
                inset: 0;
                background: radial-gradient(circle at top right, rgba(212, 165, 116, 0.2), transparent 60%);
                pointer-events: none;
            }

            .watch-copy {
                position: relative;
                z-index: 1;
                display: grid;
                gap: 24px;
            }

            .watch-copy .section-eyebrow {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.8);
                box-shadow: none;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .watch-copy h2 {
                font-family: 'Playfair Display', serif;
                font-size: clamp(36px, 6vw, 52px);
                line-height: 1.2;
                font-weight: 700;
            }

            .watch-copy p {
                color: rgba(255, 255, 255, 0.75);
                line-height: 1.9;
                font-size: 18px;
            }

            .watch-meta {
                display: grid;
                gap: 12px;
                font-size: 16px;
                color: rgba(255, 255, 255, 0.7);
            }

            .watch-meta strong {
                color: #ffffff;
            }

            .stream-preview {
                position: relative;
                z-index: 1;
                display: grid;
                gap: 28px;
            }

            .preview-screen {
                background: rgba(255, 255, 255, 0.08);
                border-radius: 32px;
                border: 1px solid rgba(255, 255, 255, 0.15);
                padding: 40px;
                display: grid;
                gap: 20px;
                min-height: 240px;
                backdrop-filter: blur(10px);
            }

            .live-status {
                display: inline-flex;
                align-items: center;
                gap: 12px;
                background: rgba(244, 114, 94, 0.2);
                border-radius: 100px;
                padding: 8px 20px;
                color: #ffb5a6;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 2px;
                text-transform: uppercase;
            }

            .live-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #ff7761;
                box-shadow: 0 0 16px rgba(255, 119, 97, 0.7);
                animation: pulse 2s ease-in-out infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.1); }
            }

            .preview-screen p {
                color: rgba(255, 255, 255, 0.85);
                line-height: 1.9;
                font-size: 18px;
            }

            .preview-screen small {
                display: block;
                color: rgba(255, 255, 255, 0.6);
                font-size: 14px;
                margin-top: 8px;
                letter-spacing: 1px;
            }

            .btn-outline {
                background: transparent;
                border: 2px solid rgba(255, 255, 255, 0.5);
                color: #ffffff;
                padding: 16px 38px;
                box-shadow: none;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .btn-outline:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 255, 255, 0.7);
                transform: translateY(-4px);
            }

            /* Responsive Design */
            @media (max-width: 1024px) {
                .event-content {
                    grid-template-columns: 1fr;
                    gap: 0;
                }

                .event-flyer-container {
                    order: -1;
                    padding: 32px;
                }

                .event-description {
                    padding: 32px;
                }

                .event-header {
                    padding: 32px 32px 24px 32px;
                }

                .outreach-title-sticky {
                    top: 110px;
                    font-size: 32px;
                }

                .sticky-wrapper {
                    top: 20vh;
                }
            }

            @media (max-width: 960px) {
                .nav-shell {
                    flex-wrap: wrap;
                    border-radius: 40px;
                    gap: 24px;
                    margin: 32px auto 80px;
                    padding: 24px 32px;
                }

                nav ul {
                    width: 100%;
                    justify-content: center;
                    flex-wrap: wrap;
                    row-gap: 16px;
                }

                .nav-cta {
                    width: 100%;
                }

                .brand {
                    align-items: center;
                    width: 100%;
                }
            }

            @media (max-width: 680px) {
                .page {
                    width: 90%;
                }

                main {
                    gap: 120px;
                }

                .section-card {
                    padding: 40px;
                    border-radius: 36px;
                }

                .event-card {
                    padding: 0;
                    border-radius: 24px;
                }

                .event-header {
                    padding: 24px 24px 20px 24px;
                }

                .event-description {
                    padding: 0 24px 32px 24px;
                }

                .event-flyer-container {
                    padding: 24px;
                }

                .outreach-title-sticky {
                    top: 100px;
                }

                .outreach-title-sticky h2 {
                    font-size: 28px;
                }

                .watch-card {
                    padding: 40px 28px;
                    border-radius: 36px;
                }

                .sticky-wrapper {
                    height: 60vh;
                }
            }
        </style>
    </head>
    <body>
        <div class="page">
            <header class="nav-shell">
                <div class="brand">
                    <span class="brand-title">Morning Star</span>
                    <span class="brand-subtitle">Christian Church</span>
                </div>
                <nav>
                    <ul>
                        <li><a href="#home">Home</a></li>
                        <li><a href="#schedule">Schedule</a></li>
                        <li><a href="#outreach">Outreach</a></li>
                        <li><a href="#watch">Watch</a></li>
                    </ul>
                </nav>
                <a class="nav-cta" href="/form">Submit the form</a>
            </header>
            <main>
                <section class="hero" id="home" style="animation-delay: 0.1s">
                    <h1>Mending the Broken.</h1>
                    <p>Join us every Sunday as we worship, learn, and serve together. Expect meaningful teaching, passionate worship, and a community devoted to making Boise brighter.</p>
                    <div class="cta-group">
                        <a class="btn btn-primary" href="/form">Submit the form</a>
                        <a class="btn btn-secondary" href="#watch">Watch live stream</a>
                    </div>
                </section>
                
                <section class="schedule" id="schedule" style="animation-delay: 0.2s">
                    <span class="section-eyebrow">Weekly Schedule</span>
                    <h2 class="section-heading">Three simple touchpoints to connect every week.</h2>
                    <p class="section-lead">We gather on Sundays, grow in community throughout the week, and stay rooted in Boise. You'll find us at:</p>
                    <address>3080 N Wildwood St · Boise, Idaho</address>
                    <div class="section-card">
                        <div class="schedule-grid">
                            <article class="schedule-item">
                                <span>Sunday Gatherings</span>
                                <h3>9:00 AM</h3>
                                <p>Worship & kids environments for every age.</p>
                            </article>
                            <article class="schedule-item">
                                <span>Bible Study</span>
                                <h3>Tuesdays · 8:30 AM</h3>
                                <p>Morning study with hot coffee, child care, and community prayer.</p>
                            </article>
                            <article class="schedule-item">
                                <span>Bible Study</span>
                                <h3>Thursdays · 6:00 PM</h3>
                                <p>Evening groups across Boise with dinner, discussion, and worship.</p>
                            </article>
                        </div>
                    </div>
                </section>
                
                <section class="outreach" id="outreach" style="animation-delay: 0.3s">
                    <div class="outreach-header">
                        <span class="section-eyebrow">Outreach</span>
                        <h2 class="section-heading">Upcoming Events</h2>
                        <p class="section-lead">We are called to be the hands and feet of Jesus by serving our local community and growing in fellowship. Here's how you can get involved.</p>
                    </div>
                    
                    <div class="outreach-scroll-container">
                        <div class="outreach-title-sticky">
                            <h2>Upcoming Events</h2>
                        </div>
                        <div class="sticky-wrapper">
                            <div class="events-container">
                                <!-- Event 1: Community Thanksgiving Dinner -->
                                <div class="event-slide active" data-event="1">
                                    <div class="event-card">
                                        <div class="event-header">
                                            <span class="event-date">Nov 26</span>
                                            <h3 class="event-title">Community Thanksgiving Dinner</h3>
                                            <div class="event-time">11:00 AM - 1:00 PM</div>
                                        </div>
                                        <div class="event-content flyer-left">
                                            <div class="event-description">
                                                <p>Join us for a community Thanksgiving dinner. All are welcome to share a meal and give thanks together. Find more details on our Outreach page.</p>
                                                <ul>
                                                    <li>Bring a side or dessert to share</li>
                                                    <li>Kid-friendly seating and activities</li>
                                                    <li>Fellowship and community prayer</li>
                                                    <li>All ages welcome</li>
                                                </ul>
                                                <div class="event-cta">
                                                    <a class="btn btn-primary" href="/form">RSVP Now</a>
                                                </div>
                                            </div>
                                            <div class="event-flyer-container">
                                                <div class="flyer-frame">
                                                    <img src="/static/friendsgiving-flyer.png" alt="Friendsgiving Lunch Flyer" class="flyer-image">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Event 2: Christmas Clothes Drive -->
                                <div class="event-slide" data-event="2">
                                    <div class="event-card">
                                        <div class="event-header">
                                            <span class="event-date">Dec 6</span>
                                            <h3 class="event-title">Christmas Clothes Drive for Mothers</h3>
                                            <div class="event-time">Drop-off during office hours</div>
                                        </div>
                                        <div class="event-content">
                                            <div class="event-description">
                                                <p>We are collecting new and gently used winter clothing for single mothers and their children in our community. Your donations can make a significant difference this winter.</p>
                                                <ul>
                                                    <li>Winter coats, sweaters, and warm clothing</li>
                                                    <li>Children's clothing all sizes</li>
                                                    <li>New socks and undergarments</li>
                                                    <li>Accessories like gloves, scarves, and hats</li>
                                                </ul>
                                                <div class="event-cta">
                                                    <a class="btn btn-primary" href="/form">Volunteer or Request Items</a>
                                                </div>
                                            </div>
                                            <div class="event-flyer-container">
                                                <div class="flyer-frame">
                                                    <div class="placeholder-flyer">
                                                        Flyer Coming Soon
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Event 3: Christmas Eve Candlelight Service -->
                                <div class="event-slide" data-event="3">
                                    <div class="event-card">
                                        <div class="event-header">
                                            <span class="event-date">Dec 24</span>
                                            <h3 class="event-title">Christmas Eve Candlelight Service</h3>
                                            <div class="event-time">5:00 PM & 7:00 PM</div>
                                        </div>
                                        <div class="event-content flyer-left">
                                            <div class="event-description">
                                                <p>Celebrate the birth of Jesus with us at our special candlelight services. A beautiful evening of carols, scripture, and reflection in the main sanctuary.</p>
                                                <ul>
                                                    <li>Traditional Christmas carols</li>
                                                    <li>Candlelight ceremony</li>
                                                    <li>Scripture reading and reflection</li>
                                                    <li>Family-friendly service</li>
                                                </ul>
                                                <div class="event-cta">
                                                    <a class="btn btn-primary" href="/form">Reserve Your Seat</a>
                                                </div>
                                            </div>
                                            <div class="event-flyer-container">
                                                <div class="flyer-frame">
                                                    <div class="placeholder-flyer">
                                                        Flyer Coming Soon
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="scroll-spacer"></div>
                    </div>
                </section>
                
                <section class="watch" id="watch" style="animation-delay: 0.4s">
                    <div class="watch-card">
                        <div class="watch-copy">
                            <span class="section-eyebrow">Watch</span>
                            <h2>Join us live every Sunday.</h2>
                            <p>Tune in from wherever you are to worship together online. Our stream goes live fifteen minutes before service begins.</p>
                            <div class="watch-meta">
                                <span><strong>Sundays</strong> · 10:30 AM (MST)</span>
                                <span><strong>YouTube & Facebook</strong> @morningstarboise</span>
                            </div>
                        </div>
                        <div class="stream-preview">
                            <div class="preview-screen">
                                <span class="live-status"><span class="live-dot"></span>Live Soon</span>
                                <p>"He heals the brokenhearted and binds up their wounds."<small>Psalm 147:3</small></p>
                            </div>
                            <a class="btn btn-outline" href="https://www.youtube.com/" target="_blank" rel="noopener">Open live stream</a>
                        </div>
                    </div>
                </section>
            </main>
        </div>

        <script>
            // Smooth scroll animation for events with background color change
            document.addEventListener('DOMContentLoaded', () => {
                const eventSlides = document.querySelectorAll('.event-slide');
                const body = document.body;
                const outreachSection = document.querySelector('.outreach');
                const scrollSpacer = document.querySelector('.scroll-spacer');
                
                let currentEventIndex = 0;
                const totalEvents = eventSlides.length;
                
                // Track if we're in the outreach section
                let inOutreachSection = false;
                
                // Smooth scroll handler
                function handleScroll() {
                    if (!outreachSection || !scrollSpacer) return;
                    
                    const outreachRect = outreachSection.getBoundingClientRect();
                    const spacerRect = scrollSpacer.getBoundingClientRect();
                    
                    // Check if we're in the outreach section
                    if (outreachRect.top <= window.innerHeight * 0.3 && spacerRect.bottom > window.innerHeight * 0.7) {
                        // Just entering the section
                        if (!inOutreachSection) {
                            inOutreachSection = true;
                            // Small delay to ensure CSS transition applies smoothly
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    updateActiveEvent(currentEventIndex, false);
                                });
                            });
                        }
                        
                        // Calculate scroll progress through the spacer
                        const spacerTop = spacerRect.top - window.innerHeight * 0.3;
                        const spacerHeight = spacerRect.height - window.innerHeight * 0.4;
                        const scrollProgress = Math.max(0, Math.min(1, -spacerTop / spacerHeight));
                        
                        // Calculate which event should be shown
                        const newEventIndex = Math.floor(scrollProgress * totalEvents);
                        const clampedIndex = Math.max(0, Math.min(totalEvents - 1, newEventIndex));
                        
                        // Update event if changed
                        if (clampedIndex !== currentEventIndex) {
                            currentEventIndex = clampedIndex;
                            updateActiveEvent(currentEventIndex, false);
                        }
                    } else {
                        // Outside the outreach section - reset to default background
                        if (inOutreachSection) {
                            inOutreachSection = false;
                            // Ensure smooth fade out by using requestAnimationFrame
                            requestAnimationFrame(() => {
                                resetBackground();
                            });
                        }
                        
                        // Still update event index for proper state
                        if (spacerRect.bottom <= window.innerHeight * 0.7) {
                            // Scrolled past - show last event
                            if (currentEventIndex !== totalEvents - 1) {
                                currentEventIndex = totalEvents - 1;
                                updateActiveEvent(currentEventIndex, true);
                            }
                        } else if (outreachRect.top > window.innerHeight * 0.3) {
                            // Before section - show first event
                            if (currentEventIndex !== 0) {
                                currentEventIndex = 0;
                                updateActiveEvent(0, true);
                            }
                        }
                    }
                }
                
                function updateActiveEvent(index, skipBackground = false) {
                    // Remove active class from all events
                    eventSlides.forEach(slide => slide.classList.remove('active'));
                    
                    // Add active class to current event
                    if (eventSlides[index]) {
                        eventSlides[index].classList.add('active');
                        
                        // Update body background based on event (only if in section)
                        if (!skipBackground) {
                            body.classList.remove('event-1-active', 'event-2-active', 'event-3-active');
                            body.classList.add(\`event-\${index + 1}-active\`);
                        }
                    }
                }
                
                function resetBackground() {
                    // Remove all event background classes to return to default
                    body.classList.remove('event-1-active', 'event-2-active', 'event-3-active');
                }
                
                // Throttle scroll events for performance
                let ticking = false;
                window.addEventListener('scroll', () => {
                    if (!ticking) {
                        window.requestAnimationFrame(() => {
                            handleScroll();
                            ticking = false;
                        });
                        ticking = true;
                    }
                });
                
                // Initial check
                handleScroll();
                
                // Smooth scrolling for navigation links
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        const target = document.querySelector(this.getAttribute('href'));
                        if (target) {
                            target.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }
                    });
                });
            });
        </script>
    </body>
    </html>
  `)
})

// Other routes remain the same
app.get('/form', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact - Morning Star Christian Church</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
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

export default app
