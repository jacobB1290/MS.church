import { GOLD } from '../design-tokens.js'

export const homeStyles = (): string => `
            /* Self-hosted Inter + Playfair Display (v1.62.7). Eliminates the
               cross-origin Google Fonts roundtrip + the FOUT window where
               a view-transition snapshot captured the fallback font and
               flashed on subpage navigation. Each weight uses display=swap
               with the metric-matched fallback below so any brief swap
               window is shape-only, no CLS. Files live in public/static/fonts/
               with a 1-year immutable cache via vercel.json. Regenerate with
               scripts/_download-fonts.mjs if the typeface set changes. */
            @font-face {
                font-family: 'Inter';
                font-style: normal;
                font-weight: 300;
                font-display: swap;
                src: url('/static/fonts/inter-300.woff2') format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
            @font-face {
                font-family: 'Inter';
                font-style: normal;
                font-weight: 400;
                font-display: swap;
                src: url('/static/fonts/inter-400.woff2') format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
            @font-face {
                font-family: 'Inter';
                font-style: normal;
                font-weight: 500;
                font-display: swap;
                src: url('/static/fonts/inter-500.woff2') format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
            @font-face {
                font-family: 'Inter';
                font-style: normal;
                font-weight: 600;
                font-display: swap;
                src: url('/static/fonts/inter-600.woff2') format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
            @font-face {
                font-family: 'Inter';
                font-style: normal;
                font-weight: 700;
                font-display: swap;
                src: url('/static/fonts/inter-700.woff2') format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
            @font-face {
                font-family: 'Playfair Display';
                font-style: normal;
                font-weight: 400;
                font-display: swap;
                src: url('/static/fonts/playfair-display-400.woff2') format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
            @font-face {
                font-family: 'Playfair Display';
                font-style: normal;
                font-weight: 600;
                font-display: swap;
                src: url('/static/fonts/playfair-display-600.woff2') format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
            @font-face {
                font-family: 'Playfair Display';
                font-style: normal;
                font-weight: 700;
                font-display: swap;
                src: url('/static/fonts/playfair-display-700.woff2') format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }

            :root {
                color-scheme: light;

                /* ── Gold accent — single source of truth ── */
                /* Change GOLD in src/design-tokens.ts; all usages below derive from --gold */
                --gold: ${GOLD};
                --gold-dark:   color-mix(in srgb, var(--gold) 70%, black);
                --gold-deeper: color-mix(in srgb, var(--gold) 55%, black);

                /* ── Warm white tier system ── */
                --bg:      #faf8f5;   /* Level 1 — page base */
                --surface: #fdfcfa;   /* Level 2 — cards, containers */
                --white:   #fefdfb;   /* Level 3 — hovers, focus states */

                /* Solid background color for seamless Safari iOS overscroll */
                --bg-color: var(--bg);
                --bg-default: var(--bg);
                --bg-stay-tuned: var(--bg);
                /* Event backgrounds - solid colors for seamless overscroll */
                --bg-event1: #f5e6d8; /* Muted warm terracotta */
                --bg-event2: #e8ead8; /* Muted olive/sage */
                --bg-event3: #f5d8d8; /* Pleasant muted red */
                --bg-event4: #e6e8f5; /* Soft blue-gray */
                --bg-event5: #f0e6f5; /* Soft lavender */

                /* ── Typography System ──
                   "Playfair Display Fallback" + "Inter Fallback" are
                   metric-matched @font-face fallbacks declared in
                   home-head.ts / page-head.ts. With font-display: optional
                   on the Google Fonts stylesheet the browser uses the
                   fallback whenever the web font isn't ready within
                   ~100ms — so the page never repaints with new font
                   metrics after first paint. */
                --font-display: 'Playfair Display', 'Playfair Display Fallback', Georgia, serif;
                --font-body: 'Inter', 'Inter Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

                /* Type scale — fluid from mobile to desktop */
                --text-hero:    clamp(64px, 11vw, 96px);  /* Hero headline — unique, largest. Bespoke curve (steeper vw + higher floor than the regular type scale) so the hero reads as dominant on mobile too — at 414px wide this floors at 64px, almost 2x the section-title floor of 36px, matching the desktop ratio. */
                --text-title:   clamp(36px, 5vw, 52px);   /* Page h1 — subpage titles (one per page) */
                --text-section: clamp(30px, 3.75vw, 42px); /* Section h2 — the editorial step between page title and card heading. Without this, h1 and h2 collapsed to the same size and every subpage read as five equally-weighted titles instead of one page-title over its sections. Calibrated against benchmark church sites (calvaryboise.com) where section h2 reads ≈50px; we sit a touch lower so the h1 stays clearly dominant. Ratio to title (52) is ~81%, to heading (26) is ~62%. */
                --text-heading: clamp(20px, 2.5vw, 26px); /* Card / item h3 sub-headings */
                --text-lead:    clamp(17px, 1.5vw, 20px); /* Lead paragraphs */
                --text-body:    16px;                      /* Base body text */
                --text-compact: 15px;                      /* Dense info modules — tip tables, sidebars, anywhere body needs to read as quieter than --text-body sitting in the same column. One step down from body without crossing into --text-small. */
                --text-small:   14px;                      /* Nav links, secondary text */
                --text-label:   12px;                      /* Buttons, UI labels */
                --text-micro:   11px;                      /* Compact uppercase scan-labels (tip-row keys, gazetteer keys, provenance). Sits between --text-label and --text-eyebrow; needs wide tracking + bold weight to stay legible at small caps. */
                --text-eyebrow: 10px;                      /* Eyebrows, badges, overlines */

                /* Font weights */
                --weight-regular:  400;
                --weight-medium:   500;
                --weight-semibold: 600;
                --weight-bold:     700;

                /* Line heights */
                --leading-tight:  1.1;   /* Display headings */
                --leading-snug:   1.3;   /* Sub-headings */
                --leading-prose:  1.5;   /* Compact info modules — tip tables, dense reference. Tighter than --leading-normal so rows read as a single beat, not as expanded prose. */
                --leading-normal: 1.6;   /* Body text */
                --leading-loose:  1.8;   /* Lead / prose */

                /* Letter spacing */
                --tracking-tight:  -0.02em; /* Serif display headings */
                --tracking-normal:  0em;    /* Body text */
                --tracking-wide:    0.12em; /* Buttons, nav labels */
                --tracking-wider:   0.25em; /* Eyebrows, brand subtitles */

                /* ── Text color scale — primary navy with alpha steps ──
                   Replaces the ~76 hardcoded rgba(26, 26, 46, X) calls
                   that had drifted across the codebase. Each step has a
                   semantic name + the alpha it carries, so other places
                   can snap to the nearest match instead of inventing a
                   new alpha every time. */
                --text-primary:          #1a1a2e;              /* solid — headings, key labels */
                --text-primary-soft:     rgba(26, 26, 46, 0.85); /* close-to-solid body */
                --text-primary-muted:    rgba(26, 26, 46, 0.72); /* descriptions, prose */
                --text-primary-faint:    rgba(26, 26, 46, 0.55); /* tertiary / metadata */
                --text-primary-fade:     rgba(26, 26, 46, 0.30); /* placeholders, hints */
                --text-primary-hairline: rgba(26, 26, 46, 0.10); /* dividers, faint borders */
                /* Short aliases — the /watch section was authored against these
                   names; without them its muted/faint text silently fell back to
                   solid --text-primary (no hierarchy). Map them to the canonical
                   alphas so the intended type hierarchy renders. */
                --text-soft:             var(--text-primary-soft);
                --text-muted:            var(--text-primary-muted);
                --text-faint:            var(--text-primary-faint);
                --text-fade:             var(--text-primary-fade);

                /* ── Spacing scale — T-shirt sizing ──
                   Each token is a fluid clamp() tuned to the existing
                   most-used values. Replaces the 183 distinct one-off
                   clamp() expressions that had been scattered through
                   the codebase for padding / margin / gap. */
                --space-xs:  clamp(8px, 1.2vw, 12px);  /* hair gaps, label↔value */
                --space-sm:  clamp(12px, 1.7vw, 16px); /* tight gaps inside blocks */
                --space-md:  clamp(16px, 2.2vw, 24px); /* default card padding, default gap */
                --space-lg:  clamp(24px, 3.5vw, 32px); /* between subsections */
                --space-xl:  clamp(28px, 4vw, 44px);   /* between sections inside a card */
                --space-2xl: clamp(40px, 5vw, 64px);   /* section padding, major rhythm */
                --space-3xl: clamp(56px, 7vw, 88px);   /* page-level breathing room */

                /* ── Border radius scale ──
                   Snap surfaces to a 5-step scale. Was bespoke: 12, 14, 16, 18, 20,
                   24, 28, 32, 48px and various clamp() variants scattered throughout. */
                --radius-sm:    8px;
                --radius-md:    16px;
                --radius-lg:    clamp(18px, 2vw, 24px);
                --radius-xl:    clamp(20px, 2.5vw, 32px);
                --radius-2xl:   clamp(28px, 3.5vw, 48px);
                --radius-pill:  100px;
                --radius-circle: 50%;

                /* ── Box shadow elevation scale ── */
                --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
                --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03);
                --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
                --shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
                --shadow-xl: 0 24px 64px rgba(0, 0, 0, 0.10), 0 8px 24px rgba(0, 0, 0, 0.06);
                --shadow-overlay: 0 40px 100px rgba(0, 0, 0, 0.55), 0 16px 48px rgba(139, 0, 0, 0.18);

                /* ── Motion: durations + easings ── */
                --motion-fast:    0.2s;
                --motion-medium:  0.3s;
                --motion-slow:    0.6s;
                --ease-standard:  cubic-bezier(0.4, 0, 0.2, 1);
                --ease-out-soft:  cubic-bezier(0.32, 0.72, 0, 1);
                --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1); /* snap-into-place with a bubbly overshoot — nav morph, playful state changes. Same personality as the original nav bounce, now applied to properties that actually animate. */
                --motion-springy: 0.5s;  /* paired with --ease-spring; long enough for the overshoot to read */

                /* ── Primary CTA button (the canonical gold pill) ──
                   Reach for these whenever a brand call-to-action gold pill
                   button appears (Plan a Visit hero CTA, Explore Our
                   Ministries, Explore Our Outreach, Learn More About Us,
                   Get Directions, Read Our Statement of Beliefs, Contact Us
                   page-level CTAs). The single source of truth is the
                   .event-link-btn rule below — modifiers (.teaser-cta,
                   .about-cta, .event-link-btn--hero) only change size /
                   alignment, never colors / shadow / motion.
                   Buttons that intentionally do NOT use this design and
                   keep their own rules: .nav-cta + .nav-form-btn (nav
                   contact, smaller, navigation), .event-link-btn-secondary
                   (explicit white secondary contrast), .btn-outline (red
                   YouTube playlist link), .btn-view-past-events (modal
                   trigger), .btn-submit / .btn-see-flyer / .btn-more-info
                   (form-context buttons), .btn-calendar (calendar nav),
                   .btn-add-child / .btn-remove-child (form utility),
                   .event-cta .btn (card overlay, non-pill radius), tab
                   buttons, address triggers, copy buttons. */
                --btn-cta-bg:           linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
                --btn-cta-bg-hover:     linear-gradient(135deg, var(--gold-dark) 0%, var(--gold-deeper) 100%);
                --btn-cta-shadow:       0 6px 20px color-mix(in srgb, var(--gold) 35%, transparent);
                --btn-cta-shadow-hover: 0 10px 28px color-mix(in srgb, var(--gold) 45%, transparent);

                /* Red color variant of the same CTA. Used only by the
                   YouTube playlist button in the /watch section so the
                   "Browse the full playlist on YouTube" CTA reads as a
                   YouTube-brand pivot. Same shape, padding, type, motion,
                   hover-lift as the gold variant; only gradient + shadow
                   tint differ. Apply via .event-link-btn.event-link-btn--red. */
                --btn-cta-bg-red:           linear-gradient(135deg, #a31515 0%, #6d0000 100%);
                --btn-cta-bg-red-hover:     linear-gradient(135deg, #6d0000 0%, #520000 100%);
                --btn-cta-shadow-red:       0 6px 20px rgba(139, 0, 0, 0.35);
                --btn-cta-shadow-red-hover: 0 10px 28px rgba(139, 0, 0, 0.45);
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
                min-height: 100dvh;
                overflow-x: hidden;
            }

            /* Brand text selection — the default blue highlight reads as
               foreign chrome against the warm cream + gold palette. A
               translucent gold keeps selected text legible while staying
               in the brand's voice. */
            ::selection {
                background: color-mix(in srgb, var(--gold) 28%, transparent);
                color: var(--text-primary);
            }

            /* Every interactive element provides its own pressed/hover
               feedback (transitions, lifts, underlines) — the default
               grey tap flash on mobile fights that and reads as
               unstyled. */
            * {
                -webkit-tap-highlight-color: transparent;
            }

            /* Brand keyboard focus ring — the UA default (blue) reads as
               foreign chrome here, same as the default selection color.
               Component-specific :focus-visible rules (subpage-jump,
               schedule-tab, menu trigger…) have higher specificity and
               keep their own treatments; this is the site-wide floor. */
            :focus-visible {
                outline: 2px solid var(--gold-dark);
                outline-offset: 3px;
            }
            /* On gold-filled controls the gold ring would vanish into the
               fill — switch to ink for those. */
            .event-link-btn:focus-visible,
            .past-card-btn:focus-visible,
            .btn-submit:focus-visible {
                outline-color: var(--text-primary);
            }

            /* Skip link — first focusable element on every page. Visually
               absent until keyboard focus, then a gold pill above all
               chrome. The jump itself is instant by design: skip links
               serve keyboard/AT users for whom the smooth-scroll wait is
               friction, and the element is never seen by pointer users. */
            .skip-link {
                position: fixed;
                top: var(--space-sm);
                left: 50%;
                transform: translateX(-50%) translateY(-200%);
                z-index: 10001;
                padding: 12px 24px;
                border-radius: var(--radius-pill);
                background: var(--btn-cta-bg);
                color: #ffffff;
                font-size: var(--text-small);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
                text-decoration: none;
                box-shadow: var(--btn-cta-shadow);
                transition: transform var(--motion-medium) var(--ease-out-soft);
            }
            .skip-link:focus-visible {
                transform: translateX(-50%) translateY(0);
                outline: 2px solid var(--text-primary);
                outline-offset: 2px;
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
                .nav-form-btn,
                .gift-lightbox-close,
                .gift-lightbox-arrow,
                .lightbox-instructions,
                .contact-info-item {
                    background: var(--surface) !important;
                    border: 1px solid rgba(0, 0, 0, 0.08) !important;
                }
                /* Active (gold) state must override the white fallback above */
                .nav-form-btn.active {
                    background: var(--gold) !important;
                    color: #ffffff !important;
                    border-color: color-mix(in srgb, var(--gold) 40%, transparent) !important;
                }
            }

            /* Screen-reader only — visible to crawlers and assistive tech, invisible to sighted users */
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }

            body {
                font-family: var(--font-body);
                font-size: var(--text-body);
                /* Solid background color for seamless Safari iOS overscroll */
                background-color: var(--bg-color);
                background: var(--bg-default);
                color: var(--text-primary);
                min-height: 100vh;
                min-height: 100dvh;
                line-height: var(--leading-normal);
                overflow-x: hidden;
                transition: background 1.8s var(--ease-standard);
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
                border-radius: var(--radius-pill);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 40px;
                box-shadow: var(--shadow-lg);
                -webkit-backdrop-filter: blur(20px);
                backdrop-filter: blur(20px);
                position: fixed;
                top: 16px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 1000;
                border: 1px solid rgba(255, 255, 255, 0.4);
                /* v1.49.24: was "transition: all 0.6s" — using "all"
                   triggers transitions on every property including those
                   mutated by the .scrolled-mobile state. On scroll-restore
                   the nav would paint unscrolled then animate to scrolled,
                   which read as the "logo movement animation flicker".
                   Restrict to background + box-shadow + opacity so the
                   padding/border-radius/top changes are instant when JS
                   adds .scrolled-mobile during scroll. Same effective
                   smoothness while the user is actively scrolling (the
                   class toggle happens once at threshold). */
                transition: background var(--motion-slow) var(--ease-standard),
                            box-shadow var(--motion-slow) var(--ease-standard),
                            opacity 0.4s var(--ease-standard);
                width: min(1280px, 94%);
            }

            /* Pre-paint nav-shell in its scrolled state when the head
               script detected non-zero scroll position. This avoids the
               "tall pill on first paint, shrink on JS run" flicker on
               bfcache restore or session scroll restoration. */
            html.nav-prerender-scrolled .nav-shell {
                transition: none;
            }

            .nav-shell.scrolled-mobile {
                padding: 10px 20px;
                top: 16px;
            }
            
            /* .brand / .nav-cta hide in the compressed state is handled in
               the mobile block below with an ANIMATED collapse (max-height +
               opacity + transform) — the old display:none here made the most
               visible nav state change on mobile an instant pop, violating
               the motion law. */
            
            /* Mobile-only form button for scrolled state */
            .nav-form-btn {
                display: none;
            }

            /* The envelope SVG inside .nav-form-btn is hidden by default;
               only the text label is shown. At narrow widths the mobile
               override below flips this — label hides, icon shows, button
               becomes a circle. */
            .nav-form-btn-icon {
                display: none;
            }
            .nav-form-btn-label {
                display: inline;
            }

            .nav-shell.scrolled-mobile nav ul {
                margin: 0;
            }

            .nav-shell:hover {
                background: rgba(255, 255, 255, 0.78);
                box-shadow: var(--shadow-xl);
            }

            .brand {
                display: flex;
                flex-direction: column;
                line-height: 1;
                text-decoration: none;
                color: inherit;
                transition: transform 0.4s var(--ease-standard);
            }

            .brand:hover {
                transform: translateY(-2px);
            }

            /* Active page indicator for multi-page nav (Phase 2 uses this) */
            .nav-shell nav a[aria-current="page"] {
                color: var(--gold);
            }

            .brand-title {
                font-family: var(--font-display);
                font-size: var(--text-heading);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
                color: var(--text-primary);
                white-space: nowrap;
            }

            .brand-subtitle {
                font-size: var(--text-eyebrow);
                letter-spacing: var(--tracking-wider);
                text-transform: uppercase;
                color: var(--text-primary-faint);
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
                color: var(--text-primary);
                opacity: 1;
                transition: all 0.4s var(--ease-standard);
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
                transition: transform 0.4s var(--ease-standard);
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
                border-radius: var(--radius-pill);
                background: rgba(255, 255, 255, 0.9);
                color: var(--text-primary);
                font-size: var(--text-small);
                font-weight: var(--weight-bold);
                text-transform: uppercase;
                letter-spacing: var(--tracking-wide);
                white-space: nowrap;
                box-shadow: var(--shadow-md);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.5);
                transition: all 0.4s var(--ease-standard);
                display: inline-flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            }

            .nav-cta:hover {
                transform: translateY(-3px);
                box-shadow: var(--shadow-lg);
                background: var(--white);
            }

            main {
                display: flex;
                flex-direction: column;
                gap: 200px;
                margin-bottom: 200px;
            }

            /* ============================================================
               MOTION SYSTEM
               One layer of motion at a time. Smooth, refined, intentional.

               Strategy (v1.49.27):
                 • Cross-document navigation → SEQUENCED FADE (forward) +
                   QUICK CROSSFADE (back). Forward fades old out over
                   180ms ease-in, then new in over 200ms ease-out with a
                   140ms backwards-fill delay (overlap window ~40ms,
                   below the human flicker threshold). Back uses a
                   compressed 110/150ms simultaneous crossfade. Explicit
                   cream bg on ::view-transition prevents iOS Safari from
                   rendering the brief low-opacity gap as dark.
                 • Brand wordmark MORPHS across pages. Tagged
                   view-transition-name: site-brand on both .brand
                   (home, in nav-shell) and .subpage-brand (subpages,
                   centered-top). The browser interpolates between the
                   two positions over the transition — the logo glides
                   from home's nav-pill spot into the subpage's
                   centered-top spot, fading from its old appearance to
                   its new one as it moves. Back nav compresses the
                   morph to match the shorter back-fade.
                 • Back button is part of the root fade — fades in on
                   forward nav (since it doesn't exist on home), fades
                   out on back nav (since home has no equivalent).
                 • Scroll restoration → manual (history.scrollRestoration
                   = 'manual'). Saved on pagehide, restored in pagereveal
                   BEFORE the view-transition snapshot is captured. The
                   fade plays at the correct scroll position from frame
                   one (no "hero shown then jump").
                 • Hash-fade entrance slide → only main + footer
                   translateY from -40px. Brand, back, and top-fog are
                   excluded from THIS specific slide so they don't move
                   when the page auto-scrolls into a hash target.
                   subpage-header's scroll-hide is gated behind a 1200ms
                   entrance lock so the brand doesn't transition to
                   .hidden as a side effect of the hash-load auto-scroll.
                 • First fresh visit → subtle 8px section rise, staggered.
                 • Any subsequent visit (back/forward, refresh, cross-page,
                   bfcache, hash-load) → no section entrance animation. The
                   <head> script tags <html class="no-entrance"> synchronously
                   so there's no opacity-0 flash before the class lands.
               ============================================================ */
            @view-transition {
                navigation: auto;
            }

            /* Explicit background on the view-transition root pseudo so
               any moment of low-opacity overlap shows the page cream,
               not whatever default the browser falls back to (Safari iOS
               can render this as dark which read to the user as "dimming
               screen flicker"). */
            ::view-transition {
                background: #faf8f5;
            }

            /* FORWARD-NAV FADE (default — link clicks).
               Sequenced: old fades to 0 with tight ease-in, new fades
               from 0 with a 140ms backwards-fill delay. Perceived
               overlap window ~40ms — below the human flicker threshold.
               Reads as a clean dissolve. */
            ::view-transition-old(root) {
                animation: vt-old-fade-out 180ms cubic-bezier(0.4, 0, 0.68, 0) forwards;
                mix-blend-mode: normal;
            }
            ::view-transition-new(root) {
                animation: vt-new-fade-in 200ms cubic-bezier(0.32, 0, 0.4, 1) 140ms backwards;
                mix-blend-mode: normal;
            }
            @keyframes vt-old-fade-out {
                from { opacity: 1; }
                to   { opacity: 0; }
            }
            @keyframes vt-new-fade-in {
                from { opacity: 0; }
                to   { opacity: 1; }
            }

            /* BACK-NAV FADE (v1.49.26 — short + unintrusive).
               Tagged via <html class="nav-back-forward"> in the head
               script. A quick simultaneous crossfade (~150ms total) is
               enough motion to feel intentional without belabouring the
               return — the user said "just a short quick unintrusive
               exit fade." Scroll position is restored synchronously in
               the head's pagereveal handler BEFORE the snapshot is
               captured, so the fade plays at the correct scroll
               position from frame one (no "hero shown then jump"). */
            html.nav-back-forward::view-transition-old(root) {
                animation: vt-old-fade-out 110ms cubic-bezier(0.4, 0, 0.7, 0.2) forwards;
            }
            html.nav-back-forward::view-transition-new(root) {
                animation: vt-new-fade-in 150ms cubic-bezier(0.3, 0.7, 0.4, 1) forwards;
            }

            /* Brand wordmark morph (v1.49.27). Both pages have the same
               wordmark text ("Morning Star / Christian Church"), just at
               different fixed positions:
                  home    → inside .nav-shell at top:16px + padding
                  subpage → standalone at top:24px centered
               With view-transition-name: site-brand on both, the
               browser interpolates the brand between positions/sizes
               over the transition duration. It glides from home's
               in-nav-pill spot to subpage's centered-top spot (and
               reverse), fading from its old appearance to its new one
               as it moves. This is the "logo in the nav moves into the
               position of the logo in the sub pages" the user asked
               to keep. The back button is part of the root fade — it
               only exists on subpages, so on forward nav it fades in
               with the page and on back nav fades out with it. */
            .brand,
            .subpage-brand {
                view-transition-name: site-brand;
            }
            /* Match the brand morph duration to the root fade so they
               finish on the same beat. Smooth ease-out so the brand
               decelerates into its final position. */
            ::view-transition-group(site-brand) {
                animation-duration: 360ms;
                animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
            }
            ::view-transition-old(site-brand) {
                animation: vt-old-fade-out 220ms cubic-bezier(0.4, 0, 0.68, 0) forwards;
            }
            ::view-transition-new(site-brand) {
                animation: vt-new-fade-in 280ms cubic-bezier(0.22, 1, 0.36, 1) 80ms backwards;
            }
            /* Back-nav compresses the brand morph to match the shorter
               back-fade. */
            html.nav-back-forward::view-transition-group(site-brand) {
                animation-duration: 160ms;
            }
            html.nav-back-forward::view-transition-old(site-brand) {
                animation: vt-old-fade-out 110ms cubic-bezier(0.4, 0, 0.7, 0.2) forwards;
            }
            html.nav-back-forward::view-transition-new(site-brand) {
                animation: vt-new-fade-in 150ms cubic-bezier(0.3, 0.7, 0.4, 1) forwards;
            }

            /* "Play here -> watch over there" hero morph (v-video-handoff).
               The home latest-video frame is tagged view-transition-name:
               watch-hero in JS the instant its play button is tapped; the
               /watch feature player carries the same name (below). On the
               resulting navigation the browser captures both and interpolates
               the video box from the home card straight into the watch
               feature slot, while everything else crossfades (root) — the
               video appears to keep playing as the new page assembles around
               it. Only the /watch surfaces define an element with this name,
               so it is inert on every other page. Slightly longer + softer
               than the brand morph so the larger travel reads as deliberate. */
            .vplayer--feature .vplayer-stage,
            .watch-feature-thumb {
                view-transition-name: watch-hero;
            }
            ::view-transition-group(watch-hero) {
                animation-duration: 460ms;
                animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
            }
            ::view-transition-old(watch-hero) {
                animation: vt-old-fade-out 300ms cubic-bezier(0.4, 0, 0.68, 0) forwards;
            }
            ::view-transition-new(watch-hero) {
                animation: vt-new-fade-in 420ms cubic-bezier(0.22, 1, 0.36, 1) 60ms backwards;
            }

            @media (prefers-reduced-motion: reduce) {
                ::view-transition-old(root),
                ::view-transition-new(root),
                ::view-transition-old(site-brand),
                ::view-transition-new(site-brand),
                ::view-transition-group(site-brand),
                ::view-transition-old(watch-hero),
                ::view-transition-new(watch-hero),
                ::view-transition-group(watch-hero) {
                    animation: none;
                }
            }

            section {
                width: 100%;
                opacity: 0;
                transform: translateY(8px);
                animation: gentleRise 600ms cubic-bezier(0.4, 0, 0.2, 1) both;
            }

            /* Stagger — quick, not draggy. 60ms between siblings, capped. */
            section:nth-of-type(1) { animation-delay: 0ms; }
            section:nth-of-type(2) { animation-delay: 60ms; }
            section:nth-of-type(3) { animation-delay: 120ms; }
            section:nth-of-type(4) { animation-delay: 180ms; }
            section:nth-of-type(5) { animation-delay: 240ms; }
            section:nth-of-type(6) { animation-delay: 300ms; }
            section:nth-of-type(n+7) { animation-delay: 320ms; }

            /* Skip the entrance on any non-fresh load (back/forward, refresh,
               same-origin nav, bfcache, hash-load). Set synchronously by the
               inline script in <head> before sections paint. */
            html.no-entrance section {
                opacity: 1;
                transform: none;
                animation: none;
            }

            @keyframes gentleRise {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* ============================================================
               HASHLOAD FADE-IN + SETTLE (v1.49.4)

               When a subpage opens with a #fragment URL, we skip the
               smooth-scroll entirely. The page-head inline script adds
               .hash-fade to html synchronously, before first paint, so
               main renders at opacity 0 + translateY(16px) — invisible
               and pushed 16px below its final spot.

               The subpage-header script then waits for window.load +
               fonts.ready + 2rAF + rIC, does an INSTANT scrollTo to
               the exact target position, and adds .hash-fade-in. CSS
               transitions opacity 0 → 1 and transform translateY(16px)
               → 0 over ~800ms with a strong easeOut curve — reads
               as the tail end of a smooth-scroll that's 98% done.

               Why this is better than smooth-scrolling from top:
                 • No long scroll animation that competes with main-
                   thread work or fights layout shifts (calendar
                   carousel mount on /outreach moves the target Y
                   while a smooth-scroll is in flight).
                 • The user sees motion only in the final landing,
                   so there's no "scrolled to wrong spot, then jumps"
                   visible.
                 • Predictable: instant scroll always lands accurate.

               Only <main> animates — subpage brand + back button stay
               anchored so chrome doesn't move during the entrance.
               ============================================================ */
            /* v1.49.6: motion direction flipped. translateY(-40px) → 0
               means everything starts 40px ABOVE its final position and
               slides DOWN into place — reads as "the page auto-scrolled
               DOWN to reveal this section, signifying there's more
               content above."

               v1.49.26: per the user, exclude the subpage brand and
               back button from the entrance slide. The chrome elements
               stay anchored at their fixed positions while ONLY the
               page content (main + footer) slides in. The .subpage-top-fog
               is also held still — it's the background haze for the
               brand/back, so animating it independently would leave the
               brand floating over a moving fog. (Brand and back keep
               their own opacity at 1 throughout — they paint visible
               from the start.) */
            html.hash-fade main,
            html.hash-fade footer {
                opacity: 0;
                transform: translateY(-40px);
            }

            html.hash-fade.hash-fade-in main,
            html.hash-fade.hash-fade-in footer {
                opacity: 1;
                transform: translateY(0);
                transition:
                    opacity 800ms cubic-bezier(0.16, 1, 0.3, 1),
                    transform 950ms cubic-bezier(0.16, 1, 0.3, 1);
            }
            /* (.subpage-brand, .subpage-back, .subpage-top-fog are
                intentionally NOT included in the hash-fade slide —
                see comment above. They stay solid throughout the
                entrance.) */

            @media (prefers-reduced-motion: reduce) {
                html.hash-fade main,
                html.hash-fade footer {
                    opacity: 1;
                    transform: none;
                    transition: none;
                }
            }

            /* ============================================================
               SCROLL-DRIVEN REVEALS — motion vocabulary

               Five distinct intent classes, each rooted in what the
               element is — not just where it sits. Per the design firm
               playbook: motion communicates meaning, so heading motion,
               card motion, image motion, and video motion are each
               their own thing.

                 .reveal-eyebrow  → category labels — short, light lead-in
                 .reveal-rise     → headings, prose, CTAs — settled slide
                 .reveal-settle   → cards being placed — translate + micro-
                                    rotate from the bottom-left corner so
                                    it reads as "set down on the table"
                 .reveal-photo    → images coming into focus — scale + blur
                                    fade, longer duration, like a darkroom
                                    print developing
                 .reveal-power    → focal media (video frame) — scale with
                                    a soft spring, like a screen powering on

               Progressive enhancement: hidden state lives behind the
               .js-reveals class on <html>, added by JS at runtime. No JS
               means content is fully visible — there is no hidden state.

               Reduced motion: every variant is reduced to "show, no
               transition" via the @media query at the end of this block.

               Stagger: per-element delays via the --reveal-delay CSS
               custom property, assigned by JS based on each element's
               index within its [data-reveal-group] parent.
               ============================================================ */
            .js-reveals .reveal-eyebrow,
            .js-reveals .reveal-rise,
            .js-reveals .reveal-rise-slow,
            .js-reveals .reveal-tight,
            .js-reveals .reveal-from-left,
            .js-reveals .reveal-from-right,
            .js-reveals .reveal-from-above,
            .js-reveals .reveal-photo,
            .js-reveals .reveal-power,
            .js-reveals .reveal-pop {
                opacity: 0;
                will-change: opacity, transform;
                transition-delay: var(--reveal-delay, 0ms);
            }
            /* .reveal-fill manages its own opacity in the rule above
               (it needs different transition properties than the rest of
               the variants, plus a ::before for the wipe). */
            /* Refined motion language (v1.46.5) — slower, still restrained.
               Single unified easing curve, no overshoots/springs, throw
               distances kept small. Durations are slower than v1.46.4
               (~30% longer) for a more deliberate, considered tempo.
               The variety still comes from WHICH transform (translate vs
               scale vs direction vs fill) and from duration, never from
               easing character.

               Easing: cubic-bezier(0.22, 1, 0.36, 1) — clean ease-out,
               smooth deceleration, no overshoot. Same curve everywhere. */

            /* Pure opacity — for very small labels that don't need to move. */
            .js-reveals .reveal-eyebrow {
                transition: opacity 600ms cubic-bezier(0.22, 1, 0.36, 1);
            }
            /* Section-heading eyebrow pills (Schedule, About, Outreach,
               Watch, Contact) get a directional lead-in: slide from the
               left with a small throw, then the heading prose rises in
               right after. Reads as "label arrives, then the heading
               settles in" and reinforces the read order. Scoped to
               .section-eyebrow so the schedule tab eyebrows
               (Sunday Gatherings, Bible Reading, etc.) keep their
               pure-opacity lead-in. Duration matches reveal-rise
               (720ms) so the eyebrow → heading cascade lands on the
               same beat. */
            .js-reveals .section-eyebrow.reveal-eyebrow {
                transform: translateX(-10px);
                transition: opacity 720ms cubic-bezier(0.22, 1, 0.36, 1),
                            transform 720ms cubic-bezier(0.22, 1, 0.36, 1);
            }
            /* Prose rise — small throw, considered timing. */
            .js-reveals .reveal-rise {
                transform: translateY(12px);
                transition: opacity 720ms cubic-bezier(0.22, 1, 0.36, 1),
                            transform 720ms cubic-bezier(0.22, 1, 0.36, 1);
            }
            /* Slow rise — for verses, leads. Longer duration carries weight. */
            .js-reveals .reveal-rise-slow {
                transform: translateY(12px);
                transition: opacity 1000ms cubic-bezier(0.22, 1, 0.36, 1),
                            transform 1000ms cubic-bezier(0.22, 1, 0.36, 1);
            }
            /* Tight follow — minimal throw for inner body text. */
            .js-reveals .reveal-tight {
                transform: translateY(6px);
                transition: opacity 580ms cubic-bezier(0.22, 1, 0.36, 1),
                            transform 580ms cubic-bezier(0.22, 1, 0.36, 1);
            }
            /* Directional — same easing/duration as rise, just different axis. */
            .js-reveals .reveal-from-left {
                transform: translateX(-10px);
                transition: opacity 800ms cubic-bezier(0.22, 1, 0.36, 1),
                            transform 800ms cubic-bezier(0.22, 1, 0.36, 1);
            }
            .js-reveals .reveal-from-right {
                transform: translateX(10px);
                transition: opacity 800ms cubic-bezier(0.22, 1, 0.36, 1),
                            transform 800ms cubic-bezier(0.22, 1, 0.36, 1);
            }
            /* From-above — small drop. */
            .js-reveals .reveal-from-above {
                transform: translateY(-10px);
                transition: opacity 900ms cubic-bezier(0.22, 1, 0.36, 1),
                            transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
            }
            /* Photo — slow scale + opacity. */
            .js-reveals .reveal-photo {
                transform: scale(0.97);
                transition: opacity 1000ms cubic-bezier(0.22, 1, 0.36, 1),
                            transform 1000ms cubic-bezier(0.22, 1, 0.36, 1);
            }
            /* Power — focal media. Same curve as photo, slightly faster. */
            .js-reveals .reveal-power {
                transform: scale(0.97);
                transition: opacity 900ms cubic-bezier(0.22, 1, 0.36, 1),
                            transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
            }
            /* Pop — small scale for non-button elements (e.g. form). */
            .js-reveals .reveal-pop {
                transform: scale(0.96);
                transition: opacity 620ms cubic-bezier(0.22, 1, 0.36, 1),
                            transform 620ms cubic-bezier(0.22, 1, 0.36, 1);
            }
            /* Fill — for buttons / CTAs. The button itself fades in via
               opacity (so IntersectionObserver fires correctly — clip-path
               or scale(0) on the host element makes the observer report
               isIntersecting: false even when the layout box is in view).
               A ::before pseudo-element paints over the button's gold
               with the page background and slides off to the right,
               creating the "fills in from left" feel.

               Layout is unaffected: ::before is absolutely positioned
               and its scaleX is purely visual.

               The host button keeps its existing background, text color,
               border, shadow — nothing about the button's appearance
               changes; the ::before just hides it initially. */
            .js-reveals .reveal-fill {
                opacity: 0;
                position: relative;
                isolation: isolate;
                overflow: hidden;
                transition: opacity 700ms cubic-bezier(0.22, 1, 0.36, 1);
                transition-delay: var(--reveal-delay, 0ms);
            }
            .js-reveals .reveal-fill::before {
                content: '';
                position: absolute;
                inset: 0;
                background: var(--bg-color, #faf8f5);
                transform: scaleX(1);
                transform-origin: right center;
                transition: transform 1100ms cubic-bezier(0.22, 1, 0.36, 1);
                /* Start the wipe a moment after the button starts fading in,
                   so the user sees the button's outline arrive, then the
                   gold flow in to fill it. */
                transition-delay: calc(var(--reveal-delay, 0ms) + 200ms);
                border-radius: inherit;
                pointer-events: none;
                z-index: 2;
                will-change: transform;
            }
            .js-reveals .reveal-fill.is-revealed {
                opacity: 1;
            }
            .js-reveals .reveal-fill.is-revealed::before {
                transform: scaleX(0);
            }

            /* Resolved state — applies to every variant uniformly.
               .reveal-fill handles its own resolved state via the
               clip-path rule above; including it here would set opacity
               but it never went to 0 anyway.

               will-change: auto on .is-revealed releases the compositor
               layer that the hidden state pinned. Leaving will-change
               applied indefinitely creates a permanent GPU layer per
               reveal element, which on iOS Safari causes scroll stutter
               and the occasional "page jumps to a new frame" repaint
               when layers get evicted under memory pressure. */
            .js-reveals .reveal-eyebrow.is-revealed,
            .js-reveals .reveal-rise.is-revealed,
            .js-reveals .reveal-rise-slow.is-revealed,
            .js-reveals .reveal-tight.is-revealed,
            .js-reveals .reveal-from-left.is-revealed,
            .js-reveals .reveal-from-right.is-revealed,
            .js-reveals .reveal-from-above.is-revealed,
            .js-reveals .reveal-photo.is-revealed,
            .js-reveals .reveal-power.is-revealed,
            .js-reveals .reveal-pop.is-revealed {
                opacity: 1;
                transform: none;
                will-change: auto;
            }

            /* (Removed: ken-burns infinite drift animation on the active
               banner slide. v1.46.1's 14s alternate scale+translate kept
               running while the section scrolled past, contributing a
               LoAF spike to perf scroll measurements. The reveal-power
               settle is what carries the "this is the focal image"
               signal — the continuous drift was redundant cost.) */

            /* Backwards-compat shim — the older .reveal / .reveal-scale
               classes used by earlier home-body markup map to the new
               vocabulary so nothing breaks if a class wasn't renamed. */
            .js-reveals .reveal { /* maps to reveal-rise */
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 760ms cubic-bezier(0.22, 1, 0.36, 1),
                            transform 760ms cubic-bezier(0.22, 1, 0.36, 1);
                transition-delay: var(--reveal-delay, 0ms);
            }
            .js-reveals .reveal-scale { /* maps to reveal-photo (compositor-cheap variant) */
                opacity: 0;
                transform: scale(0.94);
                transition: opacity 1100ms cubic-bezier(0.22, 1, 0.36, 1),
                            transform 1100ms cubic-bezier(0.22, 1, 0.36, 1);
                transition-delay: var(--reveal-delay, 0ms);
            }
            .js-reveals .reveal.is-revealed,
            .js-reveals .reveal-scale.is-revealed {
                opacity: 1;
                transform: none;
                filter: none;
            }

            /* Non-fresh visits (back/forward, reload, same-origin nav): show
               reveals immediately with NO transition. The reveal observer adds
               .is-revealed synchronously under html.no-entrance, but without
               this rule the long opacity transitions still animated from 0 —
               a visible flash when scroll restore drops the user mid-page. */
            html.no-entrance.js-reveals .reveal,
            html.no-entrance.js-reveals .reveal-scale,
            html.no-entrance.js-reveals .reveal-eyebrow,
            html.no-entrance.js-reveals .reveal-rise,
            html.no-entrance.js-reveals .reveal-rise-slow,
            html.no-entrance.js-reveals .reveal-tight,
            html.no-entrance.js-reveals .reveal-from-left,
            html.no-entrance.js-reveals .reveal-from-right,
            html.no-entrance.js-reveals .reveal-from-above,
            html.no-entrance.js-reveals .reveal-photo,
            html.no-entrance.js-reveals .reveal-power,
            html.no-entrance.js-reveals .reveal-pop,
            html.no-entrance.js-reveals .reveal-fill {
                opacity: 1;
                transform: none;
                transition: none;
                clip-path: none;
                -webkit-clip-path: none;
            }

            /* Reduced-motion: skip every variant. Show content immediately. */
            @media (prefers-reduced-motion: reduce) {
                .js-reveals .reveal,
                .js-reveals .reveal-scale,
                .js-reveals .reveal-eyebrow,
                .js-reveals .reveal-rise,
                .js-reveals .reveal-rise-slow,
                .js-reveals .reveal-tight,
                .js-reveals .reveal-from-left,
                .js-reveals .reveal-from-right,
                .js-reveals .reveal-from-above,
                .js-reveals .reveal-photo,
                .js-reveals .reveal-power,
                .js-reveals .reveal-pop,
                .js-reveals .reveal-fill {
                    opacity: 1;
                    transform: none;
                    transition: none;
                    clip-path: none;
                    -webkit-clip-path: none;
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
                border-radius: var(--radius-xl);
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
                border-radius: var(--radius-pill);
                text-transform: uppercase;
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wider);
                color: var(--text-primary-muted);
                box-shadow: var(--shadow-md);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.5);
                transition: all 0.4s var(--ease-standard);
                animation: float 3s ease-in-out infinite;
            }

            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-8px); }
            }

            .hero .hero-tagline {
                font-family: var(--font-display);
                font-size: var(--text-hero);
                line-height: var(--leading-tight);
                letter-spacing: var(--tracking-tight);
                color: var(--text-primary);
                font-weight: var(--weight-bold);
                margin-top: 0.5vh;
                text-shadow: 0 8px 24px var(--text-primary-hairline),
                             0 4px 8px var(--text-primary-hairline);
            }

            .hero p {
                max-width: 640px;
                font-size: var(--text-lead);
                color: var(--text-primary-muted);
                line-height: var(--leading-loose);
            }

            .cta-group {
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
            }

            /* .btn / .btn-primary / .btn-secondary / .btn-contact /
               .btn-watch-gold were removed in v1.57.0. They duplicated
               .event-link-btn (canonical CTA) with raw-value drift. The
               only HTML usage of .btn .btn-primary was migrated to
               .event-link-btn; .btn-contact and .btn-watch-gold had no
               HTML usages. .btn-secondary's role is filled by
               .event-link-btn.event-link-btn-secondary. */

            /* Section Headers */
            /* Editorial section eyebrow (v1.62.55).
               Flat typography — no pill chrome. The previous pill (white
               background + border + shadow + blur) read as a button on
               every section opener, indistinguishable from the CONTACT
               pill in the nav-shell and the PLAN A VISIT CTA. Per the
               editorial bar (Aesop / Monocle / Apple-About: light on
               chrome, content sits on the warm-cream surface) these
               should be quiet typographic labels, not chips. */
            .section-eyebrow {
                display: inline-flex;
                text-transform: uppercase;
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wider);
                color: var(--text-primary-faint);
                margin-bottom: 32px;
            }

            .section-heading {
                font-family: var(--font-display);
                font-size: var(--text-title);
                color: var(--text-primary);
                margin-bottom: 24px;
                max-width: 800px;
                font-weight: var(--weight-bold);
                line-height: var(--leading-tight);
                letter-spacing: var(--tracking-tight);
            }
            /* h2 demotion — subpage section titles (and home section h2s) drop
               to --text-section (40px max) so the page h1 stays dominant.
               Before this rule h1.section-heading and h2.section-heading were
               both --text-title (52px max), which collapsed the hierarchy and
               made every subpage read as a stack of equally-weighted titles. */
            h2.section-heading {
                font-size: var(--text-section);
            }

            .section-lead {
                max-width: 720px;
                color: var(--text-primary-muted);
                font-size: var(--text-lead);
                margin-bottom: 16px;
                line-height: var(--leading-loose);
            }

            /* ============================================================
               SHARED SUBPAGE EDITORIAL PRIMITIVES — v1.62.27
               Three classes any subpage can opt into when it wants the
               same editorial treatment /ministries got in v1.62.25–26.
               Keeping them here (instead of per-page inline blocks)
               means every subpage stays visually consistent and small
               edits compound across the site.

               1. .subpage-intro-lead — promoted body for the FIRST
                  paragraph after a subpage's h1. .section-lead's default
                  treatment is --text-primary-muted (.72 alpha) at
                  --text-lead size, tuned for secondary leads. On a
                  subpage intro the first paragraph IS the lede — it
                  carries the page's voice. Bumped to clamp(18-22px),
                  --text-primary-soft (.85 alpha), 60ch line-cap so the
                  ledes on /about, /beliefs, /outreach, /visit,
                  /ministries all read as ledes, not as captions.

               2. .motto — inline italic gold for stated identity
                  phrases like "Mending the Broken". Italic Playfair
                  display cut is calligraphic; gold ties the phrase
                  into the same accent thread the eyebrows / address
                  pills / CTA pills carry. Drop ASCII quotes when
                  applying it — italics convey "this is a stated
                  motto" by themselves; quotes are redundant chrome.

               3. .subpage-final-cta — flush closing-CTA layout
                  replacing the inherited .section-card.visit-final-cta
                  box on every subpage. Card vocabulary was lifted
                  from /home where it makes sense (a card amid a card-
                  driven page); on subpages every other section sits
                  flush on the warm-cream surface and a single closing
                  card reads as a stray ad block. Flex column with
                  align-items: flex-start so the gold pill respects
                  .teaser-cta's intrinsic sizing (.event-link-btn base
                  width: 100% would otherwise stretch it to full row).
               ============================================================ */
            .subpage-intro-lead {
                font-family: var(--font-body);
                font-size: clamp(18px, 1.5vw, 22px);
                line-height: var(--leading-loose);
                color: var(--text-primary-soft);
                max-width: 60ch;
                margin: 0 0 var(--space-xl);
            }
            .motto {
                font-style: italic;
                color: var(--gold-dark);
                letter-spacing: 0;
            }
            .subpage-final-cta {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                margin-top: var(--space-2xl);
            }
            .subpage-final-cta-lead {
                font-family: var(--font-body);
                font-size: var(--text-lead);
                line-height: var(--leading-loose);
                color: var(--text-primary-soft);
                max-width: 60ch;
                margin: var(--space-md) 0 var(--space-lg);
            }
            .subpage-final-cta .event-link-btn.teaser-cta {
                margin-top: 0;
            }
            /* CTA row variant — for closing blocks with multiple buttons
               (/about closes with primary + 2 secondaries). The buttons
               can still wrap on narrow viewports via .subpage-cta-row
               which is defined elsewhere; this rule just tightens the
               row's relationship to the lede above it. */
            .subpage-final-cta .subpage-cta-row {
                margin-top: 0;
            }

            /* ---- .subpage-jump — inline TOC chips under the lede ----
               Editorial section break: hairline rule above + small-caps
               anchor chips below. Used on every subpage that has more
               than one named section so a reader can survey what's on
               the page before scrolling.

               History:
                 v1.62.58 — middots between chips. Bug: row wrapped
                   on narrow with one chip alone on row 2 + leading
                   orphan dot.
                 v1.62.59 — dropped middots; gap-only. Still had the
                   solo-chip wrap (no orphan dot but unbalanced row).
                 v1.62.60 — middots restored + in-DOM break element
                   forced a balanced 3+2 / 2+2 wrap on narrow. A
                   verification panel then read the deliberate wrap
                   as "wrap-of-convenience" — composed at first
                   glance, but two stacked rows still felt template-
                   default to the editorial eye.
                 v1.62.61 (this) — single row by default at every
                   viewport via aggressive shrink on narrow widths.
                   The font, tracking, and inter-chip gap all scale
                   down with viewport width (clamp) so the five
                   /ministries chips fit on one line from 360px up.
                   At ≤360 (where the chips genuinely overflow even
                   at the smallest readable shrink) the in-DOM break
                   element activates as a fallback for a balanced
                   wrap. The break stays hidden everywhere else.

               Treatment:
                 • Gold-dark small-caps text; gold middots between
                   adjacent chips.
                 • Hover: color deepens + scaleX(0→1) gold underline.
                 • Wide (>960px): full --text-eyebrow, --tracking-wider,
                   --space-lg column gap. Left-aligned.
                 • Narrow (≤960px): font, tracking, and gap clamp
                   down with viewport so the row fits on one line.
                   Center-aligned.
                 • Very narrow (≤360px): break element activates;
                   chips wrap to a centered 3+2 (/ministries) or 2+2
                   (/about, /visit). Adjacent-sibling rule on the
                   middot means the chip after the break has no
                   leading dot. */
            .subpage-jump {
                display: flex;
                flex-wrap: wrap;
                align-items: baseline;
                column-gap: var(--space-lg);
                row-gap: var(--space-sm);
                margin-top: var(--space-md);
                padding-top: var(--space-md);
                border-top: 1px solid var(--text-primary-hairline);
            }
            .subpage-jump a {
                font-family: var(--font-body);
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wider);
                text-transform: uppercase;
                color: var(--gold-dark);
                text-decoration: none;
                position: relative;
                padding: 4px 0;
                transition: color var(--motion-medium) var(--ease-out-soft);
            }
            /* Middot separator between adjacent chips. Position is
               absolute, sitting in the column-gap to the LEFT of the
               chip. Because the selector requires an <a> immediately
               before, the rule does NOT fire for the chip following
               .subpage-jump-break — that chip has the break as its
               previous sibling, not an <a>, so no leading dot. */
            .subpage-jump a + a::before {
                content: '·';
                position: absolute;
                left: calc(var(--space-lg) * -0.5);
                top: 4px;
                transform: translateX(-50%);
                color: var(--text-primary-fade);
                pointer-events: none;
            }
            /* Hover-only underline. scaleX origin-left so the line
               draws under the glyphs as the user lands on the chip. */
            .subpage-jump a::after {
                content: '';
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                height: 1px;
                background: var(--gold);
                transform: scaleX(0);
                transform-origin: left center;
                transition: transform var(--motion-medium) var(--ease-out-soft);
            }
            .subpage-jump a:hover,
            .subpage-jump a:focus-visible {
                color: var(--gold-deeper);
            }
            .subpage-jump a:hover::after,
            .subpage-jump a:focus-visible::after {
                transform: scaleX(1);
            }
            /* Deliberate wrap-break element. Hidden by default. Only
               activates at the narrowest viewports (≤360px) where the
               chips genuinely overflow even at the smallest readable
               shrink. The chip immediately after this element does NOT
               inherit the a+a::before middot, so row 2 never starts
               with a dot. */
            .subpage-jump-break {
                display: none;
            }
            @media (prefers-reduced-motion: reduce) {
                .subpage-jump a,
                .subpage-jump a::after {
                    transition: none;
                }
            }
            @media (max-width: 960px) {
                /* Mobile chip rhythm matches desktop's left-anchor
                   spine. Type stays at full --text-eyebrow /
                   --tracking-wider — that's the editorial-baseline
                   size the user benchmarked against (the iPhone 17
                   Pro Max target screenshot). Column-gap matches the
                   editorial chip rhythm. Wrap (the per-page
                   deliberate break below) is the fallback when the
                   row can't fit, not typographic shrink. Row 2's
                   first chip sits directly under row 1's first chip
                   so the eye drops down one axis with no re-anchor;
                   the right-side void on a short wrap row reads as
                   intentional editorial air, the same shape Aesop /
                   Monocle / NYer category navs use. */
                .subpage-jump {
                    --jump-gap: var(--space-md);
                    column-gap: var(--jump-gap);
                }
                .subpage-jump a + a::before {
                    left: calc(var(--jump-gap) * -0.5);
                }
            }
            /* Per-page break thresholds (v1.62.64). Type is at full
               --text-eyebrow + --weight-bold + --tracking-wider on
               every viewport (matches the .section-eyebrow style
               the user benchmarked against). Natural fit per page:
                 /ministries (5 chips) wraps up to ~439 → break ≤439
                 /about (4 short chips) wraps only at 320 → break ≤320
                 /visit (4 chips, BEFORE YOU COME long) wraps up to
                   ~479 → break ≤479
               Row-gap tightens to 6px whenever the break fires so
               the two wrapped rows read as one cohesive index.
               The chip immediately after .subpage-jump-break has
               the break (not an <a>) as its previous sibling, so
               the a+a::before middot rule correctly skips it — no
               orphan dot at the start of row 2. */
            @media (max-width: 479px) {
                /* /visit only — .subpage-jump--long-chip handles the
                   wider wrap range caused by "Before You Come". */
                .subpage-jump--long-chip {
                    row-gap: 6px;
                }
                .subpage-jump--long-chip .subpage-jump-break {
                    display: block;
                    flex-basis: 100%;
                    height: 0;
                }
            }
            @media (max-width: 439px) {
                /* /ministries — 5 chips wrap up to ~439, single
                   line at 440+ (iPhone 17 Pro Max territory). */
                .subpage-jump:not(.subpage-jump--short-set):not(.subpage-jump--long-chip) {
                    row-gap: 6px;
                }
                .subpage-jump:not(.subpage-jump--short-set):not(.subpage-jump--long-chip) > .subpage-jump-break {
                    display: block;
                    flex-basis: 100%;
                    height: 0;
                }
            }
            @media (max-width: 320px) {
                /* /about's 4 short chips only fail to fit at the
                   very narrowest legacy phone widths. */
                .subpage-jump--short-set {
                    row-gap: 6px;
                }
                .subpage-jump--short-set .subpage-jump-break {
                    display: block;
                    flex-basis: 100%;
                    height: 0;
                }
            }

            @media (max-width: 960px) {
                .subpage-intro-lead {
                    font-size: clamp(17px, 4.6vw, 19px);
                    margin: 0 0 var(--space-lg);
                }
                .subpage-final-cta-lead {
                    font-size: var(--text-body);
                }
                .subpage-jump {
                    /* gap is managed by the .subpage-jump @media
                       blocks above (column-gap clamps with viewport,
                       row-gap tightens at ≤364px). Don't override
                       it here or the cascade order kills both. */
                    margin-top: var(--space-sm);
                    padding-top: var(--space-sm);
                }
            }

            address {
                font-style: normal;
                font-size: var(--text-eyebrow);
                letter-spacing: var(--tracking-wider);
                text-transform: uppercase;
                color: var(--text-primary-faint);
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
                transition: text-decoration-color var(--motion-medium) ease;
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
                background: var(--surface);
                border-radius: var(--radius-md);
                box-shadow: var(--shadow-md);
                padding: 8px;
                min-width: 200px;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transform: translateX(-50%) translateY(-8px);
                transition: all var(--motion-fast) var(--ease-standard);
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
                border-radius: var(--radius-sm);
                cursor: pointer;
                transition: background var(--motion-fast) ease;
                text-decoration: none;
                color: var(--text-primary);
                font-size: var(--text-small);
                font-weight: var(--weight-medium);
                letter-spacing: var(--tracking-normal);
                text-transform: none;
            }
            
            .address-dropdown-item:hover {
                background: color-mix(in srgb, var(--gold) 10%, transparent);
            }
            
            .address-dropdown-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                color: var(--gold-dark);
            }
            .address-dropdown-icon svg {
                width: 18px;
                height: 18px;
            }
            
            /* Hero "Plan a Visit" CTA wrapper. Positions the canonical
               .event-link-btn at the bottom of the hero image on desktop;
               flex-centered so the auto-width pill sits in the middle
               instead of stretching edge-to-edge. The visual styling lives
               on .event-link-btn itself (v1.57.0 unified the hero CTA with
               the rest of the site's gold pill family). */
            .find-us-wrapper {
                position: absolute;
                bottom: 24px;
                left: 16px;
                right: 16px;
                z-index: 100;
                display: flex;
                justify-content: center;
            }

            /* Schedule Section */
            .section-card {
                background: rgba(255, 255, 255, 0.85);
                border-radius: var(--radius-2xl);
                padding: 56px 64px;
                box-shadow: var(--shadow-xl);
                border: 1px solid rgba(255, 255, 255, 0.6);
                backdrop-filter: blur(20px);
                transition: all var(--motion-slow) var(--ease-standard);
            }

            .section-card:hover {
                box-shadow: var(--shadow-xl);
                transform: translateY(-4px);
            }

            .schedule-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                gap: 32px;
            }

            .schedule-item {
                background: rgba(255, 255, 255, 0.9);
                border-radius: var(--radius-xl);
                padding: var(--space-md);
                box-shadow: var(--shadow-lg);
                border: 1px solid rgba(255, 255, 255, 0.6);
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--space-md);
                align-items: center;
                transition: all 0.4s var(--ease-standard);
            }

            /* Hover lift removed from base .schedule-item — these cards are
               informational, not interactive. Lift remains on
               .schedule-item.teaser-link-card (defined below) where the card
               is actually a link. */

            /* Alternate sides: odd items keep text-left, even items get image-left */
            .schedule-item:nth-child(even) .schedule-item-image {
                order: -1;
            }

            .schedule-item-text {
                display: grid;
                gap: 14px;
                padding: var(--space-xs);
                min-width: 0;
            }

            .schedule-item-image {
                aspect-ratio: 1 / 1;
                border-radius: var(--radius-lg);
                overflow: hidden;
            }
            .schedule-item-image picture {
                display: block;
                width: 100%;
                height: 100%;
            }
            .schedule-item-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }

            /* /about Leadership: editorial split, NO enclosing card
               (v1.62.35). Previous markup nested .schedule-item inside
               .section-card, producing a double-card pattern — outer
               cream panel + inner rounded image frame — that read as
               a SaaS widget rather than editorial content and clashed
               with the flush surface vocabulary the rest of the site
               adopted in v1.62.27 (/ministries, /visit Find Us, /about
               and /beliefs closing CTAs, etc.).

               Now: simple grid, image carries its own rounded frame +
               soft shadow (single frame, no nesting), text reads as
               full-width paragraphs beside it. Same shape as the
               /visit Find Us split (7fr text / 5fr image, vertically
               centered, mobile stacks with image-on-top). */
            .leadership-split {
                display: grid;
                grid-template-columns: 7fr 5fr;
                gap: var(--space-2xl);
                align-items: center;
                margin-top: var(--space-xl);
            }
            .leadership-text {
                display: flex;
                flex-direction: column;
                gap: var(--space-md);
            }
            .leadership-text p {
                margin: 0;
                color: var(--text-primary-muted);
                font-size: var(--text-body);
                line-height: var(--leading-loose);
            }
            .leadership-portrait {
                width: 100%;
                aspect-ratio: 4 / 5;
                max-height: 480px;
                border-radius: var(--radius-xl);
                overflow: hidden;
                box-shadow: var(--shadow-md);
                margin: 0 auto;
            }
            .leadership-portrait picture,
            .leadership-portrait img {
                width: 100%;
                height: 100%;
                display: block;
            }
            .leadership-portrait img {
                object-fit: cover;
                /* Bias the crop up so the pastor's face lands in the
                   upper third of the visible window when the 4/5
                   container caps the height. */
                object-position: center 20%;
            }
            @media (max-width: 960px) {
                .leadership-split {
                    grid-template-columns: 1fr;
                    gap: var(--space-lg);
                    margin-top: var(--space-md);
                }
                .leadership-portrait {
                    order: -1;
                    max-width: 380px;
                    max-height: 480px;
                }
            }

            /* Leadership "Send us a message" link — gold inline-link
               treatment matching the entry CTAs across /ministries and
               /outreach. */
            .leadership-cta-row {
                margin-top: var(--space-sm);
            }
            .leadership-cta {
                color: var(--gold);
                font-weight: var(--weight-semibold);
                text-decoration: none;
            }
            .leadership-cta:hover {
                text-decoration: underline;
                text-underline-offset: 4px;
            }

            /* Placeholder tiles — used while real photography is in flight.
               Previously these had a dashed border and cool-gray gradient that
               screamed "draft / missing image" and broke the polish of the
               surrounding page. Restyled as warm-cream tiles that feel like
               an intentional surface tone, with a faint gold accent and no
               dashed chrome. When a real <img> replaces the placeholder the
               transition is invisible. */
            .schedule-item-image-placeholder {
                background:
                    radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--gold) 8%, transparent) 0%, transparent 60%),
                    linear-gradient(180deg, color-mix(in srgb, var(--bg) 96%, var(--gold) 4%) 0%, color-mix(in srgb, var(--bg) 88%, var(--gold) 6%) 100%);
                display: grid;
                place-items: center;
                color: var(--text-primary-fade);
            }

            .schedule-item-image-placeholder svg {
                width: 22%;
                max-width: 44px;
                height: auto;
                opacity: 0.4;
            }

            /* ============================================================
               SCHEDULE LAYOUT — banner image carousel (left) + vertical
               card tab list (right). Cards drive the banner: clicking any
               tab crossfades the banner to the matching slide. On mobile
               the banner sits on top and the card list stacks below.
               No .section-card wrapper — the layout sits directly on the
               page background (v1.47.3) for a quieter editorial feel,
               matching the About teaser.
               ============================================================ */
            .schedule-layout {
                display: grid;
                grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
                gap: var(--space-lg);
                align-items: stretch;
            }
            /* Banner (desktop): no longer a single crossfading slide.
               Five small "photo" tiles in a curated, slightly irregular
               composition. Each tile has its own rotation + position so
               the arrangement reads as "pinned" rather than gridded.
               Hover (or sync-active from the matching card) lifts the
               tile, un-rotates it, scales it up, and casts a gold-tinted
               drop shadow; the matching card gets an intensified gold
               underglow. */
            .schedule-banner {
                position: relative;
                border-radius: var(--radius-lg);
                overflow: visible;
                min-height: 520px;
                /* Subtle ambient warm wash behind the tiles so the
                   collage sits on something instead of floating on
                   pure white. Plus extra top/side padding so a hover-
                   scaled tile (1.25x) doesn't get clipped by the
                   section-card edges. */
                background:
                    radial-gradient(ellipse 75% 65% at 50% 50%,
                        rgba(212, 165, 116, 0.09) 0%,
                        rgba(212, 165, 116, 0.03) 55%,
                        transparent 100%);
                padding: 24px 12px 32px;
                isolation: isolate;
            }
            /* Override the global .reveal-power container fade on the
               schedule banner — the tiles inside do their own toss-in
               entrance and we don't want a parent scale/opacity ride
               on top of that. The banner is always visible; only the
               tiles inside animate. */
            .js-reveals .schedule-banner.reveal-power {
                opacity: 1;
                transform: none;
                will-change: auto;
            }
            .schedule-banner-slide {
                /* Each tile is a positioned "photo" — clean print
                   frame: tight white border (paper edge), soft layered
                   shadow, slight tint of warmth. */
                position: absolute;
                border-radius: 3px;
                overflow: hidden;
                background: #fefcf6;
                padding: 5px;
                box-shadow:
                    0 14px 30px var(--text-primary-hairline),
                    0 5px 12px var(--text-primary-hairline),
                    0 1px 3px var(--text-primary-hairline);
                cursor: pointer;
                transition:
                    transform 480ms cubic-bezier(0.22, 1, 0.36, 1),
                    box-shadow 480ms cubic-bezier(0.22, 1, 0.36, 1),
                    opacity 320ms cubic-bezier(0.22, 1, 0.36, 1),
                    filter 320ms cubic-bezier(0.22, 1, 0.36, 1);
                /* Toss-in entrance: tiles start at opacity 0, scaled
                   small, rotated wildly, and translated up. When the
                   banner's reveal-power observer fires .is-revealed,
                   each tile animates IN one by one with the tossIn
                   keyframes (see below). Without JS the banner is
                   shown via the .js-reveals fallback so the tiles end
                   up at opacity 1 anyway. */
                opacity: 0;
                pointer-events: auto;
                will-change: transform;
            }
            /* Toss-in animation — tiles fly UP from below the viewport
               and land into their at-rest positions, one by one.
               Designed to feel like a real physical toss: starts with
               an upward velocity (fast rise), decelerates as it
               approaches the target, slight overshoot past the final
               position, then a small counter-settle back through
               center. Rotation during travel is gentle — a real
               tossed photo doesn't spin wildly, it just travels and
               wobbles into place. Keyframes use calc() on the tile's
               --rot custom property so each tile lands at its proper
               at-rest rotation. */
            @keyframes tossIn {
                0% {
                    opacity: 0;
                    /* Start: well below the final position (large
                       enough to be off-screen on most viewports),
                       scaled slightly smaller, rotated a few degrees
                       off the at-rest rotation. */
                    transform: rotate(calc(var(--rot, 0deg) + 8deg)) scale(0.7) translateY(340px);
                }
                30% {
                    /* Rising — opacity fully on, tile is most of the
                       way up but still below target. */
                    opacity: 1;
                }
                62% {
                    /* Overshoot above the resting position — tile
                       arrives with momentum and goes slightly past
                       final, scale slightly larger, rotation pulled
                       back through final by a couple degrees. */
                    opacity: 1;
                    transform: rotate(calc(var(--rot, 0deg) - 3deg)) scale(1.035) translateY(-10px);
                }
                82% {
                    /* Settle back through center with a tiny
                       counter-overshoot — feels like the toss is
                       absorbing the landing energy. */
                    transform: rotate(calc(var(--rot, 0deg) + 1deg)) scale(0.996) translateY(2px);
                }
                100% {
                    opacity: 1;
                    transform: rotate(var(--rot, 0deg)) scale(1) translateY(0);
                }
            }
            /* Toss-in fires once when the banner enters the viewport
               (observer adds .is-revealed). Each tile has its own
               --toss-delay so the cascade lands one by one.
               Easing is a smooth ease-out so the upward motion feels
               like it's decelerating under gravity — the keyframes
               handle the small overshoot/settle on top. */
            .schedule-banner.is-revealed .schedule-banner-slide {
                animation: tossIn 820ms cubic-bezier(0.16, 0.84, 0.32, 1) var(--toss-delay, 0ms) forwards;
            }
            .schedule-banner-slide[data-index="0"] { --toss-delay:  100ms; }
            .schedule-banner-slide[data-index="1"] { --toss-delay:  240ms; }
            .schedule-banner-slide[data-index="2"] { --toss-delay:  380ms; }
            .schedule-banner-slide[data-index="3"] { --toss-delay:  520ms; }
            .schedule-banner-slide[data-index="4"] { --toss-delay:  660ms; }
            /* Skip the toss on non-fresh visits (back/forward, reload,
               same-origin nav). html.no-entrance section { animation:none }
               doesn't reach these — the slides are divs inside the section,
               so the cascade replayed on every back-navigation. */
            html.no-entrance .schedule-banner.is-revealed .schedule-banner-slide {
                animation: none;
                opacity: 1;
            }
            /* Reduced-motion: just fade tiles in, no toss. */
            @media (prefers-reduced-motion: reduce) {
                .schedule-banner.is-revealed .schedule-banner-slide {
                    animation: none;
                    opacity: 1;
                }
            }
            /* No-JS fallback: if .js-reveals never got added (script
               failure), .is-revealed will also never fire — show the
               tiles statically at their at-rest position so the page
               is still readable. */
            html:not(.js-reveals) .schedule-banner-slide {
                opacity: 1;
                animation: none;
            }
            /* Tile layout: five hand-tuned positions in DESCENDING
               vertical order so each tile sits roughly opposite its
               matching schedule card on the right. The card list is
               5 cards stacked from top to bottom, ~20% of the column
               height each; the tiles cascade down the left at the
               same vertical rhythm but alternate their horizontal
               position to keep the composition feeling natural rather
               than gridded.
               Each tile's transform composes its at-rest rotation
               with a tiny translateZ(0) to keep the layer on the GPU.
               The --rot custom property is the only thing that
               differs at rest, so the hover rule can reset it without
               re-stating position. */
            /* Tile layout — uniform tile size (38% × 4:5 portrait)
               with deliberate alternating cascade. Same placeholder
               on every tile, so visual interest comes from the
               composition (rotation, overlap, descending order
               matching the card list on the right) rather than from
               per-tile differences. Z-index ascends down the cascade
               so each tile sits slightly above the previous. */
            .schedule-banner-slide[data-index="0"] {
                top:  2%;  left:  8%; width: 38%; aspect-ratio: 4 / 5;
                --rot: -3deg;
                z-index: 1;
            }
            .schedule-banner-slide[data-index="1"] {
                top: 16%;  left: 50%; width: 38%; aspect-ratio: 4 / 5;
                --rot:  3deg;
                z-index: 2;
            }
            .schedule-banner-slide[data-index="2"] {
                top: 36%;  left: 16%; width: 38%; aspect-ratio: 4 / 5;
                --rot: -2deg;
                z-index: 3;
            }
            .schedule-banner-slide[data-index="3"] {
                top: 54%;  left: 52%; width: 38%; aspect-ratio: 4 / 5;
                --rot:  3deg;
                z-index: 4;
            }
            .schedule-banner-slide[data-index="4"] {
                top: 72%;  left: 14%; width: 38%; aspect-ratio: 4 / 5;
                --rot: -3deg;
                z-index: 5;
            }
            /* Wednesday hidden: the data-index="2" tile is dropped, leaving four
               tiles (indices 0,1,3,4). The four-card list is SHORTER than the
               five-card one, but each tile's height is fixed by its width — so the
               five-tile tops (…72%) made the bottom tile overflow the shorter
               banner and collide with the "Explore Our Ministries" CTA below.
               Re-cascade the four into tops that fit: each tile is ~37% of the
               banner height, so the bottom tile tops out at ~60% to stay inside.
               .schedule-layout--no-wed outranks the 5-tile defaults above.
               (Banner is desktop-only.) */
            /* Four tiles as a continuous DIAGONAL sweep (top-left → bottom-right).
               A 4-tile left/right zigzag pairs into a stacked 2×2 grid (two tiles
               share each column → looks jumbled), so instead each tile drifts
               steadily across and down: no two share a column, consecutive tiles
               corner-overlap into one flowing ribbon, and the sweep ends near the
               cards. Each tile still sits roughly inline with its card. */
            .schedule-layout--no-wed .schedule-banner-slide[data-index="0"] { top:  2%; left:  5%; width: 36%; --rot: -3deg; }
            .schedule-layout--no-wed .schedule-banner-slide[data-index="1"] { top: 21%; left: 44%; width: 36%; --rot:  3deg; }
            .schedule-layout--no-wed .schedule-banner-slide[data-index="3"] { top: 42%; left: 11%; width: 36%; --rot: -2deg; --toss-delay: 380ms; }
            .schedule-layout--no-wed .schedule-banner-slide[data-index="4"] { top: 60%; left: 48%; width: 36%; --rot:  3deg; --toss-delay: 520ms; }
            .schedule-banner-slide {
                transform: rotate(var(--rot, 0deg)) translateZ(0);
            }
            /* Active / hover state — the focal photo. Rises out of
               the composition with a gentle scale (1.25x), lifts
               up, un-rotates, casts a deep gold-tinted shadow. */
            .schedule-banner-slide:hover,
            .schedule-banner-slide.active {
                transform: rotate(0deg) translateY(-10px) scale(1.25);
                z-index: 30;
                box-shadow:
                    0 36px 64px rgba(212, 165, 116, 0.32),
                    0 16px 28px var(--text-primary-hairline),
                    0 2px 6px var(--text-primary-hairline);
                background: #ffffff;
            }
            /* Inactive tiles stay at full opacity — only the active tile
               lifts, scales, and glows. No dimming of the rest. */
            .schedule-banner-slide img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
                border-radius: var(--radius-sm);
            }
            /* Placeholder — the standard site placeholder style
               (cream gradient + dashed border + centered image icon),
               same as .schedule-item-image-placeholder elsewhere on
               the page. Rendered inside a ::after so the slide's white
               polaroid matte (the 5px padding around the photo area)
               still shows through. All five tiles use the SAME
               placeholder, so the wall reads as a clean uniform set
               waiting for real photos. */
            .schedule-banner-placeholder {
                box-sizing: border-box;
            }
            .schedule-banner-placeholder::after {
                content: '';
                position: absolute;
                inset: 5px;
                border-radius: 2px;
                background:
                    linear-gradient(135deg, rgba(212, 165, 116, 0.10) 0%, var(--text-primary-hairline) 100%),
                    linear-gradient(180deg, #eef0f5 0%, #e2e5ec 100%);
                border: 1px dashed var(--text-primary-hairline);
                pointer-events: none;
            }
            /* Center the image icon over the placeholder background. */
            .schedule-banner-placeholder svg {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 28%;
                max-width: 56px;
                min-width: 32px;
                height: auto;
                transform: translate(-50%, -50%);
                color: var(--text-primary-fade);
                z-index: 1;
            }

            /* Card list: vertical stack of tab buttons on desktop. */
            .schedule-list {
                display: flex;
                flex-direction: column;
                gap: var(--space-xs);
            }
            .schedule-tab {
                /* Reset button defaults */
                appearance: none;
                background: rgba(255, 255, 255, 0.78);
                border: 1px solid rgba(255, 255, 255, 0.6);
                border-radius: var(--radius-lg);
                padding: var(--space-md) var(--space-md);
                text-align: left;
                cursor: pointer;
                /* Flex column so the cta link can hug the bottom of the
                   card via margin-top: auto while the eyebrow/title/desc
                   stack at the top. */
                display: flex;
                flex-direction: column;
                gap: 10px;
                /* Positioning context for the stretched-link overlay on
                   .schedule-tab-cta::before (v1.58.0 — whole-card click
                   navigates to the matching /ministries anchor). */
                position: relative;
                font-family: inherit;
                color: inherit;
                box-shadow: var(--shadow-md);
                transition: background 280ms var(--ease-standard),
                            box-shadow 280ms var(--ease-standard);
                flex: 1 1 0;
                min-width: 0;
            }
            .schedule-tab:hover {
                background: rgba(255, 255, 255, 0.95);
                box-shadow: var(--shadow-md);
            }
            .schedule-tab:focus-visible {
                outline: 2px solid var(--gold);
                outline-offset: 3px;
            }
            /* Active state: solid white surface + warm gold underglow.
               The underglow intensifies when the matching banner tile
               is hovered (or the card itself is the active one) so the
               connection between photo and schedule entry reads clearly.
               No side accent — the heavier card weight + warm bloom is
               the indicator. */
            .schedule-tab.active {
                background: #ffffff;
                box-shadow:
                    0 24px 56px rgba(212, 165, 116, 0.38),
                    0 10px 22px rgba(212, 165, 116, 0.18),
                    0 4px 12px var(--text-primary-hairline);
                transform: translateY(-1px);
            }
            .schedule-tab {
                transition:
                    background 280ms cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 380ms cubic-bezier(0.22, 1, 0.36, 1),
                    transform 380ms cubic-bezier(0.22, 1, 0.36, 1);
            }
            /* Inactive cards stay at full opacity — only the active card
               carries the white surface + gold underglow. */
            .schedule-list .schedule-tab {
                transition:
                    background 280ms cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 380ms cubic-bezier(0.22, 1, 0.36, 1),
                    transform 380ms cubic-bezier(0.22, 1, 0.36, 1),
                    opacity 320ms cubic-bezier(0.22, 1, 0.36, 1);
            }
            /* Typography mirrors the site's existing .schedule-item span /
               h3 / p rules — same gray uppercase eyebrow, same Playfair
               heading, same loose-leading body — so the new tab cards
               read with the exact same voice as the rest of the page.
               The only override is bumping the eyebrow size: it's now
               the primary "what is this gathering" label and needs real
               visual weight. */
            .schedule-tab-eyebrow {
                text-transform: uppercase;
                letter-spacing: var(--tracking-wide);
                font-size: var(--text-small); /* larger than --text-eyebrow (10px) */
                font-weight: var(--weight-bold);
                color: var(--text-primary-faint);
            }
            .schedule-tab-title {
                font-size: var(--text-heading);
                font-weight: var(--weight-bold);
                color: var(--text-primary);
                font-family: var(--font-display);
                line-height: var(--leading-snug);
            }
            .schedule-tab-desc {
                color: var(--text-primary-muted);
                line-height: var(--leading-loose);
                font-size: var(--text-body);
            }
            .schedule-tab-link {
                color: var(--gold);
                text-decoration: underline;
                text-decoration-color: color-mix(in srgb, var(--gold) 50%, transparent);
                font-weight: var(--weight-bold);
                /* Sits above the .schedule-tab-cta::before whole-card click
                   overlay so the inline link (e.g. "Sunday School" inside
                   the Worship card description, linking to /ministries#kids)
                   stays independently clickable. */
                position: relative;
                z-index: 2;
            }
            .schedule-tab-link:hover {
                text-decoration-color: var(--gold);
                color: var(--gold-dark);
            }

            /* Corner "Learn more →" CTA — bottom-right of each card.
               Clicking anywhere on the card (other than the inline
               .schedule-tab-link, e.g. "Sunday School" in the Worship
               card) navigates to the cta's href. That behavior is
               JS-delegated (home-scripts.ts schedule-tab click handler)
               since <a> nested inside <button> doesn't reliably trigger
               native navigation from clicks outside the <a>'s own box. */
            .schedule-tab-cta {
                color: var(--gold);
                font-family: var(--font-body);
                font-weight: var(--weight-bold);
                font-size: var(--text-small);
                letter-spacing: var(--tracking-normal);
                text-decoration: none;
                white-space: nowrap;
                align-self: flex-end;   /* right-align inside the flex column */
                margin-top: auto;       /* push to bottom of any extra space */
                transition: color var(--motion-fast) var(--ease-standard),
                            transform var(--motion-fast) var(--ease-standard);
            }
            .schedule-tab-cta:hover {
                color: var(--gold-dark);
                transform: translateX(2px);
            }

            /* ============================================================
               SUNDAY SCHOOL — editorial split, no card.

               The old design wrapped the 9:16 phone-preview video inside
               a .section-card and stacked text below. That made the
               section ~900px tall on desktop (560px video + card padding
               + text) and forced the video to ~533px on mobile. The
               video dominated; the section read as "watch this video,
               oh and some text I guess."

               New treatment (v1.49.12):
                 1. Drop the .section-card box — content sits directly
                    on the page background like the About teaser.
                 2. Desktop ≥961px: 2-column editorial split inside an
                    880px max-width centered container. Video left (280px
                    column, capped at max-height 440px so the 9:16 frame
                    is ~247×440 instead of the old 360×640). Text right
                    with paragraph + scannable facts list + CTA link;
                    the facts pull existing info into a denser format so
                    the text column visually balances the video height.
                 3. Mobile ≤960px: single column stack. Video centered,
                    capped at max-height 420px (~236×420). That puts
                    side-air at ~15% per side on a typical phone, which
                    reads as intentional centering rather than dead
                    space. Below the video, the same facts list fills
                    the full mobile width — turns the would-be empty
                    space into useful scannable content.

               .vertical-video-frame is now used only here; sizing
               defaults moved to the .sunday-school-video modifier so
               the base frame stays neutral if reused elsewhere later.
               ============================================================ */
            .vertical-video-frame {
                position: relative;
                aspect-ratio: 9 / 16;
                border-radius: var(--radius-lg);
                overflow: hidden;
                background: linear-gradient(180deg, #1a1a2e 0%, #2a2a4e 100%);
                box-shadow: var(--shadow-lg);
                cursor: pointer;
            }
            .vertical-video-frame video,
            .vertical-video-frame iframe {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
                border: none;
            }
            /* Video placeholder — reads as a paused-video frame, not as a
               missing image. The .vertical-video-frame parent already paints
               a dark gradient bg (1a1a2e → 2a2a4e); we let it show through
               and overlay a soft warm-light vignette + a large gold play
               button. When real video lands in this slot the visual jump is
               minimal: the same dark surround plus the real frame poster.
               Previously this slot was a cool-gray rectangle with a dashed
               border that looked like a draft. */
            .vertical-video-placeholder {
                position: absolute;
                inset: 0;
                display: grid;
                place-items: center;
                background:
                    radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--gold) 14%, transparent) 0%, transparent 55%),
                    radial-gradient(circle at 50% 100%, color-mix(in srgb, #0d0d1a 65%, transparent) 0%, transparent 60%);
                color: rgba(255, 255, 255, 0.95);
                border-radius: inherit;
            }
            .vertical-video-placeholder svg {
                width: 26%;
                max-width: 72px;
                min-width: 48px;
                height: auto;
                filter: drop-shadow(0 8px 24px color-mix(in srgb, var(--gold) 30%, transparent));
            }
            /* Gold ring around the play triangle so the icon reads as a
               video-player control, not a generic decorative mark. */
            .vertical-video-placeholder svg circle {
                stroke: var(--gold);
                stroke-width: 1.5;
            }
            .vertical-video-placeholder svg polygon {
                fill: var(--gold);
            }

            /* Editorial split wrapper. Centered 880px column on desktop;
               full-width single column on mobile. */
            .sunday-school-content {
                display: grid;
                grid-template-columns: minmax(0, 280px) minmax(0, 1fr);
                column-gap: var(--space-2xl);
                row-gap: var(--space-lg);
                align-items: center;
                max-width: 880px;
                margin: 0 auto;
                width: 100%;
            }
            .sunday-school-video.vertical-video-frame {
                width: 100%;
                max-height: 440px;
                /* aspect-ratio + max-height clamps width to ~247px on
                   desktop; the 280px grid column gives modest breathing
                   room to the right of the frame. */
                justify-self: center;
            }
            .sunday-school-text {
                display: flex;
                flex-direction: column;
                gap: var(--space-md);
            }
            .sunday-school-text > p {
                margin: 0;
                color: var(--text-primary-muted);
                font-size: var(--text-lead);
                line-height: var(--leading-loose);
                max-width: 52ch;
            }
            .sunday-school-facts {
                margin: 0;
                display: grid;
                grid-template-columns: 1fr;
                gap: 10px;
                border-top: 1px solid var(--text-primary-hairline);
                border-bottom: 1px solid var(--text-primary-hairline);
                padding: var(--space-sm) 0;
            }
            .sunday-school-facts > div {
                display: grid;
                grid-template-columns: 92px 1fr;
                gap: 16px;
                align-items: baseline;
            }
            .sunday-school-facts dt {
                font-family: var(--font-display);
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
                color: var(--gold-dark);
                margin: 0;
            }
            .sunday-school-facts dd {
                margin: 0;
                color: var(--text-primary-muted);
                font-size: var(--text-small);
                line-height: var(--leading-normal);
            }
            .sunday-school-link {
                color: var(--gold);
                font-weight: var(--weight-semibold);
                text-decoration: none;
                align-self: flex-start;
                font-size: var(--text-small);
            }
            .sunday-school-link:hover {
                text-decoration: underline;
                text-underline-offset: 4px;
            }
            @media (max-width: 960px) {
                /* Single-column stack. Wrapper stretches to section width
                   so it aligns with the eyebrow + heading above; inner
                   elements use their own caps. Video gets a hard width
                   cap (240px) and text gets a readable cap (540px) — both
                   centered within the wrapper. */
                .sunday-school-content {
                    grid-template-columns: 1fr;
                    column-gap: 0;
                    row-gap: var(--space-lg);
                    align-items: stretch;
                    justify-items: center;
                    max-width: none;
                }
                .sunday-school-video.vertical-video-frame {
                    width: 100%;
                    max-width: 240px;
                    max-height: 426px;
                    border-radius: var(--radius-lg);
                }
                .sunday-school-text {
                    width: 100%;
                    max-width: 540px;
                    align-items: flex-start;
                }
                .sunday-school-text > p {
                    max-width: none;
                }
                .sunday-school-facts {
                    width: 100%;
                }
                .sunday-school-facts > div {
                    grid-template-columns: 80px 1fr;
                    gap: 12px;
                }
            }

            /* Teaser CTA buttons on home are intrinsically sized (not full-width). */
            .event-link-btn.teaser-cta {
                width: auto;
                align-self: start;
                padding: 14px 32px;
            }

            /* ============================================================
               ABOUT TEASER — editorial split layout (no .section-card)

               The About teaser deliberately drops the boxed card frame
               used by Schedule and Outreach. Content sits directly on
               the page background — quieter visual weight, more
               personal, gives the section breathing room between two
               card-heavy neighbors.

               Desktop (≥961px): 7fr / 6fr grid — image left, text right,
                                 vertically centered. Image at 5:4 aspect.
                                 Paragraph max-width 50ch for comfortable
                                 measure.

               Mobile (≤960px):  Single column, image on top at 16:10
                                 aspect (banner-style, doesn't eat scroll),
                                 paragraph + CTA below.

               Both share the same reveal choreography: image drops in
               from above, paragraph rises slowly, CTA fills in left to
               right — all on the same beat via data-reveal-sync.
               ============================================================ */
            .about-content {
                display: grid;
                grid-template-columns: minmax(0, 7fr) minmax(0, 6fr);
                gap: var(--space-2xl);
                align-items: center;
            }
            .about-image {
                position: relative;
                aspect-ratio: 5 / 4;
                width: 100%;
                border-radius: var(--radius-xl);
                overflow: hidden;
                box-shadow: 0 20px 60px var(--text-primary-hairline),
                            0 6px 16px var(--text-primary-hairline);
            }
            /* Placeholder styling — gradient + dashed border + centered
               SVG. Only applied when no <picture>/<img> child is present
               so the gradient and dashed border don't show through a
               real image. */
            .about-image:not(:has(picture, img)) {
                background:
                    linear-gradient(135deg, rgba(212, 165, 116, 0.10) 0%, var(--text-primary-hairline) 100%),
                    linear-gradient(180deg, #eef0f5 0%, #e2e5ec 100%);
                border: 1px dashed var(--text-primary-hairline);
                display: grid;
                place-items: center;
                color: var(--text-primary-fade);
            }
            .about-image > svg {
                width: 18%;
                max-width: 96px;
                min-width: 56px;
                height: auto;
            }
            .about-image picture {
                position: absolute;
                inset: 0;
                display: block;
            }
            .about-image picture img,
            .about-image > img {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }
            .about-text {
                display: flex;
                flex-direction: column;
                gap: var(--space-lg);
            }
            .about-paragraph {
                margin: 0;
                font-family: var(--font-body);
                font-size: var(--text-lead);
                line-height: var(--leading-loose);
                color: var(--text-primary-muted);
                max-width: 50ch;
            }
            .about-cta.event-link-btn {
                /* Intrinsic width, left-aligned in text column.
                   Overrides the default full-width on .event-link-btn. */
                width: auto;
                align-self: flex-start;
                padding: 14px 32px;
            }
            @media (max-width: 960px) {
                .about-content {
                    grid-template-columns: 1fr;
                    gap: var(--space-lg);
                    align-items: stretch;
                }
                .about-image {
                    aspect-ratio: 16 / 10;
                    border-radius: var(--radius-lg);
                }
                .about-text {
                    gap: var(--space-md);
                }
                .about-paragraph {
                    font-size: var(--text-body);
                    line-height: var(--leading-normal);
                    max-width: none;
                }
                .about-cta.event-link-btn {
                    padding: 13px 26px;
                }
            }

            /* Centered CTA row for the How We Serve teaser and the Visit Us CTA. */
            .teaser-cta-row,
            .subpage-cta-row {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 12px;
                margin-top: var(--space-lg);
            }
            .subpage-cta-row .event-link-btn {
                width: auto;
                padding: 14px 32px;
            }
            /* Secondary variant of the gold pill — white surface, dark text. */
            .event-link-btn.event-link-btn-secondary {
                background: rgba(255, 255, 255, 0.95);
                color: var(--text-primary);
                box-shadow: var(--shadow-md);
            }
            .event-link-btn.event-link-btn-secondary:hover {
                background: var(--white);
                box-shadow: var(--shadow-md);
            }

            /* Schedule items used as teaser links (How We Serve cards) on home.
               A small gold "Learn more →" cue (.teaser-more) inside the card
               differentiates these clickable cards from the visually identical
               but non-interactive .schedule-item cards in the Schedule section. */
            .schedule-item.teaser-link-card {
                text-decoration: none;
                color: inherit;
                cursor: pointer;
                border: 1px solid rgba(212, 165, 116, 0.18);
                box-shadow: 0 18px 44px rgba(0, 0, 0, 0.07),
                            0 0 0 1px rgba(255, 255, 255, 0.4) inset;
            }
            .schedule-item.teaser-link-card:hover {
                transform: translateY(-6px);
                border-color: color-mix(in srgb, var(--gold) 45%, transparent);
                box-shadow: 0 24px 56px rgba(0, 0, 0, 0.11),
                            0 0 0 1px rgba(255, 255, 255, 0.5) inset;
            }
            .teaser-more {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                margin-top: var(--space-xs);
                color: var(--gold);
                font-size: var(--text-label);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
            }
            .teaser-more-arrow {
                display: inline-block;
                transition: transform var(--motion-medium) var(--ease-standard);
            }
            .teaser-link-card:hover .teaser-more-arrow {
                transform: translateX(4px);
            }

            /* ============================================================
               OUTREACH TEASER CARDS — edge-to-edge images
               The card's outer padding is removed and overflow is clipped
               so each card's placeholder image runs flush to its three
               outer edges (top, bottom, and whichever side it sits on —
               right for odd cards, left for even cards via the existing
               :nth-child(even) order: -1 rule). Text gets its own internal
               padding to keep breathing room.
               Scoped to #outreach so the schedule-item pattern keeps its
               standard inner padding everywhere else on the site.
               ============================================================ */
            /* Mobile outreach teaser tweaks: keep the original side-by-
               side card design but make the image edge-to-edge in its
               half (no card padding around it, no border-radius on the
               image — the card's overflow:hidden + border-radius clips
               the image corners to match the card corner). Text keeps
               its own padding so it breathes from the card edges. */
            @media (max-width: 960px) {
                #outreach .schedule-item.teaser-link-card {
                    padding: 0;
                    gap: 0;
                    overflow: hidden;
                    align-items: stretch;
                }
                #outreach .schedule-item.teaser-link-card .schedule-item-image {
                    border-radius: 0;
                    width: 100%;
                    height: 100%;
                    aspect-ratio: auto;
                }
                #outreach .schedule-item.teaser-link-card .schedule-item-text {
                    padding: var(--space-md);
                }
            }

            /* Outreach teaser cards (desktop only — mobile keeps the
               original side-by-side layout in a section-card). Three
               cards in one row, each with image-on-top (4:3 landscape,
               edge-to-edge) and text below. Outer .section-card wrapper
               is dropped so the cards sit directly on the page
               background. All three image cells share the same width
               (forced grid columns) and the same aspect-ratio, so the
               row is visually uniform. */
            @media (min-width: 961px) {
                #outreach .section-card {
                    background: transparent;
                    box-shadow: none;
                    border: none;
                    backdrop-filter: none;
                    padding: 0;
                    border-radius: 0;
                }
                #outreach .schedule-grid {
                    grid-template-columns: repeat(3, 1fr);
                    gap: var(--space-lg);
                }
                #outreach .schedule-item.teaser-link-card {
                    grid-template-columns: 1fr;
                    grid-template-rows: auto auto;
                    padding: 0;
                    gap: 0;
                    overflow: hidden;
                    align-items: stretch;
                }
                /* Image area: full card width, 4:3 landscape, always on
                   top (regardless of nth-child(even) — the global rule
                   flips order: -1 on even children, which would put
                   text above the image). */
                #outreach .schedule-item.teaser-link-card .schedule-item-image,
                #outreach .schedule-item.teaser-link-card:nth-child(even) .schedule-item-image {
                    order: -1;
                    width: 100%;
                    aspect-ratio: 4 / 3;
                    border-radius: 0;
                    height: auto;
                }
                #outreach .schedule-item.teaser-link-card .schedule-item-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                #outreach .schedule-item.teaser-link-card .schedule-item-image-placeholder {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                #outreach .schedule-item.teaser-link-card .schedule-item-text {
                    padding: var(--space-md);
                    display: grid;
                    gap: 12px;
                }
            }
            @media (max-width: 960px) {
                #outreach .schedule-item.teaser-link-card .schedule-item-text {
                    padding: var(--space-md);
                    gap: 10px;
                }
            }

            /* Belief items: text-only schedule-item variant (no image column). */
            .schedule-item.belief-item {
                grid-template-columns: 1fr;
            }

            /* Long-content variant — used by sections with full paragraphs (the
               About teaser on home, every /about and /outreach section). On
               desktop the 2-column image+text layout is kept; on mobile the
               narrow text column with a side image looks cramped, so we stack
               image-on-top + text below. */
            @media (max-width: 960px) {
                .schedule-item.long-content {
                    grid-template-columns: 1fr;
                    gap: var(--space-md);
                }
                .schedule-item.long-content .schedule-item-image {
                    order: -1;
                    aspect-ratio: 16 / 9;
                }
                /* Reset the alternation rule from .schedule-item:nth-child(even) */
                .schedule-item.long-content:nth-child(even) .schedule-item-image {
                    order: -1;
                }
                /* The previous .schedule-item.long-content.leadership-card
                   mobile override (added v1.62.34, kept the leadership card
                   inside a schedule-item with a 16/9-vs-4/5 specificity
                   wrestling match) is gone — the leadership card no longer
                   uses .schedule-item at all. See the .leadership-split
                   block above for the new flush layout. */
            }

            /* ============================================================
               /outreach PAGE — Meals & Hospitality combined section.

               One shared banner image at top; two ministry blocks
               (Cooking Ministry + Community Breakfast) sit parallel in
               a 2-column grid below the image on desktop. This replaces
               the old pair of separate cards — both ministries share
               one feeding-people visual, but each has its own anchor ID
               on the inner <article> so home-page teaser links scroll
               directly to the ministry the user clicked.

               Desktop ≥961px: banner is 21:9 cinematic; ministries 2-col
                               under it. Each block has eyebrow + title +
                               body + CTA link.
               Mobile ≤960px:  banner shifts to 4:3 (taller, substantial
                               but not overwhelming); ministries stack in
                               a single column. Scroll-margin-top on each
                               .ministry-block so hash-jumps land cleanly
                               under the subpage nav.
               ============================================================ */
            /* ============================================================
               /outreach intro — animated Boise map (v1.49.15).

               Sits below the lead paragraph in #outreach-intro. A
               stylized top-down city-map illustration: street grid,
               Boise River, foothills hint, three teardrop map-pins,
               and a layered comet that travels between the pins.

               Replaces the v1.49.14 oval-blob-with-dots design, which
               read as amateurish. New design carries the editorial
               weight a city-map illustration needs:

               - Foothills: dashed contour line near the top (north).
                 Implies orientation; subtle.
               - Streets: two-tier grid — side streets at 0.10 opacity
                 0.5 stroke, arterials at 0.20 opacity 0.9 stroke.
                 Reads as "downtown grid" without overrendering.
               - River: gold gradient stroke at 0.35 opacity, 2.6px
                 stroke-width — the geographic disambiguator that
                 makes the map specifically "Boise." Paired with a
                 thin dashed "greenbelt" companion line.
               - Pins: teardrop body with radial gradient (light gold
                 highlight upper-left, deep brown lower-right), thin
                 dark outline, white inner indicator dot, soft ground
                 shadow ellipse. Inline <g> per pin so each can have
                 its own animation delay.
               - Comet: SIX layered paths on the same loop. Each
                 successive layer is thicker, blurrier, dimmer, and
                 lags further behind the head. Together they form a
                 bright thin head with a widening fading tail — a
                 real comet streak, not a uniform moving segment.
               - Return arc (C -> A): sweeps high above the foothills
                 (apex y=25). Comet opacity FADES OUT during the
                 return so visible "outreach delivery" only happens
                 on the A -> B and B -> C legs. Subtle ramp-in at the
                 start of each cycle avoids a hard cut.
               - BOISE label: small-caps low-opacity gold text at
                 bottom-right — map signature, editorial touch.

               Cycle: 9 seconds. Slow enough to feel deliberate (city
               heartbeat), not so slow it stalls. Pin pulses fire at
               proportional positions along the comet's path
               (A at 0%, B at 17%, C at 45%) so each pin "lights up"
               as the comet arrives.

               Reduced-motion: animations off, pins stay lit + scaled
               1.05x, halos at 0.5 opacity, comet hidden. Static
               accessible state preserves the map's spatial message. */
            .boise-map {
                width: 100%;
                max-width: 100%;
                margin: var(--space-xl) auto 0;
                color: var(--text-primary);
            }
            .boise-map svg {
                display: block;
                width: 100%;
                height: auto;
                overflow: visible;
            }
            /* Two SVG variants: the mobile one (1.76:1) is the original
               artwork — kept exactly as it was. The desktop one (2.9:1)
               is the same composition stretched onto a widescreen canvas
               so the graphic fills the page width on desktop instead of
               sitting small in the center. Only one is visible per
               breakpoint. */
            .boise-map-desktop { display: none; }
            @media (min-width: 961px) {
                .boise-map-mobile { display: none; }
                .boise-map-desktop { display: block; }
            }

            /* Foothills: dashed contour line, implies north.
               Two layered variants for slight terrain depth. */
            .boise-foothills {
                fill: none;
                stroke: currentColor;
                stroke-width: 0.9;
                stroke-opacity: 0.22;
                stroke-dasharray: 3 4;
                stroke-linecap: round;
            }
            .boise-foothills-back {
                stroke-width: 0.7;
                stroke-opacity: 0.12;
                stroke-dasharray: 2 5;
            }

            /* Street grid — two tiers + diagonals for hand-drawn-city feel */
            .boise-streets line {
                stroke: currentColor;
                stroke-width: 0.5;
                stroke-opacity: 0.11;
                stroke-linecap: round;
            }
            .boise-streets-major line {
                stroke: currentColor;
                stroke-width: 0.9;
                stroke-opacity: 0.22;
                stroke-linecap: round;
            }
            .boise-streets-diagonals line {
                stroke: currentColor;
                stroke-width: 0.6;
                stroke-opacity: 0.13;
                stroke-linecap: round;
            }

            /* Downtown block accent — small filled rectangles hint at
               the downtown core's density (near pin B). */
            .boise-downtown-accent rect {
                fill: currentColor;
                fill-opacity: 0.08;
                stroke: currentColor;
                stroke-opacity: 0.18;
                stroke-width: 0.4;
            }
            /* Park accent — a single small soft-edged circle. */
            .boise-park-accent {
                fill: var(--gold);
                fill-opacity: 0.16;
                stroke: var(--gold-dark);
                stroke-opacity: 0.32;
                stroke-width: 0.5;
            }

            /* River — Boise's geographic signature, runs strong NW-SE */
            .boise-river {
                fill: none;
                stroke: url(#boiseRiverGrad);
                stroke-width: 3;
                stroke-linecap: round;
            }
            .boise-greenbelt {
                fill: none;
                stroke: var(--gold-dark);
                stroke-width: 0.6;
                stroke-opacity: 0.32;
                stroke-dasharray: 1.5 3;
                stroke-linecap: round;
            }

            /* Pin teardrop: animates around its tip (50% 100% of bounding box) */
            .boise-pin {
                transform-box: fill-box;
                transform-origin: 50% 100%;
                animation: boise-pin-pulse 9s ease-in-out infinite;
            }
            .boise-pin-halo {
                transform-box: fill-box;
                transform-origin: center;
                opacity: 0;
                animation: boise-pin-halo-pulse 9s ease-in-out infinite;
            }
            .boise-pin-a,  .boise-pin-halo-a { animation-delay: 0s; }
            .boise-pin-b,  .boise-pin-halo-b { animation-delay: 1.53s; }   /* comet at B around 17% of 9s */
            .boise-pin-c,  .boise-pin-halo-c { animation-delay: 4.05s; }   /* comet at C around 45% of 9s */

            @keyframes boise-pin-pulse {
                0%, 100% { transform: scale(1); }
                2%       { transform: scale(1.3); }
                15%      { transform: scale(1.05); }
                50%      { transform: scale(1); }
            }
            @keyframes boise-pin-halo-pulse {
                0%, 100% { opacity: 0; transform: scale(0.6); }
                2%       { opacity: 0.85; transform: scale(1); }
                15%      { opacity: 0.45; transform: scale(1.15); }
                50%      { opacity: 0;    transform: scale(0.9); }
            }

            /* Comet trail: 6 layered paths along the same loop, each
               with a slightly later animation-delay so the layers form
               a head-bright / tail-fading procession. */
            .boise-comet {
                fill: none;
                stroke: var(--gold);
                stroke-linecap: round;
                animation: boise-comet-travel 9s linear infinite;
            }
            .boise-comet-l1 {  /* head */
                stroke-width: 1.8;
                stroke-dasharray: 6 114;
                animation-delay: 0s;
                filter: drop-shadow(0 0 2px rgba(212, 165, 116, 0.95))
                        drop-shadow(0 0 4px rgba(212, 165, 116, 0.55));
            }
            .boise-comet-l2 {
                stroke-width: 2.6;
                stroke-dasharray: 7 113;
                opacity: 0.7;
                animation-delay: 0.06s;
                filter: blur(0.6px);
            }
            .boise-comet-l3 {
                stroke-width: 3.6;
                stroke-dasharray: 9 111;
                opacity: 0.45;
                animation-delay: 0.14s;
                filter: blur(1.2px);
            }
            .boise-comet-l4 {
                stroke-width: 5.2;
                stroke-dasharray: 11 109;
                opacity: 0.26;
                animation-delay: 0.24s;
                filter: blur(2px);
            }
            .boise-comet-l5 {
                stroke-width: 7.5;
                stroke-dasharray: 13 107;
                opacity: 0.14;
                animation-delay: 0.36s;
                filter: blur(3px);
            }
            .boise-comet-l6 {
                stroke-width: 11;
                stroke-dasharray: 15 105;
                opacity: 0.07;
                animation-delay: 0.50s;
                filter: blur(4.5px);
            }
            @keyframes boise-comet-travel {
                /* opacity ramp-in at start, fade-out during the C->A
                   return arc (45% -> 55%), invisible during the rest
                   of the return so the comet "disappears" before
                   re-emerging at A on the next cycle. */
                0%   { stroke-dashoffset: 0;    opacity: 0; }
                3%   {                          opacity: var(--cometVis, 1); }
                45%  {                          opacity: var(--cometVis, 1); }
                55%  {                          opacity: 0; }
                100% { stroke-dashoffset: -120; opacity: 0; }
            }
            /* Each tail layer inherits its base opacity via --cometVis
               so the keyframe transition between full and zero respects
               the layer's individual opacity instead of forcing 1. */
            .boise-comet-l2 { --cometVis: 0.7; }
            .boise-comet-l3 { --cometVis: 0.45; }
            .boise-comet-l4 { --cometVis: 0.26; }
            .boise-comet-l5 { --cometVis: 0.14; }
            .boise-comet-l6 { --cometVis: 0.07; }

            /* BOISE label — map signature */
            .boise-map-label {
                font-family: var(--font-display);
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-semibold);
                letter-spacing: 0.32em;
                fill: var(--gold-dark);
                opacity: 0.45;
            }

            @media (max-width: 960px) {
                .boise-map {
                    max-width: 100%;
                    margin-top: var(--space-lg);
                }
                .boise-comet-l1 { stroke-width: 1.6; }
                .boise-comet-l2 { stroke-width: 2.4; }
                .boise-comet-l3 { stroke-width: 3.2; }
                .boise-comet-l4 { stroke-width: 4.6; }
                .boise-comet-l5 { stroke-width: 6.5; }
                .boise-comet-l6 { stroke-width: 9.5; }
            }

            @media (prefers-reduced-motion: reduce) {
                .boise-pin,
                .boise-pin-halo,
                .boise-comet {
                    animation: none;
                }
                .boise-pin     { transform: scale(1.05); }
                .boise-pin-halo { opacity: 0.5; transform: scale(1); }
                .boise-comet   { display: none; }
                /* Show only the head layer as a static dashed trail so
                   the spatial relationship is still visible. */
                .boise-comet-l1 {
                    display: block;
                    opacity: 0.4;
                    stroke-dasharray: 3 5;
                    filter: none;
                }
            }

            /* v1.49.34: the home teaser cards now both link to
               #meals-hospitality (the section top) rather than the
               inner #cooking-ministry / #community-breakfast articles,
               so the deterministic deep-link scroll buffer that used
               to live here is no longer needed. The inner IDs are kept
               in place for any external deep links, but they accept
               the natural document height — no padding-bottom. */
            .ministries-pair {
                display: flex;
                flex-direction: column;
                gap: var(--space-2xl);
            }
            .ministries-image {
                width: 100%;
                aspect-ratio: 21 / 9;
                border-radius: var(--radius-xl);
                overflow: hidden;
                position: relative;
                background: linear-gradient(180deg, #eef0f5 0%, #e2e5ec 100%);
            }
            /* Same warm-cream treatment as .schedule-item-image-placeholder
               so placeholders read as intentional surface tone, not as missing
               content. Smaller icon, fainter opacity, no dashed border. */
            .ministries-image-placeholder {
                background:
                    radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--gold) 8%, transparent) 0%, transparent 60%),
                    linear-gradient(180deg, color-mix(in srgb, var(--bg) 96%, var(--gold) 4%) 0%, color-mix(in srgb, var(--bg) 88%, var(--gold) 6%) 100%);
                display: grid;
                place-items: center;
                color: var(--text-primary-fade);
            }
            .ministries-image-placeholder > svg {
                width: 10%;
                max-width: 64px;
                min-width: 36px;
                height: auto;
                opacity: 0.4;
            }
            /* Real images fill the .ministries-image container. Selectors
               cover both shapes — a plain <img> child, and the <picture>
               wrapper with its inner <img>. Without the picture-aware
               rules, the inner <img> renders at intrinsic dimensions and
               only the top-left corner shows through overflow: hidden. */
            .ministries-image > img,
            .ministries-image > picture {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                display: block;
            }
            .ministries-image > picture > img {
                width: 100%;
                height: 100%;
                display: block;
            }
            .ministries-image > img,
            .ministries-image > picture > img {
                object-fit: cover;
            }
            .ministries-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--space-2xl);
            }
            .ministry-block {
                display: flex;
                flex-direction: column;
                gap: var(--space-xs);
                /* Hash-jumps from home teaser cards land here. The
                   subpage offset is 90px on desktop, 75px on mobile;
                   match those so the eyebrow has breathing room above. */
                scroll-margin-top: 90px;
            }
            .ministry-eyebrow {
                font-family: var(--font-display);
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
                color: var(--gold-dark);
            }
            .ministry-title {
                font-family: var(--font-display);
                font-size: var(--text-heading);
                font-weight: var(--weight-bold);
                color: var(--text-primary);
                line-height: var(--leading-snug);
                margin: 0;
            }
            .ministry-text {
                margin: 0;
                color: var(--text-primary-muted);
                font-size: var(--text-body);
                line-height: var(--leading-loose);
            }
            .ministry-link {
                color: var(--gold);
                font-weight: var(--weight-semibold);
                text-decoration: none;
                align-self: flex-start;
                font-size: var(--text-small);
                margin-top: 4px;
            }
            .ministry-link:hover {
                text-decoration: underline;
                text-underline-offset: 4px;
            }
            /* Secondary action — same gold + same arrow, but lighter weight
               + faint muted color so the visual order reads
               "primary action, alternate path" rather than two competing
               peers. Pairs with .ministry-link on its own line via the
               .ministry-block flex column. */
            .ministry-link.ministry-link--secondary {
                color: var(--text-primary-muted);
                font-weight: var(--weight-medium);
                margin-top: 2px;
            }
            .ministry-link.ministry-link--secondary:hover {
                color: var(--gold);
            }
            @media (max-width: 960px) {
                /* Mobile gets its own treatment, not just a stacked
                   desktop. Three mobile-specific moves:
                     1. Banner narrows to 16:9 — landscape proportions
                        suit phone aspect better than the desktop 21:9
                        (which would be a thin strip on mobile width).
                     2. Each ministry block gets a small gold gradient
                        "tab" line above the eyebrow as a visual
                        section-start marker. Desktop doesn't need this
                        because the 2-column grid separates them
                        spatially; mobile stack needs an explicit
                        "new ministry starts here" signal so the two
                        blocks don't bleed into each other.
                     3. More generous row-gap between blocks (36-48px)
                        so the two ministries read as discrete sections,
                        not paragraphs of a single passage. */
                .ministries-image {
                    aspect-ratio: 16 / 9;
                    border-radius: var(--radius-lg);
                }
                .ministries-grid {
                    grid-template-columns: 1fr;
                    gap: var(--space-xl);
                }
                .ministry-block {
                    scroll-margin-top: 75px;
                    position: relative;
                    padding-top: var(--space-md);
                }
                .ministry-block::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: clamp(56px, 14vw, 88px);
                    height: 2px;
                    background: linear-gradient(90deg, var(--gold) 0%, var(--gold-dark) 100%);
                    border-radius: 1px;
                }
                .ministry-eyebrow {
                    font-size: var(--text-eyebrow);
                    letter-spacing: var(--tracking-wide);
                }
                .ministry-title {
                    font-size: var(--text-heading);
                }
                .ministry-text {
                    font-size: var(--text-body);
                    line-height: var(--leading-normal);
                }
            }

            /* ============================================================
               /visit PAGE — Map card + What-to-Expect service-flow timeline
               ============================================================ */

            /* /visit intro — line-art handshake (v1.62.7).
               EDITORIAL pacing refinement. Slower, calmer, more
               deliberate than v1.49.22 — and stutter-free on desktop.

                 Phase 1 (0 - 5.5s): Path draws itself onto the page via
                 stroke-dashoffset. Apple-style ease-out (0.22, 1, 0.36, 1)
                 so the line starts decisive and settles smoothly into its
                 final shape — reads as a calligrapher's stroke rather
                 than a progress bar. Paired with a 2s opacity fade for a
                 paper-emerging feel.

                 Phase 2 (5.5 - 6.5s): 1s still pause. The illustration is
                 fully drawn but quiet. This breath makes the next gesture
                 feel deliberate rather than mechanical.

                 Phase 3 (6.5s onwards): handshake-gesture loop — three
                 firm pumps over ~1s with decreasing amplitudes (7->5->3px),
                 then ~9s of complete stillness. Repeats infinitely.

               Stutter fix: the previous version applied filter: drop-shadow
               to .handshake-art, which on desktop forces a full-layer
               repaint every frame of the pump gesture animation (desktop
               compositors don't accelerate filter repaints the way mobile
               GPUs do). The drop-shadow has been removed; .handshake-stroke
               keeps its non-scaling stroke and renders cleanly without it. */
            .handshake {
                width: 100%;
                max-width: 360px;
                margin: var(--space-xl) auto 0;
                color: var(--text-primary);
            }
            .handshake svg {
                display: block;
                width: 100%;
                height: auto;
                overflow: visible;
            }
            .handshake-stroke {
                fill: none;
                stroke: var(--gold-dark);
                stroke-width: 2.4;
                stroke-linecap: round;
                stroke-linejoin: round;
                vector-effect: non-scaling-stroke;
                /* Draw-on. Path total length ~893 user units; 920 leaves
                   ~27px of pre-draw buffer so the path is invisible at t=0
                   without wasting most of the animation duration. */
                stroke-dasharray: 920;
                stroke-dashoffset: 920;
                animation: handshake-draw 5.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
            .handshake-art {
                transform-origin: 50% 75%;
                opacity: 0;
                /* No filter: drop-shadow — it was the source of desktop
                   stutter during the pump animation. */
                animation:
                    handshake-fade 2s cubic-bezier(0.22, 1, 0.36, 1) forwards,
                    handshake-gesture 10s cubic-bezier(0.32, 0.5, 0.45, 0.92) 6.5s infinite;
                will-change: transform, opacity;
            }
            @keyframes handshake-draw {
                0%   { stroke-dashoffset: 920; }
                100% { stroke-dashoffset: 0; }
            }
            @keyframes handshake-fade {
                /* Pure opacity fade — no competing scale/transform
                   so the focus stays on the stroke drawing onto the
                   page. */
                0%   { opacity: 0; }
                100% { opacity: 1; }
            }
            @keyframes handshake-gesture {
                /* Three firm pumps over the first 10% of the cycle
                   (~1s), then complete stillness for the remaining
                   90% (~9s). Amplitudes decrease (7 -> 5 -> 3 px)
                   so each pump softens and the gesture "ends" rather
                   than abruptly stops. */
                0%, 10%, 100% { transform: translateY(0); }
                2%   { transform: translateY(-7px); }   /* pump 1 down (firm) */
                3.5% { transform: translateY(4px); }    /* pump 1 up (rebound) */
                5%   { transform: translateY(-5px); }   /* pump 2 down */
                6.5% { transform: translateY(2px); }    /* pump 2 up */
                8%   { transform: translateY(-3px); }   /* pump 3 down (softest) */
            }

            @keyframes handshake-shake {
                /* Damped natural oscillation. Each peak smaller than
                   the last, simulating a real handshake easing to a
                   stop. Calm hold (55-100%) before the next loop so
                   the motion doesn't feel hyperactive. */
                0%   { transform: translateY(0); }
                6%   { transform: translateY(-8px); }
                12%  { transform: translateY(7px); }
                18%  { transform: translateY(-6px); }
                24%  { transform: translateY(5px); }
                30%  { transform: translateY(-4px); }
                36%  { transform: translateY(3px); }
                42%  { transform: translateY(-2px); }
                48%  { transform: translateY(1px); }
                55%, 100% { transform: translateY(0); }
            }

            @media (max-width: 960px) {
                .handshake {
                    max-width: 240px;
                    margin-top: var(--space-lg);
                }
            }

            /* Desktop renders the SVG ~1.5× larger than mobile (360px vs 240px max-width).
               Because the stroke uses vector-effect: non-scaling-stroke it stays a fixed
               2.4 CSS pixels regardless of SVG size, which on the larger desktop render
               makes the finger / wrist detail look proportionally thinner — fine lines
               appear to vanish ("part of it is missing"). Thicken the stroke on desktop
               so the relative line weight matches the mobile rendering. */
            @media (min-width: 961px) {
                .handshake-stroke {
                    stroke-width: 3.6;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .handshake-art {
                    animation: none;
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
                .handshake-stroke {
                    animation: none;
                    stroke-dashoffset: 0;
                }
            }

            /* /visit Find Us — editorial 7fr/5fr split (v1.62.30).
               Map left, info column right, both flush on the warm-
               cream page surface (no .section-card box — same flush
               vocabulary the rest of the subpages adopted in
               v1.62.27). Replaces the previous full-width "section-
               card wrapped iframe" which read as a Google-Maps widget
               dropped into the page with no warmth.

               Info column carries the editorial prose ("tucked along
               Wildwood Street...") + practical anti-anxiety detail
               (parking, front-door-on-the-lot, 9 AM Sundays) + the
               two directions buttons. Vertically centers against the
               map row so a shorter info block on a tall map reads as
               anchored rather than orphaned top-left.

               Mobile collapses to a single column: map first (16:9
               banner so it doesn't dominate phone height), then the
               info column below — same pattern as the rest of the
               site's image/text splits. */
            .visit-location-split {
                display: grid;
                grid-template-columns: 7fr 5fr;
                gap: var(--space-2xl);
                align-items: center;
                margin-top: var(--space-xl);
            }
            .visit-map-frame {
                width: 100%;
                /* 4/3 desktop aspect gives a generous map without
                   dominating the row. Caps at 520px so on very wide
                   pages the map doesn't drift to oversized. */
                aspect-ratio: 4 / 3;
                max-height: 520px;
                border-radius: var(--radius-xl);
                overflow: hidden;
                box-shadow: var(--shadow-md);
                background: linear-gradient(135deg, rgba(212, 165, 116, 0.10) 0%, var(--text-primary-hairline) 100%),
                            linear-gradient(180deg, #eef0f5 0%, #e2e5ec 100%);
            }
            .visit-map {
                width: 100%;
                height: 100%;
                border: 0;
                display: block;
            }
            .visit-location-meta {
                display: flex;
                flex-direction: column;
                gap: var(--space-md);
            }
            .visit-location-lede {
                font-family: var(--font-display);
                font-size: var(--text-lead);
                font-weight: var(--weight-semibold);
                line-height: var(--leading-snug);
                color: var(--text-primary);
                letter-spacing: var(--tracking-tight);
                margin: 0;
                max-width: 24ch;
            }
            .visit-location-detail {
                font-size: var(--text-body);
                line-height: var(--leading-loose);
                color: var(--text-primary-muted);
                margin: 0;
                max-width: 38ch;
            }
            .visit-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                margin-top: var(--space-md);
            }
            .visit-actions .event-link-btn {
                width: auto;
                padding: 14px 32px;
            }
            @media (max-width: 960px) {
                .visit-location-split {
                    grid-template-columns: 1fr;
                    gap: var(--space-lg);
                    margin-top: var(--space-md);
                }
                .visit-map-frame {
                    aspect-ratio: 16 / 9;
                    max-height: none;
                    border-radius: var(--radius-lg);
                }
                .visit-location-lede {
                    max-width: none;
                }
                .visit-location-detail {
                    max-width: none;
                }
                .visit-actions {
                    margin-top: var(--space-sm);
                }
            }

            /* What-to-Expect: numbered service-flow timeline.

               Compacted in v1.49.11 — five combined levers:
                 1. Desktop ≥800px lays out as 2 columns via
                    grid-auto-flow: column, so 7 steps flow:
                      col 1: 1, 2, 3, 4
                      col 2: 5, 6, 7
                    reads top-to-bottom within each column.
                 2. Numbered circle 44 → 38px, font 18 → 16px,
                    softer shadow — lighter visual weight.
                 3. Row gap reduced from clamp(24,3vw,32) to
                    clamp(20,2.4vw,26).
                 4. Body line-height --leading-loose (1.8) →
                    --leading-normal (1.6); h3 slightly smaller.
                 5. Connector hidden at item 4 in 2-col mode so
                    the line doesn't dangle into empty space
                    below the last item in column 1. Mobile keeps
                    the full chain. */
            .service-flow {
                list-style: none;
                counter-reset: flow;
                display: grid;
                grid-template-columns: 1fr;
                row-gap: clamp(20px, 2.4vw, 26px);
                padding: 0;
                margin: 0;
            }
            .service-flow li {
                display: grid;
                grid-template-columns: 46px 1fr;
                gap: var(--space-md);
                align-items: start;
                position: relative;
            }
            .service-flow-step {
                width: 38px;
                height: 38px;
                border-radius: var(--radius-circle);
                background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
                color: #fff;
                display: grid;
                place-items: center;
                font-family: var(--font-display);
                font-size: var(--text-body);
                font-weight: var(--weight-bold);
                box-shadow: 0 4px 12px color-mix(in srgb, var(--gold) 28%, transparent);
                counter-increment: flow;
                position: relative;
                z-index: 1;
            }
            .service-flow-step::before {
                content: counter(flow);
            }
            /* Connecting line between numbered steps. Height covers:
               bottom of this circle + row gap + half of next circle
               (so the line visually terminates at the center of the
               next circle, hidden behind it via z-index). */
            .service-flow li:not(:last-child) .service-flow-step::after {
                content: '';
                position: absolute;
                left: 50%;
                top: 100%;
                width: 2px;
                height: calc(100% + clamp(20px, 2.4vw, 26px) - 19px);
                background: linear-gradient(180deg, color-mix(in srgb, var(--gold) 35%, transparent), color-mix(in srgb, var(--gold) 0%, transparent));
                transform: translateX(-50%);
                margin-top: 4px;
            }
            .service-flow-text h3 {
                font-family: var(--font-display);
                font-size: var(--text-lead);
                font-weight: var(--weight-bold);
                color: var(--text-primary);
                line-height: var(--leading-snug);
                margin-bottom: 4px;
                text-wrap: balance;
            }
            .service-flow-text p {
                color: var(--text-primary-muted);
                line-height: var(--leading-normal);
                font-size: var(--text-body);
                margin: 0;
            }
            /* Desktop ≥800px: 2-column layout with vertical flow. With
               7 items and grid-template-rows: repeat(4, auto), items
               1-4 occupy column 1 and items 5-7 occupy column 2 (row 4
               of column 2 is empty). The hardcoded :nth-child(4) line
               override depends on this 7-item count — update if the
               SERVICE_FLOW array length changes. */
            @media (min-width: 800px) {
                .service-flow {
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: repeat(4, auto);
                    grid-auto-flow: column;
                    column-gap: var(--space-xl);
                    row-gap: clamp(22px, 2.4vw, 28px);
                }
                .service-flow li:nth-child(4) .service-flow-step::after {
                    display: none;
                }
            }

            /* Visit final CTA card — centered text inside a section-card */
            .section-card.visit-final-cta {
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
            }
            .section-card.visit-final-cta .section-lead {
                margin: 0;
            }
            .section-card.visit-final-cta .event-link-btn {
                width: auto;
                padding: 14px 36px;
            }

            /* ============================================================
               SUBPAGE HEADER — /about and /outreach.
               Three independent fixed-position elements (no unified shell):
               • .subpage-top-fog — full-width frosted strip across the top
                 of the viewport that tapers vertically into the page bg.
                 Provides the soft atmospheric backdrop the brand sits in.
               • .subpage-brand — wordmark; hides on scroll-down, returns on
                 scroll-up. No own background — sits within .subpage-top-fog.
               • .subpage-back — gold pill, always visible (mirrors the
                 .event-link-btn gradient + shadow tokens).
               ============================================================ */
            .subpage-top-fog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                /* Balance point between v1.62.32 (110/88, 0.85, mask 30%)
                   which was too short and let scrolling text show through
                   the chrome, and v1.62.36 (150/130, 0.96, mask 60%)
                   which was too tall and washed out the eyebrow chips.
                   Current 120/100 with bg 0.90 + mask 45% hides chrome-
                   zone text well while leaving the eyebrow-chip zone
                   clear. */
                height: 120px;
                z-index: 999;
                pointer-events: none;
                -webkit-backdrop-filter: blur(14px);
                backdrop-filter: blur(14px);
                background: linear-gradient(180deg,
                    rgba(250, 248, 245, 0.90) 0%,
                    rgba(250, 248, 245, 0.68) 50%,
                    rgba(250, 248, 245, 0.22) 85%,
                    rgba(250, 248, 245, 0) 100%);
                -webkit-mask: linear-gradient(180deg,
                    black 0%,
                    black 45%,
                    rgba(0, 0, 0, 0.40) 80%,
                    transparent 100%);
                mask: linear-gradient(180deg,
                    black 0%,
                    black 45%,
                    rgba(0, 0, 0, 0.40) 80%,
                    transparent 100%);
                transition: opacity 0.45s var(--ease-out-soft);
            }

            /* When the brand has scrolled away there is no large chrome
               element left to mute behind, so the fog drops to a soft
               whisper — the BACK + menu pills are small enough that body
               text reads cleanly around them. JS toggles
               body.subpage-brand-hidden in lock-step with
               .subpage-brand.hidden. */
            body.subpage-brand-hidden .subpage-top-fog {
                opacity: 0.18;
            }

            .subpage-brand {
                position: fixed;
                top: 24px;
                left: 50%;
                transform: translateX(-50%) translateY(0);
                z-index: 1000;
                display: flex;
                flex-direction: column;
                align-items: center;
                line-height: 1;
                gap: 4px;
                padding: 8px 24px;
                text-decoration: none;
                color: inherit;
                transition: transform 0.4s var(--ease-standard),
                            opacity 0.4s var(--ease-standard);
            }
            .subpage-brand .brand-title {
                font-family: var(--font-display);
                font-size: var(--text-heading);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
                color: var(--text-primary);
                white-space: nowrap;
            }
            .subpage-brand .brand-subtitle {
                font-size: var(--text-eyebrow);
                letter-spacing: var(--tracking-wider);
                text-transform: uppercase;
                color: var(--text-primary-faint);
                font-weight: var(--weight-semibold);
                white-space: nowrap;
            }
            .subpage-brand.hidden {
                transform: translateX(-50%) translateY(-150%);
                opacity: 0;
            }

            .subpage-back {
                position: fixed;
                top: 24px;
                left: clamp(12px, 3vw, 28px);
                z-index: 1001;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                /* Fixed height + matching top with .subpage-menu-trigger
                   so the two right/left chrome controls form a perfectly
                   aligned pair (same top edge, same bottom edge, same
                   pill radius). Padding lost its vertical component;
                   height + align-items:center handles centering the
                   "BACK" label and arrow. */
                height: 40px;
                box-sizing: border-box;
                /* Quiet frosted-glass surface. Lowered alpha and
                   removed border so the chrome pills stop competing
                   with the wordmark for visual weight. The shadow
                   stays subtle (sm not md) so the pills "lift" just
                   enough to read as interactive surfaces, no more. */
                background: rgba(255, 255, 255, 0.6);
                color: var(--text-primary);
                border: none;
                border-radius: var(--radius-pill);
                padding: 0 22px;
                font-family: var(--font-body);
                font-size: var(--text-label);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
                text-decoration: none;
                white-space: nowrap;
                box-shadow: var(--shadow-xs);
                -webkit-backdrop-filter: blur(10px);
                backdrop-filter: blur(10px);
                transition: top var(--motion-medium) var(--ease-out-soft),
                            width var(--motion-medium) var(--ease-out-soft),
                            height var(--motion-medium) var(--ease-out-soft),
                            background var(--motion-medium) var(--ease-out-soft),
                            box-shadow var(--motion-medium) var(--ease-out-soft),
                            transform var(--motion-medium) var(--ease-out-soft),
                            opacity var(--motion-medium) var(--ease-out-soft);
            }
            /* When the menu opens the nav-shell occupies the entire top
               row including the area the BACK pill sits over (the left
               edge overlaps the nav-shell brand on desktop and the
               compressed Contact pill on mobile). Per user direction:
               overlapping elements fade away. BACK fades out with the
               same motion as the nav-shell fades in; the close-X icon
               (subpage-menu-trigger) stays visible since it's the
               dismiss control. */
            body.menu-open .subpage-back {
                opacity: 0;
                pointer-events: none;
                transform: translateX(-6px);
            }
            .subpage-back:hover {
                background: rgba(255, 255, 255, 0.85);
                box-shadow: var(--shadow-md);
                transform: translateY(-1px);
            }
            .subpage-back-arrow {
                width: 16px;
                height: 16px;
                flex-shrink: 0;
                display: block;
            }

            /* =====================================================
               SUBPAGE MENU TRIGGER + SLIDE-IN PANEL (v1.62.37)
               =====================================================
               Right-side mirror of the BACK pill. Three thin equal
               lines (16px / 1.5px / 5px gap) inside a frosted-pill
               that matches .section-eyebrow's visual weight (white
               0.8 alpha, subtle shadow, gold-edge border). Clicking
               morphs the icon to an X, slides the brand wordmark
               left + dims it slightly, and slides the nav panel in
               from the right.

               The panel mirrors /home's nav vocabulary: same items
               (Schedule / About / Outreach / Watch) plus the
               Contact CTA, with cross-page hashes (/#schedule)
               since we're on a subpage. Dismiss paths: click
               trigger, click scrim, click any nav link, ESC key —
               all funnel through the JS closeMenu() in
               subpage-header.ts. */

            .subpage-menu-trigger {
                position: fixed;
                /* Desktop matches .subpage-back exactly (top:24,
                   height:40, pill radius, identical surface). Both
                   pills read as a paired chrome set, paired in turn
                   with the wordmark sitting between them. Quiet
                   surface treatment lets the wordmark dominate. */
                top: 24px;
                right: clamp(12px, 3vw, 28px);
                z-index: 1001;
                width: 40px;
                height: 40px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.6);
                border: none;
                border-radius: var(--radius-pill);
                padding: 0;
                margin: 0;
                cursor: pointer;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                box-shadow: var(--shadow-xs);
                transition: opacity var(--motion-medium) var(--ease-out-soft),
                            background var(--motion-medium) var(--ease-out-soft),
                            box-shadow var(--motion-medium) var(--ease-out-soft),
                            transform var(--motion-medium) var(--ease-out-soft);
            }
            .subpage-menu-trigger:hover {
                background: rgba(255, 255, 255, 0.85);
                box-shadow: var(--shadow-md);
                transform: translateY(-1px);
            }
            .subpage-menu-trigger:focus-visible {
                outline: 2px solid var(--gold);
                outline-offset: 3px;
            }

            /* Three-line icon. Each line is an absolutely-positioned
               span inside .subpage-menu-icon, so the rotations on
               open use a fixed pivot (the icon-box center) and don't
               drift on different DPRs. */
            .subpage-menu-icon {
                position: relative;
                width: 16px;
                height: 12px;
                display: block;
            }
            .subpage-menu-icon-line {
                position: absolute;
                left: 0;
                width: 100%;
                height: 1.5px;
                background: var(--text-primary);
                border-radius: 1px;
                transition: transform var(--motion-medium) var(--ease-out-soft),
                            opacity var(--motion-medium) var(--ease-out-soft),
                            top var(--motion-medium) var(--ease-out-soft);
            }
            .subpage-menu-icon-line:nth-child(1) { top: 0; }
            .subpage-menu-icon-line:nth-child(2) { top: 50%; transform: translateY(-50%); }
            .subpage-menu-icon-line:nth-child(3) { top: 100%; transform: translateY(-100%); }

            /* Per user direction (v1.62.48): the trigger morphs AWAY
               on menu-open so the subpage nav-shell renders identical
               to the home page nav — no chrome buttons floating
               outside it, no padding reserved for a trigger. The
               trigger fades to opacity 0 (with pointer-events:none
               so it can't be clicked behind the shell), and returns
               on close. Dismiss paths while open: scroll, click the
               tinted scrim, click a nav link, press ESC. */
            body.menu-open .subpage-menu-trigger {
                opacity: 0;
                pointer-events: none;
            }

            /* The nav-shell on subpages: hidden by default, fades +
               slides in when body.menu-open. Uses the EXACT same
               element/styles as /home (nav() function); no separate
               panel. The home page leaves these properties alone so
               its nav-shell renders normally.

               CRITICAL: the home nav-shell relies on
               transform: translateX(-50%) for its centering. We MUST
               compose translateX(-50%) into our hidden/open transforms
               or the nav-shell will jump off-center. */
            /* Menu-open choreography (v1.62.77): the panel GROWS out of the
               trigger's corner (transform-origin top-right, where the tap
               happened) with the spring's snap-into-place, instead of a flat
               slide+fade. Exit is deliberately quicker and bounce-free —
               entrances perform, exits get out of the way. */
            body[class*="page-subpage"] .nav-shell {
                opacity: 0;
                transform: translateX(-50%) translateY(-12px) scale(0.94);
                transform-origin: calc(100% - 44px) 0;
                pointer-events: none;
                visibility: hidden;
                transition: opacity var(--motion-fast) var(--ease-out-soft),
                            transform var(--motion-medium) var(--ease-out-soft),
                            visibility 0s linear var(--motion-medium);
            }
            body[class*="page-subpage"].menu-open .nav-shell {
                opacity: 1;
                transform: translateX(-50%) translateY(0) scale(1);
                pointer-events: auto;
                visibility: visible;
                transition: opacity var(--motion-medium) var(--ease-out-soft),
                            transform var(--motion-springy) var(--ease-spring),
                            visibility 0s linear 0s;
            }

            /* On subpages BOTH brand elements exist (subpage-brand at
               center, nav-shell .brand inside the appearing nav-shell).
               They cross-fade: subpage brand fades out as nav-shell
               brand fades in, both at slightly-offset positions so the
               user perceives one brand element gracefully repositioning.
               Nav-shell brand starts invisible; .menu-open fades it in. */
            body[class*="page-subpage"] .nav-shell .brand {
                opacity: 0;
                transform: translateY(-4px);
                transition: opacity var(--motion-fast) var(--ease-out-soft),
                            transform var(--motion-fast) var(--ease-out-soft);
            }
            body[class*="page-subpage"].menu-open .nav-shell .brand {
                opacity: 1;
                transform: translateY(0);
                transition: opacity var(--motion-medium) var(--ease-out-soft),
                            transform var(--motion-springy) var(--ease-spring);
                transition-delay: 120ms;
            }

            /* Stagger nav items + CTA on open for a tasteful cascade.
               Cascade runs right-to-left: Watch (4th child, rightmost)
               animates first, propagating left through Outreach,
               About, Schedule. The motion reads as "the menu unfurls
               from the close-X end toward the wordmark" — same
               directionality as the X morph + nav-shell slide-in. */
            body[class*="page-subpage"] .nav-shell nav ul li {
                opacity: 0;
                transform: translateX(10px) translateY(4px) scale(0.96);
                filter: blur(3px);
                transition: opacity var(--motion-fast) var(--ease-out-soft),
                            transform var(--motion-fast) var(--ease-out-soft),
                            filter var(--motion-fast) var(--ease-out-soft);
            }
            body[class*="page-subpage"].menu-open .nav-shell nav ul li {
                opacity: 1;
                transform: translateX(0) translateY(0) scale(1);
                filter: blur(0);
                transition: opacity var(--motion-medium) var(--ease-out-soft),
                            transform var(--motion-springy) var(--ease-spring),
                            filter var(--motion-medium) var(--ease-out-soft);
            }
            body[class*="page-subpage"].menu-open .nav-shell nav ul li:nth-child(4) { transition-delay: 80ms; }
            body[class*="page-subpage"].menu-open .nav-shell nav ul li:nth-child(3) { transition-delay: 130ms; }
            body[class*="page-subpage"].menu-open .nav-shell nav ul li:nth-child(2) { transition-delay: 180ms; }
            body[class*="page-subpage"].menu-open .nav-shell nav ul li:nth-child(1) { transition-delay: 230ms; }
            body[class*="page-subpage"] .nav-shell .nav-cta,
            body[class*="page-subpage"] .nav-shell .nav-form-btn {
                opacity: 0;
                transform: translateY(6px) scale(0.96);
                filter: blur(3px);
                transition: opacity var(--motion-fast) var(--ease-out-soft),
                            transform var(--motion-fast) var(--ease-out-soft),
                            filter var(--motion-fast) var(--ease-out-soft);
            }
            body[class*="page-subpage"].menu-open .nav-shell .nav-cta,
            body[class*="page-subpage"].menu-open .nav-shell .nav-form-btn {
                opacity: 1;
                transform: translateY(0) scale(1);
                filter: blur(0);
                transition: opacity var(--motion-medium) var(--ease-out-soft),
                            transform var(--motion-springy) var(--ease-spring),
                            filter var(--motion-medium) var(--ease-out-soft);
                transition-delay: 280ms;
            }

            /* ── Engine mode (html.motion-engine, set once the self-hosted
               Motion bundle boots) — the JS engine drives every menu
               property inline with real springs + interruption continuity,
               so the CSS transitions above stand down. The shell's
               transform reads from engine vars in BOTH states (composed
               with the centering translateX). */
            html.motion-engine body[class*="page-subpage"] .nav-shell,
            html.motion-engine body[class*="page-subpage"].menu-open .nav-shell {
                transform: translateX(-50%) translateY(var(--mnav-y, -12px)) scale(var(--mnav-s, 0.94));
                transition: visibility 0s linear var(--motion-medium);
            }
            html.motion-engine body[class*="page-subpage"].menu-open .nav-shell {
                transition: visibility 0s linear 0s;
            }
            html.motion-engine body[class*="page-subpage"] .nav-shell nav ul li,
            html.motion-engine body[class*="page-subpage"] .nav-shell .brand,
            html.motion-engine body[class*="page-subpage"] .nav-shell .nav-cta,
            html.motion-engine body[class*="page-subpage"] .nav-shell .nav-form-btn {
                transition: none;
            }
            /* Exit hold — the engine plays the close on a panel the class
               flip would otherwise hide instantly. */
            body.menu-closing .nav-shell {
                visibility: visible !important;
                pointer-events: none !important;
            }

            /* Scrim — full-viewport invisible click target that
               dismisses the menu. Inactive (pointer-events: none) by
               default; becomes clickable only when .menu-open. No
               background tint — the panel itself stands out enough
               via its frosted backdrop. */
            .subpage-menu-scrim {
                position: fixed;
                inset: 0;
                z-index: 998;
                /* Fully transparent — the page underneath shows
                   unchanged when the menu opens. No tint, no blur,
                   no visual change to the page. The scrim still
                   captures tap events on menu-open so tap-outside
                   dismisses, just without any visual signal. */
                background: transparent;
                pointer-events: none;
            }
            body.menu-open .subpage-menu-scrim {
                pointer-events: auto;
            }

            /* Brand slide+fade choreography. When the menu opens, the
               brand glides slightly LEFT of its centered home (from
               translateX(-50%) to translateX(calc(-50% - 80px))) and
               dims to opacity 0.55 so it visually steps aside without
               disappearing — per user note, "fade less, not away."
               The slide ends to the left of where the trigger pill
               sits, so the panel and brand don't fight for the same
               horizontal space. */
            .subpage-brand {
                transition: transform var(--motion-medium) var(--ease-out-soft),
                            opacity var(--motion-medium) var(--ease-out-soft);
            }
            body.menu-open .subpage-brand {
                /* Slide subtly LEFT of center and fade most of the way
                   out (not fully — per user note "fade less, not away").
                   z-index drops below nav-shell so even the residual
                   0.18-alpha ghost doesn't peek through the nav-shell
                   chrome on top of it. */
                transform: translateX(calc(-50% - clamp(40px, 8vw, 70px))) translateY(0);
                opacity: 0.18;
                pointer-events: none;
                z-index: 999;
            }
            /* Disable the existing scroll-hide behavior while the menu
               is open so a stray scroll event during open doesn't
               toggle .hidden and conflict with our open-state slide. */
            body.menu-open .subpage-brand.hidden {
                transform: translateX(calc(-50% - clamp(40px, 8vw, 70px))) translateY(0);
                opacity: 0.18;
                pointer-events: none;
                z-index: 999;
            }

            @media (prefers-reduced-motion: reduce) {
                .subpage-menu-trigger,
                .subpage-menu-icon-line,
                .subpage-menu-panel,
                .subpage-menu-list li,
                .subpage-menu-cta,
                .subpage-menu-scrim,
                .subpage-brand,
                body[class*="page-subpage"] .nav-shell,
                body[class*="page-subpage"] .nav-shell nav ul li,
                body[class*="page-subpage"] .nav-shell .brand,
                body[class*="page-subpage"] .nav-shell .nav-cta,
                body[class*="page-subpage"] .nav-shell .nav-form-btn {
                    transition: none !important;
                    filter: none !important;
                }
                body.menu-open .subpage-menu-list li {
                    transition-delay: 0ms !important;
                }
                body.menu-open .subpage-menu-cta {
                    transition-delay: 0ms !important;
                }
            }

            /* Mobile closed-state: trigger pairs with BACK as a 36x36
               chrome pill at top:18 — slightly above the prior 30x30
               so the tap target satisfies HIG ergonomics (target ≥36)
               while still reading as a quiet chrome dot. When the menu
               opens the trigger expands to the shell height + drops
               its own background so it visually MERGES with the shell
               surface instead of floating beside it as a separate
               pill. The X icon then reads as the shell's terminal
               control rather than as a standalone close button.

               Horizontal offset matches the .nav-shell side margin
               (2vw = (100vw - 96vw)/2). max() floors at 8px so the
               trigger stays a comfortable distance from the screen
               edge on iPhone 5/SE class screens. */
            @media (max-width: 960px) {
                .subpage-menu-trigger {
                    top: 18px;
                    right: max(8px, 2vw);
                    width: 36px;
                    height: 36px;
                }
                .subpage-menu-icon {
                    width: 14px;
                    height: 11px;
                    transition: width var(--motion-medium) var(--ease-out-soft),
                                height var(--motion-medium) var(--ease-out-soft);
                }
                /* Trigger stays in its closed-state position (top:18,
                   36x36, frosted bg) when the menu opens. No morph,
                   no merge. The user re-taps the same target to close.
                   Per v1.62.47 editorial + UX consult. */
            }

            /* Desktop alignment: the X right edge meets the nav-shell's
               right edge exactly. Shell desktop width is min(1280px,
               94%), so its side margin is (100% - that) / 2. Using
               that same value for the trigger's right offset means
               there is no gap or overhang between the shell and X
               when the menu opens; they look like one row of chrome.
               Vertical: in the closed state the X stays at top:24
               next to the BACK pill; on menu-open it shifts down to
               36px to align with the CONTACT pill inside the shell
               (shell top 16 + 20px padding = 36px). */
            @media (min-width: 961px) {
                .subpage-menu-trigger,
                .subpage-back {
                    --chrome-margin: max(28px, calc((100% - min(1280px, 94%)) / 2));
                }
                .subpage-menu-trigger {
                    right: var(--chrome-margin);
                }
                .subpage-back {
                    left: var(--chrome-margin);
                }
                /* Trigger stays in its closed-state position on desktop
                   too (no morph, no merge). Per v1.62.47 consult. */
            }

            @media (max-width: 960px) {
                .subpage-menu-panel {
                    top: 64px;
                    padding: var(--space-sm) var(--space-md) var(--space-md);
                    min-width: 180px;
                }
                /* On mobile the menu's compressed nav-shell sits where
                   the subpage brand was, so even a 0.18-alpha ghost of
                   the brand creates visible clutter above the bar.
                   Fade fully on mobile — desktop keeps the soft ghost
                   per the user note since there's enough horizontal
                   room for it to read as deliberate. */
                body.menu-open .subpage-brand {
                    transform: translateX(calc(-50% - 30px)) translateY(0);
                    opacity: 0;
                }
                body.menu-open .subpage-brand.hidden {
                    transform: translateX(calc(-50% - 30px)) translateY(0);
                    opacity: 0;
                }

                /* On subpage mobile, the JS applies .scrolled-mobile to
                   the nav-shell (see subpage-header.ts) so we reuse
                   the home page's compressed-nav state VERBATIM —
                   same brand hidden, same nav layout, same Contact
                   pill at the right edge. The trigger fades out on
                   menu-open (v1.62.48) so no right-side reserve is
                   needed. The subpage shell is now visually identical
                   to the home shell when open. */
            }

            /* Spacer that pushes subpage content below the floating brand +
               back button area (analogue of .nav-spacer on home). */
            .subpage-spacer {
                height: 110px;
                pointer-events: none;
            }

            /* Subpage sections compensate for the floating top zone when
               anchored to via #hash. Value lands the section's top just
               below the fog's tapered edge — close enough that there's no
               visible gap, but past the dense top portion of the fog so
               the section heading is fully readable. Matches the JS
               offset in subpage-header.ts (90px desktop / 75px mobile)
               so JS-driven and browser-native scrolls agree. */
            .page main > section[id] {
                scroll-margin-top: 90px;
            }

            @media (max-width: 960px) {
                .subpage-top-fog {
                    /* Mobile chrome (BACK + brand) bottoms out around
                       y=70-78. 100px height + bg/mask above hides the
                       chrome zone while leaving the eyebrow / first
                       heading visually clear. */
                    height: 100px;
                }
                .subpage-brand {
                    top: 16px;
                    padding: 6px 12px;
                    /* Cap the visual width so the centered wordmark
                       never collides with the BACK pill at narrow
                       phone widths. Reserves ~140px on each side
                       (BACK pill + trigger pill + breathing room). */
                    max-width: calc(100% - 280px);
                    box-sizing: border-box;
                }
                .subpage-brand .brand-title {
                    font-size: clamp(12px, 4.2vw, 20px);
                    letter-spacing: clamp(0.4px, 0.5vw, 2px);
                }
                .subpage-brand .brand-subtitle {
                    font-size: clamp(7px, 2.1vw, 10px);
                    letter-spacing: clamp(1.2px, 0.55vw, 3px);
                }
                /* Mobile: match .subpage-menu-trigger exactly so BACK
                   and X (or hamburger) form a perfectly aligned pair —
                   same top, same height, same pill radius. Left offset
                   uses the same max(8px, 2vw) formula as the trigger
                   so both pills line up with the nav-shell's side
                   margins when the shell appears. Height bumped to
                   36 to match HIG-aligned tap targets. */
                .subpage-back {
                    top: 18px;
                    left: max(8px, 2vw);
                    height: 36px;
                    padding: 0 16px;
                    font-size: var(--text-eyebrow);
                }
                .subpage-spacer {
                    height: 100px;
                }
                .page main > section[id] {
                    scroll-margin-top: 75px;
                }
            }

            .schedule-item span {
                text-transform: uppercase;
                letter-spacing: var(--tracking-wide);
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-bold);
                color: var(--text-primary-faint);
            }

            .schedule-item h3 {
                font-size: var(--text-heading);
                font-weight: var(--weight-bold);
                color: var(--text-primary);
                font-family: var(--font-display);
                line-height: var(--leading-snug);
            }

            .schedule-item p {
                color: var(--text-primary-muted);
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
                /* Dots (.carousel-nav) add margin-top:24px + 10px height = 34px below the
                   last card. Pull the section bottom up by exactly that amount so the
                   outreach→watch gap stays at the standard main gap (200px mobile /
                   120px desktop) measured from card edge, not dot edge.
                   Desktop (@min-width:961px) resets this via margin:0 — dots are hidden
                   at ≤3 cards on desktop so no compensation needed there. */
                margin-bottom: -34px;
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

            /* Reserve the FULL natural height of /outreach's events section
               so the async stay-tuned / carousel load doesn't shift the
               ministry sections below it (#meals-hospitality, #cooking-
               ministry, #community-breakfast) once events arrive.

               Previous min-height (560px) covered only the Stay Tuned card
               itself, not the eyebrow + heading + lead above it. Result:
               on a hash-jump to #community-breakfast or #cooking-ministry,
               subpage-header.ts measured the target Y, scrolled there,
               then the events fetch resolved ~500-1500ms later, the
               Stay Tuned card injected into the previously-empty bottom
               of the section, the section grew from 560 → ~856px on
               desktop, and the target ministry sat ~296px lower than
               where the user's viewport had landed.

               Measured settled height on desktop with Stay Tuned + no
               upcoming events: 855.75px. Round up to 880 to cover small
               variations in heading/lead wrapping. Mobile didn't shift
               in practice (the heading/lead wrap to enough lines that
               natural pre-load height already exceeds the old 460
               reserve), but bump it slightly for the same defense-in-
               depth posture. */
            section#events {
                min-height: 880px;
            }
            @media (max-width: 960px) {
                section#events {
                    min-height: 840px;
                }
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
                    var(--bg-color, #faf8f5) 25%,
                    rgba(250, 248, 245, 0.4) 60%,
                    rgba(250, 248, 245, 0) 100%);
            }
            .carousel-viewport::after {
                right: -40px;
                background: linear-gradient(to left,
                    var(--bg-color, #faf8f5) 25%,
                    rgba(250, 248, 245, 0.4) 60%,
                    rgba(250, 248, 245, 0) 100%);
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

            /* Mobile: one card at a time, full viewport width, swipe-to-navigate.
               Arrows hidden; dots remain for navigation indicator. */
            @media (max-width: 960px) {
                .carousel-card {
                    padding: 0 var(--space-xs);
                }
                .carousel-arrow {
                    /* !important overrides JS inline style.display = 'flex' set by render() */
                    display: none !important;
                }
                .carousel-wrapper {
                    overflow: visible;
                }
                .carousel-viewport {
                    /* Generous room for card box-shadows on all sides;
                       16px horizontal bleed lets shadows fade naturally (adjacent cards
                       are a full viewport-width away, so no bleed-through risk) */
                    clip-path: inset(-60px -16px -60px -16px);
                }
                /* Thin fog overlays at clip edges — softens shadow falloff */
                .carousel-viewport::before,
                .carousel-viewport::after {
                    width: 24px;
                    top: -60px;
                    bottom: -60px;
                }
                .carousel-viewport::before {
                    left: -16px;
                }
                .carousel-viewport::after {
                    right: -16px;
                }
            }
            /* ≤899px: no carousel-wrapper margin needed — section has no side padding,
               so carousel naturally fills the full section/viewport width */

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
                border-radius: var(--radius-circle);
                background: rgba(255, 255, 255, 0.82);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.5);
                box-shadow: var(--shadow-sm);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all var(--motion-medium) ease;
                font-size: var(--text-body);
                color: var(--text-primary);
            }

            /* Arrows pushed to section edge — negative offset places them well outside
               the white outer-card, in the gray margin. clip-path extends 24px so
               -20px is safely within the visible area. Desktop overrides to 24px. */
            .carousel-arrow.prev {
                left: -20px;
            }

            .carousel-arrow.next {
                right: -20px;
            }

            .carousel-arrow:hover {
                background: var(--white);
                box-shadow: var(--shadow-sm);
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
                border-radius: var(--radius-circle);
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
                border-radius: var(--radius-xl);
                overflow: hidden;
                background: transparent;
                box-shadow: var(--shadow-md);
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
                border-radius: var(--radius-lg);
            }

            /* Tap target over the flyer that opens the detail lightbox. Sits
               above the image; the hint chip fades in on hover (desktop) and
               stays gently visible on touch, so the flyer reads as "tap for
               details" without adding chrome to the card. */
            .event-flyer-trigger {
                position: absolute;
                inset: 0;
                z-index: 3;
                display: flex;
                align-items: flex-end;
                justify-content: center;
                padding: 14px;
                margin: 0;
                border: none;
                background: transparent;
                cursor: pointer;
                -webkit-appearance: none;
                appearance: none;
            }
            .event-flyer-trigger:focus-visible {
                outline: 2px solid var(--gold);
                outline-offset: -3px;
                border-radius: var(--radius-lg);
            }
            .event-flyer-hint {
                display: inline-flex;
                align-items: center;
                padding: 7px 15px;
                border-radius: var(--radius-pill);
                background: rgba(255, 255, 255, 0.85);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.6);
                box-shadow: var(--shadow-sm);
                color: var(--text-primary);
                font-size: var(--text-small);
                font-weight: var(--weight-semibold);
                letter-spacing: 0.2px;
                opacity: 0;
                transform: translateY(8px);
                transition: opacity var(--motion-medium) var(--ease-out-soft),
                            transform var(--motion-medium) var(--ease-out-soft);
            }
            .event-flyer-wrapper:hover .event-flyer-hint,
            .event-flyer-trigger:focus-visible .event-flyer-hint {
                opacity: 1;
                transform: translateY(0);
            }
            @media (hover: none) {
                .event-flyer-hint { opacity: 0.9; transform: none; }
            }
            @media (prefers-reduced-motion: reduce) {
                .event-flyer-hint { transition: opacity var(--motion-fast) linear; transform: none; }
            }

            /* ── Upcoming event detail lightbox ─────────────────────────────
               A light editorial card (flyer + when/where facts + formatted
               body + CTAs) over a dimmed backdrop. Opened by tapping an
               upcoming card's flyer; mirrors the past-events modal mechanics
               (.active toggle, body.modal-open, Esc / backdrop close). */
            .event-detail-modal {
                position: fixed;
                inset: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: clamp(16px, 4vw, 40px);
                background: rgba(31, 26, 20, 0.55);
                backdrop-filter: blur(6px);
                -webkit-backdrop-filter: blur(6px);
                opacity: 0;
                visibility: hidden;
                transition: opacity var(--motion-medium) var(--ease-out-soft),
                            visibility 0s linear var(--motion-medium);
            }
            .event-detail-modal.active {
                opacity: 1;
                visibility: visible;
                transition: opacity var(--motion-medium) var(--ease-out-soft);
            }
            .event-detail-card {
                position: relative;
                width: 100%;
                max-width: 860px;
                max-height: 90vh;
                overflow: hidden;
                background: var(--bg);
                border-radius: var(--radius-2xl);
                box-shadow: var(--shadow-overlay);
                transform: translateY(16px) scale(0.985);
                opacity: 0;
                transition: transform var(--motion-medium) var(--ease-out-soft),
                            opacity var(--motion-medium) var(--ease-out-soft);
            }
            .event-detail-modal.active .event-detail-card {
                transform: translateY(0) scale(1);
                opacity: 1;
            }
            .event-detail-close {
                position: absolute;
                top: 14px;
                right: 14px;
                z-index: 4;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid rgba(255, 255, 255, 0.6);
                border-radius: var(--radius-circle);
                background: rgba(255, 255, 255, 0.82);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                box-shadow: var(--shadow-sm);
                font-size: var(--text-heading);
                line-height: 1;
                color: var(--text-primary);
                cursor: pointer;
                transition: transform var(--motion-fast) var(--ease-standard),
                            background var(--motion-fast) var(--ease-standard);
            }
            .event-detail-close:hover { background: var(--white); transform: scale(1.06); }
            .event-detail-content {
                display: grid;
                grid-template-columns: 1fr;
                max-height: 90vh;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
            }
            .event-detail-figure {
                background: var(--surface);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .event-detail-flyer-img {
                display: block;
                width: 100%;
                height: auto;
                /* Reserve a portrait slot before the image decodes so the card
                   geometry is stable from frame 0 — a late (cold-cache) image
                   then fills the slot (object-fit: contain) with no reflow/jump.
                   max-height clamps it on short viewports; both endpoints are
                   known pre-load, so there is never a post-fade snap. */
                aspect-ratio: 3 / 4;
                max-height: 48vh;
                object-fit: contain;
            }
            .event-detail-placeholder {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                aspect-ratio: 16 / 9;
                background: linear-gradient(135deg, var(--gold), var(--gold-dark));
                font-size: 56px;
            }
            .event-detail-info {
                padding: clamp(22px, 3vw, 36px);
                display: flex;
                flex-direction: column;
                gap: var(--space-md);
            }
            .event-detail-eyebrow {
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
                color: var(--gold);
            }
            .event-detail-title {
                font-family: var(--font-display);
                font-size: var(--text-title);
                font-weight: var(--weight-semibold);
                line-height: var(--leading-tight);
                color: var(--text-primary);
                margin: -4px 0 0;
            }
            .event-detail-facts {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: var(--space-sm) var(--space-md);
                margin: 0;
                padding: var(--space-md) 0;
                border-top: 1px solid var(--text-primary-hairline);
                border-bottom: 1px solid var(--text-primary-hairline);
            }
            .event-fact { display: flex; flex-direction: column; gap: 3px; }
            .event-fact dt {
                font-size: var(--text-micro);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
                color: var(--text-primary-faint);
            }
            .event-fact dd {
                margin: 0;
                font-size: var(--text-compact);
                color: var(--text-primary);
                line-height: var(--leading-snug);
            }
            .event-fact dd a {
                color: var(--gold-dark);
                text-decoration: none;
                border-bottom: 1px solid color-mix(in srgb, var(--gold) 40%, transparent);
                transition: color var(--motion-fast) var(--ease-standard);
            }
            .event-fact dd a:hover { color: var(--gold); }
            .event-detail-body {
                font-size: var(--text-body);
                line-height: var(--leading-normal);
                color: var(--text-primary-soft);
            }
            .event-detail-body p { margin: 0 0 var(--space-sm); }
            .event-detail-body p:last-child { margin-bottom: 0; }
            .event-detail-body ul { margin: 0 0 var(--space-sm); padding-left: 1.3em; }
            .event-detail-body li { margin: 0 0 4px; }
            .event-detail-ctas {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-sm);
                margin-top: var(--space-xs);
            }
            .event-detail-ctas .event-link-btn { width: auto; flex: 1 1 auto; min-width: 180px; }
            @media (min-width: 961px) {
                .event-detail-content {
                    grid-template-columns: minmax(0, 340px) minmax(0, 1fr);
                    align-items: start;
                }
                .event-detail-figure { position: sticky; top: 0; align-self: start; }
                .event-detail-flyer-img { max-height: 86vh; }
            }
            @media (prefers-reduced-motion: reduce) {
                .event-detail-modal { transition: opacity var(--motion-fast) linear, visibility 0s linear var(--motion-fast); }
                .event-detail-card { transition: opacity var(--motion-fast) linear; transform: none; }
                .event-detail-modal.active .event-detail-card { transform: none; }
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
                font-size: var(--text-body);
                color: var(--text-primary-faint);
                font-weight: var(--weight-semibold);
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
                border-radius: var(--radius-lg);
                border: 1px solid rgba(255, 255, 255, 0.7);
                padding: 12px;
                box-shadow: var(--shadow-md);
                box-sizing: border-box;
                transition: box-shadow 0.35s ease;
            }

            .event-outer-card:hover {
                box-shadow: var(--shadow-md);
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
                font-size: var(--text-body);
                font-weight: var(--weight-bold);
                letter-spacing: 1.5px;
                color: var(--gold);
                text-transform: uppercase;
                white-space: nowrap;
                line-height: 1;
            }

            /* Time text — plain gold, right side of header (hidden when all-day) */
            .event-time-pill {
                font-size: var(--text-body);
                font-weight: var(--weight-bold);
                letter-spacing: 1.5px;
                color: var(--gold);
                text-transform: uppercase;
                white-space: nowrap;
                line-height: 1;
            }

            /* ───────────────────────────────────────────────────────────
               .event-link-btn — THE CANONICAL CTA BUTTON
               Single source of truth for the gold pill button shape used
               across the site (hero "Plan a Visit", "Explore Our
               Ministries", "Explore Our Outreach", "Learn More About Us",
               "Read Our Statement of Beliefs", "Contact Us" page-level
               CTAs, "Get Directions" on /visit, event-card CTAs, etc.).
               Color/shadow come from --btn-cta-* tokens; only modifiers
               below change size, alignment, or color variant.
               --------------------------------------------------------- */
            .event-link-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                width: 100%;
                padding: 12px 24px;
                position: relative;
                z-index: 2;
                border: none;
                font-family: var(--font-body);
                background: var(--btn-cta-bg);
                border-radius: var(--radius-pill);
                font-size: var(--text-small);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
                color: #ffffff;
                text-decoration: none;
                cursor: pointer;
                white-space: nowrap;
                box-shadow: var(--btn-cta-shadow);
                transition: all var(--motion-medium) var(--ease-standard);
                box-sizing: border-box;
            }

            .event-link-btn:hover {
                background: var(--btn-cta-bg-hover);
                box-shadow: var(--btn-cta-shadow-hover);
                transform: translateY(-2px);
            }

            /* Red color variant — used by the YouTube playlist CTA in the
               /watch section. Same shape, padding, type, motion, hover-lift
               as the gold default; only background gradient + shadow tint
               change. */
            .event-link-btn.event-link-btn--red {
                background: var(--btn-cta-bg-red);
                box-shadow: var(--btn-cta-shadow-red);
            }
            .event-link-btn.event-link-btn--red:hover {
                background: var(--btn-cta-bg-red-hover);
                box-shadow: var(--btn-cta-shadow-red-hover);
            }

            /* Browse Memories button — sentence case, no wide tracking */
            #carousel-see-past-btn {
                text-transform: none;
                letter-spacing: 0.3px;
            }

            /* MEMORIES text inside .event-card-header — matches date/time plain gold style */
            .event-card-header .past-card-badge {
                font-size: var(--text-body);
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

            /* Event-card CTA overlay — kept intentionally distinct from
               the canonical gold pill so a card showing both a primary
               .event-link-btn (e.g. "Get Directions") and a secondary
               .event-cta link (e.g. "Register Now" from calendar event
               description) reads as two distinct calls instead of two
               competing gold pills. White-on-card, square-ish radius,
               subtle shadow. Selector targets the new canonical class
               since .btn was removed in v1.57.0. */
            .event-cta .event-link-btn {
                background: rgba(255, 255, 255, 0.85);
                color: var(--text-primary);
                box-shadow: var(--shadow-sm);
                border-radius: var(--radius-md);
                text-transform: none;
                letter-spacing: var(--tracking-normal);
            }

            .event-cta .event-link-btn:hover {
                background: var(--white);
                box-shadow: var(--shadow-md);
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
                border-radius: var(--radius-lg);
                box-shadow: 0 2px 20px rgba(0, 0, 0, 0.07),
                            inset 0 0 0 1px rgba(0, 0, 0, 0.055);
                background: rgba(250, 248, 245, 0.6);
                position: relative;
                cursor: pointer;
                padding: 24px 16px;
            }
            @media (max-width: 960px) {
                .event-outer-card {
                    border-radius: var(--radius-xl);  /* match .section-card at this breakpoint */
                }
            }
            .carousel-past-card .past-card-badge {
                position: absolute; top: 12px; left: 12px;
                background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
                color: #ffffff; font-size: var(--text-eyebrow); font-weight: var(--weight-bold);
                padding: 5px 10px; border-radius: var(--radius-pill);
                letter-spacing: var(--tracking-wide);
                box-shadow: 0 4px 16px color-mix(in srgb, var(--gold) 35%, transparent);
            }
            .carousel-past-card .past-card-icon { font-size: var(--text-title); margin-bottom: 10px; }
            .carousel-past-card .past-card-title {
                font-family: inherit;
                font-size: var(--text-heading); font-weight: var(--weight-semibold); margin: 0 0 8px 0; color: var(--text-primary);
            }
            .carousel-past-card .past-card-text {
                font-size: var(--text-body); color: var(--text-primary-muted);
                line-height: var(--leading-normal); margin-bottom: 14px;
            }
            .carousel-past-card .past-card-btn {
                display: flex; align-items: center; justify-content: center;
                width: 100%; padding: 12px 24px; box-sizing: border-box;
                background: var(--btn-cta-bg);
                border: none; color: #ffffff; border-radius: var(--radius-pill);
                font-size: var(--text-small); font-weight: var(--weight-bold);
                letter-spacing: 0.3px; text-transform: none;
                cursor: pointer; transition: all var(--motion-medium) var(--ease-standard);
                box-shadow: var(--btn-cta-shadow);
                position: relative; z-index: 2;
            }
            .carousel-past-card .past-card-btn:hover {
                background: var(--btn-cta-bg-hover);
                box-shadow: var(--btn-cta-shadow-hover);
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
                box-shadow: var(--shadow-xl);
                border: 1px solid rgba(255, 255, 255, 0.5);
                min-height: auto;
                border-radius: var(--radius-lg);
                position: relative;
                overflow: hidden;
                transition: all var(--motion-slow) var(--ease-standard);
                /* Bound the card so width-100% + aspect-ratio 3/4 can't grow
                   into a 1500px-tall block on desktop (which was causing
                   CLS=0.4 on /outreach and looked absurd visually). 420px
                   wide keeps it "phone-shaped" at any breakpoint. */
                aspect-ratio: 3/4;
                width: 100%;
                max-width: 420px;
                margin: 0 auto;
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
                border-radius: var(--radius-circle);
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
                /* min-height intentionally NOT reset here — the section#events
                   min-height reserve (set above) is what prevents the
                   stay-tuned/carousel async-load from shifting #meals-
                   hospitality / #cooking-ministry / #community-breakfast
                   below it. Earlier this rule overrode the reserve to
                   "auto" once .stay-tuned-only was added by JS, which
                   defeated the whole point of the reserve: section
                   would render at its reserved height, then collapse
                   to natural content height the moment .stay-tuned-
                   only landed, shifting everything below by ~25-300px
                   right after a hash-jump's scrollTo had landed at the
                   pre-collapse position. */
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
                color: var(--text-primary);
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
                border: 1.5px solid var(--text-primary-fade);
                border-radius: var(--radius-pill);
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-semibold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
                color: #4a4a5e;
                cursor: pointer;
                transition: all var(--motion-medium) var(--ease-standard);
                flex-shrink: 0;
                backdrop-filter: blur(8px);
                box-shadow: var(--shadow-sm);
            }

            .btn-view-past-events:hover {
                background: rgba(255, 255, 255, 0.85);
                border-color: var(--text-primary-fade);
                color: #3a3a50;
                transform: translateY(-1px);
                box-shadow: var(--shadow-sm);
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
                transition: opacity 0.35s var(--ease-standard);
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
                font-family: var(--font-display);
                font-size: var(--text-heading);
                font-weight: var(--weight-semibold);
                color: #ffffff;
                margin: 0;
            }
            
            .past-events-modal-close {
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: var(--radius-circle);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: var(--text-heading);
                color: rgba(255, 255, 255, 0.8);
                transition: all var(--motion-medium) ease;
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
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-xl);
            }
            
            .past-event-slide {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.4s var(--ease-standard);
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
                border-radius: 0 0 var(--radius-lg) var(--radius-lg);
            }

            .past-event-slide-date {
                display: inline-block;
                padding: 5px 12px;
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(8px);
                border-radius: var(--radius-pill);
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
                border-radius: var(--radius-circle);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: var(--text-heading);
                color: rgba(255, 255, 255, 0.8);
                transition: all var(--motion-medium) ease;
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
                border-radius: var(--radius-circle);
                background: rgba(255, 255, 255, 0.25);
                cursor: pointer;
                transition: all var(--motion-medium) ease;
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
            @media (max-width: 960px) {
                .past-events-modal { padding: 16px; }
                .past-events-modal-content { max-width: 100%; }
                .past-events-slides { max-width: 100%; }

                .past-events-nav.prev { left: 8px; }
                .past-events-nav.next { right: 8px; }

                .past-events-nav {
                    width: clamp(36px, 5vw, 44px);
                    height: clamp(36px, 5vw, 44px);
                    font-size: var(--text-heading);
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
                font-size: var(--text-title);
                margin-bottom: 16px;
                opacity: 0.6;
            }
            
            .past-events-empty-text {
                font-size: var(--text-body);
                line-height: var(--leading-normal);
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
                transition: transform 0.5s var(--ease-standard);
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
                border-radius: var(--radius-circle);
                background: rgba(255, 255, 255, 0.4);
                border: 2px solid rgba(255, 255, 255, 0.6);
                cursor: pointer;
                transition: all var(--motion-medium) ease;
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
                transition: opacity var(--motion-medium) var(--ease-standard);
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
                transition: transform var(--motion-medium) var(--ease-standard);
            }
            
            .lightbox-image {
                max-width: 100%;
                max-height: 95vh;
                object-fit: contain;
                border-radius: var(--radius-md);
                box-shadow: var(--shadow-xl);
                cursor: zoom-in;
                transition: transform var(--motion-medium) var(--ease-standard);
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
                border-radius: var(--radius-circle);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                font-weight: var(--weight-regular);
                color: var(--text-primary);
                box-shadow: var(--shadow-md);
                transition: all var(--motion-medium) var(--ease-standard);
                z-index: 10000;
                line-height: 1;
            }
            
            .lightbox-close:hover {
                background: #fff;
                transform: scale(1.1) rotate(90deg);
                box-shadow: var(--shadow-md);
            }
            
            .lightbox-instructions {
                position: fixed;
                bottom: 32px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 255, 255, 0.9);
                padding: 12px 28px;
                border-radius: var(--radius-pill);
                font-size: var(--text-label);
                font-weight: var(--weight-semibold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
                color: var(--text-primary);
                box-shadow: var(--shadow-md);
                backdrop-filter: blur(10px);
                z-index: 10000;
                opacity: 0.8;
                transition: opacity var(--motion-medium) var(--ease-standard);
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
                background: rgba(255, 255, 255, 0.85);
                border-radius: var(--radius-2xl);
                padding: 48px;
                color: var(--text-primary);
                box-shadow: var(--shadow-xl);
                position: relative;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.6);
                backdrop-filter: blur(20px);
            }

            .watch-main {
                position: relative;
                z-index: 1;
                display: flex;
                flex-direction: column;
                gap: 32px;
            }

            .preview-screen {
                background: rgba(248, 249, 253, 0.6);
                border-radius: var(--radius-lg);
                border: 1px solid rgba(0, 0, 0, 0.06);
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
                background: color-mix(in srgb, var(--gold) 12%, transparent);
                border-radius: var(--radius-pill);
                padding: 8px 20px;
                color: var(--gold-deeper);
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
            }

            .live-dot {
                width: 10px;
                height: 10px;
                border-radius: var(--radius-circle);
                background: var(--gold);
                box-shadow: 0 0 16px color-mix(in srgb, var(--gold) 60%, transparent);
                animation: pulse 2s ease-in-out infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.1); }
            }

            .preview-screen p {
                color: var(--text-primary-soft);
                line-height: var(--leading-loose);
                font-size: var(--text-lead);
            }

            .preview-screen small {
                display: block;
                color: #8B0000;
                font-size: var(--text-small);
                margin-top: 8px;
                letter-spacing: var(--tracking-normal);
            }

            /* .btn-outline was removed in v1.57.0. The /watch playlist
               button is now .event-link-btn.event-link-btn--red — same
               canonical shape / padding / type / motion as the gold pill,
               just red. .playlist-btn (below) remains as a layout helper
               for watch-section-specific spacing + auto width. */

            .past-streams {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 24px;
                margin-top: 16px;
            }

            .stream-thumbnail {
                aspect-ratio: 16/9;
                background: rgba(0, 0, 0, 0.04);
                border-radius: var(--radius-md);
                border: 1px solid rgba(0, 0, 0, 0.08);
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-primary-faint);
                font-size: var(--text-small);
                font-weight: var(--weight-semibold);
                text-transform: uppercase;
                letter-spacing: 1px;
                transition: all var(--motion-medium) var(--ease-standard);
                cursor: pointer;
            }

            .stream-thumbnail:hover {
                background: rgba(0, 0, 0, 0.08);
                border-color: rgba(139, 0, 0, 0.2);
                transform: translateY(-4px);
            }

            .past-streams-label {
                font-size: var(--text-small);
                font-weight: var(--weight-semibold);
                text-transform: uppercase;
                letter-spacing: var(--tracking-wide);
                color: var(--text-primary-faint);
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
                color: var(--text-primary-soft);
                line-height: var(--leading-loose);
                font-size: var(--text-lead);
                text-align: center;
                margin: 0;
                font-style: italic;
            }

            .live-verse small {
                display: block;
                color: var(--gold-dark);
                font-size: var(--text-small);
                margin-top: 8px;
                letter-spacing: 1px;
                font-style: normal;
                font-weight: var(--weight-semibold);
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
                color: var(--text-primary-faint);
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-semibold);
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
                font-size: var(--text-heading);
                font-weight: var(--weight-bold);
                color: var(--gold-dark);
                font-family: var(--font-display);
                line-height: 1;
            }

            .countdown-label-small {
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-semibold);
                text-transform: uppercase;
                letter-spacing: var(--tracking-normal);
                color: var(--text-primary-muted);
            }
            
            /* Playlist Button — overrides .teaser-cta's align-self: start
               so the red CTA sits centered under the 3 video cards on
               every viewport. (Without this, .teaser-cta wins specificity
               with align-self: start and the button hugs the left edge
               of the flex-column .watch-main parent.) Selector uses the
               two-class form .teaser-cta.playlist-btn to match the same
               specificity as .event-link-btn.teaser-cta and win via later
               source order. */
            .teaser-cta.playlist-btn {
                margin-top: 16px;
                width: auto;
                display: inline-flex;
                align-self: center;
            }
            
            .video-embed-wrapper {
                position: relative;
                width: 100%;
                padding-bottom: 56.25%; /* 16:9 aspect ratio */
                height: 0;
                overflow: hidden;
                border-radius: var(--radius-md);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.10),
                            0 16px 48px color-mix(in srgb, var(--gold) 12%, transparent);
            }

            .youtube-embed,
            .youtube-embed iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
                border-radius: var(--radius-md);
            }

            /* Custom YouTube Thumbnail Overlay */
            .video-thumbnail {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                cursor: pointer;
                z-index: 2;
                transition: opacity 250ms ease;
                background: #0a0a0a;
                border-radius: var(--radius-md);
            }

            .video-thumbnail.hidden {
                opacity: 0;
                pointer-events: none;
            }

            .video-thumbnail-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: var(--radius-md);
                display: block;
            }

            .video-play-btn {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
                z-index: 3;
                transition: transform 150ms ease;
            }

            .video-play-btn:hover:not(.is-loading):not(.is-revealing) {
                transform: translate(-50%, -50%) scale(1.1);
            }

            .video-play-btn:hover:not(.is-loading):not(.is-revealing) .video-play-btn-bg {
                fill: var(--gold-dark);
            }

            /* Brand-gold play button (was YouTube red). The CSS fill overrides the
               SVG presentation attribute, so the markup keeps its #FF0000 fallback
               for any no-CSS context while the button reads as the brand gold. */
            .video-play-btn-bg {
                fill: var(--gold);
            }
            .play-spinner-ring {
                stroke: var(--gold);
            }

            /* Play button morph-to-spinner — single SVG, no element swap */
            .video-play-btn-bg,
            .play-triangle {
                transition: opacity 400ms cubic-bezier(0.4, 0, 0.2, 1);
            }

            .play-spinner-ring {
                opacity: 0;
                transform-origin: center;
                transform-box: fill-box;
                transition: opacity 350ms cubic-bezier(0.4, 0, 0.2, 1);
            }

            /* Loading: play shapes fade out, ring fades in already spinning */
            .video-play-btn.is-loading .video-play-btn-bg {
                opacity: 0;
            }

            .video-play-btn.is-loading .play-triangle {
                opacity: 0;
            }

            .video-play-btn.is-loading .play-spinner-ring {
                opacity: 1;
                animation: playBtnSpin 1.1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }

            /* Revealing: spinner and thumbnail fade out together (is-loading stays on) */
            .video-play-btn.is-revealing .play-spinner-ring {
                opacity: 0;
                transition: opacity 600ms cubic-bezier(0.4, 0, 0.2, 1);
                animation: playBtnSpin 1.1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }

            .video-play-btn.is-revealing .video-play-btn-bg,
            .video-play-btn.is-revealing .play-triangle {
                opacity: 0;
            }

            .video-thumbnail.is-revealing {
                opacity: 0;
                pointer-events: none;
                transition: opacity 600ms cubic-bezier(0.4, 0, 0.2, 1);
            }

            @keyframes playBtnSpin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .video-fallback-link {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 2;
                background: rgba(0, 0, 0, 0.7);
                color: #fff;
                padding: 16px 32px;
                border-radius: var(--radius-md);
                font-family: var(--font-body);
                font-size: var(--text-body);
                text-decoration: none;
                transition: background var(--motion-fast) ease;
            }

            .video-fallback-link:hover {
                background: rgba(0, 0, 0, 0.85);
            }

            /* Unmute overlay button — shown during muted auto-play */
            .video-unmute-btn {
                position: absolute;
                bottom: 16px;
                left: 16px;
                z-index: 10;
                display: flex;
                align-items: center;
                gap: 8px;
                background: rgba(0, 0, 0, 0.75);
                color: #fff;
                border: 1px solid rgba(255, 255, 255, 0.25);
                border-radius: var(--radius-sm);
                padding: 10px 18px;
                font-family: var(--font-body);
                font-size: var(--text-small);
                font-weight: var(--weight-medium);
                letter-spacing: 0.3px;
                cursor: pointer;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                transition: opacity var(--motion-medium) ease, transform var(--motion-medium) ease, background var(--motion-fast) ease;
                opacity: 0;
                transform: translateY(8px);
                pointer-events: none;
            }
            .video-unmute-btn.visible {
                opacity: 1;
                transform: translateY(0);
                pointer-events: auto;
            }
            .video-unmute-btn:hover {
                background: rgba(0, 0, 0, 0.9);
            }
            .video-unmute-btn svg {
                flex-shrink: 0;
            }
            .video-unmute-btn.hiding {
                opacity: 0;
                transform: translateY(8px);
                pointer-events: none;
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
                border-radius: var(--radius-md);
                box-shadow: 0 8px 32px rgba(139, 0, 0, 0.2),
                            0 16px 48px rgba(139, 0, 0, 0.1);
                background: rgba(248, 249, 253, 0.6);
            }
            
            .youtube-playlist {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
                border-radius: var(--radius-md);
            }

            /* Video Grid (mobile baseline: single-card stack — only the latest is visible) */
            .video-grid {
                display: flex;
                flex-direction: column;
                width: 100%;
                gap: 24px;
                align-items: stretch;
            }

            .video-card {
                display: flex;
                flex-direction: column;
                gap: 14px;
                text-decoration: none;
                color: inherit;
                width: 100%;
            }

            .video-card-recent {
                display: none; /* Hidden on mobile — only the latest card shows */
            }

            /* Mobile preserves the original watch layout (single video, no meta) */
            .video-card-meta {
                display: none;
            }

            .video-card-tag {
                display: inline-flex;
                align-self: flex-start;
                align-items: center;
                gap: 6px;
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-bold);
                letter-spacing: 1.6px;
                text-transform: uppercase;
                color: var(--gold-deeper);
                background: color-mix(in srgb, var(--gold) 10%, transparent);
                border-radius: var(--radius-pill);
                padding: 5px 12px;
                margin-bottom: 2px;
            }

            .video-card-date {
                font-size: var(--text-label);
                font-weight: var(--weight-semibold);
                letter-spacing: 1.2px;
                text-transform: uppercase;
                color: var(--text-primary-faint);
            }

            .video-card-title {
                font-family: var(--font-display);
                font-size: var(--text-heading);
                line-height: var(--leading-snug);
                font-weight: var(--weight-semibold);
                color: var(--text-primary);
                margin: 0;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            /* Recent (smaller) card thumbnail — link-style, click opens YouTube */
            .video-card-thumb {
                position: relative;
                width: 100%;
                aspect-ratio: 16 / 9;
                border-radius: var(--radius-md);
                overflow: hidden;
                background: #0a0a0a;
                box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12),
                            0 12px 40px color-mix(in srgb, var(--gold) 10%, transparent);
                transition: transform 0.4s var(--ease-standard),
                            box-shadow 0.4s var(--ease-standard);
            }

            .video-card-thumb-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
                transition: transform var(--motion-slow) var(--ease-standard);
            }

            .video-card-play {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                opacity: 0.92;
                transition: transform var(--motion-medium) var(--ease-standard),
                            opacity var(--motion-medium) ease;
                pointer-events: none;
                filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35));
            }

            .video-card-recent:hover .video-card-thumb {
                transform: translateY(-4px);
                box-shadow: 0 14px 36px rgba(0, 0, 0, 0.18),
                            0 18px 48px color-mix(in srgb, var(--gold) 14%, transparent);
            }

            .video-card-recent:hover .video-card-thumb-img {
                transform: scale(1.04);
            }

            .video-card-recent:hover .video-card-play {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.08);
            }

            .video-card-recent:hover .video-card-title {
                color: var(--gold-dark);
            }

            /* Recent-card play glyph: gold YouTube-shape (first path), white
               triangle (last path). CSS fill overrides the #FF0000 markup attr. */
            .video-card-play svg path:first-child {
                fill: var(--gold);
            }

            .video-card-title {
                transition: color var(--motion-medium) ease;
            }

            /* Source card fades while its video is centered in the player overlay */
            .video-card.is-source {
                transition: opacity 0.4s ease;
            }
            .video-card.is-source-hidden {
                opacity: 0;
                pointer-events: none;
            }

            /* Centered video player overlay (desktop only; opens on click of any card) */
            .video-player-overlay {
                position: fixed;
                inset: 0;
                z-index: 9999;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.35s ease;
                display: none;
            }
            .video-player-overlay.is-mounted {
                display: block;
            }
            .video-player-overlay.is-active {
                pointer-events: auto;
                opacity: 1;
            }
            .video-player-backdrop {
                position: absolute;
                inset: 0;
                background: rgba(12, 12, 22, 0.82);
                backdrop-filter: blur(14px) saturate(120%);
                -webkit-backdrop-filter: blur(14px) saturate(120%);
                cursor: pointer;
            }
            .video-player-stage {
                position: absolute;
                top: 50%;
                left: 50%;
                width: min(1100px, 88vw);
                max-height: 86vh;
                transform: translate(-50%, -50%);
                aspect-ratio: 16 / 9;
            }
            .video-player-frame {
                position: relative;
                width: 100%;
                height: 100%;
                border-radius: var(--radius-lg);
                overflow: hidden;
                background-color: #050505;
                background-size: cover;
                background-position: center;
                box-shadow: 0 50px 120px rgba(0, 0, 0, 0.55),
                            0 20px 60px color-mix(in srgb, var(--gold) 18%, transparent);
                transform-origin: center center;
                transition: transform var(--motion-slow) var(--ease-out-soft);
                will-change: transform;
            }
            .video-player-slot {
                position: absolute;
                inset: 0;
            }
            .video-player-slot iframe {
                width: 100%;
                height: 100%;
                border: 0;
                display: block;
            }
            .video-player-close {
                position: absolute;
                top: -54px;
                right: 0;
                width: 42px;
                height: 42px;
                border-radius: var(--radius-circle);
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.22);
                color: #fff;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transform: translateY(6px);
                transition: opacity 0.3s ease 0.25s,
                            transform 0.3s ease 0.25s,
                            background 0.2s ease,
                            border-color 0.2s ease;
                padding: 0;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
            }
            .video-player-overlay.is-active .video-player-close {
                opacity: 1;
                transform: translateY(0);
            }
            .video-player-close:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.4);
            }
            .video-player-close:focus-visible {
                outline: 2px solid rgba(255, 255, 255, 0.6);
                outline-offset: 3px;
            }

            /* Contact Section — two-column editorial layout on desktop:
               invitation + ways-to-reach-us on the left, the form on the right.
               Collapses to a single stacked column on mobile. */
            .contact {
                display: grid;
                grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
                gap: var(--space-2xl);
                align-items: start;
            }

            .contact-header {
                text-align: left;
                max-width: 480px;
                margin: 0;
                padding: 0;
            }

            /* Per-CTA "subject" banner — shown when the contact form is opened
               with a ?topic= (e.g. "Join the next cook"). Flat editorial
               treatment: a gold left rule + a small gold label, not a button.
               JS toggles [hidden] then .is-visible; only opacity + transform
               animate (never height), so it can't disturb the hashload landing. */
            .contact-topic-banner {
                display: flex;
                align-items: baseline;
                flex-wrap: wrap;
                column-gap: var(--space-xs);
                row-gap: 4px;
                margin: 0 0 var(--space-sm);
                padding-left: var(--space-sm);
                border-left: 2px solid var(--gold);
                opacity: 0;
                transform: translateY(6px);
                transition: opacity var(--motion-medium) var(--ease-out-soft),
                            transform var(--motion-medium) var(--ease-out-soft);
            }
            .contact-topic-banner.is-visible {
                opacity: 1;
                transform: translateY(0);
            }
            .contact-topic-banner-label {
                flex: none;
                font-family: var(--font-body), 'Inter', sans-serif;
                font-size: var(--text-eyebrow);
                font-weight: var(--weight-semibold);
                letter-spacing: var(--tracking-wider);
                text-transform: uppercase;
                color: var(--gold-dark);
                line-height: 1.2;
            }
            .contact-topic-banner-text {
                font-family: var(--font-display), 'Playfair Display', serif;
                font-size: var(--text-lead);
                font-weight: var(--weight-medium);
                color: var(--text-primary);
                line-height: var(--leading-snug);
            }
            @media (prefers-reduced-motion: reduce) {
                .contact-topic-banner {
                    transition: none;
                    transform: none;
                }
            }

            .contact-form-col {
                width: 100%;
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
                border-radius: var(--radius-md);
                box-shadow: var(--shadow-md);
                transition: all var(--motion-medium) var(--ease-standard);
            }
            
            .gift-image {
                cursor: pointer;
            }
            
            .gift-image:hover {
                transform: translateY(-4px) scale(1.05);
                box-shadow: var(--shadow-md);
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
                border-radius: var(--radius-sm);
                box-shadow: var(--shadow-xl);
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
                border-radius: var(--radius-circle);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: var(--text-heading);
                color: white;
                transition: all var(--motion-medium) ease;
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
                border-radius: var(--radius-circle);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 28px;
                color: white;
                transition: all var(--motion-medium) ease;
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
                border-radius: var(--radius-pill);
                transition: all var(--motion-medium) var(--ease-standard);
                text-align: center;
            }
            
            .btn-see-flyer:hover {
                transform: translateY(-2px);
                background: var(--white) !important;
                box-shadow: var(--shadow-md) !important;
                border-color: var(--text-primary-hairline) !important;
            }
            
            .contact-container {
                width: 100%;
            }
            
            .contact-card {
                background: rgba(255, 255, 255, 0.85);
                border-radius: var(--radius-2xl);
                padding: 64px;
                box-shadow: var(--shadow-xl);
                border: 1px solid rgba(255, 255, 255, 0.6);
                backdrop-filter: blur(20px);
                display: grid;
                grid-template-columns: 1.5fr 1fr;
                gap: 64px;
                align-items: start;
                transition: all var(--motion-slow) var(--ease-standard);
            }
            
            .contact-card:hover {
                box-shadow: var(--shadow-xl);
                transform: translateY(-4px);
            }
            
            .contact-form {
                display: flex;
                flex-direction: column;
                gap: var(--space-md);
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--space-md);
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: var(--space-xs);
            }
            
            .form-group-full {
                grid-column: 1 / -1;
            }
            
            .form-group label {
                font-size: var(--text-small);
                font-weight: var(--weight-semibold);
                letter-spacing: var(--tracking-normal);
                color: var(--text-primary-soft);
            }

            .form-group input,
            .form-group select,
            .form-group textarea {
                padding: 14px 16px;
                border: 1px solid color-mix(in srgb, var(--text-primary) 20%, transparent);
                border-radius: var(--radius-sm);
                font-size: var(--text-body);
                font-family: var(--font-body);
                background: var(--surface);
                color: var(--text-primary);
                transition: border-color var(--motion-fast) var(--ease-standard),
                            box-shadow var(--motion-fast) var(--ease-standard),
                            background var(--motion-fast) var(--ease-standard);
            }

            .form-group input::placeholder,
            .form-group textarea::placeholder {
                color: var(--text-primary-faint);
            }

            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: var(--gold);
                background: var(--white);
                box-shadow: 0 0 0 4px color-mix(in srgb, var(--gold) 14%, transparent);
            }

            /* Keep browser autofill on-theme instead of the default blue/yellow fill */
            .form-group input:-webkit-autofill,
            .form-group input:-webkit-autofill:hover,
            .form-group input:-webkit-autofill:focus {
                -webkit-text-fill-color: var(--text-primary);
                -webkit-box-shadow: 0 0 0 1000px var(--white) inset;
                caret-color: var(--text-primary);
            }

            .form-group textarea {
                resize: vertical;
                min-height: 132px;
                line-height: var(--leading-normal);
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
                width: auto;
                align-self: flex-start;
                margin-top: var(--space-sm);
                cursor: pointer;
                padding: 15px 40px;
            }

            .btn-submit:hover {
                transform: translateY(-2px);
            }

            /* Soft step indicator — a quiet label, never a gamified progress bar */
            .form-progress {
                margin: 0 0 var(--space-md);
                font-size: var(--text-micro);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
                color: var(--text-primary-faint);
            }

            .form-step {
                display: flex;
                flex-direction: column;
                gap: var(--space-md);
            }

            .form-step[hidden] {
                display: none;
            }

            .form-step--enter {
                animation: cfStepIn var(--motion-medium) var(--ease-out-soft) both;
            }

            @keyframes cfStepIn {
                from { opacity: 0; transform: translateY(8px); }
                to   { opacity: 1; transform: none; }
            }

            .form-optional {
                font-weight: var(--weight-regular);
                color: var(--text-primary-faint);
            }

            /* Phone + email grouped so "enter at least one" reads as one ask */
            .form-fieldset {
                border: 0;
                margin: 0;
                padding: 0;
                display: flex;
                flex-direction: column;
                gap: var(--space-sm);
            }

            .form-legend {
                padding: 0;
                font-size: var(--text-small);
                font-weight: var(--weight-semibold);
                color: var(--text-primary-soft);
            }

            .form-check {
                display: flex;
                align-items: flex-start;
                gap: var(--space-sm);
                min-height: 44px;
                font-size: var(--text-small);
                line-height: var(--leading-normal);
                color: var(--text-primary-muted);
                cursor: pointer;
            }

            .form-check input[type="checkbox"] {
                flex: 0 0 auto;
                width: 22px;
                height: 22px;
                margin-top: 0;
                accent-color: var(--gold);
                cursor: pointer;
            }

            .form-check a {
                color: var(--gold-dark);
                text-decoration: underline;
                text-underline-offset: 2px;
            }

            /* Optional marketing opt-in reads quieter than the required terms line */
            .form-check--subtle {
                font-size: var(--text-small);
                color: var(--text-primary-faint);
            }

            .form-actions {
                display: flex;
                align-items: center;
                gap: var(--space-md);
                margin-top: var(--space-xs);
            }

            .form-actions .btn-submit {
                margin-top: 0;
            }

            .form-back {
                background: none;
                border: 0;
                padding: 8px 4px;
                font-family: var(--font-body);
                font-size: var(--text-small);
                font-weight: var(--weight-medium);
                color: var(--text-primary-muted);
                cursor: pointer;
                transition: color var(--motion-fast) var(--ease-standard);
            }

            .form-back:hover {
                color: var(--text-primary);
            }

            .form-reassure {
                margin: var(--space-xs) 0 0;
                font-size: var(--text-small);
                color: var(--text-primary-faint);
            }

            .form-error {
                margin: 0;
                font-size: var(--text-small);
                font-weight: var(--weight-medium);
                color: #b3261e;
            }

            .form-hint {
                margin: 0;
                font-size: var(--text-small);
                color: var(--text-primary-faint);
            }

            @media (prefers-reduced-motion: reduce) {
                .form-step--enter { animation: none; }
            }

            /* Clothes Drive Form Styles */
            .form-message {
                font-size: var(--text-lead);
                line-height: var(--leading-loose);
                color: var(--text-primary-soft);
                max-width: 700px;
                margin: 0 auto 24px auto;
                font-weight: var(--weight-regular);
            }
            
            .btn-more-info {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-top: 8px;
                padding: 14px 32px;
                font-size: var(--text-label);
                font-weight: var(--weight-semibold);
                text-decoration: none;
                cursor: pointer;
            }
            
            .form-section {
                padding: 32px;
                background: rgba(250, 248, 245, 0.5);
                border-radius: var(--radius-lg);
                margin-bottom: 24px;
            }
            
            .form-section-title {
                font-family: var(--font-display);
                font-size: var(--text-heading);
                color: var(--text-primary);
                margin-bottom: 24px;
                font-weight: var(--weight-bold);
            }
            
            .form-row-3 {
                grid-template-columns: 1fr 1fr 1fr;
            }
            
            .child-form {
                padding: 24px;
                background: var(--surface);
                border-radius: var(--radius-md);
                margin-bottom: 20px;
                border: 2px solid color-mix(in srgb, var(--gold) 20%, transparent);
                transition: all var(--motion-medium) var(--ease-standard);
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
                font-family: var(--font-display);
                font-size: var(--text-heading);
                color: var(--gold);
                font-weight: var(--weight-bold);
                margin: 0;
            }
            
            .btn-remove-child {
                padding: 8px 16px;
                font-size: var(--text-label);
                background: rgba(220, 38, 38, 0.1);
                color: #dc2626;
                border: 1px solid rgba(220, 38, 38, 0.3);
                border-radius: var(--radius-sm);
                cursor: pointer;
                transition: all var(--motion-medium) var(--ease-standard);
                font-weight: var(--weight-semibold);
            }
            
            .btn-remove-child:hover {
                background: rgba(220, 38, 38, 0.2);
                transform: translateY(-2px);
            }
            
            .btn-add-child {
                width: 100%;
                padding: 16px;
                font-size: var(--text-small);
                font-weight: var(--weight-semibold);
                margin-top: 8px;
                cursor: pointer;
            }
            
            /* Contact form — native form posting to /api/contact.
               Flush on the cream surface (no card chrome); the inputs supply
               the structure. Constrained to a comfortable reading column. */
            .contact-form-card {
                width: 100%;
                max-width: 600px;
                position: relative;
            }

            /* 16px minimum on form controls so mobile Safari never auto-zooms
               on focus. !important because some controls also pick up smaller
               type tokens at the mobile breakpoint. */
            input, select, textarea {
                font-size: var(--text-body) !important;
            }
            
            /* Form Success State — calm, constrained block that replaces the
               form in place (not the tall event-registration block it grew from). */
            .form-success {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                text-align: left;
                max-width: 600px;
                padding: var(--space-xl) 0;
                gap: var(--space-md);
            }

            .success-icon {
                animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            .success-icon svg {
                width: clamp(48px, 6vw, 64px);
                height: clamp(48px, 6vw, 64px);
                filter: drop-shadow(0 2px 8px color-mix(in srgb, var(--gold) 30%, transparent));
            }
            
            @keyframes bounceIn {
                0% { transform: scale(0); opacity: 0; }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .success-heading {
                font-family: var(--font-display);
                font-size: var(--text-section);
                color: var(--text-primary);
                font-weight: var(--weight-bold);
                margin: 0;
            }

            .success-message {
                font-size: var(--text-lead);
                color: var(--text-primary-muted);
                max-width: 480px;
                margin: 0;
                line-height: var(--leading-loose);
            }
            
            .success-details {
                display: flex;
                flex-direction: column;
                gap: 16px;
                width: 100%;
                max-width: 500px;
                background: rgba(255, 255, 255, 0.6);
                padding: 24px;
                border-radius: var(--radius-lg);
                border: 1px solid rgba(255, 255, 255, 0.8);
            }

            .detail-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding: 12px 0;
                border-bottom: 1px solid var(--text-primary-hairline);
            }
            
            .detail-item:last-child {
                border-bottom: none;
            }
            
            .detail-label {
                font-size: var(--text-body);
                font-weight: var(--weight-semibold);
                color: var(--text-primary-muted);
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .detail-value {
                font-size: var(--text-body);
                font-weight: var(--weight-semibold);
                color: var(--text-primary);
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
                border-radius: var(--radius-pill);
                background: rgba(255, 255, 255, 0.9);
                color: var(--text-primary);
                font-size: var(--text-small);
                font-weight: var(--weight-bold);
                text-transform: uppercase;
                letter-spacing: 1px;
                box-shadow: var(--shadow-md);
                border: 1px solid rgba(255, 255, 255, 0.5);
                transition: all 0.4s var(--ease-standard);
                text-decoration: none;
            }
            
            .btn-calendar:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-lg);
                background: var(--white);
            }
            
            .calendar-icon {
                font-size: var(--text-heading);
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
                border-radius: var(--radius-lg);
                border: 1px solid rgba(255, 255, 255, 0.8);
                transition: all var(--motion-medium) var(--ease-standard);
            }
            
            .contact-info-item:hover {
                background: rgba(255, 255, 255, 0.9);
                transform: translateX(4px);
                box-shadow: var(--shadow-md);
            }
            
            .contact-icon {
                font-size: 32px;
                line-height: 1;
                flex-shrink: 0;
            }
            
            .contact-text h4 {
                font-size: var(--text-body);
                font-weight: var(--weight-bold);
                color: var(--text-primary);
                margin-bottom: 6px;
                letter-spacing: var(--tracking-normal);
            }

            .contact-text p {
                font-size: var(--text-small);
                color: var(--text-primary-muted);
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

            /* ========================================
               MOBILE STYLES (≤960px)
               Single consolidated mobile breakpoint.
               All values use fluid clamp() for smooth scaling from 320px → 960px.
               ======================================== */

            /* iOS status bar: Safari reads body's background-color for the
               status bar tint. Defaults to light; JS adds .hero-in-view
               to set olive only when the hero is confirmed visible.
               .page wrapper always has light bg to cover visible content. */
            /* iOS status bar tint: default to light; JS adds .hero-in-view
               only when the hero is confirmed visible, so there is never a
               flash of olive when crossing the 960px breakpoint on desktop. */
            @media (max-width: 960px) {
                html {
                    background: #faf8f5 !important;
                }
                html.hero-in-view {
                    background: #3d3a2a !important;
                }
                body {
                    margin: 0;
                    padding: 0;
                    background: #faf8f5 !important;
                    background-image: none !important;
                    transition: none;
                }
                html.hero-in-view body {
                    background: #3d3a2a !important;
                }
            }

            @media (max-width: 960px) {
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
                    background-image: image-set(
                        url('/static/hero-mobile.avif') type('image/avif'),
                        url('/static/hero-mobile.webp') type('image/webp'),
                        url('/static/hero-mobile.jpg') type('image/jpeg')
                    );
                    background-size: cover;
                    background-position: center 60%;
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
                       Fading the image to #faf8f5 BEFORE the bridge blur means the
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
                        rgba(250, 248, 245, 0.35) 82%,
                        rgba(250, 248, 245, 0.7) 90%,
                        rgba(250, 248, 245, 0.95) 97%,
                        #faf8f5 100%
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
                .hero .hero-tagline {
                    position: absolute;
                    top: 23.5vh;
                    left: 0;
                    right: 0;
                    width: 100%;
                    text-align: center;
                    z-index: 3;
                    color: white !important;
                    font-family: var(--font-display);
                    font-size: var(--text-hero);
                    font-weight: var(--weight-bold);
                    text-shadow: 0 4px 30px rgba(0, 0, 0, 0.8), 0 8px 60px rgba(0, 0, 0, 0.6), 0 0 140px rgba(0, 0, 0, 0.45);
                    padding: 0 5%;
                    line-height: var(--leading-tight);
                    letter-spacing: -2px;
                    margin: 0;
                    box-sizing: border-box;
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

                .hero .hero-title {
                    position: static !important;
                    color: #ffffff !important;
                    font-family: var(--font-body) !important;
                    font-size: var(--text-lead) !important;
                    font-weight: var(--weight-semibold) !important;
                    letter-spacing: 2px !important;
                    text-transform: uppercase !important;
                    white-space: normal !important;
                    text-shadow:
                        0 2px 12px rgba(0, 0, 0, 1),
                        0 4px 30px rgba(0, 0, 0, 1),
                        0 6px 60px rgba(0, 0, 0, 0.95),
                        0 10px 100px rgba(0, 0, 0, 0.9),
                        0 0 160px rgba(0, 0, 0, 0.8),
                        0 0 220px rgba(0, 0, 0, 0.6) !important;
                    margin: 0 0 4px 0 !important;
                    max-width: none !important;
                    line-height: 1.4 !important;
                    padding: 0 !important;
                }

                .hero-service-time {
                    color: #ffffff !important;
                    font-size: var(--text-lead) !important;
                    font-weight: var(--weight-semibold);
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

                /* Find Us wrapper — in flow on mobile (not absolute), centered. */
                .find-us-wrapper {
                    position: relative;
                    bottom: auto;
                    left: auto;
                    right: auto;
                    width: 100%;
                    pointer-events: auto;
                }
                
                /* Outreach Section - Mobile */
                .outreach {
                    width: 100%;
                    max-width: 100%;
                    padding-bottom: 0;
                    box-sizing: border-box;
                    overflow: visible;
                }

                .outreach .section-eyebrow {
                    display: inline-flex !important;
                    width: fit-content !important;
                    max-width: fit-content !important;
                    text-align: left;
                    margin-left: 16px;
                }
                
                .outreach .section-heading {
                    text-align: left;
                    padding-left: 16px;
                }
            }
            
            @media (max-width: 960px) {
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

            @media (max-width: 960px) {
                /* NAV - Centered layout matching mobile design */
                .nav-shell {
                    flex-wrap: wrap;
                    justify-content: center;
                    border-radius: var(--radius-2xl);
                    /* Row rhythm lives on the nav element's margin-block (animatable
                       to 0) instead of gap — flex gap doesn't collapse for
                       zero-height rows, which left phantom space mid-morph. */
                    gap: 0;
                    margin: 20px auto 50px;
                    padding: var(--space-sm) var(--space-md);
                    top: calc(env(safe-area-inset-top, 0px) + clamp(8px, 1.2vw, 12px));
                    width: clamp(94%, 96vw, 100%);
                    /* Low opacity white + heavy blur = warm frosted glass that
                       picks up the olive/earth tones from the hero behind it */
                    background: rgba(255, 255, 255, 0.72);
                    -webkit-backdrop-filter: blur(40px) saturate(1.8);
                    backdrop-filter: blur(40px) saturate(1.8);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    box-shadow: var(--shadow-md);
                    /* Every geometric property of the compress/expand morph is
                       animated explicitly. The previous "all 0.6s overshoot"
                       only ever animated padding/radius (the dominant change —
                       brand/CTA rows — was a display:none pop), and the bounce
                       ease read as gimmicky on frosted chrome. */
                    transition: padding var(--motion-springy) var(--ease-spring),
                                border-radius var(--motion-springy) var(--ease-spring),
                                top var(--motion-springy) var(--ease-spring),
                                margin var(--motion-springy) var(--ease-spring),
                                background var(--motion-slow) var(--ease-standard),
                                box-shadow var(--motion-slow) var(--ease-standard);
                }

                /* The nav row carries the vertical rhythm between brand /
                   links / CTA in the expanded shell, and collapses it to 0
                   when compressed. min-height gives the compressed pill its
                   vertical mass (replacing the old un-animatable explicit
                   height on the shell) — 22px is the row's natural expanded
                   height, so the expanded design is pixel-identical. */
                .nav-shell nav {
                    margin-block: 16px;
                    transition: margin var(--motion-springy) var(--ease-spring);
                }
                .nav-shell nav ul {
                    min-height: 22px;
                    align-items: center;
                    transition: min-height var(--motion-springy) var(--ease-spring);
                }
                .nav-shell.scrolled-mobile nav,
                html.nav-prerender-scrolled .nav-shell nav {
                    margin-block: 0;
                }
                .nav-shell.scrolled-mobile nav ul,
                html.nav-prerender-scrolled .nav-shell nav ul {
                    min-height: clamp(40px, 12vw, 48px);
                }

                /* Animated collapse of the brand + Contact rows. max-height
                   drives the row-space, opacity+transform carry the visual
                   exit; visibility delays until the fade completes so AT and
                   tab order drop the hidden controls. */
                .nav-shell .brand,
                .nav-shell .nav-cta {
                    max-height: 56px;
                    overflow: hidden;
                    transition: max-height var(--motion-springy) var(--ease-spring),
                                opacity var(--motion-medium) var(--ease-out-soft),
                                transform var(--motion-springy) var(--ease-spring),
                                visibility 0s 0s;
                }
                .nav-shell.scrolled-mobile .brand,
                .nav-shell.scrolled-mobile .nav-cta {
                    max-height: 0;
                    opacity: 0;
                    transform: translateY(-6px) scale(0.97);
                    visibility: hidden;
                    pointer-events: none;
                    transition: max-height var(--motion-springy) var(--ease-spring),
                                opacity var(--motion-fast) var(--ease-out-soft),
                                transform var(--motion-springy) var(--ease-spring),
                                visibility 0s var(--motion-medium);
                }

                /* The morph animates ONLY after the page has settled
                   (html.nav-anim-ready, added ~350ms post-init by the nav
                   scripts). Scroll-restore, prerender and first-sync class
                   flips are repositions, not motion moments — they must
                   paint instantly, and on subpages they'd otherwise run
                   dozens of transitions on a nav-shell that isn't even
                   visible. */
                html:not(.nav-anim-ready) .nav-shell,
                html:not(.nav-anim-ready) .nav-shell nav,
                html:not(.nav-anim-ready) .nav-shell nav ul,
                html:not(.nav-anim-ready) .nav-shell .brand,
                html:not(.nav-anim-ready) .nav-shell .nav-cta,
                html:not(.nav-anim-ready) .nav-shell .nav-form-btn {
                    transition: none;
                }

                /* ════════════ Scroll-driven nav morph (html.nav-sda) ════════════
                   The home mobile compress/expand is a native CSS scroll-driven
                   animation: animation-timeline: scroll(root) scrubs the morph
                   over the first 4–134px of scroll. The browser samples the pose
                   in the render pipeline, in lockstep with the COMMITTED scroll
                   offset — no scroll-event latency, no rAF throttling, no JS in
                   the loop. On Safari 26.4+/iOS the opacity/transform keyframes
                   below run on the compositor thread and track the native 120Hz
                   scroll even while page rendering runs at 60Hz; the geometry
                   keyframes (padding, radius, row collapse) sample main-thread
                   at render rate with zero lag. html.nav-sda is set pre-paint by
                   the home-head script when CSS.supports('animation-timeline:
                   scroll()') and the user doesn't prefer reduced motion; every
                   other browser keeps the --ease-spring class-flip transitions
                   above as the fallback, untouched.

                   Rules of this block:
                   • Keyframes are to{}-only wherever possible — the from-pose is
                     the live cascade (the expanded design), so the two poles can
                     never drift from the class-defined CSS.
                   • No var() INSIDE keyframes — WebKit's scroll-driven animation
                     sampling has shown flaky whole-animation failures with var()
                     keyframe endpoints (probed June 2026), so pole values are
                     literal clamps mirroring the tokens they correspond to.
                     var() in BASE styles (e.g. --nav-spread) is safe and used.
                   • Accelerated properties (opacity/transform/visibility) live in
                     their own keyframes, separate from geometry, so WebKit can
                     run them threaded.
                   • fill-mode: both keeps the sampled pose authoritative at every
                     scroll position including first paint after scroll restore —
                     the nav-prerender-scrolled machinery is fallback-only. */

                /* Measurement escape hatch: the nav-morph boot script toggles
                   this class inside one synchronous block to read the expanded-
                   pose metrics (cluster width for --nav-spread, brand/CTA row
                   heights) regardless of current scroll position. Never painted. */
                html.nav-measuring .nav-shell,
                html.nav-measuring .nav-shell * {
                    animation: none !important;
                }

                /* Shell geometry (main-thread tier) and shell rise (compositor
                   tier). The vertical travel between poles lives ENTIRELY in the
                   transform — top/margin-top stay at their expanded values (see
                   the .scrolled-mobile neutralization below) so the rise is
                   accelerated. translateY = compressed-y − expanded-y =
                   14px − (clamp(8px,1.2vw,12px) + 20px margin). */
                @keyframes mnav-shell-geo {
                    to {
                        padding: 0 clamp(10px, 3vw, 20px);
                        border-radius: 100px; /* --radius-pill */
                    }
                }
                @keyframes mnav-shell-rise {
                    to { transform: translateX(-50%) translateY(calc(14px - clamp(8px, 1.2vw, 12px) - 20px)); }
                }

                /* Link-row rhythm collapse + the right-side reserve for the
                   Contact pill overlay (the reserve only exists ≥400px — below
                   that the pill is dropped entirely, so the row keeps the full
                   width). @keyframes resolve per matching @media block. */
                @media (min-width: 400px) {
                    @keyframes mnav-row {
                        to { margin-block: 0; padding-right: clamp(104px, 26vw, 124px); }
                    }
                }
                @media (max-width: 399px) {
                    @keyframes mnav-row {
                        to { margin-block: 0; }
                    }
                }
                @keyframes mnav-list {
                    to {
                        min-height: clamp(40px, 12vw, 48px);
                        padding-left: 0px;
                        padding-right: 0px;
                    }
                }
                @keyframes mnav-link {
                    to {
                        font-size: clamp(11px, 2.8vw, 14px);
                        letter-spacing: clamp(0.4px, 0.2vw, 1.4px);
                    }
                }

                /* Brand + Contact row exit. Geometry (row space) separate from
                   the accelerated fade/drift. Opacity reaches 0 at 53% of the
                   range (the row should read as gone well before its space
                   finishes collapsing); visibility's discrete interpolation
                   keeps it visible until the very end, then hides it from AT
                   and the tab order at the compressed pole. */
                @keyframes mnav-bye-geo {
                    to { max-height: 0px; }
                }
                /* The Contact CTA row carries its own vertical padding and
                   1px borders — border-box max-height floors at
                   padding+border, so max-height alone leaves a ~17px residual
                   row at the pole (the fallback path masks this with
                   display:none). Collapse the padding and border widths with
                   the row. */
                @keyframes mnav-bye-cta-geo {
                    to {
                        max-height: 0px;
                        padding-top: 0px;
                        padding-bottom: 0px;
                        border-top-width: 0px;
                        border-bottom-width: 0px;
                    }
                }
                @keyframes mnav-bye {
                    0%   { opacity: 1; transform: translateY(0) scale(1); visibility: visible; pointer-events: auto; }
                    45%  { pointer-events: auto; }
                    53%  { opacity: 0; }
                    55%  { pointer-events: none; }
                    100% { opacity: 0; transform: translateY(-6px) scale(0.97); visibility: hidden; pointer-events: none; }
                }

                /* Contact pill entrance: silent until 45%, fades in over the
                   back half while scaling 0.85→1 (scale holds until 30% so the
                   pill never reads as moving while still invisible). pointer-
                   events' discrete flip lands at ~92% — taps only land on the
                   pill once it is essentially settled. */
                @keyframes mnav-pill {
                    0%   { opacity: 0; transform: translateY(-50%) scale(0.85); pointer-events: none; }
                    30%  { transform: translateY(-50%) scale(0.85); }
                    45%  { opacity: 0; }
                    85%  { pointer-events: none; }
                    100% { opacity: 1; transform: translateY(-50%) scale(1); pointer-events: auto; visibility: visible; }
                }

                /* Attachment — home page only (subpage nav-shells are the menu
                   panel: always compressed, choreographed by the motion engine). */
                html.nav-sda body:not([class*="page-subpage"]) .nav-shell {
                    animation: mnav-shell-geo linear both, mnav-shell-rise linear both;
                    animation-timeline: scroll(root block), scroll(root block);
                    animation-range: 4px 134px, 4px 134px;
                }
                html.nav-sda body:not([class*="page-subpage"]) .nav-shell nav {
                    animation: mnav-row linear both;
                    animation-timeline: scroll(root block);
                    animation-range: 4px 134px;
                }
                /* The link row is space-between from the start under the
                   scrubbed morph; --nav-spread (measured once by the boot
                   script: half the slack around the centered link cluster)
                   emulates the centered-with-gap expanded layout exactly, and
                   scrubs to 0 so the distribution interpolates instead of
                   jumping at a justify-content flip. gap stays as the floor —
                   space-between distributes the slack above it. */
                html.nav-sda body:not([class*="page-subpage"]) .nav-shell nav ul {
                    justify-content: space-between;
                    padding-inline: var(--nav-spread, 0px);
                    animation: mnav-list linear both;
                    animation-timeline: scroll(root block);
                    animation-range: 4px 134px;
                }
                html.nav-sda body:not([class*="page-subpage"]) .nav-shell nav a {
                    animation: mnav-link linear both;
                    animation-timeline: scroll(root block);
                    animation-range: 4px 134px;
                }
                /* Measured natural row heights (set by the boot script) replace
                   the 56px max-height cap so the row-space collapse is linear
                   across the whole range — no dead zone while max-height shrinks
                   through the gap between cap and actual content height. */
                html.nav-sda body:not([class*="page-subpage"]) .nav-shell .brand {
                    max-height: var(--mnav-brand-h, 56px);
                }
                html.nav-sda body:not([class*="page-subpage"]) .nav-shell .nav-cta {
                    max-height: var(--mnav-cta-h, 56px);
                }
                html.nav-sda body:not([class*="page-subpage"]) .nav-shell .brand {
                    animation: mnav-bye-geo linear both, mnav-bye linear both;
                    animation-timeline: scroll(root block), scroll(root block);
                    animation-range: 4px 134px, 4px 134px;
                }
                html.nav-sda body:not([class*="page-subpage"]) .nav-shell .nav-cta {
                    animation: mnav-bye-cta-geo linear both, mnav-bye linear both;
                    animation-timeline: scroll(root block), scroll(root block);
                    animation-range: 4px 134px, 4px 134px;
                }
                html.nav-sda body:not([class*="page-subpage"]) .nav-shell .nav-form-btn {
                    animation: mnav-pill linear both;
                    animation-timeline: scroll(root block);
                    animation-range: 4px 134px;
                }

                /* Pole-class cascade pinning. The to{}-only keyframes above
                   interpolate FROM THE UNDERLYING CASCADE VALUE — so the
                   cascade must always present the EXPANDED pose, with the
                   animation as the only source of the compressed pose. If the
                   .scrolled-mobile class were allowed to flip the underlying
                   values (it still toggles at the poles, with hysteresis, for
                   semantics + fallback parity), every neutral from-value would
                   silently become the compressed value the moment the class
                   lands, and the pose would stop being a pure function of
                   scrollY (the revisit-determinism failure the nav-morph
                   harness asserts against). Everything the class state sets is
                   pinned back to the expanded design here; properties with
                   explicit 0% keyframes (opacity/transform/visibility) don't
                   need pinning because their from-values never consult the
                   cascade. */
                html.nav-sda body:not([class*="page-subpage"]) .nav-shell.scrolled-mobile,
                html.nav-sda.nav-prerender-scrolled body:not([class*="page-subpage"]) .nav-shell {
                    /* the rise lives in mnav-shell-rise's transform */
                    top: calc(env(safe-area-inset-top, 0px) + clamp(8px, 1.2vw, 12px));
                    margin-top: 20px;
                    padding: var(--space-sm) var(--space-md);
                    border-radius: var(--radius-2xl);
                }
                html.nav-sda body:not([class*="page-subpage"]) .nav-shell.scrolled-mobile nav {
                    margin-block: 16px;
                    padding-right: 0;
                }
                html.nav-sda body:not([class*="page-subpage"]) .nav-shell.scrolled-mobile nav ul {
                    min-height: 22px;
                    gap: var(--space-xs);
                }
                html.nav-sda body:not([class*="page-subpage"]) .nav-shell.scrolled-mobile nav a {
                    font-size: var(--text-label);
                    letter-spacing: clamp(0.8px, 0.3vw, 2px);
                }
                html.nav-sda body:not([class*="page-subpage"]) .nav-shell.scrolled-mobile .nav-cta {
                    display: flex;
                }

                /* The Contact pill doesn't exist below 400px (the compressed
                   row gives all its width to the four labels — the pre-morph
                   design). Under the scrubbed morph the pill must be absent
                   at EVERY scroll position, not display:none'd at the pole
                   flip: the old path let it fade in mid-scrub and then pop
                   out when the class landed. */
                @media (max-width: 399px) {
                    html.nav-sda body:not([class*="page-subpage"]) .nav-shell .nav-form-btn {
                        display: none;
                    }
                }
                /* ≤460px compressed pill sizing applies continuously under the
                   morph — sized by a .scrolled-mobile rule it would jump from
                   base to compressed metrics at the pole flip while ~90%
                   opaque. The pill is only ever VISIBLE in compressed-ish
                   poses, so wearing the compressed sizing at all times is the
                   same design with no pop. */
                @media (max-width: 460px) {
                    html.nav-sda body:not([class*="page-subpage"]) .nav-shell .nav-form-btn {
                        font-size: clamp(10.5px, 2.6vw, 12px);
                        letter-spacing: clamp(0.4px, 0.3vw, 1.2px);
                        padding: 0 clamp(10px, 3vw, 16px);
                        height: clamp(30px, 7.5vw, 36px);
                    }
                }

                .nav-shell.scrolled-mobile,
                html.nav-prerender-scrolled .nav-shell {
                    border-radius: var(--radius-pill);
                    /* The compressed pill's height = ul min-height
                       (clamp(40px,12vw,48px)) + zero vertical padding — the
                       same clamp the X close-trigger uses, so both pills
                       share the same outer curvature. The old explicit
                       height couldn't animate from the expanded auto. */
                    padding: 0 var(--space-md);
                    margin-top: 0;
                    margin-bottom: 30px;
                    /* env() so the compressed pill clears the notch/island in
                       standalone (PWA) contexts; resolves to plain 14px in
                       normal browsing where the inset is 0. */
                    top: calc(env(safe-area-inset-top, 0px) + 14px);
                    background: rgba(255, 255, 255, 0.72);
                }
                /* Pre-paint hide of .brand + .nav-cta when scroll position
                   already exceeds the threshold at first paint — matches
                   the JS-driven .scrolled-mobile behavior so the nav looks
                   right immediately rather than after a 600ms transition.
                   Fallback path only: under html.nav-sda the scroll-driven
                   animation computes the correct pose for any restored
                   scroll position at first style resolution (display:none
                   here would knock out the row-space the morph animates). */
                html.nav-prerender-scrolled:not(.nav-sda) .nav-shell .brand,
                html.nav-prerender-scrolled:not(.nav-sda) .nav-shell .nav-cta {
                    display: none;
                }
                html.nav-prerender-scrolled:not(.nav-sda) .nav-shell .nav-form-btn {
                    visibility: visible;
                    opacity: 1;
                    transform: translateY(-50%) scale(1);
                }

                .nav-shell.scrolled-mobile .nav-cta {
                    display: none;
                }

                /* The Contact pill is an absolutely-positioned overlay at the
                   shell's right end (vertically centered), faded + scaled in
                   when compressed. It used to flip display:none → flex AND
                   static → relative, which popped. As an overlay it never
                   participates in row layout, so the morph stays continuous;
                   the nav reserves right-side room for it via padding (the
                   same idiom the subpage X-trigger reserve uses). */
                .nav-form-btn {
                    display: inline-flex;
                    visibility: hidden;
                    padding: 6px 14px;
                    border-radius: var(--radius-pill);
                    background: rgba(255, 255, 255, 0.9);
                    color: var(--text-primary);
                    font-size: var(--text-eyebrow);
                    font-weight: var(--weight-bold);
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    box-shadow: var(--shadow-md);
                    -webkit-backdrop-filter: blur(10px);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    transition: opacity var(--motion-medium) var(--ease-out-soft),
                                transform var(--motion-medium) var(--ease-out-soft),
                                visibility 0s var(--motion-medium);
                    align-items: center;
                    justify-content: center;
                    white-space: nowrap;
                    opacity: 0;
                    position: absolute;
                    top: 50%;
                    right: 14px;
                    transform: translateY(-50%) scale(0.85);
                }

                .nav-shell.scrolled-mobile .nav-form-btn {
                    visibility: visible;
                    opacity: 1;
                    transform: translateY(-50%) scale(1);
                    transition: opacity var(--motion-medium) var(--ease-out-soft),
                                transform var(--motion-springy) var(--ease-spring),
                                visibility 0s 0s;
                }

                /* Subpage nav-shells (the menu panel) manage their own
                   chrome — the Contact pill overlay is a home-page-only
                   affordance, exactly as before this morph existed. */
                body[class*="page-subpage"] .nav-form-btn {
                    display: none;
                }

                /* Links reserve room for the overlay pill (400-960px; below
                   400 the pill is dropped entirely, see the 399 rule).
                   Home only — subpage nav-shells have no Contact overlay
                   (and carry their own X-trigger reserve instead). */
                @media (min-width: 400px) {
                    body:not([class*="page-subpage"]) .nav-shell.scrolled-mobile nav {
                        padding-right: clamp(104px, 26vw, 124px);
                    }
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

                nav ul {
                    width: 100%;
                    justify-content: center;
                    flex-wrap: nowrap;
                    gap: var(--space-xs);
                    order: 1;
                }

                /* In the compressed pill, the nav-ul becomes the
                   distribution band: justify-content space-between
                   anchors SCHEDULE flush-left and WATCH flush-right
                   inside the ul, with the two middle gaps mathematically
                   equal. As the shell grows the inter-label gaps grow
                   in lockstep — labels stay anchored as one composed
                   unit that BREATHES rather than left-clustering.

                   max-width caps the ul so the spread can't exceed
                   the editorial-voice ceiling (above ~460px wide the
                   labels detach into "four chips"). margin-inline:auto
                   centers the capped band inside its flex-1 parent,
                   so on wider mobile/tablet widths the extra room
                   appears as breathing space AROUND the cluster, not
                   inside the inter-label gaps. */
                .nav-shell.scrolled-mobile nav {
                    flex: 1 1 auto;
                    min-width: 0;
                }
                .nav-shell.scrolled-mobile nav ul {
                    width: 100%;
                    justify-content: space-between;
                    /* gap floor 0 — space-between distributes ALL
                       spacing dynamically. The nav element (constrained
                       by the shell minus padding minus Contact minus
                       X reserve) sets the edges; the four labels flow
                       into position based on available room. Tight
                       when narrow, spread when wide. No max-width cap
                       — the labels use the full nav width at every
                       viewport so the eye never sees dead space
                       between the cluster and the Contact pill. */
                    gap: 0;
                    padding-left: 0;
                }

                /* Header nav inside the .nav-shell. Selector is
                   scoped so it does NOT leak to other <nav> elements
                   like .subpage-jump (which is a <nav> too and was
                   inheriting justify-content: center from a bare-tag
                   selector here — v1.62.70 removed the chip-strip's
                   own centering but missed this ancestor rule). */
                .nav-shell nav {
                    text-align: center;
                    flex: 1;
                    display: flex;
                    justify-content: center;
                }

                nav ul {
                    margin: 0;
                    padding: 0;
                }

                .brand {
                    align-items: center;
                    width: 100%;
                    text-align: center;
                    order: 0;
                }

                .nav-cta {
                    width: 100%;
                    padding: clamp(6px, 2vw, 10px) var(--space-md);
                    font-size: var(--text-label);
                    text-align: center;
                    order: 2;
                    white-space: nowrap;
                    letter-spacing: clamp(1px, 0.3vw, 1.5px);
                }

                /* Contact button - shift right when compressed */
                /* Compressed Contact pill keeps the base .nav-form-btn
                   padding/type — the goal here is just to confirm intent
                   that the button stays at intrinsic width in the row
                   (flex-shrink:0 above) so it doesn't squash when the
                   nav siblings expand. */

                .brand-title {
                    font-size: var(--text-lead);
                    letter-spacing: clamp(1.5px, 0.5vw, 2px);
                    transition: all var(--motion-slow) var(--ease-standard);
                    white-space: nowrap;
                }

                .brand-subtitle {
                    font-size: var(--text-eyebrow);
                    letter-spacing: clamp(2.5px, 0.7vw, 3px);
                    transition: all var(--motion-slow) var(--ease-standard);
                    white-space: nowrap;
                }

                nav a {
                    font-size: var(--text-label);
                    letter-spacing: clamp(0.8px, 0.3vw, 2px);
                    white-space: nowrap;
                }

                .nav-shell.scrolled-mobile nav a {
                    font-size: var(--text-label);
                    letter-spacing: clamp(0.8px, 0.3vw, 1.5px);
                    white-space: nowrap;
                }

                .schedule-grid {
                    grid-template-columns: 1fr;
                    gap: var(--space-md);
                }

                .schedule-item {
                    padding: var(--space-sm);
                    gap: var(--space-sm);
                }

                .schedule-item-text {
                    padding: clamp(2px, 1vw, 6px);
                    gap: 10px;
                }

                /* Schedule on mobile: banner hidden — the section becomes
                   a plain stacked list of weekly gathering cards. Section-
                   card returns to its standard padding (no banner to make
                   edge-to-edge for), and the .schedule-tab active state
                   is neutralized so no single card is arbitrarily
                   highlighted (there's no banner for it to control).

                   v1.46.9: gentle compression pass — tightens padding,
                   gaps, type sizes, and description line-height on
                   mobile so the 5-card list reads as a unit rather than
                   a long scroll. Each lever moves only slightly; the
                   compound effect is ~150–200px saved without changing
                   any content. */
                .schedule-banner {
                    display: none;
                }
                .schedule-layout {
                    grid-template-columns: 1fr;
                    gap: 0;
                }
                .schedule-list {
                    padding: 0;
                    gap: var(--space-xs);
                }
                .schedule-tab.active {
                    background: rgba(255, 255, 255, 0.78);
                    box-shadow: var(--shadow-md);
                }
                .schedule-tab {
                    border-radius: var(--radius-md);
                    padding: var(--space-sm) var(--space-md);
                    gap: 6px;
                }
                .schedule-tab-eyebrow {
                    font-size: var(--text-small);
                }
                .schedule-tab-title {
                    font-size: var(--text-heading);
                }
                .schedule-tab-desc {
                    font-size: var(--text-small);
                    line-height: var(--leading-normal);
                }
            }

            /* Tiny phones (<380px): give text a touch more room */
            @media (max-width: 380px) {
                .schedule-item {
                    grid-template-columns: 0.85fr 1fr;
                }
            }

            /* Mobile nav (compressed pill) — unified type scale.
               One smooth clamp() handles every phone width from
               iPhone 5/SE (320) through small tablets (~960). No
               cascading 460/380/340 breakpoints with hard font jumps;
               the type breathes continuously with the viewport.
               Floors (9px font, 0.2 letter-spacing, 4px gap) are tuned
               so the four labels + envelope + X-reserve still fit at
               320 — tight, but it reads as editorial compression
               rather than truncation. Caps (12px, 1.2, 14px) settle
               into the default label size at common phone widths. */
            @media (max-width: 960px) {
                .nav-shell.scrolled-mobile nav a {
                    /* HOME page baseline. The home nav (when scrolled
                       into compressed state) has no X close-trigger
                       eating right-side room — only nav + Contact —
                       so the labels can carry a heftier type size.
                       This matches the editorial reference where the
                       four labels sit at ~13-14px with clear visual
                       weight, paired with the Contact CTA pill on the
                       right end. */
                    font-size: clamp(11px, 2.8vw, 14px);
                    letter-spacing: clamp(0.4px, 0.2vw, 1.4px);
                    /* Invisible hit-area expansion via ::before pseudo
                       below. The <a> itself stays at glyph width ×
                       glyph height so flex space-between distributes
                       labels correctly. The pseudo extends the tap
                       surface 18px vertically and 10px horizontally
                       to clear iOS HIG 44pt on both axes. */
                    position: relative;
                }
                /* Subpage menu-open uses the SAME nav-shell sizing as
                   home (v1.62.48) — the trigger fades on open, so
                   there's no chrome eating right-side room, and the
                   shell can render identically. No subpage-specific
                   font/letter-spacing override needed. */
                .nav-shell.scrolled-mobile nav a::before {
                    content: '';
                    position: absolute;
                    inset: -18px -10px;
                }
                .nav-shell.scrolled-mobile nav ul {
                    /* No floor — let space-between resolve all spacing
                       so the row never overflows. Final distribution
                       comes from the primary ul rule above. */
                    gap: 0;
                }
                .nav-shell.scrolled-mobile {
                    padding: 0 clamp(10px, 3vw, 20px);
                    /* (The old container gap separating links from the
                       Contact pill is obsolete — the pill is an overlay
                       now and the nav reserves its room via padding.) */
                }
            }

            /* Narrow phones (≤399px) — Contact pill drops from the
               shell row entirely. The four nav labels + X close
               trigger have the full shell width to distribute. */
            @media (max-width: 399px) {
                .nav-shell.scrolled-mobile .nav-form-btn {
                    display: none;
                }
                body[class*="page-subpage"] .nav-shell.scrolled-mobile {
                    /* X trigger reserve still needs the right padding
                       — Contact is gone but the X is still there. */
                    padding-right: clamp(46px, 13vw, 56px);
                }
            }

            /* Compressed Contact button is ALWAYS text "Contact" — no
               icon collapse. Editorial reasoning (after design review):
               the four nav labels (SCHEDULE / ABOUT / OUTREACH / WATCH)
               are spelled-out words, so the fifth control should also
               be a word. Mixing word-nav with an icon-glyph in the
               same row breaks the typographic register. The text
               tightens at narrow widths via the .nav-form-btn font /
               letter-spacing clamps below; even on iPhone 5/SE it fits
               on a single line. */
            @media (max-width: 460px) {
                .nav-shell.scrolled-mobile .nav-form-btn {
                    /* Home Contact pill stays close to the natural
                       mobile size so it pairs visually with the
                       heftier home nav labels (clamp 11-14). */
                    font-size: clamp(10.5px, 2.6vw, 12px);
                    letter-spacing: clamp(0.4px, 0.3vw, 1.2px);
                    padding: 0 clamp(10px, 3vw, 16px);
                    height: clamp(30px, 7.5vw, 36px);
                }
                .nav-shell.scrolled-mobile .nav-form-btn .nav-form-btn-icon {
                    display: none;
                }
            }


            /* Below ~360px the BACK label is tighter against the
               brand than at wider widths — but it stays visible
               because the typographic "BACK" word is what makes the
               pill read as editorial chrome rather than a system
               back-arrow. The chevron-only variant felt like an OS
               affordance; the labeled pill keeps the row in the
               magazine register. */
            @media (max-width: 360px) {
                .subpage-back {
                    padding: 0 12px;
                    font-size: clamp(9px, 2.8vw, 10px);
                    letter-spacing: 0.6px;
                    gap: 6px;
                }
                .subpage-back-arrow {
                    width: 13px;
                    height: 13px;
                }
            }


            @media (max-width: 960px) {
                .page {
                    width: 100%;
                    padding: 0 clamp(3%, 3vw, 0%);
                    background: var(--bg-color); /* light bg covers olive body */
                    box-sizing: border-box;
                }

                main {
                    gap: var(--space-3xl);
                    margin-bottom: clamp(20px, 6vw, 64px);
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

                .cta-group {
                    flex-direction: column;
                    gap: 12px;
                    width: 100%;
                    align-items: stretch;
                }

                /* .btn mobile rule removed in v1.57.0 — canonical
                   .event-link-btn handles sizing across breakpoints. */

                .section-card {
                    padding: var(--space-lg) var(--space-md);
                    border-radius: var(--radius-xl);
                }

                .schedule-item {
                    border-radius: var(--radius-lg);
                }

                .section-eyebrow {
                    font-size: var(--text-eyebrow);
                    letter-spacing: clamp(2px, 0.3vw, 2.5px);
                    margin-bottom: var(--space-md);
                }

                .section-heading {
                    font-size: var(--text-title);
                    margin-bottom: var(--space-md);
                    line-height: var(--leading-snug);
                }

                .section-lead {
                    font-size: var(--text-lead);
                    line-height: var(--leading-loose);
                }

                address {
                    font-size: var(--text-label);
                    letter-spacing: 2px;
                    margin-bottom: var(--space-lg);
                }

                .schedule-item h3 {
                    font-size: var(--text-heading);
                }

                .schedule-item p {
                    font-size: var(--text-small);
                }

                /* Mobile/Tablet Event Cards - Centered layout */


                .watch {
                    gap: var(--space-md);
                }

                .watch-card {
                    padding: var(--space-lg) var(--space-md);
                    border-radius: var(--radius-xl);
                }

                .contact {
                    grid-template-columns: 1fr;
                    gap: var(--space-xl);
                }

                .preview-screen {
                    padding: var(--space-lg) var(--space-md);
                    min-height: clamp(240px, 30vw, 280px);
                }

                .preview-screen p {
                    font-size: var(--text-body);
                    line-height: var(--leading-loose);
                }

                .preview-screen small {
                    font-size: var(--text-body);
                }

                .past-streams {
                    grid-template-columns: 1fr;
                    gap: 16px;
                }

                /* Contact Section */
                .contact-card {
                    padding: var(--space-xl) var(--space-lg);
                    border-radius: var(--radius-xl);
                    grid-template-columns: 1fr;
                    gap: var(--space-2xl);
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
                    font-size: var(--text-heading);
                }

                .child-form {
                    padding: 16px;
                }

                .form-success {
                    padding: var(--space-xl) 0;
                }

                .success-icon svg {
                    width: clamp(56px, 14vw, 72px);
                    height: clamp(56px, 14vw, 72px);
                }

                .success-heading {
                    font-size: var(--text-title);
                }

                .success-message {
                    font-size: var(--text-lead);
                }

                .calendar-buttons {
                    flex-direction: column;
                    gap: 12px;
                }

                .btn-calendar {
                    width: 100%;
                    min-width: auto;
                    font-size: var(--text-small);
                    padding: var(--space-sm) var(--space-md);
                }

                .calendar-icon {
                    font-size: var(--text-heading);
                }

                /* Outreach section — inherit .page width */
                .outreach {
                    width: 100%;
                    max-width: 100%;
                }

                .outreach .section-eyebrow {
                    display: inline-flex !important;
                    width: fit-content !important;
                    max-width: fit-content !important;
                    margin-left: var(--space-xs);
                    margin-bottom: 10px;
                }

                .outreach .section-heading {
                    text-align: left;
                    padding-left: var(--space-xs);
                    margin-bottom: 24px;
                }

                .outreach-title-sticky {
                    top: 60px;
                    padding: 6px 0;
                    margin-bottom: 20px;
                }

                .outreach-title-sticky h2 {
                    font-size: var(--text-title);
                }

                .event-outer-card {
                    border-radius: var(--radius-xl);
                    padding: var(--space-sm);
                }

                .event-date {
                    font-size: var(--text-small);
                }

                .event-time-pill {
                    font-size: var(--text-small);
                }

                .event-card-header .past-card-badge {
                    font-size: var(--text-small);
                }

                .event-title {
                    font-size: var(--text-title);
                    margin-bottom: 6px;
                    line-height: var(--leading-snug);
                }

                .event-time {
                    font-size: var(--text-small);
                    margin-bottom: 0;
                }

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
                    padding: var(--space-sm) var(--space-lg) var(--space-lg);
                    gap: 14px;
                }

                .event-description p {
                    font-size: var(--text-body);
                    line-height: var(--leading-normal);
                }

                .event-description ul {
                    gap: 8px;
                }

                .event-description li {
                    font-size: var(--text-body);
                    line-height: var(--leading-normal);
                }

                .event-description li::before {
                    width: 6px;
                    height: 6px;
                    margin-top: 6px;
                }

                .event-header {
                    padding: 32px 32px 24px 32px;
                }

                .flyer-frame {
                    max-width: 100%;
                }

                .placeholder-flyer {
                    aspect-ratio: 3/4;
                    border-radius: var(--radius-xl);
                }

                .event-cta {
                    padding: 0 var(--space-sm);
                    margin-bottom: var(--space-sm);
                    max-width: clamp(340px, 80vw, 400px);
                    margin-top: 4px;
                }

                .event-cta .event-link-btn {
                    padding: var(--space-sm) var(--space-lg);
                    font-size: var(--text-label);
                    border-radius: var(--radius-md);
                }

                .event-indicators {
                    display: flex;
                    right: 16px;
                }

                .schedule-item span {
                    font-size: var(--text-label);
                    letter-spacing: clamp(1.5px, 0.2vw, 1.8px);
                }

                .live-status {
                    font-size: var(--text-label);
                    padding: clamp(4px, 0.8vw, 7px) var(--space-sm);
                    letter-spacing: clamp(1px, 0.2vw, 2px);
                }

                .live-dot {
                    width: clamp(6px, 1vw, 9px);
                    height: clamp(6px, 1vw, 9px);
                }

                /* .btn-outline mobile override removed in v1.57.0 — the
                   canonical .event-link-btn rule now provides the shape
                   and sizing; .playlist-btn handles watch-section width. */

                .past-streams-label {
                    font-size: var(--text-label);
                    letter-spacing: clamp(1px, 0.2vw, 2px);
                    margin-bottom: var(--space-xs);
                }

                .stream-thumbnail {
                    font-size: var(--text-label);
                    border-radius: var(--radius-md);
                }

                /* Contact Section Mobile */
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

                /* Gift Gallery Mobile */
                .gift-gallery {
                    gap: clamp(1%, 1.5vw, 1.5%);
                    margin: var(--space-md) 0;
                }

                .gift-image {
                    border-radius: var(--radius-md);
                }

                .btn-see-flyer {
                    padding: clamp(6px, 0.8vw, 7px) var(--space-md);
                    font-size: var(--text-eyebrow);
                    margin: clamp(5px, 0.8vw, 6px) auto var(--space-xs);
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    padding: 14px 16px;
                    border-radius: var(--radius-md);
                }

                .form-group textarea {
                    min-height: 120px;
                }

                .btn-submit {
                    width: 100%;
                    align-self: stretch;
                    padding: 16px 32px;
                }

                /* Keep Back + Send usable on one row; Send takes the space */
                .form-actions .btn-submit {
                    width: auto;
                    flex: 1;
                }

                .form-back {
                    flex: 0 0 auto;
                }

                .contact-info {
                    gap: 20px;
                }

                .contact-info-item {
                    padding: 20px;
                    border-radius: var(--radius-md);
                }

                .contact-icon {
                    font-size: 28px;
                }

                .contact-text h4 {
                    font-size: var(--text-small);
                }

                .contact-text p {
                    font-size: var(--text-body);
                }

                .success-details {
                    padding: var(--space-sm);
                }

                .detail-label,
                .detail-value {
                    font-size: var(--text-small);
                }

                /* Form container - mobile sizing */
                .contact-form-card {
                    border-radius: var(--radius-lg);
                    padding: 8px 0;
                }

                /* Mobile Stay Tuned Card styling */
                .stay-tuned-card {
                    padding: var(--space-lg) var(--space-md);
                    border-radius: var(--radius-xl);
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
                    font-size: var(--text-heading);
                }

                .stay-tuned-text {
                    font-size: var(--text-small);
                    max-width: 220px;
                    line-height: var(--leading-normal);
                }

                .stay-tuned-rule {
                    width: 36px;
                }

                .btn-view-past-events {
                    margin-top: 12px;
                    padding: 8px 16px;
                    font-size: var(--text-eyebrow);
                    background: var(--gold);
                    border-color: var(--gold);
                    color: #ffffff;
                }

                /* Mobile stay-tuned overrides — see desktop counterpart
                   for the rationale on NOT resetting min-height here. */
                .stay-tuned-only {
                    padding-bottom: 0 !important;
                }

                /* Lightbox */
                .lightbox-close {
                    width: clamp(32px, 4vw, 40px);
                    height: clamp(32px, 4vw, 40px);
                    top: 10px;
                    right: 10px;
                    font-size: var(--text-heading);
                }

                .lightbox-instructions {
                    bottom: 14px;
                    padding: 7px 14px;
                    font-size: var(--text-eyebrow);
                    letter-spacing: 0.5px;
                }
            }

            /* REMOVED: Old 480px and 0px breakpoints — values merged into 960px block via fluid clamp() */
            
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
                    gap: clamp(80px, 10vw, 120px);
                    margin-bottom: clamp(80px, 10vw, 120px);
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
                    /* Hero background image — left-positioned to keep church facade visible.
                       image-set() lets the browser pick AVIF (smallest) → WebP → JPG. */
                    background-image: image-set(
                        url('/static/church-building.avif') type('image/avif'),
                        url('/static/church-building.webp') type('image/webp'),
                        url('/static/church-building.jpg') type('image/jpeg')
                    );
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
                        rgba(250, 248, 245, 0.18) 91%,
                        rgba(250, 248, 245, 0.55) 96%,
                        #faf8f5 100%
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

                /* Hero tagline — white, large, centered above overlay, single line */
                .hero .hero-tagline {
                    position: relative;
                    z-index: 4;
                    color: #ffffff;
                    font-size: var(--text-hero);
                    line-height: var(--leading-tight);
                    letter-spacing: var(--tracking-tight);
                    text-align: center;
                    white-space: nowrap;
                    text-shadow: 0 2px 24px rgba(0, 0, 0, 0.45), 0 0 80px rgba(0, 0, 0, 0.25);
                    max-width: none;
                    padding: 0 var(--space-2xl);
                    margin: 0 0 var(--space-sm) 0;
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
                    gap: var(--space-lg);
                    max-width: 600px;
                    width: 100%;
                    padding: 0 var(--space-2xl);
                    margin: 0;
                    /* Unset two-column grid */
                    grid-template-columns: unset;
                    grid-template-areas: unset;
                }

                /* Hero service-time and any hero <p> — white text */
                .hero p {
                    color: rgba(255, 255, 255, 0.92);
                    font-size: var(--text-heading);
                    line-height: var(--leading-normal);
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

                /* Find Us wrapper — in flow below service time, centered. */
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
                    padding: var(--space-xl) var(--space-2xl);
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
                    max-width: 100%;
                    margin: 0 auto;
                }

                /* Desktop: 3 cards in a row, full-width within the watch card */
                .video-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: var(--space-md);
                    width: 100%;
                    margin: 12px 0 8px;
                    align-items: start;
                }

                .video-card {
                    gap: 16px;
                }

                .video-card-recent {
                    display: flex;
                }

                .video-card-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    padding: 0 4px;
                }

                /* In the grid the latest card sits in column 1, no centering */
                .video-embed-wrapper {
                    max-width: 100%;
                    margin: 0;
                    padding-bottom: 56.25%;
                }

                /* Slightly stronger shadow on the latest card so it reads as the focal point */
                .video-card-latest .video-embed-wrapper {
                    box-shadow: 0 12px 36px rgba(139, 0, 0, 0.22),
                                0 20px 56px rgba(139, 0, 0, 0.12);
                }

                .video-card-meta {
                    padding: 0 2px;
                }

                .video-card-title {
                    font-size: var(--text-heading);
                }

                .video-card-date {
                    font-size: var(--text-label);
                }

                .youtube-embed {
                    max-height: none;
                }

                .playlist-btn {
                    max-width: 300px;
                    margin: 16px auto 0;
                }

                .countdown-container {
                    max-width: 600px;
                    margin: 8px auto;
                }
                
                /* Desktop Contact Section - fills page width like schedule section-card */
                .contact {
                    width: 100%;
                    max-width: unset;
                    margin: 0;
                }

                .contact-card {
                    padding: var(--space-2xl) var(--space-3xl);
                    max-width: 100%;
                }
                
                /* Desktop Schedule Section */
                .schedule-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--space-lg);
                    width: 100%;
                    max-width: unset;
                    margin: 0;
                }
                
                /* Desktop Section typography */
                .section-heading {
                    font-size: var(--text-title);
                }
                h2.section-heading {
                    font-size: var(--text-section);
                }

                .section-lead {
                    /* Lead paragraphs sit at --text-lead (20px max). Previously
                       this rule upgraded them to --text-heading (26px max) on
                       desktop, which made the lead read as a subheading and
                       collapsed the rhythm between section-heading → lead → body.
                       Restored to lead-size so the descending rhythm reads as
                       a clear three-step (40 → 20 → 16). */
                    font-size: var(--text-lead);
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
                    border-radius: var(--radius-lg);
                    position: relative;
                    cursor: pointer;
                }
                .past-events-outer .event-outer-card:hover { box-shadow: var(--shadow-md); }
                .stay-tuned-card { border-radius: var(--radius-xl); }
                .past-events-card .past-card-badge { display: none; /* badge moved to event-card-header */ }
                .past-events-card .past-card-icon { font-size: var(--text-title); margin-bottom: 8px; }
                .past-events-card .past-card-title { font-family: var(--font-display); font-size: var(--text-heading); font-weight: var(--weight-bold); margin: 0 0 8px 0; color: var(--text-primary); }
                .past-events-card .past-card-text { font-size: var(--text-small); color: var(--text-primary-muted); line-height: var(--leading-normal); margin-bottom: 14px; }
                /* Sentence case + 0.3px tracking to match the carousel
                   "Browse Memories" variant — the two renders of this button
                   must read identically across desktop grid and mobile. */
                .past-events-card .past-card-btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 12px 24px; box-sizing: border-box; background: var(--btn-cta-bg); border: none; color: #ffffff; border-radius: var(--radius-pill); font-size: var(--text-small); font-weight: var(--weight-bold); letter-spacing: 0.3px; text-transform: none; cursor: pointer; transition: all var(--motion-medium) var(--ease-standard); box-shadow: var(--btn-cta-shadow); position: relative; z-index: 2; }
                .past-events-card .past-card-btn:hover { background: var(--btn-cta-bg-hover); box-shadow: var(--btn-cta-shadow-hover); transform: translateY(-2px); }

                /* Mobile: same reasoning as the desktop .stay-tuned-only
                   rule above — keep the section min-height reserve so
                   the async stay-tuned/carousel load doesn't shift
                   #meals-hospitality (and the ministry blocks inside
                   it) once the events fetch resolves. */
                .outreach.stay-tuned-only { padding-bottom: 0 !important; margin-bottom: 0 !important; }

            /* Carousel */
                .carousel-card {
                    /* width set dynamically by JS */
                    padding: 0 10px;
                }

                .carousel-arrow {
                    width: 42px;
                    height: 42px;
                    font-size: var(--text-heading);
                    border-radius: var(--radius-circle);
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
                .event-cta .event-link-btn {
                    padding: 14px 32px;
                    font-size: var(--text-small);
                    border-radius: var(--radius-md);
                    background: var(--btn-cta-bg);
                    color: #ffffff;
                    box-shadow: var(--btn-cta-shadow);
                }
                .event-cta .event-link-btn:hover {
                    background: var(--btn-cta-bg-hover);
                    box-shadow: var(--btn-cta-shadow-hover);
                    transform: translateY(-2px);
                }

            /* Event cards - bigger cards & stronger glow */
                .event-flyer-wrapper {
                    border-radius: var(--radius-xl);
                }
                .event-date {
                    font-size: var(--text-body);
                }

                .event-time-pill {
                    font-size: var(--text-body);
                }

                .event-card-header .past-card-badge {
                    font-size: var(--text-body);
                }

                .event-card-header {
                    padding: 0 4px;
                }

                .event-link-btn {
                    padding: 14px 32px;
                    font-size: var(--text-small);
                }

                .carousel-past-card {
                    border-radius: var(--radius-xl);
                    padding: 32px 24px;
                }
                .carousel-past-card .past-card-icon { font-size: var(--text-title); }
                .carousel-past-card .past-card-text { font-size: var(--text-body); }
                .carousel-past-card .past-card-btn { padding: 14px 32px; font-size: var(--text-small); }

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

            /* REMOVED: Intermediate 961-1199px breakpoint — values merged into desktop block via fluid clamp() */


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
                text-decoration: none;
                color: inherit;
                transition: transform 0.4s var(--ease-standard);
            }
            .footer-brand:hover {
                transform: translateY(-2px);
            }
            
            .footer-brand-title {
                font-family: var(--font-display);
                font-size: var(--text-heading);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
                color: var(--text-primary);
            }

            .footer-brand-subtitle {
                font-size: var(--text-eyebrow);
                letter-spacing: var(--tracking-wider);
                text-transform: uppercase;
                color: var(--text-primary-faint);
                font-weight: var(--weight-semibold);
                margin-top: 4px;
            }
            
            /* When / where / email — the answers a visitor actually scrolls
               to a church footer for. Service time leads at near-solid ink;
               address + email sit a step quieter and underline on hover. */
            .footer-meta {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                text-align: center;
            }
            .footer-meta-when {
                font-size: var(--text-small);
                font-weight: var(--weight-semibold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
                color: var(--text-primary-soft);
            }
            .footer-meta-link {
                font-size: var(--text-small);
                color: var(--text-primary-faint);
                text-decoration: underline;
                text-decoration-color: transparent;
                text-underline-offset: 3px;
                transition: color var(--motion-fast) var(--ease-out-soft),
                            text-decoration-color var(--motion-fast) var(--ease-out-soft);
            }
            .footer-meta-link:hover {
                color: var(--gold-dark);
                text-decoration-color: currentColor;
            }

            /* Quick links — one-tap path to every page. Same scaleX gold
               underline vocabulary as .subpage-jump so hover reads as one
               system across the site. */
            .footer-nav {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: var(--space-sm) var(--space-md);
            }
            .footer-nav a {
                position: relative;
                font-size: var(--text-label);
                font-weight: var(--weight-bold);
                letter-spacing: var(--tracking-wide);
                text-transform: uppercase;
                color: var(--text-primary-muted);
                text-decoration: none;
                padding-bottom: 3px;
                transition: color var(--motion-fast) var(--ease-out-soft);
            }
            .footer-nav a::after {
                content: '';
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                height: 1px;
                background: var(--gold);
                transform: scaleX(0);
                transform-origin: center;
                transition: transform var(--motion-medium) var(--ease-out-soft);
            }
            .footer-nav a:hover {
                color: var(--gold-dark);
            }
            .footer-nav a:hover::after {
                transform: scaleX(1);
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
                border-radius: var(--radius-circle);
                background: var(--text-primary-hairline);
                color: var(--text-primary);
                transition: all var(--motion-medium) var(--ease-out-soft);
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
                color: var(--text-primary-muted);
                text-decoration: none;
                transition: color var(--motion-medium) var(--ease-out-soft);
            }

            .footer-link:hover {
                color: var(--gold);
            }

            .footer-link-separator {
                color: var(--text-primary-fade);
                font-size: var(--text-small);
            }

            .footer-copyright {
                font-size: var(--text-small);
                color: var(--text-primary-faint);
                text-align: center;
            }
            
            @media (max-width: 960px) {
                .site-footer {
                    padding: var(--space-2xl) 0 var(--space-xl);
                    /* Safari iOS safe area - add extra padding for home indicator on mobile */
                    padding-bottom: calc(var(--space-xl) + env(safe-area-inset-bottom, 0px));
                    margin-top: 0;
                }

                .footer-content {
                    gap: var(--space-lg);
                }

                .footer-nav {
                    gap: var(--space-sm) var(--space-md);
                    padding: 0 var(--space-md);
                }

                .footer-brand-title {
                    font-size: var(--text-heading);
                }

                .footer-social {
                    gap: var(--space-md);
                }

                .footer-social a {
                    width: clamp(40px, 5vw, 44px);
                    height: clamp(40px, 5vw, 44px);
                }

                .footer-social svg {
                    width: clamp(18px, 2.2vw, 20px);
                    height: clamp(18px, 2.2vw, 20px);
                }
            }

        /* ============================================================
           /watch library — shared across the hub, topic pages, and the
           per-service permalink. Tokens only; one card design everywhere.
           ============================================================ */

        /* --- Library tabs (Sermons / Discussions / Full services) --- */
        .watch-tabs {
            display: flex;
            flex-wrap: wrap;
            gap: var(--space-md);
            border-bottom: 1px solid var(--text-hairline);
            margin: 0 0 var(--space-lg);
        }
        .watch-tab {
            position: relative;
            appearance: none;
            background: none;
            border: none;
            padding: var(--space-sm) 2px;
            font-family: var(--font-body), 'Inter', sans-serif;
            font-size: var(--text-body);
            font-weight: var(--weight-semibold);
            color: var(--text-faint);
            cursor: pointer;
            transition: color var(--motion-fast) var(--ease-out-soft);
        }
        .watch-tab:hover { color: var(--text-muted); }
        .watch-tab[aria-selected="true"] { color: var(--text-primary); }
        .watch-tab::after {
            content: '';
            position: absolute;
            left: 0; right: 0; bottom: -1px;
            height: 2px;
            background: var(--gold);
            border-radius: var(--radius-pill);
            transform: scaleX(0);
            transform-origin: center;
            transition: transform var(--motion-medium) var(--ease-out-soft);
        }
        .watch-tab[aria-selected="true"]::after { transform: scaleX(1); }
        .watch-tab-count {
            margin-left: 6px;
            font-size: var(--text-micro);
            font-weight: var(--weight-medium);
            color: var(--text-faint);
        }
        .watch-panel { display: none; }
        .watch-panel.is-active { display: block; animation: fade-in var(--motion-medium) var(--ease-out-soft); }
        .watch-panel-lead { margin: 0 0 var(--space-lg); }
        @media (prefers-reduced-motion: reduce) {
            .watch-tab::after { transition: none; }
            .watch-panel.is-active { animation: none; }
        }

        /* --- Library search: a clean editorial field, gold on focus --- */
        .watch-search {
            display: flex; align-items: center; gap: var(--space-xs);
            margin: var(--space-md) 0 var(--space-sm);
            padding: 0 var(--space-md);
            background: var(--white);
            border: 1px solid var(--text-hairline);
            border-radius: var(--radius-pill);
            transition: border-color var(--motion-fast) var(--ease-out-soft),
                        box-shadow var(--motion-fast) var(--ease-out-soft);
        }
        .watch-search:focus-within {
            border-color: var(--gold);
            box-shadow: 0 0 0 3px color-mix(in oklab, var(--gold) 16%, transparent);
        }
        .watch-search-icon { color: var(--text-faint); flex-shrink: 0; transition: color var(--motion-fast) var(--ease-out-soft); }
        .watch-search:focus-within .watch-search-icon { color: var(--gold-dark); }
        .watch-search-input {
            flex: 1 1 auto; min-width: 0;
            border: none; background: none; outline: none;
            font-family: var(--font-body), 'Inter', sans-serif;
            font-size: var(--text-body);
            color: var(--text-primary);
            padding: 14px var(--space-xs);
            -webkit-appearance: none; appearance: none;
        }
        .watch-search-input::placeholder { color: var(--text-faint); }
        .watch-search-input::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; }
        .watch-search-clear {
            flex-shrink: 0; appearance: none; border: none; background: none;
            color: var(--text-faint); font-size: 24px; line-height: 1;
            width: 32px; height: 32px; border-radius: var(--radius-circle);
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: color var(--motion-fast) var(--ease-out-soft), background var(--motion-fast) var(--ease-out-soft);
        }
        .watch-search-clear:hover { color: var(--text-primary); background: var(--surface); }
        .watch-search-clear[hidden] { display: none; }
        .watch-search-summary { margin: 0 0 var(--space-lg); color: var(--text-muted); font-size: var(--text-small); }

        /* Group labels: hidden while browsing (the tab already names the type),
           shown only in search results so a mixed list stays legible by type. */
        .watch-group-label { display: none; }
        .watch-group-count { color: var(--text-fade); font-weight: var(--weight-regular); }
        #library .watch-card.is-search-hidden { display: none; }
        #library.is-searching .watch-tabs,
        #library.is-searching .watch-filter,
        #library.is-searching .watch-panel-lead { display: none; }
        #library.is-searching .watch-panel { display: block; animation: none; }
        #library.is-searching .watch-panel[hidden] { display: block; }
        #library.is-searching .watch-panel.is-empty-group { display: none; }
        #library.is-searching .watch-group-label {
            display: block; margin: var(--space-lg) 0 var(--space-md);
            font-family: var(--font-body), 'Inter', sans-serif;
            font-size: var(--text-label); font-weight: var(--weight-semibold);
            text-transform: uppercase; letter-spacing: var(--tracking-wide);
            color: var(--text-faint);
        }
        #library.is-searching .watch-grid { animation: fade-in var(--motion-medium) var(--ease-out-soft); }
        @media (prefers-reduced-motion: reduce) {
            #library.is-searching .watch-grid { animation: none; }
        }

        /* --- Topic filter chips --- */
        .watch-filter {
            display: flex;
            flex-wrap: wrap;
            gap: var(--space-xs);
            margin: 0 0 var(--space-lg);
        }
        .watch-chip {
            appearance: none;
            border: 1px solid var(--text-hairline);
            background: transparent;
            color: var(--text-muted);
            font-family: var(--font-body), 'Inter', sans-serif;
            font-size: var(--text-small);
            font-weight: var(--weight-medium);
            border-radius: var(--radius-pill);
            padding: 6px 14px;
            cursor: pointer;
            transition: color var(--motion-fast) var(--ease-out-soft),
                        background var(--motion-fast) var(--ease-out-soft),
                        border-color var(--motion-fast) var(--ease-out-soft);
        }
        .watch-chip:hover { border-color: var(--gold); color: var(--gold-dark); }
        .watch-chip[aria-pressed="true"] {
            background: var(--gold);
            border-color: var(--gold);
            color: var(--white);
        }
        .watch-chip-count { opacity: 0.66; margin-left: 5px; font-size: var(--text-micro); }
        /* Elegant hairline that sets the "All" chip apart from the value chips.
           Uses --text-fade (.30), not --text-hairline (.10) — at 1px the .10
           alpha is imperceptible on the cream surface and reads as bare spacing. */
        .watch-chip-sep {
            flex: 0 0 auto;
            align-self: center;
            width: 1px;
            height: 20px;
            background: var(--text-fade);
            border-radius: 1px;
        }

        /* --- Grid: crossfade on filter (reflow stays invisible) --- */
        .watch-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
            gap: var(--space-xl) var(--space-lg);
            transition: opacity var(--motion-medium) var(--ease-out-soft);
        }
        .watch-grid.is-fading { opacity: 0; }

        /* --- Library card (one design, every surface) --- */
        .watch-card { display: flex; flex-direction: column; }
        .watch-card.is-filtered { display: none; }
        .watch-card-link {
            display: flex;
            flex-direction: column;
            text-decoration: none;
            color: inherit;
        }
        .watch-card-thumb {
            position: relative;
            display: block;
            aspect-ratio: 16 / 9;
            border-radius: var(--radius-md);
            overflow: hidden;
            background: var(--surface);
            box-shadow: var(--shadow-sm);
            transition: transform var(--motion-medium) var(--ease-out-soft),
                        box-shadow var(--motion-medium) var(--ease-out-soft);
        }
        .watch-card-thumb img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform var(--motion-slow) var(--ease-out-soft);
        }
        .watch-card-play {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.92);
            width: 46px;
            height: 46px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-circle);
            background: rgba(0, 0, 0, 0.58);
            color: var(--white);
            opacity: 0;
            transition: opacity var(--motion-medium) var(--ease-out-soft),
                        transform var(--motion-medium) var(--ease-out-soft);
        }
        .watch-card-play svg { margin-left: 2px; }
        .watch-card-kind {
            position: absolute;
            top: var(--space-xs);
            left: var(--space-xs);
            font-size: var(--text-eyebrow);
            font-weight: var(--weight-bold);
            letter-spacing: var(--tracking-wide);
            text-transform: uppercase;
            color: var(--white);
            background: rgba(0, 0, 0, 0.55);
            border-radius: var(--radius-pill);
            padding: 3px 10px;
        }
        .watch-card-link:hover .watch-card-thumb { transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .watch-card-link:hover .watch-card-thumb img { transform: scale(1.04); }
        .watch-card-link:hover .watch-card-play,
        .watch-card-link:focus-visible .watch-card-play { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        .watch-card-link:focus-visible .watch-card-thumb { outline: 2px solid var(--gold); outline-offset: 3px; }
        .watch-card-body {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding-top: var(--space-sm);
        }
        .watch-card-meta {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 7px;
            font-size: var(--text-small);
            font-weight: var(--weight-medium);
            color: var(--text-soft);
        }
        .watch-card-date { color: var(--text-soft); }
        .watch-card-who { color: var(--text-primary); font-weight: var(--weight-semibold); }
        .watch-card-dot { color: var(--text-fade); }
        .watch-card-title {
            font-family: var(--font-display);
            font-size: var(--text-heading);
            line-height: var(--leading-snug);
            color: var(--text-primary);
        }
        .watch-card-preview {
            font-size: var(--text-small);
            line-height: var(--leading-normal);
            color: var(--text-muted);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .watch-card-topics {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: var(--space-sm);
        }
        .watch-card-topic {
            font-size: var(--text-micro);
            font-weight: var(--weight-medium);
            letter-spacing: var(--tracking-wide);
            text-transform: lowercase;
            color: var(--gold-dark);
            background: color-mix(in oklab, var(--gold) 10%, transparent);
            border-radius: var(--radius-pill);
            padding: 3px 10px;
            text-decoration: none;
            transition: background var(--motion-fast) var(--ease-out-soft);
        }
        .watch-card-topic:hover { background: color-mix(in oklab, var(--gold) 22%, transparent); }

        /* Duration badge (full-service cards) sits top-right, quiet. */
        .watch-card-kind--len { left: auto; right: var(--space-xs); font-weight: var(--weight-semibold); }

        /* Library cards (message + song): equal padding on all sides so the
           thumbnail can nest CONCENTRICALLY inside the card corner. The frosted
           --radius-2xl corner is kept; the padding is one token (--wc-pad) used
           both as the card padding AND subtracted from the card radius to give
           the thumbnail its own radius — concentric at every viewport width
           (inner_radius = outer_radius - padding). */
        .watch-card--message,
        .watch-card--song {
            --wc-pad: var(--space-md);
            --wc-radius: var(--radius-2xl);
            padding: var(--wc-pad);
            border-radius: var(--wc-radius);
        }
        /* The card variant of the player carries no permalink bottom-margin; the
           thumbnail-to-text rhythm is owned by the body's padding-top instead.
           Scoped under .watch-card so it beats the base .vplayer margin rule
           (which is defined later in source at equal specificity). */
        .watch-card .vplayer--card { margin: 0; }

        /* Message/song card: the card IS an inline segment player. The
           .vplayer-stage takes the card-thumb look (concentric corner, soft
           shadow, hover lift). */
        .watch-card--message .vplayer-stage,
        .watch-card--song .vplayer-stage {
            border-radius: calc(var(--wc-radius) - var(--wc-pad));
            box-shadow: var(--shadow-sm);
            transition: transform var(--motion-medium) var(--ease-out-soft),
                        box-shadow var(--motion-medium) var(--ease-out-soft);
        }
        .watch-card--message .vplayer--card:hover .vplayer-stage { transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .watch-card--message .vplayer--card .vplayer-poster img { transition: transform var(--motion-slow) var(--ease-out-soft); }
        .watch-card--message .vplayer--card:hover .vplayer-poster img { transform: scale(1.04); }
        .watch-card--message .vplayer.is-playing .vplayer-stage { transform: none; box-shadow: var(--shadow-md); }
        /* Compact control bar on a card. */
        .vplayer--card .vplayer-bar { padding: 8px 12px; gap: var(--space-xs); box-shadow: none; border: 1px solid var(--text-hairline); margin-top: 8px; }
        .vplayer--card .vplayer-btn { width: 32px; height: 32px; }
        .vplayer--card .vplayer-poster-play { width: clamp(46px, 16vw, 56px); height: clamp(46px, 16vw, 56px); }

        .watch-card-body { gap: 5px; }
        .watch-card-foot {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--space-sm);
            margin-top: var(--space-xs);
        }
        .watch-card-full {
            font-size: var(--text-micro);
            font-weight: var(--weight-semibold);
            letter-spacing: var(--tracking-wide);
            color: var(--text-faint);
            text-decoration: none;
            white-space: nowrap;
            transition: color var(--motion-fast) var(--ease-out-soft);
        }
        .watch-card-full:hover { color: var(--gold-dark); }

        .watch-empty {
            padding: var(--space-2xl) 0;
            text-align: center;
            font-size: var(--text-body);
            color: var(--text-faint);
        }

        /* --- Featured hero (the latest service, atop the hub) --- */
        .watch-feature {
            display: grid;
            grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
            gap: var(--space-xl);
            align-items: start;
            margin-bottom: var(--space-2xl);
        }
        .watch-feature-thumb {
            position: relative;
            display: block;
            aspect-ratio: 16 / 9;
            border-radius: var(--radius-lg);
            overflow: hidden;
            background: var(--surface);
            box-shadow: var(--shadow-md);
        }
        .watch-feature-thumb img {
            position: absolute; inset: 0; width: 100%; height: 100%;
            object-fit: cover; display: block;
            transition: transform var(--motion-slow) var(--ease-out-soft);
        }
        .watch-feature-thumb:hover img { transform: scale(1.03); }
        .watch-feature-thumb:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
        .watch-feature-play {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%) scale(1);
            width: clamp(58px, 8vw, 72px); height: clamp(58px, 8vw, 72px);
            display: flex; align-items: center; justify-content: center;
            border-radius: var(--radius-circle);
            background: rgba(0, 0, 0, 0.5); color: var(--white);
            backdrop-filter: blur(2px);
            transition: transform var(--motion-medium) var(--ease-out-soft);
        }
        .watch-feature-play svg { margin-left: 3px; }
        .watch-feature-thumb:hover .watch-feature-play { transform: translate(-50%, -50%) scale(1.08); }
        .watch-feature-meta { display: flex; flex-direction: column; gap: var(--space-xs); }
        .watch-feature-title {
            font-family: var(--font-display); font-size: var(--text-title);
            line-height: var(--leading-tight); color: var(--text-primary); margin: 0;
        }
        .watch-feature-meta-line { font-size: var(--text-small); color: var(--text-muted); }
        .watch-feature-blurb {
            font-size: var(--text-body); line-height: var(--leading-normal);
            color: var(--text-muted); margin: var(--space-xs) 0 0; max-width: 58ch;
        }
        .watch-feature-actions { display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-top: var(--space-sm); }

        /* Featured swap: the selected service cross-fades in place. */
        .watch-feature { transition: opacity var(--motion-medium) var(--ease-out-soft); }
        .watch-feature.is-swapping { opacity: 0.25; }

        /* Recent-services index — a quiet editorial archive list (date · title),
           hairline-ruled. Selecting a row swaps the featured player above. */
        .watch-svc { margin-top: var(--space-2xl); }
        .watch-svc-label {
            font-size: var(--text-eyebrow); font-weight: var(--weight-bold);
            letter-spacing: var(--tracking-wider); text-transform: uppercase;
            color: var(--text-muted); margin: 0 0 var(--space-xs);
        }
        .watch-svc-list { display: flex; flex-direction: column; }
        .watch-svc-row {
            display: grid; grid-template-columns: minmax(6.5ch, auto) 1fr auto;
            align-items: baseline; gap: var(--space-md); width: 100%; text-align: left;
            appearance: none; background: none; border: none; border-top: 1px solid var(--text-hairline);
            padding: var(--space-sm) var(--space-xs); cursor: pointer;
            transition: background var(--motion-fast) var(--ease-out-soft);
        }
        .watch-svc-row:hover { background: color-mix(in oklab, var(--gold) 5%, transparent); }
        .watch-svc-row.is-current { background: color-mix(in oklab, var(--gold) 8%, transparent); }
        .watch-svc-row-date {
            color: var(--gold-dark); font-size: var(--text-small); font-weight: var(--weight-semibold);
            font-variant-numeric: tabular-nums; white-space: nowrap;
        }
        .watch-svc-row-title { color: var(--text-primary); font-size: var(--text-body); min-width: 0; }
        .watch-svc-row-go {
            display: inline-flex; align-self: center; color: var(--text-fade);
            transition: color var(--motion-fast) var(--ease-out-soft), transform var(--motion-fast) var(--ease-out-soft);
        }
        .watch-svc-row:hover .watch-svc-row-go { color: var(--gold-dark); transform: translateX(2px); }
        .watch-svc-row.is-current .watch-svc-row-go { color: var(--gold-dark); }
        /* The featured cell hosts the full-service inline player. */
        .watch-feature-player { min-width: 0; }
        .watch-feature-fulllink {
            display: inline-flex; align-items: center; gap: 5px; width: fit-content; margin-top: var(--space-sm);
            font-size: var(--text-small); font-weight: var(--weight-semibold);
            color: var(--gold-dark); text-decoration: none;
            border-bottom: 1px solid transparent;
            transition: border-color var(--motion-fast) var(--ease-out-soft);
        }
        .watch-feature-fulllink:hover { border-color: var(--gold); }
        @media (prefers-reduced-motion: reduce) {
            .watch-feature, .watch-svc-row, .watch-svc-row-go { transition: none; }
        }

        /* --- Scripture chips (permalink + feature) --- */
        .watch-refs { display: flex; flex-wrap: wrap; gap: var(--space-xs); margin-top: var(--space-sm); }
        .watch-ref {
            font-size: var(--text-micro); font-weight: var(--weight-semibold);
            letter-spacing: var(--tracking-wide); color: var(--gold-dark);
            background: color-mix(in oklab, var(--gold) 12%, transparent);
            border-radius: var(--radius-pill); padding: 4px 12px;
        }

        /* ============================================================
           Custom segment player (/watch/<slug>) — plays only the message
           segment by default; "Watch full service" reveals the whole video
           with chapter markers. Progressive enhancement over a poster facade.
           ============================================================ */
        .vplayer { margin: 0 0 var(--space-lg); }
        .vplayer-stage {
            position: relative;
            width: 100%;
            aspect-ratio: 16 / 9;
            border-radius: var(--radius-lg);
            overflow: hidden;
            background: #000;
            box-shadow: var(--shadow-md);
        }
        .vplayer-poster {
            position: absolute; inset: 0; width: 100%; height: 100%;
            border: none; padding: 0; margin: 0; cursor: pointer;
            background: var(--surface);
            -webkit-tap-highlight-color: transparent;
            /* Above the preloaded (paused) iframe so it stays hidden behind our
               poster until playback is confirmed — no flash of YouTube's chrome. */
            z-index: 2;
        }
        .vplayer-poster img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        /* Gold poster scrim: a soft warm gold grounding gradient, not a neutral
           grey shadow. Uses a lighter, more saturated gold than the muted brand
           taupe (rgb(168,124,52)) so it reads gold rather than dark-grey, but
           kept subtle — low bottom opacity, ramp starting low on the poster.
           Same hue at both stops with an alpha-only ramp, so it never fades
           through grey. */
        .vplayer-poster-scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(168, 124, 52, 0) 48%, rgba(168, 124, 52, 0.34) 100%); }
        .vplayer-poster-play {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%) scale(1);
            width: clamp(60px, 9vw, 78px); height: clamp(60px, 9vw, 78px);
            display: flex; align-items: center; justify-content: center;
            border-radius: var(--radius-circle); background: rgba(0,0,0,0.55); color: var(--white);
            backdrop-filter: blur(2px);
            transition: transform var(--motion-medium) var(--ease-out-soft);
        }
        .vplayer-poster-play svg { margin-left: 3px; }
        /* Feature hero play: a more intentional, branded affordance than the bare
           translucent disc — a subtle ring + lift, warming to gold on hover. */
        .vplayer--feature .vplayer-poster-play {
            background: rgba(20, 16, 12, 0.52);
            border: 1px solid rgba(255, 255, 255, 0.35);
            box-shadow: var(--shadow-lg);
            transition: transform var(--motion-medium) var(--ease-out-soft),
                        background var(--motion-medium) var(--ease-out-soft),
                        border-color var(--motion-medium) var(--ease-out-soft);
        }
        .vplayer--feature .vplayer-poster:hover .vplayer-poster-play {
            background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
            border-color: rgba(255, 255, 255, 0.55);
        }
        .vplayer-poster:hover .vplayer-poster-play { transform: translate(-50%, -50%) scale(1.08); }
        .vplayer-poster:focus-visible { outline: 2px solid var(--gold); outline-offset: -2px; }
        /* Loading: tap gives instant feedback (the play glyph becomes a spinner)
           while the video buffers, so the wait never reads as a dead first press. */
        .vplayer.is-loading .vplayer-poster-play svg { display: none; }
        .vplayer.is-loading .vplayer-poster-play::after {
            content: ''; width: 42%; height: 42%; border-radius: var(--radius-circle);
            border: 2px solid rgba(255,255,255,0.35); border-top-color: var(--white);
            animation: vplayer-spin 0.7s linear infinite;
        }
        @keyframes vplayer-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .vplayer.is-loading .vplayer-poster-play::after { animation-duration: 1.4s; } }
        .vplayer-frame { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; z-index: 1; }

        /* "Tap for sound" pill — the feature auto-starts MUTED after the home
           hand-off (browser autoplay policy), so this one-tap control restores
           audio. Lives inside the 16:9 stage, fades up once playback reveals. */
        .vplayer-unmute {
            position: absolute; left: var(--space-sm); bottom: var(--space-sm); z-index: 4;
            display: inline-flex; align-items: center; gap: 8px;
            padding: 9px 15px; border: 1px solid rgba(255, 255, 255, 0.28);
            border-radius: var(--radius-pill);
            background: rgba(20, 16, 12, 0.6); color: var(--white);
            font-family: var(--font-body), 'Inter', sans-serif;
            font-size: var(--text-small); font-weight: var(--weight-medium);
            letter-spacing: 0.2px; cursor: pointer; white-space: nowrap;
            -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
            opacity: 0; transform: translateY(8px);
            transition: opacity var(--motion-medium) var(--ease-out-soft),
                        transform var(--motion-medium) var(--ease-out-soft),
                        background var(--motion-fast) ease;
        }
        .vplayer-unmute.is-visible { opacity: 1; transform: translateY(0); }
        .vplayer-unmute.is-hiding { opacity: 0; transform: translateY(8px); pointer-events: none; }
        .vplayer-unmute:hover { background: rgba(20, 16, 12, 0.8); border-color: rgba(255, 255, 255, 0.45); }
        .vplayer-unmute svg { flex-shrink: 0; }
        @media (prefers-reduced-motion: reduce) {
            .vplayer-unmute { transition: opacity var(--motion-medium) linear; transform: none; }
            .vplayer-unmute.is-visible { transform: none; }
            .vplayer-unmute.is-hiding { transform: none; }
        }

        /* The native YouTube chrome is hidden under our own bar; the iframe still
           handles the actual decode. A thin transparent shield over the iframe
           swallows clicks so the segment can't be scrubbed past via native UI. */
        .vplayer-shield { position: absolute; inset: 0; cursor: pointer; }

        .vplayer-bar {
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            gap: var(--space-sm);
            padding: var(--space-sm) var(--space-md);
            margin-top: var(--space-xs);
            background: var(--white);
            border-radius: var(--radius-pill);
            box-shadow: var(--shadow-sm);
        }
        /* The [hidden] attribute must beat the .vplayer-bar display:grid above
           (a bare class would otherwise keep the bar visible before play). */
        .vplayer-bar[hidden] { display: none; }
        .vplayer-btn {
            appearance: none; border: none; background: none; cursor: pointer;
            width: 40px; height: 40px; flex: 0 0 auto;
            display: flex; align-items: center; justify-content: center;
            color: var(--text-primary); border-radius: var(--radius-circle);
            transition: background var(--motion-fast) var(--ease-out-soft), color var(--motion-fast) var(--ease-out-soft);
        }
        .vplayer-btn:hover { background: var(--surface); color: var(--gold-dark); }
        .vplayer-btn .icon-pause { display: none; }
        .vplayer.is-playing .vplayer-btn .icon-play { display: none; }
        .vplayer.is-playing .vplayer-btn .icon-pause { display: block; }
        .vplayer-mid { display: flex; align-items: center; gap: var(--space-sm); min-width: 0; }
        .vplayer-time { font-size: var(--text-micro); color: var(--text-muted); font-variant-numeric: tabular-nums; flex: 0 0 auto; }
        .vplayer-scrub {
            position: relative; flex: 1 1 auto; height: 16px; cursor: pointer;
            display: flex; align-items: center; min-width: 40px;
        }
        .vplayer-track {
            position: relative; width: 100%; height: 4px;
            background: var(--text-hairline); border-radius: var(--radius-pill); overflow: visible;
        }
        .vplayer-fill {
            position: absolute; left: 0; top: 0; height: 100%; width: 0;
            background: var(--gold); border-radius: var(--radius-pill);
        }
        .vplayer-knob {
            position: absolute; top: 50%; left: 0;
            width: 12px; height: 12px; border-radius: var(--radius-circle);
            background: var(--gold); box-shadow: var(--shadow-sm);
            transform: translate(-50%, -50%) scale(0.9);
            transition: transform var(--motion-fast) var(--ease-out-soft);
        }
        .vplayer-scrub:hover .vplayer-knob { transform: translate(-50%, -50%) scale(1.1); }
        .vplayer-marker {
            position: absolute; top: 50%; transform: translate(-50%, -50%);
            width: 3px; height: 10px; border-radius: var(--radius-pill);
            background: color-mix(in oklab, var(--gold-deeper) 50%, var(--white));
            pointer-events: none;
        }
        .vplayer-toggle {
            appearance: none; border: 1px solid var(--text-hairline); background: var(--white);
            color: var(--text-muted); cursor: pointer; flex: 0 0 auto;
            font-family: var(--font-body), 'Inter', sans-serif; font-size: var(--text-micro);
            font-weight: var(--weight-semibold); letter-spacing: var(--tracking-wide);
            border-radius: var(--radius-pill); padding: 7px 14px;
            transition: color var(--motion-fast) var(--ease-out-soft), border-color var(--motion-fast) var(--ease-out-soft);
        }
        .vplayer-toggle:hover { color: var(--gold-dark); border-color: var(--gold); }
        /* Right-hand control group in the bar: optional Full-service toggle +
           the fullscreen (expand) button, kept together on the bar's right. */
        .vplayer-actions { display: flex; align-items: center; gap: var(--space-xs); }
        .vplayer-btn--fs { color: var(--text-muted); }
        .vplayer-btn--fs:hover { background: var(--surface); color: var(--gold-dark); }

        /* Fullscreen: the stage becomes the top-layer fullscreen element; the
           iframe fills it on black, corners squared, no aspect-ratio box. */
        .vplayer-stage:fullscreen,
        .vplayer-stage:-webkit-full-screen {
            width: 100vw; height: 100vh; aspect-ratio: auto;
            border-radius: 0; box-shadow: none; background: #000;
        }
        .vplayer-stage:fullscreen .vplayer-frame,
        .vplayer-stage:-webkit-full-screen .vplayer-frame { width: 100%; height: 100%; }

        /* --- Permalink layout --- */
        .watch-permalink-head { margin-bottom: var(--space-lg); }
        .watch-permalink-kicker {
            display: inline-flex; align-items: center; gap: 8px;
            font-size: var(--text-eyebrow); font-weight: var(--weight-bold);
            letter-spacing: var(--tracking-wider); text-transform: uppercase; color: var(--gold-dark);
        }
        .watch-permalink-title {
            font-family: var(--font-display); font-size: var(--text-title);
            line-height: var(--leading-tight); color: var(--text-primary); margin: var(--space-xs) 0 0;
        }
        .watch-permalink-meta {
            display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
            margin-top: var(--space-sm); font-size: var(--text-small); color: var(--text-muted);
        }
        .watch-permalink-grid {
            display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
            gap: var(--space-2xl); align-items: start; margin-top: var(--space-lg);
        }
        .watch-chapters { list-style: none; margin: 0; padding: 0; }
        .watch-chapter {
            display: grid; grid-template-columns: auto 1fr; gap: var(--space-md);
            padding: var(--space-sm) 0; border-top: 1px solid var(--text-hairline);
            width: 100%; text-align: left; appearance: none; background: none; border-left: none;
            border-right: none; border-bottom: none; cursor: pointer;
            transition: background var(--motion-fast) var(--ease-out-soft);
        }
        .watch-chapter:first-child { border-top: none; }
        .watch-chapter:hover { background: color-mix(in oklab, var(--gold) 5%, transparent); }
        .watch-chapter.is-current { background: color-mix(in oklab, var(--gold) 9%, transparent); }
        .watch-chapter-time {
            font-family: var(--font-body), 'Inter', sans-serif; font-size: var(--text-micro);
            font-weight: var(--weight-semibold); color: var(--gold-dark); font-variant-numeric: tabular-nums;
            background: color-mix(in oklab, var(--gold) 12%, transparent);
            border-radius: var(--radius-pill); padding: 3px 9px; height: fit-content; margin-top: 2px;
        }
        .watch-chapter-title { font-size: var(--text-body); font-weight: var(--weight-semibold); color: var(--text-primary); }
        .watch-chapter-kind {
            font-size: var(--text-micro); letter-spacing: var(--tracking-wide); text-transform: uppercase;
            color: var(--text-faint); margin-left: 8px; font-weight: var(--weight-medium);
        }
        .watch-chapter-note { font-size: var(--text-small); line-height: var(--leading-normal); color: var(--text-muted); margin-top: 2px; }

        .watch-aside-block { margin-bottom: var(--space-lg); }
        .watch-aside-label {
            font-size: var(--text-eyebrow); font-weight: var(--weight-bold);
            letter-spacing: var(--tracking-wider); text-transform: uppercase;
            color: var(--text-faint); margin-bottom: var(--space-xs);
        }
        .watch-transcript {
            margin-top: var(--space-xl); border-top: 1px solid var(--text-hairline); padding-top: var(--space-lg);
        }
        .watch-transcript summary {
            cursor: pointer; font-family: var(--font-display); font-size: var(--text-lead);
            color: var(--text-primary); list-style: none;
        }
        .watch-transcript summary::-webkit-details-marker { display: none; }
        .watch-transcript summary::after { content: ' +'; color: var(--gold-dark); }
        .watch-transcript[open] summary::after { content: ' –'; }
        .watch-transcript-body {
            margin-top: var(--space-md); max-height: 30rem; overflow-y: auto; overscroll-behavior: contain;
            font-size: var(--text-small); line-height: var(--leading-prose); color: var(--text-muted);
            white-space: pre-wrap; max-width: 70ch;
        }

        /* --- Watch surfaces: mobile --- */
        @media (max-width: 960px) {
            .watch-feature { grid-template-columns: 1fr; gap: var(--space-lg); }
            .watch-permalink-grid { grid-template-columns: 1fr; gap: var(--space-xl); }
            .watch-tabs { gap: var(--space-sm); }
        }

        @media (prefers-reduced-motion: reduce) {
            .watch-card-thumb, .watch-card-thumb img, .watch-card-play,
            .watch-feature-thumb img, .watch-feature-play, .watch-grid,
            .watch-tab::after, .vplayer-poster-play, .vplayer-knob,
            .watch-chip, .watch-card-topic, .vplayer-btn, .vplayer-toggle { transition: none; }
            .watch-card-link:hover .watch-card-thumb,
            .watch-card-link:hover .watch-card-thumb img { transform: none; }
        }

`
