import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'

// /visit — Plan Your Visit page.
// Sections (in order):
//   1. Intro
//   2. Location: Google Maps embed + Get Directions
//   3. What to Expect: 8-step service flow timeline. Sunday School slots
//      in right after the two worship songs (kids leave for their own
//      classroom at that point) and the step links to /ministries#kids
//      for the full ministry description. The final Breakfast step
//      similarly links to /outreach#meals-hospitality for Community
//      Breakfast detail — canonical depth lives there, not here.
//   4. Before You Come: small set of first-timer reassurances — what to
//      wear (image + text via .ministries-pair), parking, and at-the-door
//      welcome. Editorial style, no boxed cards. The "What to wear" image
//      is currently a placeholder pending a real photo of folks in mixed
//      dress styles.
//   5. Contact CTA
//
// Inherits subpage-header + subpage-spacer + scroll-margin-top from the
// shared design system. JSON-LD references the existing church entity.

// Inline placeholder icon — same rectangle + circle + mountain glyph used
// across /outreach and /ministries for image-pending slots.
const PLACEHOLDER_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`

// Sunday flow. Edit copy here, not in CSS. Sunday School slots in
// right after the two worship songs — that's when kids leave the main
// service for their own classroom — and the step links to
// /ministries#kids for the full description. The final Breakfast step
// likewise links into /outreach#meals-hospitality for Community
// Breakfast detail.
const SERVICE_FLOW = [
  { title: 'Welcome', body: 'A brief intro from the front: who we are, what is happening this morning, and a moment to settle in. No pressure, just glad you came.' },
  { title: 'Two Worship Songs', body: 'Live worship led by our team. Sing along if you want, listen if you want. Lyrics are on the screen.' },
  { title: 'Sunday School (Kids)', body: 'Kids head to their own classroom for a Bible lesson at their level while families worship together. Safe, warm, joyful. Drop-off welcome any Sunday. <a class="schedule-tab-link" href="/ministries#kids">Learn more &rarr;</a>' },
  { title: 'Greet One Another', body: 'A few minutes to turn around, say hi to the people next to you, and meet someone new before we sit back down.' },
  { title: 'Teaching', body: 'A sermon from one of our pastors or a discussion-style lesson, and we rotate between the two. Either way it stays grounded in scripture and runs about 25–30 minutes.' },
  { title: 'Closing Song', body: 'One more worship song to send us out.' },
  { title: 'Dismissal', body: 'Pastor closes us in prayer, a final blessing before we head into fellowship.' },
  { title: 'Stay for Breakfast', body: "Right after the closing prayer we head into fellowship time with free breakfast for everyone: guests, members, neighbors, anyone passing through. It’s how we end every Sunday: full plates, full hearts, no rush. Free transportation from select shelters available for anyone who needs a ride. <a class=\"schedule-tab-link\" href=\"/outreach#meals-hospitality\">See Community Breakfast &rarr;</a>" },
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
    <style>
        /* /visit — Before You Come section. Editorial layout matching
           /outreach's .ministries-pair pattern, no boxed cards.

           DESKTOP (≥961px):
             • "What to wear" is an image+text pair (image left, content
               right) using the global .ministries-pair grid.
             • Below it, .visit-faq-grid puts Parking and At the door
               side-by-side at a comfortable 50/50 split.

           MOBILE (≤960px):
             • Everything stacks. The pair's image becomes a 16:9 banner
               above the text (the global .ministries-image rule already
               switches to 16:9 on mobile).
             • Parking and At the door stack one-over-the-other with a
               small gold tab marker above each, matching the
               /ministries idiom for first-timer-tip blocks. */

        .visit-faq-pair {
            margin-bottom: var(--space-2xl);
        }
        .visit-faq-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--space-2xl);
        }
        /* Three-column variant — replaces the previous image-paired layout
           (which required a real "what-to-wear" photo we don't have). Three
           equal info blocks read as a balanced FAQ row, no awkward placeholder
           dragging down the section. */
        .visit-faq-grid--three {
            grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 960px) {
            .visit-faq-pair {
                margin-bottom: var(--space-xl);
            }
            .visit-faq-grid,
            .visit-faq-grid--three {
                grid-template-columns: 1fr;
                gap: var(--space-xl);
            }
            /* Gold tab marker above each text-only block — same idiom as
               /outreach + /ministries mobile to signal "new beat begins
               here" without needing a card frame. */
            .visit-faq-grid > .ministry-block {
                position: relative;
                padding-top: var(--space-md);
            }
            .visit-faq-grid > .ministry-block::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: clamp(48px, 12vw, 72px);
                height: 2px;
                background: linear-gradient(90deg, var(--gold) 0%, var(--gold-dark) 100%);
                border-radius: 1px;
            }
        }
    </style>
    <body>
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main>
                <section id="visit-intro">
                    <span class="section-eyebrow">Plan Your Visit</span>
                    <h1 class="section-heading">We can’t wait to meet you.</h1>
                    <p class="subpage-intro-lead">Here’s everything you need to know before Sunday: where we are, what an hour at Morning Star looks like, and what happens after the closing song.</p>
                    <nav class="subpage-jump" aria-label="Jump to a section">
                        <a href="#location">Find Us</a>
                        <a href="#what-to-expect">What to Expect</a>
                        <a href="#before-you-come">Before You Come</a>
                        <a href="#visit-cta">Contact</a>
                    </nav>
                    <div class="handshake" role="img" aria-label="Two hands meeting in a handshake.">
                        <svg viewBox="0 38 254 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                            <g class="handshake-art" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <g transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                                    <path class="handshake-stroke" pathLength="100" d="M 89.689 16.621 c -0.198 -0.188 -0.461 -0.284 -0.739 -0.274 c -6.479 0.321 -13.518 1.398 -22.148 3.389 c -0.271 0.063 -0.504 0.235 -0.643 0.476 c -0.139 0.241 -0.17 0.529 -0.088 0.794 l 0.838 2.704 c -6.363 -2.413 -15.313 -3.802 -23.06 -3.497 c -2.84 0 -6.082 1.409 -9.045 3.5 H 23.089 l 0.839 -2.708 c 0.083 -0.266 0.05 -0.553 -0.088 -0.794 c -0.138 -0.241 -0.371 -0.414 -0.642 -0.476 c -8.63 -1.991 -15.668 -3.068 -22.148 -3.389 c -0.269 -0.012 -0.54 0.085 -0.739 0.274 C 0.112 16.81 0 17.072 0 17.346 v 34.342 c 0 0.553 0.448 1 1 1 h 12.378 c 0.438 0 0.826 -0.285 0.955 -0.704 l 0.472 -1.523 c 10.187 11.872 20.546 22.775 28.634 22.775 c 1.557 0 3.029 -0.411 4.401 -1.29 l 0.211 0.214 c 0.944 0.956 2.209 1.487 3.561 1.495 c 0.011 0 0.021 0 0.032 0 c 1.339 0 2.597 -0.515 3.546 -1.451 c 0.834 -0.825 1.299 -1.873 1.436 -2.956 c 0.93 0.771 2.061 1.18 3.206 1.18 c 1.281 -0.001 2.564 -0.484 3.547 -1.454 c 1.109 -1.096 1.58 -2.581 1.456 -4.025 c 0.446 0.11 0.897 0.185 1.35 0.185 c 1.283 0 2.538 -0.443 3.448 -1.342 c 0.956 -0.944 1.487 -2.209 1.495 -3.561 s -0.507 -2.622 -1.387 -3.507 c -0.368 -0.453 -0.748 -0.888 -1.121 -1.334 l 6.816 -4.149 l 0.23 0.742 c 0.13 0.419 0.517 0.704 0.955 0.704 H 89 c 0.553 0 1 -0.447 1 -1 V 17.346 C 90 17.072 89.888 16.81 89.689 16.621 z M 12.641 50.688 H 2 V 18.403 c 5.806 0.359 12.122 1.335 19.699 3.043 L 12.641 50.688 z M 68.227 62.368 c -1.139 1.126 -3.31 1.005 -4.556 -0.258 c -0.017 -0.017 -0.039 -0.023 -0.057 -0.038 c -0.067 -0.077 -0.118 -0.163 -0.191 -0.237 l -10.95 -11.086 c -0.39 -0.392 -1.021 -0.396 -1.415 -0.009 c -0.393 0.389 -0.396 1.021 -0.009 1.415 l 10.95 11.086 c 0.569 0.575 0.88 1.343 0.875 2.16 c -0.005 0.816 -0.325 1.58 -0.901 2.148 c -1.195 1.183 -3.128 1.168 -4.31 -0.026 l -2.425 -2.455 c -0.002 -0.002 -0.003 -0.004 -0.004 -0.005 l -10.95 -11.085 c -0.389 -0.391 -1.022 -0.396 -1.414 -0.009 c -0.393 0.389 -0.397 1.021 -0.009 1.415 L 53.81 66.47 c 1.182 1.195 1.17 3.129 -0.026 4.31 c -1.196 1.182 -3.13 1.168 -4.31 -0.026 l -13.38 -13.545 c -0.389 -0.392 -1.022 -0.398 -1.414 -0.008 c -0.393 0.388 -0.397 1.021 -0.009 1.414 l 11.711 11.855 c -7.435 3.974 -19.75 -9.239 -30.877 -22.268 l 6.965 -22.487 h 9.815 c -2.741 2.432 -5.001 5.336 -6.092 7.983 c -1.396 3.386 -0.487 5.29 0.521 6.291 c 0.026 0.026 0.054 0.051 0.083 0.074 c 3.843 3.047 7.628 3.815 13.523 -2.283 c 2.001 0.122 3.705 -0.225 5.184 -1.064 c 8.306 5.807 15.937 12.961 22.749 21.343 C 69.435 59.254 69.423 61.188 68.227 62.368 z M 67.318 53.842 c -6.406 -7.41 -13.527 -13.843 -21.216 -19.146 c -0.341 -0.236 -0.793 -0.236 -1.134 -0.001 c -1.322 0.907 -2.939 1.251 -4.944 1.055 c -0.311 -0.034 -0.614 0.084 -0.827 0.31 c -5.585 5.943 -8.344 4.656 -11.109 2.473 c -0.996 -1.039 -0.577 -2.784 -0.046 -4.073 c 2.224 -5.398 10.113 -12.246 15.846 -12.247 c 8.172 -0.313 17.649 1.276 23.786 3.967 l 7.152 23.091 L 67.318 53.842 z M 88 50.688 H 77.358 l -9.058 -29.242 c 7.577 -1.708 13.894 -2.684 19.699 -3.043 V 50.688 z"/>
                                </g>
                            </g>
                        </svg>
                    </div>
                </section>

                <section id="location">
                    <span class="section-eyebrow">Find Us</span>
                    <h2 class="section-heading">3080 Wildwood St · Boise, Idaho</h2>
                    <div class="visit-location-split">
                        <div class="visit-map-frame">
                            <iframe class="visit-map" src="${MAP_EMBED}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map of Morning Star Christian Church at 3080 Wildwood St, Boise, Idaho"></iframe>
                        </div>
                        <div class="visit-location-meta">
                            <p class="visit-location-lede">Tucked along Wildwood Street in West Boise, just off Ustick Road.</p>
                            <p class="visit-location-detail">Free parking is right next to the building. The front doors open onto the lot, so there’s no walking around the block to find the entrance. Sundays at <strong>9:00 AM</strong>, every week.</p>
                            <div class="visit-actions">
                                <a class="event-link-btn visit-cta-primary" href="${GOOGLE_DIRECTIONS}" target="_blank" rel="noopener">Get Directions</a>
                                <a class="event-link-btn event-link-btn-secondary visit-cta-secondary" href="${APPLE_DIRECTIONS}" target="_blank" rel="noopener">Open in Apple Maps</a>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="what-to-expect">
                    <span class="section-eyebrow">What to Expect</span>
                    <h2 class="section-heading">A Sunday at Morning Star runs about an hour.</h2>
                    <p class="section-lead">Same flow every week, so you know what’s coming.</p>
                    <div class="section-card">
                        <ol class="service-flow">
                                ${flowItems}
                        </ol>
                    </div>
                </section>

                <section id="before-you-come">
                    <span class="section-eyebrow">Before You Come</span>
                    <h2 class="section-heading">A few things visitors usually ask.</h2>
                    <p class="section-lead">The stuff worth knowing before Sunday: small details that take the guesswork out of a first visit.</p>

                    <div class="visit-faq-grid visit-faq-grid--three">
                        <article class="ministry-block" id="what-to-wear">
                            <span class="ministry-eyebrow">What to Wear</span>
                            <h3 class="ministry-title">No strict dress code. Come as you are.</h3>
                            <p class="ministry-text">People land all over the spectrum on Sunday mornings. Most are on the casual side (jeans and a shirt are completely fine), and you’ll see plenty dressed more formally too. Both fit in. The only ask is that you keep it modest.</p>
                        </article>
                        <article class="ministry-block" id="parking">
                            <span class="ministry-eyebrow">Parking</span>
                            <h3 class="ministry-title">Right next to the building.</h3>
                            <p class="ministry-text">As soon as you pull up to the church, you’ll see the lot. Free, no permit needed, and only a short walk to the front door.</p>
                        </article>
                        <article class="ministry-block" id="at-the-door">
                            <span class="ministry-eyebrow">At the Door</span>
                            <h3 class="ministry-title">A greeter will meet you.</h3>
                            <p class="ministry-text">Greeters welcome everyone at the door for the main Sunday service. If you have a question or need a hand finding something (a seat, the kids’ classroom, the bathroom), they’re there to help. No pressure to introduce yourself or sign anything.</p>
                        </article>
                    </div>
                </section>

                <section id="visit-cta" class="subpage-final-cta">
                    <span class="section-eyebrow">Questions?</span>
                    <h2 class="section-heading">We’d love to hear from you before Sunday.</h2>
                    <p class="subpage-final-cta-lead">Curious about what to wear, where to park, whether your kids will be okay, or anything else? Reach out and we’ll get you everything you need.</p>
                    <a class="event-link-btn teaser-cta" href="/#contact">Contact Us</a>
                </section>
            </main>

            ${footer()}
        </div>
    </body>`
