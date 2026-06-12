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

                    /* ─────────── Home nav scrubber: scroll-coupled morph ───────────
                       The compress/expand is NOT a binary state — it is a continuous
                       progress value p (0 = full nav, 1 = pill) scrubbed directly by
                       scroll position over the first SCRUB_RANGE px. While the user
                       scrolls, every property tracks the finger with a slight organic
                       lag; stop mid-scroll and the morph stops mid-pose. When the
                       scroll pauses, the measured scroll VELOCITY is fed into a spring
                       that settles p to the nearest pole — a fast flick lands with a
                       big bubble, a gentle stop gets a soft rebound, and arriving at
                       either end overshoots and bounces. Every frame is a plain inline
                       style write (no WAAPI), so it renders identically on WebKit/iOS
                       and Chromium. The CSS --ease-spring morph remains the
                       no-JS / no-Motion fallback (html.nav-scrub disables it). */
                    if (shell && !isSubpage) {
                        var sBrand = shell.querySelector('.brand');
                        var sCta = shell.querySelector('.nav-cta');
                        var sNav = shell.querySelector('nav');
                        var sUl = shell.querySelector('nav ul');
                        var sPill = shell.querySelector('.nav-form-btn');
                        var isMobile = function() { return window.innerWidth <= 960; };
                        var cpx = function(min, vw, max) { return Math.min(max, Math.max(min, vw * window.innerWidth / 100)); };
                        var clamp01 = function(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); };

                        var SCRUB_START = 4;     // px of scroll before the morph begins
                        var SCRUB_RANGE = 130;   // px of scroll for the full morph
                        var IDLE_MS = 120;       // scroll silence before the settle spring fires
                        // The settle voice is deliberately UNDER-damped — the bubble is
                        // the point. ~1.5 visible oscillations on a strong flick.
                        var SETTLE = { type: 'spring', stiffness: 340, damping: 15, mass: 1 };
                        var VEL_BOOST = 1.6;     // amplify real scroll velocity into the spring
                        var VEL_MAX = 6;         // but keep a violent flick civilized

                        // Geometry poles, refreshed on resize. Brand/CTA heights are
                        // measured so the collapse tracks real content across viewports.
                        var G = {};
                        var measure = function() {
                            G.padV = cpx(12, 1.7, 16);
                            G.radius = cpx(28, 3.5, 48);
                            G.rowH0 = 22;
                            G.rowH1 = cpx(40, 12, 48);
                            G.navM = 16;
                            G.brandH = (sBrand && sBrand.offsetHeight > 4) ? Math.min(56, sBrand.offsetHeight + 1) : 30;
                            G.ctaH = (sCta && sCta.offsetHeight > 4) ? Math.min(56, sCta.offsetHeight + 1) : 38;
                            G.pillOn = sPill && getComputedStyle(sPill).display !== 'none';
                        };

                        var lerp = function(a, b, t) { return a + (b - a) * t; };
                        var p = null; // current progress; may overshoot [0,1] for the bubble

                        var applyP = function(v) {
                            p = v;
                            var c = clamp01(v); // opacity / collapse never extrapolate
                            shell.style.paddingTop = Math.max(0, lerp(G.padV, 0, v)) + 'px';
                            shell.style.paddingBottom = Math.max(0, lerp(G.padV, 0, v)) + 'px';
                            shell.style.borderRadius = lerp(G.radius, 100, c) + 'px';
                            if (sNav) {
                                var m = Math.max(0, lerp(G.navM, 0, v));
                                sNav.style.marginTop = m + 'px';
                                sNav.style.marginBottom = m + 'px';
                            }
                            // The row height carries the overshoot — the pill visibly
                            // bounces past its resting size and springs back.
                            if (sUl) sUl.style.minHeight = Math.max(G.rowH0, lerp(G.rowH0, G.rowH1, v)) + 'px';
                            if (sBrand) {
                                sBrand.style.maxHeight = Math.max(0, lerp(G.brandH, 0, v)) + 'px';
                                sBrand.style.opacity = String(clamp01(1 - c * 1.9)); // gone by ~p=.53
                                sBrand.style.transform = 'translateY(' + (-6 * c) + 'px) scale(' + (1 - 0.03 * c) + ')';
                            }
                            if (sCta) {
                                sCta.style.maxHeight = Math.max(0, lerp(G.ctaH, 0, v)) + 'px';
                                sCta.style.opacity = String(clamp01(1 - c * 1.9));
                                sCta.style.transform = 'translateY(' + (-6 * c) + 'px) scale(' + (1 - 0.03 * c) + ')';
                            }
                            if (sPill && G.pillOn) {
                                sPill.style.opacity = String(clamp01((c - 0.45) * 1.9)); // arrives in the back half
                                sPill.style.transform = 'translateY(-50%) scale(' + (0.85 + 0.15 * Math.max(0, v - 0.3) / 0.7) + ')';
                            }
                            // Semantic state for the discrete styles (link type scale,
                            // space-between distribution, pill reserve). Their own CSS
                            // transitions carry them; geometry is inline-owned here.
                            var want = c > 0.5;
                            if (shell.classList.contains('scrolled-mobile') !== want) {
                                shell.classList.toggle('scrolled-mobile', want);
                            }
                        };

                        var clearScrub = function() {
                            ['paddingTop', 'paddingBottom', 'borderRadius'].forEach(function(k) { shell.style[k] = ''; });
                            if (sNav) { sNav.style.marginTop = ''; sNav.style.marginBottom = ''; }
                            if (sUl) sUl.style.minHeight = '';
                            [sBrand, sCta].forEach(function(el) { if (el) { el.style.maxHeight = ''; el.style.opacity = ''; el.style.transform = ''; } });
                            if (sPill) { sPill.style.opacity = ''; sPill.style.transform = ''; }
                        };

                        var pTarget = function() {
                            return clamp01((window.scrollY - SCRUB_START) / SCRUB_RANGE);
                        };

                        // ── The loop: scrub while scrolling, spring when idle ──
                        var rafOn = false;
                        var lastScrollT = 0;
                        var lastTickT = 0;
                        var settleAnim = null;
                        var settleStartT = 0;
                        var settlePole = 0;
                        var settledAt = null; // pole we are resting at, or null
                        var hist = [];        // [t, p] pairs for velocity capture

                        var stopSettle = function() {
                            if (settleAnim) { try { settleAnim.stop(); } catch (e) {} settleAnim = null; }
                        };

                        var tick = function(now) {
                            lastTickT = now;
                            if (!isMobile()) { rafOn = false; return; }
                            // Settle watchdog — if the spring animation ever goes
                            // inert (observed intermittently: the returned controls
                            // stop ticking without completing), it would otherwise
                            // block both branches forever and park the nav mid-pose.
                            // Force-land the pole after a generous deadline.
                            if (settleAnim && (now - settleStartT) > 1200) {
                                stopSettle();
                                applyP(settlePole);
                                settledAt = settlePole;
                            }
                            var scrolling = (now - lastScrollT) < IDLE_MS;
                            if (scrolling && !settleAnim) {
                                // SCRUB: track the finger with a touch of organic lag.
                                var t = pTarget();
                                var next = p + (t - p) * 0.36;
                                if (Math.abs(next - t) < 0.002) next = t;
                                if (next !== p) applyP(next);
                                settledAt = null;
                                hist.push([now, p]);
                                if (hist.length > 6) hist.shift();
                            } else if (!scrolling && !settleAnim && settledAt === null) {
                                // SETTLE: spring to the nearest pole, carrying the real
                                // scroll velocity in — a flick lands with a bigger bubble.
                                var pole = p >= 0.5 ? 1 : 0;
                                var vel = 0;
                                if (hist.length > 1) {
                                    var a = hist[0], b2 = hist[hist.length - 1];
                                    if (b2[0] > a[0]) vel = (b2[1] - a[1]) / ((b2[0] - a[0]) / 1000);
                                }
                                vel = Math.max(-VEL_MAX, Math.min(VEL_MAX, vel * VEL_BOOST));
                                hist = [];
                                if (Math.abs(p - pole) < 0.001 && Math.abs(vel) < 0.05) {
                                    settledAt = pole; applyP(pole);
                                } else {
                                    settleStartT = now;
                                    settlePole = pole;
                                    var anim = window.Motion.animate(p, pole, Object.assign({}, SETTLE, {
                                        velocity: vel,
                                        onUpdate: function(v) { applyP(v); },
                                        onComplete: function() {
                                            if (settleAnim === anim) { settleAnim = null; settledAt = pole; applyP(pole); }
                                        }
                                    }));
                                    settleAnim = anim;
                                    // Belt-and-suspenders: the controls are thenable —
                                    // clear via the promise too in case onComplete is
                                    // skipped (covers the inert-controls race).
                                    if (anim && typeof anim.then === 'function') {
                                        anim.then(function() {
                                            if (settleAnim === anim) { settleAnim = null; settledAt = pole; applyP(pole); }
                                        }, function() {});
                                    }
                                }
                            }
                            // Idle out once resting and quiet; the scroll listener re-arms.
                            if (settledAt !== null && !settleAnim && (now - lastScrollT) > 400) { rafOn = false; return; }
                            requestAnimationFrame(tick);
                        };

                        var wake = function() {
                            var now = performance.now();
                            lastScrollT = now;
                            // A new gesture mid-settle: hand control back to the finger
                            // from the spring's current value — continuity, no jump.
                            if (settleAnim) { stopSettle(); }
                            settledAt = null;
                            // Self-healing: if the rAF chain ever died with the flag
                            // still up (an exception mid-frame, a throttled tab), the
                            // nav would freeze. Re-arm whenever ticks have gone quiet.
                            if ((!rafOn || (now - lastTickT) > 250) && isMobile()) {
                                rafOn = true;
                                requestAnimationFrame(tick);
                            }
                        };

                        // Take ownership: home-scripts' class toggling stands down.
                        window.__navScrubActive = true;
                        html.classList.add('nav-scrub');
                        measure();
                        applyP(shell.classList.contains('scrolled-mobile') ? 1 : (pTarget() >= 0.5 ? 1 : 0));
                        settledAt = clamp01(p) >= 0.5 ? 1 : 0;

                        window.addEventListener('scroll', wake, { passive: true });
                        window.addEventListener('pageshow', function(e) {
                            if (!e.persisted) return;
                            stopSettle(); hist = [];
                            measure(); applyP(pTarget() >= 0.5 ? 1 : 0);
                            settledAt = clamp01(p);
                        });
                        var rsT2 = null;
                        window.addEventListener('resize', function() {
                            if (rsT2) clearTimeout(rsT2);
                            rsT2 = setTimeout(function() {
                                stopSettle(); hist = [];
                                if (isMobile()) { measure(); applyP(pTarget() >= 0.5 ? 1 : 0); settledAt = clamp01(p); }
                                else { clearScrub(); }
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
