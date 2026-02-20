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
                        // Show a subtle user-facing notice below the section heading
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

                function renderStayTunedCard(hasPastEvents) {
                    const isDesktop = window.innerWidth >= 961;

                    if (isDesktop && hasPastEvents) {
                        return \`
                            <div class="desktop-cards-wrapper" style="display: flex !important; flex-direction: row !important; gap: 40px; justify-content: center; align-items: flex-start; width: 100%; max-width: 900px; margin: 0 auto;">
                                <div class="stay-tuned-card" style="flex: 0 0 280px; width: 280px; max-width: 280px; aspect-ratio: 3/4; border-radius: 24px;">
                                    <span class="event-date stay-tuned-badge">COMING SOON</span>
                                    <div class="stay-tuned-content">
                                        <div class="stay-tuned-icon">✨</div>
                                        <h3 class="stay-tuned-title">Stay Tuned</h3>
                                        <p class="stay-tuned-text">Exciting events are being planned!<br>Check back soon for upcoming outreach opportunities.</p>
                                        <div class="stay-tuned-decoration">
                                            <span>🤝</span>
                                            <span>❤️</span>
                                            <span>🙏</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="past-events-card" id="btn-view-past-events-desktop" style="flex: 0 0 280px; width: 280px; max-width: 280px; aspect-ratio: 3/4; border-radius: 24px;">
                                    <span class="past-card-badge">MEMORIES</span>
                                    <div class="past-card-icon">📸</div>
                                    <h3 class="past-card-title">Past Events</h3>
                                    <p class="past-card-text">Relive the moments!<br>Browse through our past outreach events.</p>
                                    <span class="past-card-btn">View Gallery</span>
                                </div>
                            </div>
                        \`;
                    } else {
                        return \`
                            <div class="stay-tuned-card">
                                <span class="event-date stay-tuned-badge">COMING SOON</span>
                                <div class="stay-tuned-content">
                                    <div class="stay-tuned-icon">✨</div>
                                    <h3 class="stay-tuned-title">Stay Tuned</h3>
                                    <p class="stay-tuned-text">Exciting events are being planned!<br>Check back soon for upcoming outreach opportunities.</p>
                                    <div class="stay-tuned-decoration">
                                        <span>🤝</span>
                                        <span>❤️</span>
                                        <span>🙏</span>
                                    </div>
                                    \${hasPastEvents ? '<button class="btn-view-past-events" id="btn-view-past-events">View Past Events</button>' : ''}
                                </div>
                            </div>
                        \`;
                    }
                }

                function renderUpcomingEventCard(event, index, totalUpcoming) {
                    const imageHtml = event.image
                        ? \`<img src="\${event.image}" alt="\${event.title}" class="flyer-image" loading="lazy" crossorigin="anonymous" onerror="this.style.display='none';">\`
                        : \`<div class="flyer-placeholder" style="width:100%;height:100%;background:linear-gradient(135deg,#d4a574,#c89860);display:flex;align-items:center;justify-content:center;"><span style="font-size:48px;">📅</span></div>\`;

                    const hasRealLink = event.cta && event.cta.link && event.cta.link !== '#contact' && event.cta.link.startsWith('http');
                    const ctaHtml = hasRealLink
                        ? \`<div class="event-cta"><a href="\${event.cta.link}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">\${event.cta.text}</a></div>\`
                        : '';

                    return \`
                        <div class="carousel-card">
                            <div class="event-card">
                                <div class="event-flyer-wrapper" data-glow-detect>
                                    \${imageHtml}
                                    <span class="event-date">\${event.displayDate}</span>
                                    \${ctaHtml}
                                </div>
                            </div>
                        </div>
                    \`;
                }

                function renderPastEventSlide(event, index, isActive) {
                    return \`
                        <div class="past-event-slide \${isActive ? 'active' : ''}" data-past-index="\${index}">
                            <img src="\${event.image}" alt="\${event.title}" loading="lazy">
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
                        stayTunedContainer.innerHTML = renderStayTunedCard(past.length > 0);
                        stayTunedContainer.style.display = 'block';
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
                                <div class="carousel-past-card" id="carousel-see-past">
                                    <span class="past-card-badge">MEMORIES</span>
                                    <div class="past-card-icon">📸</div>
                                    <h3 class="past-card-title">Past Events</h3>
                                    <p class="past-card-text">Relive the moments!<br>Browse through our past outreach events.</p>
                                    <span class="past-card-btn">View Gallery</span>
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

                    const seePastCard = document.getElementById('carousel-see-past');
                    if (seePastCard && pastEventsModal && pastEvents && pastEvents.length > 0) {
                        seePastCard.addEventListener('click', () => {
                            pastEventsModal.classList.add('active');
                            body.classList.add('modal-open');
                            document.querySelectorAll('.past-event-slide').forEach((s, i) => {
                                s.classList.remove('active', 'prev');
                                if (i === 0) s.classList.add('active');
                            });
                            document.querySelectorAll('.past-events-dot').forEach((d, i) => {
                                d.classList.toggle('active', i === 0);
                            });
                        });
                    }

                    document.querySelectorAll('[data-glow-detect]').forEach(wrapper => {
                        const img = wrapper.querySelector('.flyer-image');
                        if (!img) { wrapper.classList.add('glow-warm'); return; }
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = 8; canvas.height = 8;
                        const detect = () => {
                            try {
                                ctx.drawImage(img, 0, 0, 8, 8);
                                const d = ctx.getImageData(0, 0, 8, 8).data;
                                let r=0,g=0,b=0,c=0;
                                for (let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];c++;}
                                r=Math.round(r/c);g=Math.round(g/c);b=Math.round(b/c);
                                if(r>160&&g<100&&b<100)wrapper.classList.add('glow-red');
                                else if(b>140&&r<120)wrapper.classList.add('glow-blue');
                                else if(g>140&&r<120)wrapper.classList.add('glow-green');
                                else if(r>120&&b>120&&g<100)wrapper.classList.add('glow-purple');
                                else if(r<80&&g<80&&b<80)wrapper.classList.add('glow-dark');
                                else wrapper.classList.add('glow-warm');
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
                        const offset = (currentIndex / totalCards) * 100;
                        carouselTrack.style.transform = 'translateX(-' + offset + '%)';
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
                                resetAutoTimer();
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

                    carouselPrev.addEventListener('click', () => {
                        if (currentIndex > 0) { currentIndex--; render(); resetAutoTimer(); }
                    });
                    carouselNext.addEventListener('click', () => {
                        if (currentIndex < getMaxIndex()) { currentIndex++; render(); resetAutoTimer(); }
                    });

                    let touchStartX = 0, touchStartY = 0;
                    carouselTrack.addEventListener('touchstart', e => {
                        touchStartX = e.touches[0].clientX;
                        touchStartY = e.touches[0].clientY;
                    }, { passive: true });
                    carouselTrack.addEventListener('touchend', e => {
                        if (!e.changedTouches[0]) return;
                        const dx = e.changedTouches[0].clientX - touchStartX;
                        const dy = e.changedTouches[0].clientY - touchStartY;
                        if (Math.abs(dx) < Math.abs(dy) || Math.abs(dx) < 50) return;
                        if (dx < 0 && currentIndex < getMaxIndex()) currentIndex++;
                        else if (dx > 0 && currentIndex > 0) currentIndex--;
                        render();
                        resetAutoTimer();
                    }, { passive: true });

                    function startAutoTimer() {
                        return setInterval(() => {
                            if (currentIndex < getMaxIndex()) currentIndex++;
                            else currentIndex = 0;
                            render();
                        }, 5000);
                    }
                    let autoTimer = startAutoTimer();
                    function resetAutoTimer() {
                        clearInterval(autoTimer);
                        autoTimer = startAutoTimer();
                    }
                    carouselWrapper.addEventListener('mouseenter', () => clearInterval(autoTimer));
                    carouselWrapper.addEventListener('mouseleave', () => { autoTimer = startAutoTimer(); });
                    window.addEventListener('resize', () => {
                        if (currentIndex > getMaxIndex()) currentIndex = getMaxIndex();
                        render();
                    });
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

                // Auto-play video during Sunday service (9:00am - 9:45am MT)
                function checkAutoPlay() {
                    const mtNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Denver' }));
                    const isSundayServiceTime = mtNow.getDay() === 0 &&
                                                mtNow.getHours() === 9 &&
                                                mtNow.getMinutes() < 45;
                    if (isSundayServiceTime) {
                        const youtubeEmbed = document.querySelector('.youtube-embed');
                        if (youtubeEmbed) {
                            const currentSrc = youtubeEmbed.getAttribute('src');
                            if (currentSrc && !currentSrc.includes('autoplay=1')) {
                                youtubeEmbed.setAttribute('src', currentSrc + '&autoplay=1&mute=1');
                            }
                        }
                    }
                }

                // Disconnect observer after first trigger to prevent memory leak
                const watchSection = document.querySelector('#watch');
                if (watchSection) {
                    const observer = new IntersectionObserver((entries, obs) => {
                        entries.forEach(entry => {
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
