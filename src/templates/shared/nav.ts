// Shared site navigation — used by the home page only.
// All links are in-page anchor scrolls. Subpages (/about, /outreach) use
// `subpage-header.ts` instead, which has no nav — just the logo + back.

const NAV_ITEMS: { label: string; hash: string }[] = [
  { label: 'Schedule', hash: 'schedule' },
  { label: 'About', hash: 'about' },
  { label: 'Outreach', hash: 'outreach' },
  { label: 'Watch', hash: 'watch' },
]

export function nav(): string {
  const items = NAV_ITEMS.map(
    (item) => `<li><a href="#${item.hash}">${item.label}</a></li>`,
  ).join('\n                        ')

  return `<header class="nav-shell">
                <a class="brand" href="#home" aria-label="Morning Star Christian Church · Home">
                    <span class="brand-title">Morning Star</span>
                    <span class="brand-subtitle">Christian Church</span>
                </a>
                <nav aria-label="Primary">
                    <ul>
                        ${items}
                    </ul>
                </nav>
                <a class="nav-cta" href="#contact">Contact</a>
                <a class="nav-form-btn" href="#contact">Contact</a>
            </header>`
}
