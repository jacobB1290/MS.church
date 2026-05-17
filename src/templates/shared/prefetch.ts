// Shared "speed up next-page nav" snippet.
//
// Strategy (v1.49.36):
//
//  1. Speculation Rules API. Chrome/Edge prerender internal links on
//     hover or touchstart (the "moderate" eagerness setting) — when
//     the user actually navigates, the destination page is already
//     fully rendered in a hidden background tab and the visible
//     activation is essentially free. /api/* and target=_blank links
//     are excluded so we don't waste bandwidth on resources the user
//     isn't viewing or on outbound links.
//
//  2. Hover / touchstart prefetch fallback. Browsers without
//     speculation-rules support (Safari and Firefox today) fall back
//     to vanilla <link rel="prefetch"> injected on the first hover or
//     touch over any internal anchor. The HTML lands in the disk
//     cache, so the actual click navigates fetching nothing from
//     the network and gets a fully cached response. Same internal
//     skip rules — no api/, no external, no target=_blank, no
//     same-page hash links.
//
//  3. The check `HTMLScriptElement.supports('speculationrules')` is
//     the spec-defined feature detection — we only attach the
//     fallback listeners in browsers where Speculation Rules will
//     NOT fire. No double work.
//
// Both layers attach passive listeners on document (capture phase)
// so dynamically added anchors are caught too. Set-based dedupe
// means a hovered link only triggers one prefetch per page load.

const SPECULATION_RULES = JSON.stringify({
  prerender: [
    {
      where: {
        and: [
          { href_matches: '/*' },
          { not: { href_matches: '/api/*' } },
          { not: { selector_matches: '[target=_blank]' } },
          { not: { selector_matches: '[rel~=external]' } },
        ],
      },
      eagerness: 'moderate',
    },
  ],
})

export function prefetchSnippet(): string {
  return `
        <!-- Instant navigation: prerender internal links on hover/touch.
             See src/templates/shared/prefetch.ts for the full rationale. -->
        <script type="speculationrules">${SPECULATION_RULES}</script>
        <script>
            (function() {
                try {
                    if (typeof HTMLScriptElement !== 'undefined'
                        && HTMLScriptElement.supports
                        && HTMLScriptElement.supports('speculationrules')) {
                        return;
                    }
                } catch (e) {}
                var prefetched = new Set();
                function prefetch(path) {
                    if (prefetched.has(path)) return;
                    prefetched.add(path);
                    var link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.href = path;
                    link.as = 'document';
                    document.head.appendChild(link);
                }
                function maybePrefetch(e) {
                    var t = e.target;
                    var a = t && t.closest ? t.closest('a[href]') : null;
                    if (!a) return;
                    if (a.target === '_blank') return;
                    if (a.rel && a.rel.indexOf('external') !== -1) return;
                    try {
                        var url = new URL(a.href);
                        if (url.origin !== location.origin) return;
                        if (url.pathname === location.pathname
                            && url.search === location.search) return;
                        if (url.pathname.indexOf('/api/') === 0) return;
                        prefetch(url.pathname + url.search);
                    } catch (err) {}
                }
                document.addEventListener('mouseover', maybePrefetch, { passive: true, capture: true });
                document.addEventListener('touchstart', maybePrefetch, { passive: true, capture: true });
            })();
        </script>`
}
