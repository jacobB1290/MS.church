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
                            <!-- Plan a Visit button — links to the /visit page (map + service flow + Sunday School + after-service) -->
                            <div class="find-us-wrapper">
                                <a class="find-us-btn find-us-link" href="/visit">Plan a Visit</a>
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
                    <span class="section-eyebrow reveal">Weekly Schedule</span>
                    <h2 class="section-heading reveal">Sunday Worship, Bible Study & Fellowship in Boise</h2>
                    <address class="reveal">
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
                         card list on the right (desktop). On mobile, banner sits on top
                         and cards stack below. Clicking a card crossfades the banner to
                         that card's image and marks the card active. Auto-cycles every
                         6s, pauses on hover/focus, respects prefers-reduced-motion. -->
                    <div class="section-card schedule-card">
                        <div class="schedule-layout">
                            <div class="schedule-banner reveal-scale" id="schedule-banner" aria-live="polite">
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
                            <div class="schedule-list" role="tablist" aria-label="Weekly gatherings" data-reveal-group data-reveal-delay="80">
                                <button class="schedule-tab active reveal" data-index="0" type="button" role="tab" aria-selected="true">
                                    <span class="schedule-tab-eyebrow">Sunday Gatherings</span>
                                    <span class="schedule-tab-title">Sundays · 9:00 AM</span>
                                    <span class="schedule-tab-desc">Morning service, about an hour, with free community breakfast after. Free transportation from select shelters included. <a href="/visit#sunday-school" class="schedule-tab-link">Sunday School info →</a></span>
                                </button>
                                <button class="schedule-tab reveal" data-index="1" type="button" role="tab" aria-selected="false">
                                    <span class="schedule-tab-eyebrow">Bible Reading</span>
                                    <span class="schedule-tab-title">Tuesdays · 8:30 AM</span>
                                    <span class="schedule-tab-desc">Tuesday Bible Reading at <a href="https://maps.app.goo.gl/XkJR5aLy36VVD3356?g_st=ic" target="_blank" rel="noopener noreferrer" class="schedule-tab-link">Caffiena State Street</a>.</span>
                                </button>
                                <button class="schedule-tab reveal" data-index="2" type="button" role="tab" aria-selected="false">
                                    <span class="schedule-tab-eyebrow">Activity Day</span>
                                    <span class="schedule-tab-title">Wednesdays · 6:00 PM</span>
                                    <span class="schedule-tab-desc">Open gym for basketball and volleyball, plus a crochet circle to learn the craft and grow your skills — about three hours.</span>
                                </button>
                                <button class="schedule-tab reveal" data-index="3" type="button" role="tab" aria-selected="false">
                                    <span class="schedule-tab-eyebrow">Bible Study</span>
                                    <span class="schedule-tab-title">Thursdays · 6:00 PM</span>
                                    <span class="schedule-tab-desc">A 45-minute evening Bible study at the church with free coffee.</span>
                                </button>
                                <button class="schedule-tab reveal" data-index="4" type="button" role="tab" aria-selected="false">
                                    <span class="schedule-tab-eyebrow">Youth Service</span>
                                    <span class="schedule-tab-title">Fridays · 7:00 PM</span>
                                    <span class="schedule-tab-desc">Worship, teaching, and fellowship for our next generation — about an hour.</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- About teaser — same nested-card pattern as the Outreach teaser:
                     outer .section-card wraps a single .schedule-item, with the CTA
                     centered at the bottom of the outer card. -->
                <section id="about">
                    <span class="section-eyebrow reveal">About Us</span>
                    <h2 class="section-heading reveal">A welcoming church in the heart of Boise.</h2>
                    <div class="section-card">
                        <div class="schedule-item long-content" data-reveal-group data-reveal-delay="140">
                            <div class="schedule-item-image schedule-item-image-placeholder reveal-scale" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                            </div>
                            <div class="schedule-item-text reveal">
                                <p>Morning Star is a small, nondenominational community where every story, every age, and every burden is met with grace and a seat at the table. We exist to point people to Jesus and to mend the broken — through faith, family, and serving the city we love.</p>
                            </div>
                        </div>
                        <div class="teaser-cta-row reveal">
                            <a class="event-link-btn teaser-cta" href="/about">Learn More About Us</a>
                        </div>
                    </div>
                </section>

                <!-- Outreach teaser — How We Serve cards, routes to /outreach for full hub + events -->
                <section id="outreach">
                    <span class="section-eyebrow reveal">How We Serve</span>
                    <h2 class="section-heading reveal">A few ways we live out our mission in Boise.</h2>
                    <div class="section-card">
                        <div class="schedule-grid" data-reveal-group data-reveal-delay="90">
                            <a class="schedule-item teaser-link-card reveal" href="/outreach#community-breakfast">
                                <div class="schedule-item-text">
                                    <span>Ministry</span>
                                    <h3>Community Breakfast</h3>
                                    <p>Free breakfast every Sunday after the service. Transportation from select shelters included.</p>
                                    <span class="teaser-more">Learn more <span class="teaser-more-arrow" aria-hidden="true">&rarr;</span></span>
                                </div>
                                <div class="schedule-item-image schedule-item-image-placeholder" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                                </div>
                            </a>
                            <a class="schedule-item teaser-link-card reveal" href="/outreach#cooking-ministry">
                                <div class="schedule-item-text">
                                    <span>Ministry</span>
                                    <h3>Cooking Ministry</h3>
                                    <p>Once a month our team cooks and serves hot meals at homeless shelters across Boise.</p>
                                    <span class="teaser-more">Learn more <span class="teaser-more-arrow" aria-hidden="true">&rarr;</span></span>
                                </div>
                                <div class="schedule-item-image schedule-item-image-placeholder" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                                </div>
                            </a>
                            <a class="schedule-item teaser-link-card reveal" href="/outreach#events">
                                <div class="schedule-item-text">
                                    <span>Events</span>
                                    <h3>Community Events</h3>
                                    <p>Year-round open-door gatherings — Friendsgiving, holidays, and city-wide outreach.</p>
                                    <span class="teaser-more">Learn more <span class="teaser-more-arrow" aria-hidden="true">&rarr;</span></span>
                                </div>
                                <div class="schedule-item-image schedule-item-image-placeholder" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                                </div>
                            </a>
                        </div>
                        <div class="teaser-cta-row reveal">
                            <a class="event-link-btn teaser-cta" href="/outreach">Explore Our Outreach</a>
                        </div>
                    </div>
                </section>

                <section class="watch" id="watch">
                    <div class="watch-header">
                        <span class="section-eyebrow reveal">Watch</span>
                        <h2 class="section-heading reveal">Watch Our Sunday Service Live from Boise</h2>
                    </div>
                    <div class="watch-card reveal-scale">
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

                <section class="contact" id="contact">
                    <div class="contact-header">
                        <span class="section-eyebrow reveal">Get In Touch</span>
                        <h2 class="section-heading reveal">Contact Us</h2>
                        <p class="section-lead reveal">
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
                    <div class="jotform-container reveal" id="contact-form">
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
