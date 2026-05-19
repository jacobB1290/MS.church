// Shared "speed up next-page nav" snippet.
//
// Strategy (v1.62.7):
//
//  1. Speculation Rules API — \`prefetch\` (not \`prerender\`). Chrome
//     fetches the HTML of internal links on hover / touchstart and
//     keeps it in the prefetch cache so the actual navigation reads
//     from cache instead of the network. Fast.
//
//     We intentionally use \`prefetch\` instead of \`prerender\` because
//     prerendered pages activate INSTANTLY without firing a cross-
//     document view transition — Chrome treats prerender activation
//     like bfcache restoration, which has its own restore flow that
//     bypasses the @view-transition rule. The user-visible symptom was
//     "CTA buttons just cut to the next page with no fade". With
//     \`prefetch\` the user still gets the speed boost (HTML is already
//     in disk cache) AND the click triggers a normal navigation that
//     DOES fire the view-transition fade.
//
//  2. Hover / touchstart prefetch fallback. Browsers without
//     speculation-rules support (Safari and Firefox today) fall back
//     to vanilla <link rel="prefetch"> injected on the first hover or
//     touch over any internal anchor. Same effect, same skip rules.
//
//  3. The check HTMLScriptElement.supports('speculationrules') is
//     the spec-defined feature detection — we only attach the
//     fallback listeners in browsers where Speculation Rules will
//     NOT fire. No double work.
//
// Both layers attach passive listeners on document (capture phase)
// so dynamically added anchors are caught too. Set-based dedupe
// means a hovered link only triggers one prefetch per page load.

const SPECULATION_RULES = JSON.stringify({
  prefetch: [
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
        <!-- Fast navigation: prefetch internal links on hover/touch (the
             prerender flow bypassed our view-transition fade, so we use
             prefetch + view-transition together).
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
