// Minimal nav scripts for non-home pages (no section observers needed).
// Handles:
//   - .scrolled-mobile toggle on scroll (matches home behavior so the
//     contact pill compresses into the smaller gold pill on mobile when
//     the user scrolls past the threshold).
//   - Native smooth-scroll for in-page anchor clicks on this page
//     (e.g. /outreach#sunday-school).

export function navScripts(): string {
  return `<script>
    document.addEventListener('DOMContentLoaded', () => {
        const navShell = document.querySelector('.nav-shell');
        if (!navShell) return;

        function getScrollThreshold() {
            return window.innerWidth <= 960 ? 19 : 32;
        }

        function handleMobileNav() {
            if (window.innerWidth <= 960) {
                if (window.scrollY > getScrollThreshold()) {
                    navShell.classList.add('scrolled-mobile');
                } else {
                    navShell.classList.remove('scrolled-mobile');
                }
            } else {
                navShell.classList.remove('scrolled-mobile');
            }
        }

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(() => {
                    handleMobileNav();
                    ticking = false;
                });
            }
        }, { passive: true });

        handleMobileNav();
        window.addEventListener('resize', handleMobileNav);

        // Same-page anchor smooth scroll (e.g. /outreach#sunday-school
        // from within /outreach). Cross-page anchors (e.g. /#schedule)
        // navigate via the browser default; no smooth scroll on first
        // paint is acceptable.
        document.querySelectorAll('a[href^="#"]').forEach((a) => {
            a.addEventListener('click', (e) => {
                const targetId = a.getAttribute('href');
                if (!targetId || targetId === '#') return;
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    });
</script>`
}
