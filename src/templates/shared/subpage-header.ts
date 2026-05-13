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
  return `<a class="subpage-back" href="/" id="subpage-back-link" aria-label="Go back">
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
