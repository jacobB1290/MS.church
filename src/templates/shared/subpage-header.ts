// Subpage header for /about and /outreach.
//
// Floating chrome (NOT a unified nav-shell at rest):
//   • Brand wordmark — links to "/" (home / hero). Hides on scroll-down,
//     returns on scroll-up. Slides left + dims slightly when menu opens
//     so the nav-shell brand can take its position.
//   • Back button — gold pill, always visible. Uses history.back() with a
//     / fallback for direct entries.
//   • Menu trigger — right-side mirror of BACK. Three thin lines that
//     morph to an X when the nav-shell is open.
//   • Nav-shell — the SAME nav() output that the home page uses, rendered
//     here too. Hidden by default; slides + fades in when the menu trigger
//     is activated. Uses cross-page hashes (/#schedule etc.) so anchors
//     navigate to /home and scroll. Single source of truth — no copy.
//
// Pattern reused from the home-scripts.ts mobile nav: rAF-throttled scroll
// listener with direction tracking via lastScrollY.

import { nav } from './nav.js'

export function subpageHeader(): string {
  return `<div class="subpage-top-fog" aria-hidden="true"></div>
            <a class="subpage-back" href="/" id="subpage-back-link" aria-label="Go back">
                <span class="subpage-back-arrow" aria-hidden="true">&#8592;</span>
                <span class="subpage-back-label">Back</span>
            </a>
            <a class="subpage-brand" href="/" id="subpage-brand-link" aria-label="Morning Star Christian Church · Home">
                <span class="brand-title">Morning Star</span>
                <span class="brand-subtitle">Christian Church</span>
            </a>

            <!-- Menu trigger pill (mirror of .subpage-back on the right).
                 Three thin equal lines inside a frosted pill. Open state
                 morphs the lines to an X (top +45°, bottom -45°, middle
                 fades). See styles in home-styles.ts. -->
            <button class="subpage-menu-trigger" id="subpage-menu-trigger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav-shell">
                <span class="subpage-menu-icon" aria-hidden="true">
                    <span class="subpage-menu-icon-line"></span>
                    <span class="subpage-menu-icon-line"></span>
                    <span class="subpage-menu-icon-line"></span>
                </span>
            </button>

            <!-- The home page's nav-shell rendered inline on subpages
                 via nav('/') — SAME element/styling as /home, not a
                 copy. Cross-page hashes (href="/#schedule") so links
                 work from subpages. Hidden by default; body.menu-open
                 slides + fades it into view. On mobile, the existing
                 nav-shell mobile CSS already compresses it to the
                 Contact pill, so we get that for free. -->
            ${nav('/')}

            <!-- Click-anywhere-to-dismiss overlay, only active when the
                 nav-shell is open. -->
            <div class="subpage-menu-scrim" id="subpage-menu-scrim" aria-hidden="true"></div>
            <script>
                (function() {
                    // Back button: history.back() with /-fallback for direct entries.
                    var back = document.getElementById('subpage-back-link');
                    if (back) {
                        back.addEventListener('click', function(e) {
                            var hasHistory = window.history.length > 1;
                            var fromSameOrigin = document.referrer && document.referrer.indexOf(window.location.origin) === 0;
                            if (hasHistory && fromSameOrigin) {
                                e.preventDefault();
                                window.history.back();
                            }
                        });
                    }

                    // ----- Smooth-scroll wrapper (v1.48.2) -----
                    // Browser-native scrollTo({behavior:'smooth'}) — same code
                    // path as home-scripts.ts. The home page uses this for
                    // ALL its nav-anchor scrolls (including hero→contact,
                    // which is ~3000px) and it feels smooth at every
                    // distance. So we use the exact same primitive on
                    // subpages instead of a custom rAF animator.
                    //
                    // Previous iterations tried custom rAF + trapezoidal
                    // easing on the theory that browser-native peak velocity
                    // would be too rough. In real-world testing the user
                    // confirmed native feels smoother than any custom curve,
                    // so we defer to the platform.
                    //
                    // Exposed globally so the harness can drive the same
                    // primitive the user hits.
                    window.__smoothScrollTo = function(targetY) {
                        targetY = Math.max(0, targetY);
                        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                            window.scrollTo(0, targetY);
                            return;
                        }
                        window.scrollTo({ top: targetY, behavior: 'smooth' });
                    };
                    window.__smoothScrollToHash = function(hash) {
                        var t = document.querySelector(hash);
                        if (!t) return;
                        var offset = window.innerWidth <= 960 ? 75 : 90;
                        window.__smoothScrollTo(t.getBoundingClientRect().top + window.pageYOffset - offset);
                    };

                    // ----- Hash deep-link landing -----
                    // The inline <head> script stashed location.hash on
                    // window.__targetHash and cleared the URL so the browser
                    // didn't do its native scroll-to-fragment.
                    //
                    // The previous version fired the smooth-scroll on
                    // requestIdleCallback with a 350ms timeout. Worked, but
                    // users perceived the scroll as ~20fps on subpages while
                    // the identical primitive on home felt smooth. The
                    // difference was main-thread context: home anchor click
                    // fires on a fully-settled page (window.load done, fonts
                    // ready, images decoded, layout committed); subpage
                    // hashload was firing while the page was still parsing
                    // analytics scripts, decoding hero images, and laying
                    // out the calendar carousel. Even though main-thread JS
                    // didn't block long enough to trigger LoAFs, every
                    // re-layout or image-decode commit caused the
                    // compositor to wait, producing visible stutter while
                    // the smooth-scroll's vsync-bound paint pipeline was
                    // trying to commit each frame.
                    //
                    // v1.49.5: instant scroll + invisible-stability watchdog.
                    //
                    // v1.49.4 dropped the smooth-scroll but landed at the
                    // wrong spot when async content (e.g. /outreach calendar
                    // carousel) mounted AFTER our initial scrollTo. The
                    // page faded in at the wrong position, and any final
                    // layout shift produced a visible jump-after-settle.
                    //
                    // Fix: keep main invisible until layout has been
                    // stable for 300ms. Re-do the instant scrollTo every
                    // 100ms while we're waiting; each correction is
                    // invisible because the fade-in hasn't started.
                    //
                    // Flow:
                    //   1. page-head sets .hash-fade on <html> before first
                    //      paint → main renders at opacity 0, translateY(40px).
                    //   2. We wait for window.load + fonts.ready + 2rAF +
                    //      rIC.
                    //   3. Initial INSTANT scrollTo to the measured target.
                    //   4. Watchdog re-measures every 100ms. If position
                    //      drifts > 2px (layout shift somewhere), re-do
                    //      the instant scrollTo. Reset stability counter.
                    //   5. After 3 consecutive stable measurements (300ms
                    //      of no shift), add .hash-fade-in → CSS fades
                    //      opacity 0→1 and transforms translateY 40→0
                    //      over ~900ms with strong easeOut. Reads as the
                    //      tail end of a smooth-scroll at 95% done.
                    //   6. Hard cap 1500ms — if layout never stabilizes
                    //      (unlikely), we fade-in anyway.
                    //
                    // The 40px settle (~5% perceived motion) gives a more
                    // visible tail-of-scroll feel than v1.49.4's 16px.
                    // User never sees corrections because they happen
                    // while main is at opacity 0.
                    var hash = window.__targetHash;
                    if (hash) {
                        var fired = false;
                        var fadeInFired = false;
                        var fireFadeIn = function() {
                            if (fadeInFired) return;
                            fadeInFired = true;
                            document.documentElement.classList.add('hash-fade-in');
                            try {
                                history.replaceState(null, '', location.pathname + location.search + hash);
                            } catch (e) {}
                            // Clear the hash from the URL on first user
                            // scroll after the fade-in completes. Reason:
                            // restoring the hash lets the user copy a
                            // bookmarkable URL and the browser back-button
                            // works correctly, but a leftover hash also means
                            // RELOAD always re-jumps to the anchor. By
                            // clearing on first user scroll, we keep the
                            // hash only as long as the user is "at" the
                            // anchor; the moment they scroll elsewhere it
                            // goes away and reload preserves their scroll
                            // position via the browser's default behavior.
                            // The setTimeout delay ignores residual settling
                            // scroll from our own animations.
                            var clearHashOnScroll = function() {
                                if (location.hash === hash) {
                                    try {
                                        history.replaceState(null, '', location.pathname + location.search);
                                    } catch (e) {}
                                }
                            };
                            setTimeout(function() {
                                window.addEventListener('scroll', clearHashOnScroll, { once: true, passive: true });
                            }, 1500);
                        };
                        var fireScroll = function() {
                            if (fired) return;
                            fired = true;
                            var t = document.querySelector(hash);
                            if (!t) {
                                fireFadeIn();
                                return;
                            }
                            var offset = window.innerWidth <= 960 ? 75 : 90;
                            var mainEl = document.querySelector('main');
                            // CRITICAL: getBoundingClientRect().top includes
                            // ALL applied transforms. While main is in the
                            // pre-fade state it carries a translateY (the
                            // settle offset — currently -40px so it slides
                            // DOWN into place). If we scrollTo to the raw
                            // rect.top, the target lands at the offset
                            // visually for the invisible phase — but when
                            // fade-in completes and translateY unwinds to
                            // 0, the target SHIFTS by the transform amount
                            // and ends up off-target. We must subtract the
                            // active transform Y so scrollTo targets the
                            // POST-fade layout position. Math holds for
                            // either direction (+ or -).
                            var getTransformY = function() {
                                if (!mainEl) return 0;
                                var cs = window.getComputedStyle(mainEl).transform;
                                if (!cs || cs === 'none') return 0;
                                var m = cs.match(/matrix\(([^)]+)\)/);
                                if (m) {
                                    var parts = m[1].split(',');
                                    return parseFloat(parts[5]) || 0;
                                }
                                var m3 = cs.match(/matrix3d\(([^)]+)\)/);
                                if (m3) {
                                    var p3 = m3[1].split(',');
                                    return parseFloat(p3[13]) || 0;
                                }
                                return 0;
                            };
                            var measureTargetY = function() {
                                var rectTop = t.getBoundingClientRect().top;
                                var transformY = getTransformY();
                                return Math.max(0, rectTop - transformY + window.pageYOffset - offset);
                            };
                            var lastY = measureTargetY();
                            window.scrollTo(0, lastY);
                            var stableCount = 0;
                            var watchdog = setInterval(function() {
                                var newY = measureTargetY();
                                if (Math.abs(newY - lastY) > 2) {
                                    window.scrollTo(0, newY);
                                    lastY = newY;
                                    stableCount = 0;
                                } else {
                                    stableCount++;
                                    if (stableCount >= 3) {
                                        clearInterval(watchdog);
                                        fireFadeIn();
                                    }
                                }
                            }, 100);
                            // Hard cap so we don't sit invisible forever
                            // if layout never stabilizes.
                            setTimeout(function() {
                                clearInterval(watchdog);
                                fireFadeIn();
                            }, 1500);
                        };
                        var afterLoad = function() {
                            // Race fonts.ready against a 150ms cap so a slow
                            // Google Fonts response can't delay the landing
                            // indefinitely.
                            var fontsReady = (document.fonts && document.fonts.ready)
                                ? Promise.race([
                                    document.fonts.ready,
                                    new Promise(function(r) { setTimeout(r, 150); })
                                  ])
                                : Promise.resolve();
                            fontsReady.then(function() {
                                requestAnimationFrame(function() {
                                    requestAnimationFrame(function() {
                                        if (window.requestIdleCallback) {
                                            requestIdleCallback(fireScroll, { timeout: 200 });
                                        } else {
                                            setTimeout(fireScroll, 40);
                                        }
                                    });
                                });
                            });
                        };
                        if (document.readyState === 'complete') {
                            afterLoad();
                        } else {
                            window.addEventListener('load', afterLoad, { once: true });
                            // Hard cap so a stalled subresource can't keep
                            // the page invisible past 1.2s.
                            setTimeout(fireScroll, 1200);
                        }
                    }

                    // ----- Smooth-scroll for in-page anchor clicks -----
                    // Every subpage that includes subpageHeader() gets
                    // smooth-scroll wiring for free. Uses the
                    // __smoothScrollToHash helper above (which already
                    // respects prefers-reduced-motion and applies the
                    // 75/90px nav offset). External / cross-page links
                    // (href="/foo#bar", href="https://...") are skipped —
                    // only same-page hash anchors are intercepted.
                    // Per project preference (CLAUDE.md #10): every
                    // anchor jump animates, never instant.
                    //
                    // CRITICAL: must use event delegation on document,
                    // NOT a per-element listener. The subpage-header
                    // <script> tag sits ABOVE the rest of the page body
                    // in document order, so a forEach over the matched
                    // anchors at script-execution time would find none
                    // (the jump-nav links / in-body anchors haven't
                    // been parsed yet). Delegation works regardless of
                    // when the elements were added.
                    //
                    // Calls history.replaceState (not pushState) so the
                    // URL reflects the current section without adding a
                    // new history entry per click. Browser back button
                    // then goes to the previous PAGE, not a previous
                    // section — which is what users expect.
                    document.addEventListener('click', function(e) {
                        // Defer to any per-element handler that already
                        // claimed this event (home-scripts.ts attaches
                        // its own per-anchor handlers on /outreach,
                        // which uses both subpageHeader and homeScripts).
                        // Bubbled-phase document listeners fire AFTER
                        // per-element listeners, so defaultPrevented
                        // here means another handler took care of it.
                        if (e.defaultPrevented) return;
                        var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
                        if (!a) return;
                        var href = a.getAttribute('href');
                        if (!href || href === '#' || href.length < 2) return;
                        var target = document.querySelector(href);
                        if (!target) return;
                        e.preventDefault();
                        if (typeof window.__smoothScrollToHash === 'function') {
                            window.__smoothScrollToHash(href);
                        } else {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                        try { history.replaceState(null, '', location.pathname + location.search + href); } catch (err) {}
                    });

                    // ----- Menu trigger: toggle the nav-shell -----
                    // .menu-open on <body> drives all the CSS state (icon
                    // morph, brand slide+fade, nav-shell fade+slide in,
                    // scrim pointer-events). Dismiss paths: click trigger
                    // again, click scrim, click a nav link, press ESC.
                    // All funnel through closeMenu() so animations sync.
                    var trigger = document.getElementById('subpage-menu-trigger');
                    var navShell = document.querySelector('.nav-shell');
                    var scrim = document.getElementById('subpage-menu-scrim');
                    if (trigger && navShell && scrim) {
                        // Mirror the home nav's compressed-mobile state on
                        // subpages: apply .scrolled-mobile at mobile widths
                        // so the SAME .scrolled-mobile CSS that compresses
                        // the home nav on scroll also compresses our
                        // subpage menu nav. Single source of truth — no
                        // reimplementation of the compressed-nav layout.
                        var syncMobileNavState = function() {
                            if (window.innerWidth <= 960) {
                                navShell.classList.add('scrolled-mobile');
                            } else {
                                navShell.classList.remove('scrolled-mobile');
                            }
                        };
                        syncMobileNavState();
                        window.addEventListener('resize', syncMobileNavState, { passive: true });

                        var openMenu = function() {
                            document.body.classList.add('menu-open');
                            trigger.setAttribute('aria-expanded', 'true');
                            trigger.setAttribute('aria-label', 'Close menu');
                            navShell.setAttribute('aria-hidden', 'false');
                        };
                        var closeMenu = function() {
                            document.body.classList.remove('menu-open');
                            trigger.setAttribute('aria-expanded', 'false');
                            trigger.setAttribute('aria-label', 'Open menu');
                            navShell.setAttribute('aria-hidden', 'true');
                        };
                        // Initialize nav-shell as hidden on subpages.
                        navShell.setAttribute('aria-hidden', 'true');
                        trigger.addEventListener('click', function(e) {
                            e.stopPropagation();
                            if (document.body.classList.contains('menu-open')) {
                                closeMenu();
                            } else {
                                openMenu();
                            }
                        });
                        scrim.addEventListener('click', closeMenu);
                        // Close on any nav-link click. The smooth-scroll
                        // delegated handler above runs first and may
                        // preventDefault for in-page anchors; for cross-
                        // page anchors (/#schedule) the browser navigates.
                        // Either way we hide the panel so it's not in the
                        // way after click.
                        navShell.querySelectorAll('a').forEach(function(a) {
                            a.addEventListener('click', function() {
                                setTimeout(closeMenu, 50);
                            });
                        });
                        document.addEventListener('keydown', function(e) {
                            if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
                                closeMenu();
                            }
                        });
                    }

                    // Brand: hide on scroll-down, show on scroll-up.
                    // v1.49.26: gate the scroll-hide behind a brief
                    // entrance window so the brand doesn't transition
                    // to .hidden as a side effect of the hash-load
                    // scrollTo. Per the user, the logo should be
                    // excluded from the entrance animation — it stays
                    // anchored at top center while page content
                    // settles, and the scroll-hide only engages on
                    // genuine USER scroll after the entrance is done.
                    var brand = document.getElementById('subpage-brand-link');
                    if (!brand) return;
                    var lastY = window.scrollY;
                    var ticking = false;
                    var threshold = 40;
                    var entranceLockUntil = performance.now() + 1200;

                    function update() {
                        if (performance.now() < entranceLockUntil) {
                            // During the entrance window, just track
                            // lastY without toggling the .hidden class.
                            // The next genuine scroll after this window
                            // ends will set the right state immediately.
                            lastY = window.scrollY;
                            ticking = false;
                            return;
                        }
                        var y = window.scrollY;
                        if (y < threshold) {
                            brand.classList.remove('hidden');
                        } else if (y > lastY) {
                            brand.classList.add('hidden');
                        } else if (y < lastY) {
                            brand.classList.remove('hidden');
                        }
                        lastY = y;
                        ticking = false;
                    }

                    window.addEventListener('scroll', function() {
                        if (!ticking) {
                            ticking = true;
                            window.requestAnimationFrame(update);
                        }
                    }, { passive: true });
                })();
            </script>`
}
