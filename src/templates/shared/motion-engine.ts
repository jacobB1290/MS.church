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
                       The compress/expand is a continuous progress value p (0 = full
                       nav, 1 = pill) scrubbed by scroll position over the first
                       SCRUB_RANGE px. EVERY property is interpolated — geometry,
                       link typography, link distribution, the pill reserve, top and
                       margins — so there is no discrete jump anywhere in the range.
                       The two poles are MEASURED from the real CSS (both class
                       states read in one synchronous block, so the browser never
                       paints the probe), which keeps the scrub pixel-faithful to
                       the design at every viewport. When scrolling pauses, the
                       measured scroll velocity feeds an under-damped spring that
                       settles to the nearest pole with a bubble; at rest the
                       inline styles are CLEARED so the class-defined CSS owns the
                       pose exactly — any drift self-corrects at every stop.
                       Smoothing is time-based (exponential, dt-aware) so the feel
                       is identical at 30, 60 or 120Hz. */
                    if (shell && !isSubpage) {
                        var sBrand = shell.querySelector('.brand');
                        var sCta = shell.querySelector('.nav-cta');
                        var sNav = shell.querySelector('nav');
                        var sUl = shell.querySelector('nav ul');
                        var sPill = shell.querySelector('.nav-form-btn');
                        var sLinks = Array.prototype.slice.call(shell.querySelectorAll('nav ul a'));
                        var isMobile = function() { return window.innerWidth <= 960; };
                        var clamp01 = function(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); };
                        var lerp = function(a, b, t) { return a + (b - a) * t; };

                        var SCRUB_START = 4;     // px of scroll before the morph begins
                        var SCRUB_RANGE = 130;   // px of scroll for the full morph
                        var IDLE_MS = 120;       // scroll silence before the settle spring fires
                        // Under-damped on purpose — the bubble is the point.
                        var SETTLE = { type: 'spring', stiffness: 340, damping: 15, mass: 1 };
                        var VEL_BOOST = 1.6;
                        var VEL_MAX = 6;

                        // ── Dual-state measurement ──
                        // Both poles are read from the real rendered CSS by toggling
                        // the class inside one synchronous block (no paint between).
                        // Heights use scrollHeight so a collapsed/clipped element
                        // still reports its true content size — measuring while
                        // compressed previously fell back to a constant and the
                        // expanded brand came back CLIPPED.
                        var G = null;
                        var SCRUBBED_PROPS = ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'borderRadius', 'top', 'marginTop', 'marginBottom'];
                        var clearInline = function() {
                            SCRUBBED_PROPS.forEach(function(k) { shell.style[k] = ''; });
                            if (sNav) { sNav.style.marginTop = ''; sNav.style.marginBottom = ''; sNav.style.paddingRight = ''; }
                            if (sUl) { sUl.style.minHeight = ''; sUl.style.paddingLeft = ''; sUl.style.paddingRight = ''; sUl.style.justifyContent = ''; sUl.style.gap = ''; }
                            sLinks.forEach(function(a) { a.style.fontSize = ''; a.style.letterSpacing = ''; });
                            [sBrand, sCta].forEach(function(el) {
                                if (el) { el.style.maxHeight = ''; el.style.opacity = ''; el.style.transform = ''; el.style.pointerEvents = ''; }
                            });
                            if (sPill) { sPill.style.visibility = ''; sPill.style.opacity = ''; sPill.style.transform = ''; sPill.style.pointerEvents = ''; }
                            lastW = {};
                        };
                        var readPole = function() {
                            var cs = getComputedStyle(shell);
                            var ucs = sUl ? getComputedStyle(sUl) : null;
                            var lcs = sLinks[0] ? getComputedStyle(sLinks[0]) : null;
                            return {
                                padV: parseFloat(cs.paddingTop) || 0,
                                padH: parseFloat(cs.paddingLeft) || 0,
                                radius: parseFloat(cs.borderRadius) || 0,
                                top: parseFloat(cs.top) || 0,
                                mTop: parseFloat(cs.marginTop) || 0,
                                mBot: parseFloat(cs.marginBottom) || 0,
                                navM: sNav ? (parseFloat(getComputedStyle(sNav).marginTop) || 0) : 0,
                                navPadR: sNav ? (parseFloat(getComputedStyle(sNav).paddingRight) || 0) : 0,
                                rowH: sUl ? Math.max(parseFloat(ucs.minHeight) || 0, sUl.getBoundingClientRect().height) : 0,
                                gap: ucs ? (parseFloat(ucs.columnGap) || 0) : 0,
                                font: lcs ? (parseFloat(lcs.fontSize) || 14) : 14,
                                ls: lcs ? (parseFloat(lcs.letterSpacing) || 0) : 0,
                                linkW: sLinks.reduce(function(t, a) { return t + a.getBoundingClientRect().width; }, 0),
                                ulW: sUl ? sUl.getBoundingClientRect().width : 0,
                                brandH: sBrand ? sBrand.scrollHeight : 0,
                                ctaH: sCta ? sCta.scrollHeight : 0
                            };
                        };
                        var measure = function() {
                            if (!isMobile()) { G = null; return; }
                            var had = shell.classList.contains('scrolled-mobile');
                            clearInline();
                            shell.classList.remove('scrolled-mobile');
                            var E = readPole();
                            shell.classList.add('scrolled-mobile');
                            var C = readPole();
                            shell.classList.toggle('scrolled-mobile', had);
                            // Emulated expanded cluster: with space-between + side
                            // padding P0, the links sit exactly where the natural
                            // centered-with-gap layout puts them — so distribution
                            // interpolates instead of jumping at a justify flip.
                            var cluster = E.linkW + Math.max(0, sLinks.length - 1) * E.gap;
                            G = {
                                E: E, C: C,
                                P0: Math.max(0, (E.ulW - cluster) / 2),
                                pillOn: sPill ? getComputedStyle(sPill).display !== 'none' : false
                            };
                        };

                        // ── Cached writer: skip identical writes, round to 0.1px ──
                        var lastW = {};
                        var W = function(el, prop, val) {
                            var key = (el === shell ? 's' : (el.className || 'x')) + ':' + prop;
                            if (lastW[key] === val) return;
                            lastW[key] = val;
                            el.style[prop] = val;
                        };
                        // Quarter-px quantization halves style invalidations vs
                        // 0.1px — sub-quarter-pixel layout deltas are invisible,
                        // and every skipped write is one less backdrop-filter
                        // re-composite on iOS.
                        var px = function(v) { return (Math.round(v * 4) / 4) + 'px'; };

                        var p = 0; // progress; may overshoot [0,1] for the bubble

                        var applyP = function(v) {
                            p = v;
                            if (!G) return;
                            var c = clamp01(v);
                            var E = G.E, C = G.C;
                            W(shell, 'paddingTop', px(Math.max(0, lerp(E.padV, C.padV, v))));
                            W(shell, 'paddingBottom', px(Math.max(0, lerp(E.padV, C.padV, v))));
                            W(shell, 'paddingLeft', px(Math.max(0, lerp(E.padH, C.padH, c))));
                            W(shell, 'paddingRight', px(Math.max(0, lerp(E.padH, C.padH, c))));
                            W(shell, 'borderRadius', px(lerp(E.radius, C.radius, c)));
                            W(shell, 'top', px(lerp(E.top, C.top, c)));
                            W(shell, 'marginTop', px(lerp(E.mTop, C.mTop, c)));
                            W(shell, 'marginBottom', px(lerp(E.mBot, C.mBot, c)));
                            if (sNav) {
                                W(sNav, 'marginTop', px(Math.max(0, lerp(E.navM, C.navM, v))));
                                W(sNav, 'marginBottom', px(Math.max(0, lerp(E.navM, C.navM, v))));
                                W(sNav, 'paddingRight', px(lerp(E.navPadR, C.navPadR, c)));
                            }
                            if (sUl) {
                                // The row carries the overshoot — the pill visibly
                                // bounces past its resting size and springs back.
                                W(sUl, 'minHeight', px(Math.max(E.rowH, lerp(E.rowH, C.rowH, v))));
                                W(sUl, 'justifyContent', 'space-between');
                                W(sUl, 'gap', '0px');
                                W(sUl, 'paddingLeft', px(lerp(G.P0, 0, c)));
                                W(sUl, 'paddingRight', px(lerp(G.P0, 0, c)));
                            }
                            for (var i = 0; i < sLinks.length; i++) {
                                W(sLinks[i], 'fontSize', px(lerp(E.font, C.font, c)));
                                W(sLinks[i], 'letterSpacing', px(lerp(E.ls, C.ls, c)));
                            }
                            [[sBrand, E.brandH], [sCta, E.ctaH]].forEach(function(pair) {
                                var el = pair[0];
                                if (!el) return;
                                // At the expanded pole, no clamp at all — the element
                                // is exactly its natural self (no clipped subtitle,
                                // ever, regardless of measurement).
                                W(el, 'maxHeight', c <= 0.015 ? '' : px(Math.max(0, lerp(pair[1], 0, v))));
                                W(el, 'opacity', String(Math.round(clamp01(1 - c * 1.9) * 100) / 100));
                                W(el, 'transform', 'translateY(' + Math.round(-6 * c * 10) / 10 + 'px) scale(' + (Math.round((1 - 0.03 * c) * 1000) / 1000) + ')');
                                W(el, 'pointerEvents', c > 0.5 ? 'none' : '');
                            });
                            if (sPill && G.pillOn) {
                                W(sPill, 'visibility', c > 0.4 ? 'visible' : 'hidden');
                                W(sPill, 'opacity', String(Math.round(clamp01((c - 0.45) * 1.9) * 100) / 100));
                                W(sPill, 'transform', 'translateY(-50%) scale(' + (Math.round((0.85 + 0.15 * Math.max(0, v - 0.3) / 0.7) * 1000) / 1000) + ')');
                                W(sPill, 'pointerEvents', c > 0.85 ? '' : 'none');
                            }
                            // Class flips only at the POLES (hysteresis) — never at
                            // 0.5 mid-scrub, where the discrete CSS used to yank the
                            // link row. Everything discrete is inline-interpolated
                            // above, so the flip is visually a no-op.
                            var cur = shell.classList.contains('scrolled-mobile');
                            if (cur && c < 0.08) shell.classList.remove('scrolled-mobile');
                            else if (!cur && c > 0.92) shell.classList.add('scrolled-mobile');
                        };

                        var pTarget = function() {
                            return clamp01((window.scrollY - SCRUB_START) / SCRUB_RANGE);
                        };

                        // ── The loop: scrub while scrolling, spring when idle ──
                        var rafOn = false;
                        var lastScrollT = 0;
                        var lastTickT = 0;
                        var prevFrameT = 0;
                        var settleAnim = null;
                        var settleStartT = 0;
                        var settlePole = 0;
                        var settledAt = null;
                        var hist = [];

                        var stopSettle = function() {
                            if (settleAnim) { try { settleAnim.stop(); } catch (e) {} settleAnim = null; }
                        };

                        // Rest is self-correcting: snap the class to the pole and
                        // clear every inline style, so the pure CSS class state
                        // owns the pose. Any measurement drift vanishes at every
                        // stop instead of accumulating.
                        var restAt = function(pole) {
                            p = pole;
                            settledAt = pole;
                            shell.classList.toggle('scrolled-mobile', pole === 1);
                            clearInline();
                        };

                        // One smoothing step toward the finger. Driven from BOTH
                        // the rAF tick and the scroll event itself: iOS 26 WebKit
                        // throttles rAF during touch scrolling while scroll events
                        // keep firing, so rAF-only stepping visibly stuttered
                        // there. The exponential dt-based smoothing makes double
                        // stepping in one frame harmless (tiny dt → tiny alpha),
                        // and the feel is identical at 30, 60 and 120Hz.
                        var lastStepT = 0;
                        var scrubStep = function(now, dt) {
                            var t = pTarget();
                            var alpha = 1 - Math.exp(-dt / 55);
                            var next = p + (t - p) * alpha;
                            if (Math.abs(next - t) < 0.002) next = t;
                            if (next !== p) applyP(next);
                            settledAt = null;
                            lastStepT = now;
                            hist.push([now, p]);
                            if (hist.length > 6) hist.shift();
                        };

                        var tick = function(now) {
                            lastTickT = now;
                            if (!isMobile()) { rafOn = false; return; }
                            var dt = prevFrameT ? Math.min(64, now - prevFrameT) : 16;
                            prevFrameT = now;
                            // Settle watchdog — if the spring controls ever go inert
                            // they would block both branches and park the nav
                            // mid-pose. Force-land the pole after a deadline.
                            if (settleAnim && (now - settleStartT) > 1200) {
                                stopSettle();
                                restAt(settlePole);
                            }
                            var scrolling = (now - lastScrollT) < IDLE_MS;
                            if (scrolling && !settleAnim) {
                                scrubStep(now, dt);
                            } else if (!scrolling && !settleAnim && settledAt === null) {
                                // SETTLE: spring to the nearest pole carrying the
                                // real scroll velocity — a flick lands with a bigger
                                // bubble than a gentle stop.
                                var pole = p >= 0.5 ? 1 : 0;
                                var vel = 0;
                                if (hist.length > 1) {
                                    var a = hist[0], b2 = hist[hist.length - 1];
                                    if (b2[0] > a[0]) vel = (b2[1] - a[1]) / ((b2[0] - a[0]) / 1000);
                                }
                                vel = Math.max(-VEL_MAX, Math.min(VEL_MAX, vel * VEL_BOOST));
                                hist = [];
                                if (Math.abs(p - pole) < 0.001 && Math.abs(vel) < 0.05) {
                                    restAt(pole);
                                } else {
                                    settleStartT = now;
                                    settlePole = pole;
                                    var anim = window.Motion.animate(p, pole, Object.assign({}, SETTLE, {
                                        velocity: vel,
                                        onUpdate: function(v) { applyP(v); },
                                        onComplete: function() {
                                            if (settleAnim === anim) { settleAnim = null; restAt(pole); }
                                        }
                                    }));
                                    settleAnim = anim;
                                    if (anim && typeof anim.then === 'function') {
                                        anim.then(function() {
                                            if (settleAnim === anim) { settleAnim = null; restAt(pole); }
                                        }, function() {});
                                    }
                                }
                            }
                            if (settledAt !== null && !settleAnim && (now - lastScrollT) > 400) { rafOn = false; prevFrameT = 0; return; }
                            requestAnimationFrame(tick);
                        };

                        var wake = function() {
                            var now = performance.now();
                            lastScrollT = now;
                            // New gesture mid-settle: the finger takes over from the
                            // spring's current value — continuity, never a jump.
                            if (settleAnim) { stopSettle(); }
                            settledAt = null;
                            // Event-driven step: when rAF is throttled mid-gesture
                            // (iOS 26), the scroll event itself advances the scrub
                            // so the morph never falls behind the finger.
                            if (isMobile() && !settleAnim && (now - lastStepT) > 12) {
                                scrubStep(now, Math.min(64, lastStepT ? now - lastStepT : 16));
                            }
                            // Self-healing: if the rAF chain ever died with the flag
                            // up (exception, throttled tab), re-arm on quiet ticks.
                            if ((!rafOn || (now - lastTickT) > 250) && isMobile()) {
                                rafOn = true;
                                prevFrameT = 0;
                                requestAnimationFrame(tick);
                            }
                        };

                        // Take ownership: home-scripts' threshold logic stands down
                        // (it remains the no-JS / no-Motion fallback).
                        window.__navScrubActive = true;
                        html.classList.add('nav-scrub');
                        measure();
                        restAt(pTarget() >= 0.5 ? 1 : 0);

                        window.addEventListener('scroll', wake, { passive: true });
                        window.addEventListener('pageshow', function(e) {
                            if (!e.persisted) return;
                            stopSettle(); hist = [];
                            measure();
                            restAt(pTarget() >= 0.5 ? 1 : 0);
                        });
                        // Late font swaps change the brand/link metrics — refresh
                        // the poles once type is final (only while at rest).
                        if (document.fonts && document.fonts.ready) {
                            document.fonts.ready.then(function() {
                                if (settledAt !== null && !settleAnim) { measure(); restAt(settledAt); }
                            });
                        }
                        var rsT2 = null;
                        window.addEventListener('resize', function() {
                            if (rsT2) clearTimeout(rsT2);
                            rsT2 = setTimeout(function() {
                                stopSettle(); hist = [];
                                if (isMobile()) { measure(); restAt(pTarget() >= 0.5 ? 1 : 0); }
                                else { G = null; clearInline(); }
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
