// Subpage header for /about and /outreach.
//
// Two independent fixed-position pills (NOT a unified nav-shell):
//   • Brand wordmark with a tapered radial-frost backdrop (no pill outline).
//     Links to "/" (home / hero). Hides on scroll-down, returns on scroll-up.
//   • Back button — gold pill, always visible. Uses history.back() with a /
//     fallback for direct entries.
//
// Pattern reused from the home-scripts.ts mobile nav: rAF-throttled scroll
// listener with direction tracking via lastScrollY (see home-scripts.ts
// handleMobileNav — same approach).

export function subpageHeader(): string {
  return `<div class="subpage-top-fog" aria-hidden="true"></div>
            <a class="subpage-back" href="/" id="subpage-back-link" aria-label="Go back">
                <span class="subpage-back-arrow" aria-hidden="true">&#8592;</span>
                <span class="subpage-back-label">Back</span>
            </a>
            <a class="subpage-brand" href="/" id="subpage-brand-link" aria-label="Morning Star Christian Church — Home">
                <span class="brand-title">Morning Star</span>
                <span class="brand-subtitle">Christian Church</span>
            </a>
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
                    document.querySelectorAll('a[href^="#"]').forEach(function(a) {
                        a.addEventListener('click', function(e) {
                            var href = a.getAttribute('href');
                            if (!href || href === '#' || href.length < 2) return;
                            var target = document.querySelector(href);
                            if (!target) return;
                            e.preventDefault();
                            window.__smoothScrollToHash(href);
                            // Reflect the new section in the URL without
                            // letting the browser do its instant jump.
                            try { history.replaceState(null, '', location.pathname + location.search + href); } catch (err) {}
                        });
                    });

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
