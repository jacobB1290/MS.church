// HTML body sections for the home page.
// The <style> block lives in home-styles.ts (imported via home-head.ts).
// The <script> block lives in home-scripts.ts.
// Event images use loading="lazy" since they are below the fold.
// The hero church-building image is above the fold — no lazy loading.

import { nav } from './shared/nav.js'
import { footer } from './shared/footer.js'

export const homeBody = (): string => `
    <body>
        <div class="page">
            ${nav()}
            <div class="nav-spacer"></div>
            <main>
                <section class="hero" id="home">
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
                            <!-- Plan a Visit button — links to the /visit page (map + 7-step service flow incl. breakfast + Sunday School). v1.57.0 unified to canonical .event-link-btn .teaser-cta gold pill (the "Explore Our Ministries" design). -->
                            <div class="find-us-wrapper">
                                <a class="event-link-btn teaser-cta find-us-link" href="/visit">Plan a Visit</a>
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

                <section class="schedule" id="schedule">
                    <span class="section-eyebrow reveal-eyebrow">Schedule</span>
                    <h2 class="section-heading reveal-rise">Sunday Worship, Bible Study & Fellowship in Boise</h2>
                    <address class="reveal-rise">
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
                    <!-- Schedule layout: banner image carousel on the left, vertical
                         card list on the right (desktop). On mobile, banner is hidden
                         and the cards stack as a plain list. No .section-card wrapper —
                         the layout sits directly on the page background like the About
                         teaser, for a quieter editorial feel. -->
                    <div class="schedule-layout">
                        <div class="schedule-banner reveal-power" id="schedule-banner" aria-live="polite">
                            <div class="schedule-banner-slide schedule-banner-placeholder active" data-index="0" role="img" aria-label="Sunday Gatherings">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                            </div>
                            <div class="schedule-banner-slide schedule-banner-placeholder" data-index="1" role="img" aria-label="Tuesday Bible Reading">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                            </div>
                            <div class="schedule-banner-slide schedule-banner-placeholder" data-index="2" role="img" aria-label="Wednesday Activity Day">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                            </div>
                            <div class="schedule-banner-slide schedule-banner-placeholder" data-index="3" role="img" aria-label="Thursday Bible Study">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                            </div>
                            <div class="schedule-banner-slide schedule-banner-placeholder" data-index="4" role="img" aria-label="Friday Youth Service">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                            </div>
                        </div>
                        <div class="schedule-list" role="tablist" aria-label="Weekly gatherings, with links into the Ministries page" data-reveal-group data-reveal-delay="80">
                            <button class="schedule-tab active" data-index="0" type="button" role="tab" aria-selected="true" data-reveal-sync>
                                <span class="schedule-tab-eyebrow reveal-eyebrow">Worship</span>
                                <span class="schedule-tab-title reveal-rise">Sundays · 9:00 AM</span>
                                <span class="schedule-tab-desc reveal-tight">Morning service, about an hour, with free community breakfast after. Free transportation from select shelters included. <a href="/ministries#worship" class="schedule-tab-link">Learn more →</a></span>
                            </button>
                            <button class="schedule-tab" data-index="1" type="button" role="tab" aria-selected="false" data-reveal-sync>
                                <span class="schedule-tab-eyebrow reveal-eyebrow">Discipleship</span>
                                <span class="schedule-tab-title reveal-rise">Tuesdays · 8:30 AM</span>
                                <span class="schedule-tab-desc reveal-tight">Bible Reading at <a href="https://maps.app.goo.gl/XkJR5aLy36VVD3356?g_st=ic" target="_blank" rel="noopener noreferrer" class="schedule-tab-link">Caffiena State Street</a>. <a href="/ministries#discipleship" class="schedule-tab-link">Learn more →</a></span>
                            </button>
                            <button class="schedule-tab" data-index="2" type="button" role="tab" aria-selected="false" data-reveal-sync>
                                <span class="schedule-tab-eyebrow reveal-eyebrow">Fellowship</span>
                                <span class="schedule-tab-title reveal-rise">Wednesdays · 6:00 PM</span>
                                <span class="schedule-tab-desc reveal-tight">Activity Day — open gym + crochet circle. About 3 hours. <a href="/ministries#fellowship" class="schedule-tab-link">Learn more →</a></span>
                            </button>
                            <button class="schedule-tab" data-index="3" type="button" role="tab" aria-selected="false" data-reveal-sync>
                                <span class="schedule-tab-eyebrow reveal-eyebrow">Discipleship</span>
                                <span class="schedule-tab-title reveal-rise">Thursdays · 6:00 PM</span>
                                <span class="schedule-tab-desc reveal-tight">A 45-minute evening Bible study at the church with free coffee. <a href="/ministries#discipleship" class="schedule-tab-link">Learn more →</a></span>
                            </button>
                            <button class="schedule-tab" data-index="4" type="button" role="tab" aria-selected="false" data-reveal-sync>
                                <span class="schedule-tab-eyebrow reveal-eyebrow">Youth</span>
                                <span class="schedule-tab-title reveal-rise">Fridays · 7:00 PM</span>
                                <span class="schedule-tab-desc reveal-tight">Youth service — worship, teaching, and fellowship for our next generation. About an hour. <a href="/ministries#youth" class="schedule-tab-link">Learn more →</a></span>
                            </button>
                        </div>
                    </div>
                    <div class="teaser-cta-row schedule-cta-row">
                        <a class="event-link-btn teaser-cta reveal-fill" href="/ministries">Explore Our Ministries</a>
                    </div>
                </section>

                <!-- About teaser — editorial split layout, no section-card frame.
                     Image on the left (~55%), text + CTA on the right, vertically
                     centered. Stacks cleanly on mobile (image on top, text below).
                     Drops the boxed card design used elsewhere on the page so the
                     About section reads with quieter visual weight — a deliberate
                     contrast against the card-heavy Schedule + Outreach sections. -->
                <section id="about">
                    <span class="section-eyebrow reveal-eyebrow">About</span>
                    <h2 class="section-heading reveal-rise">A welcoming church in the heart of Boise.</h2>
                    <div class="about-content" data-reveal-sync>
                        <div class="about-image reveal-from-above">
                            <picture>
                                <source srcset="/static/about-congregation.avif" type="image/avif">
                                <source srcset="/static/about-congregation.webp" type="image/webp">
                                <img src="/static/about-congregation.jpg" alt="Morning Star Christian Church congregation in Boise with hands raised in worship" width="1600" height="1200" loading="lazy" decoding="async">
                            </picture>
                        </div>
                        <div class="about-text">
                            <p class="about-paragraph reveal-rise-slow">Morning Star is a small, Bible-believing community where every story, every age, and every burden is met with grace and a seat at the table. We confess Jesus Christ as Lord and Savior, teach the whole counsel of Scripture, and exist to mend the broken — through faith, family, and serving the city we love.</p>
                            <a class="event-link-btn about-cta reveal-fill" href="/about">Learn More About Us</a>
                        </div>
                    </div>
                </section>

                <!-- Outreach teaser — How We Serve cards, routes to /outreach for full hub + events -->
                <section id="outreach">
                    <span class="section-eyebrow reveal-eyebrow">Outreach</span>
                    <h2 class="section-heading reveal-rise">A few ways we serve Boise.</h2>
                    <div class="section-card">
                        <div class="schedule-grid" data-reveal-sync>
                            <a class="schedule-item teaser-link-card reveal-from-left" href="/outreach#events">
                                <div class="schedule-item-text">
                                    <span>Events</span>
                                    <h3>Community Events</h3>
                                    <p>Year-round open-door gatherings — Friendsgiving, holidays, and city-wide outreach.</p>
                                    <span class="teaser-more">Learn more <span class="teaser-more-arrow" aria-hidden="true">&rarr;</span></span>
                                </div>
                                <div class="schedule-item-image">
                                    <picture>
                                        <img src="/static/community-events.jpg" alt="Three boys with arms around each other at a Morning Star community outreach event in a Boise park" width="1000" height="1333" loading="lazy" decoding="async" style="object-position: 50% 30%;">
                                    </picture>
                                </div>
                            </a>
                            <a class="schedule-item teaser-link-card reveal-rise" href="/outreach#meals-hospitality">
                                <div class="schedule-item-text">
                                    <span>Serve</span>
                                    <h3>Cooking Ministry</h3>
                                    <p>Once a month our team cooks and serves hot meals at homeless shelters across Boise.</p>
                                    <span class="teaser-more">Learn more <span class="teaser-more-arrow" aria-hidden="true">&rarr;</span></span>
                                </div>
                                <div class="schedule-item-image">
                                    <picture>
                                        <source srcset="/static/cooking-ministry.avif" type="image/avif">
                                        <source srcset="/static/cooking-ministry.webp" type="image/webp">
                                        <img src="/static/cooking-ministry.jpg" alt="Morning Star volunteer preparing fresh vegetables for the homeless-shelter cooking ministry" width="1000" height="1333" loading="lazy" decoding="async" style="object-position: 30% 88%;">
                                    </picture>
                                </div>
                            </a>
                            <a class="schedule-item teaser-link-card reveal-from-right" href="/outreach#meals-hospitality">
                                <div class="schedule-item-text">
                                    <span>Hospitality</span>
                                    <h3>Community Breakfast</h3>
                                    <p>Free breakfast every Sunday after the service. Transportation from select shelters included.</p>
                                    <span class="teaser-more">Learn more <span class="teaser-more-arrow" aria-hidden="true">&rarr;</span></span>
                                </div>
                                <div class="schedule-item-image schedule-item-image-placeholder" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                                </div>
                            </a>
                        </div>
                        <div class="teaser-cta-row">
                            <a class="event-link-btn teaser-cta reveal-fill" href="/outreach">Explore Our Outreach</a>
                        </div>
                    </div>
                </section>

                <section class="watch" id="watch">
                    <div class="watch-header">
                        <span class="section-eyebrow reveal-eyebrow">Watch</span>
                        <h2 class="section-heading reveal-rise">Watch Our Sunday Service Live from Boise</h2>
                    </div>
                    <div class="watch-card">
                        <div class="watch-main">
                            <div class="live-stream-container" data-reveal-sync>
                                <span class="live-status"><span class="live-dot"></span><span class="live-status-text">Live Soon</span></span>
                                <div class="countdown-container reveal-rise">
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
                                <p class="live-verse reveal-rise-slow">"Consequently, faith comes from hearing the message, and the message is heard through the word about Christ."<small>Romans 10:17</small></p>

                                <div class="video-grid reveal-power" id="video-grid">
                                    <article class="video-card video-card-latest" id="video-card-1">
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
                                        <div class="video-card-meta">
                                            <span class="video-card-tag">Latest Service</span>
                                            <span class="video-card-date" id="video-card-1-date"></span>
                                            <h3 class="video-card-title" id="video-card-1-title"></h3>
                                        </div>
                                    </article>

                                    <a class="video-card video-card-recent" id="video-card-2" href="https://www.youtube.com/playlist?list=PLHs3usNpG0bZHnAJlIpwBtkbnd7xDCeRC" target="_blank" rel="noopener" aria-label="Previous Sunday service on YouTube">
                                        <div class="video-card-thumb">
                                            <img class="video-card-thumb-img" id="video-card-2-img" alt="" width="1280" height="720" loading="lazy">
                                            <span class="video-card-play" aria-hidden="true">
                                                <svg viewBox="0 0 68 48" width="48" height="34">
                                                    <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#FF0000"></path>
                                                    <path d="M 45,24 27,14 27,34" fill="#fff"></path>
                                                </svg>
                                            </span>
                                        </div>
                                        <div class="video-card-meta">
                                            <span class="video-card-date" id="video-card-2-date"></span>
                                            <h3 class="video-card-title" id="video-card-2-title"></h3>
                                        </div>
                                    </a>

                                    <a class="video-card video-card-recent" id="video-card-3" href="https://www.youtube.com/playlist?list=PLHs3usNpG0bZHnAJlIpwBtkbnd7xDCeRC" target="_blank" rel="noopener" aria-label="Previous Sunday service on YouTube">
                                        <div class="video-card-thumb">
                                            <img class="video-card-thumb-img" id="video-card-3-img" alt="" width="1280" height="720" loading="lazy">
                                            <span class="video-card-play" aria-hidden="true">
                                                <svg viewBox="0 0 68 48" width="48" height="34">
                                                    <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#FF0000"></path>
                                                    <path d="M 45,24 27,14 27,34" fill="#fff"></path>
                                                </svg>
                                            </span>
                                        </div>
                                        <div class="video-card-meta">
                                            <span class="video-card-date" id="video-card-3-date"></span>
                                            <h3 class="video-card-title" id="video-card-3-title"></h3>
                                        </div>
                                    </a>
                                </div>

                                <a href="https://www.youtube.com/playlist?list=PLHs3usNpG0bZHnAJlIpwBtkbnd7xDCeRC" target="_blank" rel="noopener" class="event-link-btn event-link-btn--red teaser-cta playlist-btn reveal-fill">
                                    View Full Playlist
                                </a>
                            </div>
                        </div>
                    </div>

                    <div class="video-player-overlay" id="video-player-overlay" aria-hidden="true">
                        <div class="video-player-backdrop" id="video-player-backdrop"></div>
                        <div class="video-player-stage">
                            <div class="video-player-frame" id="video-player-frame">
                                <div class="video-player-slot" id="video-player-slot"></div>
                            </div>
                            <button class="video-player-close" id="video-player-close" aria-label="Close video" type="button">
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                </section>

                <section class="contact" id="contact">
                    <div class="contact-header">
                        <span class="section-eyebrow reveal-eyebrow">Contact</span>
                        <h2 class="section-heading reveal-rise">Contact Us</h2>
                        <p class="section-lead reveal-rise-slow">
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
                    <div class="jotform-container reveal-pop" id="contact-form">
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

            ${footer()}
        </div>`
