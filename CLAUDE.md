# CLAUDE.md — Morning Star Christian Church Website

## Project Overview

The official website for **Morning Star Christian Church** in Boise, Idaho ([ms.church](https://ms.church)). A server-rendered Hono app (TypeScript) deployed to Vercel.

Sections: hero/welcome, service schedule, ministries, outreach, About, beliefs, visit (map + service flow), watch (live + YouTube playlist), contact (Jotform), plus a Google Calendar–driven events feed.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Hono](https://hono.dev/) v4 |
| Language | TypeScript (strict) |
| JSX runtime | Hono's built-in JSX (`hono/jsx`) |
| Dev server | Vite + `@hono/vite-dev-server` |
| Build | `tsc --noEmit` (type-check only; Vercel compiles `api/index.ts` natively) |
| Deployment | Vercel (Node serverless function via `api/index.ts`) |
| Tests | Playwright harness (`scripts/harness/run.mjs`) |

To switch back to Cloudflare Pages, see the comment block at the top of `src/index.ts`.

---

## Repository Structure

```
MS.church/
├── src/
│   ├── index.ts        # Hono app entry — adds serveStatic, exports app
│   ├── app.ts          # Route registration + 404 page + security headers
│   ├── design-tokens.ts
│   ├── config.ts       # Google Calendar configuration
│   ├── routes/         # One file per URL (home, about, ministries, outreach, …)
│   └── templates/      # Reusable head/body/scripts/styles + shared/ partials
├── api/
│   └── index.ts        # Vercel serverless adapter (3-line shim → src/index.ts)
├── public/static/      # Self-hosted images — every photo has .jpg / .webp / .avif
├── scripts/harness/    # Playwright visual + perf regression suite
├── package.json
├── tsconfig.json
├── vite.config.ts      # Dev-only — `@hono/vite-dev-server` pointed at src/index.ts
├── vercel.json         # Deployment config (headers, rewrites, image CDN)
├── README.md           # Public overview (links to CHANGELOG.md)
└── CHANGELOG.md        # Per-version notes — gitignored, local only
```

---

## Architecture: Module-per-Route Template Pattern

Hono renders complete pages server-side as `c.html(...)` responses. HTML, CSS, and client-side JS all live in inline template strings — no separate HTML files, no external CSS bundle. `public/static/style.css` is intentionally empty.

```
src/
├── index.ts            # Entry — adds serveStatic, exports the app
├── app.ts              # Wires every route + 404 + security headers
├── routes/
│   ├── home.ts         # GET / (composes head + body + scripts)
│   ├── about.ts        # GET /about
│   ├── ministries.ts   # GET /ministries
│   ├── outreach.ts     # GET /outreach
│   ├── visit.ts        # GET /visit
│   ├── beliefs.ts      # GET /beliefs
│   ├── privacy.ts      # GET /privacy
│   ├── calendar.ts     # GET /api/calendar/events (5-min in-memory cache)
│   ├── youtube.ts      # GET /api/youtube/latest-video (RSS-feed cache + stale-while-revalidate)
│   └── misc.ts         # /robots.txt, /sitemap.xml, /form
└── templates/
    ├── home-head.ts    # <head> — meta, schema.org, preload, analytics
    ├── home-styles.ts  # ~7400-line CSS string shared by every page
    ├── home-body.ts    # Home page body
    ├── home-scripts.ts # Client-side JS (carousel, schedule tabs, reveal observer, …)
    ├── ministries-body.ts / outreach-body.ts / visit-body.ts / about-body.ts / beliefs-body.ts
    └── shared/         # subpage-header.ts, footer.ts, nav.ts, page-head.ts, prefetch.ts
```

**Editing workflow:** For home page changes, edit the relevant `home-*.ts` template. For a new page, create `src/routes/your-page.ts` + `src/templates/your-page-body.ts` and register the route in `src/app.ts`.

### Routes (defined in `src/routes/`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Main landing page (all sections) |
| GET | `/api/calendar/events` | Proxies Google Calendar API |
| GET | `/privacy` | Privacy policy page |
| GET | `/robots.txt` | SEO robots file |
| GET | `/sitemap.xml` | SEO sitemap |
| GET | `/form` | Standalone contact form page |
| Static | `/static/*` | Serves `public/` directory |
| Static | `/favicon.ico` | Serves favicon |

---

## Platform Adapter

Only one entry file: `src/index.ts`. The `serveStatic` import is platform-specific, with the alternative Cloudflare version commented out at the top:

```typescript
import { serveStatic } from '@hono/node-server/serve-static'
// import { serveStatic } from 'hono/cloudflare-workers'
```

The active import is Node/Vercel. To switch to Cloudflare Pages: swap the active import, reinstall `wrangler` + `@cloudflare/workers-types` + `@hono/vite-build`, restore `wrangler.jsonc`, and add the Cloudflare build plugin back to `vite.config.ts` (git history through v1.59.x has the prior config).

---

## Development Workflow

### Install dependencies
```bash
npm install
```

### Local development server
```bash
npm run dev
```
Starts the Vite dev server (`@hono/vite-dev-server` with no adapter — runs the Hono app in Node). Hot reload on TypeScript edits. Visit `http://localhost:5173`.

### Build (type-check)
```bash
npm run build
```
Runs `tsc --noEmit`. There's no bundle step — Vercel compiles `api/index.ts` natively. Failing types fail the deploy.

### Deploy
Pushing to the branch that Vercel watches triggers a deploy. `vercel.json` rewrites every request to `/api` (the `api/index.ts` serverless function), which wraps the Hono app via `@hono/node-server/vercel`. `public/static/*` is served from disk by the Hono app's `serveStatic` middleware.

---

## Visual + Performance Harness

The site has a Playwright-driven harness at `scripts/harness/run.mjs` for validating visual layout, cross-page anchor accuracy, animation smoothness, and frame-rate / lag performance. It is committed and intended to evolve with the codebase.

**Use it. Iterate on it. Extend it.** It is not a fixed checklist — it is the project's standing test surface. Any new section, page, transition, interaction, or perf concern should grow a corresponding scenario. There is no upper bound on what it can cover; if a future change introduces a behavior worth verifying (visual regression, scroll alignment, gesture latency, lazy-load timing, video stutter, layout shift on calendar event load, accessibility tab order, color contrast — anything), add it to the harness.

### Location

- `scripts/harness/run.mjs` — the harness (committed)
- `scripts/harness/output/` — generated artifacts (screenshots, `.webm` videos, `report.html`, `results.txt`); gitignored, regenerated on each run

### How to run

```bash
npm run dev                                   # start dev server (default port 5173)
node scripts/harness/run.mjs                  # run full suite against http://localhost:5173
HARNESS_URL=http://localhost:5174 node scripts/harness/run.mjs   # override port if Vite picks a different one
```

After it finishes, open `scripts/harness/output/report.html` in a browser — color-coded grid of every scenario with screenshots, video links, and per-metric pass/fail.

### What it covers today (baseline, not a ceiling)

| Suite | Purpose |
|---|---|
| `ANCHOR_SCENARIOS` | 16 direct-render + cross-page hash-jump checks (home, /about, /outreach, /visit, deep anchors like `/outreach#cooking`, `/visit#sunday-school`). Verifies anchor scroll lands on-section, not in dead space. |
| `PERF_SCENARIOS` | Scrolls + hash jumps + clicks measured against both a **60fps tier** and **120fps tier** (`PERF_60` / `PERF_120` thresholds). Captures rAF interval distribution, longtasks, long-animation-frame (LoAF), CLS via `PerformanceObserver`, and input latency. Chromium runs with `--disable-frame-rate-limit --disable-gpu-vsync` so rAF reflects actual per-frame work cost rather than display refresh. |
| `FLOW_SCENARIOS` | Click-through navigation flows recorded as `.webm` video + per-frame PNGs (e.g. home → outreach → back, hero "Plan a Visit" → /visit → back). Lets a human review actual transition smoothness, not just metrics. |

### When to run it

- After any layout, CSS, animation, view-transition, or scroll-related change.
- Before merging any visual or interaction work.
- After bumps to Hono, Vite, or anything affecting bundle size or hydration timing.
- Whenever a user reports "feels janky" / "off-screen on jump" / "flickers" — reproduce in the harness first, then fix.

### MUST run it: animation + design work (beyond trivial)

**Before pushing any animation change, scroll/anchor behavior change, layout-shift fix, transform/transition tweak, reveal-observer change, or design change beyond a one-line copy edit, run the harness, read the report, and ITERATE until it passes.** Push only after a green run.

This rule exists because animation and design regressions have repeatedly shipped because the harness wasn't run between iterations:

- A scrollTo that lands 40px off because `getBoundingClientRect()` includes a transform — invisible on localhost without network throttle, visible in production.
- A snap-correct racing a smooth-scroll that produces "page sits, then jumps."
- A fade-in that completes before layout settles, exposing layout shifts as visible jumps.

If the change you're making could conceivably show up in a harness scenario (anchor landing, perf timing, flow recording, reveal-fire count, CLS, view-transition snapshot), assume it could regress and run the harness. The harness takes ~2.5 minutes; that's cheap insurance vs. a user noticing on production.

If the harness doesn't have a scenario that would catch the bug class you're touching, ADD one before fixing, then fix and re-run. The new throttled-network anchor scenarios (18–19) and perf scenarios (80–82) exist exactly because the harness was too fast on localhost to catch "calendar mounts after scrollTo" — they're now routine checks because the user explicitly asked for that.

**Trivial / exempt changes:** copy text, single-color swap, comment-only edits, README, version bump alone. Anything that touches layout, motion, scroll, transforms, or interaction state is NOT trivial and the harness must run.

### How to extend it

The harness is structured so new scenarios are additive:

- **New anchor / page check** → push an entry to `ANCHOR_SCENARIOS` with `{ name, url, viewport, expectAnchor? }`.
- **New perf scenario** → push to `PERF_SCENARIOS` with `{ name, url, viewport, action, tier }`. `action` is an async function that receives the Playwright `page` — do whatever you want (scroll, click, hover, dispatch input, wait for an animation, etc.). `tier` is `'60'` or `'120'`.
- **New flow video** → push to `FLOW_SCENARIOS` with `{ name, viewport, steps }`. Each step is an async function on the `page`.
- **New thresholds or signals** → adjust `PERF_60` / `PERF_120` objects, or extend the in-page metric collector (the script injected via `page.addInitScript`) to capture additional `PerformanceObserver` entry types.
- **New tier** (e.g. a 30fps "old Android" tier, or a strict "zero CLS" tier) → clone the `PERF_120` block and add a third grading function call alongside `gradeTier(...)`.
- **Non-perf checks** (a11y axe scan, visual diff against a baseline image, Lighthouse subset, network throttling, touch-gesture simulation, prefers-reduced-motion behavior) → wire as a new suite next to the existing three. Keep the same shape: a `*_SCENARIOS` array + a `run*Scenarios()` function + a section in the HTML report.

The HTML report renderer at the bottom of `run.mjs` is template-string-based — add a new section by appending another `<section>` block. Keep it color-coded (green/yellow/red) so a glance reveals regressions.

### Conventions for harness work

- Never delete a scenario to make the suite pass — fix the underlying code or tighten/loosen the threshold with an explanation.
- Treat `output/report.html` as ephemeral; never commit `output/`.
- If you add a dependency (e.g. `axe-core`, `pixelmatch`), add it under `devDependencies` and note it here.
- The harness boots its own Playwright Chromium — no global install required, but the first run downloads the browser.
- Keep total runtime reasonable. Flow scenarios with video are the slowest (~30s each); prefer adding anchor or perf scenarios unless a video genuinely helps.

### Speed is a first-class harness goal — always be iterating it down

A slow test loop is a test loop that gets skipped. **Every time you write or run a test (harness scenario, ad-hoc screenshot pass, repro script, anything), treat its runtime as a defect to drive down.** Aim for fractions of the current time, not "good enough." Concretely:

- **Parallelize by default.** Run independent viewports / scenarios in parallel via `Promise.all` over Playwright contexts. Serial loops are almost always the wrong shape — they often cost 5–10× more wall-clock time than the parallel equivalent.
- **Pick the cheapest wait.** `domcontentloaded` is usually enough; `networkidle` blocks until every third-party request settles (analytics, fonts, YouTube CDN) and routinely costs an extra 10–30s per page. Don't reach for it unless a specific late-loading thing demands it. For images, `waitForFunction` on `img.complete && img.naturalWidth > 0` is far tighter than a fixed sleep.
- **No padding sleeps.** Replace `waitForTimeout(N)` with a precise condition (selector, image-loaded, transitionend) whenever possible. Reserve `waitForTimeout` for animations whose duration is known and short (≤300ms).
- **Right-size the surface.** Screenshot the section element, not the full page; pick 3–4 representative breakpoints, not 10. Add more only when a smaller set actually missed a regression.
- **Reuse the browser.** One `chromium.launch()` per script, many contexts inside it. Launching the browser is the most expensive single step.
- **Time and report.** Print the total elapsed time at the end of every script you write (`Date.now() - t0`). If it's higher than last time, find out why before moving on.
- **Iterate on the harness itself.** If a scenario gets slower because of new content, fix the scenario (tighter waits, better selectors) instead of adding budget. The harness is code; treat it like code.

This rule applies to every kind of test, not just the committed `run.mjs` suite — ad-hoc screenshot scripts, manual repros, perf checks, anything that takes wall-clock time during development. A fast test loop runs more often, catches regressions earlier, and produces better software.

---

## Versioning Convention

Version numbers live in commit messages (`v1.X.Y — short description`) and per-version notes in the gitignored `CHANGELOG.md`. The on-screen `version-footer` div displays the current version.

There is no in-source version comment anymore (was bloating `src/index.ts` with multi-thousand-character changelog blocks duplicated across files — removed in the streamlining pass that also collapsed the two-platform setup).

---

## Google Calendar Integration

The `/api/calendar/events` endpoint fetches from Google Calendar and transforms events into a normalized format.

### Configuration (in `src/routes/calendar.ts`)
```typescript
const GOOGLE_CALENDAR_CONFIG = {
  API_KEY: 'AIzaSy...',           // Google Cloud API key
  CALENDAR_ID: 'morningstarchurchboise@gmail.com',
  MAX_RESULTS: 50,
  TIME_ZONE: 'America/Boise'
};
```

### Event format returned by API
```json
{
  "id": "gcal-event-id",
  "title": "Event Title",
  "description": "Clean description (CTA stripped)",
  "date": "2026-03-01",
  "displayDate": "MAR 1",
  "image": "https://drive.google.com/uc?export=view&id=...",
  "driveFileLink": "https://drive.google.com/file/d/.../view",
  "location": "3080 Wildwood St, Boise",
  "cta": { "text": "REGISTER NOW", "link": "#contact" }
}
```

### Adding CTA to a calendar event
In the Google Calendar event description, include:
```
[CTA: BUTTON TEXT | #contact]
```
Example: `[CTA: RESERVE YOUR SEAT | https://example.com/register]`

### Adding images to events
Attach a publicly shared Google Drive image file to the calendar event. The API proxy converts the Drive file ID to a direct image URL.

---

## Events Section: Hardcoded Fallback

Events can also be hardcoded directly in the HTML as a JSON script tag. Search for:
```html
<script type="application/json" id="events-data">
```

The event schema:
```json
{
  "id": "event-unique-id",
  "title": "Event Title",
  "description": "Short description",
  "date": "2026-02-15",
  "displayDate": "FEB 15",
  "image": "https://your-image-url.com/flyer.jpg",
  "cta": { "text": "REGISTER NOW", "link": "#contact" }
}
```

The JavaScript function `initializeEvents()` automatically:
- Categorizes events as upcoming or past based on current date
- Shows upcoming events in the main carousel
- Moves past events to a modal overlay ("View Past Events")
- Adjusts dot navigation and layout based on event count

---

## Page Sections

The main landing page (`/`) contains these sections in order:

1. **Navigation** — Fixed header with logo and anchor links
2. **Hero** — Church tagline ("Mending the Broken"), church image, "Find Us" frosted glass button with address dropdown (Apple Maps / Google Maps / Copy)
3. **Schedule** — Sunday service time and location info
4. **Outreach / Events** — Horizontal carousel of upcoming events (fetched from Google Calendar or hardcoded JSON); "Stay Tuned" card when no upcoming events; past events accessible via modal
5. **Contact** — Embedded Jotform iframe
6. **Footer** — Links, social media, version number

---

## Design System

All styles are inlined in the `<style>` block inside the template string. The full token system lives at the top of `src/templates/home-styles.ts` in the `:root { ... }` block.

### Tokens are NOT suggestions — use them whenever they apply

The site has a complete design-token system (colors, type, spacing, weight, leading, tracking, radius, shadow, motion). **When you add or edit CSS, use the existing tokens. Do not inline raw hex codes, pixel values, or `clamp()` expressions when a token covers the case.** The drift this prevents:

- A new card adding `padding: 22px` instead of `var(--space-md)` — works fine in isolation, but the next person doing the same lands on `24px` or `20px`. After 10 such decisions, the page has 10 different "default" paddings and no visual rhythm.
- A new label adding `font-size: 13px` instead of `var(--text-label)` — same issue. Sizes near tokens should snap to the token.
- A new shadow with `0 10px 30px rgba(0, 0, 0, 0.07)` instead of `var(--shadow-md)` — even small differences read as inconsistent depth across cards.

**Rule of thumb:** if the value you're about to type is within ~30% of an existing token's value, use the token. Only invent a new value if it's a deliberate, specific outlier (e.g. a single illustration-tuned shadow, a hero-specific aspect ratio). If you find yourself wanting the same outlier in two places, that's the signal to add a new token, not to copy-paste the value.

### The token catalog

The numbers below are the source of truth; if anything here differs from `:root` in `home-styles.ts`, the `:root` wins.

| Category | Tokens | Use for |
|---|---|---|
| **Color — gold** | `--gold` (base), `--gold-dark` (70% black), `--gold-deeper` (55% black) | Accent links, eyebrows, primary CTA, gradient accents |
| **Color — surface** | `--bg`, `--surface`, `--white` | 3-level warm-white tier (page base / cards / hovers) |
| **Color — event tints** | `--bg-event1..5` | Calendar event card backgrounds (rotating) |
| **Color — text** | `--text-primary`, `--text-primary-soft` (.85), `-muted` (.72), `-faint` (.55), `-fade` (.30), `-hairline` (.10) | Headings → faint metadata → dividers. Use the alpha that's closest; don't invent new alphas. |
| **Font family** | `--font-display` (Playfair), `--font-body` (Inter) | Headings → display; everything else → body |
| **Type scale** | `--text-hero`, `--text-title`, `--text-heading`, `--text-lead`, `--text-body`, `--text-small`, `--text-label`, `--text-eyebrow` | 8-step fluid scale. Snap raw px to the nearest. |
| **Weights** | `--weight-regular` (400), `--weight-medium` (500), `--weight-semibold` (600), `--weight-bold` (700) | Use the named token, not the number |
| **Leading** | `--leading-tight` (1.1), `--leading-snug` (1.3), `--leading-normal` (1.6), `--leading-loose` (1.8) | Display → snug, body → normal, prose lead → loose |
| **Tracking** | `--tracking-tight` (-0.02em), `--tracking-normal` (0), `--tracking-wide` (0.12em), `--tracking-wider` (0.25em) | Eyebrows → wider, buttons → wide |
| **Spacing — T-shirt** | `--space-xs` (≈10), `-sm` (≈14), `-md` (≈20), `-lg` (≈28), `-xl` (≈36), `-2xl` (≈52), `-3xl` (≈72) | Every `padding` / `margin` / `gap` / `row-gap` / `column-gap`. All are fluid clamps. |
| **Border radius** | `--radius-sm` (8), `-md` (16), `-lg` (~22), `-xl` (~26), `-2xl` (~40), `-pill` (100), `-circle` (50%) | Pill chips → pill; cards → md/lg/xl; page wraps → 2xl |
| **Shadow elevation** | `--shadow-xs`, `-sm`, `-md`, `-lg`, `-xl`, `-overlay` | Cards → sm/md; hero surfaces → lg/xl; lightboxes → overlay. Don't invent rgba black drops. |
| **Motion** | `--motion-fast` (.2s), `--motion-medium` (.3s), `--motion-slow` (.6s); `--ease-standard` (Material), `--ease-out-soft` (long ease-out) | Hovers → fast; transitions → medium; reveals → slow |
| **CTA button** | `--btn-cta-bg` / `--btn-cta-bg-hover` / `--btn-cta-shadow` / `--btn-cta-shadow-hover` (gold); `--btn-cta-bg-red` / `--btn-cta-bg-red-hover` / `--btn-cta-shadow-red` / `--btn-cta-shadow-red-hover` (red) | Every brand call-to-action gold pill button (`.event-link-btn` and its modifiers) reads from these tokens. Red variant: `.event-link-btn.event-link-btn--red` for the YouTube playlist button only. Never inline a gold/red gradient on a pill button. |

### The canonical CTA button

The single source of truth for the gold pill call-to-action button (the "Explore Our Ministries" / "Plan a Visit" / "Get Directions" / "Contact Us" design) is the `.event-link-btn` rule in `home-styles.ts` (~line 3462). Every page-level brand CTA across the site uses it. Modifiers:

- `.teaser-cta` — auto width, slightly wider padding (`14px 32px`). Use on standalone section CTAs ("Explore Our Ministries", "Explore Our Outreach", hero "Plan a Visit", "View Full Playlist", "Read Our Statement of Beliefs", "Contact Us" page-level CTAs).
- `.about-cta` — same as teaser-cta with a distinct semantic name; used by the home About teaser.
- `.event-link-btn--red` — recolors to the red brand variant (gradient + shadow). Used only by the YouTube playlist button in /watch. Same shape, padding, type, motion, hover-lift as the gold default.
- `.event-link-btn-secondary` — recolors to white-on-card for an explicit secondary contrast (Apple Maps fallback on /visit, "Explore Outreach" / "Contact Us" on /about).

**Excluded from this design (keep their own rules):** `.nav-cta` + `.nav-form-btn` (nav contact button — smaller, frosted glass, navigation context); `.subpage-back` (back button — different function); `.btn-view-past-events` (modal trigger — small secondary); form-context buttons (`.btn-submit`, `.btn-see-flyer`, `.btn-more-info`); `.btn-calendar`, `.btn-add-child`, `.btn-remove-child` (utility); `.event-cta .event-link-btn` (event-card secondary overlay — white on card, non-pill radius, intentionally contrasts with the gold `.event-link-btn` that may also live on the same card); tab buttons; address triggers; copy buttons.

**Never inline a gold/red gradient pill.** If you find yourself writing `background: linear-gradient(135deg, var(--gold)...) 0%, var(--gold-dark) 100%)` plus `border-radius: var(--radius-pill)` plus `color: #ffffff` on a `<button>` or `<a>`, you're recreating `.event-link-btn` — use the class instead. Add a new modifier to the canonical rule if you need a variant, don't fork the design.

### Exemptions (the legitimate "don't use a token" cases)

These are fine to keep as raw values:

- **SVG attributes** (`fill="..."`, `stroke="..."`, `font-size="..."` on `<text>`) — SVG presentation attributes, not CSS. Tokens don't apply.
- **Illustration-specific colors** in the Boise outreach map and the handshake (`#5a3812`, `#7a4f1c`, `#fce7c0`, `#fff8e8`) — fine-tuned art assets.
- **Gradient inputs in `linear-gradient()` / `color-mix()`** where the visual contrast is tuned — don't shoehorn a token if it changes the gradient feel.
- **Animation `@keyframes` durations and `transition-delay` values** — those are bespoke choreography, not standardizable.
- **`bg-event1..5`** — already tokens; don't replace with anything.
- **`privacy.ts`** has its own self-contained CSS that doesn't import home-styles tokens; raw values there are intentional.

### Adding a new token

When you genuinely need a value that doesn't fit any existing token, **add the token to `:root` in `home-styles.ts` first**, then use it. Don't inline the raw value once and "add the token later" — the token never gets added.

Responsive breakpoints: **2-tier system** — mobile ≤960px, desktop ≥961px. All values within each tier use fluid `clamp()` expressions for smooth scaling with no layout jumps.

### Standard Width Rule

**All page sections must inherit their width from the `.page` container.** No section should be wider or narrower than the standard content area defined by `.page`:

- On desktop (≥961px): `.page` uses `width: min(1280px, 94%)` with `max-width: 1400px`.
- On mobile (≤960px): `.page` uses `width: 100%; padding: 0 clamp(0px, 2.5vw, 5%)`. Fluid padding scales from 0 on tablets to side padding on small phones.

**Do NOT use `width: 100vw` or full-bleed techniques** (`margin-left: calc(50% - 50vw)`) on content sections. These break sections out of the `.page` container and make them wider than sibling sections. The only exception is the hero section, which intentionally spans the full viewport.

Every section (schedule, outreach, watch, contact, footer) should use `width: 100%; max-width: 100%` so they fill exactly the `.page` content area — no more, no less. Carousel cards, section-cards, and other content blocks inherit this width naturally.

**Before committing any layout change**, visually verify that the modified section has the same left/right edges as the schedule `.section-card` on both mobile and desktop.

---

## Analytics

Vercel Analytics and Speed Insights are loaded conditionally in the client via dynamic `<script>` injection. To disable tracking for development/testing, append `?notrack=true` to any page URL.

---

## Deployment

**Vercel** — single deploy target.
- Config: `vercel.json` (headers, rewrites, image-CDN remotePatterns).
- Serverless function: `api/index.ts` (`@hono/node-server/vercel` adapter wrapping the app from `src/index.ts`).
- Rewrite rule sends every request — including `/static/*` — to `/api`, where the Hono app's `serveStatic` middleware reads from `public/static/` on disk.
- No build artifacts are needed; Vercel TypeScript-compiles `api/index.ts` natively. `npm run build` only type-checks.

To restore Cloudflare Pages as an alternative, see the comment block at the top of `src/index.ts`.

---

## Key Conventions for AI Assistants

1. **For home page changes**, edit the relevant file in `src/templates/` or `src/routes/home.ts`. For new pages, create `src/routes/your-page.ts` + `src/templates/your-page-body.ts` and register the route in `src/app.ts`.

2. **Do not add external dependencies lightly.** The architecture is intentionally lightweight: no React, no component library, no state management. Consider whether an inline implementation is sufficient before adding a package.

3. **All HTML, CSS, and JavaScript is inline** (in template strings). For the home page, CSS lives in `src/templates/home-styles.ts` and client JS in `src/templates/home-scripts.ts`. `public/static/style.css` is intentionally empty.

4. **SEO is best-in-class on V2 and must stay that way.** Before adding a new page, new content, or new images, read the **SEO Conventions** section below. ms.church already exceeds every Boise-church competitor on schema density, security headers, image sitemap, RSS feed, custom-domain email, and AI-crawler directives — closing that gap is much easier than rebuilding it. Mandatory: use `pageHead()` / `homeHead()`, ship FAQ JSON-LD per page, update the sitemap when you add a URL, and prefer hidden-surface SEO (schema, meta, alt text) over visible body copy stuffing.

5. **The harness IS the test suite.** `node scripts/harness/run.mjs` runs Playwright-driven anchor + perf + flow scenarios. **For any animation, scroll/anchor, layout-shift, transform/transition, reveal-observer, or non-trivial design change, run the harness, read `output/report.html`, and iterate until it passes BEFORE pushing.** Push only after a green run. If the bug class you're touching isn't covered, ADD a scenario, then fix. See the "MUST run it" subsection above. Validate visually with `npm run dev` too, but harness is the gate.

6. **Per-version notes** belong in commit messages and the gitignored `CHANGELOG.md`. Don't add changelog blocks to source files. The on-screen `version-footer` div is the public version marker.

7. **Church details** — 3080 Wildwood St, Boise, ID 83713. Public contact email: `support@ms.church` (custom-domain, use everywhere in visible UI + Schema.org). Sunday service at 9:00 AM. The Gmail address `morningstarchurchboise@gmail.com` is intentionally retained ONLY as `CALENDAR_ID` in `src/config.ts` because it identifies the parent church's Google Calendar — don't repurpose it as contact info anywhere.

8. **Calendar events** are fetched server-side in `src/routes/calendar.ts` with a 5-minute in-memory cache. The client calls `/api/calendar/events`; update image-URL handling there if the `lh3.googleusercontent.com` format changes.

9. **Images are self-hosted** with three variants each (`.jpg` / `.webp` / `.avif`) in `public/static/`. Use `<picture>` with AVIF + WebP `<source>` elements for foreground images, or CSS `image-set()` for background images. Generation script in `scripts/_optimize.mjs` (ad-hoc, not committed); sharp is a dev dep. When swapping a static image, regenerate all three variants.

---

## SEO Conventions — Build Best-in-Class by Default

ms.church V2's technical SEO substrate **already exceeds every Boise-church competitor** as of the May 2026 competitive audit: 49 FAQ Q&As across pages, full Schema.org graph wiring with `Church + LocalBusiness + PlaceOfWorship` triple-typing, weekly recurring `Event` schemas, `Service` / `OfferCatalog`, a 6-image `Photo` array with captions, custom-domain email, image sitemap with `<image:title>` + `<image:caption>`, RSS feed advertised in `<head>`, `security.txt`, HSTS with `preload` flag, edge-level Link header preconnect, `Server-Timing`, CSP report-only, and explicit AI-crawler allows for 14 named bots. These conventions keep that lead in place when pages, content, or images are added. **Read this before touching anything that affects search visibility.**

### Core principle — hidden surfaces over visible bloat

Add SEO weight via **JSON-LD, meta tags, alt text, image filenames, sitemap captions, and HTTP headers** — NOT by repeating "Boise" in visible body copy. The user has explicitly rejected keyword stuffing in visible content. Every keyword opportunity should be tested as: *"can this live in schema, meta, alt text, or a sitemap caption instead of body text?"* Default to yes.

### Mandatory head pattern — use the shared helpers

Every new HTML page MUST use `pageHead()` (subpages, from `src/templates/shared/page-head.ts`) or `homeHead()` (home page only, from `src/templates/home-head.ts`). Don't roll your own `<head>`. The helpers guarantee:

- `<title>` formatted `[Page name] · Morning Star Christian Church, Boise`
- `<meta name="description">` (~155 chars, includes the page's target query naturally)
- `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`
- `<meta name="googlebot" content="index, follow">`
- Self-referential `<link rel="canonical">`
- Full Open Graph + Twitter Card
- Geographic meta tags (geo.region, geo.position, ICBM)
- 5-variant favicon set + `<link rel="manifest" href="/site.webmanifest">`
- `<link rel="alternate" type="application/rss+xml" href="/feed.xml">`
- JSON-LD passed via the `jsonLd` parameter

If you find a use-case the shared helper doesn't cover, ADD a parameter to the helper rather than forking it.

### Mandatory JSON-LD per page

Every new route's `@graph` must contain at minimum:

1. **A page-type entity** (`WebPage`, `AboutPage`, `CollectionPage`, etc.) with `name`, `description`, `url`, `inLanguage: 'en-US'`, `isPartOf` linking to `https://ms.church/#website`, and `about` linking to `https://ms.church/#church`.
2. **A `BreadcrumbList`** with position-numbered `ListItem`s.
3. **A `FAQPage`** with 4–6 page-specific questions. Each `acceptedAnswer.text` is **40–60 words** (featured-snippet sweet spot). Don't repeat the same question on multiple pages — each page owns its own intent.

The home page additionally carries `Church + PlaceOfWorship + LocalBusiness` triple-typing, the 6-image `photo` array, weekly `OpeningHoursSpecification` for all five recurring gatherings, an `OfferCatalog` of services, per-recurring-event `Event` schema, and 24 home-scoped FAQs. **Don't remove any of these.**

### Image SEO additions (beyond the existing image-variants rule in Key Conventions #9)

| Requirement | Why |
|---|---|
| Alt text includes brand name ("Morning Star Christian Church") + geographic anchor ("Boise" / "in Boise, Idaho") + concrete subject description | Image-pack discovery; hidden surface so SEO-rich is safe |
| Filenames are lowercase-with-hyphens, descriptive | Image-search relevance |
| Hero: `loading="eager"` + `fetchpriority="high"`. All others: `loading="lazy"` + `decoding="async"` | LCP optimization |
| Explicit `width` + `height` on every `<img>` | Prevents CLS |

When you add a new image to an existing page, ALSO:
- Add an `<image:image>` block to that page's entry in `src/routes/misc.ts` sitemap with `<image:title>` + `<image:caption>` (descriptive, includes "Boise" naturally)
- Add the image to the home `photo` array in `src/templates/home-head.ts` if it's home-relevant

### URL conventions for new pages

- **Single-word top-level slugs**: `/sermons`, `/kids`, `/youth`, `/give`, `/blog`. NOT `/ministries/kids` or `/our-sermons`.
- **Hyphenated multi-word** only when single-word doesn't work: `/bible-study`, `/free-breakfast`.
- **Stable seasonal URLs**: `/easter` not `/easter-2026`. Backlinks compound year-over-year; update content inside the page.
- Lowercase only. No trailing slashes (Hono's routing is already trailing-slash-free).

### Cache-Control conventions (set in the route's `c.header()` call or in `vercel.json`)

| Resource type | Header |
|---|---|
| Home page HTML | `public, s-maxage=300, stale-while-revalidate=86400` |
| Static-ish subpage HTML | `public, s-maxage=600, stale-while-revalidate=86400` |
| `/api/calendar/events` (and similar dynamic JSON) | `public, s-maxage=300, stale-while-revalidate=600` |
| `/static/(.*)` | `public, max-age=31536000, immutable` (set in `vercel.json`) |
| `/sitemap.xml` | `public, s-maxage=3600, stale-while-revalidate=86400` |
| `/feed.xml` | `public, s-maxage=900, stale-while-revalidate=86400` |
| `/robots.txt`, `/.well-known/security.txt` | `public, max-age=86400` |

### Sitemap maintenance

When you add a new route, add it to `entries` in `src/routes/misc.ts` `/sitemap.xml` handler with `priority`, `changefreq`, and `lastmod`. Use the constants:

- `SITE_LASTMOD` (hardcoded ISO date) — for static content. Bump this constant when content meaningfully changes ship.
- `HOME_LASTMOD` (today, evaluated per request) — ONLY for pages with legitimately weekly-updating content (currently `/` and `/outreach`, both pull the live calendar).

**Never** apply `new Date()` directly to every entry's lastmod. Google's documented behavior is to ignore (and downweight) sitemaps with always-fresh lastmod values across all entries.

### robots.txt rules

The current `robots.txt` allows everything except `/api/` and `*.json`. It carries Googlebot fast-lane (`Crawl-delay: 0`), Googlebot-Image explicit allow on `/static/`, and explicit `Allow: /` rules for 14 AI search crawlers (GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-Web, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, Applebot, Applebot-Extended, CCBot, meta-externalagent, Bytespider). **Don't remove any of these.** If you add a new path type that crawlers shouldn't index, add an explicit `Disallow` line under `User-agent: *`.

### Anti-patterns observed in competitors — DO NOT copy

These were identified in the May 2026 audit and must not be replicated on ms.church:

- **Don't put visible "Boise" mentions everywhere** for keyword density. The user objects to this. Put weight in hidden surfaces.
- **Don't write doctrinal statements without scripture citations** (Bridgepoint: 1,850 words of theology, zero verse refs — reads hollow).
- **Don't ship a staff/leadership page that's only photo tiles with no bios** (Hill City anti-pattern: 21 photos, 0 bio words per person — worse than no page).
- **Don't carousel autoplay video testimonials** (Life Church: hurts CWV + no first-name attribution).
- **Don't use stock photography** for "congregation" / "people" images. Every people-image must be real MS members.
- **Don't put anything in front of the document** — no captcha, no Cloudflare bot mode, no interstitial. Foothills' SiteGround captcha returns `x-robots-tag: noindex` to every non-browser crawler, killing their AI/SearchGPT/Perplexity inclusion.
- **Don't downgrade HSTS** to `max-age=0` (Boise Church anti-pattern: a real security regression).
- **Don't ship Universal Analytics tags** (UA-*). GA4 (`G-*`) only; Vercel Analytics + Speed Insights are the current solution.
- **Don't fork visible `<head>` tags** away from `pageHead()` / `homeHead()`. Add a parameter to the shared helper instead.
- **Don't keep Gmail addresses** in visible UI or Schema.org — use `support@ms.church`. (See Key Conventions #7 for the calendar-ID exception.)

### Checklist when adding a new page

1. Create `src/routes/<page>.ts` + `src/templates/<page>-body.ts` (per Architecture pattern)
2. Register the route in `src/app.ts`
3. Call `pageHead()` with full `jsonLd` — page-type entity + `BreadcrumbList` + `FAQPage`
4. Add the URL to `entries` in `src/routes/misc.ts` sitemap with `<image:image>` block if there's a hero
5. Set `Cache-Control` per the table above
6. Internal-link to the new page from at least one other page with keyword-rich anchor text
7. Every `<img>` has explicit `width` + `height` + descriptive alt text (brand + Boise + subject)
8. Hero image: `loading="eager"` + `fetchpriority="high"`; others: `loading="lazy"` + `decoding="async"`
9. Bump `SITE_LASTMOD` to today
10. `npm run build` — type-check passes
11. Run the harness if the page touches layout, motion, or scroll
12. Commit: `vX.Y.Z — <description>` (per Versioning Convention)

### Checklist when adding new content to an existing page

1. **Don't** add visible "Boise" mentions where natural copy already covers the location
2. **DO** update that page's `FAQPage` JSON-LD if the new content answers a new user query
3. **DO** update `<meta name="description">` if the page intent shifted
4. **DO** bump `SITE_LASTMOD` if the content shift is meaningful
5. **DO** add `<image:image>` sitemap entries + descriptive alt text for any new images
6. `npm run build` + harness if layout-affecting

### Where existing SEO patterns live (read these for examples)

- **Home full JSON-LD graph** (Church + Org + Events + FAQ + Photo + OfferCatalog): `src/templates/home-head.ts` around line 252+
- **Per-page JSON-LD with `FAQPage`**: `src/routes/about.ts`, `beliefs.ts`, `outreach.ts`, `ministries.ts`, `visit.ts`
- **Sitemap + robots.txt + security.txt + RSS feed**: `src/routes/misc.ts`
- **Cache headers + CSP + COOP + Link preconnect + HSTS**: `vercel.json`
- **Security headers + Server-Timing middleware**: `src/app.ts`
- **Shared favicon + RSS link + canonical + meta pattern**: `src/templates/shared/page-head.ts`

---

## Outreach Section — Editing Guide

The outreach section is the most complex part of the page. Mistakes here took many iterations to fix. Follow these rules precisely.

### Where the code lives

| What | File | What to search for |
|------|------|--------------------|
| Card HTML structure | `src/templates/home-scripts.ts` | `renderUpcomingEventCard`, `carousel-past-card` |
| Card CSS | `src/templates/home-styles.ts` | `.event-outer-card`, `.carousel-card`, `.carousel-past-card` |
| Carousel JS logic | `src/templates/home-scripts.ts` | `initCarousel`, `startAutoTick` |
| Memories card HTML | `src/templates/home-scripts.ts` | `carousel-see-past-btn`, `past-card-title` |

### Card structure hierarchy

```
.carousel-card          ← slot in the scroll container; controls edge spacing
  .event-card           ← inner wrapper
    .event-outer-card   ← visible white frosted-glass card (rounded, shadowed)
      .event-card-header ← date (left) + time pill (right), or MEMORIES label
      .event-flyer-wrapper / .carousel-past-card  ← image or memories content
      .event-link-btn   ← gold pill CTA button at the bottom of the card
```

### Width and spacing rules

**NEVER** change the outreach section's width beyond `width: 100%; max-width: 100%`. It must inherit from `.page` like every other section. Violations that were removed and must not return:
- `width: 100vw` on `.outreach` — made the section wider than all siblings
- `margin-left: calc(50% - 50vw)` or any negative-margin full-bleed trick on `.outreach` or `.carousel-wrapper` — caused asymmetric card positioning

**The correct way to give cards edge spacing on mobile** is to add horizontal `padding` to `.carousel-card` in the `@media (max-width: 960px)` block:
```css
@media (max-width: 960px) {
    .carousel-card {
        padding: 0 clamp(4px, 2vw, 16px);  /* fluid: scales from 4px on small phones to 16px on tablets */
    }
}
```
The fluid `clamp()` automatically reduces padding on smaller screens where `.page` provides its own side spacing — no separate breakpoint needed.

### Shadow edges and the fog system

This is the most misunderstood part of the outreach section. There are **three independent layers** of edge softening. They work together and must not be confused with each other.

#### Layer 1 — `body::before` / `body::after` (page-edge hairline fog)

```css
body::before, body::after {
    position: fixed;
    width: 3px;
    z-index: 9998;
    opacity: 0.6;
    /* gradient fading from --bg-color to transparent */
}
```

- Fixed to the viewport, always visible regardless of scroll position
- Only 3px wide at 60% opacity — nearly invisible, just enough to prevent content feeling hard-clipped at the physical screen boundary
- **Do not widen this.** Making it larger (e.g. 6px or more) creates a visible thick border stripe at the screen edge. Keep it at 3px / opacity 0.6.
- This layer has nothing to do with card shadows specifically — it softens the entire page at both edges

#### Layer 2 — `.carousel-viewport` clip-path + `::before`/`::after` fog (desktop)

```css
/* Desktop base */
.carousel-viewport {
    clip-path: inset(-80px -40px -80px -40px);
}
.carousel-viewport::before { left: -40px; width: 80px; /* gradient → transparent */ }
.carousel-viewport::after  { right: -40px; width: 80px; /* gradient → transparent */ }
```

On desktop, the carousel shows multiple cards simultaneously. The `clip-path` allows shadows to bleed 80px vertically and 40px horizontally beyond the viewport bounds. The `::before`/`::after` fog overlays (80px wide, z-index 5) sit on top of the viewport and fade the shadow bleed so adjacent cards don't show a hard edge at the left or right boundary.

- `z-index: 5` keeps the fog below the navigation arrows (`z-index: 20`)
- The gradient stops at 25% solid → 60% semi → 100% transparent — this multi-stop fade prevents the fog from looking like a hard border

#### Layer 3 — Mobile clip-path override + thin fog

```css
/* ≤960px mobile override */
.carousel-viewport {
    clip-path: inset(-60px -16px -60px -16px);
}
.carousel-viewport::before { left: -16px; width: 24px; top: -60px; bottom: -60px; }
.carousel-viewport::after  { right: -16px; width: 24px; top: -60px; bottom: -60px; }
```

On mobile, only one card is visible at a time. The adjacent cards are a full viewport-width away (`transform: translateX(±100%)`), so there is zero risk of them showing through. The `clip-path` uses `-16px` horizontal bleed (matching the `.carousel-card` padding) so the card's box-shadow can fade naturally instead of being hard-cut at the viewport edge. The `::before`/`::after` fog is only 24px wide here — just enough to soften the shadow falloff where it meets the clip boundary.

#### What causes hard shadow edges

A hard visible line at the left or right of a card on mobile means **the clip boundary is cutting the shadow too soon**. The root cause is always one of:

1. `clip-path: inset(-60px 0px -60px 0px)` — zero horizontal bleed. The `0px` clips exactly at the viewport edge, slicing the shadow clean off. Fix: use `-16px` horizontal values.
2. The `.carousel-card` padding was removed or set to `0`, so the card extends all the way to the clip boundary with no buffer. Fix: restore `padding: 0 16px` on `.carousel-card` at `≤960px`.
3. The fog overlay dimensions (`top`, `bottom`, `left`, `right`) were not updated to match the clip-path values. If the clip path uses `-60px` vertical and `-16px` horizontal, the fog must use the same values or it will leave an unfogged gap.

#### The relationship between card padding and shadow room

Card padding and shadow room are coupled:

```
card padding (16px) + clip bleed (16px) = 32px total buffer between card edge and viewport edge
```

The card's box-shadow on `.event-outer-card` is `0 4px 24px rgba(0,0,0,0.08)` — at 24px spread, 32px of total buffer is enough for the shadow to fully fade to transparent before reaching the viewport edge with no hard line.

If you reduce `.carousel-card` padding below 16px, reduce the clip bleed by the same amount to maintain the buffer. If you increase padding, you can optionally increase the clip bleed for more shadow room, but 16px is sufficient for the current shadow radius.

### Mobile carousel: what must never be re-added

These were explicitly removed and must not come back:

1. **Navigation arrows on mobile** — hidden with `display: none !important` in `@media (max-width: 960px)`. The `!important` is required because JS sets `style.display = 'flex'` inline during `render()`. Without it, arrows reappear.

2. **`clip-path: inset(-60px 0px)` (zero horizontal bleed)** — replaced with `inset(-60px -16px -60px -16px)`. The `0px` causes a hard shadow cutoff line at the viewport edges. Do not revert to `0px`.

3. **Adjacent card bleed** — the carousel positions cards at `transform: translateX(index * 100%)` so adjacent cards are always exactly one viewport-width away. The `-16px` clip bleed is safe and will not expose them. Do not reduce the bleed to try to "prevent" bleed-through — the spacing already handles that.

### CSS typography tokens — use these, not raw px

```
--text-eyebrow: 10px   ← badges, overlines (OUTREACH label, MEMORIES badge)
--text-label:   12px   ← do NOT use for card content or buttons; too small for mobile
--text-small:   14px   ← minimum for button text (event-link-btn uses this)
--text-heading: clamp(20px, 2.5vw, 26px)  ← card sub-headings
```

**Minimum readable sizes for the outreach card on mobile (industry standard):**
- Card section title (`.past-card-title`): **20px**
- Card body text (`.past-card-description`, `.past-card-text`): **16px** — this is the iOS/Android minimum to avoid browser auto-zoom
- Button text (`.event-link-btn`): **14px** (`--text-small`) — set at the base rule, not only at the desktop breakpoint

### Button rules

There are two distinct button classes in this section:

| Class | Used for | Location |
|-------|----------|----------|
| `.event-link-btn` | CTA buttons on all carousel cards (GET DIRECTIONS, Browse Memories) | `home-scripts.ts` |
| `.carousel-past-card .past-card-btn` | "Browse Memories" button in the desktop 2-up grid memories card | `home-scripts.ts` |

Both share identical visual styling. **Both must have their font-size set at the base rule level** (not only in a desktop `min-width` override), otherwise mobile gets a smaller size than desktop.

**`text-transform` on buttons:**
- `.event-link-btn` uses `text-transform: uppercase` — correct for CTA buttons like GET DIRECTIONS
- The **Browse Memories** button (`#carousel-see-past-btn`) overrides this with `text-transform: none; letter-spacing: 0.3px` — it is sentence case intentionally
- Do NOT remove the `#carousel-see-past-btn` override or the button will revert to "BROWSE MEMORIES"

**`font-family` on buttons:** `<button>` elements do NOT inherit `font-family` in some browsers. The `.event-link-btn` rule explicitly sets `font-family: var(--font-body), 'Inter', sans-serif`. Do not change this back to `font-family: inherit`.

### Memories card copy

The "Memories" card text and button label are hardcoded in `home-scripts.ts` in **two places** — the desktop 2-up grid render (search `btn-view-past-events-desktop`) and the mobile carousel render (search `carousel-see-past-btn`). When changing copy, update **both**:

```
desktop:  <span class="past-card-btn">Browse Memories</span>
carousel: <button class="event-link-btn" id="carousel-see-past-btn">Browse Memories</button>
```

### Auto-scroll threshold

`startAutoTick()` only starts if `getMaxIndex() >= 2` (i.e. there are at least 2 total carousel slots). With 1 upcoming event and 1 memories card, that's exactly 2 — auto-scroll runs. With only a Stay Tuned card (no events), there's only 1 slot — auto-scroll correctly skips. Do not lower this threshold.

### Breakpoints that apply to the outreach section

| Breakpoint | Key effect |
|------------|-----------|
| `≥ 961px` (desktop) | Two-column grid layout: event cards left, memories card right |
| `≤ 960px` (mobile) | Single-column carousel; arrows hidden; `.page` goes full-width; `carousel-card` gets fluid horizontal padding via `clamp(4px, 2vw, 16px)` |
