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
                    // Fix (v1.49.0): defer the smooth-scroll until ALL of:
                    //   1. window.load — every subresource finished
                    //   2. document.fonts.ready — no FOUT reflows mid-scroll
                    //   3. 2× rAF — layout / paint fully committed
                    //   4. requestIdleCallback — main thread genuinely quiet
                    // …then fire. Adds ~100-400ms latency before the scroll
                    // starts, but the scroll itself runs on a quiet thread
                    // (matching the home-anchor-click context) so the
                    // motion is smooth all the way through.
                    //
                    // v1.49.2: a layout-shift watchdog runs alongside the
                    // smooth-scroll and re-fires it toward an updated
                    // target Y if the section moves during the animation
                    // (e.g. /outreach calendar carousel mounts after we
                    // started scrolling). See the inline notes below the
                    // fireScroll definition for details.
                    var hash = window.__targetHash;
                    if (hash) {
                        var fired = false;
                        // ---- Layout-shift-aware smooth-scroll (v1.49.2) ----
                        // The hashload target's absolute Y can MOVE while
                        // we're animating toward it. On /outreach the
                        // calendar carousel fetches and mounts async — it
                        // settles after window.load (so even our defer-
                        // until-load timing doesn't catch it) and pushes
                        // the cooking-ministry / community-breakfast
                        // sections downward by several hundred pixels.
                        // The previous flow was: compute targetY once →
                        // scroll there → snap-correct with an instant
                        // scrollTo at the end. The user saw "smooth scroll
                        // to wrong place, then jump to right place."
                        //
                        // New flow: re-measure the target's absolute Y
                        // every 100ms while the smooth-scroll is in
                        // flight. If it has moved > 10px (a late layout
                        // shift), fire another scrollTo({behavior:'smooth'})
                        // toward the new target. The browser cancels the
                        // prior smooth-scroll and animates to the new
                        // position, so motion curves continuously into
                        // the correct landing instead of landing wrong
                        // and snapping. After 2500ms the watchdog stops
                        // and does one final SMOOTH correction (still
                        // motion, never a jump) if drift remains.
                        var fireScroll = function() {
                            if (fired) return;
                            fired = true;
                            var t = document.querySelector(hash);
                            if (!t) return;
                            var offset = window.innerWidth <= 960 ? 75 : 90;
                            var getTargetY = function() {
                                return Math.max(0, t.getBoundingClientRect().top + window.pageYOffset - offset);
                            };
                            var lastTargetY = getTargetY();
                            window.__smoothScrollTo(lastTargetY);
                            var startTs = Date.now();
                            var watchdog = setInterval(function() {
                                var nowTargetY = getTargetY();
                                if (Math.abs(nowTargetY - lastTargetY) > 10) {
                                    lastTargetY = nowTargetY;
                                    window.__smoothScrollTo(nowTargetY);
                                }
                                if (Date.now() - startTs > 2500) {
                                    clearInterval(watchdog);
                                    var finalTop = t.getBoundingClientRect().top;
                                    if (Math.abs(finalTop - offset) > 15) {
                                        window.__smoothScrollTo(finalTop + window.pageYOffset - offset);
                                    }
                                    try {
                                        history.replaceState(null, '', location.pathname + location.search + hash);
                                    } catch (e) {}
                                }
                            }, 100);
                        };
                        var afterLoad = function() {
                            // Fonts: race fonts.ready against a 150ms timeout
                            // so a slow Google Fonts response can't delay the
                            // scroll indefinitely. The font is decorative —
                            // if it lands mid-scroll the visual reflow is
                            // minimal because we use --font-body fallback and
                            // metrics are similar.
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
                            // Hard cap: if load never fires (network hung
                            // on some non-critical resource) we still
                            // want to scroll within 1.2s.
                            setTimeout(fireScroll, 1200);
                        }
                    }

                    // Brand: hide on scroll-down, show on scroll-up.
                    var brand = document.getElementById('subpage-brand-link');
                    if (!brand) return;
                    var lastY = window.scrollY;
                    var ticking = false;
                    var threshold = 40;

                    function update() {
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
