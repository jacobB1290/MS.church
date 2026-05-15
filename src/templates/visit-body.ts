import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'

// /visit — Plan Your Visit page.
// Sections (in order):
//   1. Intro
//   2. Location: Google Maps embed + Get Directions
//   3. What to Expect: 7-step service flow timeline (incl. breakfast)
//   4. Sunday School (moved here from /outreach)
//   5. Contact CTA
//
// Inherits subpage-header + subpage-spacer + scroll-margin-top from the
// shared design system. JSON-LD references the existing church entity.

const VIDEO_PLACEHOLDER_SVG =`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>`

// 7-step Sunday flow. Edit copy here, not in CSS.
const SERVICE_FLOW = [
  { title: 'Welcome', body: 'A brief intro from the front: who we are, what is happening this morning, and a moment to settle in. No pressure — just glad you came.' },
  { title: 'Two Worship Songs', body: 'Live worship led by our team. Sing along if you want, listen if you want. Lyrics are on the screen.' },
  { title: 'Greet One Another', body: 'A few minutes to turn around, say hi to the people next to you, and meet someone new before we sit back down.' },
  { title: 'Teaching', body: 'A sermon from one of our pastors or a discussion-style lesson — we rotate. Either way it stays grounded in scripture and runs about 25–30 minutes.' },
  { title: 'Closing Song', body: 'One more worship song to send us out.' },
  { title: 'Dismissal', body: 'Pastor closes us in prayer — a final blessing before we head into fellowship.' },
  { title: 'Stay for Breakfast', body: "Right after the closing prayer we head into fellowship time with free breakfast for everyone — guests, members, neighbors, anyone passing through. It's how we end every Sunday: full plates, full hearts, no rush. Free transportation from select shelters available for anyone who needs a ride." },
]

const flowItems = SERVICE_FLOW.map(
  (s) => `<li>
                                    <div class="service-flow-step" aria-hidden="true"></div>
                                    <div class="service-flow-text">
                                        <h3>${s.title}</h3>
                                        <p>${s.body}</p>
                                    </div>
                                </li>`,
).join('\n                                ')

const GOOGLE_DIRECTIONS = 'https://www.google.com/maps/dir/?api=1&destination=3080+Wildwood+St+Boise+ID+83713'
const APPLE_DIRECTIONS = 'https://maps.apple.com/?daddr=3080+Wildwood+St,Boise,ID+83713'
// Search-style embed — no API key needed.
const MAP_EMBED = 'https://www.google.com/maps?q=3080+Wildwood+St,Boise,ID+83713&z=15&output=embed'

export const visitBody = (): string => `
    <body>
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main>
                <section id="visit-intro">
                    <span class="section-eyebrow">Plan Your Visit</span>
                    <h1 class="section-heading">We can't wait to meet you.</h1>
                    <p class="section-lead">Here's everything you need to know before Sunday &mdash; where we are, what an hour at Morning Star looks like, and what happens after the closing song.</p>
                    <div class="handshake" role="img" aria-label="Two hands meeting in a handshake.">
                        <svg viewBox="0 38 254 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                            <!-- Clean line-art handshake. The path traces the
                                 entire illustration as one outline (sleeves,
                                 arms, hands, thumbs, fingers). Stroked rather
                                 than filled so it reads as an editorial line
                                 drawing matching the site's other stroke-heavy
                                 graphics. -->
                            <g class="handshake-art" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <g transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                                    <path class="handshake-stroke" d="M 89.689 16.621 c -0.198 -0.188 -0.461 -0.284 -0.739 -0.274 c -6.479 0.321 -13.518 1.398 -22.148 3.389 c -0.271 0.063 -0.504 0.235 -0.643 0.476 c -0.139 0.241 -0.17 0.529 -0.088 0.794 l 0.838 2.704 c -6.363 -2.413 -15.313 -3.802 -23.06 -3.497 c -2.84 0 -6.082 1.409 -9.045 3.5 H 23.089 l 0.839 -2.708 c 0.083 -0.266 0.05 -0.553 -0.088 -0.794 c -0.138 -0.241 -0.371 -0.414 -0.642 -0.476 c -8.63 -1.991 -15.668 -3.068 -22.148 -3.389 c -0.269 -0.012 -0.54 0.085 -0.739 0.274 C 0.112 16.81 0 17.072 0 17.346 v 34.342 c 0 0.553 0.448 1 1 1 h 12.378 c 0.438 0 0.826 -0.285 0.955 -0.704 l 0.472 -1.523 c 10.187 11.872 20.546 22.775 28.634 22.775 c 1.557 0 3.029 -0.411 4.401 -1.29 l 0.211 0.214 c 0.944 0.956 2.209 1.487 3.561 1.495 c 0.011 0 0.021 0 0.032 0 c 1.339 0 2.597 -0.515 3.546 -1.451 c 0.834 -0.825 1.299 -1.873 1.436 -2.956 c 0.93 0.771 2.061 1.18 3.206 1.18 c 1.281 -0.001 2.564 -0.484 3.547 -1.454 c 1.109 -1.096 1.58 -2.581 1.456 -4.025 c 0.446 0.11 0.897 0.185 1.35 0.185 c 1.283 0 2.538 -0.443 3.448 -1.342 c 0.956 -0.944 1.487 -2.209 1.495 -3.561 s -0.507 -2.622 -1.387 -3.507 c -0.368 -0.453 -0.748 -0.888 -1.121 -1.334 l 6.816 -4.149 l 0.23 0.742 c 0.13 0.419 0.517 0.704 0.955 0.704 H 89 c 0.553 0 1 -0.447 1 -1 V 17.346 C 90 17.072 89.888 16.81 89.689 16.621 z M 12.641 50.688 H 2 V 18.403 c 5.806 0.359 12.122 1.335 19.699 3.043 L 12.641 50.688 z M 68.227 62.368 c -1.139 1.126 -3.31 1.005 -4.556 -0.258 c -0.017 -0.017 -0.039 -0.023 -0.057 -0.038 c -0.067 -0.077 -0.118 -0.163 -0.191 -0.237 l -10.95 -11.086 c -0.39 -0.392 -1.021 -0.396 -1.415 -0.009 c -0.393 0.389 -0.396 1.021 -0.009 1.415 l 10.95 11.086 c 0.569 0.575 0.88 1.343 0.875 2.16 c -0.005 0.816 -0.325 1.58 -0.901 2.148 c -1.195 1.183 -3.128 1.168 -4.31 -0.026 l -2.425 -2.455 c -0.002 -0.002 -0.003 -0.004 -0.004 -0.005 l -10.95 -11.085 c -0.389 -0.391 -1.022 -0.396 -1.414 -0.009 c -0.393 0.389 -0.397 1.021 -0.009 1.415 L 53.81 66.47 c 1.182 1.195 1.17 3.129 -0.026 4.31 c -1.196 1.182 -3.13 1.168 -4.31 -0.026 l -13.38 -13.545 c -0.389 -0.392 -1.022 -0.398 -1.414 -0.008 c -0.393 0.388 -0.397 1.021 -0.009 1.414 l 11.711 11.855 c -7.435 3.974 -19.75 -9.239 -30.877 -22.268 l 6.965 -22.487 h 9.815 c -2.741 2.432 -5.001 5.336 -6.092 7.983 c -1.396 3.386 -0.487 5.29 0.521 6.291 c 0.026 0.026 0.054 0.051 0.083 0.074 c 3.843 3.047 7.628 3.815 13.523 -2.283 c 2.001 0.122 3.705 -0.225 5.184 -1.064 c 8.306 5.807 15.937 12.961 22.749 21.343 C 69.435 59.254 69.423 61.188 68.227 62.368 z M 67.318 53.842 c -6.406 -7.41 -13.527 -13.843 -21.216 -19.146 c -0.341 -0.236 -0.793 -0.236 -1.134 -0.001 c -1.322 0.907 -2.939 1.251 -4.944 1.055 c -0.311 -0.034 -0.614 0.084 -0.827 0.31 c -5.585 5.943 -8.344 4.656 -11.109 2.473 c -0.996 -1.039 -0.577 -2.784 -0.046 -4.073 c 2.224 -5.398 10.113 -12.246 15.846 -12.247 c 8.172 -0.313 17.649 1.276 23.786 3.967 l 7.152 23.091 L 67.318 53.842 z M 88 50.688 H 77.358 l -9.058 -29.242 c 7.577 -1.708 13.894 -2.684 19.699 -3.043 V 50.688 z"/>
                                </g>
                            </g>
                        </svg>
                    </div>
                </section>

                <section id="location">
                    <span class="section-eyebrow">Find Us</span>
                    <h2 class="section-heading">3080 Wildwood St · Boise, Idaho</h2>
                    <div class="section-card visit-map-card">
                        <div class="visit-map-frame">
                            <iframe class="visit-map" src="${MAP_EMBED}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map of Morning Star Christian Church at 3080 Wildwood St, Boise, Idaho"></iframe>
                        </div>
                        <div class="visit-actions">
                            <a class="event-link-btn visit-cta-primary" href="${GOOGLE_DIRECTIONS}" target="_blank" rel="noopener">Get Directions</a>
                            <a class="event-link-btn event-link-btn-secondary visit-cta-secondary" href="${APPLE_DIRECTIONS}" target="_blank" rel="noopener">Open in Apple Maps</a>
                        </div>
                    </div>
                </section>

                <section id="what-to-expect">
                    <span class="section-eyebrow">What to Expect</span>
                    <h2 class="section-heading">A Sunday at Morning Star runs about an hour.</h2>
                    <p class="section-lead">Same flow every week, so you know what's coming.</p>
                    <div class="section-card">
                        <ol class="service-flow">
                                ${flowItems}
                        </ol>
                    </div>
                </section>

                <section id="sunday-school">
                    <span class="section-eyebrow">Sunday School</span>
                    <h2 class="section-heading">Sundays &middot; During the 9 AM service</h2>
                    <div class="sunday-school-content">
                        <div class="vertical-video-frame sunday-school-video" id="sunday-school-video">
                            <div class="vertical-video-placeholder" aria-hidden="true">${VIDEO_PLACEHOLDER_SVG}</div>
                            <button class="video-unmute-btn visible" id="sunday-school-unmute" type="button" aria-label="Unmute video">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                    <line x1="23" y1="9" x2="17" y2="15"></line>
                                    <line x1="17" y1="9" x2="23" y2="15"></line>
                                </svg>
                                Tap to unmute
                            </button>
                        </div>
                        <div class="sunday-school-text">
                            <p>Children's Sunday School runs in a separate room during the main service, so families can worship together and kids can dive into scripture at their level. Safe, warm, and joyful — drop-off is welcome any Sunday.</p>
                            <dl class="sunday-school-facts">
                                <div><dt>When</dt><dd>During the 9 AM service</dd></div>
                                <div><dt>Focus</dt><dd>Gospel-centered, Bible storyline</dd></div>
                                <div><dt>Drop-in</dt><dd>Welcome any Sunday &mdash; no signup</dd></div>
                            </dl>
                            <a href="/#contact" class="sunday-school-link">Ask about Sunday School &rarr;</a>
                        </div>
                    </div>
                </section>

                <section id="visit-cta">
                    <span class="section-eyebrow">Questions?</span>
                    <h2 class="section-heading">We'd love to hear from you before Sunday.</h2>
                    <div class="section-card visit-final-cta">
                        <p class="section-lead">Curious about what to wear, where to park, whether your kids will be okay, or anything else? Reach out and we'll get you everything you need.</p>
                        <a class="event-link-btn teaser-cta" href="/#contact">Contact Us</a>
                    </div>
                </section>
            </main>

            ${footer()}
        </div>
        <script>
            (function() {
                // Sunday School vertical-video controls (mirrored from outreach-body).
                var frame = document.getElementById('sunday-school-video');
                var unmuteBtn = document.getElementById('sunday-school-unmute');
                if (!frame) return;
                var videoEl = frame.querySelector('video');
                if (unmuteBtn) {
                    unmuteBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        if (videoEl) {
                            videoEl.muted = false;
                            try { videoEl.play(); } catch (err) {}
                        }
                        unmuteBtn.classList.add('hiding');
                        unmuteBtn.classList.remove('visible');
                        setTimeout(function() {
                            if (unmuteBtn.parentNode) unmuteBtn.parentNode.removeChild(unmuteBtn);
                        }, 320);
                    });
                }
                frame.addEventListener('click', function() {
                    if (!videoEl) return;
                    var req = videoEl.requestFullscreen
                        || videoEl.webkitRequestFullscreen
                        || videoEl.webkitEnterFullscreen
                        || videoEl.msRequestFullscreen;
                    if (req) {
                        try { req.call(videoEl); } catch (err) {}
                    }
                });
            })();
        </script>
    </body>`
