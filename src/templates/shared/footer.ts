import { motionEngine } from './motion-engine.js'

// Shared site footer — used by every page so brand / navigation / social /
// legal stay consistent.
//
// Layout is an editorial multi-column sitemap (upgraded from the old
// single centered stack). Four zones on desktop:
//   1. Brand column — wordmark, "Mending the Broken" motto, the Sunday
//      service line, the one conversion action ("Plan a Visit"), and the
//      social row. Carries the church identity in one grounded block.
//   2-4. Three grouped link columns — Explore / Our Church / Connect —
//      give every page a one-tap path to every other page, and surface
//      the address (→ maps), email, and contact form under Connect so a
//      visitor never has to scroll back up for the two things they came
//      for (when / where).
//   + A bottom bar: copyright on the left, Privacy & Terms on the right.
//
// Desktop renders the columns side by side; ≤960px collapses to a
// centered brand block over a two-column link grid (Connect spans full
// width for the address). See the FOOTER block in home-styles.ts.
// Transparent background on the page cream with the gold top-rule — a
// quiet colophon that is now genuinely navigable.
//
// hashPrefix mirrors nav(): '' on the home page so #schedule / #contact
// are in-page smooth-scroll anchors (caught by the home-scripts.ts
// a[href^="#"] handler); '/' on subpages so they become /#schedule etc.
// (cross-page hash navigation into the home sections).

export function footer(hashPrefix = ''): string {
  return `<footer class="site-footer">
                <div class="footer-content">
                    <div class="footer-top">
                        <div class="footer-brand-col">
                            <a class="footer-brand" href="/" aria-label="Morning Star Christian Church · Home">
                                <span class="footer-brand-title">Morning Star</span>
                                <span class="footer-brand-subtitle">Christian Church</span>
                            </a>
                            <p class="footer-motto"><em class="motto">Mending the Broken</em></p>
                            <p class="footer-service">Sundays &middot; 9:00 AM</p>
                            <a class="event-link-btn teaser-cta footer-cta" href="/visit">Plan a Visit</a>
                            <div class="footer-social">
                                <a href="https://www.instagram.com/mschurchboise" target="_blank" rel="noopener" aria-label="Morning Star Christian Church on Instagram">
                                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                </a>
                                <a href="https://www.facebook.com/61564924058156/" target="_blank" rel="noopener" aria-label="Morning Star Christian Church on Facebook">
                                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </a>
                                <a href="https://youtube.com/@morningstarboise" target="_blank" rel="noopener" aria-label="Morning Star Christian Church on YouTube">
                                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div class="footer-nav" role="navigation" aria-label="Footer">
                            <div class="footer-col">
                                <span class="footer-col-title">Explore</span>
                                <ul class="footer-col-links">
                                    <li><a href="/visit">Visit</a></li>
                                    <li><a href="/watch">Watch</a></li>
                                    <li><a href="/ministries">Ministries</a></li>
                                    <li><a href="/outreach">Outreach</a></li>
                                </ul>
                            </div>
                            <div class="footer-col">
                                <span class="footer-col-title">Our Church</span>
                                <ul class="footer-col-links">
                                    <li><a href="/about">About</a></li>
                                    <li><a href="/beliefs">Beliefs</a></li>
                                    <li><a href="${hashPrefix}#schedule">Schedule</a></li>
                                </ul>
                            </div>
                            <div class="footer-col footer-col--connect">
                                <span class="footer-col-title">Connect</span>
                                <ul class="footer-col-links">
                                    <li><a href="https://maps.google.com/?q=3080+Wildwood+St,+Boise,+ID+83713" target="_blank" rel="noopener">3080 Wildwood St, Boise, Idaho 83713</a></li>
                                    <li><a href="mailto:support@ms.church">support@ms.church</a></li>
                                    <li><a href="${hashPrefix}#contact">Contact us</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="footer-bottom">
                        <p class="footer-copyright">© <span id="copyright-year"></span> Morning Star Christian Church. All rights reserved.</p>
                        <a href="/privacy" class="footer-legal-link">Privacy &amp; Terms</a>
                    </div>
                    <script>document.getElementById('copyright-year').textContent = new Date().getFullYear();</script>
                </div>
            </footer>
            ${motionEngine()}`
}
