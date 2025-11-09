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
    <!-- v1.20.14 - Auto-play video during Sunday service (9am-9:45am MT) -->
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
                --bg-event1: linear-gradient(135deg, #f5e6d8 0%, #f0d9c8 100%); /* Muted warm terracotta/orange from Friendsgiving flyer */
                --bg-event2: linear-gradient(135deg, #e8ead8 0%, #dde0c8 100%); /* Muted olive/sage green from Project Christmas Cheer flyer */
                --bg-event3: linear-gradient(135deg, #f5d8d8 0%, #f0c8c8 100%); /* Pleasant muted light red for Christmas */
                --outreach-spacer: 312vh;
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            /* Fallback for older iOS devices (iPhone 6S, iPhone X, etc.) that don't support backdrop-filter */
            /* Replace frosted glass effect with solid white backgrounds */
            @supports not (backdrop-filter: blur(1px)) {
                .nav-shell,
                .nav-cta,
                .hero .eyebrow,
                .section-eyebrow,
                .section-card,
                .schedule-item,
                .btn-secondary,
                .nav-form-btn,
                .gift-lightbox-close,
                .gift-lightbox-arrow,
                .lightbox-instructions,
                .contact-info-item {
                    background: rgb(255, 255, 255) !important;
                    border: 1px solid rgba(0, 0, 0, 0.08) !important;
                }
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
                background: rgb(255, 255, 255);
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
                text-align: center;
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

            /* Hero Section - Base (minimal, universal only) */
            .hero {
                width: 100%;
            }
            
            .hero-title {
                /* Inherits from .hero h1 styles below */
            }
            
            .hero-body {
                width: 100%;
            }
            
            .hero-content {
                width: 100%;
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
            #outreach { overscroll-behavior: contain; }

            .outreach {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }

            .outreach-header {
                position: sticky;
                top: 28px;
                z-index: 10;
                margin-bottom: 8vh;
                text-align: left;
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
                top: 0vh;
                height: 80vh;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding-top: 5px;
            }

            .outreach-scroll-container { position: relative; }
            .events-container { position: relative; width: 100%; height: 100%; }

            .event-slide {
                position: absolute;
                inset: 0;
                width: 100%;
                opacity: 0;
                visibility: hidden;
                transform: translateY(30px) scale(0.95);
                transition: opacity 0.4s cubic-bezier(0.25,0.46,0.45,0.94),
                            transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
                pointer-events: none;
                z-index: 0;
                will-change: transform, opacity;
            }

            .event-slide.active {
                opacity: 1;
                visibility: visible;
                transform: translateY(0) scale(1);
                pointer-events: auto;
                z-index: 1;
            }

            .scroll-spacer { height: var(--outreach-spacer); pointer-events: none; }
            
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
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.7);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
                border: 2px solid transparent;
            }
            
            .event-dot.active {
                width: 12px;
                height: 12px;
                background: #d4a574;
                box-shadow: 0 0 16px rgba(212, 165, 116, 0.8),
                            0 4px 12px rgba(212, 165, 116, 0.4);
                border: 2px solid #d4a574;
                transform: scale(1.1);
            }
            
            .event-dot:hover:not(.active) {
                background: rgba(255, 255, 255, 0.9);
                transform: scale(1.1);
            }
            
            /* Scroll hint removed - using dot indicators only */

            @media (prefers-reduced-motion: reduce) {
                .event-slide { transition: none; transform: none; }
                .outreach-header { transition: none; }
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
            
            /* Meta row with date and dots - HIDDEN, now overlaid on image */
            .event-meta-row {
                display: none;
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
            
            /* Image Wrapper - Fixed 3:4 portrait aspect ratio for seamless display */
            .event-flyer-wrapper {
                position: relative;
                width: 100%;
                max-width: 469px;  /* Reduced from 517px to account for removed padding */
                aspect-ratio: 3/4;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
                margin: 0 auto 24px;  /* Center with auto margins, removed horizontal padding */
                padding: 0;  /* Removed horizontal padding to prevent flyer cutoff */
                box-sizing: border-box;
                border-radius: 32px; /* Match other site elements (hero, schedule items) */
                overflow: hidden; /* Clip any overflow while preserving rounded corners */
            }
            
            /* Image styling - Enforces 3:4 aspect ratio, rounded corners match site elements */
            .flyer-image {
                width: 101%;
                height: 101%;
                object-fit: cover;
                object-position: center;
                border-radius: 32px;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
                margin: -0.5%; /* Center the slightly oversized image */
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
                border-radius: 32px;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
            }
            
            /* Date and Dots Overlaid on Image */
            .event-flyer-wrapper .event-date {
                position: absolute;
                top: 16px;
                left: 32px;
                z-index: 20;
                margin: 0;
            }
            
            .event-flyer-wrapper .event-indicators {
                position: absolute;
                top: 20px;
                right: 40px;
                z-index: 20;
                filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4)) drop-shadow(0 4px 16px rgba(0, 0, 0, 0.3));
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
            
            /* Hide buttons for events 1 and 3, show only for event 2 */
            .event-slide[data-event="1"] .event-cta,
            .event-slide[data-event="3"] .event-cta {
                display: none;
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
            
            /* Countdown Timer */
            .countdown-container {
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                margin: 6px 0;
            }
            
            .countdown-label {
                color: rgba(255, 255, 255, 0.7);
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1.5px;
            }
            
            .countdown-timer {
                display: flex;
                gap: 12px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .countdown-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                min-width: 45px;
            }
            
            .countdown-number {
                font-size: 24px;
                font-weight: 700;
                color: #ffffff;
                font-family: 'Playfair Display', serif;
                line-height: 1;
            }
            
            .countdown-label-small {
                font-size: 9px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: rgba(255, 255, 255, 0.6);
            }
            
            /* Playlist Button */
            .playlist-btn {
                margin-top: 16px;
                width: auto;
                display: inline-flex;
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
            
            /* Gift Gallery - Images always in a row, scale to fit */
            .gift-gallery {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 2%;
                margin: 32px 0 12px;
                flex-wrap: nowrap;
                width: 100%;
            }
            
            .gift-image {
                flex: 1;
                max-width: 30%;
                height: auto;
                aspect-ratio: 1/1;
                object-fit: cover;
                border-radius: 16px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .gift-image {
                cursor: pointer;
            }
            
            .gift-image:hover {
                transform: translateY(-4px) scale(1.05);
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
            }
            
            /* Gift Gallery Lightbox */
            .gift-lightbox {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                z-index: 10000;
                align-items: center;
                justify-content: center;
            }
            
            .gift-lightbox.active {
                display: flex;
            }
            
            .gift-lightbox-content {
                position: relative;
                max-width: 90%;
                max-height: 90vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .gift-lightbox-image {
                max-width: 100%;
                max-height: 90vh;
                object-fit: contain;
                border-radius: 8px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }
            
            .gift-lightbox-close {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 48px;
                height: 48px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 24px;
                color: white;
                transition: all 0.3s ease;
                z-index: 10001;
            }
            
            .gift-lightbox-close:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
            }
            
            .gift-lightbox-arrow {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 56px;
                height: 56px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 28px;
                color: white;
                transition: all 0.3s ease;
                z-index: 10001;
            }
            
            .gift-lightbox-arrow:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-50%) scale(1.1);
            }
            
            .gift-lightbox-arrow.prev {
                left: 20px;
            }
            
            .gift-lightbox-arrow.next {
                right: 20px;
            }
            
            /* See Flyer Button - Small, below heading */
            .btn-see-flyer {
                display: inline-block;
                width: auto;
                margin: 8px auto 16px;
                padding: 8px 24px;
                font-size: 11px;
                font-weight: 600;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                border-radius: 100px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                text-align: center;
            }
            
            .btn-see-flyer:hover {
                transform: translateY(-2px);
                background: rgba(255, 255, 255, 1) !important;
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12) !important;
                border-color: rgba(26, 26, 46, 0.15) !important;
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

            /* ========================================
               MOBILE STYLES (≤899px - phone and small tablets only)
               All mobile breakpoints wrapped together (up to 899px)
               Tablet/Desktop (≥900px) will use desktop-style layouts
               ======================================== */
            @media (max-width: 899px) {
                /* Mobile Hero Section - Grid vertical layout (applies to mobile AND narrow windows) */
                .hero {
                    display: grid;
                    gap: 40px;
                    padding: 60px 0;
                }
                
                .hero-body {
                    display: grid;
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
                
                /* Outreach Section - Mobile scroll behavior */
                .outreach {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                }
                
                .outreach-scroll-container {
                    position: relative;
                    margin-top: 0;
                }
                
                .sticky-wrapper {
                    position: sticky;
                    top: 0vh;
                    height: 80vh;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 5px;
                }
                
                .events-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }
                
                .event-slide {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(30px) scale(0.95);
                    transition: opacity 0.4s cubic-bezier(0.25,0.46,0.45,0.94),
                                transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
                    pointer-events: none;
                    z-index: 0;
                    will-change: transform, opacity;
                }
                
                .event-slide.active {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0) scale(1);
                    pointer-events: auto;
                    z-index: 1;
                }
                
                .scroll-spacer {
                    height: var(--outreach-spacer);
                    pointer-events: none;
                }
                
                /* Event cards - Mobile full-screen layout */
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
            }
            
            @media (max-width: 899px) {
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
                    top: 15vh;
                }
                
                .scroll-spacer {
                    height: 683vh;
                }
            }

            @media (max-width: 899px) {
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
                
                /* GIFTS button - shift right when compressed */
                .nav-shell.scrolled-mobile .nav-cta {
                    width: auto;
                    margin-left: auto;
                    padding: 8px 20px;
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
                    max-width: 426px;  /* Reduced from 466px to account for removed padding */
                    padding: 0;  /* Removed horizontal padding to prevent flyer cutoff */
                    margin: 0 auto 20px;  /* Center with auto margins */
                }
                
                .flyer-image {
                    border-radius: 32px;
                }
                
                .placeholder-flyer {
                    border-radius: 32px;
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

            /* Small Phones - Industry Standard Responsive Scaling (320px-480px) */
            /* Uses clamp() with 960px values as MAX to preserve iPhone 17 Pro Max perfection */
            @media (max-width: 480px) {
                .page {
                    width: 100%;
                    padding: 0 clamp(3%, 5vw, 5%);
                    box-sizing: border-box;
                }

                .nav-spacer {
                    height: clamp(130px, 40vw, 190px);
                }

                .nav-shell {
                    padding: clamp(12px, 3.5vw, 16px) clamp(15px, 4.5vw, 20px);
                    border-radius: clamp(32px, 8vw, 40px);
                    top: clamp(8px, 2.5vw, 12px);
                    width: 94%;
                    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                
                .nav-shell.scrolled-mobile {
                    border-radius: 100px;
                    padding: clamp(6px, 1.8vw, 8px) clamp(15px, 4.5vw, 20px);
                    top: clamp(6px, 1.8vw, 8px);
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
                    margin-left: 8px;
                    right: auto;
                }
                
                /* Active state for GIFTS button */
                .nav-form-btn.active {
                    font-weight: 900;
                    background: linear-gradient(135deg, #d4a574 0%, #c89860 100%);
                    color: #ffffff;
                    box-shadow: 0 8px 24px rgba(212, 165, 116, 0.4),
                                0 4px 12px rgba(212, 165, 116, 0.2);
                }
                
                /* Mobile 480px Event Cards - Moderate scaling for small screens */
                .event-card {
                    height: 88vh;
                    padding-top: clamp(10px, 2.5vw, 14px);
                }
                
                .event-meta-row {
                    max-width: clamp(340px, 80vw, 360px);
                    padding: 0 clamp(14px, 3.5vw, 16px);
                    margin-bottom: clamp(12px, 2.8vw, 14px);
                }
                
                .event-date {
                    padding: clamp(5px, 1.4vw, 6px) clamp(14px, 3.8vw, 16px);
                    font-size: clamp(8px, 2.2vw, 9px);
                }
                
                .event-flyer-wrapper {
                    max-width: clamp(322px, 78vw, 382px);  /* Reduced to account for removed padding */
                    padding: 0;  /* Removed horizontal padding to prevent flyer cutoff */
                    margin: 0 auto clamp(14px, 3.2vw, 16px);  /* Center with auto margins */
                    /* Reduce image height slightly on small screens to make room for button */
                    max-height: 68vh;
                }
                
                .flyer-image {
                    border-radius: 32px;
                    max-height: 68vh;
                    object-fit: contain;
                }
                
                .placeholder-flyer {
                    border-radius: 32px;
                }
                
                .event-cta {
                    padding: 0 clamp(14px, 3.5vw, 16px);
                    margin-bottom: clamp(14px, 3.2vw, 16px);
                    max-width: clamp(340px, 80vw, 360px);
                }
                
                .event-cta .btn {
                    padding: clamp(15px, 3.8vw, 16px) clamp(28px, 7vw, 32px);
                    font-size: clamp(12px, 3.2vw, 13px);
                    border-radius: clamp(17px, 4.2vw, 18px);
                }

                .brand-title {
                    font-size: clamp(14px, 4vw, 16px);
                    letter-spacing: clamp(1.5px, 0.5vw, 2px);
                    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .brand-subtitle {
                    font-size: clamp(7px, 2.2vw, 9px);
                    letter-spacing: clamp(2.5px, 0.7vw, 3px);
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
                    font-size: clamp(9px, 2.5vw, 10px);
                    letter-spacing: clamp(1.5px, 0.5vw, 2px);
                }
                
                .nav-shell.scrolled-mobile nav a {
                    font-size: clamp(9px, 2.5vw, 10px);
                    letter-spacing: clamp(1.5px, 0.5vw, 2px);
                }

                .nav-cta {
                    padding: clamp(8px, 2.5vw, 10px) clamp(18px, 5vw, 24px);
                    font-size: clamp(9px, 2.5vw, 10px);
                    letter-spacing: clamp(1.5px, 0.4vw, 2px);
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
                    top: 18vh;
                    gap: 0;
                    padding-bottom: 100px;
                    justify-content: flex-start;
                }

                .scroll-spacer {
                    height: 234vh;
                }
                
                .events-container {
                    margin-top: 0;
                    flex: 0 0 auto;
                }
                
                .event-indicators {
                    display: flex;
                    right: 16px;
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
                
                .event-flyer-wrapper .event-date {
                    top: 12px;
                    left: 24px;
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
                    border-radius: 32px;
                }

                .placeholder-flyer {
                    font-size: 17px;
                    letter-spacing: 1.5px;
                    border-radius: 32px;
                }

                .watch {
                    margin-top: 120px;
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
                
                /* Gift Gallery Mobile - Keep in row, smaller gap */
                .gift-gallery {
                    gap: 1.5%;
                    margin: 24px 0;
                }
                
                .gift-image {
                    border-radius: 12px;
                }
                
                .btn-see-flyer {
                    padding: 7px 20px;
                    font-size: 10px;
                    margin: 6px auto 12px;
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
            
            /* 375px breakpoint REMOVED - Using fluid clamp() scaling in 480px breakpoint instead */
            /* This ensures smooth scaling from 320px to 960px with iPhone 17 Pro Max values as maximum */
            @media (max-width: 0px) {
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
                
                .event-flyer-wrapper .event-date {
                    top: 12px;
                    left: 20px;
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
                    max-width: 373px;
                    padding: 0 12px;
                    margin-bottom: 14px;
                }
                
                .flyer-image {
                    border-radius: 32px;
                }
                
                .placeholder-flyer {
                    border-radius: 32px;
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
                
                /* Watch Section */
                .watch {
                    gap: 12px;
                    margin-top: 100px;
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
                
                /* Gift Gallery 375px - Tighter spacing */
                .gift-gallery {
                    gap: 1%;
                    margin: 16px 0;
                }
                
                .gift-image {
                    border-radius: 8px;
                }
                
                .btn-see-flyer {
                    padding: 6px 16px;
                    font-size: 9px;
                    margin: 5px auto 10px;
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
            
            
            /* ========================================
               TABLET / NARROW DESKTOP STYLES (900px-1199px)
               Extends desktop-style layouts to medium screens
               Two-column layout optimized for tablets and narrow desktop windows
               ======================================== */
            @media (min-width: 900px) and (max-width: 1199px) {
                /* Tablet navigation - keep it cleaner */
                .nav-shell {
                    padding: 16px 32px;
                    gap: 24px;
                    flex-wrap: nowrap;
                }
                
                .brand {
                    width: auto;
                }
                
                nav ul {
                    width: auto;
                    flex-wrap: nowrap;
                    gap: 24px;
                }
                
                .nav-cta {
                    width: auto;
                }
                
                /* Tablet Hero - TWO COLUMN LAYOUT but more compact than desktop */
                .hero {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 20px 0 60px;
                }
                
                .hero h1 {
                    font-size: clamp(48px, 6vw, 72px);
                    line-height: 1.1;
                    text-align: left;
                    margin-bottom: 16px;
                }
                
                .hero-body {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: auto auto;
                    grid-template-areas: 
                        "content image"
                        "buttons image";
                    gap: 32px;
                    align-items: start;
                }
                
                .hero-content {
                    grid-area: content;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .hero-image {
                    grid-area: image;
                    min-height: 400px;
                    height: 450px;
                }
                
                .hero-body .cta-group {
                    grid-area: buttons;
                    flex-direction: row;
                    justify-content: flex-start;
                }
                
                .hero p {
                    font-size: 18px;
                    text-align: left;
                }
                
                /* Tablet Outreach Section - Keep scroll behavior but optimize spacing */
                .outreach {
                    min-height: 100vh;
                }
                
                .sticky-wrapper {
                    padding-top: 20px;
                }
                
                /* Tablet Schedule - 2 columns */
                .schedule-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 32px;
                }
                
                /* Tablet Contact - better spacing */
                .contact {
                    gap: 56px;
                }
            }

            /* ========================================
               DESKTOP-ONLY STYLES (≥1200px)
               Full desktop experience with maximum spacing and sizing
               Mobile styles (≤899px) are completely isolated
               ======================================== */
            @media (min-width: 1200px) {
                /* Desktop container and layout - only for wide screens (≥1200px) */
                /* Narrow windows (961-1199px) will use mobile layout */
                .page {
                    max-width: 1400px;
                }
                
                /* Desktop Navigation Spacer - CRITICAL: Override base 380px */
                .nav-spacer {
                    height: 120px;  /* Natural spacing for desktop */
                }
                
                main {
                    gap: 120px;
                    margin-bottom: 120px;
                }
                
                /* Desktop Hero Section - TWO COLUMN GRID */
                .hero {
                    display: flex;
                    flex-direction: column;
                    gap: clamp(8px, 1vw, 12px);  /* Much tighter gap */
                    padding: clamp(10px, 1.5vw, 15px) 0 clamp(50px, 6vw, 70px);  /* Very minimal top padding */
                    max-width: 100%;
                    margin: 0;
                    min-height: auto;
                    overflow: visible;  /* Allow descenders to show */
                }
                
                .hero h1 {
                    max-width: clamp(1100px, 90vw, 1300px);  /* Match hero-body max-width */
                    margin: 0 auto;
                    width: 100%;
                    padding: 0 clamp(16px, 3vw, 32px);  /* Responsive side padding */
                    overflow: visible;  /* Allow descenders like g to show */
                }
                
                .hero-body {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: auto auto;
                    grid-template-areas: 
                        "content image"
                        "buttons image";
                    max-width: clamp(1100px, 90vw, 1300px);  /* Responsive max-width */
                    margin: 0 auto;
                    column-gap: clamp(40px, 5vw, 70px);  /* Responsive gap */
                    row-gap: clamp(16px, 2vw, 24px);  /* Responsive gap */
                    align-items: start;
                    width: 100%;
                }
                
                .hero-content {
                    grid-area: content;
                    max-width: 100%;  /* Let grid control width */
                    display: flex;
                    flex-direction: column;
                    gap: clamp(16px, 2vw, 24px);  /* Responsive gap */
                }
                
                .hero-image {
                    grid-area: image;
                    align-self: stretch;
                }
                
                .hero-body .cta-group {
                    grid-area: buttons;
                }
                
                .hero-content p {
                    text-align: left;
                    margin: 0;
                }
                
                .hero h1 {
                    font-size: clamp(64px, 7vw, 110px);  /* Much larger title */
                    line-height: 1.15;  /* Slightly more breathing room for descenders */
                    letter-spacing: -0.02em;  /* Slight tightening for large text */
                    text-align: left;
                    margin: 0 0 clamp(12px, 1.5vw, 18px) 0;  /* Tighter bottom margin */
                    overflow: visible;  /* Ensure letters don't get cut off */
                    padding-bottom: 4px;  /* Extra space for descenders like g */
                }
                
                .hero p {
                    font-size: clamp(20px, 1.8vw, 24px);  /* Larger, responsive copy */
                    line-height: 1.6;
                    max-width: 100%;
                }
                
                .hero-image {
                    position: relative;
                    width: 100%;
                    min-height: clamp(500px, 50vh, 650px);  /* Larger, responsive height */
                    max-height: clamp(600px, 60vh, 700px);
                    height: clamp(550px, 55vh, 650px);
                    border-radius: clamp(20px, 2vw, 28px);  /* Responsive border radius */
                    overflow: hidden;
                    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.15);
                }
                
                .hero-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                
                .hero-body .cta-group {
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                    width: auto;
                    margin-top: 0;
                }
                
                .hero-body .cta-group .btn {
                    width: auto;
                }
                
                /* Desktop Outreach Section - 3-in-row grid */
                .outreach {
                    max-width: 1400px;
                    margin: 0 auto;
                    width: min(1280px, 94%);
                    min-height: auto;
                    display: block;
                    padding-top: 0;
                }
                
                .outreach-header {
                    text-align: left;
                    margin-bottom: 48px;
                    position: static;
                    top: auto;
                    padding-bottom: 0;
                    width: 100%;
                }
                
                .outreach-header .section-eyebrow {
                    display: inline-flex;
                    margin-bottom: 16px;
                }
                
                .outreach-header .section-heading {
                    margin-bottom: 12px;
                    text-align: left;
                }
                
                .outreach-header .section-lead {
                    display: block;
                    max-width: 720px;
                    margin: 0;
                    text-align: left;
                }
                
                .heading-wrapper {
                    display: block;
                    width: 100%;
                }
                
                .heading-wrapper .event-indicators {
                    display: none;
                }
                
                .outreach-scroll-container {
                    position: relative;
                    margin-top: 0;
                }
                
                /* Desktop: No sticky, no scroll spacer */
                .sticky-wrapper {
                    position: relative;
                    top: 0;
                    height: auto;
                    min-height: auto;
                    padding: 0;
                    padding-bottom: 0;
                    gap: 0;
                    display: block;
                }
                
                .scroll-spacer {
                    display: none;
                    height: 0;
                }
                
                /* Desktop: Show all 3 events in grid */
                .events-container {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 32px;
                    padding: 0 20px;
                    width: 100%;
                    margin-top: 0;
                    position: relative;
                }
                
                /* Desktop: All events visible, no absolute positioning */
                .event-slide {
                    position: relative;
                    opacity: 1;
                    visibility: visible;
                    transform: none;
                    pointer-events: auto;
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                                box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 1;
                }
                
                /* Desktop: Event cards in columns */
                .event-card {
                    height: auto;
                    width: 100%;
                    margin: 0;
                    margin-left: 0;
                    padding: clamp(16px, 2vw, 24px);
                    padding-top: clamp(16px, 2vw, 24px);
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 24px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                }
                
                .event-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
                }
                
                /* Desktop: Event flyer sizing */
                .event-flyer-wrapper {
                    max-width: 100%;
                    aspect-ratio: 3/4;
                    margin-bottom: clamp(16px, 2vw, 20px);
                    padding: 0;
                    max-height: none;
                    position: relative;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                }
                
                .flyer-image,
                .placeholder-flyer {
                    border-radius: 32px;
                    max-height: none;
                    height: 100%;
                    width: 100%;
                    object-fit: cover;
                }
                
                .event-flyer-wrapper .event-date {
                    top: 12px;
                    left: 12px;
                    font-size: clamp(9px, 1vw, 10px);
                    padding: clamp(5px, 0.8vw, 6px) clamp(12px, 1.5vw, 14px);
                }
                
                .event-flyer-wrapper .event-indicators {
                    display: none;  /* Hide 3 dots on desktop event cards */
                }
                
                .event-cta {
                    padding: 0;
                    margin: 0;
                    margin-bottom: 0;
                    max-width: none;
                    position: relative;
                    width: 100%;
                    z-index: 100;
                }
                
                .event-cta .btn {
                    width: 100%;
                    padding: clamp(12px, 1.5vw, 14px) clamp(20px, 2.5vw, 24px);
                    font-size: clamp(11px, 1.2vw, 12px);
                    border-radius: 16px;
                }
                
                /* Desktop Watch Section - Properly scaled (reverted to original centered layout) */
                .watch {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .watch-card {
                    padding: 48px 56px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .watch-main {
                    max-width: 100%;
                }
                
                .preview-screen {
                    min-height: auto;
                    max-height: none;
                    padding: 40px;
                }
                
                .live-stream-container {
                    max-width: 900px;
                    margin: 0 auto;
                }
                
                .video-embed-wrapper {
                    max-width: 900px;
                    margin: 0 auto;
                    padding-bottom: 50.625%;
                }
                
                .youtube-embed {
                    max-height: none;
                }
                
                .playlist-btn {
                    max-width: 300px;
                    margin: 16px auto 0;
                }
                
                .countdown-container {
                    max-width: 500px;
                    margin: 8px auto;
                }
                
                /* Desktop Contact Section */
                .contact {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .contact-card {
                    padding: 72px 80px;
                    max-width: 1200px;
                }
                
                /* Desktop Schedule Section */
                .schedule-grid {
                    grid-template-columns: repeat(3, 1fr);
                    gap: 32px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                /* Desktop Section typography */
                .section-heading {
                    font-size: clamp(48px, 4vw, 64px);
                }
                
                .section-lead {
                    font-size: 20px;
                    max-width: 720px;
                }
            }
            
            /* Desktop Windows (1200px - 1280px) - slight adjustments */
            @media (min-width: 1200px) and (max-width: 1280px) {
                .page {
                    max-width: 1200px;
                }
                
                main {
                    gap: 100px;
                }
                
                .events-container {
                    gap: 24px;
                    padding: 0 16px;
                }
                
                .hero-body {
                    gap: 48px;
                }
                
                .contact-card {
                    padding: 60px;
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
                <a class="nav-cta" href="#contact">Free Gifts for Mothers</a>
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
                            <img src="https://page.gensparksite.com/v1/base64_upload/c7ac4d880c17976d0bef5eaab073245a" alt="Morning Star Christian Church building">
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
                    <address><a href="https://maps.app.goo.gl/nmYV7hSLXKVGexu38?g_st=ipc" target="_blank" rel="noopener" style="color: inherit; text-decoration: underline; text-decoration-color: rgba(212, 165, 116, 0.5); text-underline-offset: 4px; transition: text-decoration-color 0.3s ease;">3080 N Wildwood St · Boise, Idaho</a></address>
                    <div class="section-card">
                        <div class="schedule-grid">
                            <article class="schedule-item">
                                <span>Sunday Gatherings</span>
                                <h3>Sundays · 9:00 AM</h3>
                                <p>Morning service with free community breakfast after. Free transportation from select shelters included.</p>
                            </article>
                            <article class="schedule-item">
                                <span>Bible Study</span>
                                <h3>Tuesdays · 8:30 AM</h3>
                                <p>Morning Bible study with coffee at select local coffee shops.</p>
                            </article>
                            <article class="schedule-item">
                                <span>Bible Study</span>
                                <h3>Thursdays · 6:00 PM</h3>
                                <p>Evening Bible study at the church with free coffee.</p>
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
                                        <div class="event-flyer-wrapper">
                                            <span class="event-date">NOV 26</span>
                                            <div class="event-indicators">
                                                <div class="event-dot active" data-dot="1"></div>
                                                <div class="event-dot" data-dot="2"></div>
                                                <div class="event-dot" data-dot="3"></div>
                                            </div>
                                            <img src="https://page.gensparksite.com/v1/base64_upload/2955ae3606d04a2080ff96434f906195" alt="Friendsgiving Lunch - Lunch with our local community" class="flyer-image">
                                        </div>
                                        <div class="event-cta">
                                            <a class="btn btn-primary" href="#contact">RSVP NOW</a>
                                        </div>
                                    </div>
                                </div>

                                <!-- Event 2: Christmas Clothes Drive -->
                                <div class="event-slide" data-event="2" id="event-2">
                                    <div class="event-card">
                                        <div class="event-flyer-wrapper">
                                            <span class="event-date">DEC 6</span>
                                            <div class="event-indicators">
                                                <div class="event-dot active" data-dot="1"></div>
                                                <div class="event-dot" data-dot="2"></div>
                                                <div class="event-dot" data-dot="3"></div>
                                            </div>
                                            <img src="https://page.gensparksite.com/v1/base64_upload/f9499299e0229e4c70835962b6b6d11e" alt="Project Christmas Cheer - A Gift for you and your loved ones" class="flyer-image" />
                                        </div>
                                        <div class="event-cta">
                                            <a class="btn btn-primary" href="#contact">REQUEST ITEMS</a>
                                        </div>
                                    </div>
                                </div>

                                <!-- Event 3: Christmas Eve Candlelight Service -->
                                <div class="event-slide" data-event="3">
                                    <div class="event-card">
                                        <div class="event-flyer-wrapper">
                                            <span class="event-date">DEC 21</span>
                                            <div class="event-indicators">
                                                <div class="event-dot active" data-dot="1"></div>
                                                <div class="event-dot" data-dot="2"></div>
                                                <div class="event-dot" data-dot="3"></div>
                                            </div>
                                            <img src="https://page.gensparksite.com/v1/base64_upload/eef229dd6db6c99d20bfafeb27252557" alt="Together in Song - A festive family Christmas event" class="flyer-image" />
                                        </div>
                                        <div class="event-cta">
                                            <a class="btn btn-primary" href="#contact">RESERVE YOUR SEAT</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="scroll-spacer"></div>
                    </div>
                </section>
                
                <section class="watch" id="watch" style="animation-delay: 0.4s">
                    <div class="watch-header">
                        <span class="section-eyebrow">Watch</span>
                        <h2 class="section-heading">Join us live every Sunday.</h2>
                    </div>
                    <div class="watch-card">
                        <div class="watch-main">
                            <!-- Live Stream Status with Countdown -->
                            <div class="live-stream-container">
                                <span class="live-status"><span class="live-dot"></span><span class="live-status-text">Live Soon</span></span>
                                <div class="countdown-container">
                                    <div class="countdown-label">Next service starts in:</div>
                                    <div class="countdown-timer">
                                        <div class="countdown-item">
                                            <span class="countdown-number" id="days">0</span>
                                            <span class="countdown-label-small">Days</span>
                                        </div>
                                        <div class="countdown-item">
                                            <span class="countdown-number" id="hours">0</span>
                                            <span class="countdown-label-small">Hours</span>
                                        </div>
                                        <div class="countdown-item">
                                            <span class="countdown-number" id="minutes">0</span>
                                            <span class="countdown-label-small">Minutes</span>
                                        </div>
                                        <div class="countdown-item">
                                            <span class="countdown-number" id="seconds">0</span>
                                            <span class="countdown-label-small">Seconds</span>
                                        </div>
                                    </div>
                                </div>
                                <p class="live-verse">"He heals the brokenhearted and binds up their wounds."<small>Psalm 147:3</small></p>
                                
                                <!-- Main Video Embed - Latest Stream -->
                                <div class="video-embed-wrapper">
                                    <iframe 
                                        class="youtube-embed"
                                        src="https://www.youtube.com/embed?listType=playlist&list=PLHs3usNpG0bZHnAJlIpwBtkbnd7xDCeRC&index=1"
                                        title="Latest Sunday Service" 
                                        frameborder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                        allowfullscreen>
                                    </iframe>
                                </div>
                                
                                <!-- Playlist Button -->
                                <a href="https://www.youtube.com/playlist?list=PLHs3usNpG0bZHnAJlIpwBtkbnd7xDCeRC" target="_blank" rel="noopener" class="btn btn-outline playlist-btn">
                                    View Full Playlist
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section class="contact" id="contact" style="animation-delay: 0.5s">
                    <div class="contact-header">
                        <span class="section-eyebrow">Christmas Outreach</span>
                        <h2 class="section-heading">Christmas Gifts for Single Mothers & Widows</h2>
                        <h3 style="font-size: 22px; font-weight: 600; line-height: 1.4; margin: 24px 0 20px; color: #1a1a2e; font-family: 'Inter', sans-serif;">
                            This Christmas, Morning Star Christian Church is giving back to the incredible single moms and widows in our community who are working tirelessly to provide for their families.
                        </h3>
                        <p class="section-lead form-message">
                            Based on the information you share in the form, our team will handpick a special gift just for you and your family. You can look forward to a pair of shoes for the adults and something fun and useful for the kids, perfect for school and outdoor play. We'll wrap everything beautifully so it's ready to go right under your Christmas tree. Once you've submitted the form, you'll receive a text message confirming your submission and sharing all the pickup details.
                        </p>
                        
                        <!-- Image Gallery -->
                        <div class="gift-gallery">
                            <img src="https://page.gensparksite.com/v1/base64_upload/5c1a4fbfd958bc5aeb993b48c261bc94" alt="Shoes display" class="gift-image">
                            <img src="https://page.gensparksite.com/v1/base64_upload/8baf94a4a4ec4b77e4f2d6f455046d00" alt="Backpacks" class="gift-image">
                            <img src="https://page.gensparksite.com/v1/base64_upload/fdac7f790dc8cbb99902308e71533891" alt="School supplies" class="gift-image">
                        </div>
                        
                        <a href="#event-2" class="btn btn-secondary btn-see-flyer" style="background: rgba(255, 255, 255, 0.95); color: #1a1a2e; border: 2px solid rgba(26, 26, 46, 0.1); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); margin: 12px auto 24px;">See Flyer</a>
                        <blockquote style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(212, 165, 116, 0.05) 100%); border-left: 4px solid #d4a574; border-radius: 12px; font-style: italic; line-height: 1.8; color: rgba(26, 26, 46, 0.85);">
                            <p style="margin: 0 0 16px 0; font-size: 15px; font-weight: 600; color: #d4a574; letter-spacing: 0.5px;">1 John 3:16-18</p>
                            <p style="margin: 0;">This is how we know what love is: Jesus Christ laid down his life for us. And we ought to lay down our lives for our brothers and sisters. If anyone has material possessions and sees a brother or sister in need but has no pity on them, how can the love of God be in that person? Dear children, let us not love with words or speech but with actions and in truth.</p>
                        </blockquote>
                        
                        <address><a href="https://maps.app.goo.gl/nmYV7hSLXKVGexu38?g_st=ipc" target="_blank" rel="noopener" style="color: inherit; text-decoration: underline; text-decoration-color: rgba(212, 165, 116, 0.5); text-underline-offset: 4px; transition: text-decoration-color 0.3s ease;">3080 N Wildwood St, Boise, Idaho</a></address>
                    </div>
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
                                        <span class="detail-value"><a href="https://maps.app.goo.gl/nmYV7hSLXKVGexu38?g_st=ipc" target="_blank" rel="noopener" style="color: inherit; text-decoration: underline; text-decoration-color: rgba(212, 165, 116, 0.5); text-underline-offset: 4px; transition: text-decoration-color 0.3s ease;">3080 N Wildwood St, Boise, Idaho</a></span>
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
                </section>
            </main>
        </div>

        <script>
            document.addEventListener('DOMContentLoaded', () => {
                const body = document.body;
                const outreachSection = document.querySelector('.outreach');
                const outreachHeader = document.querySelector('.outreach-header');
                const scrollSpacer = document.querySelector('.scroll-spacer');
                const eventsContainer = document.querySelector('.events-container');
                const eventSlides = document.querySelectorAll('.event-slide');
                const navShell = document.querySelector('.nav-shell');
                const sections = document.querySelectorAll('section[id]');
                const navLinks = document.querySelectorAll('nav a[href^="#"]');
                const dots = document.querySelectorAll('.heading-wrapper .event-dot');

                if (!outreachSection || !scrollSpacer || !eventsContainer || !eventSlides.length) return;
                
                // Handle hash in URL on page load (e.g., ms.church/#contact)
                // Prevent browser's default anchor scroll and apply our custom offset
                if (window.location.hash && window.location.hash !== '#' && window.location.hash !== '') {
                    const hash = window.location.hash;
                    
                    // Scroll to top immediately to prevent browser's default scroll
                    window.scrollTo(0, 0);
                    
                    // After page fully loads, trigger the actual nav link click to ensure exact same behavior
                    window.addEventListener('load', () => {
                        setTimeout(() => {
                            // Find the nav link that matches this hash
                            const navLink = document.querySelector('a[href="' + hash + '"]');
                            if (navLink) {
                                // Programmatically click the nav link to trigger exact same scroll behavior
                                navLink.click();
                            }
                        }, 800);  // Wait 800ms for layout to fully settle before scrolling
                    }, { once: true });
                }
                
                // Mobile nav compression on scroll
                let lastNavScrollY = 0;
                // Expand nav when within 10% of scroll distance from top (90% scrolled up)
                // Responsive thresholds based on screen size
                function getScrollThreshold() {
                    const width = window.innerWidth;
                    if (width <= 375) return 130 * 0.10; // 10% of 130px nav-spacer
                    if (width <= 480) return 190 * 0.10; // 10% of 190px nav-spacer
                    if (width <= 960) return 190 * 0.10; // 10% of 190px nav-spacer
                    return 380 * 0.10; // 10% of 380px nav-spacer
                }
                let scrollUpAtTopCount = 0;
                
                function handleMobileNav() {
                    const currentScrollY = window.scrollY;
                    const scrollThreshold = getScrollThreshold();
                    
                    // Only apply on mobile and narrow windows (1199px and below)
                    if (window.innerWidth <= 1199) {
                        // Detect scroll up when already at/near top
                        if (currentScrollY <= scrollThreshold && currentScrollY < lastNavScrollY) {
                            scrollUpAtTopCount++;
                            
                            // If scrolling up at top, smooth scroll to absolute top and expand nav
                            if (scrollUpAtTopCount >= 2) {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                navShell.classList.remove('scrolled-mobile');
                                scrollUpAtTopCount = 0;
                            }
                        } else if (currentScrollY > scrollThreshold) {
                            // Past threshold - compress nav
                            navShell.classList.add('scrolled-mobile');
                            scrollUpAtTopCount = 0;
                        } else {
                            // At top but not scrolling up - expand nav
                            navShell.classList.remove('scrolled-mobile');
                            scrollUpAtTopCount = 0;
                        }
                    } else {
                        // Remove class on desktop
                        navShell.classList.remove('scrolled-mobile');
                        scrollUpAtTopCount = 0;
                    }
                    lastNavScrollY = currentScrollY;
                }
                
                let currentEventIndex = 0;
                const totalEvents = eventSlides.length;
                
                // Track if we're in the outreach section
                let inOutreachSection = false;
                
                // Rate limiting mechanism for event changes
                let isChangeRateLimited = false;
                let lastEventChangeTime = 0;
                const changeCooldownMs = 800;
                
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
                    
                    // Update GIFTS button active state
                    const giftsBtn = document.querySelector('.nav-form-btn');
                    if (giftsBtn) {
                        if (currentSection === 'contact') {
                            giftsBtn.classList.add('active');
                        } else {
                            giftsBtn.classList.remove('active');
                        }
                    }
                }
                
                function handleScroll() {
                    const outreachRect = outreachSection.getBoundingClientRect();
                    const spacerRect = scrollSpacer.getBoundingClientRect();
                    const vh = window.innerHeight;

                    handleMobileNav();
                    updateActiveNavLink();

                    const inSection = (outreachRect.top <= vh * 0.3) && (spacerRect.bottom > vh * 0.7);

                    if (inSection) {
                        if (!inOutreachSection) {
                            inOutreachSection = true;
                            requestAnimationFrame(() => requestAnimationFrame(() => updateActiveEvent(currentEventIndex, false)));
                        }

                        const spacerTop = spacerRect.top - vh * 0.35;
                        const spacerHeightRaw = spacerRect.height - vh * 0.5;
                        const spacerHeight = Math.max(spacerHeightRaw, 1);
                        const progress = Math.max(0, Math.min(1, -spacerTop / spacerHeight));

                        if (outreachHeader) {
                            if (progress > 0.9) {
                                const t = Math.min(1, (progress - 0.9) / 0.1);
                                outreachHeader.style.opacity = String(1 - t);
                                outreachHeader.style.transform = \`translateY(\${-20 * t}px)\`;
                            } else {
                                outreachHeader.style.opacity = '1';
                                outreachHeader.style.transform = 'translateY(0)';
                            }
                        }

                        // Calculate which event should be shown based on scroll progress
                        // But respect manual swipe overrides - don't fight the user!
                        // Event 1: 0-25%, Event 2: 25-70%, Event 3: 70-100%
                        let newIndex = progress < 0.25 ? 0 : (progress < 0.70 ? 1 : 2);

                        const now = Date.now();
                        
                        // Only update from scroll if:
                        // 1. Index actually changed
                        // 2. Not rate limited
                        if (newIndex !== currentEventIndex &&
                           (!isChangeRateLimited || (now - lastEventChangeTime) > changeCooldownMs)) {
                            currentEventIndex = newIndex;
                            updateActiveEvent(currentEventIndex, false);
                            isChangeRateLimited = true;
                            lastEventChangeTime = now;
                            setTimeout(() => { isChangeRateLimited = false; }, changeCooldownMs);
                        }

                    } else {
                        if (inOutreachSection) {
                            inOutreachSection = false;
                            requestAnimationFrame(() => {
                                body.classList.remove('event-1-active', 'event-2-active', 'event-3-active');
                            });
                        }
                        if (spacerRect.bottom <= vh * 0.7 && currentEventIndex !== totalEvents - 1) {
                            currentEventIndex = totalEvents - 1;
                            updateActiveEvent(currentEventIndex, true);
                        } else if (outreachRect.top > vh * 0.3 && currentEventIndex !== 0) {
                            currentEventIndex = 0;
                            updateActiveEvent(0, true);
                        }
                    }
                }
                
                function setAriaVisibility(index) {
                    eventSlides.forEach((slide, i) => {
                        slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
                        slide.inert = i !== index;
                    });
                }

                function updateDots(index) {
                    console.log('Updating dots for index:', index, 'Total dots:', dots.length);
                    if (!dots.length) {
                        console.warn('No dots found!');
                        return;
                    }
                    dots.forEach((dot, i) => {
                        if (i === index) {
                            dot.classList.add('active');
                            console.log('Dot', i, 'set to active (gold)');
                        } else {
                            dot.classList.remove('active');
                        }
                    });
                }

                function updateBodyBg(index, skip) {
                    if (skip) return;
                    body.classList.remove('event-1-active', 'event-2-active', 'event-3-active');
                    body.classList.add(\`event-\${index + 1}-active\`);
                }

                function updateActiveEvent(index, skipBackground) {
                    eventSlides.forEach(s => s.classList.remove('active'));
                    const active = eventSlides[index];
                    if (!active) return;
                    active.classList.add('active');
                    setAriaVisibility(index);
                    updateDots(index);
                    updateBodyBg(index, skipBackground);
                    
                    // Update dots overlaid on each event image to match active state
                    eventSlides.forEach((slide, slideIndex) => {
                        const overlaidDots = slide.querySelectorAll('.event-flyer-wrapper .event-dot');
                        overlaidDots.forEach((dot, dotIndex) => {
                            if (dotIndex === index) {
                                dot.classList.add('active');
                            } else {
                                dot.classList.remove('active');
                            }
                        });
                    });
                }

                updateActiveEvent(0, true);
                
                // Enhanced swipe navigation system for mobile
                // Horizontal swipes trigger instant scroll to next/previous event
                
                let touchStartX = 0;
                let touchStartY = 0;
                let touchCurrentX = 0;
                let touchCurrentY = 0;
                let isSwiping = false;
                const swipeThreshold = 40; // Reduced for faster response

                // Attach swipe listeners to entire outreach section for broader detection
                const swipeTarget = outreachSection || eventsContainer;
                if (swipeTarget) {
                    swipeTarget.addEventListener('touchstart', e => {
                        const t = e.changedTouches[0];
                        touchStartX = t.clientX;
                        touchStartY = t.clientY;
                        touchCurrentX = t.clientX;
                        touchCurrentY = t.clientY;
                        isSwiping = false;
                    }, { passive: true });

                    swipeTarget.addEventListener('touchmove', e => {
                        const t = e.changedTouches[0];
                        touchCurrentX = t.clientX;
                        touchCurrentY = t.clientY;
                        
                        const dx = Math.abs(touchCurrentX - touchStartX);
                        const dy = Math.abs(touchCurrentY - touchStartY);
                        
                        // Detect horizontal swipe (more horizontal than vertical, lower threshold)
                        if (dx > dy && dx > 20) {
                            isSwiping = true;
                        }
                    }, { passive: true });

                    swipeTarget.addEventListener('touchend', e => {
                        const dx = touchCurrentX - touchStartX;
                        const dy = touchCurrentY - touchStartY;
                        
                        // Check if this was a horizontal swipe
                        if (isSwiping && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > swipeThreshold) {
                            // Calculate target event based on swipe direction
                            let targetEventIndex = currentEventIndex;
                            let scrollOutOfSection = false;
                            
                            // Swipe left (dx < 0) = go to next event (scroll down)
                            if (dx < 0) {
                                if (currentEventIndex < totalEvents - 1) {
                                    targetEventIndex = currentEventIndex + 1;
                                } else {
                                    // Already at last event, scroll to Watch section
                                    scrollOutOfSection = true;
                                }
                            }
                            // Swipe right (dx > 0) = go to previous event (scroll up)
                            else if (dx > 0 && currentEventIndex > 0) {
                                targetEventIndex = currentEventIndex - 1;
                            }
                            
                            // Execute scroll action immediately
                            if (scrollOutOfSection) {
                                // Scroll past outreach section to Watch section
                                const watchSection = document.querySelector('#watch');
                                if (watchSection) {
                                    const watchTop = watchSection.getBoundingClientRect().top + window.pageYOffset;
                                    const navOffset = 30; // Mobile nav offset
                                    window.scrollTo({
                                        top: watchTop - navOffset,
                                        behavior: 'smooth'
                                    });
                                }
                            } else if (targetEventIndex !== currentEventIndex) {
                                // Scroll to target event position
                                const outreachTop = outreachSection.getBoundingClientRect().top + window.pageYOffset;
                                const spacerHeight = scrollSpacer.offsetHeight;
                                
                                // Calculate scroll position for target event
                                // Event 1: 12.5% (middle of 0-25%)
                                // Event 2: 47.5% (middle of 25-70%)
                                // Event 3: 85% (middle of 70-100%)
                                let targetProgress;
                                if (targetEventIndex === 0) {
                                    targetProgress = 0.125;
                                } else if (targetEventIndex === 1) {
                                    targetProgress = 0.475;
                                } else {
                                    targetProgress = 0.85;
                                }
                                
                                const targetScroll = outreachTop + (spacerHeight * targetProgress);
                                
                                window.scrollTo({
                                    top: targetScroll,
                                    behavior: 'smooth'
                                });
                            }
                        }
                        
                        isSwiping = false;
                    }, { passive: true });
                }
                
                // Dot click navigation - tap any dot to jump to that event
                dots.forEach((dot, index) => {
                    dot.addEventListener('click', () => {
                        if (currentEventIndex === index) return; // Already on this event
                        
                        currentEventIndex = index;
                        updateActiveEvent(currentEventIndex, false);
                        
                        // Set manual override to prevent scroll from interfering
                        manualSwipeOverride = true;
                        setTimeout(() => { manualSwipeOverride = false; }, 600);
                    });
                    
                    // Add touch feedback
                    dot.style.cursor = 'pointer';
                    dot.style.transition = 'transform 0.2s ease, background 0.3s ease';
                });
                
                let ticking = false;
                window.addEventListener('scroll', () => {
                    if (!ticking) {
                        ticking = true;
                        window.requestAnimationFrame(() => {
                            handleScroll();
                            ticking = false;
                        });
                    }
                }, { passive: true });
                
                // Initial check
                handleScroll();
                
                window.addEventListener('resize', () => {
                    handleMobileNav();
                    handleScroll();
                });
                
                // Smooth scrolling for navigation links with offset for sticky nav
                // Optimized offset to perfectly hide section pills behind nav
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        const targetId = this.getAttribute('href');
                        
                        // Special handling for HOME link - expand nav IMMEDIATELY, then scroll to top
                        if (targetId === '#home' || targetId === '#') {
                            // Force expand nav IMMEDIATELY on mobile and narrow windows (before scrolling)
                            if (window.innerWidth <= 1199) {
                                navShell.classList.remove('scrolled-mobile');
                            }
                            // Then scroll to absolute top
                            window.scrollTo({
                                top: 0,
                                behavior: 'smooth'
                            });
                            return;
                        }
                        
                        const target = document.querySelector(targetId);
                        if (target) {
                            // Default offset for most sections
                            let navOffset = 45; // Desktop - perfect balance
                            
                            // Special handling for outreach section (has sticky header + events)
                            if (targetId === '#outreach') {
                                // Always scroll to the very beginning of outreach section to show Event 1
                                const outreachRect = target.getBoundingClientRect();
                                const outreachAbsoluteTop = outreachRect.top + window.pageYOffset;
                                
                                if (window.innerWidth <= 1199) {
                                    // Mobile: Always scroll to show Event 1 (top of section)
                                    navOffset = -50; // Negative to show full header and start at Event 1
                                } else {
                                    // Desktop: Standard offset
                                    navOffset = 60;
                                }
                                
                                const targetPosition = outreachAbsoluteTop - navOffset;
                                window.scrollTo({
                                    top: targetPosition,
                                    behavior: 'smooth'
                                });
                                return;
                            }
                            
                            // Other sections - standard handling
                            if (window.innerWidth <= 1199) {
                                navOffset = 30; // Mobile/narrow - adjusted for smaller nav
                            }
                            
                            // Get absolute position: element's position relative to viewport + current scroll position
                            const elementRect = target.getBoundingClientRect();
                            const absoluteElementTop = elementRect.top + window.pageYOffset;
                            const targetPosition = absoluteElementTop - navOffset;
                            
                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
                            });
                        }
                    });
                });
                
                // Special handler for "See Flyer" button - scroll to show event 2
                const seeFlyerBtn = document.querySelector('.btn-see-flyer');
                if (seeFlyerBtn) {
                    seeFlyerBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        
                        // Calculate scroll position to show event 2 (middle event)
                        // Need to scroll into the middle of the scroll-spacer to trigger event 2
                        const outreachTop = outreachSection.getBoundingClientRect().top + window.pageYOffset;
                        const spacerHeight = scrollSpacer.offsetHeight;
                        
                        // Scroll to middle of spacer (50% progress = event 2)
                        // Add some extra offset to ensure we're solidly in event 2 territory
                        const targetScroll = outreachTop + (spacerHeight * 0.5);
                        
                        window.scrollTo({
                            top: targetScroll,
                            behavior: 'smooth'
                        });
                    });
                }
                
                // Explicit handler for Event 2 REQUEST ITEMS button
                // Ensures button works on desktop where events are in grid layout
                const requestItemsButtons = document.querySelectorAll('.event-slide[data-event="2"] .event-cta a[href="#contact"]');
                requestItemsButtons.forEach(button => {
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        const contactSection = document.querySelector('#contact');
                        if (contactSection) {
                            const navOffset = window.innerWidth <= 1199 ? 30 : 45;
                            const targetPosition = contactSection.getBoundingClientRect().top + window.pageYOffset - navOffset;
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
                const eventTitle = 'Christmas Gifts for Single Mothers & Widows';
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
                    if (!carousel || !carousel.parentElement) return;
                    
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

                // Gift Gallery Lightbox
                const giftImages = document.querySelectorAll('.gift-image');
                const giftLightbox = document.getElementById('gift-lightbox');
                const giftLightboxImage = document.getElementById('gift-lightbox-image');
                const giftLightboxClose = document.getElementById('gift-lightbox-close');
                const giftLightboxPrev = document.getElementById('gift-lightbox-prev');
                const giftLightboxNext = document.getElementById('gift-lightbox-next');
                
                let currentGiftIndex = 0;
                const giftImagesSrcs = Array.from(giftImages).map(img => img.src);
                
                // Open lightbox when clicking on gift image
                giftImages.forEach((img, index) => {
                    img.addEventListener('click', () => {
                        currentGiftIndex = index;
                        openGiftLightbox();
                    });
                });
                
                function openGiftLightbox() {
                    giftLightboxImage.src = giftImagesSrcs[currentGiftIndex];
                    giftLightbox.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
                
                function closeGiftLightbox() {
                    giftLightbox.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                function showPrevGift() {
                    currentGiftIndex = (currentGiftIndex - 1 + giftImagesSrcs.length) % giftImagesSrcs.length;
                    giftLightboxImage.src = giftImagesSrcs[currentGiftIndex];
                }
                
                function showNextGift() {
                    currentGiftIndex = (currentGiftIndex + 1) % giftImagesSrcs.length;
                    giftLightboxImage.src = giftImagesSrcs[currentGiftIndex];
                }
                
                // Event listeners
                if (giftLightboxClose) {
                    giftLightboxClose.addEventListener('click', closeGiftLightbox);
                }
                
                if (giftLightboxPrev) {
                    giftLightboxPrev.addEventListener('click', showPrevGift);
                }
                
                if (giftLightboxNext) {
                    giftLightboxNext.addEventListener('click', showNextGift);
                }
                
                // Close on background click
                if (giftLightbox) {
                    giftLightbox.addEventListener('click', (e) => {
                        if (e.target === giftLightbox) {
                            closeGiftLightbox();
                        }
                    });
                }
                
                // Keyboard navigation
                document.addEventListener('keydown', (e) => {
                    if (!giftLightbox.classList.contains('active')) return;
                    
                    if (e.key === 'Escape') {
                        closeGiftLightbox();
                    } else if (e.key === 'ArrowLeft') {
                        showPrevGift();
                    } else if (e.key === 'ArrowRight') {
                        showNextGift();
                    }
                });

                // Countdown Timer to Next Sunday 9:00 AM Mountain Time
                function updateCountdown() {
                    const now = new Date();
                    
                    // Convert to Mountain Time (UTC-7 MST or UTC-6 MDT)
                    // Using Intl API to handle DST automatically
                    const mtNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Denver' }));
                    
                    // Calculate next Sunday at 9:00 AM MT
                    let nextSunday = new Date(mtNow);
                    nextSunday.setHours(9, 0, 0, 0); // Set to 9:00 AM
                    
                    // Get current day (0 = Sunday, 6 = Saturday)
                    const currentDay = mtNow.getDay();
                    
                    if (currentDay === 0) {
                        // Today is Sunday
                        if (mtNow.getHours() >= 9) {
                            // Already past 9 AM, go to next Sunday
                            nextSunday.setDate(nextSunday.getDate() + 7);
                        }
                    } else {
                        // Not Sunday, calculate days until next Sunday
                        const daysUntilSunday = 7 - currentDay;
                        nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
                    }
                    
                    // Calculate time difference
                    const diff = nextSunday - mtNow;
                    
                    // Get elements
                    const liveStatus = document.querySelector('.live-status');
                    const liveStatusText = document.querySelector('.live-status-text');
                    const countdownContainer = document.querySelector('.countdown-container');
                    
                    // Check if we're within 1 hour (3600000 ms) of service start
                    const oneHour = 3600000; // 1 hour in milliseconds
                    
                    // Check if service is currently live (Sunday 9am-10am MT)
                    const isLiveNow = currentDay === 0 && mtNow.getHours() === 9;
                    
                    if (isLiveNow) {
                        // Service is LIVE NOW (9am-10am on Sunday) - show "Live Now", hide countdown
                        if (liveStatus) {
                            liveStatus.style.display = 'inline-flex';
                            if (liveStatusText) liveStatusText.textContent = 'Live Now';
                        }
                        if (countdownContainer) countdownContainer.style.display = 'none';
                        return;
                    } else if (diff <= 0) {
                        // Service ended or past 10am - hide everything
                        if (liveStatus) liveStatus.style.display = 'none';
                        if (countdownContainer) countdownContainer.style.display = 'none';
                        return;
                    } else if (diff <= oneHour && currentDay === 0) {
                        // Within 1 hour of service on Sunday - show "Live Soon" and countdown
                        if (liveStatus) {
                            liveStatus.style.display = 'inline-flex';
                            if (liveStatusText) liveStatusText.textContent = 'Live Soon';
                        }
                        if (countdownContainer) countdownContainer.style.display = 'flex';
                    } else {
                        // More than 1 hour away - hide "Live Soon", show countdown only
                        if (liveStatus) liveStatus.style.display = 'none';
                        if (countdownContainer) countdownContainer.style.display = 'flex';
                    }
                    
                    // Calculate time units
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    
                    // Update DOM
                    document.getElementById('days').textContent = days;
                    document.getElementById('hours').textContent = hours;
                    document.getElementById('minutes').textContent = minutes;
                    document.getElementById('seconds').textContent = seconds;
                }
                
                // Update countdown immediately and every second
                updateCountdown();
                setInterval(updateCountdown, 1000);
                
                // Auto-play video during Sunday service (9:00am - 9:45am MT)
                function checkAutoPlay() {
                    const mtNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Denver' }));
                    const currentDay = mtNow.getDay(); // 0 = Sunday
                    const currentHour = mtNow.getHours();
                    const currentMinutes = mtNow.getMinutes();
                    
                    // Check if it's Sunday between 9:00-9:45 MT
                    const isSundayServiceTime = currentDay === 0 && 
                                                currentHour === 9 && 
                                                currentMinutes >= 0 && 
                                                currentMinutes < 45;
                    
                    if (isSundayServiceTime) {
                        const youtubeEmbed = document.querySelector('.youtube-embed');
                        if (youtubeEmbed) {
                            const currentSrc = youtubeEmbed.getAttribute('src');
                            // Add autoplay and mute parameters for browser compatibility
                            // Chrome/Safari require mute=1 for autoplay to work
                            if (currentSrc && !currentSrc.includes('autoplay=1')) {
                                const newSrc = currentSrc + '&autoplay=1&mute=1';
                                youtubeEmbed.setAttribute('src', newSrc);
                            }
                        }
                    }
                }
                
                // Check autoplay when entering watch section
                const watchSection = document.querySelector('#watch');
                if (watchSection) {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                checkAutoPlay();
                            }
                        });
                    }, {
                        threshold: 0.3 // Trigger when 30% of watch section is visible
                    });
                    
                    observer.observe(watchSection);
                }
            });
        </script>
        
        <!-- Gift Gallery Lightbox -->
        <div class="gift-lightbox" id="gift-lightbox">
            <div class="gift-lightbox-close" id="gift-lightbox-close">×</div>
            <div class="gift-lightbox-arrow prev" id="gift-lightbox-prev">‹</div>
            <div class="gift-lightbox-content">
                <img src="" alt="Gift" class="gift-lightbox-image" id="gift-lightbox-image">
            </div>
            <div class="gift-lightbox-arrow next" id="gift-lightbox-next">›</div>
        </div>
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
