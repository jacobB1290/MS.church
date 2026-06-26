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
// Audio specifically: the player is PRELOADED paused (autoplay:0) as the video
// nears the viewport, and the tap calls playVideo() inside the gesture on that
// ready player. Browsers treat that as a user-initiated play and allow SOUND —
// unlike autoplay:1, which is governed by the muted-autoplay policy (that played
// muted ~half the time). autoplay:1 + a muted watchdog remain only as fallbacks.
//
// Emitted once on the home page (after homeScripts). Exposes:
//   window.__mscbWatchPrefetch()       — warm the /watch HTML + API on first intent.
//   window.__mscbWatchPreload(videoId) — warm HTML + API + the paused player.
//   window.__mscbWatchMorph(opts)      — start the hand-off inside the click gesture;
//                                        returns true if it took over, false to defer
//                                        to the caller's hard-nav fallback.
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
                // Warm the YouTube IFrame API ahead of the tap so the persistent player can be
                // built through the API (new YT.Player) IN the gesture — which both starts with
                // sound and gives us onAutoplayBlocked, so a browser that refuses sound recovers
                // to muted instead of leaving YouTube's own play screen up.
                var ytApi = null;
                function loadYT() {
                    if (window.YT && window.YT.Player) return Promise.resolve();
                    if (ytApi) return ytApi;
                    ytApi = new Promise(function (res) {
                        var prev = window.onYouTubeIframeAPIReady;
                        window.onYouTubeIframeAPIReady = function () { if (prev) prev(); res(); };
                        var s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s);
                    });
                    return ytApi;
                }
                // Warm the API IMMEDIATELY (not on idle): on mobile there is no hover and the
                // pointerdown->click gap is far too short to fetch the API script, so idle
                // warming lost the race ~half the time and the tap fell to the raw embed (which
                // can sit on YouTube's play screen). The home card already loads youtube.com
                // thumbnails, so this adds no new third party.
                loadYT();
                window.__mscbWatchPrefetch = function () { try { loadYT(); prefetch().catch(function () {}); } catch (e) {} };

                var started = false, inWatch = false, converted = false, vhost = null, slot = null, reposTimer = null, player = null, playWatch = null;
                var homeHolderEl = null, homeScrollY = 0, lastVideoId = null;
                function py() { return window.pageYOffset || document.documentElement.scrollTop || 0; }
                function px() { return window.pageXOffset || document.documentElement.scrollLeft || 0; }
                function setRect(el, top, left, w, h) { el.style.top = top + 'px'; el.style.left = left + 'px'; el.style.width = w + 'px'; el.style.height = h + 'px'; }
                function slotDocRect() { var r = slot.getBoundingClientRect(); return { top: r.top + py(), left: r.left + px(), w: r.width, h: r.height }; }

                var playerReady = false, playOnReady = false, builtVideoId = null;
                // The persistent player lives in a host that is never re-parented (re-parenting
                // an <iframe> reloads it). FIXED during the hand-off (a content swap resets
                // window scroll; fixed is immune), converted to ABSOLUTE once landed so it
                // scrolls with the page.
                function ensureVhost() {
                    if (vhost) return;
                    vhost = document.createElement('div');
                    vhost.id = 'mscb-vhost';
                    vhost.style.cssText = 'position:fixed;z-index:40;overflow:hidden;border-radius:var(--radius-lg,16px);background:#000 center/cover no-repeat;box-shadow:var(--shadow-lg,0 18px 50px rgba(0,0,0,.18));will-change:transform;opacity:0;pointer-events:none;left:0;top:0;width:1px;height:1px;';
                    document.body.appendChild(vhost);
                }
                // PRELOAD the player PAUSED (autoplay:0) before the tap. The tap then calls
                // playVideo() inside the gesture on a READY player, which browsers treat as a
                // user-initiated play and allow WITH SOUND. (autoplay:1 is governed by the
                // muted-autoplay policy instead — that is what played muted ~half the time.)
                function preloadPlayer(videoId) {
                    if (player || !videoId) return;
                    builtVideoId = videoId;
                    ensureVhost();
                    var w = document.getElementById('video-embed-wrapper');
                    if (w) { var r = w.getBoundingClientRect(); if (r.width) setRect(vhost, r.top, r.left, r.width, r.height); }
                    var build = function () {
                        if (player || !(window.YT && window.YT.Player)) return;
                        var mount = document.createElement('div');
                        mount.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
                        vhost.appendChild(mount);
                        try {
                            player = new YT.Player(mount, {
                                videoId: videoId,
                                playerVars: { autoplay: 0, controls: 1, rel: 0, modestbranding: 1, playsinline: 1, enablejsapi: 1, origin: location.origin },
                                events: {
                                    onReady: function () { playerReady = true; if (playOnReady) { try { player.playVideo(); } catch (e) {} } },
                                    onStateChange: function (e) { if (e && (e.data === 1 || e.data === 3)) clearPlayWatch(); },
                                    onError: function () {}
                                }
                            });
                        } catch (e) { player = null; }
                    };
                    if (window.YT && window.YT.Player) build();
                    else loadYT().then(build).catch(function () {});
                }
                window.__mscbWatchPreload = function (videoId) { try { loadYT(); prefetch().catch(function () {}); preloadPlayer(videoId); } catch (e) {} };

                // Fallback when the player wasn't preloaded in time: create it AT the tap with
                // autoplay:1 (best effort) + a muted watchdog so it can never sit on YouTube's
                // play screen. Raw embed if the API itself isn't up yet.
                function createAtTap(videoId) {
                    if (player) { try { player.destroy(); } catch (e) {} player = null; }
                    if (window.YT && window.YT.Player) {
                        var mount = document.createElement('div');
                        mount.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
                        vhost.appendChild(mount);
                        try {
                            player = new YT.Player(mount, {
                                videoId: videoId,
                                playerVars: { autoplay: 1, controls: 1, rel: 0, modestbranding: 1, playsinline: 1, enablejsapi: 1, origin: location.origin },
                                events: {
                                    onReady: function () { try { player.playVideo(); } catch (e) {} armPlayWatch(); },
                                    onStateChange: function (e) { if (e && (e.data === 1 || e.data === 3)) clearPlayWatch(); },
                                    onAutoplayBlocked: function () { forceMutedPlay(); },
                                    onError: function () {}
                                }
                            });
                            armPlayWatch();
                            return;
                        } catch (e) { player = null; }
                    }
                    var f = document.createElement('iframe');
                    f.title = 'Sunday service video from Morning Star Christian Church';
                    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
                    f.setAttribute('allowfullscreen', '');
                    f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;display:block;';
                    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(videoId) +
                        '?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1&controls=1&origin=' + encodeURIComponent(location.origin);
                    vhost.appendChild(f);
                    var rawPlaying = false;
                    var onMsg = function (ev) { if (ev.source !== f.contentWindow) return; try { var d = JSON.parse(ev.data); if (d && d.event === 'onStateChange' && (d.info === 1 || d.info === 3)) rawPlaying = true; } catch (e) {} };
                    window.addEventListener('message', onMsg);
                    f.addEventListener('load', function () { try { f.contentWindow.postMessage('{"event":"listening"}', '*'); f.contentWindow.postMessage('{"event":"command","func":"addEventListener","args":["onStateChange"]}', '*'); } catch (e) {} });
                    setTimeout(function () {
                        if (rawPlaying) return;
                        if (f.src.indexOf('mute=1') < 0) f.src = f.src + '&mute=1';
                        showSoundBtn();
                    }, 1900);
                }
                // Recovery for any browser that refuses unmuted play: muted (always allowed) +
                // a one-tap sound button. Never YouTube's own play screen.
                function forceMutedPlay() {
                    clearPlayWatch();
                    try { if (player) { player.mute(); player.playVideo(); } } catch (e) {}
                    showSoundBtn();
                }
                function armPlayWatch() {
                    clearPlayWatch();
                    playWatch = setTimeout(function () {
                        var st = null; try { if (player && player.getPlayerState) st = player.getPlayerState(); } catch (e) {}
                        if (st === 1 || st === 3) return;   // playing / buffering -> fine
                        forceMutedPlay();                    // refused -> muted + sound button
                    }, 1800);
                }
                function clearPlayWatch() { if (playWatch) { clearTimeout(playWatch); playWatch = null; } }
                // Shown only if a browser refuses unmuted autoplay (rare in-gesture): one tap
                // restores sound. The common path never sees it.
                function showSoundBtn() {
                    if (!vhost || vhost.querySelector('.mscb-sound')) return;
                    var b = document.createElement('button');
                    b.type = 'button'; b.className = 'mscb-sound'; b.setAttribute('aria-label', 'Turn on sound');
                    b.style.cssText = 'position:absolute;z-index:2;left:50%;bottom:16px;transform:translateX(-50%);display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border:0;border-radius:999px;background:rgba(0,0,0,.74);color:#fff;font:600 14px/1 var(--font-body,sans-serif);cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.3);';
                    b.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg><span>Tap for sound</span>';
                    b.addEventListener('click', function (e) {
                        e.preventDefault(); e.stopPropagation();
                        try {
                            if (player && player.unMute) { player.unMute(); player.setVolume(100); }
                            else {
                                var nf = vhost.querySelector('iframe');
                                if (nf && nf.contentWindow) {
                                    nf.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
                                    nf.contentWindow.postMessage('{"event":"command","func":"setVolume","args":[100]}', '*');
                                }
                            }
                        } catch (er) {}
                        if (b.parentNode) b.parentNode.removeChild(b);
                    });
                    vhost.appendChild(b);
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
                    if (!inWatch || !vhost || !slot || !converted) return;
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
                    // The video is FIXED, so this is its true on-screen spot (where it was
                    // tapped) — unaffected by the swap's scroll reset.
                    var first = vhost.getBoundingClientRect();
                    var homeCenterY = first.top + first.height / 2;
                    // Scroll so the feature slot's CENTER lands exactly where the thumbnail's
                    // center was — so the video stays put and only SCALES up (true continuity),
                    // not travelling to the top. If the slot sits too high in the document to
                    // reach that, pad its section down (capped), like the ?play=1 arrival.
                    var sec = slot.closest('section'); if (sec) sec.style.paddingTop = '';
                    var sr = slot.getBoundingClientRect();
                    var slotDocCenter = sr.top + py() + sr.height / 2;
                    var target = slotDocCenter - homeCenterY;
                    if (target < 0 && sec) {
                        var sp = Math.min(320, Math.round(-target));
                        sec.style.paddingTop = sp + 'px';
                        sr = slot.getBoundingClientRect();
                        slotDocCenter = sr.top + py() + sr.height / 2;
                        target = slotDocCenter - homeCenterY;
                    }
                    try { window.scrollTo(0, Math.max(0, Math.round(target))); } catch (e) {}
                    // The slot's viewport rect after aligning — where the video must land.
                    var last = slot.getBoundingClientRect();
                    setRect(vhost, last.top, last.left, last.width, last.height);
                    // Once landed, convert FIXED -> ABSOLUTE (document coords) so the player
                    // scrolls naturally with the page from then on.
                    var convert = function () {
                        if (converted) return; converted = true;
                        var lr = vhost.getBoundingClientRect();
                        vhost.style.transition = 'none'; vhost.style.transform = 'none';
                        vhost.style.position = 'absolute';
                        setRect(vhost, lr.top + py(), lr.left + px(), lr.width, lr.height);
                        scheduleRepos();
                    };
                    if (reduce) { vhost.style.transition = 'none'; vhost.style.transform = 'none'; convert(); return; }
                    var dx = first.left - last.left, dy = first.top - last.top;
                    var sx = last.width ? first.width / last.width : 1, sy = last.height ? first.height / last.height : 1;
                    vhost.style.transformOrigin = 'top left';
                    vhost.style.transition = 'none';
                    vhost.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
                    void vhost.offsetWidth;
                    requestAnimationFrame(function () {
                        vhost.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
                        vhost.style.transform = 'none';
                    });
                    setTimeout(convert, 680);
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
                        // Preserve the live home content (DOM + listeners + scroll) by DETACHING
                        // it into a holder rather than destroying it, so Back can restore it
                        // instantly and land exactly where the video was tapped. Then mount the
                        // watch content as DIRECT children of .page (so its CSS direct-child
                        // selectors still match).
                        var holder = document.createElement('div');
                        while (pageEl.firstChild) holder.appendChild(pageEl.firstChild);
                        homeHolderEl = holder;
                        pageEl.innerHTML = newPage.innerHTML;
                        try { document.body.classList.add('page-subpage'); } catch (e) {}
                        try { document.title = doc.title || document.title; } catch (e) {}
                        try { history.pushState({ mscbWatch: 1 }, '', '/watch'); } catch (e) {}
                        inWatch = true;
                        slot = pageEl.querySelector('.mscb-feature-slot');
                        runScripts(doc);
                        morphHostToSlot();
                        requestAnimationFrame(function () { pageEl.style.opacity = '1'; });
                    };
                    if (reduce) { apply(); return; }
                    // Quick fade of the surrounding content out, swap, fade the watch content
                    // back in while the anchored video scales into the feature slot.
                    pageEl.style.transition = 'opacity .16s ease';
                    pageEl.style.opacity = '0';
                    setTimeout(apply, 160);
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
                        homeScrollY = py();          // where the user was on home, for Back
                        lastVideoId = opts.videoId;
                        ensureVhost();
                        if (opts.thumb) { try { vhost.style.backgroundImage = 'url(' + opts.thumb + ')'; } catch (e) {} }
                        // Reveal the host over the tapped thumbnail.
                        setRect(vhost, rect.top, rect.left, rect.width, rect.height);
                        vhost.style.opacity = '1'; vhost.style.pointerEvents = 'auto';
                        // SOUND path: a preloaded, ready player + explicit playVideo() inside this
                        // gesture = a user-initiated play, allowed with sound on every browser.
                        if (player && builtVideoId === opts.videoId) {
                            if (playerReady) { try { player.playVideo(); } catch (e) {} }
                            else { playOnReady = true; }   // ready momentarily; play the instant it is
                            armPlayWatch();
                        } else {
                            createAtTap(opts.videoId);      // not preloaded in time -> best effort
                        }
                        prefetch().then(function (html) { finishSwap(html, rect); }).catch(function () { theater(); });
                        return true;
                    } catch (e) { return false; }
                };

                // Back / forward across the same-page hand-off.
                window.addEventListener('popstate', function () {
                    // Forward back INTO /watch after we'd restored home: load the real page.
                    if (!inWatch && location.pathname === '/watch') { try { location.reload(); } catch (e) {} return; }
                    if (!inWatch) return;
                    // Back to home: restore the PRESERVED home content (listeners intact) and the
                    // exact scroll position, tear down the morph. No reload, so the visitor lands
                    // right where the video was tapped — like the normal /watch back button.
                    try {
                        if (homeHolderEl) {
                            pageEl.innerHTML = '';
                            while (homeHolderEl.firstChild) pageEl.appendChild(homeHolderEl.firstChild);
                            homeHolderEl = null;
                        }
                        document.body.classList.remove('page-subpage');
                        pageEl.style.transition = ''; pageEl.style.opacity = '';
                        try { if (player && player.destroy) player.destroy(); } catch (e) {}
                        player = null; playerReady = false; playOnReady = false;
                        clearPlayWatch();
                        if (vhost && vhost.parentNode) vhost.parentNode.removeChild(vhost);
                        vhost = null; slot = null; inWatch = false; converted = false; started = false;
                        window.scrollTo(0, homeScrollY);
                        // Re-arm the paused preload so a second play is instant + with sound again.
                        if (lastVideoId) { builtVideoId = null; preloadPlayer(lastVideoId); }
                    } catch (e) { try { location.reload(); } catch (e2) {} }
                });
                window.addEventListener('resize', function () { if (inWatch) scheduleRepos(); });
            })();
        </script>`
}
