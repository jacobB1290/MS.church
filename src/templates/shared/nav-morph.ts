// Home nav morph — companion script for the scroll-driven nav animation
// (the html.nav-sda CSS block in home-styles.ts).
//
// The morph itself is 100% CSS: animation-timeline: scroll(root) scrubs
// the full→compressed pose over the first 4–134px of scroll, sampled by
// the browser in lockstep with the committed scroll offset (compositor-
// threaded for opacity/transform on Safari 26.4+ / Chromium). This script
// only supplies the three things CSS cannot:
//
//   1. MEASURE — --nav-spread (half the slack around the centered link
//      cluster, so the space-between row starts visually identical to the
//      centered-with-gap expanded design) and --mnav-brand-h/--mnav-cta-h
//      (natural row heights, so the row-space collapse is linear with no
//      max-height dead zone). Measured synchronously at parse time (before
//      first paint), and again on resize / font load / bfcache restore.
//      html.nav-measuring disables the animations inside one synchronous
//      block so the expanded metrics are readable at any scroll position —
//      the probe is never painted.
//
//   2. POLE CLASS — .scrolled-mobile flips with hysteresis at the range
//      edges (p<0.08 / p>0.92). Under nav-sda the flip is visually a no-op
//      (every morphed property is animation-owned); it keeps semantics,
//      the fallback CSS, and anything else keyed to the class coherent.
//
//   3. SETTLE — a scroll position parked mid-range would park the nav
//      mid-morph. On gesture end (scrollend where supported, idle timer
//      otherwise) the PAGE is nudged to the nearest pole — the UIKit
//      large-title pattern. The nav follows through the scroll timeline,
//      so pose and scroll can never disagree; there is no second source
//      of truth to hunt against (the v1.62.80–82 stutter class).
//
// Emitted by home-body.ts immediately after the nav markup so the
// measurement happens before anything below the nav parses. The fallback
// path (no html.nav-sda: older browsers, reduced motion) never reaches
// this script's body — home-scripts' threshold logic + the --ease-spring
// CSS transitions own the morph there, exactly as before.

export function navMorph(): string {
  return `<script>
            (function() {
                var html = document.documentElement;
                if (!html.classList.contains('nav-sda')) return;
                var shell = document.querySelector('.nav-shell');
                if (!shell) return;
                var ul = shell.querySelector('nav ul');
                var links = Array.prototype.slice.call(shell.querySelectorAll('nav ul a'));
                var brand = shell.querySelector('.brand');
                var cta = shell.querySelector('.nav-cta');

                var RANGE_START = 4;    // must match animation-range in home-styles
                var RANGE_END = 134;
                var IDLE_MS = 150;      // scroll silence = momentum finished (scrollend fallback)
                var SNAP_MS = 300;

                var isMobile = function() { return window.innerWidth <= 960; };

                /* ── 1. Measurement ── */
                var measure = function() {
                    if (!isMobile() || !ul) return;
                    html.classList.add('nav-measuring');
                    var gap = parseFloat(getComputedStyle(ul).columnGap) || 0;
                    var cluster = gap * Math.max(0, links.length - 1);
                    for (var i = 0; i < links.length; i++) cluster += links[i].getBoundingClientRect().width;
                    var spread = Math.max(0, (ul.getBoundingClientRect().width - cluster) / 2);
                    shell.style.setProperty('--nav-spread', spread.toFixed(2) + 'px');
                    // Fractional border-box heights (rects, not scrollHeight:
                    // scrollHeight rounds to integers and excludes borders,
                    // which clipped ~3px off the CTA's natural row). With
                    // nav-measuring on, the rects ARE the expanded design.
                    if (brand) shell.style.setProperty('--mnav-brand-h', brand.getBoundingClientRect().height.toFixed(2) + 'px');
                    if (cta) shell.style.setProperty('--mnav-cta-h', cta.getBoundingClientRect().height.toFixed(2) + 'px');
                    html.classList.remove('nav-measuring');
                };
                measure();   // synchronous, pre-first-paint

                /* ── 2. Pole class with hysteresis ── */
                var syncPoleClass = function() {
                    if (!isMobile()) { shell.classList.remove('scrolled-mobile'); return; }
                    var p = (window.scrollY - RANGE_START) / (RANGE_END - RANGE_START);
                    var has = shell.classList.contains('scrolled-mobile');
                    if (has && p < 0.08) shell.classList.remove('scrolled-mobile');
                    else if (!has && p > 0.92) shell.classList.add('scrolled-mobile');
                };

                /* ── 3. Settle to the nearest pole ── */
                var touchActive = false;
                var idleTimer = null;
                var snapOn = false;
                var snapRaf = null;
                var snapTimer = null;
                var snapLastY = null;

                var cancelSnap = function() {
                    snapOn = false;
                    if (snapRaf) { cancelAnimationFrame(snapRaf); snapRaf = null; }
                    if (snapTimer) { clearTimeout(snapTimer); snapTimer = null; }
                    snapLastY = null;
                };

                var snapTo = function(target) {
                    cancelSnap();
                    var from = window.scrollY;
                    if (Math.abs(from - target) < 1) { window.scrollTo(0, target); return; }
                    var t0 = performance.now();
                    snapOn = true;
                    var step = function() {
                        if (!snapOn) return;
                        if (snapRaf) { cancelAnimationFrame(snapRaf); snapRaf = null; }
                        if (snapTimer) { clearTimeout(snapTimer); snapTimer = null; }
                        // A scroll we didn't write means the user took over.
                        if (snapLastY !== null && Math.abs(window.scrollY - snapLastY) > 2) { snapOn = false; return; }
                        var t = Math.min(1, (performance.now() - t0) / SNAP_MS);
                        var e = 1 - Math.pow(1 - t, 3);   // ease-out cubic
                        window.scrollTo(0, from + (target - from) * e);
                        snapLastY = window.scrollY;
                        if (t < 1) { arm(); }
                        else { snapOn = false; snapLastY = null; syncPoleClass(); }
                    };
                    // rAF for frame-locked smoothness, with a timer backstop so
                    // the snap always progresses even when rAF is starved or
                    // throttled (headless engines, low-power throttling) —
                    // whichever fires first runs the step and cancels the other.
                    var arm = function() {
                        snapRaf = requestAnimationFrame(step);
                        snapTimer = setTimeout(step, 48);
                    };
                    arm();
                };

                var settle = function() {
                    // Test hook: the nav-morph harness steps scroll positions
                    // to assert the pose function and must not be settled away
                    // from the position under measurement.
                    if (window.__navSnapDisabled) return;
                    if (touchActive || !isMobile() || document.hidden || snapOn) return;
                    var y = window.scrollY;
                    if (y <= RANGE_START || y >= RANGE_END) { syncPoleClass(); return; }
                    var p = (y - RANGE_START) / (RANGE_END - RANGE_START);
                    snapTo(p >= 0.5 ? RANGE_END : 0);
                };

                var onScroll = function() {
                    syncPoleClass();
                    if (idleTimer) clearTimeout(idleTimer);
                    if (!touchActive && !snapOn) idleTimer = setTimeout(settle, IDLE_MS);
                };

                window.addEventListener('scroll', onScroll, { passive: true });
                if ('onscrollend' in window) {
                    window.addEventListener('scrollend', function() {
                        if (idleTimer) clearTimeout(idleTimer);
                        settle();
                    }, { passive: true });
                }
                window.addEventListener('touchstart', function() { touchActive = true; cancelSnap(); }, { passive: true });
                window.addEventListener('touchend', function() { touchActive = false; onScroll(); }, { passive: true });
                window.addEventListener('touchcancel', function() { touchActive = false; }, { passive: true });
                window.addEventListener('wheel', cancelSnap, { passive: true });
                window.addEventListener('keydown', cancelSnap, { passive: true });

                /* Re-measure when metrics can change. */
                var rsT = null;
                window.addEventListener('resize', function() {
                    if (rsT) clearTimeout(rsT);
                    rsT = setTimeout(function() { measure(); syncPoleClass(); }, 120);
                }, { passive: true });
                if (document.fonts && document.fonts.ready) {
                    document.fonts.ready.then(measure);
                }
                window.addEventListener('pageshow', function(e) {
                    if (!e.persisted) return;
                    cancelSnap();
                    measure();
                    syncPoleClass();
                });

                /* Live reduced-motion switch tears the morph down to the
                   fallback path: dropping nav-sda detaches every animation,
                   the neutralizations, and the space-between distribution in
                   one class removal, and hands the threshold logic back to
                   home-scripts (which re-checks the flag per scroll event). */
                var rm = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
                if (rm && rm.addEventListener) rm.addEventListener('change', function() {
                    if (!rm.matches) return;
                    cancelSnap();
                    if (idleTimer) clearTimeout(idleTimer);
                    html.classList.remove('nav-sda');
                    window.__navScrubActive = false;
                });

                /* home-scripts' threshold fallback stands down. */
                window.__navScrubActive = true;
                syncPoleClass();
            })();
        </script>`
}
