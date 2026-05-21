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

  // .nav-form-btn renders text by default ("Contact") and collapses to
  // an envelope icon at narrow widths (≤460px) where the text label
  // would push the row into a wrap. CSS toggles label vs icon based on
  // viewport width; aria-label keeps the accessible name stable across
  // both states.
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
                <a class="nav-form-btn" href="${hashPrefix}#contact" aria-label="Contact">
                    <span class="nav-form-btn-label">Contact</span>
                    <svg class="nav-form-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                        <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"/>
                        <path d="M3.6 7.2l8.4 6 8.4-6"/>
                    </svg>
                </a>
            </header>`
}
