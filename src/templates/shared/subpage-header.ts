// Minimal header for subpages (/about, /outreach).
// No nav, no contact pill — just:
//   • Morning Star wordmark (links to "/" — the hero)
//   • Back button (history.back() with /-fallback for direct entries)

export function subpageHeader(): string {
  return `<header class="nav-shell subpage-shell">
                <a class="brand" href="/" aria-label="Morning Star Christian Church — Home">
                    <span class="brand-title">Morning Star</span>
                    <span class="brand-subtitle">Christian Church</span>
                </a>
                <a class="subpage-back" href="/" id="subpage-back-link" aria-label="Go back">
                    <span class="subpage-back-arrow" aria-hidden="true">&#8592;</span>
                    <span class="subpage-back-label">Back</span>
                </a>
            </header>
            <script>
                (function() {
                    var back = document.getElementById('subpage-back-link');
                    if (!back) return;
                    back.addEventListener('click', function(e) {
                        var hasHistory = window.history.length > 1;
                        var fromSameOrigin = document.referrer && document.referrer.indexOf(window.location.origin) === 0;
                        if (hasHistory && fromSameOrigin) {
                            e.preventDefault();
                            window.history.back();
                        }
                        // else: default href="/" navigates home
                    });
                })();
            </script>`
}
