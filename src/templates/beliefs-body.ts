import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'

// /beliefs — full Statement of Beliefs page.
// Adopted verbatim from our parent congregation's statement
// (morningstar-church.com/statements-of-beliefs). Eleven core
// doctrinal convictions with supporting Scripture references.
//
// Layout: subpageHeader + intro section + one section-card
// containing an ordered list of all 11 statements. The list
// styling is page-scoped via the inline <style> block at the
// top of the return template so we don't have to thread new
// rules into the global home-styles.ts.

type Belief = { title: string; text: string; refs: string }

const BELIEFS: Belief[] = [
  {
    title: 'Authority of Scripture',
    text: 'We believe the Bible to be the inspired, the only infallible, authoritative Word of God revealing the love of God to the world.',
    refs: '1 Thessalonians 2:13 · 2 Timothy 3:15–17 · John 3:16',
  },
  {
    title: 'Trinity',
    text: 'We believe that there is one God, eternally existent in three persons: Father, Son, and Holy Spirit.',
    refs: 'Matthew 28:19 · John 10:30 · Ephesians 4:4–6',
  },
  {
    title: 'Deity and Redemptive Work of Christ',
    text: 'We believe in the deity of the Lord Jesus Christ, in His virgin birth, in His sinless life, in His miracles, in His vicarious and atoning death through His shed blood on the cross, in His bodily resurrection, in His ascension to the right hand of the Father, and in His personal return in power and glory.',
    refs:
      'Matthew 1:23 · John 1:1–4, 1:29 · Acts 1:11, 2:22–24 · Romans 8:34 · 1 Corinthians 15:3–4 · 2 Corinthians 5:21 · Philippians 2:5–11 · Hebrews 1:1–4, 4:15',
  },
  {
    title: 'Salvation and Judgment',
    text:
      'We believe that all men everywhere are lost and face the judgment of God, that Jesus Christ is the only way of salvation, and that for the salvation of lost and sinful man, repentance of sin and faith in Jesus Christ results in regeneration by the Holy Spirit. Furthermore we believe that God will reward the righteous with eternal life in heaven, and that He will banish the unrighteous to everlasting punishment in hell.',
    refs:
      'Luke 24:46–47 · John 14:6 · Acts 4:12 · Romans 3:23 · 2 Corinthians 5:10–11 · Ephesians 1:7, 2:8–9 · Titus 3:4–7',
  },
  {
    title: 'Ministry of the Holy Spirit',
    text:
      'We believe in the present ministry of the Holy Spirit, whose indwelling enables the Christian to live a godly life.',
    refs:
      'John 3:5–8 · Acts 1:8, 4:31 · Romans 8:9 · 1 Corinthians 2:14 · Galatians 5:16–18 · Ephesians 6:12 · Colossians 2:6–10',
  },
  {
    title: 'Resurrection',
    text:
      'We believe in the resurrection of both the saved and the lost; the saved unto the resurrection of eternal life and the lost unto the resurrection of damnation and eternal punishment.',
    refs: '1 Corinthians 15:51–57 · Revelation 20:11–15',
  },
  {
    title: 'Spiritual Unity of Believers',
    text:
      'We believe in the spiritual unity of believers in the Lord Jesus Christ and that all true believers are members of His body, the church.',
    refs: '1 Corinthians 12:12, 27 · Ephesians 1:22–23',
  },
  {
    title: 'Evangelism and Discipleship',
    text:
      'We believe that the ministry of evangelism (sharing and proclaiming the message of salvation only possible by grace through faith in Jesus Christ) and discipleship (helping followers of Christ grow up into maturity in Christ) is a responsibility of all followers of Jesus Christ.',
    refs: 'Matthew 28:18–20 · Acts 1:8 · Romans 10:9–15 · 1 Peter 3:15',
  },
  {
    title: 'Human Sexuality and Marriage',
    text:
      'We believe God’s plan for human sexuality is to be expressed only within the context of marriage, that God created man and woman as unique biological persons made to complete each other. God instituted monogamous marriage between male and female as the foundation of the family and the basic structure of human society. For this reason, we believe that marriage is exclusively the union of one genetic male and one genetic female.',
    refs: 'Genesis 2:24 · Matthew 19:5–6 · Mark 10:6–9 · Romans 1:26–27 · 1 Corinthians 6:9',
  },
  {
    title: 'Dedication to Prayer and Service',
    text:
      'We believe that we must dedicate ourselves to prayer, to the service of our Lord, to His authority over our lives, and to the ministry of evangelism.',
    refs:
      'Matthew 9:35–38, 22:37–39, 28:18–20 · Acts 1:8 · Romans 10:9–15, 12:20–21 · Galatians 6:10 · Colossians 2:6–10 · 1 Peter 3:15',
  },
  {
    title: 'Sanctity of Human Life',
    text:
      'We believe that human life is sacred from conception to its natural end; and that we must have concern for the physical and spiritual needs of our fellowmen.',
    refs:
      'Psalm 139:13 · Isaiah 49:1 · Jeremiah 1:5 · Matthew 22:37–39 · Romans 12:20–21 · Galatians 6:10',
  },
]

const beliefItems = BELIEFS.map(
  (b, i) => `<li class="belief-row">
                                <span class="belief-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
                                <div class="belief-body">
                                    <h3>${b.title}</h3>
                                    <p>${b.text}</p>
                                    <p class="belief-refs"><span>Scripture</span>${b.refs}</p>
                                </div>
                            </li>`,
).join('\n                            ')

export const beliefsBody = (): string => `
    <style>
        /* Beliefs list — page-scoped so we don't touch home-styles.ts.
           Two-column row (number + text) at desktop, stacked on small phones. */
        .beliefs-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: grid;
            gap: var(--space-xl);
        }
        .belief-row {
            display: grid;
            grid-template-columns: clamp(48px, 6vw, 80px) 1fr;
            gap: var(--space-md);
            align-items: start;
            padding-bottom: var(--space-lg);
            border-bottom: 1px solid var(--text-primary-hairline);
        }
        .belief-row:last-child {
            padding-bottom: 0;
            border-bottom: 0;
        }
        .belief-num {
            font-family: var(--font-display);
            font-size: var(--text-title);
            font-weight: var(--weight-semibold);
            color: var(--gold);
            line-height: 1;
            padding-top: clamp(2px, 0.4vw, 6px);
            letter-spacing: -0.5px;
        }
        .belief-body h3 {
            font-family: var(--font-display);
            font-size: var(--text-heading);
            font-weight: var(--weight-bold);
            color: var(--text-primary);
            margin: 0 0 var(--space-xs);
            line-height: var(--leading-snug);
        }
        .belief-body p {
            color: var(--text-primary-muted);
            line-height: var(--leading-loose);
            font-size: var(--text-body);
            margin: 0;
        }
        .belief-refs {
            margin-top: var(--space-sm) !important;
            font-size: var(--text-label) !important;
            color: var(--text-primary-faint) !important;
            line-height: var(--leading-normal) !important;
            font-style: italic;
        }
        .belief-refs span {
            display: inline-block;
            margin-right: 10px;
            padding: 3px 10px;
            border-radius: var(--radius-pill);
            background: rgba(212, 165, 116, 0.12);
            color: var(--gold);
            font-style: normal;
            font-weight: var(--weight-bold);
            font-size: var(--text-eyebrow);
            letter-spacing: 1.5px;
            text-transform: uppercase;
            vertical-align: 2px;
        }
        @media (max-width: 600px) {
            .belief-row {
                grid-template-columns: 1fr;
                gap: 8px;
            }
            /* Keep the gold "01" at title-size on mobile too. The previous
               --text-heading override (26px max) lost the magazine-feature
               feel that the number is meant to carry. --text-title's mobile
               floor (36px) keeps the editorial dominance. */
            .belief-num {
                padding-top: 0;
            }
        }
    </style>
    <body class="page-subpage">
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main id="main">
                <section id="beliefs-intro">
                    <h1 class="section-heading">What we hold to.</h1>
                    <p class="subpage-intro-lead">These eleven convictions, adopted from our parent congregation, are the doctrinal ground beneath everything we teach, sing, pray, and serve. We hold to the whole counsel of Scripture: grace and truth, with no watered-down version.</p>
                </section>

                <section id="statement">
                    <div class="section-card">
                        <ol class="beliefs-list">
                            ${beliefItems}
                        </ol>
                    </div>
                </section>

                <section id="beliefs-cta" class="subpage-final-cta">
                    <span class="section-eyebrow">Questions?</span>
                    <h2 class="section-heading">We’d love to talk with you.</h2>
                    <p class="subpage-final-cta-lead">If anything here raises a question, sparks a conversation, or stirs something you want to talk through, we’re here. Reach out and we’ll get you everything you need.</p>
                    <a class="event-link-btn teaser-cta" href="/?topic=beliefs#contact">Contact Us</a>
                </section>
            </main>

            ${footer('/')}
        </div>
    </body>`
