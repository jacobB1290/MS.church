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
                    // v1.49.4: replaced the smooth-scroll-from-top approach
                    // entirely. Every prior iteration (custom rAF easing →
                    // browser-native scrollTo → defer-until-load → watchdog
                    // re-targeting → snap-correct) had the same fundamental
                    // problem: a long visible scroll animation competing
                    // with main-thread work AND fighting layout shifts as
                    // async content (calendar carousel, image decodes) lands
                    // mid-flight. The motion was perceived as jagged or
                    // landing-then-jumping no matter how we tuned it.
                    //
                    // New approach (paired with .hash-fade CSS in
                    // home-styles.ts):
                    //   1. page-head sets .hash-fade on <html> before first
                    //      paint → main renders at opacity 0, translateY(16px).
                    //   2. We wait for window.load + fonts.ready + 2rAF +
                    //      rIC so the page is fully laid out (calendar has
                    //      mounted, images decoded, fonts loaded).
                    //   3. We do an INSTANT scrollTo(0, targetY) — accurate
                    //      because layout has settled and predictable
                    //      because there's no animation to be janky.
                    //   4. We add .hash-fade-in → CSS transitions opacity
                    //      0→1 and transform translateY(16)→0 over ~800ms
                    //      with a strong easeOut curve. Reads as the tail
                    //      end of a smooth-scroll that's 98% done.
                    //
                    // The 16px settle gives the perception of motion
                    // without the cost of a visible long scroll. The user
                    // never sees the page at the wrong position because
                    // the scrollTo runs while main is still invisible.
                    var hash = window.__targetHash;
                    if (hash) {
                        var fired = false;
                        var fireScroll = function() {
                            if (fired) return;
                            fired = true;
                            var t = document.querySelector(hash);
                            if (t) {
                                var offset = window.innerWidth <= 960 ? 75 : 90;
                                var targetY = Math.max(0, t.getBoundingClientRect().top + window.pageYOffset - offset);
                                window.scrollTo(0, targetY);
                            }
                            // Trigger the fade-in even if target is missing
                            // so we never leave the page sitting invisible.
                            document.documentElement.classList.add('hash-fade-in');
                            try {
                                history.replaceState(null, '', location.pathname + location.search + hash);
                            } catch (e) {}
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
