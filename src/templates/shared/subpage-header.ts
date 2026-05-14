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

                    // ----- Hash deep-link landing -----
                    // The inline <head> script stashed location.hash on
                    // window.__targetHash and cleared the URL so the browser
                    // didn't do its native scroll-to-fragment. We now do
                    // ONE smooth scroll to the target using scrollIntoView
                    // (the browser respects each section's scroll-margin-top
                    // CSS, so JS math isn't needed and stays in lockstep).
                    //
                    // The previous implementation called scrollIntoView
                    // twice (200ms + 800ms). On pages with async content
                    // (/outreach's calendar) the second smooth scroll
                    // RESTARTED the in-flight animation and looked jagged.
                    // We fix it by:
                    //   • single smooth scrollIntoView at 220ms
                    //   • at 900ms, an instant snap-correct (behavior:
                    //     'auto') ONLY if the section has actually drifted
                    //     more than 20px from the desired landing zone
                    //     (i.e., async content arrived after our first
                    //     scroll). Instant snap doesn't restart the
                    //     smooth animation mid-flight, so the user sees a
                    //     clean scroll once, plus a tiny correction iff
                    //     needed.
                    var hash = window.__targetHash;
                    if (hash) {
                        setTimeout(function() {
                            var t = document.querySelector(hash);
                            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 220);
                        setTimeout(function() {
                            var t = document.querySelector(hash);
                            if (t) {
                                // Where is the section's top right now?
                                // scroll-margin-top isn't reflected in
                                // getBoundingClientRect; we hardcode the
                                // expected landing (matching the CSS).
                                var expected = window.innerWidth <= 960 ? 75 : 90;
                                var actual = t.getBoundingClientRect().top;
                                if (Math.abs(actual - expected) > 20) {
                                    // Drift detected — snap instantly so we
                                    // don't restart smooth scroll mid-flight.
                                    t.scrollIntoView({ behavior: 'auto', block: 'start' });
                                }
                            }
                            try {
                                history.replaceState(null, '', location.pathname + location.search + hash);
                            } catch (e) {}
                        }, 900);
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
