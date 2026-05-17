import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'

// /outreach — Ministries hub + events.
// Section order: intro → events → meals & hospitality (combined section
// containing Cooking Ministry + Community Breakfast as two parallel
// ministry blocks under one shared banner image) → past-events modal.
// The #cooking-ministry and #community-breakfast IDs live on the
// inner <article> blocks so home-page teaser links continue to scroll
// to the specific ministry.
// Sunday School lives on /visit now (it's a visitor-onboarding concern,
// not a community-service ministry).

const PLACEHOLDER_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`

export const outreachBody = (): string => `
    <body>
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main>
                <section id="outreach-intro">
                    <span class="section-eyebrow">Outreach</span>
                    <h1 class="section-heading">How We Serve Boise</h1>
                    <p class="section-lead">Faith without works is dead. Here's how Morning Star puts love into action — through monthly community service and seasonal events open to anyone in the city.</p>
                    <div class="boise-map" role="img" aria-label="Stylized top-down map of Boise with three outreach locations linked by a moving light trail.">
                        <svg viewBox="0 0 600 340" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                            <defs>
                                <radialGradient id="boisePinHead" cx="32%" cy="28%">
                                    <stop offset="0%" stop-color="#fce7c0"/>
                                    <stop offset="55%" stop-color="#d4a574"/>
                                    <stop offset="100%" stop-color="#7a4f1c"/>
                                </radialGradient>
                                <radialGradient id="boisePinHalo" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stop-color="var(--gold)" stop-opacity="0.55"/>
                                    <stop offset="55%" stop-color="var(--gold)" stop-opacity="0.18"/>
                                    <stop offset="100%" stop-color="var(--gold)" stop-opacity="0"/>
                                </radialGradient>
                                <linearGradient id="boiseRiverGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                                    <stop offset="0%" stop-color="var(--gold)" stop-opacity="0.42"/>
                                    <stop offset="100%" stop-color="var(--gold-dark)" stop-opacity="0.32"/>
                                </linearGradient>
                            </defs>

                            <!-- Foothills (north contour, dashed) -->
                            <path class="boise-foothills" d="M 25 50 Q 105 32, 195 42 Q 285 36, 380 48 Q 470 54, 555 68 Q 580 71, 585 73"/>
                            <!-- A second, fainter foothills line for layered terrain feel -->
                            <path class="boise-foothills boise-foothills-back" d="M 50 38 Q 160 22, 290 30 Q 410 28, 520 40 Q 560 44, 580 48"/>

                            <!-- Street grid — rotated ~10° to suggest Boise's downtown
                                 orientation along the river. Two layers: side streets
                                 (denser, lighter) and arterials (bolder). Intermediate
                                 spacing in the central downtown band gives it density. -->
                            <g class="boise-streets" transform="rotate(-10 300 175)">
                                <!-- Vertical-ish side streets -->
                                <line x1="50"  y1="60" x2="50"  y2="300"/>
                                <line x1="85"  y1="60" x2="85"  y2="300"/>
                                <line x1="120" y1="60" x2="120" y2="300"/>
                                <line x1="155" y1="60" x2="155" y2="300"/>
                                <line x1="195" y1="60" x2="195" y2="300"/>
                                <line x1="225" y1="60" x2="225" y2="300"/>
                                <line x1="255" y1="60" x2="255" y2="300"/>
                                <line x1="290" y1="60" x2="290" y2="300"/>
                                <line x1="320" y1="60" x2="320" y2="300"/>
                                <line x1="350" y1="60" x2="350" y2="300"/>
                                <line x1="385" y1="60" x2="385" y2="300"/>
                                <line x1="420" y1="60" x2="420" y2="300"/>
                                <line x1="455" y1="60" x2="455" y2="300"/>
                                <line x1="490" y1="60" x2="490" y2="300"/>
                                <line x1="525" y1="60" x2="525" y2="300"/>
                                <line x1="560" y1="60" x2="560" y2="300"/>
                                <!-- Horizontal-ish side streets -->
                                <line x1="30" y1="80"  x2="585" y2="80"/>
                                <line x1="30" y1="105" x2="585" y2="105"/>
                                <line x1="30" y1="125" x2="585" y2="125"/>
                                <line x1="30" y1="148" x2="585" y2="148"/>
                                <line x1="30" y1="172" x2="585" y2="172"/>
                                <line x1="30" y1="195" x2="585" y2="195"/>
                                <line x1="30" y1="220" x2="585" y2="220"/>
                                <line x1="30" y1="245" x2="585" y2="245"/>
                                <line x1="30" y1="275" x2="585" y2="275"/>
                            </g>
                            <g class="boise-streets-major" transform="rotate(-10 300 175)">
                                <!-- Arterials (every ~5th street, bolder) -->
                                <line x1="180" y1="55" x2="180" y2="305"/>
                                <line x1="310" y1="55" x2="310" y2="305"/>
                                <line x1="440" y1="55" x2="440" y2="305"/>
                                <line x1="25" y1="138" x2="585" y2="138"/>
                                <line x1="25" y1="210" x2="585" y2="210"/>
                            </g>
                            <!-- Diagonal connectors — break the orthogonal feel,
                                 represent Boise's connector roads angling toward
                                 the river. Drawn outside the rotated group so they
                                 cut across the grid at a different angle. -->
                            <g class="boise-streets-diagonals">
                                <line x1="80"  y1="90"  x2="280" y2="280"/>
                                <line x1="540" y1="90"  x2="340" y2="280"/>
                                <line x1="100" y1="240" x2="500" y2="100"/>
                            </g>

                            <!-- River: stronger NW-to-SE diagonal cutting through
                                 the southern half of the city. Defining feature. -->
                            <path class="boise-river" d="M 20 95 Q 130 145, 240 185 Q 340 218, 430 250 Q 510 275, 585 295"/>
                            <!-- Greenbelt: dashed companion line along the river -->
                            <path class="boise-greenbelt" d="M 20 88 Q 130 138, 240 178 Q 340 211, 430 243 Q 510 268, 585 288"/>

                            <!-- Comet trail: 6 layered paths along the same loop.
                                 Each later layer is thicker / blurrier / dimmer and lags
                                 further behind the head, building a head-bright /
                                 tail-fading streak. The return arc from C->A sweeps
                                 above the foothills and the comet fades out during it,
                                 so visible "outreach delivery" only happens on the
                                 A->B and B->C legs. -->
                            <path class="boise-comet boise-comet-l6" d="M 140 110 Q 215 165, 290 200 Q 380 235, 460 130 Q 320 25, 140 110" pathLength="120"/>
                            <path class="boise-comet boise-comet-l5" d="M 140 110 Q 215 165, 290 200 Q 380 235, 460 130 Q 320 25, 140 110" pathLength="120"/>
                            <path class="boise-comet boise-comet-l4" d="M 140 110 Q 215 165, 290 200 Q 380 235, 460 130 Q 320 25, 140 110" pathLength="120"/>
                            <path class="boise-comet boise-comet-l3" d="M 140 110 Q 215 165, 290 200 Q 380 235, 460 130 Q 320 25, 140 110" pathLength="120"/>
                            <path class="boise-comet boise-comet-l2" d="M 140 110 Q 215 165, 290 200 Q 380 235, 460 130 Q 320 25, 140 110" pathLength="120"/>
                            <path class="boise-comet boise-comet-l1" d="M 140 110 Q 215 165, 290 200 Q 380 235, 460 130 Q 320 25, 140 110" pathLength="120"/>

                            <!-- Pin halos (animated bloom under each pin) -->
                            <circle class="boise-pin-halo boise-pin-halo-a" cx="140" cy="110" r="22" fill="url(#boisePinHalo)"/>
                            <circle class="boise-pin-halo boise-pin-halo-b" cx="290" cy="200" r="22" fill="url(#boisePinHalo)"/>
                            <circle class="boise-pin-halo boise-pin-halo-c" cx="460" cy="130" r="22" fill="url(#boisePinHalo)"/>

                            <!-- Pins: teardrop with gradient + ground shadow + inner indicator.
                                 Outer <g> positions, inner <g> animates the pulse around
                                 the pin tip via transform-origin: 50% 100% (bottom-center
                                 of the pin's bounding box, which is the tip). -->
                            <g transform="translate(140 110)">
                                <g class="boise-pin boise-pin-a">
                                    <ellipse cx="0" cy="3" rx="7" ry="1.8" fill="rgba(26, 26, 46, 0.22)"/>
                                    <path d="M 0 0 C -3 -4, -8 -10, -8 -16 A 8 8 0 1 1 8 -16 C 8 -10, 3 -4, 0 0 Z" fill="url(#boisePinHead)" stroke="#5a3812" stroke-width="0.5" stroke-opacity="0.7"/>
                                    <circle cx="0" cy="-16" r="2.8" fill="#fff8e8" opacity="0.92"/>
                                </g>
                            </g>
                            <g transform="translate(290 200)">
                                <g class="boise-pin boise-pin-b">
                                    <ellipse cx="0" cy="3" rx="7" ry="1.8" fill="rgba(26, 26, 46, 0.22)"/>
                                    <path d="M 0 0 C -3 -4, -8 -10, -8 -16 A 8 8 0 1 1 8 -16 C 8 -10, 3 -4, 0 0 Z" fill="url(#boisePinHead)" stroke="#5a3812" stroke-width="0.5" stroke-opacity="0.7"/>
                                    <circle cx="0" cy="-16" r="2.8" fill="#fff8e8" opacity="0.92"/>
                                </g>
                            </g>
                            <g transform="translate(460 130)">
                                <g class="boise-pin boise-pin-c">
                                    <ellipse cx="0" cy="3" rx="7" ry="1.8" fill="rgba(26, 26, 46, 0.22)"/>
                                    <path d="M 0 0 C -3 -4, -8 -10, -8 -16 A 8 8 0 1 1 8 -16 C 8 -10, 3 -4, 0 0 Z" fill="url(#boisePinHead)" stroke="#5a3812" stroke-width="0.5" stroke-opacity="0.7"/>
                                    <circle cx="0" cy="-16" r="2.8" fill="#fff8e8" opacity="0.92"/>
                                </g>
                            </g>

                            <!-- Map signature -->
                            <text class="boise-map-label" x="582" y="328" text-anchor="end">BOISE</text>
                        </svg>
                    </div>
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

                <section id="meals-hospitality">
                    <span class="section-eyebrow">Meals &amp; Hospitality</span>
                    <h2 class="section-heading">Two tables, one mission.</h2>
                    <div class="ministries-pair">
                        <div class="ministries-image">
                            <img src="/static/meals-hospitality.jpg" alt="Morning Star volunteer team gathered together in the kitchen after preparing meals for Boise homeless shelters" width="1800" height="1350" loading="lazy" decoding="async" style="object-position: 50% 10%;">
                        </div>
                        <div class="ministries-grid">
                            <article class="ministry-block" id="cooking-ministry">
                                <span class="ministry-eyebrow">Cooking Ministry</span>
                                <h3 class="ministry-title">Monthly &middot; Boise homeless shelters</h3>
                                <p class="ministry-text">Once a month, a team from Morning Star cooks and serves a full hot meal at local homeless shelters in Boise. It's hands-on, it's humble, and it's one of the most concrete ways we live "mending the broken." No experience required &mdash; only willing hands.</p>
                                <a href="/#contact" class="ministry-link">Join the next cook &rarr;</a>
                            </article>
                            <article class="ministry-block" id="community-breakfast">
                                <span class="ministry-eyebrow">Community Breakfast</span>
                                <h3 class="ministry-title">Every Sunday &middot; After service</h3>
                                <p class="ministry-text">Every Sunday morning after worship, breakfast is on us &mdash; for guests, members, neighbors, and anyone passing through. We also offer free transportation from select Boise shelters so the table is open to people who need it most.</p>
                                <a href="/visit#what-to-expect" class="ministry-link">More about Sunday morning &rarr;</a>
                            </article>
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
    </body>`
