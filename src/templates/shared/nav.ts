// Shared site navigation.
// Used by the home page and (in Phase 2) the /about and /outreach pages.
//
// Each nav item is configured with where it ultimately lives:
//   - "anchor" → a section on /. From /, clicking it triggers home-page
//     smooth-scroll JS. From another page, the browser navigates to
//     /#hash and jumps natively to the section.
//   - "page"   → its own URL.
//
// `currentPath` drives `aria-current="page"` on the matching link.

type NavTarget = { kind: 'anchor'; hash: string } | { kind: 'page'; path: string }

type NavItem = {
  label: string
  target: NavTarget
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', target: { kind: 'anchor', hash: 'home' } },
  { label: 'Schedule', target: { kind: 'anchor', hash: 'schedule' } },
  { label: 'Outreach', target: { kind: 'anchor', hash: 'outreach' } },
  { label: 'Watch', target: { kind: 'anchor', hash: 'watch' } },
]

const CONTACT: NavTarget = { kind: 'anchor', hash: 'contact' }

function hrefFor(target: NavTarget, currentPath: string): string {
  if (target.kind === 'page') return target.path
  return currentPath === '/' ? `#${target.hash}` : `/#${target.hash}`
}

function isActive(target: NavTarget, currentPath: string): boolean {
  return target.kind === 'page' && target.path === currentPath
}

export function nav(currentPath: string = '/'): string {
  const items = NAV_ITEMS.map((item) => {
    const href = hrefFor(item.target, currentPath)
    const current = isActive(item.target, currentPath) ? ' aria-current="page"' : ''
    return `<li><a href="${href}"${current}>${item.label}</a></li>`
  }).join('\n                        ')

  const contactHref = hrefFor(CONTACT, currentPath)
  const brandHref = currentPath === '/' ? '#home' : '/'

  return `<header class="nav-shell">
                <a class="brand" href="${brandHref}" aria-label="Morning Star Christian Church — Home">
                    <span class="brand-title">Morning Star</span>
                    <span class="brand-subtitle">Christian Church</span>
                </a>
                <nav aria-label="Primary">
                    <ul>
                        ${items}
                    </ul>
                </nav>
                <a class="nav-cta" href="${contactHref}">Contact</a>
                <a class="nav-form-btn" href="${contactHref}">Contact</a>
            </header>`
}
