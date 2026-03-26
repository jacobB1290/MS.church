// HTML body sections for the home page.
// The <style> block lives in home-styles.ts (imported via home-head.ts).
// The <script> block lives in home-scripts.ts.
// Event images use loading="lazy" since they are below the fold.
// The hero church-building image is above the fold — no lazy loading.

export const homeBody = (): string => `
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
                <a class="nav-cta" href="#contact">Contact</a>
                <a class="nav-form-btn" href="#contact">Contact</a>
            </header>
            <div class="nav-spacer"></div>
            <main>
                <section class="hero" id="home" style="animation-delay: 0.1s">
                    <div class="hero-blur-layer blur-1"></div>
                    <div class="hero-blur-layer blur-2"></div>
                    <div class="hero-blur-layer blur-3"></div>
                    <div class="hero-blur-layer blur-4"></div>
                    <h1 class="sr-only">Morning Star Christian Church — A Welcoming Christian Church in Boise, Idaho</h1>
                    <p class="hero-tagline">Mending the Broken.</p>
                    <div class="hero-body">
                        <p class="hero-service-time">Join us Sundays at 9 AM</p>
                        <div class="hero-image">
                            <img src="https://page.gensparksite.com/v1/base64_upload/2ed08492a85ab5d976704d29fdd46025" alt="Morning Star Christian Church building in Boise, Idaho" width="1200" height="630" loading="eager" fetchpriority="high" decoding="async">
                            <!-- Find Us Button - Long frosted glass pill at bottom of image -->
                            <div class="find-us-wrapper address-dropdown-wrapper">
                                <button class="find-us-btn address-trigger" data-address="3080 Wildwood St, Boise, Idaho">Find Us</button>
                                <div class="address-dropdown">
                                    <a href="https://maps.apple.com/place?place-id=I975B333A92084AE7" target="_blank" rel="noopener" class="address-dropdown-item">
                                        <span class="address-dropdown-icon">🍎</span>
                                        <span>Apple Maps</span>
                                    </a>
                                    <a href="https://maps.app.goo.gl/nmYV7hSLXKVGexu38?g_st=ipc" target="_blank" rel="noopener" class="address-dropdown-item">
                                        <span class="address-dropdown-icon">🗺️</span>
                                        <span>Google Maps</span>
                                    </a>
                                    <button class="address-dropdown-item copy-address" data-address="3080 Wildwood St, Boise, Idaho">
                                        <span class="address-dropdown-icon">📋</span>
                                        <span>Copy Address</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Bridge: overlaps hero bottom + white area, blurs across the seam -->
                <div class="hero-bridge">
                    <div class="hero-bridge-blur bridge-blur-1"></div>
                    <div class="hero-bridge-blur bridge-blur-2"></div>
                    <div class="hero-bridge-blur bridge-blur-3"></div>
                </div>

                <section class="schedule" id="schedule" style="animation-delay: 0.2s">
                    <span class="section-eyebrow">Weekly Schedule</span>
                    <h2 class="section-heading">Sunday Worship, Bible Study & Fellowship in Boise</h2>
                    <address>
                        <div class="address-dropdown-wrapper">
                            <button class="address-trigger" data-address="3080 Wildwood St, Boise, Idaho">3080 Wildwood St · Boise, Idaho</button>
                            <div class="address-dropdown">
                                <a href="https://maps.apple.com/place?place-id=I975B333A92084AE7" target="_blank" rel="noopener" class="address-dropdown-item">
                                    <span class="address-dropdown-icon">🍎</span>
                                    <span>Apple Maps</span>
                                </a>
                                <a href="https://maps.app.goo.gl/nmYV7hSLXKVGexu38?g_st=ipc" target="_blank" rel="noopener" class="address-dropdown-item">
                                    <span class="address-dropdown-icon">🗺️</span>
                                    <span>Google Maps</span>
                                </a>
                                <button class="address-dropdown-item copy-address" data-address="3080 Wildwood St, Boise, Idaho">
                                    <span class="address-dropdown-icon">📋</span>
                                    <span>Copy Address</span>
                                </button>
                            </div>
                        </div>
                    </address>
                    <div class="section-card">
                        <div class="schedule-grid">
                            <article class="schedule-item">
                                <span>Sunday Gatherings</span>
                                <h3>Sundays · 9:00 AM</h3>
                                <p>Morning service with free community breakfast after. Free transportation from select shelters included.</p>
                            </article>
                            <article class="schedule-item">
                                <span>Bible Reading</span>
                                <h3>Tuesdays · 8:30 AM</h3>
                                <p>Tuesday Bible Reading at <a href="https://maps.app.goo.gl/XkJR5aLy36VVD3356?g_st=ic" target="_blank" rel="noopener noreferrer" style="color: var(--gold); text-decoration: underline; text-decoration-color: color-mix(in srgb, var(--gold) 50%, transparent); font-weight: 600;">Caffiena State Street</a>.</p>
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
                    <span class="section-eyebrow">Outreach</span>
                    <h2 class="section-heading">Community Outreach & Events in Boise, Idaho</h2>

                    <!--
                    ================================================
                    GOOGLE CALENDAR POWERED EVENTS
                    ================================================
                    Events are pulled from the server's /api/calendar/events endpoint,
                    which proxies Google Calendar (morningstarchurchboise@gmail.com).

                    HOW TO ADD EVENTS:
                    1. Create an event in Google Calendar
                    2. Attach a flyer image from Google Drive (must be shared publicly)
                    3. Optionally add CTA in description: [CTA: BUTTON TEXT | #contact]

                    The website will:
                    - Pull the event title, date, and attached image
                    - Auto-sort into Upcoming vs Past events
                    - Show "Stay Tuned" when no upcoming events exist
                    ================================================
                    -->

                    <!-- Stay Tuned Card - shown when no upcoming events -->
                    <div class="stay-tuned-container" id="stay-tuned-container" style="display: none;"></div>

                    <!-- Carousel for upcoming events -->
                    <div class="carousel-wrapper" id="carousel-wrapper" style="display: none;">
                        <div class="carousel-viewport" aria-live="polite" aria-atomic="false">
                            <div class="carousel-track" id="carousel-track" role="list">
                                <!-- Cards rendered by JS; track slides via translateX -->
                            </div>
                        </div>
                        <button class="carousel-arrow prev" id="carousel-prev" aria-label="Previous event">&#8249;</button>
                        <button class="carousel-arrow next" id="carousel-next" aria-label="Next event">&#8250;</button>
                        <div class="carousel-nav" id="carousel-nav">
                            <div class="carousel-dots" id="carousel-dots"></div>
                        </div>
                    </div>
                </section>

                <!-- Past Events Modal - Overlay Carousel (outside normal page flow) -->
                <div class="past-events-modal" id="past-events-modal">
                    <div class="past-events-modal-content">
                        <div class="past-events-modal-header">
                            <h3 class="past-events-modal-title">Past Events</h3>
                            <button class="past-events-modal-close" id="close-past-events" aria-label="Close past events">&times;</button>
                        </div>
                        <div class="past-events-carousel">
                            <button class="past-events-nav prev" id="past-prev" aria-label="Previous event">&#8249;</button>
                            <div class="past-events-slides" id="past-events-slides">
                                <!-- Past event slides dynamically generated -->
                            </div>
                            <button class="past-events-nav next" id="past-next" aria-label="Next event">&#8250;</button>
                        </div>
                        <div class="past-events-dots" id="past-events-dots">
                            <!-- Dots dynamically generated -->
                        </div>
                    </div>
                </div>

                <section class="watch" id="watch" style="animation-delay: 0.4s">
                    <div class="watch-header">
                        <span class="section-eyebrow">Watch</span>
                        <h2 class="section-heading">Watch Our Sunday Service Live from Boise</h2>
                    </div>
                    <div class="watch-card">
                        <div class="watch-main">
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
                                <p class="live-verse">"Consequently, faith comes from hearing the message, and the message is heard through the word about Christ."<small>Romans 10:17</small></p>

                                <div class="video-embed-wrapper" id="video-embed-wrapper">
                                    <div class="video-thumbnail" id="video-thumbnail">
                                        <img class="video-thumbnail-img" id="video-thumbnail-img"
                                             alt="Latest Sunday Service from Morning Star Christian Church Boise"
                                             width="1280" height="720"
                                             loading="lazy">
                                        <button class="video-play-btn" id="video-play-btn" aria-label="Play video">
                                            <svg class="play-icon" viewBox="0 0 68 48" width="68" height="48">
                                                <path class="video-play-btn-bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#FF0000"></path>
                                                <path class="play-triangle" d="M 45,24 27,14 27,34" fill="#fff"></path>
                                                <circle class="play-spinner-ring" cx="34" cy="24" r="18" fill="none" stroke="#FF0000" stroke-width="2.5" stroke-dasharray="85 28" stroke-linecap="round"></circle>
                                            </svg>
                                        </button>
                                    </div>
                                    <button class="video-unmute-btn" id="video-unmute-btn" aria-label="Unmute video">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                            <line x1="23" y1="9" x2="17" y2="15"></line>
                                            <line x1="17" y1="9" x2="23" y2="15"></line>
                                        </svg>
                                        Tap to unmute
                                    </button>
                                </div>

                                <a href="https://www.youtube.com/playlist?list=PLHs3usNpG0bZHnAJlIpwBtkbnd7xDCeRC" target="_blank" rel="noopener" class="btn btn-outline playlist-btn">
                                    View Full Playlist
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="contact" id="contact" style="animation-delay: 0.5s">
                    <div class="contact-header">
                        <span class="section-eyebrow">Get In Touch</span>
                        <h2 class="section-heading">Contact Us</h2>
                        <p class="section-lead">
                            We'd love to hear from you! Whether you have questions, prayer requests, or just want to connect, fill out the form below and someone from our team will get back to you.
                        </p>

                        <address>
                            <div class="address-dropdown-wrapper">
                                <button class="address-trigger" data-address="3080 Wildwood St, Boise, Idaho">3080 Wildwood St, Boise, Idaho</button>
                                <div class="address-dropdown">
                                    <a href="https://maps.apple.com/place?place-id=I975B333A92084AE7" target="_blank" rel="noopener" class="address-dropdown-item">
                                        <span class="address-dropdown-icon">🍎</span>
                                        <span>Apple Maps</span>
                                    </a>
                                    <a href="https://maps.app.goo.gl/nmYV7hSLXKVGexu38?g_st=ipc" target="_blank" rel="noopener" class="address-dropdown-item">
                                        <span class="address-dropdown-icon">🗺️</span>
                                        <span>Google Maps</span>
                                    </a>
                                    <button class="address-dropdown-item copy-address" data-address="3080 Wildwood St, Boise, Idaho">
                                        <span class="address-dropdown-icon">📋</span>
                                        <span>Copy Address</span>
                                    </button>
                                </div>
                            </div>
                        </address>
                    </div>
                    <div class="jotform-container" id="contact-form">
                        <div class="engage-hub-form-embed" id="eh_form_5064126720901120" data-id="5064126720901120"></div>
                        <script type="text/javascript">
                        var EhAPI = EhAPI || {}; EhAPI.after_load = function(){
                            EhAPI.set_account('trohddh7jp05vmrl417ue6lbpm', 'gmailidoy');
                            EhAPI.execute('rules');
                        };(function(d,s,f) {
                            var sc=document.createElement(s);sc.type='text/javascript';
                            sc.async=true;sc.src=f;var m=document.getElementsByTagName(s)[0];
                            m.parentNode.insertBefore(sc,m);
                        })(document, 'script', '//d2p078bqz5urf7.cloudfront.net/jsapi/ehform.js?v' + new Date().getHours());
                        </script>
                    </div>
                </section>
            </main>

            <!-- Footer -->
            <footer class="site-footer">
                <div class="footer-content">
                    <div class="footer-brand">
                        <span class="footer-brand-title">Morning Star</span>
                        <span class="footer-brand-subtitle">Christian Church</span>
                    </div>

                    <div class="footer-social">
                        <a href="https://www.instagram.com/mschurchboise" target="_blank" rel="noopener" aria-label="Instagram">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </a>
                        <a href="https://www.facebook.com/61564924058156/" target="_blank" rel="noopener" aria-label="Facebook">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </a>
                        <a href="https://youtube.com/@morningstarboise" target="_blank" rel="noopener" aria-label="YouTube">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                        </a>
                    </div>

                    <div class="footer-divider"></div>

                    <div class="footer-links">
                        <a href="/privacy" class="footer-link">Legal</a>
                    </div>

                    <p class="footer-copyright">© <span id="copyright-year"></span> Morning Star Christian Church. All rights reserved.</p>
                    <script>document.getElementById('copyright-year').textContent = new Date().getFullYear();</script>
                </div>
            </footer>
        </div>`
