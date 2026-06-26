// Same-page "play here -> watch over there" hand-off (home -> /watch) that keeps
// AUDIO. A normal navigation drops the tap's autoplay-with-sound permission the
// instant the new document loads (every browser), which is why the old hard-nav
// hand-off arrived muted with an unmute pill. This controller never navigates:
// it starts the YouTube player INSIDE the tap (so sound is allowed), in a
// persistent element that is never re-parented (moving an <iframe> reloads it and
// would lose the gesture), then fetches /watch and swaps the page's content in
// AROUND the still-playing video, FLIP-morphing it up into the feature slot and
// rewriting the URL to /watch. No reload => audio survives on every browser.
//
// It is pure progressive enhancement: /watch is still fully server-rendered, so
// crawlers, shared links, refresh, and any unsupported browser get the real page.
// Every step is guarded; on any failure it falls back to the hard navigation.
//
// Emitted once on the home page (after homeScripts). Exposes:
//   window.__mscbWatchPrefetch()  — warm the /watch HTML on first intent (hover).
//   window.__mscbWatchMorph(opts) — start the hand-off inside the click gesture;
//                                   returns true if it took over, false to defer
//                                   to the caller's hard-nav fallback.
export function watchHandoffScript(): string {
  return `<script>
            (function () {
                var pageEl = document.querySelector('.page');
                var SUPPORTED = !!(window.fetch && window.history && window.history.pushState &&
                    window.DOMParser && pageEl && window.requestAnimationFrame && window.Promise);
                if (!SUPPORTED) return;
                var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

                var htmlPromise = null;
                function prefetch() {
                    if (htmlPromise) return htmlPromise;
                    htmlPromise = fetch('/watch', { credentials: 'same-origin' }).then(function (r) {
                        if (!r.ok) throw new Error('watch ' + r.status);
                        return r.text();
                    });
                    return htmlPromise;
                }
                window.__mscbWatchPrefetch = function () { try { prefetch().catch(function () {}); } catch (e) {} };

                var started = false, inWatch = false, vhost = null, slot = null, reposTimer = null;
                function py() { return window.pageYOffset || document.documentElement.scrollTop || 0; }
                function px() { return window.pageXOffset || document.documentElement.scrollLeft || 0; }
                function setRect(el, top, left, w, h) { el.style.top = top + 'px'; el.style.left = left + 'px'; el.style.width = w + 'px'; el.style.height = h + 'px'; }
                function slotDocRect() { var r = slot.getBoundingClientRect(); return { top: r.top + py(), left: r.left + px(), w: r.width, h: r.height }; }

                // Build the persistent player, positioned (absolute, document coords so it
                // scrolls with the page) over the tapped thumbnail. autoplay=1 with NO mute,
                // created inside the gesture => starts with sound. controls=1 gives a full
                // native control bar for the morphed feature (the library cards below keep
                // the custom scrubber). A poster background avoids a black flash.
                function buildHost(rect, videoId, thumb) {
                    vhost = document.createElement('div');
                    vhost.id = 'mscb-vhost';
                    vhost.style.cssText = 'position:absolute;z-index:40;overflow:hidden;border-radius:var(--radius-lg,16px);background:#000 center/cover no-repeat;box-shadow:var(--shadow-lg,0 18px 50px rgba(0,0,0,.18));will-change:transform;';
                    if (thumb) { try { vhost.style.backgroundImage = 'url(' + thumb + ')'; } catch (e) {} }
                    setRect(vhost, rect.top + py(), rect.left + px(), rect.width, rect.height);
                    var f = document.createElement('iframe');
                    f.title = 'Sunday service video from Morning Star Christian Church';
                    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
                    f.setAttribute('allowfullscreen', '');
                    f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;display:block;';
                    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(videoId) +
                        '?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1&controls=1&origin=' + encodeURIComponent(location.origin);
                    vhost.appendChild(f);
                    document.body.appendChild(vhost);
                }

                // Inert <script>s injected via innerHTML never execute. Re-create every
                // executable script from the fetched document, in order, so the watch
                // player engine + hub controller (selector, tabs, search, card players)
                // wire themselves to the freshly injected content. JSON data blocks
                // (services-data, search-index) are copied as-is and left alone.
                function runScripts(doc) {
                    // Body scripts only — the watch player engine + hub controller live there.
                    // Head scripts (analytics, fonts, view-transition, JSON-LD) already ran on
                    // this home document; re-running them would redeclare top-level globals.
                    var list = (doc.body || doc).querySelectorAll('script');
                    for (var i = 0; i < list.length; i++) {
                        var old = list[i];
                        var t = (old.getAttribute('type') || '').toLowerCase();
                        if (t && t.indexOf('json') >= 0) continue;
                        var s = document.createElement('script');
                        for (var a = 0; a < old.attributes.length; a++) s.setAttribute(old.attributes[a].name, old.attributes[a].value);
                        s.text = old.textContent || '';
                        document.body.appendChild(s);
                    }
                }

                function reposition() {
                    if (!inWatch || !vhost || !slot) return;
                    var r = slotDocRect();
                    if (!r.w) return;
                    vhost.style.transition = 'none';
                    setRect(vhost, r.top, r.left, r.w, r.h);
                }
                // Re-measure a few times after the swap (web font + image reflow can shift
                // the slot's document position), plus on resize. Cheap and bounded — no
                // per-frame scroll loop, because an absolutely-positioned host already
                // scrolls naturally with the document.
                function scheduleRepos() {
                    clearTimeout(reposTimer);
                    var n = 0;
                    (function tick() { reposition(); if (++n < 6) reposTimer = setTimeout(tick, n * 120); })();
                }

                // Slide the persistent player from the tapped thumbnail's spot up into the
                // watch feature slot (FLIP — the live video keeps playing, never snapshotted
                // or reloaded).
                function morphHostToSlot() {
                    if (!slot || !vhost) return;
                    var first = vhost.getBoundingClientRect();
                    var r = slotDocRect();
                    setRect(vhost, r.top, r.left, r.w, r.h);
                    var navOff = (window.innerWidth <= 960) ? 80 : 96;
                    try { window.scrollTo(0, Math.max(0, Math.round(r.top - navOff))); } catch (e) {}
                    if (reduce) { vhost.style.transition = 'none'; vhost.style.transform = 'none'; return; }
                    var last = vhost.getBoundingClientRect();
                    var dx = first.left - last.left, dy = first.top - last.top;
                    var sx = last.width ? first.width / last.width : 1, sy = last.height ? first.height / last.height : 1;
                    vhost.style.transformOrigin = 'top left';
                    vhost.style.transition = 'none';
                    vhost.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
                    void vhost.offsetWidth;
                    requestAnimationFrame(function () {
                        vhost.style.transition = 'transform .55s cubic-bezier(.22,1,.36,1)';
                        vhost.style.transform = 'none';
                    });
                }

                function finishSwap(html, fromRect) {
                    var doc;
                    try { doc = new DOMParser().parseFromString(html, 'text/html'); } catch (e) { return theater(); }
                    var newPage = doc.querySelector('.page');
                    if (!newPage) return theater();
                    // Replace the watch feature player with an empty 16:9 placeholder our
                    // persistent player covers, so the page's own feature vplayer never
                    // double-loads the same video behind ours.
                    var feat = newPage.querySelector('.watch-feature-player');
                    if (feat) feat.innerHTML = '<div class="mscb-feature-slot" style="position:relative;width:100%;aspect-ratio:16/9;"></div>';
                    else {
                        var fb = newPage.querySelector('.watch-feature-thumb');
                        if (fb && fb.parentNode) { var ph = doc.createElement('div'); ph.className = 'mscb-feature-slot'; ph.style.cssText = 'position:relative;width:100%;aspect-ratio:16/9;'; fb.parentNode.replaceChild(ph, fb); }
                    }
                    var apply = function () {
                        pageEl.innerHTML = newPage.innerHTML;
                        try { document.body.classList.add('page-subpage'); } catch (e) {}
                        try { document.title = doc.title || document.title; } catch (e) {}
                        try { history.pushState({ mscbWatch: 1 }, '', '/watch'); } catch (e) {}
                        inWatch = true;
                        slot = pageEl.querySelector('.mscb-feature-slot');
                        runScripts(doc);
                        morphHostToSlot();
                        requestAnimationFrame(function () { pageEl.style.opacity = '1'; });
                        scheduleRepos();
                    };
                    if (reduce) { apply(); return; }
                    // Fade the home content out, swap, fade the watch content in while the
                    // video glides up between the two states.
                    pageEl.style.transition = 'opacity .26s ease';
                    pageEl.style.opacity = '0';
                    setTimeout(apply, 260);
                }

                // Fetch/parse failed AFTER audio already started: don't drop the sound the
                // visitor just got. Float the playing video as a centered theater overlay
                // with a close button (and a real link to the full page).
                function theater() {
                    if (!vhost) return;
                    inWatch = true;
                    pageEl.style.opacity = '1';
                    vhost.style.position = 'fixed';
                    vhost.style.transition = 'none';
                    var resize = function () {
                        var w = Math.min(960, Math.round(window.innerWidth * 0.92));
                        var h = Math.round(w * 9 / 16);
                        vhost.style.width = w + 'px'; vhost.style.height = h + 'px';
                        vhost.style.left = Math.round((window.innerWidth - w) / 2) + 'px';
                        vhost.style.top = Math.max(12, Math.round((window.innerHeight - h) / 2)) + 'px';
                    };
                    resize();
                    window.addEventListener('resize', resize);
                    var x = document.createElement('button');
                    x.type = 'button'; x.setAttribute('aria-label', 'Close video');
                    x.style.cssText = 'position:fixed;z-index:41;top:max(12px,env(safe-area-inset-top));right:16px;width:44px;height:44px;border:0;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;font-size:24px;line-height:1;cursor:pointer;';
                    x.textContent = '\\u00d7';
                    x.addEventListener('click', function () {
                        try { if (vhost && vhost.parentNode) vhost.parentNode.removeChild(vhost); } catch (e) {}
                        try { if (x.parentNode) x.parentNode.removeChild(x); } catch (e) {}
                        window.removeEventListener('resize', resize);
                        vhost = null; inWatch = false; started = false;
                    });
                    document.body.appendChild(x);
                }

                window.__mscbWatchMorph = function (opts) {
                    try {
                        if (started) return true;
                        if (!opts || !opts.wrapper || !opts.videoId) return false;
                        var rect = opts.wrapper.getBoundingClientRect();
                        if (!rect.width || !rect.height) return false;
                        started = true;
                        buildHost(rect, opts.videoId, opts.thumb);   // AUDIO starts here, in the gesture
                        prefetch().then(function (html) { finishSwap(html, rect); }).catch(function () { theater(); });
                        return true;
                    } catch (e) { return false; }
                };

                // Back from our swapped /watch -> a clean home load (re-runs home's own
                // scripts correctly), which also stops the video.
                window.addEventListener('popstate', function () {
                    if (started) { try { location.reload(); } catch (e) { location.href = '/'; } }
                });
                window.addEventListener('resize', function () { if (inWatch) scheduleRepos(); });
            })();
        </script>`
}
