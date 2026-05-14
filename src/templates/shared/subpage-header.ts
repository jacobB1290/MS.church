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

                    // ----- Custom smooth-scroll animator (v1.48) -----
                    // Replaces browser-native scrollIntoView({behavior:'smooth'})
                    // which uses an unspecified easing and tends to feel
                    // cheap / low-frame-rate. This implementation:
                    //   • drives scrollY per-frame via requestAnimationFrame
                    //     (renders as fast as the display refreshes — 60,
                    //     90, 120 Hz alike, no fixed 60fps cap)
                    //   • eases via easeInOutCubic — ramps up at start,
                    //     decelerates as it approaches the target
                    //   • scales duration to distance (~4000px/sec
                    //     perceived velocity), clamped 450–1100ms
                    //   • respects prefers-reduced-motion (instant jump)
                    //
                    // Exposed globally as window.__smoothScrollTo so the
                    // harness can call it directly to measure frame
                    // smoothness on the same code path users hit.
                    window.__smoothScrollTo = function(targetY) {
                        targetY = Math.max(0, targetY);
                        var startY = window.pageYOffset;
                        var distance = targetY - startY;
                        if (Math.abs(distance) < 1) return;
                        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                            window.scrollTo(0, targetY);
                            return;
                        }
                        // Duration: QUICK AND SMOOTH. Browser-native
                        // smooth scroll for the same distance takes ~850ms
                        // but has 220px+ jumps per 60Hz frame because it
                        // uses an aggressive cubic curve (peak ratio 3x).
                        // The trapezoidal curve below has peak ratio 1.18x,
                        // so for the same duration the visual jumps are
                        // ~4x smaller. We can keep the FAST timing of
                        // native scroll AND have smooth visible motion.
                        //
                        // Formula: distance / 4, clamped 400-1000ms.
                        // For 2851px: 712ms → peak velocity 4.72 px/ms
                        // → 79px per 60Hz frame = AT the smoothness target,
                        // matching native-scroll duration.
                        // For 1000px: 400ms (minimum, snappy feel).
                        // For 4000px: 1000ms (cap).
                        var duration = Math.min(1000, Math.max(400, Math.abs(distance) / 4.0));
                        var startTime = null;
                        function ease(t) {
                            // Trapezoidal velocity profile: smoothstep ramp
                            // over the first/last 15%, CONSTANT VELOCITY
                            // across the middle 70%. Peak-velocity ratio
                            // drops to ~1.18x mean (vs sine 1.57x, cubic
                            // 3.0x), which means per-display-frame visual
                            // jumps stay small even on long scrolls.
                            //
                            // Computed in closed form via two smoothstep
                            // ramps that integrate to a total of 1.0.
                            // Math: total area under trapezoidal velocity
                            // = vMax * (rampIn/2 + middle + rampOut/2)
                            // = vMax * 0.85 = 1 → vMax = 1/0.85 = 1.176.
                            // Position(t) is the integral, computed
                            // piecewise below.
                            var rIn = 0.15, rOut = 0.85;
                            var vMax = 1 / 0.85; // ~1.176
                            if (t <= rIn) {
                                // Acceleration phase: position = vMax * smoothstep-integral
                                var u = t / rIn;
                                // ∫(3u² - 2u³) du from 0 to u = u³ - u⁴/2
                                return vMax * rIn * (u * u * u - u * u * u * u / 2);
                            } else if (t < rOut) {
                                // Constant-velocity middle.
                                // Position at end of ramp-in: vMax * rIn * (1 - 1/2) = vMax * rIn / 2
                                return vMax * rIn / 2 + vMax * (t - rIn);
                            } else {
                                // Deceleration phase: symmetric to ramp-in.
                                var u2 = (t - rOut) / (1 - rOut);
                                // Position at start of ramp-out: vMax * rIn / 2 + vMax * (rOut - rIn)
                                var posStart = vMax * rIn / 2 + vMax * (rOut - rIn);
                                // Add ramp-out integral: vMax * (1 - rOut) * (u - smoothstep_integral)
                                // For deceleration: velocity = vMax * (1 - smoothstep(u))
                                // ∫(1 - 3u² + 2u³) du = u - u³ + u⁴/2
                                var rampOutPos = vMax * (1 - rOut) * (u2 - u2 * u2 * u2 + u2 * u2 * u2 * u2 / 2);
                                return posStart + rampOutPos;
                            }
                        }
                        function step(now) {
                            if (startTime === null) startTime = now;
                            var t = Math.min((now - startTime) / duration, 1);
                            window.scrollTo(0, startY + distance * ease(t));
                            if (t < 1) requestAnimationFrame(step);
                        }
                        requestAnimationFrame(step);
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
                    //   • One smooth-scroll animator runs at 220ms (after
                    //     initial layout settles) — clean rAF-driven scroll
                    //     with easeInOutCubic.
                    //   • At 1500ms (after the smooth-scroll has finished),
                    //     INSTANT snap-correct ONLY if the section drifted
                    //     >20px because async content (/outreach calendar)
                    //     arrived after our scroll. Instant snap doesn't
                    //     restart the smooth animation mid-flight.
                    var hash = window.__targetHash;
                    if (hash) {
                        setTimeout(function() {
                            window.__smoothScrollToHash(hash);
                        }, 220);
                        // Snap-correct timer. After max scroll duration
                        // (1000ms) + 220ms initial delay + 100ms buffer.
                        setTimeout(function() {
                            var t = document.querySelector(hash);
                            if (t) {
                                var expected = window.innerWidth <= 960 ? 75 : 90;
                                var actual = t.getBoundingClientRect().top;
                                if (Math.abs(actual - expected) > 20) {
                                    window.scrollTo(0, Math.max(0, actual + window.pageYOffset - expected));
                                }
                            }
                            try {
                                history.replaceState(null, '', location.pathname + location.search + hash);
                            } catch (e) {}
                        }, 1400);
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
