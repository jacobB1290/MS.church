export const homeStyles = (): string => `
            :root {
                color-scheme: light;
                /* Solid background color for seamless Safari iOS overscroll */
                --bg-color: #f8f9fd;
                --bg-default: #f8f9fd;
                --bg-stay-tuned: #f8f9fd;
                /* Event backgrounds - solid colors for seamless overscroll */
                --bg-event1: #f5e6d8; /* Muted warm terracotta */
                --bg-event2: #e8ead8; /* Muted olive/sage */
                --bg-event3: #f5d8d8; /* Pleasant muted red */
                --bg-event4: #e6e8f5; /* Soft blue-gray */
                --bg-event5: #f0e6f5; /* Soft lavender */
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            /* Safari iOS - solid background color for seamless overscroll in both directions */
            html {
                background-color: var(--bg-color);
                min-height: 100%;
                min-height: -webkit-fill-available;
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
                /* Solid background color for seamless Safari iOS overscroll */
                background-color: var(--bg-color);
                background: var(--bg-default);
                color: #1a1a2e;
                min-height: 100vh;
                min-height: -webkit-fill-available;
                line-height: 1.6;
                overflow-x: hidden;
                transition: background 1.8s cubic-bezier(0.4, 0, 0.2, 1);
                /* Safari iOS safe area insets for landscape mode and home indicator */
                padding-bottom: env(safe-area-inset-bottom, 0px);
            }

            /* Body background - static, no dynamic changes */
            body.stay-tuned-active { background: var(--bg-stay-tuned); }
            
            /* Modal open - prevent body scroll */
            body.modal-open {
                overflow: hidden;
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
                height: 320px;
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
                top: 16px;
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
                padding: 12px 20px;
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
                text-shadow: 0 8px 24px rgba(26, 26, 46, 0.15),
                             0 4px 8px rgba(26, 26, 46, 0.1);
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

            /* Hero CTA Buttons - Contact (white) and Watch (gold) */
            .btn-contact {
                background: rgba(255, 255, 255, 0.95) !important;
                color: #1a1a2e !important;
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1) !important;
                border: 1px solid rgba(255, 255, 255, 0.6) !important;
            }
            
            .btn-contact:hover {
                background: #fff !important;
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15) !important;
            }
            
            .btn-watch-gold {
                background: linear-gradient(135deg, #d4a574 0%, #c89860 100%) !important;
                color: #fff !important;
                box-shadow: 0 16px 40px rgba(200, 152, 96, 0.35) !important;
                border: none !important;
            }
            
            .btn-watch-gold:hover {
                box-shadow: 0 20px 50px rgba(200, 152, 96, 0.45) !important;
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
            
            /* Address Dropdown Menu */
            .address-dropdown-wrapper {
                position: relative;
                display: inline-block;
            }
            
            .address-trigger {
                cursor: pointer;
                color: inherit;
                text-decoration: underline;
                text-decoration-color: rgba(212, 165, 116, 0.5);
                text-underline-offset: 4px;
                transition: text-decoration-color 0.3s ease;
                background: none;
                border: none;
                font: inherit;
                padding: 0;
                letter-spacing: inherit;
                text-transform: inherit;
            }
            
            .address-trigger:hover {
                text-decoration-color: rgba(212, 165, 116, 0.8);
            }
            
            .address-dropdown {
                position: absolute;
                top: calc(100% + 8px);
                left: 50%;
                transform: translateX(-50%);
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 
                            0 2px 8px rgba(0, 0, 0, 0.1);
                padding: 8px;
                min-width: 200px;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transform: translateX(-50%) translateY(-8px);
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .address-dropdown.active {
                opacity: 1;
                visibility: visible;
                transform: translateX(-50%) translateY(0);
            }
            
            .address-dropdown-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.2s ease;
                text-decoration: none;
                color: #1a1a2e;
                font-size: 14px;
                font-weight: 500;
                letter-spacing: 0.5px;
                text-transform: none;
            }
            
            .address-dropdown-item:hover {
                background: rgba(212, 165, 116, 0.1);
            }
            
            .address-dropdown-icon {
                font-size: 18px;
                flex-shrink: 0;
            }
            
            /* Find Us Button - Long frosted glass pill at bottom of hero image */
            .find-us-wrapper {
                position: absolute;
                bottom: 16px;
                left: 16px;
                right: 16px;
                z-index: 100;
            }
            
            .find-us-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                padding: 8px 40px;
                background: rgb(255, 255, 255);
                background: rgba(255, 255, 255, 0.75);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.4);
                border-radius: 100px;
                font-size: 12px;
                font-weight: 500;
                letter-spacing: 2px;
                text-transform: uppercase;
                color: #1a1a2e;
                cursor: pointer;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 
                            0 4px 12px rgba(0, 0, 0, 0.05);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .find-us-btn:hover {
                background: rgba(255, 255, 255, 0.85);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12), 
                            0 6px 16px rgba(0, 0, 0, 0.06);
            }
            
            /* Find Us Dropdown - positioned above button */
            .find-us-wrapper .address-dropdown {
                bottom: calc(100% + 12px);
                top: auto;
                left: 50%;
                transform: translateX(-50%) translateY(8px);
            }
            
            .find-us-wrapper .address-dropdown.active {
                transform: translateX(-50%) translateY(0);
            }
            
            /* Fallback for older devices without backdrop-filter */
            @supports not (backdrop-filter: blur(1px)) {
                .find-us-btn {
                    background: rgb(255, 255, 255) !important;
                    border: 1px solid rgba(0, 0, 0, 0.08) !important;
                }
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

            /* ========================================
               OUTREACH SECTION - Simple Horizontal Carousel
               ======================================== */
            #outreach { overscroll-behavior: contain; }

            .outreach {
                display: flex;
                flex-direction: column;
                padding-bottom: 48px;
                align-items: flex-start;
            }

            .outreach .section-eyebrow {
                display: inline-flex !important;
                width: fit-content !important;
                max-width: fit-content !important;
                margin-bottom: 12px;
                position: relative;
                z-index: 5;
            }
            
            .outreach .section-heading {
                margin-bottom: 28px;
                text-align: left;
                position: relative;
                z-index: 5;
            }

            /* Stay Tuned container */
            .stay-tuned-container {
                margin-bottom: 0;
            }
            
            /* Desktop Stay Tuned - Two Card Layout */
            @media (min-width: 961px) {
                .stay-tuned-container {
                    display: flex !important;
                    flex-direction: row !important;
                    flex-wrap: nowrap !important;
                    gap: 24px;
                    justify-content: center;
                    align-items: stretch;
                    max-width: 900px;
                    margin: 0 auto;
                    width: 100%;
                }
                
                .stay-tuned-card,
                .past-events-card {
                    aspect-ratio: 3/4 !important;
                    width: 280px !important;
                    max-width: 280px !important;
                    min-width: 280px !important;
                    height: auto !important;
                    min-height: unset !important;
                    max-height: unset !important;
                    flex: 0 0 320px !important;
                    padding: 40px 32px !important;
                }
                
                .stay-tuned-card .stay-tuned-icon { font-size: 36px; margin-top: 0; }
                .stay-tuned-card .stay-tuned-title { font-size: 26px !important; }
                .stay-tuned-card .stay-tuned-text { font-size: 14px !important; line-height: 1.6; }
                .stay-tuned-card .stay-tuned-decoration { font-size: 20px; gap: 12px; }
                .stay-tuned-card .stay-tuned-badge { font-size: 10px !important; padding: 6px 12px !important; top: 14px; left: 14px; }
                .stay-tuned-card .btn-view-past-events { font-size: 13px !important; padding: 10px 20px !important; }
                
                .past-events-card {
                    background: rgba(255, 255, 255, 0.85);
                    display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
                    box-shadow: 0 32px 80px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.04);
                    border: 1px solid rgba(255,255,255,0.6);
                    backdrop-filter: blur(20px);
                    border-radius: 40px;
                    position: relative; overflow: visible;
                    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                }
                .past-events-card:hover { box-shadow: 0 40px 100px rgba(0,0,0,0.1), 0 16px 40px rgba(0,0,0,0.05); transform: translateY(-4px); }
                .stay-tuned-card { border-radius: 40px; }
                .past-events-card .past-card-badge { background: linear-gradient(135deg, #8b9dc3 0%, #7189b0 100%); box-shadow: 0 4px 16px rgba(113,137,176,0.35); position: absolute; top: 14px; left: 14px; color: white; font-size: 10px; font-weight: 700; padding: 6px 12px; border-radius: 20px; letter-spacing: 0.5px; }
                .past-events-card .past-card-icon { font-size: 36px; margin-bottom: 8px; }
                .past-events-card .past-card-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; margin: 0 0 8px 0; color: #1a1a2e; }
                .past-events-card .past-card-text { font-size: 14px; color: rgba(26,26,46,0.7); line-height: 1.6; margin-bottom: 14px; }
                .past-events-card .past-card-btn { display: inline-block; padding: 10px 20px; background: transparent; border: 2px solid #d4a574; color: #d4a574; border-radius: 30px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
                .past-events-card .past-card-btn:hover { background: #d4a574; color: white; }
                
                .outreach.stay-tuned-only { min-height: auto !important; padding-bottom: 60px !important; }
            }

            /* ========================================
               CAROUSEL - Smooth Gliding Track Animation
               ======================================== */
            .carousel-wrapper {
                position: relative;
                width: 100%;
            }

            /* Viewport: clip-path gives generous room for shadows on ALL sides */
            .carousel-viewport {
                position: relative;
                overflow: visible;
                clip-path: inset(-80px -40px -80px -40px);
            }

            /* Soft fog on left/right edges — ONLY covers card area, never header */
            .carousel-wrapper::before,
            .carousel-wrapper::after {
                content: '';
                position: absolute;
                top: 0;
                bottom: 0;
                width: 60px;
                z-index: 3;
                pointer-events: none;
            }
            .carousel-wrapper::before {
                left: -40px;
                background: linear-gradient(to right, 
                    var(--bg-color, #f8f9fd) 0%, 
                    rgba(248, 249, 253, 0) 100%);
            }
            .carousel-wrapper::after {
                right: -40px;
                background: linear-gradient(to left, 
                    var(--bg-color, #f8f9fd) 0%, 
                    rgba(248, 249, 253, 0) 100%);
            }

            /* The track is a flex row of ALL cards; translateX slides it */
            .carousel-track {
                display: flex;
                transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                will-change: transform;
            }

            /* Each card slot */
            .carousel-card {
                flex-shrink: 0;
                box-sizing: border-box;
            }

            /* Mobile: one card at a time */
            @media (max-width: 960px) {
                .carousel-card {
                    /* width set dynamically by JS */
                    padding: 0 16px;
                }
                .carousel-viewport {
                    clip-path: inset(-60px 0 -60px 0);
                }
                .carousel-wrapper {
                    overflow-x: clip;
                }
                .carousel-wrapper::before,
                .carousel-wrapper::after {
                    width: 24px;
                    left: 0;
                }
                .carousel-wrapper::before {
                    left: 0;
                }
                .carousel-wrapper::after {
                    right: 0;
                    left: auto;
                }
            }

            /* Desktop: 3 cards in a row */
            @media (min-width: 961px) {
                .carousel-card {
                    /* width set dynamically by JS */
                    padding: 0 10px;
                }
            }

            /* Navigation: dots below, arrows float on card edges */
            .carousel-nav {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                margin-top: 24px;
            }

            /* Arrows: frosted glass floating on card sides */
            .carousel-arrow {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                z-index: 10;
                width: 34px;
                height: 34px;
                border-radius: 10px;
                background: rgba(255, 255, 255, 0.55);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 16px;
                color: #1a1a2e;
            }

            .carousel-arrow.prev {
                left: 24px;
            }

            .carousel-arrow.next {
                right: 24px;
            }

            .carousel-arrow:hover {
                background: rgba(255, 255, 255, 0.85);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                transform: translateY(-50%) scale(1.08);
            }

            .carousel-arrow.hidden {
                opacity: 0;
                pointer-events: none;
            }

            @media (min-width: 961px) {
                .carousel-arrow {
                    width: 40px;
                    height: 40px;
                    font-size: 20px;
                    border-radius: 12px;
                }
                .carousel-arrow.prev {
                    left: 24px;
                }
                .carousel-arrow.next {
                    right: 24px;
                }
            }

            /* Dots — gold theme */
            .carousel-dots {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .carousel-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #d4a574;
                opacity: 0.3;
                border: none;
                cursor: pointer;
                transition: all 0.35s ease;
                padding: 0;
            }

            .carousel-dot.active {
                opacity: 1;
                width: 10px;
                height: 10px;
                box-shadow: 0 0 10px rgba(212, 165, 116, 0.6);
            }

            /* ========================================
               EVENT CARDS - Full-bleed Image with Glow
               Mobile: image IS the card, CTA overlaid with frosted glass
               Desktop: image card with separate CTA below
               ======================================== */
            .event-card {
                position: relative;
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                box-sizing: border-box;
            }

            .event-flyer-wrapper {
                position: relative;
                width: 100%;
                aspect-ratio: 3/4;
                border-radius: 20px;
                overflow: hidden; /* crops image to rounded corners only — box-shadow is outside */
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                transition: box-shadow 0.4s ease, transform 0.4s ease;
            }
            
            /* Mobile: proper 3:4 card sizing */
            @media (max-width: 960px) {
                .event-flyer-wrapper {
                    border-radius: 18px;
                }
            }
            
            .event-flyer-wrapper:hover {
                transform: translateY(-3px);
            }
            
            /* Dominant color glow effect */
            .event-flyer-wrapper.glow-warm {
                box-shadow: 0 8px 40px rgba(212, 165, 116, 0.35), 0 4px 16px rgba(200, 152, 96, 0.2);
            }
            .event-flyer-wrapper.glow-red {
                box-shadow: 0 8px 40px rgba(200, 60, 60, 0.3), 0 4px 16px rgba(180, 40, 40, 0.18);
            }
            .event-flyer-wrapper.glow-blue {
                box-shadow: 0 8px 40px rgba(60, 120, 200, 0.3), 0 4px 16px rgba(40, 100, 180, 0.18);
            }
            .event-flyer-wrapper.glow-green {
                box-shadow: 0 8px 40px rgba(60, 180, 100, 0.3), 0 4px 16px rgba(40, 150, 80, 0.18);
            }
            .event-flyer-wrapper.glow-purple {
                box-shadow: 0 8px 40px rgba(140, 80, 200, 0.3), 0 4px 16px rgba(120, 60, 180, 0.18);
            }
            .event-flyer-wrapper.glow-dark {
                box-shadow: 0 8px 40px rgba(40, 40, 60, 0.35), 0 4px 16px rgba(20, 20, 40, 0.2);
            }

            .flyer-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: center;
                display: block;
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
            }

            /* Date pill overlaid on image */
            .event-date {
                position: absolute;
                top: 12px;
                left: 12px;
                z-index: 5;
                padding: 6px 14px;
                background: linear-gradient(135deg, #d4a574 0%, #c89860 100%);
                border-radius: 100px;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 1.5px;
                color: #ffffff;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
                text-transform: uppercase;
                white-space: nowrap;
            }

            /* === CTA Button === */
            /* Mobile: Frosted glass overlay on bottom of image */
            .event-cta {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 5;
                padding: 14px 16px;
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border-top: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            .event-cta.hidden {
                display: none;
            }

            .event-cta .btn {
                width: 100%;
                padding: 12px 24px;
                font-size: 13px;
                font-weight: 700;
                border-radius: 14px;
                background: rgba(255, 255, 255, 0.85);
                color: #1a1a2e;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                cursor: pointer;
                display: block;
                text-align: center;
                text-decoration: none;
                letter-spacing: 0.5px;
            }

            .event-cta .btn:hover {
                background: #fff;
                box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
                transform: translateY(-1px);
            }

            /* Desktop: CTA below the card, not overlaid */
            @media (min-width: 961px) {
                .event-cta {
                    position: relative;
                    bottom: auto;
                    left: auto;
                    right: auto;
                    padding: 0;
                    background: none;
                    backdrop-filter: none;
                    -webkit-backdrop-filter: none;
                    border-top: none;
                    margin-top: 14px;
                }
                .event-cta .btn {
                    padding: 14px 32px;
                    font-size: 14px;
                    border-radius: 18px;
                    background: linear-gradient(135deg, #d4a574 0%, #c89860 100%);
                    color: white;
                    box-shadow: 0 6px 20px rgba(200, 152, 96, 0.35);
                }
                .event-cta .btn:hover {
                    background: linear-gradient(135deg, #c89860 0%, #b88a52 100%);
                    box-shadow: 0 10px 28px rgba(200, 152, 96, 0.45);
                    transform: translateY(-2px);
                }
            }
            
            /* See Past Events card in carousel */
            .carousel-past-card {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                width: 100%;
                aspect-ratio: 3/4;
                background: rgba(255, 255, 255, 0.85);
                border: 1px solid rgba(255,255,255,0.6);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                position: relative;
                cursor: pointer;
                transition: all 0.4s ease;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
                padding: 24px 16px;
            }
            .carousel-past-card:hover {
                box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
                transform: translateY(-4px);
            }
            @media (max-width: 960px) {
                .carousel-past-card {
                    border-radius: 18px;
                }
            }
            .carousel-past-card .past-card-badge {
                position: absolute; top: 12px; left: 12px;
                background: linear-gradient(135deg, #8b9dc3, #7189b0);
                color: white; font-size: 9px; font-weight: 700;
                padding: 5px 10px; border-radius: 20px;
                letter-spacing: 0.5px;
                box-shadow: 0 4px 12px rgba(113,137,176,0.3);
            }
            .carousel-past-card .past-card-icon { font-size: 40px; margin-bottom: 10px; }
            .carousel-past-card .past-card-title {
                font-family: 'Playfair Display', serif;
                font-size: 20px; font-weight: 700; margin: 0 0 8px 0; color: #1a1a2e;
            }
            .carousel-past-card .past-card-text {
                font-size: 12px; color: rgba(26,26,46,0.6);
                line-height: 1.5; margin-bottom: 14px; max-width: 200px;
            }
            .carousel-past-card .past-card-btn {
                display: inline-block; padding: 10px 20px;
                background: transparent; border: 2px solid #d4a574;
                color: #d4a574; border-radius: 30px;
                font-size: 12px; font-weight: 600;
                cursor: pointer; transition: all 0.3s ease;
            }
            .carousel-past-card .past-card-btn:hover { background: #d4a574; color: white; }

            /* Desktop: bigger cards & stronger glow */
            @media (min-width: 961px) {
                .event-flyer-wrapper {
                    border-radius: 24px;
                }
                .event-date {
                    top: 16px;
                    left: 16px;
                    padding: 8px 18px;
                    font-size: 11px;
                }
                .carousel-past-card {
                    border-radius: 24px;
                    padding: 32px 24px;
                }
                .carousel-past-card .past-card-icon { font-size: 48px; }
                .carousel-past-card .past-card-title { font-size: 24px; }
                .carousel-past-card .past-card-text { font-size: 14px; max-width: 240px; }
                .carousel-past-card .past-card-btn { padding: 12px 24px; font-size: 13px; }
                
                /* Stronger glow on desktop */
                .event-flyer-wrapper.glow-warm {
                    box-shadow: 0 12px 48px rgba(212, 165, 116, 0.4), 0 6px 20px rgba(200, 152, 96, 0.25);
                }
                .event-flyer-wrapper.glow-red {
                    box-shadow: 0 12px 48px rgba(200, 60, 60, 0.35), 0 6px 20px rgba(180, 40, 40, 0.2);
                }
                .event-flyer-wrapper.glow-blue {
                    box-shadow: 0 12px 48px rgba(60, 120, 200, 0.35), 0 6px 20px rgba(40, 100, 180, 0.2);
                }
                .event-flyer-wrapper.glow-green {
                    box-shadow: 0 12px 48px rgba(60, 180, 100, 0.35), 0 6px 20px rgba(40, 150, 80, 0.2);
                }
                .event-flyer-wrapper.glow-purple {
                    box-shadow: 0 12px 48px rgba(140, 80, 200, 0.35), 0 6px 20px rgba(120, 60, 180, 0.2);
                }
                .event-flyer-wrapper.glow-dark {
                    box-shadow: 0 12px 48px rgba(40, 40, 60, 0.4), 0 6px 20px rgba(20, 20, 40, 0.25);
                }
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
               STAY TUNED CARD - Future Events Placeholder
               Uses site colors (gold/warm tones matching the church brand)
               ======================================== */
            /* Stay Tuned Container - sits outside scroll container, same width as section-card */
            .stay-tuned-container {
                width: 100%;
                position: relative; /* Required for gradient edge-fade pseudo-elements */
            }
            
            .stay-tuned-card {
                background: rgba(255, 255, 255, 0.85); /* Match section-card */
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 56px 64px; /* Match section-card */
                box-shadow: 0 32px 80px rgba(0, 0, 0, 0.08), 
                            0 12px 32px rgba(0, 0, 0, 0.04); /* Match section-card */
                border: 1px solid rgba(255, 255, 255, 0.6); /* Match section-card */
                backdrop-filter: blur(20px); /* Match section-card */
                min-height: auto;
                border-radius: 24px; /* Match card styling */
                position: relative;
                overflow: visible;
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); /* Match section-card */
                aspect-ratio: 3/4; /* Portrait card - mobile */
                width: 100%; /* Mobile: full width */
            }
            
            /* DESKTOP OVERRIDE - Two cards side by side with 3:4 portrait ratio */
            @media (min-width: 961px) {
                .stay-tuned-container {
                    display: flex !important;
                    flex-direction: row !important;
                    flex-wrap: nowrap !important;
                    gap: 32px !important;
                    justify-content: center !important;
                    align-items: flex-start !important;
                    max-width: 620px !important;
                    margin: 0 auto !important;
                    width: 100% !important;
                }
                
                .stay-tuned-container > .stay-tuned-card,
                .stay-tuned-container > .past-events-card {
                    aspect-ratio: 3/4 !important;
                    width: 260px !important;
                    max-width: 260px !important;
                    min-width: 260px !important;
                    flex: 0 0 260px !important;
                    height: auto !important;
                    min-height: unset !important;
                    max-height: unset !important;
                    padding: 28px 20px !important;
                    border-radius: 32px !important;
                }
            }
            
            .stay-tuned-card:hover {
                box-shadow: 0 40px 100px rgba(0, 0, 0, 0.1), 
                            0 16px 40px rgba(0, 0, 0, 0.05);
                transform: translateY(-4px);
            }
            
            /* ========================================
               STAY TUNED ONLY MODE
               When no upcoming events - clean static layout
               Card is now rendered in stay-tuned-container (outside scroll container)
               ======================================== */
            .stay-tuned-only {
                /* Remove excessive gap between sections */
                margin-bottom: 0 !important;
                min-height: auto !important; /* Remove 100vh min-height */
            }
            
            .stay-tuned-only .section-heading {
                margin-bottom: 24px; /* Spacing before card */
            }
            
            .stay-tuned-only .section-eyebrow {
                display: inline-flex !important; /* Ensure pill fits text only */
                width: fit-content !important;
                max-width: fit-content !important;
            }
            
            .stay-tuned-only .stay-tuned-container {
                margin-bottom: 0;
            }
            
            .stay-tuned-badge {
                background: linear-gradient(135deg, #d4a574 0%, #c89860 100%) !important;
                box-shadow: 0 4px 16px rgba(212, 165, 116, 0.35) !important;
                position: absolute;
                top: 16px;
                left: 16px;
            }
            
            .stay-tuned-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 12px;
                width: 100%;
                padding: 10px 0;
                overflow: visible;
            }
            
            .stay-tuned-icon {
                font-size: 48px;
                animation: sparkle 2.5s ease-in-out infinite;
                line-height: 1;
                margin-top: 10px;
            }
            
            @keyframes sparkle {
                0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
                50% { transform: scale(1.08) rotate(3deg); opacity: 0.9; }
            }
            
            .stay-tuned-title {
                font-family: 'Playfair Display', serif;
                font-size: clamp(26px, 5vw, 36px);
                font-weight: 700;
                margin: 0;
                color: #1a1a2e;
            }
            
            .stay-tuned-text {
                font-size: clamp(13px, 3.5vw, 15px);
                color: rgba(26, 26, 46, 0.65);
                line-height: 1.6;
                margin: 0;
                max-width: 240px;
            }
            
            .stay-tuned-decoration {
                display: flex;
                gap: 16px;
                font-size: 22px;
                margin-top: 8px;
            }
            
            .stay-tuned-decoration span {
                animation: float 3s ease-in-out infinite;
            }
            
            .stay-tuned-decoration span:nth-child(2) {
                animation-delay: 0.4s;
            }
            
            .stay-tuned-decoration span:nth-child(3) {
                animation-delay: 0.8s;
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
            
            /* View Past Events Button - subtle, not too prominent */
            .btn-view-past-events {
                margin-top: 16px;
                padding: 10px 20px;
                background: transparent;
                border: 1.5px solid rgba(26, 26, 46, 0.2);
                border-radius: 100px;
                font-size: 10px;
                font-weight: 600;
                letter-spacing: 1.2px;
                text-transform: uppercase;
                color: rgba(26, 26, 46, 0.55);
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                flex-shrink: 0;
            }
            
            .btn-view-past-events:hover {
                background: rgba(26, 26, 46, 0.05);
                border-color: rgba(26, 26, 46, 0.3);
                color: rgba(26, 26, 46, 0.75);
                transform: translateY(-1px);
            }
            
            /* Hide button if no past events */
            .btn-view-past-events.hidden {
                display: none;
            }

            /* ========================================
               PAST EVENTS MODAL - Overlay Carousel
               Appears above all content (z-index 10000)
               ======================================== */
            .past-events-modal {
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
                opacity: 0;
                transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                padding: 20px;
            }
            
            .past-events-modal.active {
                display: flex;
                opacity: 1;
            }
            
            .past-events-modal-content {
                position: relative;
                width: 100%;
                max-width: 480px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .past-events-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                margin-bottom: 24px;
                padding: 0 8px;
            }
            
            .past-events-modal-title {
                font-family: 'Playfair Display', serif;
                font-size: clamp(22px, 5vw, 28px);
                font-weight: 600;
                color: #ffffff;
                margin: 0;
            }
            
            .past-events-modal-close {
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 22px;
                color: rgba(255, 255, 255, 0.8);
                transition: all 0.3s ease;
            }
            
            .past-events-modal-close:hover {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                transform: scale(1.05);
            }
            
            /* Past Events Carousel */
            .past-events-carousel {
                position: relative;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .past-events-slides {
                position: relative;
                width: 100%;
                max-width: 380px;
                aspect-ratio: 3/4;
                overflow: hidden;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            }
            
            .past-event-slide {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .past-event-slide.active {
                opacity: 1;
                transform: translateX(0);
            }
            
            .past-event-slide.prev {
                transform: translateX(-100%);
                opacity: 0;
            }
            
            .past-event-slide img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 20px;
            }
            
            .past-event-slide-info {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 20px;
                background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 60%, transparent 100%);
                border-radius: 0 0 20px 20px;
            }
            
            .past-event-slide-date {
                display: inline-block;
                padding: 5px 12px;
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(8px);
                border-radius: 100px;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 1.5px;
                color: rgba(255, 255, 255, 0.9);
                text-transform: uppercase;
                margin-bottom: 8px;
            }
            
            .past-event-slide-title {
                font-family: 'Playfair Display', serif;
                font-size: 16px;
                font-weight: 600;
                color: #ffffff;
                margin: 0;
                line-height: 1.4;
            }
            
            /* Carousel Navigation Arrows */
            .past-events-nav {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 44px;
                height: 44px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 22px;
                color: rgba(255, 255, 255, 0.8);
                transition: all 0.3s ease;
                z-index: 10;
            }
            
            .past-events-nav:hover {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                transform: translateY(-50%) scale(1.08);
            }
            
            .past-events-nav.prev { left: -56px; }
            .past-events-nav.next { right: -56px; }
            
            /* Carousel Dots */
            .past-events-dots {
                display: flex;
                gap: 12px;
                justify-content: center;
                margin-top: 24px;
            }
            
            .past-events-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.25);
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .past-events-dot.active {
                background: #d4a574;
                transform: scale(1.3);
                box-shadow: 0 0 10px rgba(212, 165, 116, 0.5);
            }
            
            .past-events-dot:hover:not(.active) {
                background: rgba(255, 255, 255, 0.45);
            }
            
            /* Mobile adjustments for modal */
            @media (max-width: 520px) {
                .past-events-modal { padding: 16px; }
                .past-events-modal-content { max-width: 100%; }
                .past-events-slides { max-width: 100%; }
                
                .past-events-nav.prev { left: 8px; }
                .past-events-nav.next { right: 8px; }
                
                .past-events-nav {
                    width: 36px;
                    height: 36px;
                    font-size: 18px;
                    background: rgba(0, 0, 0, 0.6);
                }
            }
            
            /* Empty state when no past events */
            .past-events-empty {
                text-align: center;
                padding: 40px 20px;
                color: rgba(255, 255, 255, 0.7);
            }
            
            .past-events-empty-icon {
                font-size: 48px;
                margin-bottom: 16px;
                opacity: 0.6;
            }
            
            .past-events-empty-text {
                font-size: 16px;
                line-height: 1.6;
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
                text-align: left; /* Left aligned on desktop like other sections */
                max-width: 800px;
                margin: 0;
                padding: 0 5%;
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
                overflow: visible;
                position: relative;
            }
            
            /* 
             * Jotform logo cover - sits below the form, hugs the rounded corners
             * Uses box-shadow trick to create inverted rounded corners
             */
            .jotform-container::before {
                content: '';
                position: absolute;
                bottom: 70px; /* Higher up - right at bottom of form card */
                left: 50%;
                transform: translateX(-50%);
                width: calc(100% - 40px); /* Match form card width */
                height: 24px;
                background: transparent;
                border-radius: 0 0 24px 24px; /* Round bottom corners */
                box-shadow: 0 80px 0 0 #f8f9fd; /* Taller shadow to cover more */
                pointer-events: none;
                z-index: 10;
            }
            
            /* Solid cover for the Jotform branding area - extends full width */
            .jotform-container::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 70px; /* Taller to meet the ::before */
                background: #f8f9fd;
                pointer-events: none;
                z-index: 9;
            }
            
            .jotform-container iframe {
                width: 100%;
                border: none;
                min-height: 800px;
            }
            
            /* Prevent zoom on form inputs - Mobile Safari Fix */
            input, select, textarea, button {
                font-size: 16px !important;
            }
            
            /* Ensure JotForm inputs don't trigger zoom */
            .jotform-container input,
            .jotform-container select,
            .jotform-container textarea,
            .jotform-container button {
                font-size: 16px !important;
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
               TABLET/MOBILE NOTES
               Mobile stacked card layout applies for ≤899px
               Desktop layout starts at 900px+
               (Tablet-specific overrides removed to restore 
               original working mobile behavior)
               ======================================== */
            
            /* ========================================
               MOBILE STYLES (≤899px)
               Stacked card layout with scroll behavior
               This matches the original working version from GitHub
               ======================================== */
            @media (max-width: 899px) {
                /* Phone nav-spacer */
                .nav-spacer {
                    height: 190px;
                }
                
                /* Mobile Hero Section - Grid vertical layout */
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
                }
                
                .hero-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                
                /* Outreach Section - Mobile */
                .outreach {
                    width: 100%;
                    max-width: 100%;
                    padding-bottom: 40px;
                    overflow-x: clip; /* prevent horizontal scroll from carousel cards */
                    overflow-y: visible;
                }

                /* Stay-tuned mode has no carousel, so horizontal overflow is safe to open.
                   This lets the card's box-shadow render past the section boundary
                   where it's then faded out by the gradient pseudo-elements below. */
                .outreach.stay-tuned-only {
                    overflow: visible;
                }

                /* Gradient side fades — same technique as carousel edge fogs.
                   Smoothly dissolves the card's side shadow into the page background
                   instead of a hard clip line at the viewport margin. */
                .stay-tuned-container::before,
                .stay-tuned-container::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 20px;
                    z-index: 2;
                    pointer-events: none;
                }
                .stay-tuned-container::before {
                    left: -12px;
                    background: linear-gradient(to right,
                        #f8f9fd 0%,
                        rgba(248, 249, 253, 0) 100%);
                }
                .stay-tuned-container::after {
                    right: -12px;
                    background: linear-gradient(to left,
                        #f8f9fd 0%,
                        rgba(248, 249, 253, 0) 100%);
                }
                
                .outreach .section-eyebrow {
                    display: inline-flex !important;
                    width: fit-content !important;
                    max-width: fit-content !important;
                    text-align: left;
                }
                
                .outreach .section-heading {
                    text-align: left;
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


            }

            @media (max-width: 899px) {
                /* NAV - Centered layout matching mobile design */
                .nav-shell {
                    flex-wrap: wrap;
                    justify-content: center;  /* Center all nav content */
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
                    justify-content: center;  /* Center nav links */
                    flex-wrap: nowrap; /* Prevent wrapping */
                    gap: clamp(8px, 3vw, 18px); /* Responsive gap */
                    order: 1;  /* Nav links first */
                }
                
                .nav-shell.scrolled-mobile nav ul {
                    gap: clamp(8px, 3vw, 16px);
                }

                .brand {
                    align-items: center;
                    width: 100%;
                    text-align: center;
                    order: 0;  /* Brand at top */
                }

                .nav-cta {
                    width: 100%;
                    padding: 10px 24px;
                    font-size: 10px;
                    text-align: center;
                    order: 2;  /* CTA button last */
                }
                
                /* Contact button - shift right when compressed */
                .nav-shell.scrolled-mobile .nav-cta {
                    width: auto;
                    margin-left: auto;
                    padding: 8px 20px;
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
                    font-size: clamp(8px, 2.5vw, 10px);
                    letter-spacing: clamp(1px, 0.4vw, 2px);
                    white-space: nowrap;
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

            @media (max-width: 899px) {
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

                /* Mobile/Tablet Event Cards - Centered layout */


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
                
                /* Active state for Contact button */
                .nav-form-btn.active {
                    font-weight: 900;
                    background: linear-gradient(135deg, #d4a574 0%, #c89860 100%);
                    color: #ffffff;
                    box-shadow: 0 8px 24px rgba(212, 165, 116, 0.4),
                                0 4px 12px rgba(212, 165, 116, 0.2);
                }
                

                
                /* Mobile Stay Tuned Card styling */
                .stay-tuned-card {
                    padding: 40px 24px;
                    border-radius: 32px;
                }
                
                .stay-tuned-content {
                    gap: 10px;
                    padding: 5px 0;
                }
                
                .stay-tuned-icon {
                    font-size: 40px;
                    margin-top: 5px;
                }
                
                .stay-tuned-title {
                    font-size: clamp(24px, 6vw, 32px);
                }
                
                .stay-tuned-text {
                    font-size: clamp(13px, 3.2vw, 15px);
                    max-width: 220px;
                    line-height: 1.5;
                }
                
                .stay-tuned-decoration {
                    font-size: 20px;
                    gap: 12px;
                    margin-top: 6px;
                }
                
                .btn-view-past-events {
                    margin-top: 12px;
                    padding: 8px 16px;
                    font-size: 9px;
                }
                
                /* Mobile stay-tuned overrides */
                .stay-tuned-only {
                    min-height: auto !important;
                    padding-bottom: 20px !important;
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
                    gap: clamp(6px, 2.5vw, 14px);
                    flex-wrap: nowrap;
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
                    gap: clamp(6px, 2.5vw, 12px);
                    flex-wrap: nowrap;
                    justify-content: center;
                }

                nav a {
                    font-size: clamp(8px, 2.2vw, 10px);
                    letter-spacing: clamp(0.8px, 0.3vw, 1.5px);
                    white-space: nowrap;
                }
                
                .nav-shell.scrolled-mobile nav a {
                    font-size: clamp(8px, 2.2vw, 10px);
                    letter-spacing: clamp(0.8px, 0.3vw, 1.5px);
                }

                .nav-cta {
                    padding: clamp(6px, 2vw, 8px) clamp(12px, 3.5vw, 16px);
                    font-size: clamp(8px, 2.2vw, 9px);
                    letter-spacing: clamp(1px, 0.3vw, 1.5px);
                }

                main {
                    gap: 100px;
                    margin-bottom: 20px; /* Reduced from 80px - contact section sits closer to footer */
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
                    width: 100%;
                    margin: 0;
                    padding: 0;
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
                
                /* Find Us Button - Smaller padding on mobile */
                .find-us-wrapper {
                    bottom: 12px;
                    left: 12px;
                    right: 12px;
                }
                
                .find-us-btn {
                    padding: 7px 28px;
                    font-size: 11px;
                    font-weight: 500;
                }
                
                .service-info-buttons {
                    width: 100%;
                    margin: 0;
                    padding: 0;
                }
                
                .hero-body .cta-group {
                    margin: 4px 0 0 0 !important;
                    padding: 0 !important;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    align-items: stretch;
                    justify-content: center;
                    width: 100%;
                }
                
                .hero-body .cta-group .btn {
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 16px 32px !important;
                    box-sizing: border-box;
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
                    align-items: stretch;
                }

                .btn {
                    width: 100% !important;
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
                
                /* Outreach section spacing */
                .outreach .section-heading {
                    margin-bottom: 24px;
                }
                
                .outreach .section-eyebrow {
                    display: inline-flex !important;
                    width: fit-content !important;
                    max-width: fit-content !important;
                    margin-bottom: 10px;
                }
                
                .outreach-scroll-container,
                .sticky-wrapper,
                .scroll-spacer,
                .events-container {
                    /* Legacy classes no longer used */
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
                
                .contact-header {
                    text-align: left !important;
                    padding: 0 5%;
                    margin-left: 0;
                    margin-right: auto;
                }
                
                .contact-header .section-eyebrow {
                    text-align: left !important;
                    margin-left: 0 !important;
                    margin-right: auto;
                }
                
                .contact-header .section-heading,
                .contact-header .section-lead {
                    text-align: left !important;
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
                
                /* Find Us Button - Smaller on small phones */
                .find-us-wrapper {
                    bottom: 10px;
                    left: 10px;
                    right: 10px;
                }
                
                .find-us-btn {
                    padding: 6px 20px;
                    font-size: 10px;
                    font-weight: 500;
                    letter-spacing: 1.5px;
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
                
                .jotform-container::before {
                    bottom: 85px; /* Higher up on mobile */
                    width: calc(100% - 28px); /* Match mobile form card width */
                    height: 20px;
                    border-radius: 0 0 20px 20px;
                    box-shadow: 0 95px 0 0 #f8f9fd; /* Taller shadow */
                }
                
                .jotform-container::after {
                    height: 85px; /* Taller to meet the ::before */
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
               DESKTOP STYLES (≥961px)
               Two-column layout for desktop screens
               Mobile styles (≤960px) are completely isolated
               This matches JavaScript isMobile threshold (window.innerWidth <= 960)
               ======================================== */
            @media (min-width: 961px) {
                /* Desktop two-column layout for screens 961px and wider */
                /* Scales responsively from small desktop to full desktop screens */
                .page {
                    max-width: 1400px;
                }
                
                /* Desktop Navigation Spacer - CRITICAL: Override base 320px */
                .nav-spacer {
                    height: 100px;  /* Natural spacing for desktop - nav moved up */
                }
                
                main {
                    gap: 120px;
                    margin-bottom: 120px;
                }
                
                /* Desktop Hero Section - TWO COLUMN GRID WITH CENTERED TEXT */
                .hero {
                    display: flex;
                    flex-direction: column;
                    gap: clamp(8px, 1vw, 12px);
                    padding: clamp(10px, 1.5vw, 15px) 0 clamp(50px, 6vw, 70px);
                    max-width: 100%;
                    margin: 0;
                    min-height: auto;
                    overflow: visible;
                }
                
                .hero h1 {
                    max-width: clamp(1100px, 90vw, 1300px);
                    margin: 0 auto;
                    width: 100%;
                    padding: 0 clamp(16px, 3vw, 32px);
                    overflow: visible;
                }
                
                .hero-body {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: 1fr;
                    grid-template-areas: 
                        "content image";
                    max-width: clamp(1100px, 90vw, 1300px);
                    margin: 0 auto;
                    column-gap: clamp(40px, 5vw, 70px);
                    row-gap: 0;
                    align-items: center;
                    width: 100%;
                }
                
                .hero-content {
                    grid-area: content;
                    max-width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: clamp(16px, 2vw, 24px);
                    text-align: center;  /* Center all text */
                    align-items: center;  /* Center child elements */
                }
                
                .hero-image {
                    grid-area: image;
                    align-self: stretch;
                }
                
                /* Hero address styling */
                .hero-address {
                    font-style: normal;
                    font-size: 16px;
                    color: rgba(26, 26, 46, 0.6);
                    font-weight: 500;
                    margin-top: 8px;
                }
                
                .hero-content p {
                    text-align: center;  /* Center paragraph text */
                    margin: 0;
                    max-width: 90%;  /* Slightly constrain width for readability */
                }
                
                .hero h1 {
                    font-size: clamp(64px, 7vw, 110px);
                    line-height: 1.15;
                    letter-spacing: -0.02em;
                    text-align: center;  /* Center heading */
                    margin: 0 0 clamp(12px, 1.5vw, 18px) 0;
                    overflow: visible;
                    padding-bottom: 4px;
                }
                
                .hero p {
                    font-size: clamp(20px, 1.8vw, 24px);
                    line-height: 1.6;
                    max-width: 100%;
                }
                
                .hero-image {
                    position: relative;
                    width: 100%;
                    min-height: clamp(500px, 50vh, 650px);
                    max-height: clamp(600px, 60vh, 700px);
                    height: clamp(550px, 55vh, 650px);
                    border-radius: clamp(20px, 2vw, 28px);
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
                    justify-content: center;  /* Center buttons */
                    align-items: center;
                    width: 100%;
                    margin-top: 0;
                }
                
                .hero-body .cta-group .btn {
                    width: auto;
                }
                
                /* Desktop Outreach Section - match page content width */
                .outreach {
                    max-width: 1200px;
                    margin: 0 auto;
                    width: min(1200px, 94%);
                    min-height: auto;
                    display: block;
                    padding-top: 0;
                    padding-bottom: 60px;
                }
                
                /* Desktop outreach - left-aligned heading */
                .outreach .section-eyebrow {
                    display: inline-flex !important;
                    width: fit-content !important;
                    max-width: fit-content !important;
                    margin-bottom: 16px;
                }
                
                .outreach .section-heading {
                    margin-bottom: 36px;
                    text-align: left;
                }
                
                /* Desktop outreach handled by base carousel CSS */
                
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
            
            /* ========================================
               INTERMEDIATE BREAKPOINT (961px - 1199px)
               Ensures desktop layout scales properly for narrow desktop windows
               Prevents awkward proportions when resizing
               ======================================== */
            @media (min-width: 961px) and (max-width: 1199px) {
                /* Scale down hero for intermediate widths */
                .hero h1 {
                    font-size: clamp(48px, 5.5vw, 72px);
                }
                
                .hero p {
                    font-size: clamp(16px, 1.6vw, 20px);
                }
                
                .hero-body {
                    column-gap: clamp(24px, 3vw, 40px);
                }
                
                .hero-image {
                    min-height: clamp(350px, 40vh, 450px);
                    max-height: clamp(400px, 50vh, 500px);
                    height: clamp(380px, 45vh, 480px);
                }
                
                /* Scale down event grid for intermediate widths */
                .events-container {
                    gap: clamp(16px, 2vw, 24px);
                    padding: 0 12px;
                }
                
                .event-card {
                    padding: clamp(12px, 1.5vw, 18px);
                    border-radius: 20px;
                }
                
                .event-cta .btn {
                    padding: clamp(10px, 1.2vw, 12px) clamp(16px, 2vw, 20px);
                    font-size: clamp(10px, 1vw, 11px);
                }
                
                /* Scale down watch section */
                .watch-card {
                    padding: 32px 40px;
                }
                
                /* Scale down contact section */
                .contact-card {
                    padding: 48px 56px;
                }
                
                /* Scale down schedule grid */
                .schedule-grid {
                    gap: clamp(16px, 2vw, 24px);
                }
                
                /* Adjust main gaps */
                main {
                    gap: 80px;
                    margin-bottom: 80px;
                }
            }
            
            /* ========================================
               FOOTER
               ======================================== */
            .site-footer {
                background: transparent;
                padding: 60px 0 40px;
                /* Safari iOS safe area - add extra padding for home indicator */
                padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px));
                margin-top: 40px;
                border-top: 1px solid #d4a574;
            }
            
            .footer-content {
                max-width: 1280px;
                margin: 0 auto;
                padding: 0 5%;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 32px;
            }
            
            .footer-brand {
                display: flex;
                flex-direction: column;
                align-items: center;
                line-height: 1;
                text-align: center;
            }
            
            .footer-brand-title {
                font-family: 'Playfair Display', serif;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: 3px;
                text-transform: uppercase;
                color: #1a1a2e;
            }
            
            .footer-brand-subtitle {
                font-size: 11px;
                letter-spacing: 4px;
                text-transform: uppercase;
                color: rgba(26, 26, 46, 0.5);
                font-weight: 600;
                margin-top: 4px;
            }
            
            .footer-social {
                display: flex;
                gap: 24px;
                align-items: center;
            }
            
            .footer-social a {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: rgba(26, 26, 46, 0.08);
                color: #1a1a2e;
                transition: all 0.3s ease;
            }
            
            .footer-social a:hover {
                background: #d4a574;
                color: #ffffff;
                transform: translateY(-3px);
            }
            
            .footer-social svg {
                width: 20px;
                height: 20px;
                fill: currentColor;
            }
            
            .footer-divider {
                display: none;
            }
            
            .footer-links {
                display: flex;
                gap: 24px;
            }
            
            .footer-link {
                font-size: 13px;
                color: rgba(26, 26, 46, 0.6);
                text-decoration: none;
                transition: color 0.3s ease;
            }
            
            .footer-link:hover {
                color: #d4a574;
            }
            
            .footer-link-separator {
                color: rgba(26, 26, 46, 0.3);
                font-size: 13px;
            }
            
            .footer-copyright {
                font-size: 13px;
                color: rgba(26, 26, 46, 0.5);
                text-align: center;
            }
            
            @media (max-width: 480px) {
                .site-footer {
                    padding: 48px 0 32px;
                    /* Safari iOS safe area - add extra padding for home indicator on mobile */
                    padding-bottom: calc(32px + env(safe-area-inset-bottom, 0px));
                    margin-top: 0; /* Reduced from 24px - footer sits right against jotform */
                }
                
                .footer-content {
                    gap: 24px;
                }
                
                .footer-brand-title {
                    font-size: 20px;
                }
                
                .footer-social {
                    gap: 16px;
                }
                
                .footer-social a {
                    width: 40px;
                    height: 40px;
                }
                
                .footer-social svg {
                    width: 18px;
                    height: 18px;
                }
            }

`
