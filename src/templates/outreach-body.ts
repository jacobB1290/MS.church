import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'

// /outreach — Ministries hub + events.
// Uses standardized .section-eyebrow / .section-heading / .section-card /
// .schedule-item / .event-link-btn classes — no bespoke styles.
// The events carousel + past-events modal are migrated from home; the
// Google Calendar JS lives in home-scripts.ts (still bundled on this page).
// Section order: intro → events (top of fold) → ministries → past-events modal.

const PLACEHOLDER_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`
const VIDEO_PLACEHOLDER_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>`

export const outreachBody = (): string => `
    <body>
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main>
                <section id="outreach-intro">
                    <span class="section-eyebrow">Outreach</span>
                    <h1 class="section-heading">How We Serve Boise</h1>
                    <p class="section-lead">Faith without works is dead. Here's how Morning Star puts love into action — through weekly ministries, monthly community service, and seasonal events open to anyone in the city.</p>
                </section>

                <section class="outreach" id="events">
                    <span class="section-eyebrow">Events</span>
                    <h2 class="section-heading">Upcoming &amp; Past Events</h2>
                    <p class="section-lead">Year-round, Morning Star hosts open-door gatherings designed to feed people, build friendships, and welcome the city — from Friendsgiving in the fall to community-wide events around major holidays. Browse what's coming up next, or scroll back through past gatherings.</p>

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

                <section id="sunday-school">
                    <span class="section-eyebrow">Sunday School</span>
                    <h2 class="section-heading">Sundays · During the 9 AM service</h2>
                    <div class="section-card section-card-video">
                        <div class="vertical-video-frame" id="sunday-school-video">
                            <div class="vertical-video-placeholder" aria-hidden="true">${VIDEO_PLACEHOLDER_SVG}</div>
                            <!-- When real footage is dropped in, replace the placeholder above with:
                                 <video autoplay muted loop playsinline preload="metadata" poster="...">
                                     <source src="/static/sunday-school.mp4" type="video/mp4">
                                 </video>
                                 The .video-unmute-btn below mirrors the watch section pattern. -->
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
                            <p>Children's Sunday School runs during the main service so families can worship together and kids can dive into scripture at their level. Curriculum focuses on the gospel, the Bible's storyline, and what it means to follow Jesus. Safe, warm, and joyful — drop-off is welcome any Sunday.</p>
                            <p><a href="/#contact" class="section-card-link">Ask about Sunday School &rarr;</a></p>
                        </div>
                    </div>
                </section>

                <section id="cooking-ministry">
                    <span class="section-eyebrow">Cooking Ministry</span>
                    <h2 class="section-heading">Monthly · Boise homeless shelters</h2>
                    <div class="section-card">
                        <div class="schedule-item long-content">
                            <div class="schedule-item-text">
                                <p>Once a month, a team from Morning Star cooks and serves a full hot meal at local homeless shelters in Boise. It's hands-on, it's humble, and it's one of the most concrete ways we live "mending the broken." No experience required — only willing hands.</p>
                                <p style="margin-top: 14px;"><a href="/#contact" style="color: var(--gold); font-weight: 600;">Join the next cook →</a></p>
                            </div>
                            <div class="schedule-item-image schedule-item-image-placeholder" aria-hidden="true">${PLACEHOLDER_SVG}</div>
                        </div>
                    </div>
                </section>

                <section id="community-breakfast">
                    <span class="section-eyebrow">Community Breakfast</span>
                    <h2 class="section-heading">Every Sunday · After service</h2>
                    <div class="section-card">
                        <div class="schedule-item long-content">
                            <div class="schedule-item-text">
                                <p>Every Sunday morning after worship, breakfast is on us — for guests, members, neighbors, and anyone passing through. We also offer free transportation from select Boise shelters so the table is open to people who need it most.</p>
                                <p style="margin-top: 14px;"><a href="/#schedule" style="color: var(--gold); font-weight: 600;">See the full schedule →</a></p>
                            </div>
                            <div class="schedule-item-image schedule-item-image-placeholder" aria-hidden="true">${PLACEHOLDER_SVG}</div>
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
            </main>

            ${footer()}
        </div>
        <script>
            (function() {
                // Sunday School vertical-video controls.
                // Mirrors the watch section pattern: unmute button overlays the
                // muted-autoplay video; tap hides the button and unmutes (when a
                // real <video> is present). Tap on the frame itself requests
                // fullscreen.
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
                            if (unmuteBtn.parentNode) {
                                unmuteBtn.parentNode.removeChild(unmuteBtn);
                            }
                        }, 320);
                    });
                }

                // Tap the frame itself → fullscreen the video element (when present).
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
