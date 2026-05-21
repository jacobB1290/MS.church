// Shared site navigation — single source of truth.
// Rendered on /home directly (in-page anchor scrolls) and on subpages
// (cross-page hash navigation, hidden by default, slides in when the
// subpage menu trigger is activated). Pass hashPrefix='/' on subpages
// so anchors like #schedule become /#schedule (jumps to home with
// hash) instead of trying to scroll to a section that doesn't exist
// on the current page.

const NAV_ITEMS: { label: string; hash: string }[] = [
  { label: 'Schedule', hash: 'schedule' },
  { label: 'About', hash: 'about' },
  { label: 'Outreach', hash: 'outreach' },
  { label: 'Watch', hash: 'watch' },
]

export function nav(hashPrefix = ''): string {
  const items = NAV_ITEMS.map(
    (item) => `<li><a href="${hashPrefix}#${item.hash}">${item.label}</a></li>`,
  ).join('\n                        ')

  return `<header class="nav-shell">
                <a class="brand" href="${hashPrefix || '#home'}" aria-label="Morning Star Christian Church · Home">
                    <span class="brand-title">Morning Star</span>
                    <span class="brand-subtitle">Christian Church</span>
                </a>
                <nav aria-label="Primary">
                    <ul>
                        ${items}
                    </ul>
                </nav>
                <a class="nav-cta" href="${hashPrefix}#contact">Contact</a>
                <a class="nav-form-btn" href="${hashPrefix}#contact">Contact</a>
            </header>`
}
