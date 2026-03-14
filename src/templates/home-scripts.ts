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
                // Switches html+body from olive (hero) to white (schedule+)
                // so Safari's status bar tint matches the current section.
                // ========================================
                if (window.innerWidth <= 899) {
                    const heroEl = document.querySelector('.hero');
                    if (heroEl) {
                        const htmlEl = document.documentElement;
                        const statusBarObserver = new IntersectionObserver((entries) => {
                            if (entries[0].isIntersecting) {
                                htmlEl.classList.remove('scrolled-past-hero');
                            } else {
                                htmlEl.classList.add('scrolled-past-hero');
                            }
                        }, { threshold: 0.20 });
                        statusBarObserver.observe(heroEl);
                    }
                }

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

                function categorizeEvents(allEvents) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

                    const upcoming = [];
                    const past = [];

                    allEvents.forEach(event => {
                        const eventDate = new Date(event.date);
                        eventDate.setHours(23, 59, 59, 999);
                        if (eventDate >= today) upcoming.push(event);
                        else past.push(event);
                    });

                    past.sort((a, b) => new Date(b.date) - new Date(a.date));
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
                            <p class="stay-tuned-text">New events are on the horizon.<br>Check back soon for what's next.</p>
                            \${hasPastEvents && !isDesktop ? '<button class="btn-view-past-events" id="btn-view-past-events">View Past Events</button>' : ''}
                        </div>
                    \`;

                    if (isDesktop && hasPastEvents) {
                        // No wrapper div, no inline styles — CSS grid on .stay-tuned-container handles layout
                        return \`
                            <div class="stay-tuned-card" id="stay-tuned-card-el">
                                \${stayTunedInner}
                            </div>
                            <div class="past-events-outer">
                                <div class="event-outer-card">
                                    <div class="event-card-header">
                                        <span class="past-card-badge">MEMORIES</span>
                                        <span></span>
                                    </div>
                                    <div class="past-events-card" id="btn-view-past-events-desktop">
                                        <div class="past-card-icon"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="var(--gold)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="14" rx="3"/><circle cx="12" cy="13" r="4"/><path d="M7 6V5a2 2 0 012-2h6a2 2 0 012 2v1"/></svg></div>
                                        <h3 class="past-card-title">Past Events</h3>
                                        <p class="past-card-text">Take a look back at the moments we've shared together in our community.</p>
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

                function renderUpcomingEventCard(event, index, totalUpcoming) {
                    const imageHtml = event.image
                        ? \`<img src="\${event.image}" alt="\${event.title}" class="flyer-image" loading="lazy" decoding="async" crossorigin="anonymous" onerror="this.style.display='none';">\`
                        : \`<div class="flyer-placeholder" style="width:100%;height:100%;background:linear-gradient(135deg,var(--gold),var(--gold-dark));display:flex;align-items:center;justify-content:center;"><span style="font-size:48px;">📅</span></div>\`;

                    // Time text — only when a specific time exists (null means all-day event)
                    const timePillHtml = event.time
                        ? \`<span class="event-time-pill">\${event.time}</span>\`
                        : \`<span></span>\`;

                    // Detect a link in the event description (after [CTA:...] tags are stripped).
                    // Supports "Label: https://..." (uses label as button text) or a bare URL ("Learn More").
                    let descLinkUrl = '';
                    let descLinkText = 'Learn More';
                    if (event.description) {
                        // Try "Word(s): https://..." pattern first — label becomes the button text
                        const labeledMatch = event.description.match(/([A-Za-z][A-Za-z0-9 ]{0,30}?)\\s*:\\s*(https?:\\/\\/[^\\s<>"']+)/);
                        if (labeledMatch) {
                            descLinkText = labeledMatch[1].trim();
                            descLinkUrl = labeledMatch[2].replace(/[.,;)\\]]+$/, '');
                        } else {
                            // Fall back to any bare URL
                            const bareMatch = event.description.match(/https?:\\/\\/[^\\s<>"']+/);
                            if (bareMatch) {
                                descLinkUrl = bareMatch[0].replace(/[.,;)\\]]+$/, '');
                            }
                        }
                    }
                    const hasDescLink = !!descLinkUrl;

                    // [CTA:...] tag button (frosted-glass overlay on mobile, standalone button on desktop)
                    const hasRealLink = event.cta && event.cta.link && event.cta.link !== '#contact' && event.cta.link.startsWith('http');
                    const ctaHtml = hasRealLink
                        ? \`<div class="event-cta"><a href="\${event.cta.link}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">\${event.cta.text}</a></div>\`
                        : '';

                    // Description-link: gold pill button BELOW the image card (not overlaid),
                    // styled to match the "Find Us" button. Arrow icon right of text.
                    const eventLinkBtnHtml = hasDescLink
                        ? \`<a href="\${descLinkUrl}" class="event-link-btn" target="_blank" rel="noopener noreferrer">\${descLinkText}</a>\`
                        : '';

                    return \`
                        <div class="carousel-card">
                            <div class="event-card">
                                <div class="event-outer-card">
                                    <div class="event-card-header">
                                        <span class="event-date">\${event.displayDate}</span>
                                        \${timePillHtml}
                                    </div>
                                    <div class="event-flyer-wrapper" data-glow-detect>
                                        \${imageHtml}
                                        \${ctaHtml}
                                    </div>
                                    \${eventLinkBtnHtml}
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
                                            <p class="past-card-text">Take a look back at the moments we've shared together in our community.</p>
                                        </div>
                                        <button class="event-link-btn" id="carousel-see-past-btn">Browse Memories</button>
                                    </div>
                                </div>
                            </div>
                        \`);
                    }

                    initCarousel(allCards, past);
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

                // Handle hash in URL on page load (e.g., ms.church/#contact)
                if (window.location.hash && window.location.hash !== '#' && window.location.hash !== '') {
                    const hash = window.location.hash;
                    window.scrollTo(0, 0);
                    window.addEventListener('load', () => {
                        setTimeout(() => {
                            const navLink = document.querySelector('a[href="' + hash + '"]');
                            if (navLink) navLink.click();
                        }, 800);
                    }, { once: true });
                }

                // Mobile nav compression on scroll
                let lastNavScrollY = 0;
                function getScrollThreshold() {
                    const width = window.innerWidth;
                    if (width <= 375) return 130 * 0.10;
                    if (width <= 480) return 190 * 0.10;
                    if (width <= 960) return 190 * 0.10;
                    return 320 * 0.10;
                }
                let scrollUpAtTopCount = 0;
                let isNavigatingHome = false;

                function handleMobileNav() {
                    const currentScrollY = window.scrollY;
                    const scrollThreshold = getScrollThreshold();

                    if (window.innerWidth <= 1199) {
                        if (isNavigatingHome) {
                            if (currentScrollY === 0) isNavigatingHome = false;
                            lastNavScrollY = currentScrollY;
                            return;
                        }

                        if (currentScrollY <= scrollThreshold && currentScrollY < lastNavScrollY) {
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

                // Smooth scrolling for navigation links
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        const targetId = this.getAttribute('href');

                        if (targetId === '#home' || targetId === '#') {
                            if (window.innerWidth <= 1199) {
                                navShell.classList.remove('scrolled-mobile');
                                isNavigatingHome = true;
                            }
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            return;
                        }

                        const target = document.querySelector(targetId);
                        if (target) {
                            let navOffset = 45;

                            if (targetId === '#outreach') {
                                const outreachRect = target.getBoundingClientRect();
                                const outreachAbsoluteTop = outreachRect.top + window.pageYOffset;
                                if (window.innerWidth <= 899) navOffset = 30;
                                else if (window.innerWidth <= 1199) navOffset = -20;
                                else navOffset = 60;
                                window.scrollTo({ top: outreachAbsoluteTop - navOffset, behavior: 'smooth' });
                                return;
                            }

                            if (targetId === '#gift-form') {
                                navOffset = window.innerWidth <= 899 ? 100 : 150;
                                const elementRect = target.getBoundingClientRect();
                                const absoluteElementTop = elementRect.top + window.pageYOffset;
                                window.scrollTo({ top: absoluteElementTop - navOffset, behavior: 'smooth' });
                                return;
                            }

                            if (window.innerWidth <= 899) navOffset = 30;
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

                // JotForm Submission Handler
                window.addEventListener('message', function(e) {
                    if (typeof e.data === 'object' && e.data.action === 'submission-completed') {
                        showSuccessState();
                    }
                });

                function showSuccessState() {
                    const jotformContainer = document.querySelector('.jotform-container');
                    const successState = document.querySelector('.form-success');
                    if (jotformContainer && successState) {
                        jotformContainer.style.display = 'none';
                        successState.style.display = 'flex';
                        createConfetti();
                        successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }

                function createConfetti() {
                    const confettiEmojis = ['🎁', '🎁', '🎁', '🎁', '🎁'];
                    for (let i = 0; i < 50; i++) {
                        setTimeout(() => {
                            const confetti = document.createElement('div');
                            confetti.className = 'confetti';
                            confetti.textContent = confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
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

                    document.getElementById('days').textContent = days;
                    document.getElementById('hours').textContent = hours;
                    document.getElementById('minutes').textContent = minutes;
                    document.getElementById('seconds').textContent = seconds;
                }

                updateCountdown();
                setInterval(updateCountdown, 1000);

                // YouTube thumbnail-to-playback with morph-to-spinner animation
                var videoWrapper = document.getElementById('video-embed-wrapper');
                var videoThumbnail = document.getElementById('video-thumbnail');
                var videoThumbnailImg = document.getElementById('video-thumbnail-img');
                var videoPlayBtn = document.getElementById('video-play-btn');
                var _ytVideoId = null;
                var _videoActivated = false;
                var _shouldAutoPlay = false;
                var _preloadedIframe = null;
                var _playbackConfirmed = false;
                var _revealTimeout = null;

                // Pre-embed iframe hidden behind thumbnail so it's fully loaded on tap.
                function preloadIframe(videoId) {
                    if (_preloadedIframe || !videoWrapper) return;
                    var iframe = document.createElement('iframe');
                    iframe.className = 'youtube-embed';
                    iframe.setAttribute('allowfullscreen', '');
                    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                    iframe.src = 'https://www.youtube.com/embed/' + videoId
                        + '?enablejsapi=1&rel=0&modestbranding=1&playsinline=1';
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
                            revealVideo();
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
                        var iframe = document.createElement('iframe');
                        iframe.className = 'youtube-embed';
                        iframe.setAttribute('allowfullscreen', '');
                        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                        iframe.src = 'https://www.youtube.com/embed/' + _ytVideoId
                            + '?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1';
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

                    // Spinner and thumbnail fade out together in one synchronized 500ms fade
                    if (videoPlayBtn) {
                        videoPlayBtn.classList.remove('is-loading');
                        videoPlayBtn.classList.add('is-revealing');
                    }
                    videoThumbnail.classList.add('is-revealing');

                    // Clean up DOM after the 500ms fade completes
                    setTimeout(function() {
                        if (videoThumbnail.parentNode) {
                            videoThumbnail.parentNode.removeChild(videoThumbnail);
                        }
                    }, 550);
                }

                function showVideoFallback() {
                    if (!videoThumbnail || !videoWrapper) return;
                    videoThumbnail.innerHTML = '';
                    var link = document.createElement('a');
                    link.className = 'video-fallback-link';
                    link.href = 'https://www.youtube.com/playlist?list=PLHs3usNpG0bZHnAJlIpwBtkbnd7xDCeRC';
                    link.target = '_blank';
                    link.rel = 'noopener';
                    link.textContent = 'Watch on YouTube';
                    videoWrapper.appendChild(link);
                    videoWrapper.style.background = '#1a1a2e';
                }

                fetch('/api/youtube/latest-video')
                    .then(function(r) { return r.json(); })
                    .then(function(data) {
                        if (data.success && data.videoId) {
                            _ytVideoId = data.videoId;
                            // Pre-load the YouTube iframe behind the thumbnail
                            preloadIframe(data.videoId);
                            if (videoThumbnailImg) {
                                videoThumbnailImg.src = data.thumbnailUrl;
                                videoThumbnailImg.onerror = function() {
                                    this.onerror = null;
                                    this.src = 'https://img.youtube.com/vi/' + data.videoId + '/hqdefault.jpg';
                                };
                            }
                            if (videoPlayBtn) {
                                videoPlayBtn.addEventListener('click', function(e) {
                                    e.stopPropagation();
                                    activateVideo();
                                });
                            }
                            if (videoThumbnail) {
                                videoThumbnail.addEventListener('click', activateVideo);
                            }
                            if (_shouldAutoPlay) {
                                activateVideo();
                            }
                        } else {
                            showVideoFallback();
                        }
                    })
                    .catch(function() {
                        showVideoFallback();
                    });

                // Auto-play video during Sunday service (9:00am - 9:45am MT)
                function checkAutoPlay() {
                    var mtNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Denver' }));
                    var isSundayServiceTime = mtNow.getDay() === 0 &&
                                                mtNow.getHours() === 9 &&
                                                mtNow.getMinutes() < 45;
                    if (isSundayServiceTime) {
                        if (_ytVideoId) {
                            activateVideo();
                        } else {
                            _shouldAutoPlay = true;
                        }
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
