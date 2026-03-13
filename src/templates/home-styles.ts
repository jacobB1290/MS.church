import { GOLD } from '../design-tokens.js'

export const homeStyles = (): string => `
            :root {
                color-scheme: light;

                /* ── Gold accent — single source of truth ── */
                /* Change GOLD in src/design-tokens.ts; all usages below derive from --gold */
                --gold: ${GOLD};
                --gold-dark:   color-mix(in srgb, var(--gold) 70%, black);
                --gold-deeper: color-mix(in srgb, var(--gold) 55%, black);

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

                /* ── Typography System ── */
                --font-display: 'Playfair Display', Georgia, serif;
                --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

                /* Type scale — fluid from mobile to desktop */
                --text-hero:    clamp(52px, 8vw, 88px);   /* Hero headline — unique, largest */
                --text-title:   clamp(36px, 5vw, 52px);   /* Section h2 titles — all sections */
                --text-heading: clamp(20px, 2.5vw, 26px); /* Card / item h3 sub-headings */
                --text-lead:    clamp(17px, 1.5vw, 20px); /* Lead paragraphs */
                --text-body:    16px;                      /* Base body text */
                --text-small:   14px;                      /* Nav links, secondary text */
                --text-label:   12px;                      /* Buttons, UI labels */
                --text-eyebrow: 10px;                      /* Eyebrows, badges, overlines */

                /* Font weights */
                --weight-regular:  400;
                --weight-medium:   500;
                --weight-semibold: 600;
                --weight-bold:     700;

                /* Line heights */
                --leading-tight:  1.1;   /* Display headings */
                --leading-snug:   1.3;   /* Sub-headings */
                --leading-normal: 1.6;   /* Body text */
                --leading-loose:  1.8;   /* Lead / prose */

                /* Letter spacing */
                --tracking-tight:  -0.02em; /* Serif display headings */
                --tracking-normal:  0em;    /* Body text */
                --tracking-wide:    0.12em; /* Buttons, nav labels */
                --tracking-wider:   0.25em; /* Eyebrows, brand subtitles */
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
                overflow-x: hidden;
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
                /* Active (gold) state must override the white fallback above */
                .nav-form-btn.active {
                    background: var(--gold) !important;
                    color: #ffffff !important;
                    border-color: color-mix(in srgb, var(--gold) 40%, transparent) !important;
                }
            }

            body {
                font-family: var(--font-body);
                font-size: var(--text-body);
                /* Solid background color for seamless Safari iOS overscroll */
                background-color: var(--bg-color);
                background: var(--bg-default);
                color: #1a1a2e;
                min-height: 100vh;
                min-height: -webkit-fill-available;
                line-height: var(--leading-normal);
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
                background: rgba(255, 255, 255, 0.72);
                border-radius: 100px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 40px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08),
                            0 8px 20px rgba(0, 0, 0, 0.04);
                -webkit-backdrop-filter: blur(20px);
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
                background: rgba(255, 255, 255, 0.78);
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
                font-family: var(--font-display);
                font-size: 24px;
                font-weight: var(--weight-bold);
                letter-spacing: 0.1em;
                text-transform: uppercase;
                color: #1a1a2e;
                white-space: nowrap;
            }

            .brand-subtitle {
                font-size: var(--text-eyebrow);
                letter-spacing: var(--tracking-wider);
                text-transform: uppercase;
                color: #6b6b80;
                font-weight: var(--weight-semibold);
                margin-top: 2px;
                white-space: nowrap;
            }

            nav ul {
                list-style: none;
                display: flex;
                gap: 36px;
                text-transform: uppercase;
                letter-spacing: var(--tracking-wide);
                font-size: var(--text-small);
                font-weight: var(--weight-bold);
            }

            nav a {
                color: #1a1a2e;
                opacity: 1;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                padding-bottom: 4px;
                white-space: nowrap;
            }

            nav a.active {
                opacity: 1;
                color: var(--gold);
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
                background: var(--gold);
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
                font-size: var(--text-small);
                font-weight: var(--weight-bold);
                text-transform: uppercase;
                letter-spacing: var(--tracking-wide);
                white-space: nowrap;
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
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wider);
                color: #595970;
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
                font-family: var(--font-display);
                font-size: var(--text-hero);
                line-height: var(--leading-tight);
                letter-spacing: var(--tracking-tight);
                color: #1a1a2e;
                font-weight: var(--weight-bold);
                margin-top: 0.5vh;
                text-shadow: 0 8px 24px rgba(26, 26, 46, 0.15),
                             0 4px 8px rgba(26, 26, 46, 0.1);
            }

            .hero p {
                max-width: 640px;
                font-size: var(--text-lead);
                color: rgba(26, 26, 46, 0.7);
                line-height: var(--leading-loose);
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
                font-size: var(--text-label);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
                border: none;
                cursor: pointer;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .btn-primary {
                background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
                color: #ffffff;
                box-shadow: 0 16px 40px color-mix(in srgb, var(--gold) 35%, transparent);
            }

            .btn-primary:hover {
                transform: translateY(-4px);
                box-shadow: 0 20px 50px color-mix(in srgb, var(--gold) 45%, transparent);
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
                background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%) !important;
                color: #ffffff !important;
                box-shadow: 0 16px 40px color-mix(in srgb, var(--gold) 35%, transparent) !important;
                border: none !important;
            }
            
            .btn-watch-gold:hover {
                box-shadow: 0 20px 50px color-mix(in srgb, var(--gold) 45%, transparent) !important;
            }

            /* Section Headers */
            .section-eyebrow {
                display: inline-flex;
                padding: 12px 28px;
                border-radius: 100px;
                background: rgba(255, 255, 255, 0.8);
                text-transform: uppercase;
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wider);
                color: #6b6b80;
                margin-bottom: 32px;
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.5);
            }

            .section-heading {
                font-family: var(--font-display);
                font-size: var(--text-title);
                color: #1a1a2e;
                margin-bottom: 24px;
                max-width: 800px;
                font-weight: var(--weight-bold);
                line-height: var(--leading-tight);
                letter-spacing: var(--tracking-tight);
            }

            .section-lead {
                max-width: 720px;
                color: rgba(26, 26, 46, 0.7);
                font-size: var(--text-lead);
                margin-bottom: 16px;
                line-height: var(--leading-loose);
            }

            address {
                font-style: normal;
                font-size: var(--text-eyebrow);
                letter-spacing: var(--tracking-wider);
                text-transform: uppercase;
                color: #6b6b80;
                margin-bottom: 48px;
                font-weight: var(--weight-semibold);
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
                text-decoration-color: color-mix(in srgb, var(--gold) 50%, transparent);
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
                text-decoration-color: color-mix(in srgb, var(--gold) 80%, transparent);
            }
            
            .address-dropdown {
                position: absolute;
                top: calc(100% + 8px);
                left: 50%;
                transform: translateX(-50%);
                background: white;
                border-radius: 16px;
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
                font-size: var(--text-small);
                font-weight: var(--weight-medium);
                letter-spacing: var(--tracking-normal);
                text-transform: none;
            }
            
            .address-dropdown-item:hover {
                background: color-mix(in srgb, var(--gold) 10%, transparent);
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
                font-size: var(--text-label);
                font-weight: var(--weight-medium);
                letter-spacing: var(--tracking-wide);
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
                /* On mobile, Find Us button stays gold even without backdrop-filter */
                @media (max-width: 899px) {
                    .find-us-btn {
                        background: var(--gold) !important;
                        border: 1px solid rgba(255, 255, 255, 0.25) !important;
                    }
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
                letter-spacing: var(--tracking-wide);
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-bold);
                color: #6b6b80;
            }

            .schedule-item h3 {
                font-size: var(--text-heading);
                font-weight: var(--weight-bold);
                color: #1a1a2e;
                font-family: var(--font-display);
                line-height: var(--leading-snug);
            }

            .schedule-item p {
                color: rgba(26, 26, 46, 0.65);
                line-height: var(--leading-loose);
                font-size: var(--text-body);
            }

            /* ========================================
               OUTREACH SECTION - Simple Horizontal Carousel
               ======================================== */
            #outreach { overscroll-behavior: contain; }

            .outreach {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }

            .outreach .section-eyebrow {
                display: inline-flex !important;
                width: fit-content !important;
                max-width: fit-content !important;
                margin-bottom: 24px;
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

            /* Soft fog INSIDE viewport — fades adjacent card shadow bleed at edges */
            .carousel-viewport::before,
            .carousel-viewport::after {
                content: '';
                position: absolute;
                top: -80px;
                bottom: -80px;
                width: 80px;
                z-index: 5;   /* below carousel-arrow at z-index 20 */
                pointer-events: none;
            }
            .carousel-viewport::before {
                left: -40px;
                background: linear-gradient(to right,
                    var(--bg-color, #f8f9fd) 25%,
                    rgba(248, 249, 253, 0.4) 60%,
                    rgba(248, 249, 253, 0) 100%);
            }
            .carousel-viewport::after {
                right: -40px;
                background: linear-gradient(to left,
                    var(--bg-color, #f8f9fd) 25%,
                    rgba(248, 249, 253, 0.4) 60%,
                    rgba(248, 249, 253, 0) 100%);
            }

            /* The track is a flex row of ALL cards; translateX slides it */
            .carousel-track {
                display: flex;
                transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                will-change: transform;
                touch-action: pan-y pinch-zoom;
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
                    /* 16px padding = gutter where arrows sit */
                    padding: 0 16px;
                }
                .carousel-viewport {
                    clip-path: inset(-60px -24px -60px -24px);
                }
                .carousel-wrapper {
                    overflow: visible;
                }
                /* Fog inside viewport — extends inward for a gentle fade */
                .carousel-viewport::before,
                .carousel-viewport::after {
                    top: -60px;
                    bottom: -60px;
                    width: 56px;
                }
                .carousel-viewport::before {
                    left: -24px;
                }
                .carousel-viewport::after {
                    right: -24px;
                    left: auto;
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

            /* Arrows: sit in the gray gutter outside the white outer-card.
               z-index above fog ::before/::after (z-index 5). */
            .carousel-arrow {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                z-index: 20;   /* above fog ::before/::after at z-index 5 */
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.82);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.5);
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 16px;
                color: #1a1a2e;
            }

            /* Positioned in the gray gutter outside the white outer-card.
               Mobile card has 16px padding; arrows at left/right 0 center the 32px
               circle in that gutter (half in margin, half at the outer-card edge). */
            .carousel-arrow.prev {
                left: 0;
            }

            .carousel-arrow.next {
                right: 0;
            }

            .carousel-arrow:hover {
                background: rgba(255, 255, 255, 0.96);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
                transform: translateY(-50%) scale(1.08);
            }

            .carousel-arrow.hidden {
                opacity: 0;
                pointer-events: none;
            }

            /* Dots — gold theme */
            .carousel-dots {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .carousel-dots .carousel-dot {
                width: 9px;
                height: 9px;
                border-radius: 50%;
                background: color-mix(in srgb, var(--gold) 25%, transparent);
                border: 1.5px solid color-mix(in srgb, var(--gold) 40%, transparent);
                cursor: pointer;
                transition: all 0.35s ease;
                padding: 0;
            }

            .carousel-dots .carousel-dot.active {
                background: var(--gold);
                border-color: var(--gold);
                width: 10px;
                height: 10px;
                box-shadow: 0 0 10px color-mix(in srgb, var(--gold) 50%, transparent);
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
                border-radius: 32px;
                overflow: hidden;
                background: transparent;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                transition: box-shadow 0.4s ease, transform 0.4s ease;
            }
            
            .event-flyer-wrapper:hover {
                transform: translateY(-3px);
            }
            
            /* Dominant color glow effect */
            .event-flyer-wrapper.glow-warm {
                box-shadow: 0 12px 48px color-mix(in srgb, var(--gold) 50%, transparent), 0 6px 20px color-mix(in srgb, var(--gold) 30%, transparent);
            }
            .event-flyer-wrapper.glow-red {
                box-shadow: 0 12px 48px rgba(200, 60, 60, 0.45), 0 6px 20px rgba(180, 40, 40, 0.28);
            }
            .event-flyer-wrapper.glow-blue {
                box-shadow: 0 12px 48px rgba(60, 120, 200, 0.45), 0 6px 20px rgba(40, 100, 180, 0.28);
            }
            .event-flyer-wrapper.glow-green {
                box-shadow: 0 12px 48px rgba(60, 180, 100, 0.45), 0 6px 20px rgba(40, 150, 80, 0.28);
            }
            .event-flyer-wrapper.glow-purple {
                box-shadow: 0 12px 48px rgba(140, 80, 200, 0.45), 0 6px 20px rgba(120, 60, 180, 0.28);
            }
            .event-flyer-wrapper.glow-dark {
                box-shadow: 0 12px 48px rgba(40, 40, 60, 0.5), 0 6px 20px rgba(20, 20, 40, 0.3);
            }

            /* Slightly tighter radius on image so the outer-card corners show through */
            .event-outer-card .event-flyer-wrapper {
                border-radius: 18px;
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
                color: #6b6b80;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 2px;
            }

            /* ─── Event Outer Card ("back card") ──────────────────────────────────
               White frosted-glass card that houses: header (pills) + image + optional
               link button. Creates the "card behind the card" layered look.
               ─────────────────────────────────────────────────────────────────── */
            .event-outer-card {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 10px;
                background: rgba(255, 255, 255, 0.92);
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                border-radius: 26px;
                border: 1px solid rgba(255, 255, 255, 0.7);
                padding: 12px;
                box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.03);
                box-sizing: border-box;
                transition: box-shadow 0.35s ease;
            }

            .event-outer-card:hover {
                box-shadow: 0 8px 36px rgba(0, 0, 0, 0.11), 0 2px 8px rgba(0, 0, 0, 0.05);
            }

            /* Header row inside outer card — date left, time right (or MEMORIES left) */
            .event-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                padding: 0 2px;
                box-sizing: border-box;
                min-height: 28px;
            }

            /* Date text — plain gold, left side of header */
            .event-date {
                font-size: 16px;
                font-weight: var(--weight-bold);
                letter-spacing: 1.5px;
                color: var(--gold);
                text-transform: uppercase;
                white-space: nowrap;
                line-height: 1;
            }

            /* Time text — plain gold, right side of header (hidden when all-day) */
            .event-time-pill {
                font-size: 16px;
                font-weight: var(--weight-bold);
                letter-spacing: 1.5px;
                color: var(--gold);
                text-transform: uppercase;
                white-space: nowrap;
                line-height: 1;
            }

            /* Description-link button — footer of the outer card, gold pill matching Find Us style.
               No margin-top needed; .event-outer-card gap handles spacing. */
            .event-link-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                width: 100%;
                padding: 12px 24px;
                position: relative;
                z-index: 2;
                background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
                border-radius: 100px;
                font-size: var(--text-label);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
                color: #ffffff;
                text-decoration: none;
                cursor: pointer;
                box-shadow: 0 6px 20px color-mix(in srgb, var(--gold) 35%, transparent);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-sizing: border-box;
            }

            .event-link-btn:hover {
                background: linear-gradient(135deg, var(--gold-dark) 0%, var(--gold-deeper) 100%);
                box-shadow: 0 10px 28px color-mix(in srgb, var(--gold) 45%, transparent);
                transform: translateY(-2px);
            }


            /* MEMORIES text inside .event-card-header — matches date/time plain gold style */
            .event-card-header .past-card-badge {
                font-size: 16px;
                font-weight: var(--weight-bold);
                letter-spacing: 1.5px;
                color: var(--gold);
                text-transform: uppercase;
                white-space: nowrap;
                line-height: 1;
                position: static;
                top: auto;
                left: auto;
                background: none;
                box-shadow: none;
                padding: 0;
                border-radius: 0;
            }

            /* Wrapper for desktop past-events-card — becomes the 1fr grid item.
               The event-outer-card inside fills the available height. */
            .past-events-outer {
                display: flex;
                flex-direction: column;
                width: 100%;
                box-sizing: border-box;
            }

            .past-events-outer .event-outer-card {
                flex: 1;
            }

            .past-events-outer .event-outer-card .past-events-card {
                flex: 1;
            }

            /* === CTA Button === */
            /* Mobile: Frosted glass overlay on bottom of image */
            .event-cta {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 6;
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
                font-size: var(--text-label);
                font-weight: var(--weight-bold);
                border-radius: 16px;
                background: rgba(255, 255, 255, 0.85);
                color: #1a1a2e;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                cursor: pointer;
                display: block;
                text-align: center;
                text-decoration: none;
                letter-spacing: var(--tracking-wide);
            }

            .event-cta .btn:hover {
                background: #fff;
                box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
                transform: translateY(-1px);
            }

            /* See Past Events card in carousel — content fills the outer-card.
               Subtle shadow + inner border gives the content area its own depth so it
               reads as a distinct surface inside the white outer-card. */
            .carousel-past-card {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                width: 100%;
                flex: 1;
                aspect-ratio: 3/4;
                border-radius: 18px;
                box-shadow: 0 2px 20px rgba(0, 0, 0, 0.07),
                            inset 0 0 0 1px rgba(0, 0, 0, 0.055);
                background: rgba(248, 249, 253, 0.6);
                position: relative;
                cursor: pointer;
                padding: 24px 16px;
            }
            @media (max-width: 960px) {
                .event-outer-card {
                    border-radius: 22px;
                }
            }
            .carousel-past-card .past-card-badge {
                position: absolute; top: 12px; left: 12px;
                background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
                color: #ffffff; font-size: var(--text-eyebrow); font-weight: var(--weight-bold);
                padding: 5px 10px; border-radius: 100px;
                letter-spacing: var(--tracking-wide);
                box-shadow: 0 4px 16px color-mix(in srgb, var(--gold) 35%, transparent);
            }
            .carousel-past-card .past-card-icon { font-size: 40px; margin-bottom: 10px; }
            .carousel-past-card .past-card-title {
                font-family: var(--font-display);
                font-size: var(--text-heading); font-weight: var(--weight-bold); margin: 0 0 8px 0; color: #1a1a2e;
            }
            .carousel-past-card .past-card-text {
                font-size: var(--text-label); color: #595970;
                line-height: var(--leading-normal); margin-bottom: 14px; max-width: 200px;
            }
            .carousel-past-card .past-card-btn {
                display: flex; align-items: center; justify-content: center;
                width: 100%; padding: 12px 24px; box-sizing: border-box;
                background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
                border: none; color: #ffffff; border-radius: 100px;
                font-size: var(--text-label); font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide); text-transform: uppercase;
                cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 6px 20px color-mix(in srgb, var(--gold) 35%, transparent);
                position: relative; z-index: 2;
            }
            .carousel-past-card .past-card-btn:hover {
                background: linear-gradient(135deg, var(--gold-dark) 0%, var(--gold-deeper) 100%);
                box-shadow: 0 10px 28px color-mix(in srgb, var(--gold) 45%, transparent);
                transform: translateY(-2px);
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
            }
            
            .stay-tuned-card {
                background: rgba(255, 255, 255, 0.15);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 56px 40px;
                box-shadow: 0 32px 80px rgba(0, 0, 0, 0.08),
                            0 12px 32px rgba(0, 0, 0, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.5);
                min-height: auto;
                border-radius: 24px;
                position: relative;
                overflow: hidden;
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                aspect-ratio: 3/4;
                width: 100%;
            }

            .stay-tuned-card::before {
                display: none;
            }

            /* ========================================
               COLOR SWIRL - Animated background from past event colors
               Soft, blurred blobs that orbit and morph to convey "in the works"
               ======================================== */
            .stay-tuned-swirl {
                position: absolute;
                inset: -30%;
                z-index: 0;
                pointer-events: none;
                filter: blur(48px) saturate(1.4);
                opacity: 0;
                animation: swirlFadeIn 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            @keyframes swirlFadeIn {
                to { opacity: 0.85; }
            }

            .swirl-blob {
                position: absolute;
                border-radius: 50%;
                will-change: transform;
            }

            .swirl-blob:nth-child(1) {
                width: 55%;
                height: 55%;
                top: 5%;
                left: 0%;
                animation: swirlOrbit1 8s ease-in-out infinite;
            }
            .swirl-blob:nth-child(2) {
                width: 50%;
                height: 50%;
                top: 35%;
                right: 0%;
                animation: swirlOrbit2 10s ease-in-out infinite;
            }
            .swirl-blob:nth-child(3) {
                width: 48%;
                height: 48%;
                bottom: 0%;
                left: 15%;
                animation: swirlOrbit3 9s ease-in-out infinite;
            }
            .swirl-blob:nth-child(4) {
                width: 42%;
                height: 42%;
                top: 15%;
                right: 15%;
                animation: swirlOrbit4 11s ease-in-out infinite;
            }
            .swirl-blob:nth-child(5) {
                width: 38%;
                height: 38%;
                bottom: 15%;
                right: 5%;
                animation: swirlOrbit5 7s ease-in-out infinite;
            }

            @keyframes swirlOrbit1 {
                0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
                25%  { transform: translate(20%, 15%) scale(1.15) rotate(45deg); }
                50%  { transform: translate(-10%, 25%) scale(0.9) rotate(120deg); }
                75%  { transform: translate(15%, -10%) scale(1.1) rotate(225deg); }
                100% { transform: translate(0, 0) scale(1) rotate(360deg); }
            }
            @keyframes swirlOrbit2 {
                0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
                25%  { transform: translate(-25%, 10%) scale(1.2) rotate(-60deg); }
                50%  { transform: translate(15%, -20%) scale(0.85) rotate(-150deg); }
                75%  { transform: translate(-15%, 20%) scale(1.1) rotate(-270deg); }
                100% { transform: translate(0, 0) scale(1) rotate(-360deg); }
            }
            @keyframes swirlOrbit3 {
                0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
                33%  { transform: translate(20%, -15%) scale(1.2) rotate(80deg); }
                66%  { transform: translate(-15%, 10%) scale(0.9) rotate(200deg); }
                100% { transform: translate(0, 0) scale(1) rotate(360deg); }
            }
            @keyframes swirlOrbit4 {
                0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
                20%  { transform: translate(-20%, -15%) scale(1.1) rotate(-40deg); }
                50%  { transform: translate(10%, 20%) scale(0.95) rotate(-120deg); }
                80%  { transform: translate(15%, -10%) scale(1.15) rotate(-280deg); }
                100% { transform: translate(0, 0) scale(1) rotate(-360deg); }
            }
            @keyframes swirlOrbit5 {
                0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
                30%  { transform: translate(15%, 20%) scale(1.15) rotate(70deg); }
                60%  { transform: translate(-20%, -10%) scale(0.9) rotate(180deg); }
                100% { transform: translate(0, 0) scale(1) rotate(360deg); }
            }

            /* Frosted glass overlay — just enough to keep text readable, not wash out colors */
            .stay-tuned-frost {
                position: absolute;
                inset: 0;
                z-index: 1;
                background: rgba(255, 255, 255, 0.38);
                backdrop-filter: blur(3px);
                border-radius: inherit;
            }

            /* Ensure content sits above swirl + frost */
            .stay-tuned-content {
                position: relative;
                z-index: 2;
            }

            /* Smooth transition when real colors replace defaults */
            .swirl-blob {
                transition: background 1.5s ease-in-out;
            }

            /* Reduce motion for accessibility */
            @media (prefers-reduced-motion: reduce) {
                .swirl-blob { animation: none !important; }
                .stay-tuned-swirl { animation: none !important; opacity: 0.7; }
            }

            .stay-tuned-card:hover {
                box-shadow: 0 40px 100px rgba(0, 0, 0, 0.1),
                            0 16px 40px rgba(0, 0, 0, 0.05),
                            0 0 0 1px color-mix(in srgb, var(--gold) 12%, transparent);
                transform: translateY(-4px);
            }

            /* ========================================
               STAY TUNED ONLY MODE
               When no upcoming events - clean static layout
               ======================================== */
            .stay-tuned-only {
                margin-bottom: 0 !important;
                min-height: auto !important;
            }

            .stay-tuned-only .section-heading {
                margin-bottom: 24px;
            }

            .stay-tuned-only .section-eyebrow {
                display: inline-flex !important;
                width: fit-content !important;
                max-width: fit-content !important;
            }

            .stay-tuned-only .stay-tuned-container {
                margin-bottom: 0;
            }

            .stay-tuned-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 14px;
                width: 100%;
                padding: 10px 0;
                overflow: visible;
                position: relative;
                z-index: 2;
            }

            /* SVG ornament star */
            .stay-tuned-ornament {
                width: 52px;
                height: 52px;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: ornamentGlow 4s ease-in-out infinite;
            }

            .stay-tuned-ornament svg {
                filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
            }

            .stay-tuned-star {
                width: 100%;
                height: 100%;
                filter: drop-shadow(0 2px 8px color-mix(in srgb, var(--gold) 30%, transparent));
            }

            @keyframes ornamentGlow {
                0%, 100% { opacity: 0.85; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.06); }
            }

            .stay-tuned-title {
                font-family: var(--font-display);
                font-size: var(--text-heading);
                font-weight: var(--weight-bold);
                margin: 0;
                color: #1a1a2e;
                letter-spacing: var(--tracking-tight);
                line-height: var(--leading-snug);
                text-shadow: 0 0 12px rgba(255, 255, 255, 0.9), 0 1px 4px rgba(255, 255, 255, 0.8);
            }

            /* Thin gold divider rule */
            .stay-tuned-rule {
                width: 48px;
                height: 1px;
                background: linear-gradient(90deg, transparent, var(--gold), transparent);
                margin: 2px 0;
            }

            .stay-tuned-text {
                font-size: var(--text-small);
                color: #3a3a50;
                line-height: var(--leading-normal);
                margin: 0;
                text-shadow: 0 0 10px rgba(255, 255, 255, 0.9), 0 1px 3px rgba(255, 255, 255, 0.8);
                max-width: 240px;
                font-style: italic;
            }

            /* View Past Events Button - stands out against swirl */
            .btn-view-past-events {
                margin-top: 16px;
                padding: 10px 20px;
                background: rgba(255, 255, 255, 0.7);
                border: 1.5px solid rgba(26, 26, 46, 0.2);
                border-radius: 100px;
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-semibold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
                color: #4a4a5e;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                flex-shrink: 0;
                backdrop-filter: blur(8px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            }

            .btn-view-past-events:hover {
                background: rgba(255, 255, 255, 0.85);
                border-color: rgba(26, 26, 46, 0.3);
                color: #3a3a50;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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
                border-radius: 24px;
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
                border-radius: 0;
            }
            
            .past-event-slide-info {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 20px;
                background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 60%, transparent 100%);
                border-radius: 0 0 24px 24px;
            }

            .past-event-slide-date {
                display: inline-block;
                padding: 5px 12px;
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(8px);
                border-radius: 100px;
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
                color: rgba(255, 255, 255, 0.9);
                text-transform: uppercase;
                margin-bottom: 8px;
            }

            .past-event-slide-title {
                font-family: var(--font-display);
                font-size: var(--text-small);
                font-weight: var(--weight-semibold);
                color: #ffffff;
                margin: 0;
                line-height: var(--leading-snug);
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
                background: var(--gold);
                transform: scale(1.3);
                box-shadow: 0 0 10px color-mix(in srgb, var(--gold) 50%, transparent);
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

            .carousel-controls .carousel-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.4);
                border: 2px solid rgba(255, 255, 255, 0.6);
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .carousel-controls .carousel-dot.active {
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
                font-size: var(--text-label);
                font-weight: var(--weight-semibold);
                letter-spacing: var(--tracking-wide);
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
                border-radius: 48px;
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
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
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
                line-height: var(--leading-loose);
                font-size: var(--text-lead);
            }

            .preview-screen small {
                display: block;
                color: rgba(255, 255, 255, 0.6);
                font-size: var(--text-small);
                margin-top: 8px;
                letter-spacing: var(--tracking-normal);
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
                font-size: var(--text-small);
                font-weight: var(--weight-semibold);
                text-transform: uppercase;
                letter-spacing: var(--tracking-wide);
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
                line-height: var(--leading-loose);
                font-size: var(--text-lead);
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
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-semibold);
                text-transform: uppercase;
                letter-spacing: var(--tracking-normal);
                color: rgba(255, 255, 255, 0.9);
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
                padding: 0;
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
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-semibold);
                letter-spacing: var(--tracking-wide);
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
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
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
                color: #767690;
            }
            
            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: var(--gold);
                background: white;
                box-shadow: 0 8px 24px color-mix(in srgb, var(--gold) 15%, transparent);
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
                border-radius: 24px;
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
                border: 2px solid color-mix(in srgb, var(--gold) 20%, transparent);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .child-form:hover {
                border-color: color-mix(in srgb, var(--gold) 40%, transparent);
                box-shadow: 0 8px 24px color-mix(in srgb, var(--gold) 10%, transparent);
            }
            
            .child-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 16px;
                border-bottom: 2px solid color-mix(in srgb, var(--gold) 20%, transparent);
            }
            
            .child-number {
                font-family: 'Playfair Display', serif;
                font-size: 20px;
                color: var(--gold);
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
                /* No min-height — container matches the iframe's auto-resized height exactly,
                   eliminating the empty white space that appeared below the form */
                background: #fff;
                border-radius: 24px;
                border: 1px solid rgba(255, 255, 255, 0.6);
                box-shadow: 0 32px 80px rgba(0, 0, 0, 0.08),
                            0 12px 32px rgba(0, 0, 0, 0.04);
                overflow: visible;
                position: relative;
            }

            .jotform-container::before {
                display: none;
            }

            /* Solid cover for JotForm branding at the very bottom of the iframe.
               Solid (not gradient) so button shadow doesn't bleed through. */
            .jotform-container::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 56px;
                background: #fff;
                pointer-events: none;
                z-index: 9;
                border-radius: 0 0 24px 24px;
            }

            .jotform-container iframe {
                width: 100%;
                border: none;
                min-height: 800px;
                border-radius: 24px; /* Clips iframe pixels to match container corners */
                display: block;
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
                border-radius: 24px;
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
                color: #595970;
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
                border-radius: 24px;
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
                font-size: var(--text-body);
                font-weight: var(--weight-bold);
                color: #1a1a2e;
                margin-bottom: 6px;
                letter-spacing: var(--tracking-normal);
            }

            .contact-text p {
                font-size: var(--text-small);
                color: rgba(26, 26, 46, 0.7);
                line-height: var(--leading-normal);
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

            /* iOS status bar: Safari reads body's background-color for the
               status bar tint. Defaults to olive; JS adds .scrolled-past-hero
               to switch to white when user scrolls past the hero section.
               .page wrapper always has light bg to cover visible content. */
            @media (max-width: 899px) {
                html {
                    background: #3d3a2a !important;
                }
                html.scrolled-past-hero {
                    background: #f8f9fd !important;
                }
                body {
                    margin: 0;
                    padding: 0;
                    background: #3d3a2a !important;
                    background-image: none !important;
                    transition: none;
                }
                html.scrolled-past-hero body {
                    background: #f8f9fd !important;
                }
            }

            @media (max-width: 899px) {
                /* Phone nav-spacer - zero since hero is fullscreen behind nav */
                .nav-spacer {
                    height: 0;
                }

                /* Mobile Hero - fullscreen with image background.
                   No fadeInUp animation — hero must be instantly visible so
                   the nav's backdrop-filter blurs the hero, not a blank bg.
                   Negative margin-top pulls hero back up over the body's
                   the nav's backdrop-filter blurs the hero, not a blank bg. */
                .hero {
                    opacity: 1 !important;
                    transform: none !important;
                    animation: none !important;
                    position: relative;
                    height: 115vh;
                    height: 115svh;
                    min-height: 700px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    gap: 0;
                    background-image: url('/static/IMG_7331.jpeg');
                    background-size: cover;
                    background-position: center 20%;
                    border-radius: 0;
                    width: 100vw;
                    margin-left: calc(-50vw + 50%);
                    margin-bottom: 0;
                    box-sizing: border-box;
                }

                /* Blur layers at bottom — stacked to build up progressive blur */
                .hero-blur-layer {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    z-index: 1;
                }
                .hero-blur-layer.blur-1 {
                    height: 280px;
                    -webkit-backdrop-filter: blur(2px);
                    backdrop-filter: blur(2px);
                    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
                    mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
                }
                .hero-blur-layer.blur-2 {
                    height: 200px;
                    -webkit-backdrop-filter: blur(6px);
                    backdrop-filter: blur(6px);
                    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
                    mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
                }
                .hero-blur-layer.blur-3 {
                    height: 120px;
                    -webkit-backdrop-filter: blur(16px);
                    backdrop-filter: blur(16px);
                    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
                    mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
                }
                .hero-blur-layer.blur-4 {
                    height: 60px;
                    -webkit-backdrop-filter: blur(32px);
                    backdrop-filter: blur(32px);
                }

                /* Overlay: warm olive taper at top (matches theme-color #3d3a2a) → clear
                   mid-section → white tint at very bottom to blend blurred area into page */
                .hero::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    /* Dark olive at top → clear middle → page-bg white at bottom.
                       Fading the image to #f8f9fd BEFORE the bridge blur means the
                       blur mixes two similar light colors instead of dark-vs-light,
                       eliminating the muddy brown band. */
                    background: linear-gradient(
                        to bottom,
                        rgba(61, 58, 42, 0.94) 0%,
                        rgba(46, 42, 26, 0.7) 6%,
                        rgba(20, 18, 10, 0.4) 14%,
                        rgba(0, 0, 0, 0.18) 30%,
                        rgba(0, 0, 0, 0.05) 55%,
                        transparent 70%,
                        rgba(248, 249, 253, 0.35) 82%,
                        rgba(248, 249, 253, 0.7) 90%,
                        rgba(248, 249, 253, 0.95) 97%,
                        #f8f9fd 100%
                    );
                    z-index: 2;
                    pointer-events: none;
                }

                /* Bridge — sits OUTSIDE the hero, overlaps its bottom edge
                   and the white page below.  backdrop-filter blurs content
                   from BOTH sides of the seam so there is no hard line.
                   z-index 2: above image (1) but below button (4) and schedule. */
                .hero-bridge {
                    position: relative;
                    height: 160px;
                    /* Center on seam: pull up half into hero, leave half over background.
                       Also eat the 100px flex gaps on both sides. */
                    margin-top: calc(-80px - 100px);
                    margin-bottom: calc(-80px - 100px);
                    z-index: 2;
                    pointer-events: none;
                    width: 100vw;
                    margin-left: calc(-50vw + 50%);
                }
                /* All blur layers are full-height, centered on the seam.
                   Mask: transparent at both edges → opaque at center = strongest blur at seam. */
                .hero-bridge-blur {
                    position: absolute;
                    inset: 0;
                }
                .hero-bridge-blur.bridge-blur-1 {
                    -webkit-backdrop-filter: blur(3px);
                    backdrop-filter: blur(3px);
                    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%);
                    mask-image: linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%);
                }
                .hero-bridge-blur.bridge-blur-2 {
                    -webkit-backdrop-filter: blur(10px);
                    backdrop-filter: blur(10px);
                    -webkit-mask-image: linear-gradient(to bottom, transparent 10%, black 40%, black 60%, transparent 90%);
                    mask-image: linear-gradient(to bottom, transparent 10%, black 40%, black 60%, transparent 90%);
                }
                .hero-bridge-blur.bridge-blur-3 {
                    -webkit-backdrop-filter: blur(24px);
                    backdrop-filter: blur(24px);
                    -webkit-mask-image: linear-gradient(to bottom, transparent 20%, black 45%, black 55%, transparent 80%);
                    mask-image: linear-gradient(to bottom, transparent 20%, black 45%, black 55%, transparent 80%);
                }
                /* No heavy white overlay needed — hero already fades to page-bg */
                .hero-bridge::after {
                    display: none;
                }

                /* h1 — centered in upper portion, clear of church building */
                .hero .hero-title {
                    position: absolute;
                    top: 23.5vh;
                    left: 0;
                    right: 0;
                    text-align: center;
                    z-index: 3;
                    color: white !important;
                    font-size: clamp(64px, 16vw, 88px);
                    text-shadow: 0 4px 30px rgba(0, 0, 0, 0.8), 0 8px 60px rgba(0, 0, 0, 0.6), 0 0 140px rgba(0, 0, 0, 0.45);
                    padding: 0 20px;
                    line-height: 1.0;
                    letter-spacing: -1.5px;
                }

                /* Bottom content area — stacked: Find Us button + info text */
                .hero-body {
                    position: relative;
                    z-index: 4;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    padding: 0 24px;
                    padding-bottom: 21vh;
                    margin: 0;
                    width: 100%;
                    box-sizing: border-box;
                    text-align: center;
                }

                .hero-service-time {
                    color: #ffffff !important;
                    font-size: 19px !important;
                    font-weight: 600;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    text-shadow:
                        0 2px 12px rgba(0, 0, 0, 1),
                        0 4px 30px rgba(0, 0, 0, 1),
                        0 6px 60px rgba(0, 0, 0, 0.95),
                        0 10px 100px rgba(0, 0, 0, 0.9),
                        0 0 160px rgba(0, 0, 0, 0.8),
                        0 0 220px rgba(0, 0, 0, 0.6) !important;
                    margin: 0;
                    max-width: none !important;
                    line-height: 1.4 !important;
                }

                /* Hero image — invisible fullscreen container for Find Us button only */
                .hero-image {
                    position: static !important;
                    min-height: 0 !important;
                    height: 0 !important;
                    border-radius: 0 !important;
                    overflow: visible !important;
                    width: 100% !important;
                    order: 1;
                }

                .hero-image img {
                    display: none;
                }

                /* Find Us — gold pill, in normal document flow (not absolute) */
                .find-us-wrapper {
                    position: relative;
                    bottom: auto;
                    left: auto;
                    right: auto;
                    width: 100%;
                    pointer-events: auto;
                }

                .find-us-btn {
                    background: var(--gold);
                    -webkit-backdrop-filter: blur(12px);
                    backdrop-filter: blur(12px);
                    color: #ffffff;
                    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18), 0 0 24px color-mix(in srgb, var(--gold) 35%, transparent);
                    border: 1px solid color-mix(in srgb, var(--gold) 45%, transparent);
                    letter-spacing: 2.5px;
                    font-weight: 600;
                    padding: 8px 40px;
                    font-size: 12px;
                }

                .find-us-btn:hover {
                    background: var(--gold);
                }

                /* Dropdown opens above button */
                .find-us-wrapper .address-dropdown {
                    bottom: calc(100% + 12px);
                    top: auto;
                }
                
                /* Outreach Section - Mobile */
                .outreach {
                    width: 100%;
                    max-width: 100%;
                    padding-bottom: 0;
                    /* Side padding gives card shadows room to breathe naturally
                       instead of being hard-clipped at the viewport edge */
                    padding-left: 12px;
                    padding-right: 12px;
                    box-sizing: border-box;
                    overflow: visible;
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
                    justify-content: center;
                    border-radius: 40px;
                    gap: 16px;
                    margin: 20px auto 50px;
                    padding: 16px 20px;
                    top: calc(env(safe-area-inset-top, 0px) + 8px);
                    /* Low opacity white + heavy blur = warm frosted glass that
                       picks up the olive/earth tones from the hero behind it */
                    background: rgba(255, 255, 255, 0.72);
                    -webkit-backdrop-filter: blur(40px) saturate(1.8);
                    backdrop-filter: blur(40px) saturate(1.8);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12),
                                0 2px 8px rgba(0, 0, 0, 0.06);
                }
                
                .nav-shell.scrolled-mobile {
                    border-radius: 100px;
                    padding: 8px 20px;
                    gap: 0;
                    margin-bottom: 30px;
                    top: 8px;
                    background: rgba(255, 255, 255, 0.72);
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
                    font-size: 12px;
                    text-align: center;
                    order: 2;  /* CTA button last */
                    white-space: nowrap;
                }
                
                /* Contact button - shift right when compressed */
                .nav-shell.scrolled-mobile .nav-cta {
                    width: auto;
                    margin-left: auto;
                    padding: 8px 20px;
                }

                .brand-title {
                    font-size: 19px;
                    letter-spacing: 2px;
                    white-space: nowrap;
                }

                .brand-subtitle {
                    font-size: 11px;
                    letter-spacing: 3px;
                    white-space: nowrap;
                }

                nav a {
                    font-size: clamp(11px, 2.8vw, 13px);
                    letter-spacing: clamp(1px, 0.4vw, 2px);
                    white-space: nowrap;
                }

                /* .hero h1 and .hero p — see main mobile hero block below */

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
                    width: 100%;
                    background: var(--bg-color); /* light bg covers olive body */
                    box-sizing: border-box;
                }

                main {
                    gap: 64px;
                    margin-bottom: 64px;
                }

                section {
                    padding: 0;
                }

                /* Schedule must sit above the bridge blur (z:2) */
                .schedule {
                    position: relative;
                    z-index: 3;
                }

                .hero {
                    padding: 0;
                }

                /* .hero h1 inherits from .hero-title in main mobile hero block above */

                .btn {
                    padding: 16px 32px;
                    font-size: 11px;
                }

                .section-card {
                    padding: 36px 28px;
                    border-radius: 32px;
                }

                .schedule-item {
                    border-radius: 24px;
                }

                .section-eyebrow {
                    font-size: 9px;
                    padding: 10px 20px;
                    letter-spacing: 2.5px;
                    margin-bottom: 20px;
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


                .watch {
                    gap: 20px;
                }

                .watch-card {
                    padding: 32px 24px;
                    border-radius: 32px;
                }

                .contact {
                    gap: 28px;
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
                    border-radius: 32px;
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
                    height: 0;
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
                    -webkit-backdrop-filter: blur(10px);
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
                    background: var(--gold);
                    background: -webkit-linear-gradient(315deg, var(--gold-dark) 0%, var(--gold) 100%);
                    background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
                    color: #ffffff;
                    border-color: color-mix(in srgb, var(--gold) 40%, transparent);
                    box-shadow: 0 8px 24px color-mix(in srgb, var(--gold) 40%, transparent),
                                0 4px 12px color-mix(in srgb, var(--gold) 20%, transparent);
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

                .stay-tuned-ornament {
                    width: 44px;
                    height: 44px;
                }

                .stay-tuned-title {
                    font-size: clamp(24px, 6vw, 32px);
                }

                .stay-tuned-text {
                    font-size: clamp(13px, 3.2vw, 15px);
                    max-width: 220px;
                    line-height: 1.6;
                }

                .stay-tuned-rule {
                    width: 36px;
                }
                
                .btn-view-past-events {
                    margin-top: 12px;
                    padding: 8px 16px;
                    font-size: 9px;
                    background: var(--gold);
                    border-color: var(--gold);
                    color: #ffffff;
                }
                
                /* Mobile stay-tuned overrides */
                .stay-tuned-only {
                    min-height: auto !important;
                    padding-bottom: 0 !important;
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
                    border-radius: 16px;
                }

                .brand-title {
                    font-size: clamp(16px, 4.5vw, 19px);
                    letter-spacing: clamp(1.5px, 0.5vw, 2px);
                    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    white-space: nowrap;
                }

                .brand-subtitle {
                    font-size: clamp(9px, 2.5vw, 11px);
                    letter-spacing: clamp(2.5px, 0.7vw, 3px);
                    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    white-space: nowrap;
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
                    font-size: clamp(10px, 2.5vw, 12px);
                    letter-spacing: clamp(0.8px, 0.3vw, 1.5px);
                    white-space: nowrap;
                }

                .nav-shell.scrolled-mobile nav a {
                    font-size: clamp(10px, 2.5vw, 12px);
                    letter-spacing: clamp(0.8px, 0.3vw, 1.5px);
                    white-space: nowrap;
                }

                .nav-cta {
                    padding: clamp(6px, 2vw, 8px) clamp(12px, 3.5vw, 16px);
                    font-size: clamp(10px, 2.5vw, 11px);
                    letter-spacing: clamp(1px, 0.3vw, 1.5px);
                    white-space: nowrap;
                }

                main {
                    gap: 100px;
                    margin-bottom: 20px; /* Reduced from 80px - contact section sits closer to footer */
                }

                /* 480px hero rules removed — 899px breakpoint handles all mobile hero layout.
                   Only keep non-hero overrides and minor refinements here. */

                .cta-group {
                    flex-direction: column;
                    gap: 12px;
                    width: 100%;
                    align-items: stretch;
                }

                .btn {
                    width: 100% !important;
                    padding: 16px 32px;
                    font-size: var(--text-small);
                    letter-spacing: var(--tracking-wide);
                }

                .section-eyebrow {
                    font-size: var(--text-eyebrow);
                    padding: 10px 20px;
                    letter-spacing: var(--tracking-wider);
                    margin-bottom: 16px;
                }

                .section-heading {
                    font-size: clamp(34px, 7vw, 43px);
                    margin-bottom: 16px;
                    line-height: 1.2;
                }

                .watch {
                    gap: 16px;
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
                    border-radius: 16px;
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

                .event-outer-card {
                    border-radius: 28px;
                    padding: 14px;
                }

                .event-date {
                    font-size: 14px;
                }

                .event-time-pill {
                    font-size: 14px;
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

                .placeholder-flyer {
                    font-size: 17px;
                    letter-spacing: 1.5px;
                    border-radius: 32px;
                }

                .watch-card {
                    padding: 28px 20px;
                    border-radius: 24px;
                }

                .preview-screen {
                    padding: 28px 20px;
                    min-height: 240px;
                    gap: 20px;
                    border-radius: 16px;
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
                    padding: 0;
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
                    border-radius: 24px;
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
                    border-radius: 12px;
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

                /* Jotform container - mobile sizing */
                .jotform-container {
                    border-radius: 24px;
                }

                .jotform-container::after {
                    height: 56px;
                    border-radius: 0 0 24px 24px;
                }

                .jotform-container iframe {
                    min-height: 900px;
                    border-radius: 24px;
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
                    border-radius: 16px;
                    top: 5px;
                    width: 94%;
                }
                
                .nav-shell.scrolled-mobile {
                    padding: 4px 10px;
                    top: 2px;
                }
                
                .brand-title {
                    font-size: 14px;
                    letter-spacing: 1px;
                    white-space: nowrap;
                }

                .brand-subtitle {
                    font-size: 9px;
                    letter-spacing: 1.8px;
                    white-space: nowrap;
                }

                nav a {
                    font-size: 11px;
                    letter-spacing: 1px;
                    white-space: nowrap;
                }

                .nav-shell.scrolled-mobile nav a {
                    font-size: 10px;
                    letter-spacing: 0.8px;
                    white-space: nowrap;
                }

                .nav-cta {
                    padding: 6px 12px;
                    font-size: 10px;
                    letter-spacing: 0.8px;
                    white-space: nowrap;
                }
                
                /* Main Content Spacing */
                main {
                    gap: 48px;
                    margin-bottom: 48px;
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
                
                /* Section Headers */
                .section-eyebrow {
                    font-size: 8px;
                    padding: 9px 16px;
                    letter-spacing: 1.5px;
                    margin-bottom: 12px;
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
                }

                /* Outer card fills the constrained card height */
                .event-outer-card {
                    height: 100%;
                    padding: 10px;
                    border-radius: 22px;
                    gap: 8px;
                }

                /* Image fills remaining height after header (flex: 1) */
                .event-outer-card .event-flyer-wrapper {
                    flex: 1;
                    min-height: 0;
                    aspect-ratio: unset;
                    border-radius: 14px;
                }

                .event-meta-row {
                    max-width: 324px;
                    padding: 0 12px;
                }
                
                .event-date {
                    font-size: 11px;
                }

                .event-time-pill {
                    font-size: 11px;
                }

                .event-card-header {
                    padding: 0 2px;
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
                }
                
                .watch-header {
                    margin-bottom: -4px;
                }
                
                .watch-card {
                    padding: 20px 14px;
                    border-radius: 16px;
                }

                .preview-screen {
                    padding: 20px 14px;
                    min-height: 190px;
                    border-radius: 12px;
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
                    border-radius: 16px;
                    gap: 16px;
                }
                
                .jotform-container {
                    min-height: 600px;
                }
                
                .jotform-container::before {
                    bottom: 85px; /* Higher up on mobile */
                    width: calc(100% - 28px); /* Match mobile form card width */
                    height: 20px;
                    border-radius: 0 0 16px 16px;
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
                
                /* Desktop Navigation Spacer - nav overlaps full-screen hero */
                .nav-spacer {
                    height: 0;
                }

                main {
                    gap: 120px;
                    margin-bottom: 120px;
                }

                /* ─── Desktop Hero Section - FULL VIEWPORT ───────────────────────
                   Same pattern as mobile: background-image on .hero, content overlaid.
                   .hero-image is collapsed (height:0); <img> is hidden (saves render).
                   Find Us button flows inline in .hero-body, centered below title.
                   ─────────────────────────────────────────────────────────────── */
                .hero {
                    opacity: 1 !important;
                    transform: none !important;
                    animation: none !important;
                    /* Break out of .page max-width container */
                    width: 100vw;
                    margin-left: calc(-50vw + 50%);
                    /* Full viewport */
                    height: 100vh;
                    min-height: 640px;
                    overflow: hidden;
                    /* Center content vertically */
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: 0;
                    padding: 0;
                    /* Hero background image — left-positioned to keep church facade visible */
                    background-image: url('/static/16by9%20church.png');
                    background-size: cover;
                    background-position: left center;
                    position: relative;
                }

                /* Gradient overlay: dark top (nav) → clear middle → subtle fade at very bottom only */
                .hero::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        to bottom,
                        rgba(0, 0, 0, 0.58) 0%,
                        rgba(0, 0, 0, 0.28) 10%,
                        rgba(0, 0, 0, 0.10) 28%,
                        rgba(0, 0, 0, 0.10) 82%,
                        rgba(248, 249, 253, 0.18) 91%,
                        rgba(248, 249, 253, 0.55) 96%,
                        #f8f9fd 100%
                    );
                    z-index: 2;
                    pointer-events: none;
                }

                /* Blur layers — tight, contained at very bottom edge of hero only */
                .hero-blur-layer {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    z-index: 3;
                }
                .hero-blur-layer.blur-1 {
                    height: 90px;
                    -webkit-backdrop-filter: blur(2px);
                    backdrop-filter: blur(2px);
                    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
                    mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
                }
                .hero-blur-layer.blur-2 {
                    height: 60px;
                    -webkit-backdrop-filter: blur(6px);
                    backdrop-filter: blur(6px);
                    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
                    mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
                }
                .hero-blur-layer.blur-3 {
                    height: 36px;
                    -webkit-backdrop-filter: blur(16px);
                    backdrop-filter: blur(16px);
                    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
                    mask-image: linear-gradient(to bottom, transparent 0%, black 100%);
                }
                .hero-blur-layer.blur-4 {
                    height: 18px;
                    -webkit-backdrop-filter: blur(32px);
                    backdrop-filter: blur(32px);
                }

                /* Hero title — white, large, centered above overlay, single line */
                .hero h1 {
                    position: relative;
                    z-index: 4;
                    color: #ffffff;
                    font-size: clamp(48px, 7.5vw, 120px);
                    line-height: 1.1;
                    letter-spacing: -0.02em;
                    text-align: center;
                    white-space: nowrap;
                    text-shadow: 0 2px 24px rgba(0, 0, 0, 0.45), 0 0 80px rgba(0, 0, 0, 0.25);
                    max-width: none;
                    padding: 0 clamp(24px, 4vw, 80px);
                    margin: 0 0 clamp(12px, 1.5vw, 20px) 0;
                    width: 100%;
                    overflow: visible;
                }

                /* Hero body — flex column, no grid, centered */
                .hero-body {
                    position: relative;
                    z-index: 4;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: clamp(20px, 2.5vw, 32px);
                    max-width: 600px;
                    width: 100%;
                    padding: 0 clamp(24px, 4vw, 80px);
                    margin: 0;
                    /* Unset two-column grid */
                    grid-template-columns: unset;
                    grid-template-areas: unset;
                }

                /* Hero service-time and any hero <p> — white text */
                .hero p {
                    color: rgba(255, 255, 255, 0.92);
                    font-size: clamp(24px, 2.4vw, 32px);
                    line-height: 1.6;
                    text-shadow: 0 1px 12px rgba(0, 0, 0, 0.55);
                    text-align: center;
                    max-width: 100%;
                    margin: 0;
                }

                /* Collapse hero-image — image shown via .hero background-image */
                .hero-image {
                    position: static;
                    height: 0 !important;
                    min-height: 0 !important;
                    max-height: 0 !important;
                    overflow: visible;
                    width: 100%;
                    border-radius: 0;
                    box-shadow: none;
                    align-self: unset;
                }

                .hero-image img {
                    display: none;
                }

                /* Find Us button — in flow below service time, centered */
                .find-us-wrapper {
                    position: relative !important;
                    bottom: auto;
                    left: auto;
                    right: auto;
                    transform: none;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    pointer-events: auto;
                }

                .hero-body .cta-group {
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    margin-top: 0;
                }

                .hero-body .cta-group .btn {
                    width: auto;
                }
                
                /* Find Us btn — gold, matches mobile */
                .find-us-btn {
                    background: var(--gold);
                    -webkit-backdrop-filter: blur(16px);
                    backdrop-filter: blur(16px);
                    color: #ffffff;
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    box-shadow: 0 6px 32px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15);
                    letter-spacing: 2px;
                    font-weight: 600;
                    padding: 18px 100px;
                    font-size: 15px;
                    width: auto;
                }
                .find-us-btn:hover {
                    background: var(--gold);
                    filter: brightness(1.08);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                }

                /* Hero bridge — centered on the exact hero/page seam.
                   margin-top pulls it up so its midpoint aligns with hero bottom.
                   margin-bottom eats the remaining gap so schedule follows immediately.
                   Bridge: 80px above seam → 80px below seam (160px tall).
                   Schedule padding-top: 100px ensures eyebrow text clears the blur zone.
                   Schedule z-index > bridge so section content renders on top. */
                .hero-bridge {
                    display: block;
                    position: relative;
                    height: 160px;
                    margin-top: calc(-80px - 120px);
                    margin-bottom: calc(-80px - 120px);
                    z-index: 5;
                    pointer-events: none;
                    width: 100vw;
                    margin-left: calc(-50vw + 50%);
                }
                .hero-bridge-blur {
                    position: absolute;
                    inset: 0;
                }
                .hero-bridge-blur.bridge-blur-1 {
                    -webkit-backdrop-filter: blur(3px);
                    backdrop-filter: blur(3px);
                    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%);
                    mask-image: linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%);
                }
                .hero-bridge-blur.bridge-blur-2 {
                    -webkit-backdrop-filter: blur(10px);
                    backdrop-filter: blur(10px);
                    -webkit-mask-image: linear-gradient(to bottom, transparent 10%, black 40%, black 60%, transparent 90%);
                    mask-image: linear-gradient(to bottom, transparent 10%, black 40%, black 60%, transparent 90%);
                }
                .hero-bridge-blur.bridge-blur-3 {
                    -webkit-backdrop-filter: blur(24px);
                    backdrop-filter: blur(24px);
                    -webkit-mask-image: linear-gradient(to bottom, transparent 20%, black 45%, black 55%, transparent 80%);
                    mask-image: linear-gradient(to bottom, transparent 20%, black 45%, black 55%, transparent 80%);
                }
                .hero-bridge::after {
                    display: none;
                }

                /* Schedule section — sits above bridge, padded so eyebrow clears blur zone */
                .schedule {
                    position: relative;
                    z-index: 6;
                    padding-top: 100px;
                }

                /* Desktop Outreach Section - match page content width */
                .outreach {
                    width: 100%;
                    max-width: unset;
                    margin: 0;
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
                
                /* Desktop Watch Section - fills page width like schedule section-card */
                .watch {
                    width: 100%;
                    max-width: unset;
                    margin: 0;
                }

                .watch-card {
                    padding: 48px 56px;
                    max-width: 100%;
                    margin: 0;
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
                
                /* Desktop Contact Section - fills page width like schedule section-card */
                .contact {
                    width: 100%;
                    max-width: unset;
                    margin: 0;
                }

                .contact-card {
                    padding: 72px 80px;
                    max-width: 100%;
                }
                
                /* Desktop Schedule Section */
                .schedule-grid {
                    grid-template-columns: repeat(3, 1fr);
                    gap: 32px;
                    width: 100%;
                    max-width: unset;
                    margin: 0;
                }
                
                /* Desktop Section typography */
                .section-heading {
                    font-size: clamp(48px, 4vw, 64px);
                }
                
                .section-lead {
                    font-size: 20px;
                    max-width: 720px;
                }

            /* Stay Tuned - Two Card Layout (desktop)
               Cards are direct children of .stay-tuned-container (no wrapper div).
               JS sets display:grid inline (to override the initial display:none).
               Container is max-width:66.667% (=2/3) centered with margin:0 auto.
               Each 1fr column ≈ 1/3 of outreach width — same as one carousel card slot. */
                .stay-tuned-container {
                    grid-template-columns: 1fr 1fr !important;
                    gap: 20px !important;
                    width: auto !important;
                    max-width: 66.667% !important;
                    margin: 0 auto !important;
                    box-sizing: border-box !important;
                }

                /* stay-tuned-card: direct grid item, sized by aspect-ratio */
                .stay-tuned-card {
                    width: auto !important;
                    max-width: none !important;
                    min-width: 0 !important;
                    flex: none !important;
                    aspect-ratio: 3/4 !important;
                    height: auto !important;
                    min-height: unset !important;
                    max-height: unset !important;
                    padding: 40px 32px !important;
                    box-sizing: border-box !important;
                }

                /* past-events-outer: the 1fr grid item that carries the 3/4 aspect.
                   event-outer-card inside fills its height; past-events-card fills the rest. */
                .past-events-outer {
                    width: auto !important;
                    max-width: none !important;
                    min-width: 0 !important;
                    flex: none !important;
                    aspect-ratio: 3/4 !important;
                    box-sizing: border-box !important;
                }

                .past-events-outer .event-outer-card {
                    height: 100%;
                }

                .past-events-outer .event-outer-card .past-events-card {
                    aspect-ratio: unset !important;
                    flex: 1 !important;
                    min-height: 0 !important;
                    width: 100% !important;
                    padding: 32px 24px !important;
                }

                .stay-tuned-card .stay-tuned-ornament { width: 40px; height: 40px; }
                .stay-tuned-card .stay-tuned-title { font-size: var(--text-heading) !important; }
                .stay-tuned-card .stay-tuned-text { font-size: var(--text-small) !important; line-height: var(--leading-normal); }
                .stay-tuned-card .stay-tuned-rule { width: 32px; }
                .stay-tuned-card .btn-view-past-events { font-size: var(--text-eyebrow) !important; padding: 10px 20px !important; }

                /* past-events-card now sits inside event-outer-card which provides
                   the white card background — strip own card styling to avoid double-card */
                .past-events-card {
                    display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
                    background: transparent;
                    box-shadow: none;
                    border: none;
                    backdrop-filter: none;
                    border-radius: 18px;
                    position: relative;
                    cursor: pointer;
                }
                .past-events-outer .event-outer-card:hover { box-shadow: 0 10px 40px rgba(0,0,0,0.13), 0 3px 10px rgba(0,0,0,0.06); }
                .stay-tuned-card { border-radius: 32px; }
                .past-events-card .past-card-badge { display: none; /* badge moved to event-card-header */ }
                .past-events-card .past-card-icon { font-size: 36px; margin-bottom: 8px; }
                .past-events-card .past-card-title { font-family: var(--font-display); font-size: var(--text-heading); font-weight: var(--weight-bold); margin: 0 0 8px 0; color: #1a1a2e; }
                .past-events-card .past-card-text { font-size: var(--text-small); color: rgba(26,26,46,0.7); line-height: var(--leading-normal); margin-bottom: 14px; }
                .past-events-card .past-card-btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 12px 24px; box-sizing: border-box; background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%); border: none; color: #ffffff; border-radius: 100px; font-size: var(--text-label); font-weight: var(--weight-bold); letter-spacing: var(--tracking-wide); text-transform: uppercase; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 6px 20px color-mix(in srgb, var(--gold) 35%, transparent); position: relative; z-index: 2; }
                .past-events-card .past-card-btn:hover { background: linear-gradient(135deg, var(--gold-dark) 0%, var(--gold-deeper) 100%); box-shadow: 0 10px 28px color-mix(in srgb, var(--gold) 45%, transparent); transform: translateY(-2px); }

                .outreach.stay-tuned-only { min-height: auto !important; padding-bottom: 0 !important; }

            /* Carousel */
                .carousel-card {
                    /* width set dynamically by JS */
                    padding: 0 10px;
                }

                .carousel-arrow {
                    width: 42px;
                    height: 42px;
                    font-size: 20px;
                    border-radius: 50%;
                }
                .carousel-arrow.prev {
                    left: 24px;
                }
                .carousel-arrow.next {
                    right: 24px;
                }

            /* Event CTA below the card, not overlaid */
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
                    font-size: var(--text-small);
                    border-radius: 16px;
                    background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
                    color: #ffffff;
                    box-shadow: 0 6px 20px color-mix(in srgb, var(--gold) 35%, transparent);
                }
                .event-cta .btn:hover {
                    background: linear-gradient(135deg, var(--gold-dark) 0%, var(--gold-deeper) 100%);
                    box-shadow: 0 10px 28px color-mix(in srgb, var(--gold) 45%, transparent);
                    transform: translateY(-2px);
                }

            /* Event cards - bigger cards & stronger glow */
                .event-flyer-wrapper {
                    border-radius: 32px;
                }
                .event-date {
                    font-size: 17px;
                }

                .event-time-pill {
                    font-size: 17px;
                }

                .event-card-header {
                    padding: 0 4px;
                }

                .event-link-btn {
                    padding: 14px 32px;
                    font-size: var(--text-small);
                }

                .carousel-past-card {
                    border-radius: 32px;
                    padding: 32px 24px;
                }
                .carousel-past-card .past-card-icon { font-size: 48px; }
                .carousel-past-card .past-card-title { font-size: var(--text-heading); }
                .carousel-past-card .past-card-text { font-size: var(--text-small); max-width: 240px; }
                .carousel-past-card .past-card-btn { padding: 14px 32px; font-size: var(--text-label); }

                .event-flyer-wrapper.glow-warm {
                    box-shadow: 0 16px 56px color-mix(in srgb, var(--gold) 55%, transparent), 0 8px 24px color-mix(in srgb, var(--gold) 35%, transparent);
                }
                .event-flyer-wrapper.glow-red {
                    box-shadow: 0 16px 56px rgba(200, 60, 60, 0.5), 0 8px 24px rgba(180, 40, 40, 0.3);
                }
                .event-flyer-wrapper.glow-blue {
                    box-shadow: 0 16px 56px rgba(60, 120, 200, 0.5), 0 8px 24px rgba(40, 100, 180, 0.3);
                }
                .event-flyer-wrapper.glow-green {
                    box-shadow: 0 16px 56px rgba(60, 180, 100, 0.5), 0 8px 24px rgba(40, 150, 80, 0.3);
                }
                .event-flyer-wrapper.glow-purple {
                    box-shadow: 0 16px 56px rgba(140, 80, 200, 0.5), 0 8px 24px rgba(120, 60, 180, 0.3);
                }
                .event-flyer-wrapper.glow-dark {
                    box-shadow: 0 16px 56px rgba(40, 40, 60, 0.55), 0 8px 24px rgba(20, 20, 40, 0.35);
                }

            }

            /* ========================================
               INTERMEDIATE BREAKPOINT (961px - 1199px)
               Ensures desktop layout scales properly for narrow desktop windows
               Prevents awkward proportions when resizing
               ======================================== */
            @media (min-width: 961px) and (max-width: 1199px) {
                /* Scale down hero title for intermediate widths */
                .hero h1 {
                    font-size: clamp(48px, 5.5vw, 72px);
                }

                .hero p {
                    font-size: clamp(16px, 1.6vw, 20px);
                }
                
                /* Scale down event grid for intermediate widths */
                .events-container {
                    gap: clamp(16px, 2vw, 24px);
                    padding: 0 12px;
                }
                
                .event-outer-card {
                    padding: clamp(14px, 1.8vw, 20px);
                    border-radius: 32px;
                    gap: 14px;
                }

                .event-outer-card .event-flyer-wrapper {
                    border-radius: 22px;
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
                border-top: 1px solid var(--gold);
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
                font-family: var(--font-display);
                font-size: 24px;
                font-weight: var(--weight-bold);
                letter-spacing: 0.1em;
                text-transform: uppercase;
                color: #1a1a2e;
            }

            .footer-brand-subtitle {
                font-size: var(--text-eyebrow);
                letter-spacing: var(--tracking-wider);
                text-transform: uppercase;
                color: #6b6b80;
                font-weight: var(--weight-semibold);
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
                background: var(--gold);
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
                font-size: var(--text-small);
                color: #595970;
                text-decoration: none;
                transition: color 0.3s ease;
            }

            .footer-link:hover {
                color: var(--gold);
            }

            .footer-link-separator {
                color: rgba(26, 26, 46, 0.3);
                font-size: var(--text-small);
            }

            .footer-copyright {
                font-size: var(--text-small);
                color: #6b6b80;
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
