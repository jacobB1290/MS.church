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
                    var a = window.Motion.animate(el, kf, opts);
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

                    /* ─────────── Mobile compress/expand morph (home + subpages) ─────────── */
                    if (shell) {
                        var mBrand = shell.querySelector('.brand');
                        var mCta = shell.querySelector('.nav-cta');
                        var mNav = shell.querySelector('nav');
                        var mUl = shell.querySelector('nav ul');
                        var pill = shell.querySelector('.nav-form-btn');
                        var mobile = function() { return window.innerWidth <= 960; };

                        // Fluid targets, mirroring the CSS clamps.
                        var clampPx = function(min, vw, max) { return Math.min(max, Math.max(min, vw * window.innerWidth / 100)); };
                        var targets = function(compressed) {
                            return compressed ? {
                                rowH: clampPx(40, 12, 48), navM: 0, padV: 0,
                                radius: 100, collapseH: 0, collapseO: 0, collapseY: -6, collapseS: 0.97,
                                pillO: 1, pillS: 1
                            } : {
                                rowH: 22, navM: 16, padV: clampPx(12, 1.7, 16),
                                radius: clampPx(28, 3.5, 48), collapseH: 56, collapseO: 1, collapseY: 0, collapseS: 1,
                                pillO: 0, pillS: 0.85
                            };
                        };

                        var seed = function() {
                            if (!mobile()) return;
                            var t = targets(shell.classList.contains('scrolled-mobile'));
                            shell.style.paddingTop = t.padV + 'px';
                            shell.style.paddingBottom = t.padV + 'px';
                            shell.style.borderRadius = t.radius + 'px';
                            if (mNav) { mNav.style.marginTop = t.navM + 'px'; mNav.style.marginBottom = t.navM + 'px'; }
                            if (mUl) mUl.style.minHeight = t.rowH + 'px';
                            [mBrand, mCta].forEach(function(el) {
                                if (!el) return;
                                el.style.maxHeight = t.collapseH + 'px';
                                el.style.opacity = String(t.collapseO);
                                el.style.transform = 'translateY(' + t.collapseY + 'px) scale(' + t.collapseS + ')';
                            });
                            if (pill) { pill.style.opacity = String(t.pillO); pill.style.setProperty('--pill-s', String(t.pillS)); }
                        };
                        var clear = function() {
                            ['paddingTop', 'paddingBottom', 'borderRadius'].forEach(function(k) { shell.style[k] = ''; });
                            if (mNav) { mNav.style.marginTop = ''; mNav.style.marginBottom = ''; }
                            if (mUl) mUl.style.minHeight = '';
                            [mBrand, mCta].forEach(function(el) {
                                if (!el) return;
                                el.style.maxHeight = ''; el.style.opacity = ''; el.style.transform = '';
                            });
                            if (pill) { pill.style.opacity = ''; pill.style.removeProperty('--pill-s'); }
                        };
                        seed();

                        var morph = function(compressed) {
                            if (!mobile()) return;
                            stopAll();
                            var t = targets(compressed);
                            go(shell, { paddingTop: t.padV + 'px', paddingBottom: t.padV + 'px', borderRadius: t.radius + 'px' }, SNAP);
                            if (mNav) go(mNav, { marginTop: t.navM + 'px', marginBottom: t.navM + 'px' }, SNAP);
                            if (mUl) go(mUl, { minHeight: t.rowH + 'px' }, SNAP);
                            [mBrand, mCta].forEach(function(el) {
                                if (!el) return;
                                go(el, { maxHeight: t.collapseH + 'px' }, SNAP);
                                go(el, { opacity: t.collapseO }, compressed ? EXIT : FADE);
                                go(el, { transform: 'translateY(' + t.collapseY + 'px) scale(' + t.collapseS + ')' }, SNAP);
                            });
                            if (pill) {
                                go(pill, { opacity: t.pillO }, compressed ? FADE : EXIT);
                                go(pill, { '--pill-s': t.pillS }, SNAP);
                            }
                        };

                        var morphWas = shell.classList.contains('scrolled-mobile');
                        new MutationObserver(function() {
                            var is = shell.classList.contains('scrolled-mobile');
                            if (is === morphWas) return;
                            morphWas = is;
                            // Restore/init-time flips are repositions, not motion
                            // moments — same contract as the CSS nav-anim-ready
                            // gate. Snap to pose instead of animating.
                            if (!html.classList.contains('nav-anim-ready')) { seed(); return; }
                            // Subpage menus reuse .scrolled-mobile for the panel's
                            // compressed LAYOUT, but the panel itself is hidden
                            // chrome — only the home nav morphs in view.
                            if (!isSubpage) morph(is);
                            else seed();
                        }).observe(shell, { attributes: true, attributeFilter: ['class'] });

                        // Every-case hygiene: snap to rest pose on restore/resize.
                        window.addEventListener('pageshow', function(e) {
                            if (e.persisted) { stopAll(); morphWas = shell.classList.contains('scrolled-mobile'); seed(); }
                        });
                        var rsT = null;
                        window.addEventListener('resize', function() {
                            if (rsT) clearTimeout(rsT);
                            rsT = setTimeout(function() {
                                stopAll();
                                if (mobile()) seed(); else clear();
                            }, 120);
                        }, { passive: true });
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
