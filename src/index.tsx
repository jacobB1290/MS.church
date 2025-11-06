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
                margin-bottom: 8vh;
                position: sticky;
                top: 80px;
                z-index: 10;
                text-align: left;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }
            
            .heading-wrapper {
                position: relative;
                display: inline-block;
                width: auto;
            }
            
            @media (max-width: 768px) {
                .heading-wrapper {
                    width: 100%;
                    display: block;
                }
            }
            
            .outreach-header .section-heading {
                position: relative;
                margin: 0;
            }
            
            /* Desktop-only reduced gap */
            @media (min-width: 769px) {
                .outreach-header {
                    margin-bottom: 8vh;
                }
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
                top: 20vh;
                height: 62vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                padding-bottom: 100px;
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
                transform: translateY(30px) scale(0.95);
                transition: opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                            transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                            visibility 0s 0.4s;
                pointer-events: none;
            }

            .event-slide.active {
                opacity: 1;
                visibility: visible;
                transform: translateY(0) scale(1);
                pointer-events: auto;
                position: relative;
                transition: opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                            transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                            visibility 0s 0s;
            }

            .scroll-spacer {
                height: 100vh;  /* Reduced from 250vh for responsive swipe-like feel */
                pointer-events: none;
            }
            
            /* Scroll snap disabled - using manual zone calculation for precise control */
            
            /* Event Indicator Dots */
            .event-indicators {
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
                align-items: center;
                gap: 12px;
                position: relative;
                z-index: 70;
                padding: 0;
            }
            
            .heading-wrapper .event-indicators {
                display: none;
            }
            
            .event-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: rgba(26, 26, 46, 0.25);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
            }
            
            .event-dot.active {
                width: 10px;
                height: 10px;
                background: linear-gradient(135deg, #d4a574 0%, #c89860 100%);
                box-shadow: 0 2px 8px rgba(200, 152, 96, 0.5);
                transform: scale(1);
            }
            
            .event-dot:hover {
                background: rgba(26, 26, 46, 0.4);
                transform: scale(1.15);
            }
            
            .scroll-hint {
                display: none;
                position: absolute;
                bottom: 10px;
                left: 0;
                width: 100%;
                z-index: 60;
                text-align: center;
                animation: bounce 2s ease-in-out infinite;
                padding: 12px 0;
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
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }

            /* ========================================
               EVENT CARDS - COMPLETE REBUILD
               Full-screen image layout with floating elements
               ======================================== */
            
            /* Main Event Card Container */
            .event-card {
                position: relative;
                width: 100vw;
                height: 90vh;
                margin-left: calc(-50vw + 50%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                padding-top: 20px;
                box-sizing: border-box;
            }
            
            /* Meta row with date and dots */
            .event-meta-row {
                width: 100%;
                max-width: 500px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 24px;
                margin-bottom: 20px;
                box-sizing: border-box;
            }
            
            /* Date pill styling */
            .event-date {
                padding: 8px 20px;
                background: linear-gradient(135deg, #d4a574 0%, #c89860 100%);
                border-radius: 100px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 2px;
                color: #ffffff;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
                text-transform: uppercase;
                white-space: nowrap;
            }
            
            /* Event indicators (dots) */
            .event-indicators {
                display: flex;
                gap: 10px;
            }
            
            /* Image Wrapper - Fixed 3:4 portrait aspect ratio, 10% smaller */
            .event-flyer-wrapper {
                position: relative;
                width: 100%;
                max-width: 450px;
                aspect-ratio: 3/4;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
                margin-bottom: 24px;
                padding: 0 24px;
                box-sizing: border-box;
            }
            
            /* Image styling - Enforces 3:4 aspect ratio */
            .flyer-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: center;
                border-radius: 24px;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
            }
            
            .placeholder-flyer {
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                color: rgba(26, 26, 46, 0.4);
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 2px;
                border-radius: 24px;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
            }
            
            /* CTA Button - Below image */
            .event-cta {
                position: relative;
                width: 100%;
                max-width: 800px;
                padding: 0 24px;
                margin-bottom: 24px;
                z-index: 100;
            }
            
            .event-cta .btn {
                width: 100%;
                padding: 20px 40px;
                font-size: 15px;
                font-weight: 700;
                border-radius: 24px;
                background: linear-gradient(135deg, #d4a574 0%, #c89860 100%);
                color: white;
                box-shadow: 0 8px 24px rgba(200, 152, 96, 0.4);
                transition: all 0.3s ease;
            }
            
            .event-cta .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 32px rgba(200, 152, 96, 0.5);
            }
            
            /* Hide legacy elements */
            .event-header-mobile,
            .event-header-content,
            .event-title,
            .event-time,
            .event-content,
            .event-description {
                display: none !important;
            }

            /* ========================================
               CAROUSEL SUPPORT FOR EVENT 2
               ======================================== */
            .carousel-container {
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .carousel-slides {
                display: flex;
                height: 100%;
                width: 100%;
                transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .carousel-slide {
                min-width: 100%;
                height: 100%;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .carousel-slide .flyer-image,
            .carousel-slide .placeholder-flyer {
                width: 100%;
                height: 100%;
            }

            .carousel-controls {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 12px;
                z-index: 120;
            }

            .carousel-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.4);
                border: 2px solid rgba(255, 255, 255, 0.6);
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .carousel-dot.active {
                background: rgba(255, 255, 255, 0.95);
                border-color: rgba(255, 255, 255, 1);
                transform: scale(1.2);
            }

            .carousel-arrow {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 48px;
                height: 48px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 22px;
                color: #1a1a2e;
                transition: all 0.3s ease;
                z-index: 120;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            }

            .carousel-arrow:hover {
                background: rgba(255, 255, 255, 1);
                transform: translateY(-50%) scale(1.1);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }

            .carousel-arrow.prev {
                left: 24px;
            }

            .carousel-arrow.next {
                right: 24px;
            }
            
            /* Lightbox for Flyer Full-Screen View */
            .lightbox {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                z-index: 9999;
                display: none;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: zoom-out;
            }
            
            .lightbox.active {
                display: flex;
                opacity: 1;
            }
            
            .lightbox-content {
                position: relative;
                max-width: 95vw;
                max-height: 95vh;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .lightbox-image {
                max-width: 100%;
                max-height: 95vh;
                object-fit: contain;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                cursor: zoom-in;
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .lightbox-image.zoomed {
                cursor: zoom-out;
                transform: scale(2);
            }
            
            .lightbox-close {
                position: fixed;
                top: 24px;
                right: 24px;
                width: 48px;
                height: 48px;
                background: rgba(255, 255, 255, 0.9);
                border: none;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                font-weight: 300;
                color: #1a1a2e;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 10000;
                line-height: 1;
            }
            
            .lightbox-close:hover {
                background: #fff;
                transform: scale(1.1) rotate(90deg);
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
            }
            
            .lightbox-instructions {
                position: fixed;
                bottom: 32px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 255, 255, 0.9);
                padding: 12px 28px;
                border-radius: 100px;
                font-size: 12px;
                font-weight: 600;
                letter-spacing: 1px;
                text-transform: uppercase;
                color: #1a1a2e;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(10px);
                z-index: 10000;
                opacity: 0.8;
                transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .lightbox-instructions:hover {
                opacity: 1;
            }
            
            /* Add cursor pointer to flyer frames */
            .flyer-frame {
                cursor: pointer;
            }
            
            .flyer-image {
                cursor: pointer;
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
            
            /* YouTube Video Embed Styles */
            .live-stream-container {
                display: flex;
                flex-direction: column;
                gap: 20px;
                align-items: center;
            }
            
            .live-verse {
                color: rgba(255, 255, 255, 0.85);
                line-height: 1.9;
                font-size: 18px;
                text-align: center;
                margin: 0;
            }
            
            .live-verse small {
                display: block;
                color: rgba(255, 255, 255, 0.6);
                font-size: 14px;
                margin-top: 8px;
                letter-spacing: 1px;
            }
            
            .video-embed-wrapper {
                position: relative;
                width: 100%;
                padding-bottom: 56.25%; /* 16:9 aspect ratio */
                height: 0;
                overflow: hidden;
                border-radius: 16px;
                box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
            }
            
            .youtube-embed {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
                border-radius: 16px;
            }
            
            .playlist-section {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .playlist-embed-wrapper {
                position: relative;
                width: 100%;
                padding-bottom: 56.25%; /* 16:9 aspect ratio */
                height: 0;
                overflow: hidden;
                border-radius: 16px;
                box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
                background: rgba(0, 0, 0, 0.3);
            }
            
            .youtube-playlist {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
                border-radius: 16px;
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
            
            /* Clothes Drive Form Styles */
            .form-message {
                font-size: 18px;
                line-height: 1.7;
                color: rgba(26, 26, 46, 0.8);
                max-width: 700px;
                margin: 0 auto 24px auto;
                font-weight: 400;
            }
            
            .btn-more-info {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-top: 8px;
                padding: 14px 32px;
                font-size: 13px;
                font-weight: 600;
                text-decoration: none;
                cursor: pointer;
            }
            
            .form-section {
                padding: 32px;
                background: rgba(248, 248, 252, 0.5);
                border-radius: 20px;
                margin-bottom: 24px;
            }
            
            .form-section-title {
                font-family: 'Playfair Display', serif;
                font-size: 24px;
                color: #1a1a2e;
                margin-bottom: 24px;
                font-weight: 700;
            }
            
            .form-row-3 {
                grid-template-columns: 1fr 1fr 1fr;
            }
            
            .child-form {
                padding: 24px;
                background: white;
                border-radius: 16px;
                margin-bottom: 20px;
                border: 2px solid rgba(212, 165, 116, 0.2);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .child-form:hover {
                border-color: rgba(212, 165, 116, 0.4);
                box-shadow: 0 8px 24px rgba(212, 165, 116, 0.1);
            }
            
            .child-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 16px;
                border-bottom: 2px solid rgba(212, 165, 116, 0.2);
            }
            
            .child-number {
                font-family: 'Playfair Display', serif;
                font-size: 20px;
                color: #d4a574;
                font-weight: 700;
                margin: 0;
            }
            
            .btn-remove-child {
                padding: 8px 16px;
                font-size: 12px;
                background: rgba(220, 38, 38, 0.1);
                color: #dc2626;
                border: 1px solid rgba(220, 38, 38, 0.3);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                font-weight: 600;
            }
            
            .btn-remove-child:hover {
                background: rgba(220, 38, 38, 0.2);
                transform: translateY(-2px);
            }
            
            .btn-add-child {
                width: 100%;
                padding: 16px;
                font-size: 14px;
                font-weight: 600;
                margin-top: 8px;
                cursor: pointer;
            }
            
            /* JotForm Container Styles */
            .jotform-container {
                width: 100%;
                min-height: 800px;
                background: transparent;
                border-radius: 20px;
                overflow: hidden;
            }
            
            .jotform-container iframe {
                width: 100%;
                border: none;
                min-height: 800px;
            }
            
            /* Form Success State */
            .form-success {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 64px 48px;
                min-height: 600px;
                gap: 32px;
            }
            
            .success-icon {
                font-size: 96px;
                animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            
            @keyframes bounceIn {
                0% { transform: scale(0); opacity: 0; }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .success-heading {
                font-family: 'Playfair Display', serif;
                font-size: clamp(32px, 5vw, 48px);
                color: #1a1a2e;
                font-weight: 700;
                margin: 0;
            }
            
            .success-message {
                font-size: 20px;
                color: rgba(26, 26, 46, 0.7);
                max-width: 500px;
                margin: 0;
                line-height: 1.6;
            }
            
            .success-details {
                display: flex;
                flex-direction: column;
                gap: 16px;
                width: 100%;
                max-width: 500px;
                background: rgba(255, 255, 255, 0.6);
                padding: 24px;
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.8);
            }
            
            .detail-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding: 12px 0;
                border-bottom: 1px solid rgba(26, 26, 46, 0.1);
            }
            
            .detail-item:last-child {
                border-bottom: none;
            }
            
            .detail-label {
                font-size: 16px;
                font-weight: 600;
                color: rgba(26, 26, 46, 0.6);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .detail-value {
                font-size: 16px;
                font-weight: 600;
                color: #1a1a2e;
                text-align: right;
            }
            
            .calendar-buttons {
                display: flex;
                gap: 16px;
                flex-wrap: wrap;
                justify-content: center;
                width: 100%;
                max-width: 500px;
            }
            
            .btn-calendar {
                flex: 1;
                min-width: 200px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 16px 24px;
                border-radius: 100px;
                background: rgba(255, 255, 255, 0.9);
                color: #1a1a2e;
                font-size: 14px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.5);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                text-decoration: none;
            }
            
            .btn-calendar:hover {
                transform: translateY(-4px);
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
                background: #fff;
            }
            
            .calendar-icon {
                font-size: 20px;
            }
            
            /* Confetti Animation */
            .confetti {
                position: fixed;
                top: -10px;
                font-size: 32px;
                animation: confettiFall 3s ease-out forwards;
                pointer-events: none;
                z-index: 10000;
            }
            
            @keyframes confettiFall {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
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
                
                .outreach {
                    width: 100vw;
                    margin-left: calc(-50vw + 50%);
                }
                
                .outreach-header {
                    margin-bottom: 40px;
                    padding-bottom: 0;
                    width: 92%;
                    margin-left: auto;
                    margin-right: auto;
                }
                
                .outreach-header .section-heading {
                    margin-bottom: 16px;
                }
                
                .outreach-header .section-eyebrow {
                    margin-bottom: 16px;
                }

                /* Mobile 768px Event Cards - Clean layout */
                .events-container,
                .sticky-wrapper {
                    width: 100vw;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                .event-card {
                    height: 90vh;
                    margin-left: 0;
                    width: 100vw;
                    padding-top: 16px;
                }
                
                .event-meta-row {
                    max-width: 405px;
                    padding: 0 20px;
                    margin-bottom: 16px;
                }
                
                .event-date {
                    padding: 7px 18px;
                    font-size: 10px;
                }
                
                .event-flyer-wrapper {
                    max-width: 405px;
                    padding: 0 20px;
                    margin-bottom: 20px;
                }
                
                .flyer-image {
                    border-radius: 20px;
                }
                
                .placeholder-flyer {
                    border-radius: 20px;
                }
                
                .event-cta {
                    padding: 0 20px;
                    margin-bottom: 20px;
                    max-width: 405px;
                }
                
                .event-cta .btn {
                    padding: 18px 32px;
                    font-size: 14px;
                    border-radius: 20px;
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
                
                .form-row-3 {
                    grid-template-columns: 1fr;
                }
                
                .form-section {
                    padding: 20px;
                }
                
                .form-section-title {
                    font-size: 20px;
                }
                
                .child-form {
                    padding: 16px;
                }
                
                .form-success {
                    padding: 48px 28px;
                    min-height: 500px;
                }
                
                .success-icon {
                    font-size: 72px;
                }
                
                .success-heading {
                    font-size: clamp(28px, 6vw, 36px);
                }
                
                .success-message {
                    font-size: 18px;
                }
                
                .calendar-buttons {
                    flex-direction: column;
                    gap: 12px;
                }
                
                .btn-calendar {
                    width: 100%;
                    min-width: auto;
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
                
                /* Mobile 480px Event Cards - Ultra clean */
                .event-card {
                    height: 88vh;
                    padding-top: 14px;
                }
                
                .event-meta-row {
                    max-width: 360px;
                    padding: 0 16px;
                    margin-bottom: 14px;
                }
                
                .event-date {
                    padding: 6px 16px;
                    font-size: 9px;
                }
                
                .event-flyer-wrapper {
                    max-width: 360px;
                    padding: 0 16px;
                    margin-bottom: 16px;
                }
                
                .flyer-image {
                    border-radius: 18px;
                }
                
                .placeholder-flyer {
                    border-radius: 18px;
                }
                
                .event-cta {
                    padding: 0 16px;
                    margin-bottom: 16px;
                    max-width: 360px;
                }
                
                .event-cta .btn {
                    padding: 16px 32px;
                    font-size: 13px;
                    border-radius: 18px;
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
                    min-height: 55vh;
                    top: 24vh;
                    gap: 0;
                    padding-bottom: 100px;
                    justify-content: flex-start;
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
                
                .form-success {
                    padding: 40px 24px;
                    min-height: 450px;
                    gap: 24px;
                }
                
                .success-icon {
                    font-size: 64px;
                }
                
                .success-heading {
                    font-size: clamp(26px, 5.5vw, 32px);
                }
                
                .success-message {
                    font-size: 16px;
                }
                
                .success-details {
                    padding: 20px;
                }
                
                .detail-label,
                .detail-value {
                    font-size: 14px;
                }
                
                .btn-calendar {
                    font-size: 12px;
                    padding: 14px 20px;
                }
                
                .calendar-icon {
                    font-size: 18px;
                }
                
                .contact-text h4 {
                    font-size: 15px;
                }
                
                .contact-text p {
                    font-size: 17px;
                }
            }
            
            /* Smaller Phones (iPhone X, iPhone SE, etc - 375px and below) */
            @media (max-width: 375px) {
                .page {
                    width: 100%;
                    padding: 0 3%;
                }
                
                /* Navigation - More Compact */
                .nav-spacer {
                    height: 130px;
                }
                
                .nav-shell {
                    padding: 8px 10px;
                    border-radius: 20px;
                    top: 5px;
                    width: 94%;
                }
                
                .nav-shell.scrolled-mobile {
                    padding: 4px 10px;
                    top: 2px;
                }
                
                .brand-title {
                    font-size: 12px;
                    letter-spacing: 1px;
                }
                
                .brand-subtitle {
                    font-size: 7px;
                    letter-spacing: 1.8px;
                }
                
                nav a {
                    font-size: 9px;
                    letter-spacing: 1px;
                }
                
                .nav-shell.scrolled-mobile nav a {
                    font-size: 8px;
                    letter-spacing: 0.8px;
                }
                
                .nav-cta {
                    padding: 6px 12px;
                    font-size: 8px;
                    letter-spacing: 0.8px;
                }
                
                /* Main Content Spacing - Dramatically reduce gaps to move sections up */
                main {
                    gap: 20px;
                    margin-bottom: 20px;
                }
                
                /* Hero Section - Add padding to push text down */
                .hero {
                    padding: 40px 0 20px;
                    gap: 10px;
                }
                
                .hero .eyebrow {
                    padding: 7px 14px;
                    font-size: 9px;
                    letter-spacing: 1.2px;
                }
                
                .hero h1 {
                    font-size: clamp(36px, 9.5vw, 48px);
                    line-height: 0.90;
                    letter-spacing: -0.8px;
                    margin-bottom: 10px;
                }
                
                .hero p {
                    font-size: 13px;
                    line-height: 1.5;
                }
                
                .hero-image {
                    min-height: 220px;
                    border-radius: 16px;
                }
                
                .btn {
                    padding: 11px 22px;
                    font-size: 10px;
                    letter-spacing: 1px;
                }
                
                /* Section Headers - Minimal spacing */
                .section-eyebrow {
                    font-size: 8px;
                    padding: 6px 12px;
                    letter-spacing: 1.5px;
                    margin-bottom: 2px;
                }
                
                .section-heading {
                    font-size: clamp(22px, 5.5vw, 28px);
                    margin-bottom: 2px;
                    line-height: 1.1;
                }
                
                .section-lead {
                    font-size: 13px;
                    line-height: 1.5;
                    margin-bottom: 0px;
                }
                
                address {
                    font-size: 9px;
                    letter-spacing: 1px;
                    margin-bottom: 2px;
                }
                
                /* Schedule Section - Move sections up */
                
                .section-card {
                    padding: 12px 10px;
                    border-radius: 16px;
                }
                
                .schedule-grid {
                    gap: 10px;
                }
                
                .schedule-item {
                    padding: 10px 8px;
                    border-radius: 12px;
                    gap: 4px;
                }
                
                .schedule-item span {
                    font-size: 8px;
                    letter-spacing: 1px;
                }
                
                .schedule-item h3 {
                    font-size: 18px;
                }
                
                .schedule-item p {
                    font-size: 11px;
                    line-height: 1.3;
                }
                
                /* Mobile 375px Event Cards - Compact */
                .event-card {
                    height: 86vh;
                    padding-top: 12px;
                }
                
                .event-meta-row {
                    max-width: 324px;
                    padding: 0 12px;
                    margin-bottom: 12px;
                }
                
                .event-date {
                    padding: 6px 14px;
                    font-size: 8px;
                }
                
                .event-indicators {
                    gap: 8px;
                }
                
                .event-dot {
                    width: 7px;
                    height: 7px;
                }
                
                .event-dot.active {
                    width: 9px;
                    height: 9px;
                }
                
                .event-flyer-wrapper {
                    max-width: 324px;
                    padding: 0 12px;
                    margin-bottom: 14px;
                }
                
                .flyer-image {
                    border-radius: 16px;
                }
                
                .placeholder-flyer {
                    border-radius: 16px;
                }
                
                .event-cta {
                    padding: 0 12px;
                    margin-bottom: 14px;
                    max-width: 324px;
                }
                
                .event-cta .btn {
                    padding: 14px 28px;
                    font-size: 12px;
                    border-radius: 16px;
                }
                
                .scroll-hint {
                    bottom: 5px;
                }
                
                .scroll-hint-icon {
                    font-size: 16px;
                }
                
                .scroll-hint-text {
                    font-size: 8px;
                    letter-spacing: 1px;
                }
                
                /* Watch Section */
                .watch {
                    gap: 12px;
                }
                
                .watch-header {
                    margin-bottom: -4px;
                }
                
                .watch-card {
                    padding: 20px 14px;
                    border-radius: 18px;
                }
                
                .preview-screen {
                    padding: 20px 14px;
                    min-height: 190px;
                    border-radius: 16px;
                }
                
                .live-status {
                    font-size: 8px;
                    padding: 4px 12px;
                    letter-spacing: 1px;
                }
                
                .live-dot {
                    width: 6px;
                    height: 6px;
                }
                
                .preview-screen p {
                    font-size: 13px;
                    line-height: 1.5;
                }
                
                .preview-screen small {
                    font-size: 10px;
                }
                
                .btn-outline {
                    padding: 10px 20px;
                    font-size: 9px;
                    letter-spacing: 1px;
                }
                
                .past-streams-label {
                    font-size: 10px;
                    letter-spacing: 1px;
                    margin-bottom: 7px;
                }
                
                .stream-thumbnail {
                    font-size: 11px;
                    border-radius: 8px;
                }
                
                /* Contact Section */
                .contact {
                    gap: 12px;
                }
                
                .contact-header {
                    margin-bottom: -4px;
                }
                
                .contact-card {
                    padding: 16px 14px;
                    border-radius: 18px;
                    gap: 16px;
                }
                
                .jotform-container {
                    min-height: 600px;
                }
                
                .jotform-container iframe {
                    min-height: 600px;
                }
                
                /* Form Success State - Smaller */
                .form-success {
                    padding: 24px 14px;
                    min-height: 330px;
                    gap: 16px;
                }
                
                .success-icon {
                    font-size: 44px;
                }
                
                .success-heading {
                    font-size: clamp(20px, 5vw, 24px);
                }
                
                .success-message {
                    font-size: 12px;
                    line-height: 1.4;
                }
                
                .success-details {
                    padding: 12px;
                    gap: 8px;
                }
                
                .detail-item {
                    padding: 7px 0;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }
                
                .detail-label {
                    font-size: 11px;
                }
                
                .detail-value {
                    font-size: 11px;
                    text-align: left;
                    font-weight: 700;
                }
                
                .calendar-buttons {
                    gap: 7px;
                }
                
                .btn-calendar {
                    padding: 10px 14px;
                    font-size: 9px;
                    letter-spacing: 0.5px;
                }
                
                .calendar-icon {
                    font-size: 14px;
                }
                
                /* Lightbox - Smaller Close Button */
                .lightbox-close {
                    width: 32px;
                    height: 32px;
                    top: 10px;
                    right: 10px;
                    font-size: 20px;
                }
                
                .lightbox-instructions {
                    bottom: 14px;
                    padding: 7px 14px;
                    font-size: 8px;
                    letter-spacing: 0.5px;
                }
            }
            
            /* Version Number Footer */
            .version-footer {
                position: fixed;
                bottom: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 600;
                letter-spacing: 0.5px;
                z-index: 9999;
                pointer-events: none;
                font-family: 'Inter', monospace;
            }
            
            @media (max-width: 768px) {
                .version-footer {
                    bottom: 8px;
                    right: 8px;
                    font-size: 9px;
                    padding: 3px 8px;
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
                <a class="nav-cta" href="#contact">Register for free gifts</a>
                <a class="nav-form-btn" href="#contact">Gifts</a>
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
                            <img src="/static/church-building.jpg" alt="Morning Star Christian Church building">
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
                        <div class="heading-wrapper">
                            <h2 class="section-heading">Upcoming Events</h2>
                            <div class="event-indicators">
                                <div class="event-dot active" data-dot="1"></div>
                                <div class="event-dot" data-dot="2"></div>
                                <div class="event-dot" data-dot="3"></div>
                            </div>
                        </div>
                        <p class="section-lead">We are called to be the hands and feet of Jesus by serving our local community and growing in fellowship. Here's how you can get involved.</p>
                    </div>
                    
                    <div class="outreach-scroll-container">
                        <div class="sticky-wrapper">
                            <div class="events-container">
                                <!-- Event 1: Community Thanksgiving Dinner -->
                                <div class="event-slide active" data-event="1">
                                    <div class="event-card">
                                        <div class="event-meta-row">
                                            <span class="event-date">NOV 26</span>
                                            <div class="event-indicators">
                                                <div class="event-dot active" data-dot="1"></div>
                                                <div class="event-dot" data-dot="2"></div>
                                                <div class="event-dot" data-dot="3"></div>
                                            </div>
                                        </div>
                                        <div class="event-flyer-wrapper">
                                            <img src="/static/friendsgiving-flyer.png" alt="Friendsgiving Lunch Flyer" class="flyer-image">
                                        </div>
                                        <div class="event-cta">
                                            <a class="btn btn-primary" href="#contact">RSVP NOW</a>
                                        </div>
                                    </div>
                                </div>

                                <!-- Event 2: Christmas Clothes Drive -->
                                <div class="event-slide" data-event="2" id="event-2">
                                    <div class="event-card">
                                        <div class="event-meta-row">
                                            <span class="event-date">DEC 6</span>
                                            <div class="event-indicators">
                                                <div class="event-dot active" data-dot="1"></div>
                                                <div class="event-dot" data-dot="2"></div>
                                                <div class="event-dot" data-dot="3"></div>
                                            </div>
                                        </div>
                                        <div class="event-flyer-wrapper">
                                            <div class="placeholder-flyer">
                                                Flyer Coming Soon
                                            </div>
                                        </div>
                                        <div class="event-cta">
                                            <a class="btn btn-primary" href="#contact">REQUEST ITEMS</a>
                                        </div>
                                    </div>
                                </div>

                                <!-- Event 3: Christmas Eve Candlelight Service -->
                                <div class="event-slide" data-event="3">
                                    <div class="event-card">
                                        <div class="event-meta-row">
                                            <span class="event-date">DEC 24</span>
                                            <div class="event-indicators">
                                                <div class="event-dot active" data-dot="1"></div>
                                                <div class="event-dot" data-dot="2"></div>
                                                <div class="event-dot" data-dot="3"></div>
                                            </div>
                                        </div>
                                        <div class="event-flyer-wrapper">
                                            <div class="placeholder-flyer">
                                                Flyer Coming Soon
                                            </div>
                                        </div>
                                        <div class="event-cta">
                                            <a class="btn btn-primary" href="#contact">RESERVE YOUR SEAT</a>
                                        </div>
                                    </div>
                                </div>
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
                            <!-- Live Stream Status -->
                            <div class="live-stream-container">
                                <span class="live-status"><span class="live-dot"></span>Live Soon</span>
                                <p class="live-verse">"He heals the brokenhearted and binds up their wounds."<small>Psalm 147:3</small></p>
                                
                                <!-- Main Video Embed - Featured/Latest Video -->
                                <!-- This will show the latest video from your playlist -->
                                <div class="video-embed-wrapper">
                                    <iframe 
                                        class="youtube-embed"
                                        src="https://www.youtube.com/embed?listType=playlist&list=PLHs3usNpG0bZHnAJlIpwBtkbnd7xDCeRC&index=1"
                                        title="YouTube video player" 
                                        frameborder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                        allowfullscreen>
                                    </iframe>
                                </div>
                            </div>
                            
                            <!-- YouTube Playlist Section -->
                            <div class="playlist-section">
                                <div class="past-streams-label">Previous Livestreams</div>
                                
                                <!-- YouTube Playlist Embed -->
                                <div class="playlist-embed-wrapper">
                                    <iframe 
                                        class="youtube-playlist"
                                        src="https://www.youtube.com/embed/videoseries?list=PLHs3usNpG0bZHnAJlIpwBtkbnd7xDCeRC"
                                        title="YouTube playlist" 
                                        frameborder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                        allowfullscreen>
                                    </iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section class="contact" id="contact" style="animation-delay: 0.5s">
                    <div class="contact-header">
                        <span class="section-eyebrow">Christmas Outreach</span>
                        <h2 class="section-heading">Christmas Clothes Drive for Mothers</h2>
                        <p class="section-lead form-message">
                            <strong>What you'll get:</strong><br>
                            👟 Adults will receive a pair of shoes of their choosing<br>
                            🧸 Children will receive a toy/item of their choosing<br><br>
                            After you fill out the form, we will get to work putting your free gift together based on what you entered. We will send you a message with all the details!
                        </p>
                        <address>3080 N Wildwood St, Boise, Idaho</address>
                        <a href="#event-2" class="btn btn-secondary btn-more-info">More Info</a>
                    </div>
                    <div class="contact-container">
                        <div class="contact-card">
                            <div class="jotform-container">
                                <script type="text/javascript" src="https://form.jotform.com/jsform/253084343168054"></script>
                            </div>
                            
                            <!-- Success State (Hidden by default) -->
                            <div class="form-success" style="display: none;">
                                <div class="success-icon">🎁</div>
                                <h3 class="success-heading">Request Submitted!</h3>
                                <p class="success-message">You will receive a text message with more information.</p>
                                
                                <div class="success-details">
                                    <div class="detail-item">
                                        <span class="detail-label">📅 Date:</span>
                                        <span class="detail-value">December 6, 2025</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">📍 Location:</span>
                                        <span class="detail-value">3080 N Wildwood St, Boise, Idaho</span>
                                    </div>
                                </div>
                                
                                <div class="calendar-buttons">
                                    <a href="#" class="btn btn-calendar" id="apple-calendar">
                                        <span class="calendar-icon">🍎</span>
                                        <span>Add to Apple Calendar</span>
                                    </a>
                                    <a href="#" class="btn btn-calendar" id="google-calendar" target="_blank" rel="noopener">
                                        <span class="calendar-icon">📅</span>
                                        <span>Add to Google Calendar</span>
                                    </a>
                                </div>
                            </div>
                            <form class="contact-form clothes-drive-form" style="display: none;">
                                <!-- Parent/Guardian Information -->
                                <div class="form-section">
                                    <h3 class="form-section-title">Parent/Guardian Information</h3>
                                    
                                    <div class="form-group">
                                        <label for="parent-name">Full Name *</label>
                                        <input type="text" id="parent-name" name="parent-name" required placeholder="Jane Doe">
                                    </div>
                                    
                                    <div class="form-row form-row-3">
                                        <div class="form-group">
                                            <label for="parent-gender">Gender *</label>
                                            <select id="parent-gender" name="parent-gender" required>
                                                <option value="">Select</option>
                                                <option value="F">Female</option>
                                                <option value="M">Male</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label for="parent-age">Age *</label>
                                            <input type="number" id="parent-age" name="parent-age" required placeholder="30" min="18" max="120">
                                        </div>
                                        <div class="form-group">
                                            <label for="parent-shoe">Shoe Size *</label>
                                            <input type="text" id="parent-shoe" name="parent-shoe" required placeholder="8">
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="parent-phone">Phone Number *</label>
                                        <input type="tel" id="parent-phone" name="parent-phone" required placeholder="(208) 555-1234">
                                    </div>
                                </div>
                                
                                <!-- Children Information Container -->
                                <div class="form-section">
                                    <h3 class="form-section-title">Children Information</h3>
                                    
                                    <div id="children-container">
                                        <!-- Child 1 (Default) -->
                                        <div class="child-form" data-child-number="1">
                                            <div class="child-header">
                                                <h4 class="child-number">Child 1</h4>
                                            </div>
                                            
                                            <div class="form-group">
                                                <label for="child-1-name">Child's Name *</label>
                                                <input type="text" id="child-1-name" name="child-1-name" required placeholder="John Doe">
                                            </div>
                                            
                                            <div class="form-row form-row-3">
                                                <div class="form-group">
                                                    <label for="child-1-age">Age *</label>
                                                    <input type="number" id="child-1-age" name="child-1-age" required placeholder="8" min="0" max="18">
                                                </div>
                                                <div class="form-group">
                                                    <label for="child-1-gender">Gender *</label>
                                                    <select id="child-1-gender" name="child-1-gender" required>
                                                        <option value="">Select</option>
                                                        <option value="F">Female</option>
                                                        <option value="M">Male</option>
                                                    </select>
                                                </div>
                                                <div class="form-group">
                                                    <label for="child-1-shoe">Shoe Size *</label>
                                                    <input type="text" id="child-1-shoe" name="child-1-shoe" required placeholder="2">
                                                </div>
                                            </div>
                                            
                                            <div class="form-group">
                                                <label for="child-1-interests">Interests (Optional)</label>
                                                <input type="text" id="child-1-interests" name="child-1-interests" placeholder="Sports, art, music...">
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button type="button" class="btn btn-secondary btn-add-child">+ Add Another Child</button>
                                </div>
                                
                                <button type="submit" class="btn btn-primary btn-submit">Submit Request</button>
                            </form>
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
                
                // Snap behavior - small swipes register as full event changes
                let committedEventIndex = 0; // The event we've committed to showing
                const SNAP_THRESHOLD = 0.15; // 15% of a zone triggers snap to next event
                
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
                    // Key insight: When header sticks (top <= 80px), Event 1 is already locked in
                    if (outreachRect.top <= window.innerHeight * 0.5 && spacerRect.bottom > 0) {
                        // Just entering the section
                        if (!inOutreachSection) {
                            inOutreachSection = true;
                            // Start with Event 0, will immediately advance to Event 1 when header sticks
                            committedEventIndex = 0;
                            updateActiveEvent(0, false);
                        }
                        
                        // NEW APPROACH: Header sticky position = Event 1 starts (33.3% base)
                        // When header reaches sticky position (80px from top), that's when Event 1 locks in
                        const headerIsSticky = outreachRect.top <= 80;
                        
                        // Calculate scroll progress through spacer
                        const spacerTop = spacerRect.top;
                        const spacerHeight = spacerRect.height;
                        let scrollProgress = Math.max(0, Math.min(1, -spacerTop / spacerHeight));
                        
                        // CRITICAL: When header is sticky, we START at 33.3% (Event 1 committed)
                        // Then divide remaining 66.7% into 2 equal zones for Events 2 and 3
                        if (headerIsSticky) {
                            // Map 0-100% spacer scroll to 33.3-100% effective progress
                            scrollProgress = 0.333 + (scrollProgress * 0.667);
                        }
                        
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
                        
                        // SNAP BEHAVIOR - small swipes register as full event changes
                        // Each event gets EXACTLY 1/3 of scroll space (33.3%)
                        const zoneSize = 1.0 / totalEvents; // 0.333 for 3 events
                        
                        // Calculate which zone we're in and position within that zone
                        const currentZone = Math.floor(scrollProgress / zoneSize);
                        const positionInZone = (scrollProgress % zoneSize) / zoneSize; // 0 to 1 within zone
                        
                        // Determine target event with snap behavior
                        let targetEventIndex = committedEventIndex;
                        
                        // Forward snap: If we're 15% into the NEXT zone, commit to it
                        if (currentZone > committedEventIndex && positionInZone >= SNAP_THRESHOLD) {
                            targetEventIndex = Math.min(currentZone, totalEvents - 1);
                            committedEventIndex = targetEventIndex;
                        }
                        // Backward snap: If we're past 85% back into PREVIOUS zone, commit to it
                        else if (currentZone < committedEventIndex && positionInZone <= (1 - SNAP_THRESHOLD)) {
                            targetEventIndex = Math.max(currentZone, 0);
                            committedEventIndex = targetEventIndex;
                        }
                        // Full zone crossing: If we're deep into a different zone, commit immediately
                        else if (currentZone !== committedEventIndex && positionInZone >= 0.5) {
                            targetEventIndex = Math.min(Math.max(0, currentZone), totalEvents - 1);
                            committedEventIndex = targetEventIndex;
                        }
                        
                        // Update event display if target changed
                        if (targetEventIndex !== currentEventIndex) {
                            currentEventIndex = targetEventIndex;
                            updateActiveEvent(currentEventIndex, false);
                        }
                    } else {
                        // Outside the outreach section - reset to default background
                        if (inOutreachSection) {
                            inOutreachSection = false;
                            resetBackground();
                        }
                        
                        // Reset to first event when before section
                        if (outreachRect.top > window.innerHeight * 0.5) {
                            if (currentEventIndex !== 0) {
                                currentEventIndex = 0;
                                committedEventIndex = 0;
                                updateActiveEvent(0, true);
                            }
                        }
                        // Keep last event when scrolled past
                        else if (spacerRect.bottom <= 0) {
                            if (currentEventIndex !== totalEvents - 1) {
                                currentEventIndex = totalEvents - 1;
                                committedEventIndex = totalEvents - 1;
                                updateActiveEvent(currentEventIndex, true);
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
                        
                        // Update ALL indicator dots (in header and in each event card)
                        const allDots = document.querySelectorAll('.event-dot');
                        allDots.forEach((dot) => {
                            const dotIndex = parseInt(dot.getAttribute('data-dot')) - 1;
                            if (dotIndex === index) {
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
                
                // Touch/Swipe handling for events
                let touchStartX = 0;
                let touchStartY = 0;
                let touchEndX = 0;
                let touchEndY = 0;
                let isSwipeActive = false;
                let swipeDebounceTimer = null;
                const swipeThreshold = 40; // Very small threshold for easy swiping
                const swipeDebounceTime = 600; // Prevent accidental double-swipes
                
                const eventsContainer = document.querySelector('.events-container');
                
                if (eventsContainer) {
                    eventsContainer.addEventListener('touchstart', (e) => {
                        if (isSwipeActive) return;
                        touchStartX = e.changedTouches[0].screenX;
                        touchStartY = e.changedTouches[0].screenY;
                    }, { passive: true });
                    
                    eventsContainer.addEventListener('touchend', (e) => {
                        if (isSwipeActive) return;
                        
                        touchEndX = e.changedTouches[0].screenX;
                        touchEndY = e.changedTouches[0].screenY;
                        
                        const deltaX = touchEndX - touchStartX;
                        const deltaY = touchEndY - touchStartY;
                        
                        // Only process if horizontal swipe is dominant
                        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
                            isSwipeActive = true;
                            
                            if (deltaX > 0) {
                                // Swipe right - go to previous event
                                if (currentEventIndex > 0) {
                                    currentEventIndex--;
                                    updateActiveEvent(currentEventIndex, false);
                                }
                            } else {
                                // Swipe left - go to next event
                                if (currentEventIndex < totalEvents - 1) {
                                    currentEventIndex++;
                                    updateActiveEvent(currentEventIndex, false);
                                }
                            }
                            
                            // Reset swipe lock after debounce time
                            clearTimeout(swipeDebounceTimer);
                            swipeDebounceTimer = setTimeout(() => {
                                isSwipeActive = false;
                            }, swipeDebounceTime);
                        }
                    }, { passive: true });
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
                
                // Clothes Drive Form - Add/Remove Children
                const addChildBtn = document.querySelector('.btn-add-child');
                const childrenContainer = document.getElementById('children-container');
                let childCount = 1;
                
                if (addChildBtn && childrenContainer) {
                    addChildBtn.addEventListener('click', () => {
                        childCount++;
                        
                        const childForm = document.createElement('div');
                        childForm.className = 'child-form';
                        childForm.setAttribute('data-child-number', childCount);
                        childForm.innerHTML = \`
                            <div class="child-header">
                                <h4 class="child-number">Child \${childCount}</h4>
                                <button type="button" class="btn-remove-child" data-child="\${childCount}">Remove</button>
                            </div>
                            
                            <div class="form-group">
                                <label for="child-\${childCount}-name">Child's Name *</label>
                                <input type="text" id="child-\${childCount}-name" name="child-\${childCount}-name" required placeholder="John Doe">
                            </div>
                            
                            <div class="form-row form-row-3">
                                <div class="form-group">
                                    <label for="child-\${childCount}-age">Age *</label>
                                    <input type="number" id="child-\${childCount}-age" name="child-\${childCount}-age" required placeholder="8" min="0" max="18">
                                </div>
                                <div class="form-group">
                                    <label for="child-\${childCount}-gender">Gender *</label>
                                    <select id="child-\${childCount}-gender" name="child-\${childCount}-gender" required>
                                        <option value="">Select</option>
                                        <option value="F">Female</option>
                                        <option value="M">Male</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="child-\${childCount}-shoe">Shoe Size *</label>
                                    <input type="text" id="child-\${childCount}-shoe" name="child-\${childCount}-shoe" required placeholder="2">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="child-\${childCount}-interests">Interests (Optional)</label>
                                <input type="text" id="child-\${childCount}-interests" name="child-\${childCount}-interests" placeholder="Sports, art, music...">
                            </div>
                        \`;
                        
                        childrenContainer.appendChild(childForm);
                        
                        // Smooth scroll to new child form
                        childForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    });
                    
                    // Handle remove child buttons
                    childrenContainer.addEventListener('click', (e) => {
                        if (e.target.classList.contains('btn-remove-child')) {
                            const childNumber = e.target.getAttribute('data-child');
                            const childForm = childrenContainer.querySelector(\`[data-child-number="\${childNumber}"]\`);
                            if (childForm) {
                                childForm.remove();
                            }
                        }
                    });
                }
                
                // Handle "More Info" button click to scroll to Event 2 and activate it
                const moreInfoBtn = document.querySelector('.btn-more-info');
                if (moreInfoBtn) {
                    moreInfoBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        
                        // Scroll to outreach section
                        const outreachSection = document.getElementById('outreach');
                        if (outreachSection) {
                            // Calculate position to scroll to
                            const navHeight = document.querySelector('.nav-shell')?.offsetHeight || 0;
                            const targetPosition = outreachSection.offsetTop - navHeight - 20;
                            
                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
                            });
                            
                            // Wait for scroll to complete, then activate event 2
                            setTimeout(() => {
                                // Trigger event 2 to become active
                                currentEventIndex = 1; // Event 2 (index 1)
                                updateActiveEvent(currentEventIndex, false);
                            }, 800);
                        }
                    });
                }
                
                // Lightbox functionality for flyer images
                const lightbox = document.createElement('div');
                lightbox.className = 'lightbox';
                lightbox.innerHTML = \`
                    <button class="lightbox-close" aria-label="Close">×</button>
                    <div class="lightbox-content">
                        <img src="" alt="Flyer" class="lightbox-image">
                    </div>
                    <div class="lightbox-instructions">
                        Click image to zoom • Click × or press ESC to close
                    </div>
                \`;
                document.body.appendChild(lightbox);
                
                const lightboxImage = lightbox.querySelector('.lightbox-image');
                const lightboxClose = lightbox.querySelector('.lightbox-close');
                let isZoomed = false;
                
                // Open lightbox when clicking on flyer images
                document.querySelectorAll('.flyer-image').forEach(img => {
                    img.addEventListener('click', (e) => {
                        e.stopPropagation();
                        lightboxImage.src = img.src;
                        lightboxImage.alt = img.alt;
                        lightbox.classList.add('active');
                        document.body.style.overflow = 'hidden'; // Prevent background scrolling
                        isZoomed = false;
                        lightboxImage.classList.remove('zoomed');
                    });
                });
                
                // Toggle zoom on image click
                lightboxImage.addEventListener('click', (e) => {
                    e.stopPropagation();
                    isZoomed = !isZoomed;
                    if (isZoomed) {
                        lightboxImage.classList.add('zoomed');
                    } else {
                        lightboxImage.classList.remove('zoomed');
                    }
                });
                
                // Close lightbox function
                function closeLightbox() {
                    lightbox.classList.remove('active');
                    document.body.style.overflow = ''; // Restore scrolling
                    isZoomed = false;
                    lightboxImage.classList.remove('zoomed');
                    setTimeout(() => {
                        lightboxImage.src = '';
                    }, 300);
                }
                
                // Close on X button
                lightboxClose.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeLightbox();
                });
                
                // Close on background click
                lightbox.addEventListener('click', (e) => {
                    if (e.target === lightbox) {
                        closeLightbox();
                    }
                });
                
                // Close on ESC key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                        closeLightbox();
                    }
                });
                
                // Prevent zoom on mobile pinch (keep native zoom)
                if ('ontouchstart' in window) {
                    let lastTouchEnd = 0;
                    lightboxImage.addEventListener('touchend', (e) => {
                        const now = Date.now();
                        if (now - lastTouchEnd <= 300) {
                            e.preventDefault();
                            isZoomed = !isZoomed;
                            if (isZoomed) {
                                lightboxImage.classList.add('zoomed');
                            } else {
                                lightboxImage.classList.remove('zoomed');
                            }
                        }
                        lastTouchEnd = now;
                    }, false);
                }
                
                // JotForm Submission Handler - Listen for form completion
                window.addEventListener('message', function(e) {
                    if (typeof e.data === 'object' && e.data.action === 'submission-completed') {
                        // Form was successfully submitted
                        showSuccessState();
                    }
                });
                
                function showSuccessState() {
                    // Hide JotForm, show success state
                    const jotformContainer = document.querySelector('.jotform-container');
                    const successState = document.querySelector('.form-success');
                    
                    if (jotformContainer && successState) {
                        jotformContainer.style.display = 'none';
                        successState.style.display = 'flex';
                        
                        // Trigger confetti animation
                        createConfetti();
                        
                        // Scroll to success message
                        successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
                
                function createConfetti() {
                    const confettiEmojis = ['🎁', '🎁', '🎁', '🎁', '🎁'];
                    const confettiCount = 50;
                    
                    for (let i = 0; i < confettiCount; i++) {
                        setTimeout(() => {
                            const confetti = document.createElement('div');
                            confetti.className = 'confetti';
                            confetti.textContent = confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
                            confetti.style.left = Math.random() * 100 + '%';
                            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
                            confetti.style.animationDelay = Math.random() * 0.5 + 's';
                            document.body.appendChild(confetti);
                            
                            // Remove after animation
                            setTimeout(() => confetti.remove(), 4000);
                        }, i * 50);
                    }
                }
                
                // Calendar Integration
                const appleCalendarBtn = document.getElementById('apple-calendar');
                const googleCalendarBtn = document.getElementById('google-calendar');
                
                // Event details
                const eventTitle = 'Christmas Clothes Drive for Mothers';
                const eventDescription = 'Christmas outreach program - drop off during office hours';
                const eventLocation = '3080 N Wildwood St, Boise, Idaho';
                const eventDate = '20251206'; // December 6, 2025 (YYYYMMDD)
                const eventStartTime = '20251206T090000'; // 9:00 AM
                const eventEndTime = '20251206T170000'; // 5:00 PM
                
                // Google Calendar URL
                if (googleCalendarBtn) {
                    const googleUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
                        '&text=' + encodeURIComponent(eventTitle) +
                        '&dates=' + eventStartTime + '/' + eventEndTime +
                        '&details=' + encodeURIComponent(eventDescription) +
                        '&location=' + encodeURIComponent(eventLocation) +
                        '&sf=true&output=xml';
                    
                    googleCalendarBtn.href = googleUrl;
                }
                
                // Apple Calendar (ICS download)
                if (appleCalendarBtn) {
                    appleCalendarBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        
                        const icsContent = [
                            'BEGIN:VCALENDAR',
                            'VERSION:2.0',
                            'PRODID:-//Morning Star Christian Church//EN',
                            'BEGIN:VEVENT',
                            'UID:' + Date.now() + '@morningstarchurch.com',
                            'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
                            'DTSTART:' + eventStartTime,
                            'DTEND:' + eventEndTime,
                            'SUMMARY:' + eventTitle,
                            'DESCRIPTION:' + eventDescription,
                            'LOCATION:' + eventLocation,
                            'BEGIN:VALARM',
                            'TRIGGER:-PT24H',
                            'ACTION:DISPLAY',
                            'DESCRIPTION:Reminder: ' + eventTitle + ' tomorrow',
                            'END:VALARM',
                            'END:VEVENT',
                            'END:VCALENDAR'
                        ].join('\\r\\n');
                        
                        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                        const link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        link.download = 'christmas-clothes-drive.ics';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    });
                }

                // Carousel functionality
                const carouselStates = {
                    event2: { currentSlide: 0, totalSlides: 2 }
                };

                window.moveCarousel = function(carouselId, direction) {
                    const state = carouselStates[carouselId];
                    state.currentSlide = (state.currentSlide + direction + state.totalSlides) % state.totalSlides;
                    updateCarousel(carouselId);
                };

                window.goToSlide = function(carouselId, slideIndex) {
                    const state = carouselStates[carouselId];
                    state.currentSlide = slideIndex;
                    updateCarousel(carouselId);
                };

                function updateCarousel(carouselId) {
                    const state = carouselStates[carouselId];
                    const carousel = document.getElementById(carouselId + '-carousel');
                    const dots = carousel.parentElement.querySelectorAll('.carousel-dot');
                    
                    // Update slides position
                    carousel.style.transform = \`translateX(-\${state.currentSlide * 100}%)\`;
                    
                    // Update dots
                    dots.forEach((dot, index) => {
                        if (index === state.currentSlide) {
                            dot.classList.add('active');
                        } else {
                            dot.classList.remove('active');
                        }
                    });
                }

                // Auto-advance carousel (optional, every 5 seconds)
                setInterval(() => {
                    moveCarousel('event2', 1);
                }, 5000);
            });
        </script>
        
        <!-- Version Number Footer -->
        <div class="version-footer">v1.7.8</div>
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
