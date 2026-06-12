import { subpageHeader } from './shared/subpage-header.js'
import { footer } from './shared/footer.js'

// /privacy — Privacy Policy + Terms of Service, rendered as a standard
// subpage (subpageHeader + flush editorial prose + footer) so the legal
// page shares the exact same design system as every other page.
//
// The legal copy itself is preserved verbatim from the original
// standalone page (substance untouched — only typography was normalized:
// curly quotes/apostrophes in visible text, sentence-case headings,
// em-dash restructures per the editorial conventions).
//
// Layout: h1 + dateline + .subpage-jump (Privacy / Terms) + two flush
// prose sections. The prose styling below is page-scoped (.legal-*);
// everything reads from the shared token catalog in home-styles.ts.

export const privacyBody = (): string => `
    <style>
        /* Legal prose — page-scoped, token-driven. Flush editorial column
           (no card chrome) per the surface vocabulary: cards by exception. */
        .legal-dateline {
            font-size: var(--text-label);
            font-weight: var(--weight-semibold);
            letter-spacing: var(--tracking-wide);
            text-transform: uppercase;
            color: var(--text-primary-faint);
            margin: calc(-1 * var(--space-sm)) 0 0;
        }
        .legal-doc {
            max-width: 72ch;
        }
        .legal-doc h3 {
            font-family: var(--font-display);
            font-size: var(--text-heading);
            font-weight: var(--weight-bold);
            color: var(--text-primary);
            line-height: var(--leading-snug);
            margin: var(--space-xl) 0 var(--space-sm);
        }
        .legal-doc h3:first-of-type {
            margin-top: var(--space-lg);
        }
        .legal-doc h4 {
            font-size: var(--text-body);
            font-weight: var(--weight-semibold);
            color: var(--text-primary);
            line-height: var(--leading-snug);
            margin: var(--space-lg) 0 var(--space-xs);
        }
        .legal-doc p {
            font-size: var(--text-body);
            color: var(--text-primary-muted);
            line-height: var(--leading-normal);
            margin: 0 0 var(--space-sm);
        }
        .legal-doc ul {
            margin: 0 0 var(--space-sm);
            padding-left: var(--space-md);
            color: var(--text-primary-muted);
        }
        .legal-doc li {
            font-size: var(--text-body);
            line-height: var(--leading-normal);
            margin-bottom: var(--space-xs);
        }
        .legal-doc strong {
            color: var(--text-primary);
            font-weight: var(--weight-semibold);
        }
        .legal-doc a {
            color: var(--gold-dark);
            text-decoration: underline;
            text-decoration-color: transparent;
            text-underline-offset: 3px;
            transition: text-decoration-color var(--motion-fast) var(--ease-out-soft), color var(--motion-fast) var(--ease-out-soft);
        }
        .legal-doc a:hover {
            text-decoration-color: currentColor;
        }
        .legal-address {
            margin-left: var(--space-md) !important;
        }
        .legal-footnote {
            font-size: var(--text-small);
            color: var(--text-primary-faint);
            font-style: italic;
            margin-top: var(--space-sm) !important;
        }
        .legal-contact-box {
            background: color-mix(in srgb, var(--gold) 8%, transparent);
            border-radius: var(--radius-lg);
            padding: var(--space-lg);
            margin-top: var(--space-lg);
        }
        .legal-contact-box h4 {
            margin-top: 0;
        }
        .legal-contact-box p:last-child {
            margin-bottom: 0;
        }
        @media (prefers-reduced-motion: reduce) {
            .legal-doc a { transition: none; }
        }
    </style>
    <body class="page-subpage">
        <div class="page">
            ${subpageHeader()}
            <div class="subpage-spacer"></div>
            <main id="main">
                <section id="legal-intro">
                    <h1 class="section-heading">Privacy &amp; terms.</h1>
                    <p class="subpage-intro-lead">How we collect and protect your information, and the terms that apply when you use this site. Both are written to be read, not buried.</p>
                    <p class="legal-dateline">Effective May 22, 2026 &middot; Last updated May 22, 2026</p>
                    <nav class="subpage-jump" aria-label="Jump to a section">
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                    </nav>
                </section>

                <!-- ==================== PRIVACY POLICY ==================== -->
                <section id="privacy">
                    <span class="section-eyebrow">Privacy</span>
                    <h2 class="section-heading">Privacy policy.</h2>
                    <div class="legal-doc">
                        <h3>Introduction</h3>
                        <p>Morning Star Christian Church (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website ms.church (the &ldquo;Site&rdquo;). This policy applies only to information collected through this website and does not apply to information collected offline or through in-person church activities.</p>
                        <p>Please read this privacy policy carefully. By using the Site and submitting information through our contact form, you consent to the practices described in this policy.</p>

                        <h3>Information we collect</h3>

                        <h4>1. Information you provide voluntarily</h4>
                        <p>When you use our contact form, you may voluntarily provide us with personal information, including but not limited to:</p>
                        <ul>
                            <li><strong>Full name</strong> &ndash; to identify and address you personally</li>
                            <li><strong>Email address</strong> &ndash; to respond to your inquiries and communicate with you</li>
                            <li><strong>Phone number</strong> &ndash; to contact you if requested or necessary</li>
                            <li><strong>Message content</strong> &ndash; any additional information you choose to share</li>
                        </ul>
                        <p>Our contact form is hosted directly on this website and is not provided by a third-party marketing platform. When you submit the form, your information is transmitted securely to our own customer-relationship-management (CRM) system, which we operate ourselves. Authorized church staff and volunteers use the CRM to respond to your inquiry, organize ministry follow-up, and (where you have consented) send church communications by email or SMS text message. The form does not load any third-party embed, script, or tracking cookie; submitting it sends your information only to Morning Star Christian Church and the service providers we use to operate our CRM (see &ldquo;Third-party services&rdquo; below).</p>
                        <p>This information is collected for the purpose of potentially responding to your inquiries, facilitating communication regarding church activities, services, or prayer requests, and sending you informational and ministry communications including newsletters, event announcements, and prayer updates via email and SMS text message. <strong>Please note:</strong> Submitting information through our contact form does not obligate us to respond or take any action. See our Terms of Service for details.</p>
                        <p><strong>Sensitive information warning:</strong> Please do not submit sensitive personal information (such as medical details, financial information, or other confidential data) through our contact form unless you choose to share it. If you include such information (for example, in a prayer request), you understand it may be viewed by church staff and volunteers who handle these requests.</p>
                        <p><strong>Who receives your information:</strong> When you submit information through our contact form, it is stored in our own CRM system, where authorized church members and volunteers may access it for the purpose of responding to your inquiry or fulfilling ministry-related activities (such as outreach drives).</p>

                        <h4>2. Automatically collected information (analytics)</h4>
                        <p>We use <strong>Vercel Web Analytics</strong> and <strong>Vercel Speed Insights</strong> to understand overall traffic and website performance. These services are designed to be privacy-focused. The data collected may include:</p>
                        <ul>
                            <li><strong>Page views</strong> &ndash; which pages/URLs are visited</li>
                            <li><strong>Referrer information</strong> &ndash; how you arrived at our Site</li>
                            <li><strong>Device information</strong> &ndash; browser type, operating system, and device category (desktop/mobile)</li>
                            <li><strong>Geographic location</strong> &ndash; general location (which may include country, state, or city)</li>
                            <li><strong>Performance metrics</strong> &ndash; page load times and web vitals</li>
                        </ul>
                        <p>Vercel states that these analytics tools are designed so recorded data points are anonymous and not tied to an individual visitor or IP address, and they do not enable reconstruction of a person&rsquo;s browsing session across pages. Sessions are short-lived and discarded after 24 hours. For more details, please review <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener">Vercel&rsquo;s Analytics Privacy Policy</a>.</p>
                        <p><strong>Note on cookies:</strong> While Vercel Analytics does not use cookies, our Site may include third-party embedded content (such as YouTube videos) that may set their own cookies when loaded. See the &ldquo;Third-party services&rdquo; section below for more information.</p>

                        <h3>How we use your information</h3>
                        <p>We use the information we collect for the following purposes:</p>
                        <ul>
                            <li>To respond to your inquiries and prayer requests</li>
                            <li>To provide information about church services, events, and activities</li>
                            <li>To send church updates and ministry communications, including newsletters, event announcements, and ministry updates via email and/or text message</li>
                            <li>To improve our website and user experience based on aggregated analytics</li>
                            <li>To maintain the security and functionality of our Site</li>
                        </ul>
                        <p><strong>Consent:</strong> Our contact form requires you to agree to receive church updates by email and SMS text message before submission. By checking the required consent boxes and submitting the form, you expressly consent to receiving communications from Morning Star Christian Church at the email address and phone number you provide. Message and data rates may apply to text messages. Message frequency varies. Carriers are not liable for delayed or undelivered messages. <strong>Consent to receive messages is not a condition of attending church services or receiving ministry support.</strong> Your consent is given to Morning Star Christian Church only; we will not sell or share your phone number, email address, or consent record with third parties for their marketing purposes.</p>
                        <p><strong>Opt-out:</strong> You may opt out of communications at any time. See the &ldquo;Your rights&rdquo; section below for opt-out instructions. Reply STOP to any text message to unsubscribe, or reply HELP for assistance.</p>
                        <p><strong>Access controls:</strong> Access to your personal information is limited to church staff and authorized volunteers who need it to respond to your inquiry or fulfill ministry-related activities.</p>

                        <h3>Third-party services</h3>

                        <h4>Supabase (CRM database)</h4>
                        <p>Our contact form submissions are stored in our own CRM system, which uses <strong>Supabase</strong> (a cloud database platform) to host its database. Supabase acts as a data processor on our behalf, storing the information you submit so that authorized church staff and volunteers can access it. Supabase does not receive any data directly from your browser; your submission is sent to our website, which relays it to our CRM over a secure, server-to-server connection. Supabase may process technical data necessary to operate and secure the database in accordance with its own privacy practices. For more information, please review <a href="https://supabase.com/privacy" target="_blank" rel="noopener">Supabase&rsquo;s Privacy Policy</a>.</p>

                        <h4>Vercel (hosting and analytics)</h4>
                        <p>Our website is hosted on Vercel, which also provides our analytics services. Vercel Web Analytics is designed to be privacy-focused and does not use cookies. For more information, please review <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener">Vercel&rsquo;s Analytics Privacy Policy</a>.</p>

                        <h4>YouTube (embedded videos)</h4>
                        <p>Our Site contains embedded YouTube videos. <strong>Please note:</strong> Our website is designed to automatically display and play YouTube videos at scheduled times during the week (for example, during our regular service times). When these videos load or play, whether automatically or by your interaction, YouTube may collect information and set cookies in accordance with their privacy policy.</p>
                        <p><strong>YouTube data collection:</strong> When YouTube videos are loaded on our Site, YouTube/Google may collect:</p>
                        <ul>
                            <li>IP address and general location information</li>
                            <li>Device and browser information</li>
                            <li>Viewing history and interactions with the video player</li>
                            <li>Cookies and similar tracking technologies</li>
                        </ul>
                        <p><strong>Privacy-enhanced mode:</strong> We utilize YouTube&rsquo;s privacy-enhanced embed mode (youtube-nocookie.com) for all video playback on this Site to minimize tracking. In this mode, YouTube states that it does not store information about visitors on your website unless they play the video. However, once a video is played, standard YouTube data collection applies. Note that video thumbnails may still load from youtube.com image servers; those requests do not set tracking cookies but do expose your IP address to YouTube/Google.</p>
                        <p><strong>Your controls:</strong> You can manage YouTube/Google cookies and tracking through your browser settings or by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener">Google&rsquo;s Ad Settings</a>. You may also use browser extensions that block third-party cookies or trackers. Note that blocking cookies may affect video playback functionality.</p>
                        <p>While our website analytics (Vercel) do not use cookies, embedded YouTube videos may set their own cookies and trackers when loaded. For more information, please review <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google&rsquo;s Privacy Policy</a>.</p>

                        <h4>Social media platforms</h4>
                        <p>Our Site contains links to third-party social media platforms. When you click on these links, you will be directed to external websites that are not operated by us. We encourage you to review the privacy policies of these platforms:</p>
                        <ul>
                            <li><strong>Instagram</strong> &ndash; <a href="https://privacycenter.instagram.com/policy" target="_blank" rel="noopener">Instagram Privacy Policy</a></li>
                            <li><strong>Facebook</strong> &ndash; <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener">Facebook Privacy Policy</a></li>
                            <li><strong>YouTube</strong> &ndash; <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">YouTube/Google Privacy Policy</a></li>
                        </ul>
                        <p>We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>
                        <p><strong>Important:</strong> Even though our own analytics do not use cookies, third-party embedded content (such as YouTube videos) may collect data and set cookies independently. We cannot control or monitor this third-party data collection.</p>

                        <h3>Data retention</h3>
                        <p><strong>Contact form submissions:</strong> Form submissions are retained in our CRM system for as long as needed for ministry purposes and church recordkeeping. We periodically review stored data and delete or anonymize information when it is no longer needed. If you would like your information deleted sooner, please submit a written request by mail as described in the &ldquo;Your rights&rdquo; section below.</p>
                        <p><strong>Analytics data:</strong> Analytics data is retained in accordance with Vercel&rsquo;s data retention policies and is used solely for aggregated statistical purposes.</p>
                        <p><strong>Backups:</strong> Please note that your information may also exist in routine backups, which are retained for operational and security purposes.</p>

                        <h3>Legal requirements and disclosures</h3>
                        <p>We may disclose your personal information if required to do so by law or in response to valid requests by public authorities (e.g., a court order, subpoena, or government request). We may also disclose information when we believe in good faith that disclosure is necessary to:</p>
                        <ul>
                            <li>Comply with a legal obligation</li>
                            <li>Protect and defend the rights or property of Morning Star Christian Church</li>
                            <li>Prevent or investigate possible wrongdoing in connection with the Site</li>
                            <li>Protect the personal safety of users of the Site or the public</li>
                        </ul>

                        <h3>Data security</h3>
                        <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:</p>
                        <ul>
                            <li>SSL/TLS encryption for all data transmitted to and from our Site</li>
                            <li>Server-to-server transmission of form submissions to our CRM, signed with a secret key (HMAC) and sent over TLS</li>
                            <li>Limited access to personal information on a need-to-know basis</li>
                        </ul>
                        <p>However, please be aware that no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>

                        <h3>Your rights</h3>
                        <p>Depending on your location and applicable law, you may have certain rights regarding your personal information, including:</p>
                        <ul>
                            <li><strong>Right to access</strong> &ndash; request a copy of the personal information we hold about you</li>
                            <li><strong>Right to rectification</strong> &ndash; request correction of inaccurate information</li>
                            <li><strong>Right to erasure</strong> &ndash; request deletion of your personal information</li>
                            <li><strong>Right to restrict processing</strong> &ndash; request limitation of how we use your data</li>
                            <li><strong>Right to data portability</strong> &ndash; request transfer of your data in a structured format</li>
                        </ul>

                        <h4>Formal requests by mail</h4>
                        <p>To help protect your privacy and prevent fraud, we require formal privacy requests (such as requests to access, correct, or delete personal information) to be submitted in writing by mail to:</p>
                        <p class="legal-address">
                            <strong>Morning Star Christian Church</strong><br>
                            Attn: Privacy Request<br>
                            3080 Wildwood St<br>
                            Boise, Idaho 83713
                        </p>
                        <p>Please include in your written request:</p>
                        <ul>
                            <li>Your full name and contact information</li>
                            <li>A clear description of the information or action you are requesting</li>
                            <li>Sufficient information to verify your identity (such as the email address or phone number you provided when contacting us)</li>
                        </ul>

                        <h4>Email as a convenience</h4>
                        <p>We may accept privacy requests submitted by email to <a href="mailto:support@ms.church">support@ms.church</a> as a convenience. However, please be aware that this email inbox may not be monitored regularly, and submitting a request by email does not guarantee a response. If you do not receive a response to an email request within a reasonable time, please submit your request by mail to the address above.</p>

                        <h4>Opt-out requests</h4>
                        <p><strong>Exception for opt-out:</strong> Opt-out requests do not require a mailed letter. You can opt out of communications at any time by:</p>
                        <ul>
                            <li><strong>Text messages:</strong> Reply STOP to any text message.</li>
                            <li><strong>Email:</strong> Click the unsubscribe link in any email, or email us with &ldquo;Unsubscribe&rdquo; in the subject line.</li>
                        </ul>

                        <h4>Response timing</h4>
                        <p>If we receive a valid privacy request, we will make reasonable efforts to respond within a reasonable time. Response times may vary depending on the nature of the request, the need to verify your identity, and the availability of staff and volunteers. As a religious organization operated primarily by volunteers, we appreciate your patience.</p>
                        <p>To protect your privacy, we may need to verify your identity before processing your request.</p>

                        <h3>Children&rsquo;s privacy</h3>
                        <p>Morning Star Christian Church warmly welcomes children of all ages to our worship services and ministry programs in person. The data-collection portions of this Site (the contact form, email list, and SMS text message service) are intended for use by adults (age 13 and older). We do not knowingly collect personal information online from children under 13 through the Site. If you are a parent or guardian and believe your child has submitted information through our website, please contact us immediately by mail or email (see &ldquo;How to contact us&rdquo; below) so we can delete such information.</p>

                        <h3>Changes to this policy</h3>
                        <p>We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this page with an updated &ldquo;Last updated&rdquo; date. We encourage you to review this Privacy Policy periodically.</p>

                        <h3>Do Not Track signals</h3>
                        <p>Some web browsers have a &ldquo;Do Not Track&rdquo; feature that signals to websites that you do not want your online activity tracked. Our Site does not currently respond to Do Not Track signals, as there is no industry standard for how to handle such requests. However, as noted above, our analytics are already designed to be privacy-focused and do not track individual users across sites.</p>

                        <h3>California privacy rights</h3>
                        <p>As a nonprofit religious organization, we are generally not subject to the California Consumer Privacy Act (CCPA). However, we are committed to transparency and will endeavor to respond to privacy-related questions from California residents as time permits. We do not sell personal information to third parties. If you have questions about your privacy rights, please contact us by mail or email as described in &ldquo;How to contact us&rdquo; below.</p>

                        <h3>International users</h3>
                        <p>If you are accessing our Site from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located. By using our Site, you consent to such transfer.</p>

                        <h3>How to contact us</h3>
                        <p>If you have any questions about this Privacy Policy or our data practices, you may contact us using the methods below. If you need assistance accessing information on this Site, please reach out the same way. Morning Star Christian Church is a religious organization and is generally exempt from Title III of the Americans with Disabilities Act, and we make no representation that this Site conforms to any specific technical accessibility standard; nonetheless, we will use reasonable efforts, as a volunteer-operated congregation and as resources permit, to provide the information you need in a format that works for you. This commitment is voluntary and does not create any contractual obligation on our part.</p>

                        <div class="legal-contact-box">
                            <h4>Contact information</h4>
                            <p><strong>By mail (primary method):</strong></p>
                            <p class="legal-address">
                                Morning Star Christian Church<br>
                                Attn: Privacy<br>
                                3080 Wildwood St<br>
                                Boise, Idaho 83713
                            </p>
                            <p><strong>By email or contact form (convenience):</strong></p>
                            <p>You may also reach us by email at <a href="mailto:support@ms.church">support@ms.church</a> or through our <a href="/#contact">website contact form</a>. Please note that email and form submissions are provided as a convenience only. These channels may not be monitored regularly, and we cannot guarantee a response. For formal requests requiring a response, please contact us by mail.</p>
                            <p class="legal-footnote">Note: As a volunteer-operated religious organization, we are under no obligation to respond to any communication. Response times vary based on volunteer availability.</p>
                        </div>
                    </div>
                </section>

                <!-- ==================== TERMS OF SERVICE ==================== -->
                <section id="terms">
                    <span class="section-eyebrow">Terms</span>
                    <h2 class="section-heading">Terms of service.</h2>
                    <div class="legal-doc">
                        <h3>Agreement to terms</h3>
                        <p>By accessing and using the Morning Star Christian Church website at ms.church (the &ldquo;Site&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, please do not use the Site. We reserve the right to modify these Terms at any time, and such modifications will be effective immediately upon posting. Your continued use of the Site constitutes acceptance of the modified Terms.</p>

                        <h3>Use of the Site</h3>
                        <p>This Site is provided by Morning Star Christian Church for informational and spiritual purposes. You may use this Site for lawful purposes only and in accordance with these Terms. You agree not to:</p>
                        <ul>
                            <li>Use the Site in any way that violates any applicable federal, state, local, or international law or regulation</li>
                            <li>Attempt to gain unauthorized access to any portion of the Site, other accounts, computer systems, or networks connected to the Site</li>
                            <li>Use any robot, spider, or other automatic device, process, or means to access the Site for any purpose</li>
                            <li>Introduce any viruses, Trojan horses, worms, logic bombs, or other material that is malicious or technologically harmful</li>
                            <li>Interfere with or disrupt the Site or servers or networks connected to the Site</li>
                            <li>Use the Site to transmit any advertising or promotional material without our prior written consent</li>
                        </ul>

                        <h3>Intellectual property rights</h3>
                        <p>All content on this website, including but not limited to text, graphics, logos, images, audio clips, video clips, digital downloads, data compilations, and software, is the property of Morning Star Christian Church or its content suppliers and is protected by United States and international copyright laws.</p>
                        <p>You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Site, except as follows:</p>
                        <ul>
                            <li>Your computer may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials</li>
                            <li>You may store files that are automatically cached by your web browser for display enhancement purposes</li>
                            <li>You may print or download one copy of a reasonable number of pages of the Site for your own personal, non-commercial use and not for further reproduction, publication, or distribution</li>
                        </ul>

                        <h3>Copyright complaints (DMCA)</h3>
                        <p>If you believe that any content on our Site infringes your copyright, please submit a written notice by mail to:</p>
                        <p class="legal-address">
                            Morning Star Christian Church<br>
                            Attn: Copyright Complaint<br>
                            3080 Wildwood St<br>
                            Boise, Idaho 83713
                        </p>
                        <p>You may also submit a notice by email to <a href="mailto:support@ms.church">support@ms.church</a> with the subject line &ldquo;Copyright Complaint&rdquo; as a convenience, though mail is preferred. Please include a description of the copyrighted work, the location (URL) of the allegedly infringing material on our Site, and your contact information. We will review and respond to valid copyright complaints in accordance with applicable law.</p>

                        <h3>User conduct</h3>
                        <p>By using this website, you agree to conduct yourself in a manner consistent with the values and mission of Morning Star Christian Church. When using our contact form or otherwise interacting with the Site, you agree not to:</p>
                        <ul>
                            <li>Submit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
                            <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</li>
                            <li>Attempt to gain unauthorized access to any portion of the Site or its systems</li>
                            <li>Use the contact form for spam, advertising, or any commercial purpose unrelated to legitimate church inquiries</li>
                            <li>Attempt to attack, disrupt, or compromise the security of the Site</li>
                        </ul>
                        <p><strong>Termination of access:</strong> We reserve the right to block access to the Site or refuse form submissions from any user who violates these Terms or misuses the Site, without prior notice.</p>

                        <h3>Contact form submissions</h3>
                        <p><strong>No obligation to respond:</strong> Morning Star Christian Church is under no obligation to respond to any message, inquiry, or submission received through our contact form, email, or any other communication channel. Submitting information through our contact form or otherwise contacting us does not create any relationship, duty, or obligation on our part to respond, acknowledge, or take action on your submission.</p>
                        <p>While we endeavor to respond to legitimate inquiries as time and resources permit, we expressly reserve the right to:</p>
                        <ul>
                            <li>Not respond to any message for any reason or no reason at all</li>
                            <li>Not respond to messages that appear to be spam, solicitations, or unrelated to church matters</li>
                            <li>Not respond to messages that are abusive, inappropriate, or inconsistent with our mission</li>
                            <li>Delay response indefinitely based on staff and volunteer availability</li>
                            <li>Delete or discard messages without response or notification</li>
                        </ul>
                        <p><strong>No confidentiality:</strong> Unless you have a pre-existing confidential relationship with Morning Star Christian Church, any information you submit through our contact form or other communication channels shall be deemed non-confidential. We have no obligation to keep such information confidential, though we will handle personal information in accordance with our Privacy Policy.</p>
                        <p><strong>As a volunteer-operated religious organization</strong>, our ability to respond to communications is limited and dependent on the availability of volunteers. Your patience and understanding are appreciated.</p>

                        <h3>Changes to the Site</h3>
                        <p>We may change, suspend, or discontinue any part of the Site at any time, including the availability of any feature, content, or service, without prior notice. We will not be liable if any part of the Site is unavailable at any time or for any period.</p>

                        <h3>Disclaimer of warranties</h3>
                        <p>THE SITE AND ALL CONTENT, MATERIALS, INFORMATION, AND SERVICES PROVIDED ON THE SITE ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. MORNING STAR CHRISTIAN CHURCH DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.</p>
                        <p>Morning Star Christian Church does not warrant that the Site will be uninterrupted, error-free, or free of viruses or other harmful components. The content on this Site is provided for general informational and spiritual encouragement purposes only and is not intended to be a substitute for professional advice, including but not limited to legal, financial, medical, or counseling advice.</p>

                        <h3>Limitation of liability</h3>
                        <p>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, MORNING STAR CHRISTIAN CHURCH, ITS STAFF, VOLUNTEERS, AND WEBSITE OPERATORS SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH:</p>
                        <ul>
                            <li>Your access to, use of, or inability to use the Site</li>
                            <li>Any conduct or content of any third party on the Site</li>
                            <li>Any content obtained from the Site</li>
                            <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                        </ul>
                        <p>This limitation applies regardless of whether such damages arise from contract, tort, negligence, strict liability, or any other legal theory, even if Morning Star Christian Church has been advised of the possibility of such damages.</p>

                        <h3>Indemnification</h3>
                        <p>You agree to defend, indemnify, and hold harmless Morning Star Christian Church, its staff, volunteers, and website operators from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney&rsquo;s fees) arising from:</p>
                        <ul>
                            <li>Your use of and access to the Site</li>
                            <li>Your violation of any term of these Terms</li>
                            <li>Your violation of any third-party right, including without limitation any copyright, property, or privacy right</li>
                            <li>Any claim that your use of the Site caused damage to a third party</li>
                        </ul>

                        <h3>External links</h3>
                        <p>This website may contain links to third-party websites, including social media platforms, for your convenience and reference. These links do not constitute an endorsement or approval of the content, products, services, or opinions expressed on those external sites. Morning Star Christian Church has no control over and assumes no responsibility for the content, privacy policies, or practices of any third-party websites. You access external links at your own risk and subject to the terms and conditions of those sites.</p>

                        <h3>Third-party services</h3>
                        <p>Our Site uses third-party services including but not limited to Supabase (CRM database), Vercel (hosting and analytics), and YouTube (embedded videos). Your use of these services is subject to their respective terms of service and privacy policies. We are not responsible for the practices of these third-party services.</p>

                        <h3>Governing law and jurisdiction</h3>
                        <p>These Terms shall be governed by and construed in accordance with the laws of the State of Idaho, United States, without regard to its conflict of law provisions. Any legal action or proceeding arising out of or relating to these Terms or your use of the Site shall be brought exclusively in the state or federal courts located in Ada County, Idaho, and you consent to the personal jurisdiction of such courts.</p>

                        <h3>Severability</h3>
                        <p>If any provision of these Terms is found to be unenforceable or invalid by a court of competent jurisdiction, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect and enforceable.</p>

                        <h3>Entire agreement</h3>
                        <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and Morning Star Christian Church regarding your use of the Site and supersede all prior and contemporaneous understandings, agreements, representations, and warranties.</p>

                        <h3>Waiver</h3>
                        <p>The failure of Morning Star Christian Church to enforce any right or provision of these Terms will not be deemed a waiver of such right or provision. Any waiver of any provision of these Terms will be effective only if in writing and signed by Morning Star Christian Church.</p>

                        <h3>How to contact us</h3>
                        <p>If you have any questions about these Terms of Service, you may contact us using the methods below.</p>

                        <div class="legal-contact-box">
                            <h4>Contact information</h4>
                            <p><strong>By mail (primary method):</strong></p>
                            <p class="legal-address">
                                Morning Star Christian Church<br>
                                Attn: Terms Inquiry<br>
                                3080 Wildwood St<br>
                                Boise, Idaho 83713
                            </p>
                            <p><strong>By email or contact form (convenience):</strong></p>
                            <p>You may also reach us by email at <a href="mailto:support@ms.church">support@ms.church</a> or through our <a href="/#contact">website contact form</a>. Please note that email and form submissions are provided as a convenience only. These channels may not be monitored regularly, and we cannot guarantee a response.</p>
                            <p class="legal-footnote">Note: As a volunteer-operated religious organization, we are under no obligation to respond to any communication. Response times vary based on volunteer availability.</p>
                        </div>
                    </div>
                </section>
            </main>

            ${footer()}
        </div>
    </body>`
