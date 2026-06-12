// Nav motion engine — true spring physics for the subpage menu open/close
// choreography, built on the self-hosted Motion bundle
// (/static/js/motion.min.js, window.Motion).
//
// SUBPAGE-ONLY since the scroll-driven nav morph landed: the home page's
// compress/expand is a native CSS scroll-driven animation (html.nav-sda,
// see home-styles.ts + nav-morph.ts) — the JS scroll scrubber that used
// to live here could never beat iOS's scroll-event latency and ~60Hz
// rendering cap, so it was replaced wholesale. Home doesn't load the
// Motion bundle at all anymore; this script exits immediately there.
//
// Design contract:
//   • ZERO coupling — the engine observes the existing state class
//     (body.menu-open) via MutationObserver and renders motion for it.
//     No call sites in subpage-header; any code path that flips the
//     state is covered.
//   • Progressive enhancement — if Motion fails to load (or
//     prefers-reduced-motion), html.motion-engine is never set and the
//     v1.62.76 CSS spring transitions remain in charge. The CSS rules
//     under html.motion-engine only disable the transitions the engine
//     drives.
//   • Interruption continuity — every animation targets TO-values only,
//     so reversing a state mid-flight retargets springs from the
//     current rendered value (open-during-close, close-during-open
//     stay fluid).
//   • Every-case handling — a live reduced-motion change tears the
//     engine down.
//
// Emitted once per page from footer.ts (end of body, all pages).

export function motionEngine(): string {
  return `<script>
            (function() {
                // Subpage menu choreography only — home has no Motion
                // bundle and no engine-driven state anymore.
                if (!/page-subpage/.test(document.body.className)) return;
                var rm = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
                var html = document.documentElement;
                var engaged = false;
                var running = [];

                function stopAll() {
                    for (var i = 0; i < running.length; i++) { try { running[i].stop(); } catch (e) {} }
                    running = [];
                }
                function go(el, kf, opts) {
                    // Force Motion's main-thread driver on every animation.
                    // WebKit's Web Animations API (through Safari 26 / WebKit
                    // 26.4, verified) refuses to interpolate custom properties
                    // and layout properties (padding, min-height, border-radius,
                    // max-height): it reports the animation "running" but pins
                    // the start value, then snaps to the end on finish — so the
                    // shell transform (driven by --mnav-y/--mnav-s), the pill
                    // scale (--pill-s), and the compress/expand morph all
                    // stepped instead of animating on iOS. Motion's main-thread
                    // driver (engaged by supplying onUpdate) interpolates every
                    // property identically across engines, and because it writes
                    // the live value to inline style each frame, interruption
                    // (stop + retarget-from-current) is exact. The compositor
                    // cost for these brief, small nav animations is negligible.
                    var o = opts || {};
                    if (!o.onUpdate) { o = Object.assign({}, o, { onUpdate: function() {} }); }
                    var a = window.Motion.animate(el, kf, o);
                    running.push(a);
                    return a;
                }

                // Spring voices. SNAP is the chrome's bubbly snap-into-place
                // (same personality as --ease-spring); POUR is softer, for
                // staggered content settling in behind the chrome.
                var SNAP = { type: 'spring', stiffness: 420, damping: 26, mass: 1 };
                var POUR = { type: 'spring', stiffness: 300, damping: 24, mass: 1 };
                var FADE = { duration: 0.22, ease: [0.32, 0.72, 0, 1] };
                var EXIT = { duration: 0.17, ease: [0.4, 0, 0.2, 1] };

                function boot() {
                    if (engaged) return;
                    if (!window.Motion || !window.Motion.animate) return;
                    if (rm.matches) return;
                    engaged = true;
                    html.classList.add('motion-engine');

                    var shell = document.querySelector('.nav-shell');

                    /* ─────────────── Subpage menu choreography ─────────────── */
                    if (shell) {
                        var items = Array.prototype.slice.call(shell.querySelectorAll('nav ul li'));
                        var brand = shell.querySelector('.brand');
                        var cta = shell.querySelector('.nav-cta');
                        var closeTimer = null;

                        // Synchronously write the FULL rest pose (shell vars +
                        // every item) to inline style. Called at boot, at the top
                        // of each open, and after each close. This guarantees the
                        // pre-animation frame is already at rest, so there is never
                        // a stale frame from the previous close's end pose before
                        // Motion's first tick — belt-and-suspenders with the
                        // explicit from→to keyframes in openMenu.
                        var seedRest = function() {
                            shell.style.setProperty('--mnav-y', '-12px');
                            shell.style.setProperty('--mnav-s', '0.94');
                            shell.style.opacity = '0';
                            items.forEach(function(li) {
                                li.style.opacity = '0';
                                li.style.transform = 'translateX(10px) translateY(4px) scale(0.96)';
                                li.style.filter = 'blur(3px)';
                            });
                            if (brand) { brand.style.opacity = '0'; brand.style.transform = 'translateY(-4px)'; }
                            if (cta) { cta.style.opacity = '0'; cta.style.transform = 'translateY(6px) scale(0.96)'; cta.style.filter = 'blur(3px)'; }
                        };
                        seedRest();

                        var openMenu = function() {
                            stopAll();
                            if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
                            document.body.classList.remove('menu-closing');
                            // Rest pose written synchronously so the first painted
                            // frame is identical for every open (no stale carry-over
                            // from the close), then sprung in via the keyframes below.
                            seedRest();
                            // EXPLICIT from→to keyframes ([from, to]) make every
                            // open self-contained: it always starts from the true
                            // rest pose, so the 2nd, 3rd … open is byte-identical to
                            // the gorgeous first one. Without this, Motion springs
                            // from its INTERNAL cached value (the close's end pose,
                            // e.g. --mnav-y:-8), which a manual style reseed does
                            // NOT update — so the panel travelled -8→0 instead of
                            // -12→0 and every reopen looked flatter and lost the
                            // de-blur "load-in". The seeded rest pose below keeps
                            // the from-values and the live DOM identical.
                            go(shell, { '--mnav-y': ['-12px', '0px'], '--mnav-s': [0.94, 1] }, SNAP);
                            go(shell, { opacity: [0, 1] }, FADE);
                            // Links pour in right-to-left behind the chrome.
                            items.forEach(function(li, i) {
                                var delay = 0.05 + 0.045 * (items.length - 1 - i);
                                go(li, { x: [10, 0], y: [4, 0], scale: [0.96, 1] }, Object.assign({}, POUR, { delay: delay }));
                                go(li, { opacity: [0, 1] }, Object.assign({}, FADE, { delay: delay }));
                                go(li, { filter: ['blur(3px)', 'blur(0px)'] }, { duration: 0.3, ease: 'easeOut', delay: delay });
                            });
                            if (brand) {
                                go(brand, { y: [-4, 0] }, Object.assign({}, POUR, { delay: 0.1 }));
                                go(brand, { opacity: [0, 1] }, Object.assign({}, FADE, { delay: 0.1 }));
                            }
                            if (cta) {
                                go(cta, { y: [6, 0], scale: [0.96, 1] }, Object.assign({}, SNAP, { delay: 0.24 }));
                                go(cta, { opacity: [0, 1] }, Object.assign({}, FADE, { delay: 0.24 }));
                                go(cta, { filter: ['blur(3px)', 'blur(0px)'] }, { duration: 0.3, ease: 'easeOut', delay: 0.24 });
                            }
                        };

                        var closeMenu = function() {
                            stopAll();
                            // Hold the panel visible while the exit plays —
                            // the class flip alone would hide it instantly.
                            document.body.classList.add('menu-closing');
                            go(shell, { '--mnav-y': '-8px', '--mnav-s': 0.96 }, EXIT);
                            go(shell, { opacity: 0 }, EXIT);
                            items.forEach(function(li) {
                                go(li, { opacity: 0, x: 6 }, EXIT);
                            });
                            if (brand) go(brand, { opacity: 0 }, EXIT);
                            if (cta) go(cta, { opacity: 0 }, EXIT);
                            if (closeTimer) clearTimeout(closeTimer);
                            closeTimer = setTimeout(function() {
                                document.body.classList.remove('menu-closing');
                                seedRest();   // tidy the hidden closed state
                                closeTimer = null;
                            }, 200);
                        };

                        var menuWas = document.body.classList.contains('menu-open');
                        new MutationObserver(function() {
                            var is = document.body.classList.contains('menu-open');
                            if (is === menuWas) return;
                            menuWas = is;
                            if (is) openMenu(); else closeMenu();
                        }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
                    }
                }

                // Live reduced-motion change tears the engine down — CSS
                // (which is instant under reduced-motion) takes over.
                if (rm.addEventListener) rm.addEventListener('change', function() {
                    if (rm.matches && engaged) { stopAll(); html.classList.remove('motion-engine'); window.location.reload(); }
                });

                // Motion loads with defer; boot when it lands (or now).
                if (window.Motion) boot();
                else {
                    var tries = 0;
                    var iv = setInterval(function() {
                        tries++;
                        if (window.Motion) { clearInterval(iv); boot(); }
                        else if (tries > 100) clearInterval(iv);
                    }, 50);
                }
            })();
        </script>`
}
