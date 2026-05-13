import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'

// /visit — Plan Your Visit page.
// Sections (in order):
//   1. Intro
//   2. Location: Google Maps embed + Get Directions
//   3. What to Expect: 6-step service flow timeline
//   4. Sunday School (moved here from /outreach)
//   5. After Service: fellowship + breakfast
//   6. Contact CTA
//
// Inherits subpage-header + subpage-spacer + scroll-margin-top from the
// shared design system. JSON-LD references the existing church entity.

const PLACEHOLDER_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`
const VIDEO_PLACEHOLDER_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>`

// 6-step Sunday flow. Edit copy here, not in CSS.
const SERVICE_FLOW = [
  { title: 'Welcome', body: 'A brief intro from the front: who we are, what is happening this morning, and a moment to settle in. No pressure — just glad you came.' },
  { title: 'Two Worship Songs', body: 'Live worship led by our team. Sing along if you want, listen if you want. Lyrics are on the screen.' },
  { title: 'Greet One Another', body: 'A few minutes to turn around, say hi to the people next to you, and meet someone new before we sit back down.' },
  { title: 'Teaching', body: 'A sermon from one of our pastors or a discussion-style lesson — we rotate. Either way it stays grounded in scripture and runs about 25–30 minutes.' },
  { title: 'Closing Song', body: 'One more worship song to send us out.' },
  { title: 'Dismissal', body: 'Pastor closes us in prayer. Breakfast is set up in the back — stay as long as you like.' },
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
                    <p class="section-lead">Here's everything you need to know before Sunday — where we are, what an hour at Morning Star looks like, and what happens after the closing song.</p>
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
                    <h2 class="section-heading">Sundays · During the 9 AM service</h2>
                    <div class="section-card section-card-video">
                        <div class="vertical-video-frame" id="sunday-school-video">
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
                        <div class="section-card-text">
                            <p>Children's Sunday School runs in a separate room during the main service, so families can worship together and kids can dive into scripture at their level. The curriculum focuses on the gospel, the Bible's storyline, and what it means to follow Jesus. Safe, warm, and joyful — drop-off is welcome any Sunday.</p>
                            <p><a href="/#contact" class="section-card-link">Ask about Sunday School &rarr;</a></p>
                        </div>
                    </div>
                </section>

                <section id="after-service">
                    <span class="section-eyebrow">After Service</span>
                    <h2 class="section-heading">Stay for breakfast.</h2>
                    <div class="section-card">
                        <div class="schedule-item long-content">
                            <div class="schedule-item-text">
                                <p>Right after the closing song we head into a fellowship time with free breakfast for everyone — guests, members, neighbors, anyone passing through. It's how we end every Sunday: full plates, full hearts, no rush. We also offer free transportation from select shelters for anyone who needs a ride.</p>
                            </div>
                            <div class="schedule-item-image schedule-item-image-placeholder" aria-hidden="true">${PLACEHOLDER_SVG}</div>
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
