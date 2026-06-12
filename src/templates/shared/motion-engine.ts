// Nav motion engine — true spring physics for the two nav state machines
// (subpage menu open/close, mobile nav compress/expand), built on the
// self-hosted Motion bundle (/static/js/motion.min.js, window.Motion).
//
// Design contract:
//   • ZERO coupling — the engine observes the existing state classes
//     (body.menu-open, .nav-shell.scrolled-mobile) via MutationObserver
//     and renders motion for them. No call sites in subpage-header or
//     home-scripts; any code path that flips the state is covered.
//   • Progressive enhancement — if Motion fails to load (or
//     prefers-reduced-motion), html.motion-engine is never set and the
//     v1.62.76 CSS spring transitions remain in charge. The CSS rules
//     under html.motion-engine only disable the transitions the engine
//     drives.
//   • Interruption continuity — every animation targets TO-values only,
//     so reversing a state mid-flight retargets springs from the
//     current rendered value (open-during-close, close-during-open,
//     rapid scroll oscillation all stay fluid).
//   • Every-case handling — bfcache restore and viewport resize snap
//     inline state to the class-defined rest pose; a live
//     reduced-motion change tears the engine down.
//
// Emitted once per page from footer.ts (end of body, all pages).

export function motionEngine(): string {
  return `<script>
            (function() {
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
                    var isSubpage = /page-subpage/.test(document.body.className);

                    /* ─────────────── Subpage menu choreography ─────────────── */
                    if (shell && isSubpage) {
                        var items = Array.prototype.slice.call(shell.querySelectorAll('nav ul li'));
                        var brand = shell.querySelector('.brand');
                        var cta = shell.querySelector('.nav-cta');
                        var closeTimer = null;

                        // Rest pose for the shell's engine-driven vars.
                        shell.style.setProperty('--mnav-y', '-12px');
                        shell.style.setProperty('--mnav-s', '0.94');
                        shell.style.opacity = '0';

                        var setItemRest = function() {
                            items.forEach(function(li) {
                                li.style.opacity = '0';
                                li.style.transform = 'translateX(10px) translateY(4px) scale(0.96)';
                                li.style.filter = 'blur(3px)';
                            });
                            if (brand) { brand.style.opacity = '0'; brand.style.transform = 'translateY(-4px)'; }
                            if (cta) { cta.style.opacity = '0'; cta.style.transform = 'translateY(6px) scale(0.96)'; cta.style.filter = 'blur(3px)'; }
                        };
                        setItemRest();

                        var openMenu = function() {
                            stopAll();
                            if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
                            document.body.classList.remove('menu-closing');
                            // Panel grows out of the trigger corner with the snap.
                            go(shell, { '--mnav-y': '0px', '--mnav-s': 1 }, SNAP);
                            go(shell, { opacity: 1 }, FADE);
                            // Links pour in right-to-left behind the chrome.
                            items.forEach(function(li, i) {
                                var delay = 0.05 + 0.045 * (items.length - 1 - i);
                                go(li, { x: 0, y: 0, scale: 1 }, Object.assign({}, POUR, { delay: delay }));
                                go(li, { opacity: 1 }, Object.assign({}, FADE, { delay: delay }));
                                go(li, { filter: 'blur(0px)' }, { duration: 0.3, ease: 'easeOut', delay: delay });
                            });
                            if (brand) {
                                go(brand, { y: 0 }, Object.assign({}, POUR, { delay: 0.1 }));
                                go(brand, { opacity: 1 }, Object.assign({}, FADE, { delay: 0.1 }));
                            }
                            if (cta) {
                                go(cta, { y: 0, scale: 1 }, Object.assign({}, SNAP, { delay: 0.24 }));
                                go(cta, { opacity: 1 }, Object.assign({}, FADE, { delay: 0.24 }));
                                go(cta, { filter: 'blur(0px)' }, { duration: 0.3, ease: 'easeOut', delay: 0.24 });
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
                                // Re-seed rest pose so the next open starts clean.
                                shell.style.setProperty('--mnav-y', '-12px');
                                shell.style.setProperty('--mnav-s', '0.94');
                                setItemRest();
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

                    // NOTE: the mobile compress/expand morph is intentionally NOT
                    // engine-driven. It is a continuous, scroll-coupled state
                    // change best left to the CSS spring (the --ease-spring
                    // transitions in home-styles.ts, gated by nav-anim-ready),
                    // which the browser optimizes and which renders identically
                    // on Chromium AND WebKit/iOS. An earlier engine-driven morph
                    // animated smoothly on Chromium but the scroll-triggered path
                    // stepped on WebKit (Safari 26 / iOS), whereas the CSS spring
                    // is solid on both. The engine owns the DISCRETE menu action
                    // (above), where JS spring choreography is worth it and is
                    // verified smooth cross-engine. Single responsibility per tool.
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
