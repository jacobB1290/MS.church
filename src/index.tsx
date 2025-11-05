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
                --bg-event3: linear-gradient(135deg, #c8e6c8 0%, #ffe0e0 50%, #d4f0d4 100%); /* Vibrant green to soft red to vibrant green for Christmas */
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

            /* Navigation Spacer - maintains layout when nav is fixed */
            .nav-spacer {
                height: 380px;
                pointer-events: none;
            }

            /* Enhanced Navigation */
            .nav-shell {
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
                position: fixed;
                top: 32px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 1000;
                border: 1px solid rgba(255, 255, 255, 0.4);
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                width: min(1280px, 94%);
            }
            
            .nav-shell.scrolled-mobile {
                padding: 10px 20px;
                top: 16px;
            }
            
            .nav-shell.scrolled-mobile .brand {
                display: none;
            }
            
            .nav-shell.scrolled-mobile .nav-cta {
                display: none;
            }
            
            /* Mobile-only form button for scrolled state */
            .nav-form-btn {
                display: none;
            }
            
            .nav-shell.scrolled-mobile nav ul {
                margin: 0;
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

            nav a.active {
                opacity: 1;
                color: #d4a574;
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

            nav a.active::after {
                transform: translateX(-50%) scaleX(1);
                background: #d4a574;
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
                background: rgba(255, 255, 255, 0.9);
                color: #1a1a2e;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 2px;
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.5);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }

            .nav-cta:hover {
                transform: translateY(-3px);
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
                background: rgba(255, 255, 255, 1);
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
            
            .hero-title {
                /* Inherits from .hero h1 styles below */
            }
            
            .hero-body {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 60px;
                align-items: start;
            }
            
            .hero-content {
                display: grid;
                gap: 32px;
            }
            
            .hero-image {
                position: relative;
                width: 100%;
                height: 100%;
                min-height: 450px;
                border-radius: 32px;
                overflow: hidden;
                box-shadow: 0 32px 80px rgba(0, 0, 0, 0.15);
            }
            
            .hero-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
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
                margin-bottom: 60vh;
                position: sticky;
                top: 80px;
                z-index: 10;
                text-align: left;
            }

            .outreach-header .section-eyebrow {
                display: inline-flex;
            }

            .outreach-header .section-lead {
                display: none;
            }

            .outreach-header .section-heading {
                text-align: left;
            }

            /* Removed sticky title - now using sticky header instead */

            .outreach-scroll-container {
                position: relative;
                margin-top: 0;
            }

            .sticky-wrapper {
                position: sticky;
                top: 30vh;
                height: 48vh;
                display: flex;
                flex-direction: column;
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
                visibility: hidden;
                transform: translateY(20px);
                transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                            transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                            visibility 0s 0.5s;
                pointer-events: none;
            }

            .event-slide.active {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
                pointer-events: auto;
                position: relative;
                transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                            transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                            visibility 0s 0s;
            }

            .scroll-spacer {
                height: 400vh;
                pointer-events: none;
            }
            
            /* Event Indicator Dots */
            .event-indicators {
                display: none;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 8px;
                padding: 0;
                position: fixed;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                z-index: 60;
            }
            
            .event-dot {
                width: 8px;
                height: 24px;
                border-radius: 12px;
                background: rgba(26, 26, 46, 0.15);
                transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
            }
            
            .event-dot.active {
                height: 40px;
                background: linear-gradient(180deg, #d4a574 0%, #c89860 100%);
                box-shadow: 0 4px 16px rgba(200, 152, 96, 0.4);
            }
            
            .event-dot:hover {
                background: rgba(26, 26, 46, 0.3);
            }
            
            .scroll-hint {
                display: none;
                position: fixed;
                bottom: 40px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 60;
                text-align: center;
                animation: bounce 2s ease-in-out infinite;
            }
            
            .scroll-hint-icon {
                font-size: 24px;
                color: rgba(26, 26, 46, 0.4);
                margin-bottom: 4px;
            }
            
            .scroll-hint-text {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 2px;
                font-weight: 700;
                color: rgba(26, 26, 46, 0.4);
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateX(-50%) translateY(0); }
                50% { transform: translateX(-50%) translateY(-8px); }
            }

            /* Event Cards - Redesigned Streamlined Layout */
            .event-card {
                background: rgba(255, 255, 255, 0.95);
                border-radius: 24px;
                padding: 0;
                box-shadow: 0 24px 64px rgba(0, 0, 0, 0.08), 
                            0 8px 24px rgba(0, 0, 0, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(30px);
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
                position: relative;
                z-index: 100;
                display: flex;
                flex-direction: column;
            }

            .event-card:hover {
                transform: translateY(-8px);
                box-shadow: 0 50px 120px rgba(0, 0, 0, 0.15), 
                            0 20px 50px rgba(0, 0, 0, 0.08);
            }

            .event-header {
                margin-bottom: 0;
                padding: 0;
                position: relative;
                display: flex;
                flex-direction: column;
            }
            
            .event-header-mobile {
                display: none;
            }
            
            .event-header-content {
                order: 2;
                padding: 12px 27px 9px 27px;
            }

            .event-date {
                order: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 9px 27px;
                background: linear-gradient(135deg, #d4a574 0%, #c89860 100%);
                color: #fff;
                border-radius: 0;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 2px;
                text-transform: uppercase;
                box-shadow: none;
                margin-bottom: 0;
                width: 100%;
            }

            .event-title {
                font-family: 'Playfair Display', serif;
                font-size: clamp(30px, 4.8vw, 39px);
                color: #1a1a2e;
                margin-bottom: 5px;
                font-weight: 700;
                line-height: 1.1;
            }

            .event-time {
                font-size: 15px;
                color: rgba(26, 26, 46, 0.65);
                font-weight: 600;
                letter-spacing: 0.5px;
                margin-bottom: 0;
            }

            .event-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 0;
                gap: 0;
            }

            .event-content.flyer-left {
                flex-direction: column;
            }

            .event-content.flyer-left .event-flyer-container {
                order: 0;
            }

            .event-description {
                display: none; /* Hide all description text and bullets */
            }

            .event-description p {
                display: none;
            }

            .event-description ul {
                display: none;
            }

            .event-description li {
                display: none;
            }

            .event-description li::before {
                display: none;
            }

            .event-flyer-container {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 12px 27px;
                background: transparent;
                width: 100%;
            }

            .flyer-frame {
                width: 100%;
                max-width: 100%;
                background: #ffffff;
                border-radius: 15px;
                padding: 9px;
                box-shadow: 0 9px 30px rgba(0, 0, 0, 0.08),
                            0 5px 12px rgba(0, 0, 0, 0.04);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .flyer-frame:hover {
                transform: translateY(-4px);
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12),
                            0 6px 16px rgba(0, 0, 0, 0.06);
            }

            .flyer-image {
                width: 100%;
                max-height: 270px;
                object-fit: cover;
                border-radius: 8px;
                display: block;
            }

            .placeholder-flyer {
                width: 100%;
                height: 270px;
                background: linear-gradient(135deg, #e8e8e8 0%, #d4d4d4 100%);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 15px;
                color: rgba(26, 26, 46, 0.4);
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 2px;
            }

            .event-cta {
                margin-top: 0;
                padding: 0 27px 18px 27px;
                width: 100%;
                box-sizing: border-box;
            }
            
            .event-cta .btn {
                width: 100%;
                padding: 15px 30px;
                font-size: 13px;
                border-radius: 100px;
            }

            /* Watch Section */
            .watch {
                display: flex;
                flex-direction: column;
                gap: 32px;
            }

            .watch-header {
                text-align: left;
            }

            .watch-card {
                background: linear-gradient(135deg, #8B0000 0%, #5A0000 100%);
                border-radius: 32px;
                padding: 48px;
                color: #ffffff;
                box-shadow: 0 32px 80px rgba(139, 0, 0, 0.3);
                position: relative;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .watch-main {
                position: relative;
                z-index: 1;
                display: flex;
                flex-direction: column;
                gap: 32px;
            }

            .preview-screen {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 24px;
                border: 1px solid rgba(255, 255, 255, 0.15);
                padding: 48px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 24px;
                min-height: 320px;
                backdrop-filter: blur(10px);
                text-align: center;
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
                background: rgba(255, 255, 255, 0.95);
                border: 2px solid #ffffff;
                color: #FF0000;
                padding: 16px 38px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                font-weight: 700;
            }

            .btn-outline:hover {
                background: #ffffff;
                transform: translateY(-4px);
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
            }

            .past-streams {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 24px;
                margin-top: 16px;
            }

            .stream-thumbnail {
                aspect-ratio: 16/9;
                background: rgba(0, 0, 0, 0.4);
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                color: rgba(255, 255, 255, 0.5);
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
            }

            .stream-thumbnail:hover {
                background: rgba(0, 0, 0, 0.6);
                border-color: rgba(255, 255, 255, 0.3);
                transform: translateY(-4px);
            }

            .past-streams-label {
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 16px;
            }

            /* Contact Section */
            .contact {
                display: flex;
                flex-direction: column;
                gap: 48px;
            }
            
            .contact-header {
                text-align: center;
                max-width: 800px;
                margin: 0 auto;
            }
            
            .contact-container {
                width: 100%;
            }
            
            .contact-card {
                background: rgba(255, 255, 255, 0.85);
                border-radius: 48px;
                padding: 64px;
                box-shadow: 0 32px 80px rgba(0, 0, 0, 0.08), 
                            0 12px 32px rgba(0, 0, 0, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.6);
                backdrop-filter: blur(20px);
                display: grid;
                grid-template-columns: 1.5fr 1fr;
                gap: 64px;
                align-items: start;
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .contact-card:hover {
                box-shadow: 0 40px 100px rgba(0, 0, 0, 0.1), 
                            0 16px 40px rgba(0, 0, 0, 0.05);
                transform: translateY(-4px);
            }
            
            .contact-form {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .form-group-full {
                grid-column: 1 / -1;
            }
            
            .form-group label {
                font-size: 13px;
                font-weight: 700;
                letter-spacing: 1px;
                text-transform: uppercase;
                color: rgba(26, 26, 46, 0.7);
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                padding: 16px 20px;
                border: 2px solid rgba(26, 26, 46, 0.1);
                border-radius: 16px;
                font-size: 16px;
                font-family: inherit;
                background: rgba(255, 255, 255, 0.9);
                color: #1a1a2e;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .form-group input::placeholder,
            .form-group textarea::placeholder {
                color: rgba(26, 26, 46, 0.4);
            }
            
            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #d4a574;
                background: white;
                box-shadow: 0 8px 24px rgba(212, 165, 116, 0.15);
                transform: translateY(-2px);
            }
            
            .form-group textarea {
                resize: vertical;
                min-height: 140px;
                line-height: 1.6;
            }
            
            .form-group select {
                cursor: pointer;
                appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%231a1a2e' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 20px center;
                padding-right: 50px;
            }
            
            .btn-submit {
                width: 100%;
                margin-top: 8px;
                cursor: pointer;
                font-size: 13px;
                padding: 20px 40px;
            }
            
            .btn-submit:hover {
                transform: translateY(-4px) scale(1.02);
            }
            
            .contact-info {
                display: flex;
                flex-direction: column;
                gap: 32px;
                padding-top: 8px;
            }
            
            .contact-info-item {
                display: flex;
                gap: 20px;
                align-items: flex-start;
                padding: 24px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.8);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .contact-info-item:hover {
                background: rgba(255, 255, 255, 0.9);
                transform: translateX(4px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
            }
            
            .contact-icon {
                font-size: 32px;
                line-height: 1;
                flex-shrink: 0;
            }
            
            .contact-text h4 {
                font-size: 16px;
                font-weight: 700;
                color: #1a1a2e;
                margin-bottom: 6px;
                letter-spacing: 0.5px;
            }
            
            .contact-text p {
                font-size: 15px;
                color: rgba(26, 26, 46, 0.7);
                line-height: 1.6;
            }

            /* Responsive Design */
            @media (max-width: 1024px) {
                .event-content {
                    grid-template-columns: 1fr;
                    gap: 0;
                    min-height: auto;
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
                
                .flyer-frame {
                    max-width: 100%;
                }
                
                .placeholder-flyer {
                    aspect-ratio: 3/4;
                }

                .outreach-title-sticky {
                    top: 110px;
                }

                .sticky-wrapper {
                    top: 20vh;
                }
                
                .scroll-spacer {
                    height: 350vh;
                }
            }

            @media (max-width: 960px) {
                .nav-shell {
                    flex-wrap: wrap;
                    border-radius: 40px;
                    gap: 16px;
                    margin: 20px auto 50px;
                    padding: 16px 20px;
                    top: 12px;
                }
                
                .nav-shell.scrolled-mobile {
                    border-radius: 100px;
                    padding: 8px 20px;
                    gap: 0;
                    margin-bottom: 30px;
                    top: 8px;
                }

                nav ul {
                    width: 100%;
                    justify-content: center;
                    flex-wrap: wrap;
                    row-gap: 10px;
                    gap: 18px;
                }
                
                .nav-shell.scrolled-mobile nav ul {
                    gap: 16px;
                    row-gap: 0;
                }

                .nav-cta {
                    width: 100%;
                    padding: 10px 24px;
                    font-size: 10px;
                }

                .brand {
                    align-items: center;
                    width: 100%;
                }

                .brand-title {
                    font-size: 16px;
                    letter-spacing: 2px;
                }

                .brand-subtitle {
                    font-size: 9px;
                    letter-spacing: 3px;
                }
                
                nav a {
                    font-size: 10px;
                    letter-spacing: 2px;
                }

                .hero h1 {
                    font-size: clamp(36px, 8vw, 52px);
                    letter-spacing: -1px;
                }

                .hero p {
                    font-size: 18px;
                }

                .section-heading {
                    font-size: clamp(32px, 6vw, 48px);
                }

                .section-lead {
                    font-size: 18px;
                }

                .schedule-grid {
                    grid-template-columns: 1fr;
                    gap: 24px;
                }

                .schedule-item {
                    padding: 28px;
                }
            }

            @media (max-width: 768px) {
                .page {
                    width: 92%;
                }

                main {
                    gap: 100px;
                    margin-bottom: 100px;
                }

                section {
                    padding: 0;
                }

                .hero {
                    padding: 40px 0;
                }

                .hero h1 {
                    font-size: clamp(32px, 7vw, 44px);
                }

                .hero p {
                    font-size: 16px;
                    line-height: 1.7;
                }

                .btn {
                    padding: 16px 32px;
                    font-size: 11px;
                }

                .section-card {
                    padding: 36px 28px;
                    border-radius: 32px;
                }

                .section-eyebrow {
                    font-size: 9px;
                    padding: 10px 20px;
                    letter-spacing: 2.5px;
                }

                .section-heading {
                    font-size: clamp(28px, 5.5vw, 40px);
                    margin-bottom: 20px;
                }

                .section-lead {
                    font-size: 16px;
                    line-height: 1.7;
                }

                address {
                    font-size: 11px;
                    letter-spacing: 2px;
                    margin-bottom: 32px;
                }

                .schedule-item h3 {
                    font-size: 22px;
                }

                .schedule-item p {
                    font-size: 15px;
                }

                .outreach-title-sticky {
                    top: 75px;
                    padding: 10px 0;
                    margin-bottom: 30px;
                }

                .outreach-title-sticky h2 {
                    font-size: clamp(24px, 4.5vw, 36px);
                }
                
                .outreach-header {
                    margin-bottom: 40px;
                    padding-bottom: 0;
                }
                
                .outreach-header .section-heading {
                    margin-bottom: 16px;
                }
                
                .outreach-header .section-eyebrow {
                    margin-bottom: 16px;
                }

                .event-card {
                    border-radius: 20px;
                }
                
                .event-header-content {
                    padding: 20px 24px 16px 24px;
                }

                .event-title {
                    font-size: clamp(24px, 4vw, 32px);
                }

                .event-date {
                    font-size: 10px;
                    padding: 12px 24px;
                    letter-spacing: 1.5px;
                }

                .event-time {
                    font-size: 13px;
                }
                
                .event-flyer-container {
                    padding: 20px 24px;
                }
                
                .flyer-frame {
                    max-width: 100%;
                    padding: 10px;
                }
                
                .event-cta {
                    padding: 0 24px 24px 24px;
                }
                
                .event-cta .btn {
                    padding: 14px 28px;
                    font-size: 13px;
                }

                .watch-card {
                    padding: 32px 24px;
                    border-radius: 28px;
                }

                .preview-screen {
                    padding: 32px 24px;
                    min-height: 280px;
                }

                .preview-screen p {
                    font-size: 16px;
                    line-height: 1.7;
                }

                .preview-screen small {
                    font-size: 13px;
                }

                .past-streams {
                    grid-template-columns: 1fr;
                    gap: 16px;
                }
                
                /* Contact Section Tablet */
                .contact-card {
                    padding: 48px 36px;
                    border-radius: 36px;
                    grid-template-columns: 1fr;
                    gap: 48px;
                }
                
                .form-row {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 480px) {
                .page {
                    width: 100%;
                    padding: 0 5%;
                    box-sizing: border-box;
                }

                .nav-spacer {
                    height: 190px;
                }

                .nav-shell {
                    padding: 14px 18px;
                    border-radius: 32px;
                    top: 10px;
                    width: 94%;
                    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                
                .nav-shell.scrolled-mobile {
                    border-radius: 100px;
                    padding: 7px 18px;
                    top: 6px;
                }
                
                .nav-shell.scrolled-mobile .nav-cta {
                    display: none;
                }
                
                .nav-form-btn {
                    display: none;
                    padding: 6px 14px;
                    border-radius: 100px;
                    background: rgba(255, 255, 255, 0.9);
                    color: #1a1a2e;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                    align-items: center;
                    justify-content: center;
                    white-space: nowrap;
                    opacity: 0;
                    transform: scale(0.85);
                    position: absolute;
                    right: 18px;
                }
                
                .nav-shell.scrolled-mobile .nav-form-btn {
                    display: inline-flex;
                    opacity: 1;
                    transform: scale(1);
                    position: relative;
                    right: auto;
                }
                
                /* Show event indicators on mobile */
                .event-indicators {
                    display: flex;
                    right: 16px;
                }
                
                /* Show scroll hint on mobile */
                .scroll-hint {
                    display: block;
                }
                
                /* Mobile event card layout - streamlined vertical */
                .event-card {
                    border-radius: 20px;
                }
                
                .event-header {
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                }
                
                .event-header-content {
                    order: 2;
                    padding: 12px 21px 9px 21px;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                
                .event-date {
                    order: 1;
                    padding: 8px 21px;
                    font-size: 9px;
                    border-radius: 0;
                    letter-spacing: 1.5px;
                }
                
                .event-title {
                    font-size: clamp(24px, 6vw, 33px);
                    margin-bottom: 3px;
                    line-height: 1.1;
                }
                
                .event-time {
                    font-size: 12px;
                }
                
                .event-header-mobile {
                    display: none;
                }
                
                .event-flyer-mobile {
                    display: none;
                }
                
                /* Show large flyer in content on mobile */
                .event-content {
                    display: flex;
                    flex-direction: column;
                }
                
                .event-flyer-container {
                    display: flex !important;
                    padding: 12px 21px;
                }
                
                .flyer-frame {
                    padding: 8px;
                    border-radius: 12px;
                }
                
                .flyer-image {
                    max-height: 210px;
                }
                
                .placeholder-flyer {
                    height: 210px !important;
                }
                
                .event-cta {
                    padding: 0 21px 18px 21px;
                }
                
                .event-cta .btn {
                    padding: 14px 27px;
                    font-size: 12px;
                }

                .brand-title {
                    font-size: 18px;
                    letter-spacing: 1.8px;
                    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .brand-subtitle {
                    font-size: 11px;
                    letter-spacing: 2.8px;
                    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }

                nav ul {
                    gap: 18px;
                    row-gap: 8px;
                    justify-content: center;
                }
                
                nav {
                    text-align: center;
                    flex: 1;
                    display: flex;
                    justify-content: center;
                }
                
                nav ul {
                    margin: 0;
                    padding: 0;
                }
                
                .nav-shell.scrolled-mobile nav ul {
                    gap: 16px;
                    row-gap: 0;
                    justify-content: center;
                }

                nav a {
                    font-size: 13px;
                    letter-spacing: 1.8px;
                }
                
                .nav-shell.scrolled-mobile nav a {
                    font-size: 12px;
                    letter-spacing: 1.5px;
                }

                .nav-cta {
                    padding: 10px 20px;
                    font-size: 12px;
                    letter-spacing: 1.5px;
                }

                main {
                    gap: 100px;
                    margin-bottom: 80px;
                }

                .hero {
                    padding: 20px 0 60px;
                    min-height: auto;
                    gap: 20px;
                    background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%);
                    border-radius: 32px;
                    margin: 0;
                    padding-left: 0;
                    padding-right: 0;
                }
                
                .hero-body {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                
                .hero-content {
                    order: 2;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .hero-content p {
                    margin: 0;
                    line-height: 1.7;
                    text-align: center;
                }
                
                .hero-image {
                    order: 1;
                    min-height: 320px;
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .hero-image img {
                    object-position: center;
                }
                
                .hero-body .cta-group {
                    margin-top: 4px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    align-items: center;
                }
                
                .hero-body .cta-group .btn {
                    width: 100%;
                }

                .hero .eyebrow {
                    padding: 12px 24px;
                    font-size: 13px;
                    letter-spacing: 2.5px;
                }

                .hero h1 {
                    font-size: clamp(58px, 12vw, 77px);
                    line-height: 1.0;
                    letter-spacing: -1.5px;
                    margin: 0 0 20px 0;
                    text-align: center;
                }

                .hero p {
                    font-size: 20px;
                    line-height: 1.7;
                    max-width: 100%;
                }

                .cta-group {
                    flex-direction: column;
                    gap: 12px;
                    width: 100%;
                }

                .btn {
                    width: 100%;
                    padding: 16px 32px;
                    font-size: 14px;
                    letter-spacing: 2px;
                }

                .section-eyebrow {
                    font-size: 12px;
                    padding: 10px 20px;
                    letter-spacing: 2.5px;
                    margin-bottom: 16px;
                }

                .section-heading {
                    font-size: clamp(34px, 7vw, 43px);
                    margin-bottom: 16px;
                    line-height: 1.2;
                }

                .section-lead {
                    font-size: 16px;
                    line-height: 1.7;
                    margin-bottom: 12px;
                }

                address {
                    font-size: 13px;
                    letter-spacing: 2px;
                    margin-bottom: 20px;
                }

                .section-card {
                    padding: 18px 16px;
                    border-radius: 24px;
                }

                .schedule-grid {
                    gap: 16px;
                }

                .schedule-item {
                    padding: 16px 14px;
                    border-radius: 18px;
                    gap: 8px;
                }

                .schedule-item span {
                    font-size: 11px;
                    letter-spacing: 1.8px;
                }

                .schedule-item h3 {
                    font-size: 26px;
                }

                .schedule-item p {
                    font-size: 14px;
                    line-height: 1.5;
                }

                .outreach-title-sticky {
                    top: 60px;
                    padding: 6px 0;
                    margin-bottom: 20px;
                }

                .outreach-title-sticky h2 {
                    font-size: clamp(26px, 5vw, 34px);
                }
                
                .outreach-header {
                    margin-bottom: 24px;
                    padding-bottom: 0;
                }
                
                .outreach-header .section-heading {
                    margin-bottom: 8px;
                }
                
                .outreach-header .section-eyebrow {
                    margin-bottom: 10px;
                }
                
                .outreach-scroll-container {
                    margin-top: 0;
                }
                
                .outreach {
                    padding-top: 0;
                }

                .sticky-wrapper {
                    height: auto;
                    min-height: 42vh;
                    top: 28vh;
                    gap: 0;
                }

                .scroll-spacer {
                    height: 180vh;
                }
                
                .events-container {
                    margin-top: 0;
                    flex: 0 0 auto;
                }
                
                .event-indicators {
                    display: flex;
                    right: 16px;
                }
                
                .scroll-hint {
                    display: block;
                }

                .event-card {
                    border-radius: 24px;
                }

                .event-date {
                    font-size: 12px;
                    padding: 7px 16px;
                    letter-spacing: 1.8px;
                    margin-bottom: 0;
                }

                .event-title {
                    font-size: clamp(26px, 5.5vw, 31px);
                    margin-bottom: 6px;
                    line-height: 1.2;
                }

                .event-time {
                    font-size: 14px;
                    margin-bottom: 0;
                }
                
                .event-content {
                    min-height: auto;
                }

                .event-description {
                    padding: 0 20px 20px 20px;
                    gap: 14px;
                }

                .event-description p {
                    font-size: 17px;
                    line-height: 1.65;
                }

                .event-description ul {
                    gap: 8px;
                }

                .event-description li {
                    font-size: 16px;
                    line-height: 1.6;
                }

                .event-description li::before {
                    width: 6px;
                    height: 6px;
                    margin-top: 6px;
                }
                
                .event-cta {
                    margin-top: 4px;
                }
                
                .event-cta .btn {
                    padding: 12px 24px;
                    font-size: 11px;
                }
                
                .placeholder-flyer {
                    aspect-ratio: 3/4;
                }

                .flyer-image {
                    border-radius: 10px;
                }

                .placeholder-flyer {
                    font-size: 17px;
                    letter-spacing: 1.5px;
                    border-radius: 20px;
                }

                .watch-card {
                    padding: 28px 20px;
                    border-radius: 24px;
                }

                .preview-screen {
                    padding: 28px 20px;
                    min-height: 240px;
                    gap: 20px;
                    border-radius: 20px;
                }

                .live-status {
                    font-size: 13px;
                    padding: 7px 18px;
                    letter-spacing: 2px;
                }

                .live-dot {
                    width: 9px;
                    height: 9px;
                }

                .preview-screen p {
                    font-size: 16px;
                    line-height: 1.7;
                }

                .preview-screen small {
                    font-size: 16px;
                    margin-top: 6px;
                }

                .btn-outline {
                    padding: 15px 34px;
                    font-size: 13px;
                    letter-spacing: 2px;
                }

                .past-streams-label {
                    font-size: 16px;
                    letter-spacing: 2px;
                    margin-bottom: 12px;
                }

                .stream-thumbnail {
                    font-size: 16px;
                    border-radius: 12px;
                }
                
                /* Contact Section Mobile */
                .contact {
                    gap: 32px;
                }
                
                .contact-card {
                    padding: 32px 24px;
                    border-radius: 28px;
                    grid-template-columns: 1fr;
                    gap: 40px;
                }
                
                .form-row {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                
                .form-group label {
                    font-size: 14px;
                }
                
                .form-group input,
                .form-group select,
                .form-group textarea {
                    padding: 14px 18px;
                    font-size: 15px;
                    border-radius: 14px;
                }
                
                .form-group textarea {
                    min-height: 120px;
                }
                
                .btn-submit {
                    padding: 16px 32px;
                    font-size: 14px;
                }
                
                .contact-info {
                    gap: 20px;
                }
                
                .contact-info-item {
                    padding: 20px;
                    border-radius: 16px;
                }
                
                .contact-icon {
                    font-size: 28px;
                }
                
                .contact-text h4 {
                    font-size: 15px;
                }
                
                .contact-text p {
                    font-size: 17px;
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
                <a class="nav-cta" href="#contact">Submit the form</a>
                <a class="nav-form-btn" href="#contact">Form</a>
            </header>
            <div class="nav-spacer"></div>
            <main>
                <section class="hero" id="home" style="animation-delay: 0.1s">
                    <h1 class="hero-title">Mending the Broken.</h1>
                    <div class="hero-body">
                        <div class="hero-content">
                            <p>Join us every Sunday as we worship, learn, and serve together. Expect meaningful teaching, passionate worship, and a community devoted to making Boise brighter.</p>
                        </div>
                        <div class="hero-image">
                            <img src="https://page.gensparksite.com/v1/base64_upload/30ce03975e70e9994a8bf1a838712739" alt="Cross on hilltop at sunset">
                        </div>
                        <div class="cta-group">
                            <a class="btn btn-primary" href="#contact">From the radio? - Press here</a>
                            <a class="btn btn-secondary" href="#watch">Watch live stream</a>
                        </div>
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
                        <div class="sticky-wrapper">
                            <div class="events-container">
                                <!-- Event 1: Community Thanksgiving Dinner -->
                                <div class="event-slide active" data-event="1">
                                    <div class="event-card">
                                        <div class="event-header">
                                            <span class="event-date">NOV 26</span>
                                            <div class="event-header-content">
                                                <h3 class="event-title">Community Thanksgiving Dinner</h3>
                                                <div class="event-time">11:00 AM - 1:00 PM</div>
                                            </div>
                                        </div>
                                        <div class="event-content">
                                            <div class="event-flyer-container">
                                                <div class="flyer-frame">
                                                    <img src="/static/friendsgiving-flyer.png" alt="Friendsgiving Lunch Flyer" class="flyer-image">
                                                </div>
                                            </div>
                                            <div class="event-cta">
                                                <a class="btn btn-primary" href="#contact">RSVP NOW</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Event 2: Christmas Clothes Drive -->
                                <div class="event-slide" data-event="2">
                                    <div class="event-card">
                                        <div class="event-header">
                                            <span class="event-date">DEC 6</span>
                                            <div class="event-header-content">
                                                <h3 class="event-title">Christmas Clothes Drive for Mothers</h3>
                                                <div class="event-time">Drop-off during office hours</div>
                                            </div>
                                        </div>
                                        <div class="event-content">
                                            <div class="event-flyer-container">
                                                <div class="flyer-frame">
                                                    <div class="placeholder-flyer">
                                                        Flyer Coming Soon
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="event-cta">
                                                <a class="btn btn-primary" href="#contact">VOLUNTEER OR REQUEST ITEMS</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Event 3: Christmas Eve Candlelight Service -->
                                <div class="event-slide" data-event="3">
                                    <div class="event-card">
                                        <div class="event-header">
                                            <span class="event-date">DEC 24</span>
                                            <div class="event-header-content">
                                                <h3 class="event-title">Christmas Eve Candlelight Service</h3>
                                                <div class="event-time">5:00 PM & 7:00 PM</div>
                                            </div>
                                        </div>
                                        <div class="event-content">
                                            <div class="event-flyer-container">
                                                <div class="flyer-frame">
                                                    <div class="placeholder-flyer">
                                                        Flyer Coming Soon
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="event-cta">
                                                <a class="btn btn-primary" href="#contact">RESERVE YOUR SEAT</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="event-indicators">
                                <div class="event-dot active" data-dot="1"></div>
                                <div class="event-dot" data-dot="2"></div>
                                <div class="event-dot" data-dot="3"></div>
                            </div>
                            <div class="scroll-hint">
                                <div class="scroll-hint-icon">↓</div>
                                <div class="scroll-hint-text">Scroll</div>
                            </div>
                        </div>
                        <div class="scroll-spacer"></div>
                    </div>
                </section>
                
                <section class="watch" id="watch" style="animation-delay: 0.4s">
                    <div class="watch-header">
                        <span class="section-eyebrow">Watch</span>
                        <h2 class="section-heading">Join us live every Sunday.</h2>
                        <p class="section-lead">Tune in from wherever you are to worship together online. Our stream goes live fifteen minutes before service begins.</p>
                    </div>
                    <div class="watch-card">
                        <div class="watch-main">
                            <div class="preview-screen">
                                <span class="live-status"><span class="live-dot"></span>Live Soon</span>
                                <p>"He heals the brokenhearted and binds up their wounds."<small>Psalm 147:3</small></p>
                                <a class="btn btn-outline" href="https://www.youtube.com/" target="_blank" rel="noopener">Open live stream</a>
                            </div>
                            <div class="past-streams-label">Previous Livestreams</div>
                            <div class="past-streams">
                                <div class="stream-thumbnail">Last Sunday</div>
                                <div class="stream-thumbnail">2 Weeks Ago</div>
                                <div class="stream-thumbnail">3 Weeks Ago</div>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section class="contact" id="contact" style="animation-delay: 0.5s">
                    <div class="contact-header">
                        <span class="section-eyebrow">Get In Touch</span>
                        <h2 class="section-heading">We'd Love to Hear From You</h2>
                        <p class="section-lead">Whether you're interested in attending a service, volunteering, or just want to connect, we're here for you.</p>
                    </div>
                    <div class="contact-container">
                        <div class="contact-card">
                            <form class="contact-form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="name">Your Name</label>
                                        <input type="text" id="name" name="name" required placeholder="John Doe">
                                    </div>
                                    <div class="form-group">
                                        <label for="email">Email Address</label>
                                        <input type="email" id="email" name="email" required placeholder="john@example.com">
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="phone">Phone Number</label>
                                        <input type="tel" id="phone" name="phone" placeholder="(123) 456-7890">
                                    </div>
                                    <div class="form-group">
                                        <label for="subject">Subject</label>
                                        <select id="subject" name="subject" required>
                                            <option value="">Select a subject</option>
                                            <option value="general">General Inquiry</option>
                                            <option value="prayer">Prayer Request</option>
                                            <option value="volunteer">Volunteer Opportunity</option>
                                            <option value="event">Event RSVP</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-group form-group-full">
                                    <label for="message">Your Message</label>
                                    <textarea id="message" name="message" rows="6" required placeholder="Tell us how we can help..."></textarea>
                                </div>
                                
                                <button type="submit" class="btn btn-primary btn-submit">Send Message</button>
                            </form>
                            
                            <div class="contact-info">
                                <div class="contact-info-item">
                                    <div class="contact-icon">📍</div>
                                    <div class="contact-text">
                                        <h4>Visit Us</h4>
                                        <p>3080 N Wildwood St<br>Boise, Idaho</p>
                                    </div>
                                </div>
                                
                                <div class="contact-info-item">
                                    <div class="contact-icon">⏰</div>
                                    <div class="contact-text">
                                        <h4>Service Times</h4>
                                        <p>Sunday: 9:00 AM<br>Tuesday: 8:30 AM<br>Thursday: 6:00 PM</p>
                                    </div>
                                </div>
                                
                                <div class="contact-info-item">
                                    <div class="contact-icon">✉️</div>
                                    <div class="contact-text">
                                        <h4>Connect Online</h4>
                                        <p>Follow our livestreams<br>and stay updated</p>
                                    </div>
                                </div>
                            </div>
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
                const navShell = document.querySelector('.nav-shell');
                
                // Get all sections and nav links
                const sections = document.querySelectorAll('section[id]');
                const navLinks = document.querySelectorAll('nav a[href^="#"]');
                
                // Mobile nav compression on scroll
                let lastScrollY = 0;
                let scrollThreshold = 50;
                
                function handleMobileNav() {
                    // Only apply on mobile (960px and below)
                    if (window.innerWidth <= 960) {
                        if (window.scrollY > scrollThreshold) {
                            navShell.classList.add('scrolled-mobile');
                        } else {
                            navShell.classList.remove('scrolled-mobile');
                        }
                    } else {
                        // Remove class on desktop
                        navShell.classList.remove('scrolled-mobile');
                    }
                    lastScrollY = window.scrollY;
                }
                
                let currentEventIndex = 0;
                const totalEvents = eventSlides.length;
                
                // Track if we're in the outreach section
                let inOutreachSection = false;
                
                // Update active nav link
                function updateActiveNavLink() {
                    let currentSection = '';
                    
                    sections.forEach(section => {
                        const sectionTop = section.offsetTop;
                        const sectionHeight = section.clientHeight;
                        if (window.pageYOffset >= sectionTop - 200) {
                            currentSection = section.getAttribute('id');
                        }
                    });
                    
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === \`#\${currentSection}\`) {
                            link.classList.add('active');
                        }
                    });
                }
                
                // Smooth scroll handler
                function handleScroll() {
                    if (!outreachSection || !scrollSpacer) return;
                    
                    const outreachRect = outreachSection.getBoundingClientRect();
                    const spacerRect = scrollSpacer.getBoundingClientRect();
                    
                    // Handle mobile nav compression
                    handleMobileNav();
                    
                    // Update active nav link
                    updateActiveNavLink();
                    
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
                        const spacerTop = spacerRect.top - window.innerHeight * 0.35;
                        const spacerHeight = spacerRect.height - window.innerHeight * 0.5;
                        const scrollProgress = Math.max(0, Math.min(1, -spacerTop / spacerHeight));
                        
                        // Fade out header after scrolling past last event (90%+)
                        if (scrollProgress > 0.9) {
                            const fadeProgress = Math.min(1, (scrollProgress - 0.9) / 0.1);
                            const outreachHeader = document.querySelector('.outreach-header');
                            if (outreachHeader) {
                                outreachHeader.style.opacity = String(1 - fadeProgress);
                                outreachHeader.style.transform = \`translateY(\${-20 * fadeProgress}px)\`;
                            }
                        } else {
                            // Reset opacity when scrolling back
                            const outreachHeader = document.querySelector('.outreach-header');
                            if (outreachHeader) {
                                outreachHeader.style.opacity = '1';
                                outreachHeader.style.transform = 'translateY(0)';
                            }
                        }
                        
                        // Calculate which event should be shown with better distribution
                        // Divide scroll area evenly into 3 zones (one per event)
                        let newEventIndex;
                        if (scrollProgress < 0.2) {
                            newEventIndex = 0;
                        } else if (scrollProgress < 0.6) {
                            newEventIndex = 1;
                        } else {
                            newEventIndex = 2;
                        }
                        
                        // Add small hysteresis only at boundaries to prevent rapid switching
                        const threshold = 0.05;
                        if (newEventIndex > currentEventIndex) {
                            // Moving forward - require clear progress past boundary
                            const boundary = newEventIndex === 1 ? 0.2 : newEventIndex === 2 ? 0.6 : 0;
                            if (scrollProgress < boundary + threshold) {
                                newEventIndex = currentEventIndex;
                            }
                        } else if (newEventIndex < currentEventIndex) {
                            // Moving backward - require clear progress past boundary
                            const boundary = currentEventIndex === 1 ? 0.2 : currentEventIndex === 2 ? 0.6 : 0;
                            if (scrollProgress > boundary - threshold) {
                                newEventIndex = currentEventIndex;
                            }
                        }
                        
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
                        
                        // Update indicator dots
                        const dots = document.querySelectorAll('.event-dot');
                        dots.forEach((dot, i) => {
                            if (i === index) {
                                dot.classList.add('active');
                            } else {
                                dot.classList.remove('active');
                            }
                        });
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
                
                // Handle window resize
                window.addEventListener('resize', () => {
                    handleMobileNav();
                });
                
                // Smooth scrolling for navigation links with offset for sticky nav
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        const targetId = this.getAttribute('href');
                        const target = document.querySelector(targetId);
                        if (target) {
                            // Calculate offset based on screen size and section
                            let navOffset = 160; // Desktop default
                            
                            // Special handling for outreach section on mobile
                            if (targetId === '#outreach' && window.innerWidth <= 960) {
                                navOffset = 80; // Tighter offset for outreach on mobile
                            } else if (window.innerWidth <= 960) {
                                navOffset = 100; // Mobile/tablet - reduced offset for other sections
                            }
                            
                            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navOffset;
                            
                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
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
