// Client-side JavaScript for the home page.
// Changes from original monolith:
//   - Calendar events now fetched from /api/calendar/events (server proxy)
//     instead of calling Google Calendar API directly from the browser.
//     This leverages server-side caching and keeps all event transformation
//     logic in one place (routes/calendar.ts).
//   - User-facing error notice shown if the Calendar API fails.
//   - loading="lazy" added to dynamically-created event card images.
//   - IntersectionObserver disconnected after first fire (memory leak fix).
//   - Removed dead code: parseStaticEvents, initializeEvents wrapper,
//     old carouselStates/moveCarousel/goToSlide/updateCarousel functions.

export const homeScripts = (): string => `
        <script>
            // Sync nav-shell.scrolled-mobile with the actual scroll
            // position BEFORE DOMContentLoaded so the boolean state on
            // .nav-shell matches the visual state from first paint.
            // Without this, browsers that restore scroll position
            // (Safari iOS bfcache, session-history) paint the nav-shell
            // in its tall pill state, then handleMobileNav (registered
            // in DOMContentLoaded) detects the scroll and adds
            // .scrolled-mobile via the 0.6s transition — the user sees
            // the brand visibly slide away after first paint.
            // This early IIFE runs immediately after the body parses
            // .nav-shell, so it captures the scroll position whether
            // the head script's syncNavScrolled() got a chance or not.
            (function(){
                // Fallback path only — under html.nav-sda the scroll-driven
                // animation computes the correct first-paint pose itself and
                // nav-morph.ts owns the pole class (with hysteresis).
                if (document.documentElement.classList.contains('nav-sda')) return;
                if (window.innerWidth > 960) return;
                var sy = window.pageYOffset || document.documentElement.scrollTop || 0;
                if (sy <= 19) return;
                var nav = document.querySelector('.nav-shell');
                if (nav) nav.classList.add('scrolled-mobile');
            })();

            // Arm the nav morph transitions only after init + scroll-restore
            // settle — restore-time class flips must paint instantly (the
            // CSS gates every morph transition behind html.nav-anim-ready).
            function armNavMorph() {
                requestAnimationFrame(function() {
                    setTimeout(function() {
                        document.documentElement.classList.add('nav-anim-ready');
                    }, 350);
                });
            }
            armNavMorph();

            // bfcache restores resurrect the page WITH nav-anim-ready in the
            // snapshot, so the restore-time state flip would animate (and
            // run dozens of transitions on a mid-restore frame). Disarm,
            // sync the state instantly, then re-arm.
            window.addEventListener('pageshow', function(e) {
                if (!e.persisted) return;
                document.documentElement.classList.remove('nav-anim-ready');
                // Fallback path only — under nav-sda the class belongs to
                // nav-morph.ts's hysteresis (a mid-range toggle here would
                // disagree with it).
                if (!document.documentElement.classList.contains('nav-sda')) {
                    var nav = document.querySelector('.nav-shell');
                    if (nav && window.innerWidth <= 960) {
                        var sy = window.pageYOffset || document.documentElement.scrollTop || 0;
                        nav.classList.toggle('scrolled-mobile', sy > 19);
                    }
                }
                armNavMorph();
            });

            document.addEventListener('DOMContentLoaded', () => {
                const body = document.body;
                const outreachSection = document.querySelector('.outreach');
                const navShell = document.querySelector('.nav-shell');
                const sections = document.querySelectorAll('section[id]');
                const navLinks = document.querySelectorAll('nav a[href^="#"]');
                const pastEventsModal = document.getElementById('past-events-modal');
                const pastEventsSlides = document.getElementById('past-events-slides');
                const pastEventsDots = document.getElementById('past-events-dots');

                // Carousel elements
                const carouselWrapper = document.getElementById('carousel-wrapper');
                const carouselTrack = document.getElementById('carousel-track');
                const carouselPrev = document.getElementById('carousel-prev');
                const carouselNext = document.getElementById('carousel-next');
                const carouselDotsContainer = document.getElementById('carousel-dots');
                const carouselNav = document.getElementById('carousel-nav');

                // ========================================
                // iOS STATUS BAR COLOR (mobile only)
                // Adds .hero-in-view to <html> when the hero section is visible,
                // so the mobile CSS can tint the iOS Safari status bar olive.
                // Default is light — olive only when JS confirms hero is on-screen.
                // ========================================
                {
                    const heroEl = document.querySelector('.hero');
                    if (heroEl) {
                        const htmlEl = document.documentElement;
                        const statusBarObserver = new IntersectionObserver((entries) => {
                            htmlEl.classList.toggle('hero-in-view', entries[0].isIntersecting);
                        }, { threshold: 0.20 });
                        statusBarObserver.observe(heroEl);
                    }
                }

                // ========================================
                // SCHEDULE BANNER CAROUSEL
                // Banner crossfades through schedule images. Clicking any tab
                // (Sunday / Tuesday / Wednesday / Thursday / Friday) snaps the
                // banner to that slide and activates the card. Auto-cycles
                // every 6s; pauses while the user is hovering or focused
                // inside the section; respects prefers-reduced-motion.
                // Wrapped in an IIFE so any internal early-return only exits
                // this block — must NOT short-circuit the outer DOMContentLoaded
                // handler (which still has to register the nav scroll-compress
                // listener and everything else below).
                // ========================================
                (() => {
                    const banner = document.getElementById('schedule-banner');
                    const list = document.querySelector('.schedule-list');
                    const tabs = document.querySelectorAll('.schedule-tab');
                    const slides = banner ? banner.querySelectorAll('.schedule-banner-slide') : [];
                    if (!tabs.length) return;

                    // ── Whole-card click → navigate (desktop + mobile) ──
                    // Every schedule card is fully clickable; the click
                    // target is the corner .schedule-tab-cta's href
                    // (matching /ministries anchor). Inline links inside
                    // the description (e.g. "Sunday School" → /kids,
                    // "Caffeina State Street" → maps) keep their own
                    // destinations via the early-return guard. This is
                    // intentionally attached before the desktop-only
                    // carousel early-return so card navigation works on
                    // every viewport.
                    tabs.forEach((tab) => {
                        tab.addEventListener('click', (e) => {
                            if (e.target.closest && e.target.closest('a.schedule-tab-link')) return;
                            const cta = tab.querySelector('a.schedule-tab-cta');
                            const href = cta && cta.getAttribute('href');
                            if (href) {
                                window.location.href = href;
                            }
                        });
                    });

                    // ── Desktop-only banner carousel ──
                    if (!banner || tabs.length !== slides.length) return;
                    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                    // Banner is hidden on mobile via CSS — skip the carousel logic entirely
                    // so no auto-cycle timer runs and tap targets stay plain card buttons.
                    const isMobile = window.matchMedia('(max-width: 960px)').matches;
                    if (isMobile) return;
                        const AUTO_MS = 5200;
                        const RESUME_MS = 9000;
                        let activeIndex = 0;
                        let autoTimer = null;
                        let paused = false;
                        let resumeTimer = null;

                        function setActive(i, opts) {
                            activeIndex = ((i % tabs.length) + tabs.length) % tabs.length;
                            tabs.forEach((t, idx) => {
                                const on = idx === activeIndex;
                                t.classList.toggle('active', on);
                                t.setAttribute('aria-selected', on ? 'true' : 'false');
                            });
                            slides.forEach((s, idx) => s.classList.toggle('active', idx === activeIndex));
                            // 'has-active' on the parents lets the inactive
                            // tiles/cards dim slightly so the focal pair
                            // reads as the foreground.
                            if (banner) banner.classList.add('has-active');
                            if (list) list.classList.add('has-active');
                        }

                        function clearActive() {
                            tabs.forEach((t) => {
                                t.classList.remove('active');
                                t.setAttribute('aria-selected', 'false');
                            });
                            slides.forEach((s) => s.classList.remove('active'));
                            if (banner) banner.classList.remove('has-active');
                            if (list) list.classList.remove('has-active');
                        }

                        function startAuto() {
                            if (reducedMotion || autoTimer) return;
                            autoTimer = setInterval(() => {
                                if (!paused) setActive(activeIndex + 1);
                            }, AUTO_MS);
                        }

                        function pauseFor(ms) {
                            paused = true;
                            if (resumeTimer) clearTimeout(resumeTimer);
                            resumeTimer = setTimeout(() => {
                                paused = false;
                                resumeTimer = null;
                            }, ms);
                        }

                        tabs.forEach((tab, i) => {
                            // Card-click navigation is wired up earlier
                            // (above the desktop-only early return) so it
                            // runs on every viewport. Here we only handle
                            // the desktop-specific tab/banner sync.
                            tab.addEventListener('focus', () => {
                                setActive(i);
                                pauseFor(RESUME_MS);
                            });
                            // Hover the card → activate the matching tile +
                            // pause auto so the user can read.
                            tab.addEventListener('mouseenter', () => {
                                setActive(i);
                                paused = true;
                            });
                        });

                        // Hover any tile → activate it (and its matching
                        // card). Same paused/resume behavior as card hover.
                        slides.forEach((slide, i) => {
                            slide.addEventListener('mouseenter', () => {
                                setActive(i);
                                paused = true;
                            });
                        });

                        // Once each tile's toss-in entrance finishes, release
                        // the animation so the .active lift/scale (a transform)
                        // can transition smoothly. The entrance uses
                        // animation-fill-mode: forwards, which otherwise freezes
                        // transform at the final frame and suppresses the
                        // transform transition — making the active tile SNAP to
                        // the front instead of fading up over its neighbors.
                        // Pin opacity to 1 first so dropping the animation
                        // doesn't fall back to the base opacity: 0.
                        //
                        // Special case the tile that's already .active when its
                        // entrance ends (the initial tile on first load): its
                        // .active transform is in the cascade but masked by the
                        // forwards-fill, so simply dropping the animation would
                        // expose the lifted transform with no transition (the
                        // reported first-load "jump"). Pin the resting transform
                        // for one frame, force a reflow, then release — so the
                        // lift transitions in. Box-shadow isn't touched, so the
                        // glow doesn't flicker.
                        slides.forEach((slide) => {
                            slide.addEventListener('animationend', (e) => {
                                if (e.animationName !== 'tossIn') return;
                                if (slide.classList.contains('active')) {
                                    const resting = getComputedStyle(slide).transform;
                                    slide.style.opacity = '1';
                                    slide.style.animation = 'none';
                                    slide.style.transform = resting;
                                    void slide.offsetWidth;
                                    slide.style.transform = '';
                                } else {
                                    slide.style.opacity = '1';
                                    slide.style.animation = 'none';
                                }
                            });
                        });

                        const scheduleSection = document.getElementById('schedule');
                        if (scheduleSection) {
                            scheduleSection.addEventListener('mouseenter', () => { paused = true; });
                            scheduleSection.addEventListener('mouseleave', () => {
                                // Re-arm the auto-cycle after a short delay so
                                // it doesn't snap to a new tile the instant
                                // the cursor exits.
                                pauseFor(1200);
                            });
                        }

                        // Pause auto-cycle while the section isn't visible
                        // (saves work + prevents users returning to an unexpected slide).
                        if ('IntersectionObserver' in window) {
                            const visObserver = new IntersectionObserver((entries) => {
                                const visible = entries[0].isIntersecting;
                                if (!visible) paused = true;
                                else if (!resumeTimer) paused = false;
                            }, { threshold: 0.25 });
                            visObserver.observe(banner);
                        }

                    setActive(0);
                    startAuto();
                })();

                // ========================================
                // SCROLL-DRIVEN REVEALS
                // Adds .is-revealed to .reveal / .reveal-scale elements
                // when they enter the viewport. Stagger via per-element
                // --reveal-delay CSS variable, set here based on each
                // element's index within its [data-reveal-group] parent.
                // Wrapped in an IIFE so any early-return stays local.
                // ========================================
                (() => {
                    const html = document.documentElement;
                    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                    // Enable the CSS layer that hides .reveal elements before
                    // they're observed. Always add the class so the no-JS path
                    // (no class set) keeps everything visible.
                    html.classList.add('js-reveals');

                    // All reveal class variants — the v1.46 motion vocabulary
                    // (plus the v1.46.0 generic .reveal/.reveal-scale kept
                    // for backwards compat). When adding a new variant,
                    // include it here so the observer picks it up.
                    const REVEAL_SEL = [
                        '.reveal', '.reveal-scale',
                        '.reveal-eyebrow', '.reveal-rise', '.reveal-rise-slow', '.reveal-tight',
                        '.reveal-from-left', '.reveal-from-right', '.reveal-from-above',
                        '.reveal-photo', '.reveal-power', '.reveal-pop', '.reveal-fill',
                    ].join(', ');

                    // Compute per-element stagger delays. Each [data-reveal-group]
                    // distributes its direct-child reveal targets across an
                    // i^0.85 curve (early items distinct, tail compresses).
                    // Nested groups compound: a card that has its own group
                    // inherits the parent group's delay as a "base offset"
                    // for its own children's delays. This makes 5 stacked
                    // cards each with an inner eyebrow/title/desc cascade
                    // animate as a coherent staircase.
                    //
                    // [data-reveal-sync] is a special form of group — its
                    // children all fire at the same moment (delay 0 across
                    // them) when the parent enters viewport. Each child
                    // keeps its own transform/duration/easing so they still
                    // move differently, just on the same beat. Used where
                    // a set of inner elements should land as "one moment"
                    // rather than a cascade.
                    function applyGroupDelays(group, parentOffset) {
                        const isSync = group.hasAttribute('data-reveal-sync');
                        const baseDelay = isSync
                            ? 0
                            : parseInt(group.getAttribute('data-reveal-delay') || '90', 10);
                        const maxDelay = parseInt(group.getAttribute('data-reveal-max') || '520', 10);
                        const offset = parentOffset || 0;
                        const items = Array.from(group.children).filter((c) => c.matches(REVEAL_SEL));
                        const n = items.length;
                        items.forEach((item, i) => {
                            const t = n > 1 ? Math.pow(i / (n - 1), 0.85) * (n - 1) : 0;
                            const own = Math.min(t * baseDelay, maxDelay);
                            item.style.setProperty('--reveal-delay', (offset + own) + 'ms');
                        });
                        // Direct-child nested groups inherit a base offset.
                        Array.from(group.children).forEach((child, idx) => {
                            if (child.matches('[data-reveal-group], [data-reveal-sync]')) {
                                const directIndex = items.indexOf(child);
                                const t = (directIndex >= 0 && n > 1)
                                    ? Math.pow(directIndex / (n - 1), 0.85) * (n - 1)
                                    : idx * 0.5;
                                const childOffset = offset + Math.min(t * baseDelay, maxDelay);
                                applyGroupDelays(child, childOffset);
                            }
                        });
                    }
                    // Top-level groups only.
                    document.querySelectorAll('[data-reveal-group], [data-reveal-sync]').forEach((group) => {
                        if (!group.parentElement || !group.parentElement.closest('[data-reveal-group], [data-reveal-sync]')) {
                            applyGroupDelays(group, 0);
                        }
                    });

                    // Collect children of sync parents — they should NOT be
                    // observed individually. Instead, the sync observer
                    // fires them all together when the parent intersects.
                    //
                    // EXCEPTION: .reveal-fill (CTA buttons) is opted out of
                    // sync grouping. Fill is a high-attention motion — the
                    // gold wash flowing across the button is meant to be
                    // watched. When a fill button sits at the bottom of a
                    // tall sync parent (e.g. About CTA below the paragraph,
                    // Playlist button below the video), firing it the moment
                    // the parent's top enters viewport means the entire
                    // 1300ms animation completes while the button is still
                    // below the fold. By the time the user scrolls to it,
                    // the wipe is over and the button is just sitting
                    // there static. Individual observation makes the fill
                    // wait until the button itself reaches viewport.
                    const syncParents = Array.from(document.querySelectorAll('[data-reveal-sync]'));
                    const syncedChildren = new Set();
                    syncParents.forEach((p) => {
                        p.querySelectorAll(REVEAL_SEL).forEach((c) => {
                            if (!c.classList.contains('reveal-fill')) {
                                syncedChildren.add(c);
                            }
                        });
                    });

                    const targets = document.querySelectorAll(REVEAL_SEL);
                    if (!targets.length) return;

                    // The reveal observer is taking over from the
                    // head-script watchdog. Cancel the watchdog so it
                    // doesn't later force every below-the-fold reveal
                    // to .is-revealed before the user has scrolled to
                    // it (which would defeat the point of scroll-
                    // triggered reveals).
                    if (window.__revealWatchdogTimer) {
                        clearTimeout(window.__revealWatchdogTimer);
                        window.__revealWatchdogTimer = null;
                    }

                    // Reduced-motion OR a non-fresh visit (back/forward,
                    // reload, same-origin nav, bfcache, hash-load — anywhere
                    // the head-script tagged <html class="no-entrance">):
                    // mark every reveal target as already-revealed and skip
                    // the observer. Previously the .no-entrance bypass only
                    // suppressed the section entrance keyframe — the
                    // .reveal-* IntersectionObserver still ran, so the hero
                    // tagline, schedule tab eyebrows/titles, About teaser,
                    // outreach grid, etc. re-animated on every subpage→home
                    // navigation. Now they read as already-settled on any
                    // return visit, only animating on the genuinely-first load.
                    const skipEntrance = html.classList.contains('no-entrance');
                    if (reducedMotion || skipEntrance) {
                        targets.forEach((el) => el.classList.add('is-revealed'));
                        return;
                    }

                    // Standard observer — fires per-element as each enters viewport.
                    const revealObserver = new IntersectionObserver((entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                entry.target.classList.add('is-revealed');
                                revealObserver.unobserve(entry.target);
                            }
                        });
                    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });

                    // Sync observer — observes [data-reveal-sync] parents and,
                    // when one enters viewport, marks ALL its reveal-class
                    // children .is-revealed simultaneously. Used so a card's
                    // inner elements land as one beat instead of cascading.
                    // .reveal-fill is intentionally skipped here (see the
                    // syncedChildren build above) so fill buttons wait for
                    // their own viewport entry.
                    const syncObserver = new IntersectionObserver((entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                entry.target.querySelectorAll(REVEAL_SEL).forEach((c) => {
                                    if (c.classList.contains('reveal-fill')) return;
                                    c.classList.add('is-revealed');
                                });
                                syncObserver.unobserve(entry.target);
                            }
                        });
                    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });

                    targets.forEach((el) => {
                        // Skip elements that aren't in the layout — e.g. the
                        // schedule banner which is display:none on mobile.
                        // IntersectionObserver never fires for zero-area
                        // elements, so they'd sit hidden forever. Mark them
                        // revealed immediately so they're ready if a resize
                        // ever brings them into the layout.
                        const r = el.getBoundingClientRect();
                        if (r.width === 0 && r.height === 0) {
                            el.classList.add('is-revealed');
                            return;
                        }
                        // Sync-managed children are fired by the sync observer
                        // via their parent — don't observe them individually
                        // or the topmost one would fire early.
                        if (syncedChildren.has(el)) return;
                        revealObserver.observe(el);
                    });

                    // Attach the sync observer to each sync parent.
                    syncParents.forEach((p) => {
                        const r = p.getBoundingClientRect();
                        if (r.width === 0 && r.height === 0) {
                            // Hidden parent — mark all children revealed too.
                            p.querySelectorAll(REVEAL_SEL).forEach((c) => c.classList.add('is-revealed'));
                            return;
                        }
                        syncObserver.observe(p);
                    });
                })();

                // ========================================
                // DYNAMIC EVENT MANAGER
                // Fetches from /api/calendar/events (server-side proxy with 5-min cache)
                // Auto-archives past events, handles 0-3+ upcoming events
                // ========================================

                // Browser-side cache (5 minutes) to avoid repeat fetches within a session
                let calendarCache = { data: null, timestamp: 0 };

                async function fetchGoogleCalendarEvents() {
                    const now = Date.now();
                    if (calendarCache.data && (now - calendarCache.timestamp) < 5 * 60 * 1000) {
                        return calendarCache.data;
                    }

                    try {
                        const response = await fetch('/api/calendar/events');
                        if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
                        const data = await response.json();
                        if (!data.success) throw new Error(data.error || 'Calendar API error');
                        calendarCache = { data: data.events, timestamp: now };
                        return data.events;
                    } catch (error) {
                        console.error('Failed to fetch events:', error);
                        const heading = document.querySelector('.outreach .section-heading');
                        if (heading && !heading.nextElementSibling?.classList.contains('calendar-error-notice')) {
                            const notice = document.createElement('p');
                            notice.className = 'calendar-error-notice';
                            notice.style.cssText = 'color:rgba(26,26,46,0.5);font-size:14px;margin-top:8px;text-align:center;';
                            notice.textContent = 'Unable to load events right now. Please check back soon.';
                            heading.insertAdjacentElement('afterend', notice);
                        }
                        return null;
                    }
                }

                function parseLocalDate(dateStr) {
                    const parts = dateStr.split('-');
                    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                }

                function categorizeEvents(allEvents) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    allEvents.sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));

                    const upcoming = [];
                    const past = [];

                    allEvents.forEach(event => {
                        const eventDate = parseLocalDate(event.date);
                        eventDate.setHours(23, 59, 59, 999);
                        if (eventDate >= today) upcoming.push(event);
                        else past.push(event);
                    });

                    past.sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
                    return { upcoming, past };
                }

                async function initializeEventsAsync() {
                    const events = await fetchGoogleCalendarEvents();
                    return categorizeEvents(events || []);
                }

                // Extract dominant colors from an image via offscreen canvas sampling
                function extractColorsFromImage(img) {
                    try {
                        const canvas = document.createElement('canvas');
                        const size = 64;
                        canvas.width = size;
                        canvas.height = size;
                        const ctx = canvas.getContext('2d', { willReadFrequently: true });
                        ctx.drawImage(img, 0, 0, size, size);
                        const data = ctx.getImageData(0, 0, size, size).data;
                        // Sample pixels at grid points and cluster into dominant colors
                        const buckets = {};
                        for (let y = 2; y < size; y += 4) {
                            for (let x = 2; x < size; x += 4) {
                                const i = (y * size + x) * 4;
                                const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
                                if (a < 128) continue;
                                // Quantize to reduce to key colors
                                const qr = Math.round(r / 40) * 40;
                                const qg = Math.round(g / 40) * 40;
                                const qb = Math.round(b / 40) * 40;
                                const key = qr + ',' + qg + ',' + qb;
                                if (!buckets[key]) buckets[key] = { r: 0, g: 0, b: 0, count: 0 };
                                buckets[key].r += r;
                                buckets[key].g += g;
                                buckets[key].b += b;
                                buckets[key].count++;
                            }
                        }
                        // Sort by frequency, take top colors, skip near-white and near-black
                        return Object.values(buckets)
                            .filter(b => {
                                const avg = (b.r / b.count + b.g / b.count + b.b / b.count) / 3;
                                return avg > 50 && avg < 210;
                            })
                            .sort((a, b) => b.count - a.count)
                            .slice(0, 6)
                            .map(b => ({
                                r: Math.round(b.r / b.count),
                                g: Math.round(b.g / b.count),
                                b: Math.round(b.b / b.count),
                                count: b.count
                            }));
                    } catch (e) {
                        return [];
                    }
                }

                // Convert raw RGB to a soft, pastel-like color string for the swirl
                function toSwirlColor(r, g, b) {
                    // Lighten 45% toward white for a softer, more pastel feel
                    const lr = Math.min(255, Math.round(r * 0.55 + 255 * 0.45));
                    const lg = Math.min(255, Math.round(g * 0.55 + 255 * 0.45));
                    const lb = Math.min(255, Math.round(b * 0.55 + 255 * 0.45));
                    return 'rgba(' + lr + ',' + lg + ',' + lb + ',0.7)';
                }

                // Load past event images and extract a palette, then inject swirl blobs
                function initColorSwirl(pastEvents, cardEl) {
                    if (!cardEl) return;

                    // Default soft palette (gold/warm tones matching church brand)
                    const defaultColors = [
                        'rgba(212, 165, 116, 0.85)',
                        'rgba(200, 140, 90, 0.8)',
                        'rgba(150, 180, 215, 0.75)',
                        'rgba(210, 160, 140, 0.8)',
                        'rgba(170, 155, 200, 0.75)'
                    ];

                    // Create swirl container and frost overlay
                    const swirlEl = document.createElement('div');
                    swirlEl.className = 'stay-tuned-swirl';
                    const frostEl = document.createElement('div');
                    frostEl.className = 'stay-tuned-frost';

                    function makeBlobGradient(c) {
                        return 'radial-gradient(circle, ' + c + ' 0%, transparent 70%)';
                    }

                    // Render blobs immediately with given colors
                    function renderBlobs(colors) {
                        while (colors.length < 5) {
                            colors.push(defaultColors[colors.length % defaultColors.length]);
                        }
                        swirlEl.innerHTML = colors.slice(0, 5).map(c =>
                            '<div class="swirl-blob" style="background:' + makeBlobGradient(c) + ';"></div>'
                        ).join('');
                        cardEl.insertBefore(frostEl, cardEl.firstChild);
                        cardEl.insertBefore(swirlEl, cardEl.firstChild);
                    }

                    // Update existing blobs with new colors (CSS transition handles smoothness)
                    function updateBlobs(colors) {
                        while (colors.length < 5) {
                            colors.push(defaultColors[colors.length % defaultColors.length]);
                        }
                        const blobs = swirlEl.querySelectorAll('.swirl-blob');
                        colors.slice(0, 5).forEach((c, i) => {
                            if (blobs[i]) blobs[i].style.background = makeBlobGradient(c);
                        });
                    }

                    // Step 1: Render immediately with defaults
                    renderBlobs([...defaultColors]);

                    // Step 2: Try to extract real colors from past event images
                    const imagesWithSrc = pastEvents.filter(e => e.image);
                    if (imagesWithSrc.length === 0) return;

                    // Load up to 3 images, use small size for fast loading
                    const toLoad = imagesWithSrc.slice(0, 3);
                    let loaded = 0;
                    // Store colors PER image so we can distribute evenly
                    const perImageColors = [];
                    let updated = false;

                    // Round-robin pick from each image's palette to ensure color diversity
                    function buildDiversePalette() {
                        const result = [];
                        const maxRounds = 3;
                        for (let round = 0; round < maxRounds && result.length < 5; round++) {
                            for (let i = 0; i < perImageColors.length && result.length < 5; i++) {
                                if (perImageColors[i][round]) {
                                    result.push(perImageColors[i][round]);
                                }
                            }
                        }
                        return result;
                    }

                    function tryUpdate() {
                        if (updated) return;
                        const totalColors = perImageColors.reduce((s, arr) => s + arr.length, 0);
                        if (totalColors >= 3) {
                            updated = true;
                            const diverse = buildDiversePalette();
                            const swirlColors = diverse.map(c => toSwirlColor(c.r, c.g, c.b));
                            updateBlobs(swirlColors);
                        }
                    }

                    toLoad.forEach(event => {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        // Use smaller image for faster loading + less data to process
                        const smallSrc = event.image.replace(/=w\d+/, '=w100');
                        img.onload = function() {
                            const colors = extractColorsFromImage(img);
                            perImageColors.push(colors);
                            loaded++;
                            if (loaded === toLoad.length || perImageColors.length >= toLoad.length) {
                                tryUpdate();
                            }
                        };
                        img.onerror = function() {
                            loaded++;
                            if (loaded === toLoad.length) tryUpdate();
                        };
                        img.src = smallSrc;
                    });

                    // Final fallback — if after 5s we got some colors but not enough, use what we have
                    setTimeout(() => {
                        if (!updated && perImageColors.length > 0) {
                            updated = true;
                            const diverse = buildDiversePalette();
                            const swirlColors = diverse.map(c => toSwirlColor(c.r, c.g, c.b));
                            updateBlobs(swirlColors);
                        }
                    }, 5000);
                }

                function renderStayTunedCard(hasPastEvents, pastEvents) {
                    const isDesktop = window.innerWidth >= 961;

                    const stayTunedInner = \`
                        <div class="stay-tuned-content">
                            <div class="stay-tuned-ornament">
                                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="stay-tuned-star">
                                    <path d="M40 8 L44 32 L68 28 L48 40 L68 52 L44 48 L40 72 L36 48 L12 52 L32 40 L12 28 L36 32 Z" fill="url(#goldGrad)" opacity="0.9"/>
                                    <defs><linearGradient id="goldGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="var(--gold)"/><stop offset="100%" stop-color="var(--gold-dark)"/></linearGradient></defs>
                                </svg>
                            </div>
                            <h3 class="stay-tuned-title">Stay Tuned</h3>
                            <div class="stay-tuned-rule"></div>
                            <p class="stay-tuned-text">New events are on the horizon.<br>Check back soon for what’s next.</p>
                            \${hasPastEvents && !isDesktop ? '<button class="btn-view-past-events" id="btn-view-past-events">View Past Events</button>' : ''}
                        </div>
                    \`;

                    if (isDesktop && hasPastEvents) {
                        // Desktop: two centered cards side-by-side. The MEMORIES
                        // top-left badge was removed for symmetry with Stay Tuned
                        // (which has no chrome at top). Camera icon + "Past Events"
                        // title + button already convey the archive function.
                        return \`
                            <div class="stay-tuned-card" id="stay-tuned-card-el">
                                \${stayTunedInner}
                            </div>
                            <div class="past-events-outer">
                                <div class="event-outer-card">
                                    <div class="past-events-card" id="btn-view-past-events-desktop">
                                        <div class="past-card-icon"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="var(--gold)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="14" rx="3"/><circle cx="12" cy="13" r="4"/><path d="M7 6V5a2 2 0 012-2h6a2 2 0 012 2v1"/></svg></div>
                                        <h3 class="past-card-title">Past Events</h3>
                                        <p class="past-card-text">Take a look back at the moments we’ve shared together in our community.</p>
                                        <span class="past-card-btn">Browse Memories</span>
                                    </div>
                                </div>
                            </div>
                        \`;
                    } else {
                        return \`
                            <div class="stay-tuned-card" id="stay-tuned-card-el">
                                \${stayTunedInner}
                            </div>
                        \`;
                    }
                }

                // ── Event content helpers (shared by the card + the detail view) ──
                // Escape staff-authored text before injecting it into markup.
                function escEvent(s) {
                    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
                        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
                    });
                }
                // A Google Maps search link for a location string.
                function eventMapsLink(loc) {
                    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(loc);
                }
                // Light formatting for the description body: blank lines split
                // paragraphs; a run of "- " / "• " lines becomes a bullet list.
                function formatEventBody(text) {
                    return String(text).split(/\\n{2,}/).map(function (block) {
                        var lines = block.split('\\n').filter(function (l) { return l.trim() !== ''; });
                        if (lines.length === 0) return '';
                        var isList = lines.every(function (l) { return /^\\s*[-•]\\s+/.test(l); });
                        if (isList) {
                            return '<ul>' + lines.map(function (l) {
                                return '<li>' + escEvent(l.replace(/^\\s*[-•]\\s+/, '')) + '</li>';
                            }).join('') + '</ul>';
                        }
                        return '<p>' + lines.map(function (l) { return escEvent(l); }).join('<br>') + '</p>';
                    }).join('');
                }
                function eventFactRow(label, value, href) {
                    var v = href
                        ? '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + escEvent(value) + '</a>'
                        : escEvent(value);
                    return '<div class="event-fact"><dt>' + escEvent(label) + '</dt><dd>' + v + '</dd></div>';
                }
                // The detail lightbox body for one upcoming event: large flyer +
                // when/where facts + formatted description + every CTA.
                function renderEventDetail(event) {
                    var imageHtml = event.image
                        ? '<img src="' + event.image + '" alt="' + escEvent(event.title) + '" class="event-detail-flyer-img" decoding="async">'
                        : '<div class="event-detail-placeholder"><span>📅</span></div>';
                    var whenParts = [event.displayDate, event.time].filter(Boolean).join(' · ');
                    var facts = [];
                    if (event.location) facts.push(eventFactRow('Where', event.location, eventMapsLink(event.location)));
                    if (event.cost) facts.push(eventFactRow('Cost', event.cost));
                    if (event.ages) facts.push(eventFactRow('Who', event.ages));
                    if (event.rsvpBy) facts.push(eventFactRow('RSVP by', event.rsvpBy));
                    var factsHtml = facts.length ? '<dl class="event-detail-facts">' + facts.join('') + '</dl>' : '';
                    var bodyHtml = event.description ? '<div class="event-detail-body">' + formatEventBody(event.description) + '</div>' : '';
                    var ctas = event.ctas || [];
                    var ctasHtml = ctas.length
                        ? '<div class="event-detail-ctas">' + ctas.map(function (c, i) {
                            return '<a href="' + c.link + '" class="event-link-btn' + (i > 0 ? ' event-link-btn-secondary' : '') + '" target="_blank" rel="noopener noreferrer">' + escEvent(c.text) + '</a>';
                        }).join('') + '</div>'
                        : '';
                    return '<div class="event-detail-figure">' + imageHtml + '</div>'
                        + '<div class="event-detail-info">'
                        + (whenParts ? '<span class="event-detail-eyebrow">' + escEvent(whenParts) + '</span>' : '')
                        + '<h3 class="event-detail-title">' + escEvent(event.title) + '</h3>'
                        + factsHtml + bodyHtml + ctasHtml
                        + '</div>';
                }

                function renderUpcomingEventCard(event, index, totalUpcoming) {
                    const imageHtml = event.image
                        ? \`<img src="\${event.image}" alt="\${escEvent(event.title)}" class="flyer-image" loading="lazy" decoding="async" crossorigin="anonymous" onerror="this.style.display='none';">\`
                        : \`<div class="flyer-placeholder" style="width:100%;height:100%;background:linear-gradient(135deg,var(--gold),var(--gold-dark));display:flex;align-items:center;justify-content:center;"><span style="font-size:48px;">📅</span></div>\`;

                    // Time text — only when a specific time exists (null means all-day event)
                    const timeHtml = event.time
                        ? \`<span class="event-time-pill">\${escEvent(event.time)}</span>\`
                        : \`<span></span>\`;

                    // Primary CTA (the first live link) → the gold pill under the
                    // flyer. Every CTA + the facts + body live in the detail view
                    // the flyer opens; with no link the pill itself opens it.
                    const ctas = event.ctas || [];
                    const primary = ctas[0];
                    const buttonHtml = primary
                        ? \`<a href="\${primary.link}" class="event-link-btn" target="_blank" rel="noopener noreferrer">\${escEvent(primary.text)}</a>\`
                        : \`<button type="button" class="event-link-btn event-detail-open" data-event-index="\${index}">View details</button>\`;

                    return \`
                        <div class="carousel-card">
                            <div class="event-card">
                                <div class="event-outer-card">
                                    <div class="event-card-header">
                                        <span class="event-date">\${escEvent(event.displayDate)}</span>
                                        \${timeHtml}
                                    </div>
                                    <div class="event-flyer-wrapper" data-glow-detect>
                                        \${imageHtml}
                                        <button type="button" class="event-flyer-trigger event-detail-open" data-event-index="\${index}" aria-label="View details for \${escEvent(event.title)}">
                                            <span class="event-flyer-hint" aria-hidden="true">View details</span>
                                        </button>
                                    </div>
                                    \${buttonHtml}
                                </div>
                            </div>
                        </div>
                    \`;
                }

                function renderPastEventSlide(event, index, isActive) {
                    return \`
                        <div class="past-event-slide \${isActive ? 'active' : ''}" data-past-index="\${index}">
                            <img src="\${event.image}" alt="\${event.title}" loading="\${index < 2 ? 'eager' : 'lazy'}" decoding="async">
                            <div class="past-event-slide-info">
                                <span class="past-event-slide-date">\${event.displayDate}</span>
                                <h4 class="past-event-slide-title">\${event.title}</h4>
                            </div>
                        </div>
                    \`;
                }

                // Initialize and render events
                (async () => {
                const { upcoming, past } = await initializeEventsAsync();

                const stayTunedContainer = document.getElementById('stay-tuned-container');

                if (upcoming.length === 0) {
                    if (stayTunedContainer) {
                        stayTunedContainer.innerHTML = renderStayTunedCard(past.length > 0, past);
                        // Show as grid on desktop (CSS handles sizing/centering), block on mobile
                        stayTunedContainer.style.display = window.innerWidth >= 961 ? 'grid' : 'block';
                        // Initialize the color swirl animation on the stay tuned card
                        const cardEl = document.getElementById('stay-tuned-card-el');
                        if (cardEl) initColorSwirl(past, cardEl);
                    }
                    if (carouselWrapper) carouselWrapper.style.display = 'none';
                    body.classList.add('stay-tuned-active');
                    if (outreachSection) outreachSection.classList.add('stay-tuned-only');
                } else {
                    if (stayTunedContainer) stayTunedContainer.style.display = 'none';
                    if (carouselWrapper) carouselWrapper.style.display = 'block';

                    const allCards = upcoming.map((event, i) =>
                        renderUpcomingEventCard(event, i, upcoming.length)
                    );

                    if (past.length > 0) {
                        allCards.push(\`
                            <div class="carousel-card">
                                <div class="event-card">
                                    <div class="event-outer-card">
                                        <div class="event-card-header">
                                            <span class="past-card-badge">MEMORIES</span>
                                            <span></span>
                                        </div>
                                        <div class="carousel-past-card" id="carousel-see-past">
                                            <div class="past-card-icon"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="var(--gold)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="14" rx="3"/><circle cx="12" cy="13" r="4"/><path d="M7 6V5a2 2 0 012-2h6a2 2 0 012 2v1"/></svg></div>
                                            <h3 class="past-card-title">Past Events</h3>
                                            <p class="past-card-text">Take a look back at the moments we’ve shared together in our community.</p>
                                        </div>
                                        <button class="event-link-btn" id="carousel-see-past-btn">Browse Memories</button>
                                    </div>
                                </div>
                            </div>
                        \`);
                    }

                    initCarousel(allCards, past);
                }

                // ── Event detail lightbox ───────────────────────────────────
                // Tapping an upcoming card's flyer (or a "View details" pill)
                // opens a modal with the full flyer, when/where facts, the
                // formatted description, and every CTA. Delegated so it survives
                // carousel re-renders; guarded so it's a no-op where the modal
                // isn't present (e.g. the home page).
                const eventDetailModal = document.getElementById('event-detail-modal');
                const eventDetailContent = document.getElementById('event-detail-content');
                if (eventDetailModal && eventDetailContent) {
                    const closeEventDetail = () => {
                        eventDetailModal.classList.remove('active');
                        body.classList.remove('modal-open');
                    };
                    const openEventDetail = (idx) => {
                        const ev = upcoming[idx];
                        if (!ev) return;
                        eventDetailContent.innerHTML = renderEventDetail(ev);
                        eventDetailContent.scrollTop = 0;
                        eventDetailModal.classList.add('active');
                        body.classList.add('modal-open');
                        const closeBtn = document.getElementById('event-detail-close');
                        if (closeBtn) closeBtn.focus();
                    };
                    document.addEventListener('click', (e) => {
                        const t = e.target.closest ? e.target.closest('.event-detail-open') : null;
                        if (!t) return;
                        const idx = parseInt(t.getAttribute('data-event-index'), 10);
                        if (!isNaN(idx)) openEventDetail(idx);
                    });
                    const edClose = document.getElementById('event-detail-close');
                    if (edClose) edClose.addEventListener('click', closeEventDetail);
                    eventDetailModal.addEventListener('click', (e) => {
                        if (e.target === eventDetailModal) closeEventDetail();
                    });
                    document.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape' && eventDetailModal.classList.contains('active')) closeEventDetail();
                    });
                }

                // Render past events in modal
                if (past.length > 0 && pastEventsSlides && pastEventsDots) {
                    pastEventsSlides.innerHTML = past.map((event, i) =>
                        renderPastEventSlide(event, i, i === 0)
                    ).join('');

                    // Pre-warm browser cache for past event images so modal opens
                    // without any visible loading delay. Images 0-1 use loading="eager"
                    // above; this prefetches the next few before the user clicks.
                    past.slice(0, 4).forEach(function(ev) {
                        if (ev.image) { var img = new Image(); img.src = ev.image; }
                    });

                    pastEventsDots.innerHTML = past.map((_, i) =>
                        \`<span class="past-events-dot \${i === 0 ? 'active' : ''}"></span>\`
                    ).join('');
                }

                // ========================================
                // PAST EVENTS MODAL CONTROLS
                // ========================================

                let currentPastIndex = 0;
                const pastSlides = document.querySelectorAll('.past-event-slide');
                const pastDots = document.querySelectorAll('.past-events-dot');

                function updatePastEventSlide(index) {
                    currentPastIndex = index;
                    pastSlides.forEach((slide, i) => {
                        slide.classList.remove('active', 'prev');
                        if (i === index) slide.classList.add('active');
                        else if (i < index) slide.classList.add('prev');
                    });
                    pastDots.forEach((dot, i) => {
                        dot.classList.toggle('active', i === index);
                    });
                }

                const viewPastEventsBtn = document.getElementById('btn-view-past-events');
                const viewPastEventsBtnDesktop = document.getElementById('btn-view-past-events-desktop');

                const openPastEventsModal = () => {
                    if (pastEventsModal && past.length > 0) {
                        pastEventsModal.classList.add('active');
                        body.classList.add('modal-open');
                        updatePastEventSlide(0);
                    }
                };

                if (viewPastEventsBtn && pastEventsModal && past.length > 0) {
                    viewPastEventsBtn.addEventListener('click', openPastEventsModal);
                }
                if (viewPastEventsBtnDesktop && pastEventsModal && past.length > 0) {
                    viewPastEventsBtnDesktop.addEventListener('click', openPastEventsModal);
                }

                const closePastEventsBtn = document.getElementById('close-past-events');
                if (closePastEventsBtn && pastEventsModal) {
                    const closeModal = () => {
                        pastEventsModal.classList.remove('active');
                        body.classList.remove('modal-open');
                    };
                    closePastEventsBtn.addEventListener('click', closeModal);
                    pastEventsModal.addEventListener('click', (e) => {
                        if (e.target === pastEventsModal) closeModal();
                    });
                    document.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape' && pastEventsModal.classList.contains('active')) closeModal();
                    });
                }

                const pastPrevBtn = document.getElementById('past-prev');
                const pastNextBtn = document.getElementById('past-next');
                if (pastPrevBtn) {
                    pastPrevBtn.addEventListener('click', () => {
                        updatePastEventSlide((currentPastIndex - 1 + past.length) % past.length);
                    });
                }
                if (pastNextBtn) {
                    pastNextBtn.addEventListener('click', () => {
                        updatePastEventSlide((currentPastIndex + 1) % past.length);
                    });
                }

                pastDots.forEach((dot, index) => {
                    dot.addEventListener('click', () => updatePastEventSlide(index));
                });

                if (pastEventsSlides && past.length > 1) {
                    let pastTouchStartX = 0;
                    pastEventsSlides.addEventListener('touchstart', e => {
                        pastTouchStartX = e.touches[0].clientX;
                    }, { passive: true });
                    pastEventsSlides.addEventListener('touchend', e => {
                        if (!e.changedTouches[0]) return;
                        const dx = pastTouchStartX - e.changedTouches[0].clientX;
                        if (Math.abs(dx) > 50) {
                            if (dx > 0) updatePastEventSlide((currentPastIndex + 1) % past.length);
                            else updatePastEventSlide((currentPastIndex - 1 + past.length) % past.length);
                        }
                    }, { passive: true });
                }

                })(); // End of async event initialization IIFE
                // (Subpage hash landing is handled in shared/subpage-header.ts,
                //  which runs on every subpage regardless of homeScripts.)

                // ----- Hashload anchor offset (v1.62.50) -----
                // Where a cross-page /#anchor hash-load lands on home.
                // Per design intent: each home section's eyebrow tucks
                // fully behind the nav-shell on hash-load — the gold-
                // highlighted active nav link IS the "you are here"
                // marker, so the eyebrow's label is redundant.
                //
                // Behavior: when the target has a .section-eyebrow,
                // compute a scroll target so the eyebrow lands inside
                // the nav-shell's bounds (eyebrow.bottom <= navBottom
                // - 2px buffer). Predict the eventual compressed-nav
                // bottom so the math adapts to viewport width (mobile-
                // 360 has a 4px shorter compressed nav than mobile-393).
                //
                // SCOPED TO HASHLOAD ONLY. The in-page click handler
                // (further down) uses the simple OLD 30/60 offset and
                // a single smooth scrollTo with no correction — the
                // post-scrollend re-measure that originally lived
                // alongside this helper fought the in-flight smooth-
                // scroll and produced the "scrolling then jumping back
                // and forth" glitch. The correction is safe ONLY when
                // main is invisible (hashload fade-in path), where any
                // re-position is unseen.
                function getHomeAnchorTargetY(hash) {
                    if (!hash || hash === '#' || hash === '#home') return 0;
                    const el = document.querySelector(hash);
                    if (!el) return null;
                    if (hash === '#gift-form') {
                        const off = window.innerWidth <= 960 ? 100 : 150;
                        return Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - off);
                    }
                    const eyebrow = el.querySelector('.section-eyebrow');
                    if (eyebrow) {
                        const eyebrowRect = eyebrow.getBoundingClientRect();
                        const eyebrowHeight = eyebrowRect.height || 38;
                        // Predict the nav-shell's eventual bottom AFTER the
                        // scroll. On mobile the nav compresses once scrollY
                        // crosses ~19px; the compressed bottom varies by
                        // viewport (≈57px on 360w, ≈62px on 768w). We use
                        // a conservative cap so the eyebrow tucks under the
                        // narrowest nav we'll encounter. On desktop the nav
                        // doesn't compress and sits at top:16 / bottom:~106.
                        const navBottomAfterScroll = window.innerWidth <= 960 ? 56 : 104;
                        // Tuck so eyebrow.bottom sits 2px ABOVE the nav's
                        // bottom edge; eyebrow.top is then >= nav's top
                        // (16) on every viewport where eyebrowHeight <=
                        // navBottomAfterScroll - 18.
                        const tuckY = Math.max(16, navBottomAfterScroll - eyebrowHeight - 2);
                        return Math.max(0, eyebrowRect.top + window.pageYOffset - tuckY);
                    }
                    const navOffset = window.innerWidth <= 960 ? 30 : 60;
                    return Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - navOffset);
                }

                // HOME-page hash flow (v1.62.50).
                //
                // When the user clicks a /#anchor link from a subpage, we
                // want the SAME entrance the subpages use for hash-loads:
                // main paints invisible (opacity 0, translateY(-40px)),
                // an instant scroll lands at the target position WHILE
                // invisible, and then main fades + slides into place.
                //
                // The home-head.ts inline <head> script already added
                // <html class="hash-fade"> synchronously and stashed the
                // hash on window.__targetHash. Now we:
                //   1. Wait for window.load + fonts.ready + 2rAF + rIC
                //      (matching subpage-header.ts).
                //   2. Compute the target Y using the home nav's offset
                //      rules (30/60 default, 100/150 for #gift-form).
                //   3. Subtract the active translateY transform from the
                //      rect so scrollTo targets the POST-fade position.
                //   4. Instant scrollTo. Watchdog re-measures every 100ms;
                //      after 3 stable measurements (300ms of no drift),
                //      add .hash-fade-in to start the entrance transition.
                //   5. Restore the URL hash so the page is bookmarkable
                //      and the back button works. Clear on first user
                //      scroll so reload preserves actual scroll position.
                const _isHomePage = window.location.pathname === '/' || window.location.pathname === '';
                const _homeStashedHash = window.__targetHash || '';
                if (_isHomePage && _homeStashedHash) {
                    let fadeInFired = false;
                    const fireFadeIn = () => {
                        if (fadeInFired) return;
                        fadeInFired = true;
                        document.documentElement.classList.add('hash-fade-in');
                        try {
                            history.replaceState(null, '', location.pathname + location.search + _homeStashedHash);
                        } catch (e) {}
                        const clearHashOnScroll = () => {
                            if (location.hash === _homeStashedHash) {
                                try {
                                    history.replaceState(null, '', location.pathname + location.search);
                                } catch (e) {}
                            }
                        };
                        setTimeout(() => {
                            window.addEventListener('scroll', clearHashOnScroll, { once: true, passive: true });
                        }, 1500);
                    };
                    let fired = false;
                    const fireScroll = () => {
                        if (fired) return;
                        fired = true;
                        window.__hashScrollFired = true; // signal the head safety timer to stand down
                        if (_homeStashedHash === '#home' || _homeStashedHash === '#') {
                            window.scrollTo(0, 0);
                            fireFadeIn();
                            return;
                        }
                        const t = document.querySelector(_homeStashedHash);
                        if (!t) {
                            fireFadeIn();
                            return;
                        }
                        const mainEl = document.querySelector('main');
                        // getBoundingClientRect().top includes the active
                        // translateY(-40px) on main. Subtract it so we
                        // scroll to the POST-fade landing position; when
                        // the transform unwinds the target stays put.
                        const getTransformY = () => {
                            if (!mainEl) return 0;
                            const cs = window.getComputedStyle(mainEl).transform;
                            if (!cs || cs === 'none') return 0;
                            const m = cs.match(/matrix\(([^)]+)\)/);
                            if (m) {
                                const parts = m[1].split(',');
                                return parseFloat(parts[5]) || 0;
                            }
                            const m3 = cs.match(/matrix3d\(([^)]+)\)/);
                            if (m3) {
                                const p3 = m3[1].split(',');
                                return parseFloat(p3[13]) || 0;
                            }
                            return 0;
                        };
                        const measureTargetY = () => {
                            const raw = getHomeAnchorTargetY(_homeStashedHash);
                            if (raw == null) return null;
                            // Subtract the active translateY transform on
                            // main so the scrollY targets the POST-fade
                            // resting position (the rect inside
                            // getHomeAnchorTargetY already includes the
                            // transform, so undo it here).
                            return Math.max(0, raw - getTransformY());
                        };
                        let lastY = measureTargetY();
                        if (lastY == null) {
                            fireFadeIn();
                            return;
                        }
                        window.scrollTo(0, lastY);
                        let stableCount = 0;
                        const watchdog = setInterval(() => {
                            const newY = measureTargetY();
                            if (newY == null) {
                                clearInterval(watchdog);
                                fireFadeIn();
                                return;
                            }
                            if (Math.abs(newY - lastY) > 2) {
                                window.scrollTo(0, newY);
                                lastY = newY;
                                stableCount = 0;
                            } else {
                                stableCount++;
                                if (stableCount >= 3) {
                                    clearInterval(watchdog);
                                    fireFadeIn();
                                }
                            }
                        }, 100);
                        setTimeout(() => {
                            clearInterval(watchdog);
                            fireFadeIn();
                        }, 1500);
                    };
                    const afterLoad = () => {
                        const fontsReady = (document.fonts && document.fonts.ready)
                            ? Promise.race([
                                document.fonts.ready,
                                new Promise((r) => setTimeout(r, 150))
                              ])
                            : Promise.resolve();
                        fontsReady.then(() => {
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    if (window.requestIdleCallback) {
                                        requestIdleCallback(fireScroll, { timeout: 200 });
                                    } else {
                                        setTimeout(fireScroll, 40);
                                    }
                                });
                            });
                        });
                    };
                    if (document.readyState === 'complete') {
                        afterLoad();
                    } else {
                        window.addEventListener('load', afterLoad, { once: true });
                        setTimeout(fireScroll, 1200);
                    }
                }

                // Mobile nav compression on scroll
                let lastNavScrollY = 0;
                function getScrollThreshold() {
                    const width = window.innerWidth;
                    if (width <= 960) return 19; // mobile
                    return 32; // desktop
                }
                let scrollUpAtTopCount = 0;
                let isNavigatingHome = false;

                function handleMobileNav() {
                    // This script also runs on /outreach where there's no
                    // .nav-shell — guard every classList access so the
                    // subpage doesn't throw "Cannot read properties of null".
                    if (!navShell) return;
                    const currentScrollY = window.scrollY;
                    const scrollThreshold = getScrollThreshold();
                    // Clear the head-script's nav-prerender-scrolled flag
                    // once we've taken over. The flag's only job is to
                    // suppress the .nav-shell transition for the very
                    // first paint after a scroll-restored page load —
                    // after that we want the normal transition curve.
                    if (document.documentElement.classList.contains('nav-prerender-scrolled')) {
                        // Defer one frame so the initial paint already
                        // landed under "transition: none". The class
                        // removal then re-enables transitions for
                        // subsequent scroll-driven class toggles.
                        requestAnimationFrame(() => {
                            document.documentElement.classList.remove('nav-prerender-scrolled');
                        });
                    }

                    // The scroll-driven nav morph (html.nav-sda + nav-morph.ts)
                    // owns the nav continuously when active — the pose is
                    // scrubbed natively by the scroll timeline and nav-morph's
                    // hysteresis owns the pole class. This threshold logic is
                    // the fallback for browsers without scroll-driven
                    // animations (and reduced-motion users).
                    if (window.__navScrubActive) {
                        lastNavScrollY = currentScrollY;
                        return;
                    }

                    if (window.innerWidth <= 960) {
                        if (isNavigatingHome) {
                            if (currentScrollY === 0) isNavigatingHome = false;
                            lastNavScrollY = currentScrollY;
                            return;
                        }

                        if (currentScrollY === 0) {
                            // At the very top there is nothing to debounce —
                            // expand immediately. Without this, a single
                            // scroll event that lands AT 0 (iOS status-bar
                            // tap, programmatic scrollTo) never reaches the
                            // two-event count below and the nav stays
                            // compressed forever at the top of the page.
                            navShell.classList.remove('scrolled-mobile');
                            scrollUpAtTopCount = 0;
                        } else if (currentScrollY <= scrollThreshold && currentScrollY < lastNavScrollY) {
                            scrollUpAtTopCount++;
                            if (scrollUpAtTopCount >= 2) {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                navShell.classList.remove('scrolled-mobile');
                                scrollUpAtTopCount = 0;
                            }
                        } else if (currentScrollY > scrollThreshold) {
                            navShell.classList.add('scrolled-mobile');
                            scrollUpAtTopCount = 0;
                        } else {
                            navShell.classList.remove('scrolled-mobile');
                            scrollUpAtTopCount = 0;
                        }
                    } else {
                        navShell.classList.remove('scrolled-mobile');
                        scrollUpAtTopCount = 0;
                    }
                    lastNavScrollY = currentScrollY;
                }

                // ========================================
                // CAROUSEL CONTROLLER
                // ========================================
                function initCarousel(allCards, pastEvents) {
                    if (!carouselTrack || !carouselPrev || !carouselNext || allCards.length === 0) return;

                    let currentIndex = 0;
                    const totalCards = allCards.length;

                    carouselTrack.innerHTML = allCards.join('');

                    const openPastModal = () => {
                        if (!pastEventsModal || !pastEvents || pastEvents.length === 0) return;
                        pastEventsModal.classList.add('active');
                        body.classList.add('modal-open');
                        document.querySelectorAll('.past-event-slide').forEach((s, i) => {
                            s.classList.remove('active', 'prev');
                            if (i === 0) s.classList.add('active');
                        });
                        document.querySelectorAll('.past-events-dot').forEach((d, i) => {
                            d.classList.toggle('active', i === 0);
                        });
                    };
                    const seePastCard = document.getElementById('carousel-see-past');
                    if (seePastCard) seePastCard.addEventListener('click', openPastModal);
                    const seePastBtn = document.getElementById('carousel-see-past-btn');
                    if (seePastBtn) seePastBtn.addEventListener('click', openPastModal);

                    document.querySelectorAll('[data-glow-detect]').forEach(wrapper => {
                        const img = wrapper.querySelector('.flyer-image');
                        if (!img) { wrapper.classList.add('glow-warm'); return; }
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = 16; canvas.height = 16;
                        const detect = () => {
                            try {
                                ctx.drawImage(img, 0, 0, 16, 16);
                                const d = ctx.getImageData(0, 0, 16, 16).data;
                                // Bucket saturated pixels by hue (12 × 30° buckets), weighted by saturation.
                                // This correctly identifies dominant hue even when whites/grays dilute a simple average.
                                const hb = new Float32Array(12);
                                let n = 0;
                                for (let i = 0; i < d.length; i += 4) {
                                    const r = d[i]/255, g = d[i+1]/255, b = d[i+2]/255;
                                    const mx = Math.max(r,g,b), mn = Math.min(r,g,b), delta = mx - mn;
                                    const l = (mx + mn) / 2;
                                    const s = delta === 0 ? 0 : delta / (1 - Math.abs(2*l - 1));
                                    if (s < 0.25 || l < 0.1 || l > 0.9) continue; // skip neutrals
                                    n++;
                                    let h;
                                    if (mx === r) h = ((g - b) / delta % 6) * 60;
                                    else if (mx === g) h = ((b - r) / delta + 2) * 60;
                                    else h = ((r - g) / delta + 4) * 60;
                                    if (h < 0) h += 360;
                                    hb[Math.floor(h / 30)] += s; // weight bucket by saturation
                                }
                                if (n < 8) { wrapper.classList.add('glow-warm'); return; }
                                const best = hb.indexOf(Math.max.apply(null, hb));
                                // Buckets: 0=red,1=orange,2=yellow,3=chartreuse,4=green,5=spring,
                                //          6=cyan,7=azure,8=blue,9=violet,10=magenta,11=rose
                                if (best === 7 || best === 8) wrapper.classList.add('glow-blue');
                                else if (best >= 3 && best <= 5) wrapper.classList.add('glow-green');
                                else if (best === 0 || best === 11) wrapper.classList.add('glow-red');
                                else if (best === 9 || best === 10) wrapper.classList.add('glow-purple');
                                else wrapper.classList.add('glow-warm'); // orange / yellow → warm gold
                            } catch(e) { wrapper.classList.add('glow-warm'); }
                        };
                        if (img.complete && img.naturalWidth > 0) detect();
                        else img.addEventListener('load', detect);
                        img.addEventListener('error', () => wrapper.classList.add('glow-warm'));
                    });

                    function getCardsPerView() {
                        return window.innerWidth >= 961 ? 3 : 1;
                    }
                    function getMaxIndex() {
                        return Math.max(0, totalCards - getCardsPerView());
                    }
                    function updateTrack() {
                        const perView = getCardsPerView();
                        carouselTrack.style.width = (totalCards * 100 / perView) + '%';
                        const cardPct = (100 / totalCards);
                        carouselTrack.querySelectorAll('.carousel-card').forEach(card => {
                            card.style.width = cardPct + '%';
                        });
                        if (totalCards < perView) {
                            // Fewer cards than slots — center the track within the viewport
                            // Shift = half the empty slots as a % of track width
                            const centerPct = (perView - totalCards) / (2 * totalCards) * 100;
                            carouselTrack.style.transform = 'translateX(' + centerPct + '%)';
                        } else {
                            const offset = (currentIndex / totalCards) * 100;
                            carouselTrack.style.transform = 'translateX(-' + offset + '%)';
                        }
                    }
                    function updateArrows() {
                        carouselPrev.classList.toggle('hidden', currentIndex <= 0);
                        carouselNext.classList.toggle('hidden', currentIndex >= getMaxIndex());
                    }
                    function updateDots() {
                        if (!carouselDotsContainer) return;
                        const maxIdx = getMaxIndex();
                        const dotCount = maxIdx + 1;
                        if (dotCount <= 1) {
                            carouselDotsContainer.style.display = 'none';
                            return;
                        }
                        carouselDotsContainer.style.display = 'flex';
                        carouselDotsContainer.innerHTML = Array.from({ length: dotCount }, (_, i) =>
                            '<button class="carousel-dot ' + (i === currentIndex ? 'active' : '') + '" data-index="' + i + '"></button>'
                        ).join('');
                        carouselDotsContainer.querySelectorAll('.carousel-dot').forEach(dot => {
                            dot.addEventListener('click', () => {
                                currentIndex = parseInt(dot.dataset.index);
                                render();
                                pauseAuto();
                                scheduleResume(3000);
                            });
                        });
                    }
                    function render() {
                        updateTrack();
                        updateArrows();
                        updateDots();
                        if (carouselNav && getMaxIndex() === 0) {
                            carouselNav.style.display = 'none';
                            carouselPrev.style.display = 'none';
                            carouselNext.style.display = 'none';
                        } else if (carouselNav) {
                            carouselNav.style.display = 'flex';
                            carouselPrev.style.display = 'flex';
                            carouselNext.style.display = 'flex';
                        }
                    }

                    // ── Auto-scroll helpers ─────────────────────────────────────────
                    // Auto-scroll only when maxIndex >= 2 (2+ upcoming events on mobile).
                    // 1 event + memories = maxIndex 1 → no auto-scroll.
                    // While the user is touching or hovering, the ticker is fully paused.
                    // After any interaction a 3 s (mouse: 1 s) cooldown fires before resume.
                    let autoTimer = null;
                    let autoResumeTimeout = null;
                    let userInteracting = false;

                    function startAutoTick() {
                        if (getMaxIndex() < 2) return null;
                        return setInterval(() => {
                            if (userInteracting) return;
                            currentIndex = currentIndex < getMaxIndex() ? currentIndex + 1 : 0;
                            render();
                        }, 5000);
                    }
                    function pauseAuto() {
                        clearInterval(autoTimer);
                        clearTimeout(autoResumeTimeout);
                        autoTimer = null;
                    }
                    function scheduleResume(delay) {
                        clearTimeout(autoResumeTimeout);
                        autoResumeTimeout = setTimeout(() => {
                            if (!userInteracting && getMaxIndex() >= 2) autoTimer = startAutoTick();
                        }, delay);
                    }

                    // Arrow buttons
                    carouselPrev.addEventListener('click', () => {
                        if (currentIndex > 0) { currentIndex--; render(); }
                        pauseAuto();
                        scheduleResume(3000);
                    });
                    carouselNext.addEventListener('click', () => {
                        if (currentIndex < getMaxIndex()) { currentIndex++; render(); }
                        pauseAuto();
                        scheduleResume(3000);
                    });

                    // Touch — pause while finger is down, 3 s cooldown after lift
                    let touchStartX = 0, touchStartY = 0, isSwiping = false;
                    carouselTrack.addEventListener('touchstart', e => {
                        touchStartX = e.touches[0].clientX;
                        touchStartY = e.touches[0].clientY;
                        isSwiping = false;
                        userInteracting = true;
                        pauseAuto();
                    }, { passive: true });
                    carouselTrack.addEventListener('touchmove', e => {
                        if (!e.touches[0]) return;
                        const dx = Math.abs(e.touches[0].clientX - touchStartX);
                        const dy = Math.abs(e.touches[0].clientY - touchStartY);
                        if (dx > dy && dx > 10) { isSwiping = true; e.preventDefault(); }
                    }, { passive: false });
                    carouselTrack.addEventListener('touchend', e => {
                        userInteracting = false;
                        if (!e.changedTouches[0]) { scheduleResume(3000); return; }
                        const dx = e.changedTouches[0].clientX - touchStartX;
                        const dy = e.changedTouches[0].clientY - touchStartY;
                        if (Math.abs(dx) >= Math.abs(dy) && Math.abs(dx) >= 50) {
                            if (dx < 0 && currentIndex < getMaxIndex()) currentIndex++;
                            else if (dx > 0 && currentIndex > 0) currentIndex--;
                            render();
                        }
                        scheduleResume(3000);
                    }, { passive: true });

                    // Mouse hover — pause immediately, resume 1 s after leave
                    carouselWrapper.addEventListener('mouseenter', () => {
                        userInteracting = true;
                        pauseAuto();
                    });
                    carouselWrapper.addEventListener('mouseleave', () => {
                        userInteracting = false;
                        scheduleResume(1000);
                    });

                    window.addEventListener('resize', () => {
                        if (currentIndex > getMaxIndex()) currentIndex = getMaxIndex();
                        render();
                    });

                    // Start auto only when there are multiple views
                    autoTimer = startAutoTick();
                    render();
                }

                // Update active nav link
                function updateActiveNavLink() {
                    let currentSection = '';
                    sections.forEach(section => {
                        const sectionTop = section.offsetTop;
                        if (window.pageYOffset >= sectionTop - 200) {
                            currentSection = section.getAttribute('id');
                        }
                    });
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + currentSection) link.classList.add('active');
                    });
                    const contactBtn = document.querySelector('.nav-form-btn');
                    if (contactBtn) contactBtn.classList.toggle('active', currentSection === 'contact');
                }

                let ticking = false;
                window.addEventListener('scroll', () => {
                    if (!ticking) {
                        ticking = true;
                        window.requestAnimationFrame(() => {
                            handleMobileNav();
                            updateActiveNavLink();
                            ticking = false;
                        });
                    }
                }, { passive: true });

                handleMobileNav();
                updateActiveNavLink();
                window.addEventListener('resize', () => { handleMobileNav(); });

                // Smooth scrolling for in-page navigation links on /home.
                // Restored to the simple pre-v1.62.50 behavior: a single
                // smooth scrollTo at click time, 30/60 default offset
                // (100/150 for #gift-form), no post-scroll correction.
                //
                // v1.62.50 briefly tried to share getHomeAnchorTargetY +
                // a post-scrollend re-measure so the eyebrow tucked behind
                // the nav-shell as cleanly as the cross-page hashload does.
                // The re-measure fought the in-flight smooth-scroll on
                // every click — the user saw "scroll then jump back and
                // forth." That correction only makes sense in the
                // invisible-then-fade-in hashload path; an in-page click
                // is fully visible, so any snap reads as a glitch.
                // The eyebrow may peek a couple of pixels under the nav
                // on the narrowest mobile widths — that matches the
                // long-standing in-page click behavior and is preferable
                // to the fighting-scroll glitch.
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        const targetId = this.getAttribute('href');

                        if (targetId === '#home' || targetId === '#') {
                            if (window.innerWidth <= 960) {
                                if (navShell) navShell.classList.remove('scrolled-mobile');
                                isNavigatingHome = true;
                            }
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            return;
                        }

                        const target = document.querySelector(targetId);
                        if (target) {
                            let navOffset = window.innerWidth <= 960 ? 20 : 40;

                            if (targetId === '#outreach') {
                                const outreachRect = target.getBoundingClientRect();
                                const outreachAbsoluteTop = outreachRect.top + window.pageYOffset;
                                window.scrollTo({ top: outreachAbsoluteTop - navOffset, behavior: 'smooth' });
                                return;
                            }

                            if (targetId === '#gift-form') {
                                navOffset = window.innerWidth <= 960 ? 100 : 150;
                                const elementRect = target.getBoundingClientRect();
                                const absoluteElementTop = elementRect.top + window.pageYOffset;
                                window.scrollTo({ top: absoluteElementTop - navOffset, behavior: 'smooth' });
                                return;
                            }

                            const elementRect = target.getBoundingClientRect();
                            const absoluteElementTop = elementRect.top + window.pageYOffset;
                            window.scrollTo({ top: absoluteElementTop - navOffset, behavior: 'smooth' });
                        }
                    });
                });

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

                document.querySelectorAll('.flyer-image').forEach(img => {
                    img.addEventListener('click', (e) => {
                        e.stopPropagation();
                        lightboxImage.src = img.src;
                        lightboxImage.alt = img.alt;
                        lightbox.classList.add('active');
                        document.body.style.overflow = 'hidden';
                        isZoomed = false;
                        lightboxImage.classList.remove('zoomed');
                    });
                });

                lightboxImage.addEventListener('click', (e) => {
                    e.stopPropagation();
                    isZoomed = !isZoomed;
                    lightboxImage.classList.toggle('zoomed', isZoomed);
                });

                function closeLightbox() {
                    lightbox.classList.remove('active');
                    document.body.style.overflow = '';
                    isZoomed = false;
                    lightboxImage.classList.remove('zoomed');
                    setTimeout(() => { lightboxImage.src = ''; }, 300);
                }

                lightboxClose.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
                lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
                });

                if ('ontouchstart' in window) {
                    let lastTouchEnd = 0;
                    lightboxImage.addEventListener('touchend', (e) => {
                        const now = Date.now();
                        if (now - lastTouchEnd <= 300) {
                            e.preventDefault();
                            isZoomed = !isZoomed;
                            lightboxImage.classList.toggle('zoomed', isZoomed);
                        }
                        lastTouchEnd = now;
                    }, false);
                }

                // Native two-step contact form → POST /api/contact (server signs + forwards to the church CRM).
                // Step 1 (message + name) leads, then Step 2 (contact + consent). Message-first creates
                // momentum and keeps the legal fine-print out of the way until after the visitor has written.
                {
                    const form = document.getElementById('contact-form-el');
                    if (form) {
                        const submitBtn = document.getElementById('cf-submit');
                        const nextBtn = document.getElementById('cf-next');
                        const backBtn = document.getElementById('cf-back');
                        const errorEl = document.getElementById('cf-error');
                        const errorEl1 = document.getElementById('cf-error-1');
                        const stepNum = document.getElementById('cf-step-num');
                        const stepLabel = document.getElementById('cf-step-label');
                        const steps = Array.from(form.querySelectorAll('.form-step'));
                        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                        const labels = { 1: 'Your note', 2: 'How to reach you' };

                        // Per-CTA topic. When the form is opened with ?topic=<slug>
                        // (a specific CTA like "Join the next cook"), show the
                        // tailored "subject" banner + prompt and carry the slug to
                        // the CRM on submit. Unknown slug → plain contact form.
                        let activeTopicSlug = '';
                        try {
                            const rawSlug = new URLSearchParams(location.search).get('topic');
                            if (rawSlug) {
                                let topics = {};
                                const dataEl = document.getElementById('contact-topics');
                                if (dataEl) { try { topics = JSON.parse(dataEl.textContent || '{}'); } catch (_) {} }
                                const slug = rawSlug.toLowerCase();
                                const t = topics[slug];
                                if (t) {
                                    activeTopicSlug = slug;
                                    const headlineEl = document.getElementById('contact-topic-headline');
                                    const bannerEl = document.getElementById('contact-topic-banner');
                                    const leadEl = document.getElementById('contact-lead');
                                    const msgEl = document.getElementById('cf-message');
                                    if (headlineEl) headlineEl.textContent = t.headline;
                                    if (leadEl && t.blurb) leadEl.textContent = t.blurb;
                                    if (msgEl && t.placeholder) msgEl.setAttribute('placeholder', t.placeholder);
                                    if (bannerEl) {
                                        // Reserve height now (pre-scroll), animate only opacity+transform.
                                        bannerEl.hidden = false;
                                        if (reduceMotion) { bannerEl.classList.add('is-visible'); }
                                        else { requestAnimationFrame(() => requestAnimationFrame(() => bannerEl.classList.add('is-visible'))); }
                                    }
                                }
                            }
                        } catch (_) {}

                        const showError = (el, msg, focusEl) => {
                            if (el) { el.textContent = msg; el.hidden = false; }
                            if (focusEl) focusEl.focus();
                        };
                        const clearError = () => {
                            if (errorEl) errorEl.hidden = true;
                            if (errorEl1) errorEl1.hidden = true;
                        };

                        const showStep = (n) => {
                            steps.forEach((s) => {
                                const active = Number(s.dataset.step) === n;
                                s.hidden = !active;
                                s.classList.remove('form-step--enter');
                            });
                            const target = steps.find((s) => Number(s.dataset.step) === n);
                            if (target && !reduceMotion) { void target.offsetWidth; target.classList.add('form-step--enter'); }
                            if (stepNum) stepNum.textContent = String(n);
                            if (stepLabel) stepLabel.textContent = labels[n] || '';
                            // Move focus to the first field of the new step for keyboard + screen-reader users.
                            const firstField = target && target.querySelector('textarea, input:not([type=checkbox]), input');
                            if (firstField) firstField.focus({ preventScroll: true });
                        };

                        if (nextBtn) nextBtn.addEventListener('click', () => {
                            clearError();
                            if (!form.message.value.trim()) { showError(errorEl1, 'Please share a message before continuing.', form.message); return; }
                            if (!form.firstName.value.trim()) { showError(errorEl1, 'Please enter your first name.', form.firstName); return; }
                            if (!form.lastName.value.trim()) { showError(errorEl1, 'Please enter your last name.', form.lastName); return; }
                            showStep(2);
                        });
                        if (backBtn) backBtn.addEventListener('click', () => { clearError(); showStep(1); });

                        form.addEventListener('submit', async (e) => {
                            e.preventDefault();
                            clearError();

                            const data = {
                                firstName: form.firstName.value,
                                lastName: form.lastName.value,
                                phone: form.phone.value,
                                email: form.email.value,
                                message: form.message.value,
                                updatesOptIn: form.updatesOptIn.checked,
                                termsAccepted: form.termsAccepted.checked,
                                sourcePage: '/#contact',
                                topic: activeTopicSlug || undefined
                            };

                            // Defensive: step 1 gates these, but never submit with them empty.
                            if (!data.message.trim() || !data.firstName.trim() || !data.lastName.trim()) {
                                showStep(1);
                                showError(errorEl1, 'Please complete your message and name.', form.message);
                                return;
                            }
                            if (!data.phone.trim()) {
                                showError(errorEl, 'Please enter your phone number.', form.phone);
                                return;
                            }
                            if (!data.email.trim()) {
                                showError(errorEl, 'Please enter your email address.', form.email);
                                return;
                            }
                            if (!form.email.checkValidity()) {
                                showError(errorEl, 'Please enter a valid email address.', form.email);
                                return;
                            }
                            if (!data.termsAccepted) {
                                showError(errorEl, 'Please agree to the terms & conditions to send your message.', form.termsAccepted);
                                return;
                            }

                            const originalLabel = submitBtn ? submitBtn.textContent : '';
                            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

                            let ok = false;
                            try {
                                const res = await fetch('/api/contact', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(data)
                                });
                                ok = res.ok;
                                if (!ok) {
                                    const payload = await res.json().catch(() => null);
                                    showError((payload && payload.error) || 'Something went wrong. Please try again.');
                                }
                            } catch (_) {
                                showError('Network error. Please try again.');
                            }

                            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
                            if (ok) showSuccessState();
                        });
                    }
                }

                function showSuccessState() {
                    const formCard = document.getElementById('contact-form');
                    const successState = document.getElementById('contact-success');
                    if (formCard && successState) {
                        formCard.style.display = 'none';
                        successState.style.display = 'flex';
                        createConfetti();
                        successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }

                function createConfetti() {
                    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                    // Brand glyphs, not platform emoji: ✦/✧ are text characters
                    // that render in CSS color on every OS — the celebration
                    // falls in the site's own gold ramp (the morning star motif).
                    const confettiGlyphs = ['✦', '✧', '✦', '✧', '·'];
                    const confettiInks = ['var(--gold)', 'var(--gold-dark)', 'var(--gold-deeper)'];
                    for (let i = 0; i < 50; i++) {
                        setTimeout(() => {
                            const confetti = document.createElement('div');
                            confetti.className = 'confetti';
                            confetti.textContent = confettiGlyphs[Math.floor(Math.random() * confettiGlyphs.length)];
                            confetti.style.color = confettiInks[Math.floor(Math.random() * confettiInks.length)];
                            confetti.style.fontSize = (22 + Math.random() * 18) + 'px';
                            confetti.style.left = Math.random() * 100 + '%';
                            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
                            confetti.style.animationDelay = Math.random() * 0.5 + 's';
                            document.body.appendChild(confetti);
                            setTimeout(() => confetti.remove(), 4000);
                        }, i * 50);
                    }
                }

                // Address Dropdown Functionality
                const addressTriggers = document.querySelectorAll('.address-trigger');
                const addressDropdowns = document.querySelectorAll('.address-dropdown');

                addressTriggers.forEach((trigger, index) => {
                    trigger.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const dropdown = addressDropdowns[index];
                        const isActive = dropdown.classList.contains('active');
                        addressDropdowns.forEach(d => d.classList.remove('active'));
                        if (!isActive) dropdown.classList.add('active');
                    });
                });

                const copyButtons = document.querySelectorAll('.copy-address');
                copyButtons.forEach(button => {
                    button.addEventListener('click', async function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const address = this.getAttribute('data-address');
                        try {
                            await navigator.clipboard.writeText(address);
                            const spanEl = this.querySelector('span:last-child');
                            const originalText = spanEl.textContent;
                            spanEl.textContent = 'Copied!';
                            setTimeout(() => {
                                spanEl.textContent = originalText;
                                this.closest('.address-dropdown').classList.remove('active');
                            }, 1500);
                        } catch (err) {
                            console.error('Failed to copy address:', err);
                        }
                    });
                });

                document.addEventListener('click', function(e) {
                    if (!e.target.closest('.address-dropdown-wrapper')) {
                        addressDropdowns.forEach(d => d.classList.remove('active'));
                    }
                });

                document.querySelectorAll('.address-dropdown-item[href]').forEach(link => {
                    link.addEventListener('click', function() {
                        setTimeout(() => {
                            addressDropdowns.forEach(d => d.classList.remove('active'));
                        }, 300);
                    });
                });

                // Countdown Timer to Next Sunday 9:00 AM Mountain Time
                function updateCountdown() {
                    const now = new Date();
                    const mtNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Denver' }));

                    let nextSunday = new Date(mtNow);
                    nextSunday.setHours(9, 0, 0, 0);

                    const currentDay = mtNow.getDay();
                    if (currentDay === 0) {
                        if (mtNow.getHours() >= 9) nextSunday.setDate(nextSunday.getDate() + 7);
                    } else {
                        nextSunday.setDate(nextSunday.getDate() + (7 - currentDay));
                    }

                    const diff = nextSunday - mtNow;
                    const liveStatus = document.querySelector('.live-status');
                    const liveStatusText = document.querySelector('.live-status-text');
                    const countdownContainer = document.querySelector('.countdown-container');
                    const oneHour = 3600000;
                    const isLiveNow = currentDay === 0 && mtNow.getHours() === 9;

                    // While live, the watch section drops last week's segmented
                    // caption/chapters for the generic fallback variants (today's
                    // service isn't chaptered yet). Toggled here so it tracks the
                    // same clock as the live pill.
                    const watchSection = document.getElementById('watch');
                    if (watchSection) watchSection.classList.toggle('is-live', isLiveNow);

                    if (isLiveNow) {
                        if (liveStatus) {
                            liveStatus.style.display = 'inline-flex';
                            if (liveStatusText) liveStatusText.textContent = 'Live Now';
                        }
                        if (countdownContainer) countdownContainer.style.display = 'none';
                        return;
                    } else if (diff <= 0) {
                        if (liveStatus) liveStatus.style.display = 'none';
                        if (countdownContainer) countdownContainer.style.display = 'none';
                        return;
                    } else if (diff <= oneHour && currentDay === 0) {
                        if (liveStatus) {
                            liveStatus.style.display = 'inline-flex';
                            if (liveStatusText) liveStatusText.textContent = 'Live Soon';
                        }
                        if (countdownContainer) countdownContainer.style.display = 'flex';
                    } else {
                        if (liveStatus) liveStatus.style.display = 'none';
                        if (countdownContainer) countdownContainer.style.display = 'flex';
                    }

                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                    // Guard each lookup — these elements only exist on the
                    // home page (watch section countdown). On /outreach this
                    // same script runs but the IDs don't exist.
                    const daysEl = document.getElementById('days');
                    const hoursEl = document.getElementById('hours');
                    const minutesEl = document.getElementById('minutes');
                    const secondsEl = document.getElementById('seconds');
                    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;
                    daysEl.textContent = days;
                    hoursEl.textContent = hours;
                    minutesEl.textContent = minutes;
                    secondsEl.textContent = seconds;
                }

                updateCountdown();
                setInterval(updateCountdown, 1000);

                // YouTube thumbnail-to-playback with morph-to-spinner animation
                var videoWrapper = document.getElementById('video-embed-wrapper');
                var videoThumbnail = document.getElementById('video-thumbnail');
                var videoThumbnailImg = document.getElementById('video-thumbnail-img');
                var videoPlayBtn = document.getElementById('video-play-btn');
                var videoUnmuteBtn = document.getElementById('video-unmute-btn');
                var _ytVideoId = null;
                var _videoActivated = false;
                var _launching = false;
                var _shouldAutoPlay = false;
                var _isMutedAutoPlay = false;
                var _preloadedIframe = null;
                var _playbackConfirmed = false;
                var _revealTimeout = null;
                var _latestThumbnailUrl = null;
                var _playerOverlay = document.getElementById('video-player-overlay');
                var _playerBackdrop = document.getElementById('video-player-backdrop');
                var _playerFrame = document.getElementById('video-player-frame');
                var _playerSlot = document.getElementById('video-player-slot');
                var _playerClose = document.getElementById('video-player-close');
                var _activeSourceCard = null;
                var _playerEscListener = null;
                var _playerCloseFallback = null;

                // Pre-embed iframe hidden behind thumbnail so it's fully loaded on tap.
                // When muted=true, adds autoplay=1&mute=1 so browsers allow auto-start.
                function preloadIframe(videoId, muted) {
                    if (_preloadedIframe || !videoWrapper) return;
                    var iframe = document.createElement('iframe');
                    iframe.className = 'youtube-embed';
                    iframe.setAttribute('allowfullscreen', '');
                    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                    var params = 'enablejsapi=1&rel=0&modestbranding=1&playsinline=1';
                    if (muted) params += '&autoplay=1&mute=1';
                    iframe.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?' + params;
                    videoWrapper.insertBefore(iframe, videoWrapper.firstChild);
                    _preloadedIframe = iframe;
                    iframe.addEventListener('load', function() {
                        setTimeout(subscribeToYTEvents, 500);
                    });
                }

                // Subscribe to YouTube iframe state change events via postMessage
                function subscribeToYTEvents() {
                    if (!_preloadedIframe || !_preloadedIframe.contentWindow) return;
                    _preloadedIframe.contentWindow.postMessage(JSON.stringify({
                        event: 'listening', id: 1
                    }), '*');
                    _preloadedIframe.contentWindow.postMessage(JSON.stringify({
                        event: 'command', func: 'addEventListener', args: ['onStateChange']
                    }), '*');
                }

                // Listen for YouTube state change — info=1 means PLAYING
                window.addEventListener('message', function(event) {
                    if (_playbackConfirmed || !event.data || typeof event.data !== 'string') return;
                    try {
                        var msg = JSON.parse(event.data);
                        if (msg.event === 'onStateChange' && msg.info === 1) {
                            _playbackConfirmed = true;
                            // Wait 1s after playback starts so video settles before fading overlay
                            setTimeout(function() { revealVideo(); }, 1000);
                        }
                    } catch (e) {}
                });

                function activateVideo() {
                    if (!_ytVideoId || !videoWrapper || !videoThumbnail || _videoActivated) return;
                    _videoActivated = true;

                    // Phase 1: Morph play button into spinner
                    if (videoPlayBtn) {
                        videoPlayBtn.classList.add('is-loading');
                        videoPlayBtn.style.pointerEvents = 'none';
                    }

                    // Send play command
                    if (_preloadedIframe) {
                        _preloadedIframe.contentWindow.postMessage(
                            '{"event":"command","func":"playVideo","args":""}', '*'
                        );
                        subscribeToYTEvents();
                    } else {
                        // Fallback: iframe not ready yet, create one with autoplay
                        // If auto-playing (no user gesture), must include mute=1 for browser policy
                        var iframe = document.createElement('iframe');
                        iframe.className = 'youtube-embed';
                        iframe.setAttribute('allowfullscreen', '');
                        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                        var fallbackParams = 'autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1';
                        if (_shouldAutoPlay) fallbackParams += '&mute=1';
                        iframe.src = 'https://www.youtube-nocookie.com/embed/' + _ytVideoId
                            + '?' + fallbackParams;
                        videoWrapper.appendChild(iframe);
                        _preloadedIframe = iframe;
                        iframe.addEventListener('load', function() {
                            setTimeout(subscribeToYTEvents, 500);
                        });
                    }

                    // Fallback: reveal after 3.5s if postMessage detection fails
                    _revealTimeout = setTimeout(function() {
                        if (!_playbackConfirmed) revealVideo();
                    }, 3500);
                }

                function revealVideo() {
                    if (!videoThumbnail || videoThumbnail.classList.contains('is-revealing')) return;
                    if (_revealTimeout) { clearTimeout(_revealTimeout); _revealTimeout = null; }

                    // Spinner and thumbnail fade out together — keep is-loading so play btn never flashes back
                    if (videoPlayBtn) {
                        videoPlayBtn.classList.add('is-revealing');
                    }
                    videoThumbnail.classList.add('is-revealing');

                    // Clean up DOM after the 600ms fade completes
                    setTimeout(function() {
                        if (videoThumbnail.parentNode) {
                            videoThumbnail.parentNode.removeChild(videoThumbnail);
                        }
                        // Show unmute button after thumbnail is gone (muted auto-play only)
                        if (_isMutedAutoPlay && videoUnmuteBtn) {
                            videoUnmuteBtn.classList.add('visible');
                        }
                    }, 650);
                }

                // ===== Seamless "play here -> watch over there" hand-off =====
                // Tapping the latest video doesn't open a local overlay; it carries you to
                // /watch where the same service is the feature player. PREFERRED PATH: the
                // same-page morph controller (watch-handoff.ts) starts the video WITH SOUND
                // inside this tap and swaps /watch in around the still-playing video, no
                // navigation (so audio survives on every browser). If that controller is
                // absent or declines (unsupported browser), fall back to the hard
                // navigation: a cross-document view-transition morph that arrives muted
                // with a one-tap "sound" pill.
                function launchWatchTransition() {
                    if (_launching) return;
                    _launching = true;
                    // Instant feedback: the play glyph becomes the loading spinner.
                    if (videoPlayBtn) {
                        videoPlayBtn.classList.add('is-loading');
                        videoPlayBtn.style.pointerEvents = 'none';
                    }
                    // Same-page morph (keeps audio). Must run synchronously in this gesture.
                    try {
                        if (window.__mscbWatchMorph && _ytVideoId &&
                            window.__mscbWatchMorph({ wrapper: videoWrapper, videoId: _ytVideoId, thumb: _latestThumbnailUrl })) {
                            return;
                        }
                    } catch (e) {}
                    hardNavToWatch();
                }
                // Fallback: the original cross-document hand-off (arrives muted + sound pill).
                function hardNavToWatch() {
                    // Record where the thumbnail sits on screen RIGHT NOW so /watch can
                    // anchor its feature player to the exact same spot: the video then
                    // stays put (its center doesn't move) and only SCALES up to the
                    // feature size as the rest of the page crossfades in around it.
                    if (videoWrapper) {
                        try {
                            var vr = videoWrapper.getBoundingClientRect();
                            sessionStorage.setItem('mscb:vhero', JSON.stringify({
                                cy: Math.round(vr.top + vr.height / 2),
                                top: Math.round(vr.top),
                                h: Math.round(vr.height),
                                w: Math.round(vr.width),
                                ts: Date.now()
                            }));
                        } catch (e) {}
                    }
                    // Tag the morph anchor. Matches .vplayer--feature .vplayer-stage
                    // / .watch-feature-thumb on /watch (view-transition-name: watch-hero).
                    if (videoWrapper) {
                        try { videoWrapper.style.viewTransitionName = 'watch-hero'; } catch (e) {}
                    }
                    var go = function () { window.location.href = '/watch?play=1'; };
                    // Let the spinner paint into the outgoing snapshot, then navigate.
                    // The @view-transition rule turns the navigation into the morph.
                    if (typeof requestAnimationFrame === 'function') {
                        requestAnimationFrame(function () { requestAnimationFrame(go); });
                    } else {
                        go();
                    }
                }

                // Returning here (back button / bfcache) must clear the launch state
                // so the play button isn't frozen mid-spinner and the morph tag isn't
                // left on the card (which would wrongly morph a later normal nav).
                function resetLaunchState() {
                    _launching = false;
                    if (videoWrapper) { try { videoWrapper.style.viewTransitionName = ''; } catch (e) {} }
                    if (videoPlayBtn) {
                        videoPlayBtn.classList.remove('is-loading');
                        videoPlayBtn.style.pointerEvents = '';
                    }
                }
                window.addEventListener('pageshow', resetLaunchState);
                // The same-page morph restores home on Back without a reload (no pageshow), so
                // clear the launch state here too — otherwise the play button stays a frozen
                // spinner and a second play is blocked by the _launching guard.
                window.addEventListener('popstate', resetLaunchState);

                // Unmute handler — uses YouTube iframe API postMessage for all platforms including Safari
                if (videoUnmuteBtn) {
                    videoUnmuteBtn.addEventListener('click', function() {
                        if (_preloadedIframe && _preloadedIframe.contentWindow) {
                            // YouTube iframe API: unMute command
                            _preloadedIframe.contentWindow.postMessage(
                                '{"event":"command","func":"unMute","args":""}', '*'
                            );
                            // Also set volume to ensure audible on all platforms
                            _preloadedIframe.contentWindow.postMessage(
                                '{"event":"command","func":"setVolume","args":[100]}', '*'
                            );
                        }
                        _isMutedAutoPlay = false;
                        videoUnmuteBtn.classList.add('hiding');
                        videoUnmuteBtn.classList.remove('visible');
                        setTimeout(function() {
                            if (videoUnmuteBtn.parentNode) {
                                videoUnmuteBtn.parentNode.removeChild(videoUnmuteBtn);
                            }
                        }, 350);
                    });
                }

                // "In this service" chapters: a tap plays the service FROM that chapter's
                // timestamp WITH SOUND through the same hand-off morph the poster uses, then
                // lands on /watch. The chaptered service's id rides on the list (data-video);
                // chapters only render when it's the current latest, so it matches the poster
                // and the /watch feature. Falls back to the chapter's permalink ?t= deep-link
                // (its href) when the morph is unavailable, declines, or the poster is hidden.
                var chapterList = document.querySelector('.watch-chapters');
                if (chapterList) {
                    var chapterVideoId = chapterList.getAttribute('data-video') || '';
                    var warmChapters = function () {
                        try {
                            var vid = chapterVideoId || _ytVideoId;
                            if (window.__mscbWatchPreload && vid) window.__mscbWatchPreload(vid);
                            else if (window.__mscbWatchPrefetch) window.__mscbWatchPrefetch();
                        } catch (e) {}
                    };
                    chapterList.addEventListener('pointerenter', warmChapters);
                    chapterList.addEventListener('pointerdown', warmChapters);
                    chapterList.addEventListener('focusin', warmChapters);
                    chapterList.addEventListener('click', function (e) {
                        var a = e.target.closest('.watch-chapter');
                        if (!a || !chapterList.contains(a)) return;
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; // let new-tab / modified clicks be
                        var vid = chapterVideoId || _ytVideoId;
                        var start = parseInt(a.getAttribute('data-start'), 10) || 0;
                        if (!vid || !videoWrapper || _launching) return; // fall through to the href
                        try {
                            if (window.__mscbWatchMorph &&
                                window.__mscbWatchMorph({ wrapper: videoWrapper, videoId: vid, thumb: _latestThumbnailUrl, start: start })) {
                                e.preventDefault();
                                _launching = true;
                                return;
                            }
                        } catch (err) {}
                        // else: the anchor's href (permalink at ?t=) handles it as a hard nav.
                    });
                }

                // Hardcoded fallback video ID — updated periodically, used when API is unreachable
                var FALLBACK_VIDEO_ID = '8EP7I-lXdFI';

                // The latest published SERVICE the server already knows (newest in the CRM
                // sermon feed), stamped on the wrapper. The YouTube playlist feed is NOT
                // reliably newest-first (playlist order, a non-service upload, a stale/failed
                // feed), so the poster could play "some other one." Only let the feed's first
                // item drive the poster when it is genuinely newer than this known service;
                // otherwise play the known service (mirrors how /watch picks its hero).
                var SRV_VIDEO_ID = (videoWrapper && videoWrapper.getAttribute('data-latest-video')) || '';
                var SRV_VIDEO_PUB = (videoWrapper && videoWrapper.getAttribute('data-latest-pub')) || '';
                function preferredPosterVideo(feedVid, feedPub) {
                    if (!SRV_VIDEO_ID) return feedVid || '';          // no known service -> trust the feed
                    if (!feedVid) return SRV_VIDEO_ID;                // no feed item -> the known service
                    if (feedVid === SRV_VIDEO_ID) return feedVid;     // same -> the feed item (carries thumb/meta)
                    if (feedPub && SRV_VIDEO_PUB && Date.parse(feedPub) > Date.parse(SRV_VIDEO_PUB)) return feedVid; // genuinely newer
                    return SRV_VIDEO_ID;                              // older/other -> the known latest service
                }

                function setupVideo(videoId, thumbnailUrl) {
                    _ytVideoId = videoId;
                    _latestThumbnailUrl = thumbnailUrl || ('https://img.youtube.com/vi/' + videoId + '/maxresdefault.jpg');
                    if (videoThumbnailImg) {
                        videoThumbnailImg.src = _latestThumbnailUrl;
                        videoThumbnailImg.onerror = function() {
                            this.onerror = null;
                            this.src = 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg';
                            _latestThumbnailUrl = this.src;
                        };
                    }

                    // Service-time auto-play (rare): preserves the existing
                    // in-place iframe behavior so the live stream just appears
                    // in the latest card during the 9am Sunday window.
                    if (_shouldAutoPlay) {
                        preloadIframe(videoId, true);
                        _isMutedAutoPlay = true;
                        activateVideo();
                        return;
                    }

                    // Typical visit: tapping the latest service hands off to /watch
                    // with a seamless video morph (see launchWatchTransition). The
                    // older recent cards (2-3) still open the in-place desktop overlay.
                    // Warm the same-page morph ahead of the tap: prefetch /watch AND preload the
                    // paused YouTube player, so the tap can play it WITH SOUND (a user-initiated
                    // playVideo on a ready player). Fire on first intent...
                    var warm = function () {
                        try {
                            if (window.__mscbWatchPreload && _ytVideoId) window.__mscbWatchPreload(_ytVideoId);
                            else if (window.__mscbWatchPrefetch) window.__mscbWatchPrefetch();
                        } catch (e) {}
                    };
                    if (videoWrapper) {
                        videoWrapper.addEventListener('pointerenter', warm);
                        videoWrapper.addEventListener('pointerdown', warm);
                        videoWrapper.addEventListener('focusin', warm);
                        // ...and, crucially for mobile (no hover), as the video nears the viewport,
                        // so the player is already loaded-and-ready by the time it is tapped.
                        if (window.IntersectionObserver && window.__mscbWatchPreload) {
                            var preIO = new IntersectionObserver(function (ents, o) {
                                ents.forEach(function (en) { if (en.isIntersecting) { try { window.__mscbWatchPreload(_ytVideoId); } catch (e) {} o.disconnect(); } });
                            }, { rootMargin: '300px 0px 300px 0px' });
                            preIO.observe(videoWrapper);
                        }
                    }
                    if (videoPlayBtn) {
                        videoPlayBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            launchWatchTransition();
                        });
                    }
                    if (videoThumbnail) {
                        videoThumbnail.addEventListener('click', function(e) {
                            if (e.target.closest('.video-play-btn, .video-unmute-btn')) return;
                            launchWatchTransition();
                        });
                    }
                }

                function formatVideoDate(iso) {
                    if (!iso) return '';
                    var d = new Date(iso);
                    if (isNaN(d.getTime())) return '';
                    // Services air Sunday morning in Boise; upload timestamp can
                    // land late-Sunday-evening UTC = Monday UTC. Render in the
                    // church's timezone so the chip reads "Sun, May 17", not Mon.
                    var tz = 'America/Boise';
                    var weekday = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: tz });
                    var monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: tz });
                    var year = parseInt(d.toLocaleDateString('en-US', { year: 'numeric', timeZone: tz }), 10);
                    var thisYear = new Date().getFullYear();
                    return year === thisYear
                        ? weekday + ', ' + monthDay
                        : weekday + ', ' + monthDay + ', ' + year;
                }

                // The raw feed title ("LIVE - Sunday Morning 9:00am | 6/07/2026
                // | Morning Star Church of Boise") is upload metadata, not copy —
                // in the Playfair card heading it truncated mid-word and read as
                // a data dump. Editorially every entry IS the Sunday service;
                // what distinguishes them is the date, so the designed dateline
                // becomes the title ("Sunday, June 7") and the small chip
                // carries the role label instead.
                function formatVideoTitle(iso) {
                    if (!iso) return '';
                    var d = new Date(iso);
                    if (isNaN(d.getTime())) return '';
                    var tz = 'America/Boise';
                    var weekday = d.toLocaleDateString('en-US', { weekday: 'long', timeZone: tz });
                    var monthDay = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: tz });
                    var year = parseInt(d.toLocaleDateString('en-US', { year: 'numeric', timeZone: tz }), 10);
                    var thisYear = new Date().getFullYear();
                    return year === thisYear
                        ? weekday + ', ' + monthDay
                        : weekday + ', ' + monthDay + ', ' + year;
                }

                function populateRecentCard(index, video) {
                    var card = document.getElementById('video-card-' + index);
                    var img = document.getElementById('video-card-' + index + '-img');
                    var dateEl = document.getElementById('video-card-' + index + '-date');
                    var titleEl = document.getElementById('video-card-' + index + '-title');
                    if (!card || !video) return;
                    var thumbUrl = video.thumbnailUrl || ('https://img.youtube.com/vi/' + video.videoId + '/maxresdefault.jpg');
                    if (img) {
                        img.src = thumbUrl;
                        // Descriptive, brand + location alt for image search — the
                        // raw feed title ("LIVE - Sunday Morning 9:00am | 6/07/2026
                        // | Morning Star Church of Boise") is upload metadata, not
                        // good alt text. Anchor it on the real service date.
                        var _altDate = formatVideoTitle(video.publishedAt);
                        img.alt = 'Morning Star Christian Church Sunday worship service in Boise, Idaho'
                            + (_altDate ? ' on ' + _altDate : '');
                        img.onerror = function() {
                            this.onerror = null;
                            this.src = 'https://img.youtube.com/vi/' + video.videoId + '/hqdefault.jpg';
                        };
                    }
                    if (dateEl) dateEl.textContent = 'Sunday service';
                    if (titleEl) titleEl.textContent = formatVideoTitle(video.publishedAt) || 'Sunday service';
                    if (card.tagName === 'A') {
                        card.href = 'https://www.youtube.com/watch?v=' + video.videoId;
                    }
                    card.addEventListener('click', function(e) {
                        // Desktop: open centered video player. Mobile (≤960px)
                        // cards 2-3 are display:none so this never fires there,
                        // but the link still works for right-click / new-tab.
                        if (window.innerWidth > 960) {
                            e.preventDefault();
                            expandCardPlayer(card, video.videoId, thumbUrl);
                        }
                    });
                }

                // ===== Centered video player overlay (desktop click-to-expand) =====

                function pauseSourceIframe(card) {
                    var iframe = card && card.querySelector('iframe.youtube-embed');
                    if (iframe && iframe.contentWindow) {
                        try {
                            iframe.contentWindow.postMessage(
                                '{"event":"command","func":"pauseVideo","args":""}', '*'
                            );
                        } catch (e) {}
                    }
                }

                function getCardThumbRect(card) {
                    var thumb = card.querySelector('.video-embed-wrapper, .video-card-thumb');
                    return thumb ? thumb.getBoundingClientRect() : null;
                }

                function expandCardPlayer(card, videoId, thumbnailUrl) {
                    if (!_playerOverlay || !_playerFrame || !_playerSlot || !card || !videoId) return;
                    if (_activeSourceCard) return;
                    if (window.innerWidth <= 960) {
                        // Defensive fallback: shouldn't happen because mobile
                        // cards 2-3 are display:none and card 1 falls through
                        // to the inline auto-play path.
                        window.open('https://www.youtube.com/watch?v=' + videoId, '_blank', 'noopener');
                        return;
                    }

                    pauseSourceIframe(card);

                    // Make overlay measurable
                    _playerOverlay.classList.add('is-mounted');

                    // Reset frame to natural position so we can measure it
                    _playerFrame.style.transition = 'none';
                    _playerFrame.style.transform = '';
                    _playerFrame.style.backgroundImage = '';
                    // Force reflow to apply the reset
                    void _playerFrame.offsetWidth;

                    var sourceRect = getCardThumbRect(card);
                    var targetRect = _playerFrame.getBoundingClientRect();
                    if (!sourceRect || !targetRect || !targetRect.width) {
                        // Fallback: just open YouTube
                        _playerOverlay.classList.remove('is-mounted');
                        window.open('https://www.youtube.com/watch?v=' + videoId, '_blank', 'noopener');
                        return;
                    }

                    var sourceCx = sourceRect.left + sourceRect.width / 2;
                    var sourceCy = sourceRect.top + sourceRect.height / 2;
                    var targetCx = targetRect.left + targetRect.width / 2;
                    var targetCy = targetRect.top + targetRect.height / 2;
                    var dx = sourceCx - targetCx;
                    var dy = sourceCy - targetCy;
                    var scale = sourceRect.width / targetRect.width;

                    // Position frame at the source card (with its thumbnail as bg)
                    _playerFrame.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(' + scale + ')';
                    _playerFrame.style.backgroundImage = 'url(' + (thumbnailUrl || ('https://img.youtube.com/vi/' + videoId + '/maxresdefault.jpg')) + ')';

                    // Fade out the source card so it doesn't double under the moving frame
                    card.classList.add('is-source', 'is-source-hidden');

                    // Lock scroll while overlay is open
                    document.documentElement.style.overflow = 'hidden';
                    document.body.style.overflow = 'hidden';

                    // Force reflow before activating to ensure the start transform sticks
                    void _playerFrame.offsetWidth;

                    // Animate frame to natural (centered) position + fade in backdrop
                    _playerOverlay.classList.add('is-active');
                    _playerOverlay.setAttribute('aria-hidden', 'false');
                    _playerFrame.style.transition = '';
                    _playerFrame.style.transform = '';

                    _activeSourceCard = card;

                    // Inject iframe after the morph is mostly settled (350ms of the 600ms transition).
                    // Gives the user a moment to register the move, then the video appears.
                    _playerCloseFallback = setTimeout(function() {
                        if (_activeSourceCard !== card) return;
                        var iframe = document.createElement('iframe');
                        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                        iframe.setAttribute('allowfullscreen', '');
                        iframe.src = 'https://www.youtube-nocookie.com/embed/' + videoId
                            + '?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1';
                        _playerSlot.innerHTML = '';
                        _playerSlot.appendChild(iframe);
                        _playerCloseFallback = null;
                    }, 350);

                    // Keyboard close (Escape)
                    _playerEscListener = function(e) {
                        if (e.key === 'Escape' || e.keyCode === 27) {
                            closeExpandedCard();
                        }
                    };
                    document.addEventListener('keydown', _playerEscListener);
                }

                function closeExpandedCard() {
                    if (!_activeSourceCard) return;
                    var card = _activeSourceCard;

                    if (_playerCloseFallback) {
                        clearTimeout(_playerCloseFallback);
                        _playerCloseFallback = null;
                    }
                    if (_playerEscListener) {
                        document.removeEventListener('keydown', _playerEscListener);
                        _playerEscListener = null;
                    }

                    // Stop video audio immediately
                    if (_playerSlot) _playerSlot.innerHTML = '';

                    // Restore scroll
                    document.documentElement.style.overflow = '';
                    document.body.style.overflow = '';

                    // Compute reverse transform from current (centered) to source rect
                    var sourceRect = getCardThumbRect(card);
                    var targetRect = _playerFrame ? _playerFrame.getBoundingClientRect() : null;
                    if (sourceRect && targetRect && targetRect.width) {
                        var dx = (sourceRect.left + sourceRect.width / 2) - (targetRect.left + targetRect.width / 2);
                        var dy = (sourceRect.top + sourceRect.height / 2) - (targetRect.top + targetRect.height / 2);
                        var scale = sourceRect.width / targetRect.width;
                        _playerFrame.style.transition = '';
                        _playerFrame.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(' + scale + ')';
                    }

                    // Fade out backdrop and restore source card
                    _playerOverlay.classList.remove('is-active');
                    card.classList.remove('is-source-hidden');

                    var cleanup = function() {
                        if (_playerOverlay) {
                            _playerOverlay.classList.remove('is-mounted');
                            _playerOverlay.setAttribute('aria-hidden', 'true');
                        }
                        if (_playerFrame) {
                            _playerFrame.style.transition = 'none';
                            _playerFrame.style.transform = '';
                            _playerFrame.style.backgroundImage = '';
                        }
                        card.classList.remove('is-source');
                        _activeSourceCard = null;
                    };

                    // Wait for transform transition to finish, then cleanup
                    var onEnd = function(e) {
                        if (e && e.target !== _playerFrame) return;
                        if (e && e.propertyName && e.propertyName !== 'transform') return;
                        if (_playerFrame) _playerFrame.removeEventListener('transitionend', onEnd);
                        cleanup();
                    };
                    if (_playerFrame) {
                        _playerFrame.addEventListener('transitionend', onEnd);
                        // Safety: fire cleanup even if transitionend doesn't (e.g. transition was 'none')
                        setTimeout(function() {
                            if (_activeSourceCard === card) {
                                if (_playerFrame) _playerFrame.removeEventListener('transitionend', onEnd);
                                cleanup();
                            }
                        }, 750);
                    } else {
                        cleanup();
                    }
                }

                if (_playerBackdrop) _playerBackdrop.addEventListener('click', closeExpandedCard);
                if (_playerClose) _playerClose.addEventListener('click', closeExpandedCard);

                function populateLatestMeta(video) {
                    var dateEl = document.getElementById('video-card-1-date');
                    var titleEl = document.getElementById('video-card-1-title');
                    if (dateEl) dateEl.textContent = 'Streamed live \u00b7 9:00 AM';
                    if (titleEl) titleEl.textContent = formatVideoTitle(video.publishedAt) || 'Sunday service';
                }

                // Emit a real VideoObject for the latest Sunday service, built
                // from the live YouTube feed data this page already fetched (no
                // invented metadata). Google renders this JS and reads the
                // injected JSON-LD; it makes the archived service eligible for
                // video rich results and gives AI engines a clean, current
                // entity. Only injected when we have a real uploadDate so the
                // VideoObject is complete (name + description + thumbnailUrl +
                // uploadDate); otherwise skipped rather than shipped incomplete.
                function injectLatestVideoSchema(video) {
                    if (!video || !video.videoId || !video.publishedAt) return;
                    if (document.getElementById('latest-video-jsonld')) return;
                    var dateLabel = formatVideoTitle(video.publishedAt);
                    var schema = {
                        '@context': 'https://schema.org',
                        '@type': 'VideoObject',
                        name: 'Sunday Worship at Morning Star Christian Church, Boise'
                            + (dateLabel ? ' (' + dateLabel + ')' : ''),
                        description: 'Sunday worship service from Morning Star Christian Church in Boise, Idaho. Live-streamed and archived on our YouTube channel.',
                        thumbnailUrl: [video.thumbnailUrl || ('https://img.youtube.com/vi/' + video.videoId + '/maxresdefault.jpg')],
                        uploadDate: video.publishedAt,
                        contentUrl: 'https://www.youtube.com/watch?v=' + video.videoId,
                        embedUrl: 'https://www.youtube-nocookie.com/embed/' + video.videoId,
                        publisher: {
                            '@type': 'Organization',
                            name: 'Morning Star Christian Church',
                            logo: {
                                '@type': 'ImageObject',
                                url: 'https://ms.church/static/church-building.jpg'
                            }
                        }
                    };
                    var s = document.createElement('script');
                    s.type = 'application/ld+json';
                    s.id = 'latest-video-jsonld';
                    s.textContent = JSON.stringify(schema);
                    document.head.appendChild(s);
                }

                fetch('/api/youtube/latest-video')
                    .then(function(r) { return r.json(); })
                    .then(function(data) {
                        var videos = (data && data.videos) || [];
                        var v = videos[0];
                        var pick = preferredPosterVideo(v && v.videoId, v && v.publishedAt);
                        if (v && pick === v.videoId) {
                            // The feed's latest IS the service to show (newest, or matches).
                            setupVideo(v.videoId, v.thumbnailUrl);
                            populateLatestMeta(v);
                            injectLatestVideoSchema(v);
                        } else if (pick) {
                            // The feed's first item is older/other than our known latest
                            // service (or the feed was empty) -> play the real latest service.
                            // Its caption is already server-rendered in library mode.
                            setupVideo(pick, null);
                        } else {
                            setupVideo(FALLBACK_VIDEO_ID, null);
                        }
                        if (videos[1]) populateRecentCard(2, videos[1]);
                        if (videos[2]) populateRecentCard(3, videos[2]);
                    })
                    .catch(function() {
                        // Network error — play the known latest service if we have one.
                        setupVideo(SRV_VIDEO_ID || FALLBACK_VIDEO_ID, null);
                    });

                // Auto-play video during Sunday service (9:00am - 9:45am MT)
                function checkAutoPlay() {
                    var mtNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Denver' }));
                    var isSundayServiceTime = mtNow.getDay() === 0 &&
                                                mtNow.getHours() === 9 &&
                                                mtNow.getMinutes() < 45;
                    if (isSundayServiceTime) {
                        _shouldAutoPlay = true;
                        _isMutedAutoPlay = true;
                        if (_ytVideoId) {
                            // Video already loaded — rebuild iframe with autoplay+mute
                            // so the browser allows programmatic playback
                            if (_preloadedIframe && _preloadedIframe.parentNode) {
                                _preloadedIframe.parentNode.removeChild(_preloadedIframe);
                                _preloadedIframe = null;
                            }
                            preloadIframe(_ytVideoId, true);
                            activateVideo();
                        }
                        // else: _shouldAutoPlay flag will be picked up by setupVideo()
                    }
                }

                // Disconnect observer after first trigger to prevent memory leak
                var watchSection = document.querySelector('#watch');
                if (watchSection) {
                    var observer = new IntersectionObserver(function(entries, obs) {
                        entries.forEach(function(entry) {
                            if (entry.isIntersecting) {
                                checkAutoPlay();
                                obs.disconnect();
                            }
                        });
                    }, { threshold: 0.3 });
                    observer.observe(watchSection);
                }
            });
        </script>
    </body>
    </html>`
