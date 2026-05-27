// HTML body sections for the home page.
// The <style> block lives in home-styles.ts (imported via home-head.ts).
// The <script> block lives in home-scripts.ts.
// Event images use loading="lazy" since they are below the fold.
// The hero church-building image is above the fold — no lazy loading.

import { nav } from './shared/nav.js'
import { footer } from './shared/footer.js'
import { WEDNESDAY_ENABLED } from '../config.js'

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
                    <h1 class="sr-only">Morning Star Christian Church · A Welcoming Christian Church in Boise, Idaho</h1>
                    <p class="hero-tagline">Mending the Broken.</p>
                    <div class="hero-body">
                        <p class="hero-service-time">Join us Sundays at 9 AM</p>
                        <div class="hero-image" role="img" aria-label="Morning Star Christian Church building exterior at 3080 Wildwood Street, Boise, Idaho. A welcoming Bible-believing nondenominational church.">
                            <!-- The visible church photo is the CSS background-image
                                 on .hero (desktop: church-building, mobile: hero-mobile).
                                 image-set() picks AVIF / WebP / JPG by browser support
                                 — no <img> here, so the format the user can't see
                                 isn't downloaded. The aria-label preserves the alt
                                 text for screen readers. -->
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
                                    <span>Copy</span>
                                </button>
                            </div>
                        </div>
                    </address>
                    <!-- Schedule layout: banner image carousel on the left, vertical
                         card list on the right (desktop). On mobile, banner is hidden
                         and the cards stack as a plain list. No .section-card wrapper —
                         the layout sits directly on the page background like the About
                         teaser, for a quieter editorial feel. -->
                    <div class="schedule-layout${WEDNESDAY_ENABLED ? '' : ' schedule-layout--no-wed'}">
                        <div class="schedule-banner reveal-power" id="schedule-banner" aria-live="polite">
                            <div class="schedule-banner-slide active" data-index="0">
                                <picture>
                                    <source srcset="/static/schedule-sunday.avif" type="image/avif">
                                    <source srcset="/static/schedule-sunday.webp" type="image/webp">
                                    <img src="/static/schedule-sunday.jpg" alt="A worship leader singing during Sunday morning service at Morning Star Christian Church in Boise" width="880" height="1100" loading="lazy" decoding="async" style="object-position: 50% 30%;">
                                </picture>
                            </div>
                            <div class="schedule-banner-slide" data-index="1">
                                <picture>
                                    <source srcset="/static/schedule-tuesday.avif" type="image/avif">
                                    <source srcset="/static/schedule-tuesday.webp" type="image/webp">
                                    <img src="/static/schedule-tuesday.jpg" alt="An open Bible and a cup of coffee at a Boise coffee shop during Morning Star's Tuesday morning Bible reading" width="860" height="1528" loading="lazy" decoding="async" style="object-position: 50% 56%;">
                                </picture>
                            </div>
                            ${WEDNESDAY_ENABLED ? `<div class="schedule-banner-slide schedule-banner-placeholder" data-index="2" role="img" aria-label="Wednesday Activity Day">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                            </div>` : ''}
                            <div class="schedule-banner-slide" data-index="3">
                                <picture>
                                    <source srcset="/static/schedule-thursday.avif" type="image/avif">
                                    <source srcset="/static/schedule-thursday.webp" type="image/webp">
                                    <img src="/static/schedule-thursday.jpg" alt="An open Bible, a cup of coffee, and a notebook on a wooden table set for Morning Star Christian Church's Thursday evening Bible study in Boise" width="880" height="1100" loading="lazy" decoding="async" style="object-position: 50% 55%;">
                                </picture>
                            </div>
                            <div class="schedule-banner-slide" data-index="4">
                                <picture>
                                    <source srcset="/static/schedule-friday.avif" type="image/avif">
                                    <source srcset="/static/schedule-friday.webp" type="image/webp">
                                    <img src="/static/schedule-friday.jpg" alt="A young woman holding her Bible before Friday youth service at Morning Star Christian Church in Boise" width="716" height="1273" loading="lazy" decoding="async" style="object-position: 50% 30%;">
                                </picture>
                            </div>
                        </div>
                        <div class="schedule-list" role="tablist" aria-label="Weekly gatherings, with links into the Ministries page" data-reveal-group data-reveal-delay="80">
                            <button class="schedule-tab active" data-index="0" type="button" role="tab" aria-selected="true" data-reveal-sync>
                                <span class="schedule-tab-eyebrow reveal-eyebrow">Worship</span>
                                <span class="schedule-tab-title reveal-rise">Sundays · 9:00 AM</span>
                                <span class="schedule-tab-desc reveal-tight">Morning service, about an hour, with <a href="/ministries#kids" class="schedule-tab-link">Sunday School</a> for kids and free community breakfast after. Free transportation from select shelters included.</span>
                                <a href="/ministries#worship" class="schedule-tab-cta">Learn more →</a>
                            </button>
                            <button class="schedule-tab" data-index="1" type="button" role="tab" aria-selected="false" data-reveal-sync>
                                <span class="schedule-tab-eyebrow reveal-eyebrow">Discipleship</span>
                                <span class="schedule-tab-title reveal-rise">Tuesdays · 8:30 AM</span>
                                <span class="schedule-tab-desc reveal-tight">Bible Reading at <a href="https://maps.app.goo.gl/XkJR5aLy36VVD3356?g_st=ic" target="_blank" rel="noopener noreferrer" class="schedule-tab-link">Caffeina State Street</a>.</span>
                                <a href="/ministries#discipleship" class="schedule-tab-cta">Learn more →</a>
                            </button>
                            ${WEDNESDAY_ENABLED ? `<button class="schedule-tab" data-index="2" type="button" role="tab" aria-selected="false" data-reveal-sync>
                                <span class="schedule-tab-eyebrow reveal-eyebrow">Fellowship</span>
                                <span class="schedule-tab-title reveal-rise">Wednesdays · 6:00 PM</span>
                                <span class="schedule-tab-desc reveal-tight">Activity Day: open gym and crochet circle. About 3 hours.</span>
                                <a href="/ministries#fellowship" class="schedule-tab-cta">Learn more →</a>
                            </button>` : ''}
                            <button class="schedule-tab" data-index="3" type="button" role="tab" aria-selected="false" data-reveal-sync>
                                <span class="schedule-tab-eyebrow reveal-eyebrow">Discipleship</span>
                                <span class="schedule-tab-title reveal-rise">Thursdays · 6:00 PM</span>
                                <span class="schedule-tab-desc reveal-tight">A 45-minute evening Bible study at the church with free coffee.</span>
                                <a href="/ministries#discipleship" class="schedule-tab-cta">Learn more →</a>
                            </button>
                            <button class="schedule-tab" data-index="4" type="button" role="tab" aria-selected="false" data-reveal-sync>
                                <span class="schedule-tab-eyebrow reveal-eyebrow">Youth</span>
                                <span class="schedule-tab-title reveal-rise">Fridays · 7:00 PM</span>
                                <span class="schedule-tab-desc reveal-tight">Worship, teaching, and fellowship for high schoolers and older. About an hour.</span>
                                <a href="/ministries#youth" class="schedule-tab-cta">Learn more →</a>
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
                                <source srcset="/static/who-we-are.avif?v=3" type="image/avif">
                                <source srcset="/static/who-we-are.webp?v=3" type="image/webp">
                                <img src="/static/who-we-are.jpg?v=3" alt="Two members of Morning Star Christian Church greeting and welcoming each other in the sanctuary" width="1200" height="675" loading="lazy" decoding="async">
                            </picture>
                        </div>
                        <div class="about-text">
                            <p class="about-paragraph reveal-rise-slow">Morning Star is a small, Bible-believing community where every story, every age, and every burden is met with grace and a seat at the table. We confess Jesus Christ as Lord and Savior, teach the whole counsel of Scripture, and exist to mend the broken through faith, family, and serving the city we love.</p>
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
                                    <p>Year-round open-door gatherings: Friendsgiving, holidays, and city-wide outreach.</p>
                                    <span class="teaser-more">Learn more <span class="teaser-more-arrow" aria-hidden="true">&rarr;</span></span>
                                </div>
                                <div class="schedule-item-image">
                                    <picture>
                                        <source srcset="/static/community-events.avif?v=3" type="image/avif">
                                        <source srcset="/static/community-events.webp?v=3" type="image/webp">
                                        <img src="/static/community-events.jpg?v=3" alt="Three young boys with arms around each other at a Morning Star Christian Church community outreach event in a Boise park, summer afternoon" width="1000" height="1333" loading="lazy" decoding="async" style="object-position: 50% 30%;">
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
                                        <source media="(min-width: 961px)" srcset="/static/cooking-ministry-desktop.avif?v=4" type="image/avif">
                                        <source media="(min-width: 961px)" srcset="/static/cooking-ministry-desktop.webp?v=4" type="image/webp">
                                        <source media="(min-width: 961px)" srcset="/static/cooking-ministry-desktop.jpg?v=4">
                                        <source srcset="/static/cooking-ministry.avif?v=3" type="image/avif">
                                        <source srcset="/static/cooking-ministry.webp?v=3" type="image/webp">
                                        <img src="/static/cooking-ministry.jpg?v=3" alt="Morning Star Christian Church volunteer preparing fresh vegetables for the Boise homeless-shelter cooking ministry and Sunday community breakfast" width="1000" height="1333" loading="lazy" decoding="async" style="object-position: 0% 50%;">
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
                                <div class="schedule-item-image">
                                    <picture>
                                        <source srcset="/static/community-breakfast.avif?v=3" type="image/avif">
                                        <source srcset="/static/community-breakfast.webp?v=3" type="image/webp">
                                        <img src="/static/community-breakfast.jpg?v=3" alt="Morning Star Christian Church members serving themselves breakfast from the table after the Sunday service in Boise, Idaho" width="1000" height="1502" loading="lazy" decoding="async" style="object-position: 50% 22%;">
                                    </picture>
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
                                                     alt="Latest Sunday worship service from Morning Star Christian Church in Boise, Idaho. Live-streamed and archived on our YouTube channel."
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
                            We&rsquo;d love to hear from you. Whether it&rsquo;s a question, a prayer request, or simply hello, send us a note and someone from our team will be in touch.
                        </p>
                    </div>
                    <div class="contact-form-col">
                        <div class="contact-form-card reveal-pop" id="contact-form">
                            <p class="form-progress" id="cf-progress" aria-live="polite">Step <span id="cf-step-num">1</span> of 2 &middot; <span id="cf-step-label">Your note</span></p>
                            <form class="contact-form" id="contact-form-el" novalidate>
                                <div class="form-step" data-step="1" id="cf-step-1">
                                    <div class="form-group form-group-full">
                                        <label for="cf-message">What&rsquo;s on your heart?</label>
                                        <textarea id="cf-message" name="message" rows="5" placeholder="Share a question, a prayer request, or just say hello." required aria-required="true"></textarea>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="cf-first">First name</label>
                                            <input type="text" id="cf-first" name="firstName" autocomplete="given-name" required aria-required="true">
                                        </div>
                                        <div class="form-group">
                                            <label for="cf-last">Last name</label>
                                            <input type="text" id="cf-last" name="lastName" autocomplete="family-name" required aria-required="true">
                                        </div>
                                    </div>
                                    <p class="form-error" id="cf-error-1" role="alert" aria-live="assertive" hidden></p>
                                    <button type="button" class="event-link-btn btn-submit" id="cf-next">Continue</button>
                                </div>

                                <div class="form-step" data-step="2" id="cf-step-2" hidden>
                                    <fieldset class="form-fieldset">
                                        <legend class="form-legend">How can we reach you?</legend>
                                        <p class="form-hint" id="cf-reach-hint">Add your phone number and email so we can reply.</p>
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="cf-phone">Phone number</label>
                                                <input type="tel" id="cf-phone" name="phone" autocomplete="tel" placeholder="(208) 000-0000" aria-describedby="cf-reach-hint" required aria-required="true">
                                            </div>
                                            <div class="form-group">
                                                <label for="cf-email">Email address</label>
                                                <input type="email" id="cf-email" name="email" autocomplete="email" placeholder="you@example.com" aria-describedby="cf-reach-hint" required aria-required="true">
                                            </div>
                                        </div>
                                    </fieldset>
                                    <label class="form-check form-check--subtle">
                                        <input type="checkbox" name="updatesOptIn" id="cf-updates">
                                        <span>Send me occasional church updates by email or text <span class="form-optional">(optional)</span>. Msg &amp; data rates may apply; reply STOP to opt out, HELP for help.</span>
                                    </label>
                                    <p class="form-error" id="cf-error" role="alert" aria-live="assertive" hidden></p>
                                    <label class="form-check form-check--terms">
                                        <input type="checkbox" name="termsAccepted" id="cf-terms" required>
                                        <span>I agree to the <a href="/privacy" target="_blank" rel="noopener">terms &amp; conditions</a>.</span>
                                    </label>
                                    <div class="form-actions">
                                        <button type="button" class="form-back" id="cf-back">&larr; Back</button>
                                        <button type="submit" class="event-link-btn btn-submit" id="cf-submit">Send message</button>
                                    </div>
                                    <p class="form-reassure">A real person on our team reads every note.</p>
                                </div>
                            </form>
                        </div>
                        <div class="form-success" id="contact-success" style="display: none;">
                            <div class="success-icon">🕊️</div>
                            <h3 class="success-heading">Thank you</h3>
                            <p class="success-message">Thanks for reaching out. Someone from our team will be in touch soon.</p>
                        </div>
                    </div>
                </section>
            </main>

            ${footer()}
        </div>`
