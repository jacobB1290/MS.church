import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'
import { watchCard, escapeHtml } from './watch-shared.js'
import { tallyTopics, type PublishedSermon } from '../sermons-feed.js'

// /watch — the on-site service library hub.
//
// Server-rendered from a WatchHubView (composed in routes/watch.ts): a featured
// latest service, then a tabbed library (Sermons / Discussions) of every
// published service, each filterable by topic. Every card links in-site to a
// /watch/<slug> permalink with the custom segment player — we never send people
// off to YouTube. All cards are in the HTML (crawlable, no client fetch); the
// only client JS is tab switching + topic filtering (a crossfade, never a
// reflow jump) and the featured click-to-play facade in fallback mode.
//
// Two modes:
//   library  — at least one published service: featured links to its permalink,
//              the library lists everything.
//   fallback — none published yet: featured is the live latest YouTube video
//              (inline click-to-play) and the evergreen "a Sunday, in order"
//              carries the page until the CRM publishes.

export type WatchFeature = {
  videoId: string
  posterUrl: string
  title: string
  dateLabel: string | null
  metaLine: string | null
  summary: string
  scriptureRefs: string[]
  /** Permalink (library mode); null in fallback mode → inline click-to-play. */
  href: string | null
}

export type WatchProgramItem = { title: string; note: string }

export type WatchHubView = {
  mode: 'library' | 'fallback'
  feature: WatchFeature
  sermons: PublishedSermon[]
  discussions: PublishedSermon[]
  program: WatchProgramItem[]
  ytWatchUrl: string
  playlistUrl: string
}

const PLAY_TRIANGLE = `<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>`

// Evergreen reflection prompts — useful for any week's message.
const DISCUSSION = [
  'What word or verse from this week stayed with you, and why that one?',
  'What does this passage show you about God? What does it show you about yourself?',
  'Is there something here you have been avoiding, or something you need to make right?',
  'If you took this seriously, what would be different by next Sunday? Be specific.',
  'Who in your life needs to hear what you heard today?',
  'How can someone pray for you as you try to live this out?',
]

function renderScriptureChips(refs: string[]): string {
  if (refs.length === 0) return ''
  return `<div class="watch-refs" aria-label="Scripture in this message">
                            ${refs.map((r) => `<span class="watch-ref">${escapeHtml(r)}</span>`).join('\n                            ')}
                        </div>`
}

/** A library tab panel: a topic filter row built from this group, plus the grid. */
function renderPanel(id: string, sermons: PublishedSermon[], active: boolean): string {
  const topics = tallyTopics(sermons)
  const filter =
    topics.length > 1
      ? `<div class="watch-filter" role="group" aria-label="Filter by topic">
                            <button class="watch-chip" type="button" data-topic="all" aria-pressed="true">All</button>
                            ${topics
                              .map(
                                (t) =>
                                  `<button class="watch-chip" type="button" data-topic="${escapeHtml(t.slug)}" aria-pressed="false">${escapeHtml(t.topic)}<span class="watch-chip-count">${t.count}</span></button>`,
                              )
                              .join('\n                            ')}
                        </div>`
      : ''
  const cards = sermons.map((s) => watchCard(s)).join('\n                        ')
  return `<div class="watch-panel${active ? ' is-active' : ''}" id="panel-${id}" role="tabpanel" aria-labelledby="tab-${id}"${active ? '' : ' hidden'}>
                        ${filter}
                        <div class="watch-grid">
                        ${cards}
                        </div>
                    </div>`
}

function renderLibrary(view: WatchHubView): string {
  const groups: { id: string; label: string; list: PublishedSermon[] }[] = [
    { id: 'sermons', label: 'Sermons', list: view.sermons },
    { id: 'discussions', label: 'Discussions', list: view.discussions },
  ].filter((g) => g.list.length > 0)

  if (groups.length === 0) return ''

  const firstId = groups[0].id
  const tabs =
    groups.length > 1
      ? `<div class="watch-tabs" role="tablist" aria-label="Service library">
                        ${groups
                          .map(
                            (g, i) =>
                              `<button class="watch-tab" type="button" role="tab" id="tab-${g.id}" data-panel="${g.id}" aria-controls="panel-${g.id}" aria-selected="${i === 0 ? 'true' : 'false'}">${g.label}<span class="watch-tab-count">${g.list.length}</span></button>`,
                          )
                          .join('\n                        ')}
                    </div>`
      : ''
  const panels = groups.map((g) => renderPanel(g.id, g.list, g.id === firstId)).join('\n                    ')

  return `<section id="library" class="watch-library" aria-label="Service library">
                    <span class="section-eyebrow">Library</span>
                    <h2 class="section-heading">Every service, ready when you are.</h2>
                    <p class="section-lead">Browse by kind, then narrow by topic. Each one plays right here on the site, just the message itself, with the full service a tap away.</p>
                    ${tabs}
                    ${panels}
                </section>`
}

function renderFeature(view: WatchHubView): string {
  const f = view.feature
  const thumbInner = `<img src="${escapeHtml(f.posterUrl)}"
                                 alt="Latest Sunday service from Morning Star Christian Church in Boise, Idaho."
                                 width="1280" height="720" loading="eager" fetchpriority="high"
                                 onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${escapeHtml(f.videoId)}/hqdefault.jpg';">
                            <span class="watch-feature-play">${PLAY_TRIANGLE}</span>`

  // Library mode: the thumb is a link to the permalink (the real player lives
  // there). Fallback mode: a click-to-play facade that swaps in the embed.
  const thumb = f.href
    ? `<a class="watch-feature-thumb" href="${escapeHtml(f.href)}" aria-label="Watch: ${escapeHtml(f.title)}">${thumbInner}</a>`
    : `<button class="watch-feature-thumb" id="watch-feature-play" type="button" data-video="${escapeHtml(f.videoId)}" aria-label="Play the latest Sunday service">${thumbInner}</button>`

  const primaryCta = f.href
    ? `<a class="event-link-btn teaser-cta" href="${escapeHtml(f.href)}">Watch this service</a>`
    : `<a class="event-link-btn event-link-btn--red teaser-cta" href="${escapeHtml(view.ytWatchUrl)}" target="_blank" rel="noopener">Watch on YouTube</a>`

  return `<section id="latest" aria-label="Latest service">
                    <span class="section-eyebrow">Latest service</span>
                    <div class="watch-feature">
                        ${thumb}
                        <div class="watch-feature-meta">
                            <span class="watch-feature-tag">Most recent</span>
                            <h2 class="watch-feature-title">${escapeHtml(f.title)}</h2>
                            ${f.metaLine ? `<span class="watch-feature-meta-line">${escapeHtml(f.metaLine)}</span>` : f.dateLabel ? `<span class="watch-feature-meta-line">${escapeHtml(f.dateLabel)}</span>` : ''}
                            <p class="watch-feature-blurb">${escapeHtml(f.summary)}</p>
                            ${renderScriptureChips(f.scriptureRefs)}
                            <div class="watch-feature-actions">
                                ${primaryCta}
                            </div>
                        </div>
                    </div>
                </section>`
}

export const watchBody = (view: WatchHubView): string => {
  const discussionItems = DISCUSSION.map(
    (q) => `<li class="watch-discussion-item">${q}</li>`,
  ).join('\n                            ')

  const programItems = view.program
    .map(
      (s) => `<li class="watch-program-item">
                                <span class="watch-program-title">${escapeHtml(s.title)}</span>
                                ${s.note ? `<span class="watch-program-note">${escapeHtml(s.note)}</span>` : ''}
                            </li>`,
    )
    .join('\n                            ')

  return `
    <style>
        /* /watch hub — page-specific only; cards, tabs, filter, feature, and the
           player all come from the shared watch CSS in home-styles.ts. */
        .watch-feature-iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }

        /* Order of service run sheet (evergreen) */
        .watch-program { list-style: none; counter-reset: program; margin: 0; padding: 0; max-width: 760px; }
        .watch-program-item {
            counter-increment: program; position: relative;
            padding: var(--space-md) 0 var(--space-md) calc(var(--space-xl) + var(--space-sm));
            border-top: 1px solid var(--text-hairline);
        }
        .watch-program-item:first-child { border-top: none; padding-top: 0; }
        .watch-program-item::before {
            content: counter(program); position: absolute; left: 0; top: var(--space-md);
            font-family: var(--font-display); font-size: var(--text-lead); font-weight: var(--weight-bold);
            line-height: 1; color: var(--gold-dark);
        }
        .watch-program-item:first-child::before { top: 0; }
        .watch-program-title { display: block; font-size: var(--text-body); font-weight: var(--weight-semibold); color: var(--text-primary); }
        .watch-program-note { display: block; font-size: var(--text-small); line-height: var(--leading-normal); color: var(--text-muted); margin-top: 2px; }
        .watch-program-foot { margin-top: var(--space-lg); font-size: var(--text-small); color: var(--text-muted); }
        .watch-program-foot a { color: var(--gold-dark); text-decoration: none; border-bottom: 1px solid var(--text-hairline); transition: border-color var(--motion-fast) var(--ease-out-soft); }
        .watch-program-foot a:hover { border-color: var(--gold); }

        .watch-discussion { list-style: none; counter-reset: q; margin: 0; padding: 0; display: grid; gap: var(--space-md); }
        .watch-discussion-item {
            counter-increment: q; position: relative;
            padding: var(--space-md) 0 var(--space-md) calc(var(--space-xl) + var(--space-xs));
            border-bottom: 1px solid var(--text-hairline);
            font-size: var(--text-lead); font-family: var(--font-display);
            line-height: var(--leading-snug); color: var(--text-primary-soft);
        }
        .watch-discussion-item:first-child { padding-top: 0; }
        .watch-discussion-item:last-child { border-bottom: none; }
        .watch-discussion-item::before {
            content: counter(q, decimal-leading-zero); position: absolute; left: 0; top: var(--space-md);
            font-family: var(--font-body); font-size: var(--text-label); font-weight: var(--weight-bold);
            letter-spacing: var(--tracking-wide); color: var(--gold-dark);
        }
        .watch-discussion-item:first-child::before { top: 0; }
        @media (min-width: 961px) {
            .watch-discussion { grid-template-columns: 1fr 1fr; column-gap: var(--space-2xl); gap: 0; }
            .watch-discussion-item { padding-top: var(--space-md); }
            .watch-discussion-item:nth-child(-n+2) { padding-top: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
            .watch-program-foot a { transition: none; }
        }
    </style>
    <body class="page-subpage">
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main id="main">
                <section id="watch-intro">
                    <h1 class="section-heading">Watch, anytime.</h1>
                    <p class="subpage-intro-lead">Missed a Sunday, or want to sit with a message again? Every service is here to watch in full, sorted into sermons and discussions, and searchable by the topics you care about. Nothing to sign up for, nothing to install.</p>
                </section>

                ${renderFeature(view)}

                ${renderLibrary(view)}

                <section id="worship">
                    <span class="section-eyebrow">A Sunday, in order</span>
                    <h2 class="section-heading">What a morning looks like.</h2>
                    <p class="section-lead">The morning follows the same simple shape every week, so it always feels familiar. Worship is live, the lyrics are on the screen, and you are welcome to sing or simply listen.</p>
                    <ol class="watch-program">
                            ${programItems}
                    </ol>
                    <p class="watch-program-foot">Planning a first visit in person? <a href="/visit#what-to-expect">See what to expect on a Sunday &rarr;</a></p>
                </section>

                <section id="discussion">
                    <span class="section-eyebrow">Discussion</span>
                    <h2 class="section-heading">Take it into the week.</h2>
                    <p class="section-lead">Watching is a start. These are for the drive home, the dinner table, or a group: read the passage again, then talk it through.</p>
                    <ol class="watch-discussion">
                            ${discussionItems}
                    </ol>
                    <p class="watch-program-foot">Want to dig in with others? <a href="/ministries#bible-study">Find a Bible study &rarr;</a></p>
                </section>

                <section id="watch-cta" class="subpage-final-cta">
                    <span class="section-eyebrow">In person</span>
                    <h2 class="section-heading">Even better in the room.</h2>
                    <p class="subpage-final-cta-lead">Online is a great place to start. When you are ready, the seat next to us is open: Sundays at 9 in West Boise, with free breakfast after.</p>
                    <a class="event-link-btn teaser-cta" href="/visit">Plan a Visit</a>
                </section>
            </main>

            ${footer()}
        </div>
        <script>
            (function () {
                /* Library: tab switching + in-tab topic filter. All cards are in
                   the HTML; this only toggles visibility, with a crossfade so the
                   grid reflow happens while invisible (never a visible jump). */
                var MOTION = 220;
                var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

                function fade(grid, apply) {
                    if (!grid) { apply(); return; }
                    if (reduce) { apply(); return; }
                    grid.classList.add('is-fading');
                    setTimeout(function () { apply(); requestAnimationFrame(function () { grid.classList.remove('is-fading'); }); }, MOTION);
                }

                // Tabs
                var tablist = document.querySelector('.watch-tabs');
                if (tablist) {
                    tablist.addEventListener('click', function (e) {
                        var tab = e.target.closest('.watch-tab');
                        if (!tab || tab.getAttribute('aria-selected') === 'true') return;
                        var id = tab.getAttribute('data-panel');
                        var current = document.querySelector('.watch-panel.is-active');
                        var target = document.getElementById('panel-' + id);
                        if (!target || current === target) return;
                        tablist.querySelectorAll('.watch-tab').forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); });
                        var curGrid = current ? current.querySelector('.watch-grid') : null;
                        var swap = function () {
                            if (current) { current.classList.remove('is-active'); current.setAttribute('hidden', ''); }
                            target.classList.add('is-active'); target.removeAttribute('hidden');
                            var tg = target.querySelector('.watch-grid');
                            if (tg && !reduce) { tg.classList.add('is-fading'); requestAnimationFrame(function () { requestAnimationFrame(function () { tg.classList.remove('is-fading'); }); }); }
                        };
                        if (curGrid && !reduce) { curGrid.classList.add('is-fading'); setTimeout(swap, MOTION); }
                        else swap();
                    });
                }

                // Topic filter (delegated; works across panels)
                document.querySelectorAll('.watch-panel').forEach(function (panel) {
                    var filter = panel.querySelector('.watch-filter');
                    var grid = panel.querySelector('.watch-grid');
                    if (!filter || !grid) return;
                    filter.addEventListener('click', function (e) {
                        var chip = e.target.closest('.watch-chip');
                        if (!chip) return;
                        var topic = chip.getAttribute('data-topic');
                        filter.querySelectorAll('.watch-chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
                        fade(grid, function () {
                            grid.querySelectorAll('.watch-card').forEach(function (card) {
                                var topics = (card.getAttribute('data-topics') || '').split(' ');
                                var show = topic === 'all' || topics.indexOf(topic) !== -1;
                                card.classList.toggle('is-filtered', !show);
                            });
                        });
                    });
                });

                // Fallback featured: click-to-play facade (no permalink to link to).
                var fp = document.getElementById('watch-feature-play');
                if (fp) {
                    var played = false;
                    fp.addEventListener('click', function () {
                        if (played) return; played = true;
                        var iframe = document.createElement('iframe');
                        iframe.className = 'watch-feature-iframe';
                        iframe.src = 'https://www.youtube.com/embed/' + fp.getAttribute('data-video') + '?autoplay=1&rel=0&modestbranding=1';
                        iframe.title = 'Sunday service video from Morning Star Christian Church';
                        iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
                        iframe.setAttribute('allowfullscreen', '');
                        var holder = document.createElement('div');
                        holder.className = 'watch-feature-thumb';
                        holder.appendChild(iframe);
                        fp.replaceWith(holder);
                    });
                }
            })();
        </script>
    </body>`
}
