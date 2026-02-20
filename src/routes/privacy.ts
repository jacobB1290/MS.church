import { type Hono } from 'hono'

export function registerPrivacyRoute(app: Hono) {
  app.get('/privacy', (c) => {
    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          
          <!-- Primary Meta Tags -->
          <title>Privacy Policy, Terms & Accessibility | Morning Star Christian Church</title>
          <meta name="title" content="Privacy Policy, Terms & Accessibility | Morning Star Christian Church">
          <meta name="description" content="Privacy Policy, Terms of Service, and Accessibility Statement for Morning Star Christian Church in Boise, Idaho. Learn how we protect your data and our commitment to accessibility.">
          <meta name="robots" content="index, follow">
          <link rel="canonical" href="https://ms.church/privacy">
          
          <!-- Open Graph / Facebook -->
          <meta property="og:type" content="website">
          <meta property="og:url" content="https://ms.church/privacy">
          <meta property="og:title" content="Legal Information | Morning Star Christian Church">
          <meta property="og:description" content="Privacy Policy, Terms of Service, and Accessibility Statement for Morning Star Christian Church.">
          <meta property="og:site_name" content="Morning Star Christian Church">
          
          <!-- Twitter -->
          <meta name="twitter:card" content="summary">
          <meta name="twitter:url" content="https://ms.church/privacy">
          <meta name="twitter:title" content="Legal Information | Morning Star Christian Church">
          <meta name="twitter:description" content="Privacy Policy, Terms of Service, and Accessibility Statement for Morning Star Christian Church.">
          
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: #f8f9fd;
                  color: #1a1a2e;
                  line-height: 1.7;
                  min-height: 100vh;
              }
              
              .legal-container {
                  max-width: 900px;
                  margin: 0 auto;
                  padding: 60px 24px 80px;
              }
              
              .back-link {
                  display: inline-flex;
                  align-items: center;
                  gap: 8px;
                  color: #d4a574;
                  text-decoration: none;
                  font-size: 14px;
                  font-weight: 500;
                  margin-bottom: 40px;
                  transition: opacity 0.3s ease;
              }
              
              .back-link:hover {
                  opacity: 0.7;
              }
              
              .page-header {
                  margin-bottom: 48px;
                  text-align: center;
              }
              
              .page-header h1 {
                  font-family: 'Playfair Display', serif;
                  font-size: clamp(32px, 6vw, 48px);
                  color: #1a1a2e;
                  margin-bottom: 16px;
                  font-weight: 700;
              }
              
              .page-header .last-updated {
                  font-size: 14px;
                  color: rgba(26, 26, 46, 0.5);
              }
              
              .nav-tabs {
                  display: flex;
                  justify-content: center;
                  gap: 12px;
                  margin-bottom: 40px;
                  flex-wrap: wrap;
              }
              
              .nav-tab {
                  padding: 12px 24px;
                  border-radius: 50px;
                  text-decoration: none;
                  font-size: 14px;
                  font-weight: 600;
                  transition: all 0.3s ease;
                  background: rgba(255, 255, 255, 0.6);
                  color: rgba(26, 26, 46, 0.7);
                  border: 1px solid rgba(26, 26, 46, 0.1);
              }
              
              .nav-tab:hover {
                  background: rgba(255, 255, 255, 0.9);
                  color: #1a1a2e;
              }
              
              .nav-tab.active {
                  background: #d4a574;
                  color: #ffffff;
                  border-color: #d4a574;
              }
              
              .legal-section {
                  background: rgba(255, 255, 255, 0.85);
                  border-radius: 32px;
                  padding: 48px;
                  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
                  border: 1px solid rgba(255, 255, 255, 0.6);
                  margin-bottom: 40px;
                  scroll-margin-top: 20px;
              }
              
              .section-title {
                  font-family: 'Playfair Display', serif;
                  font-size: 28px;
                  color: #1a1a2e;
                  margin-bottom: 24px;
                  font-weight: 700;
                  padding-bottom: 16px;
                  border-bottom: 2px solid #d4a574;
              }
              
              .legal-section h2 {
                  font-family: 'Playfair Display', serif;
                  font-size: 22px;
                  color: #1a1a2e;
                  margin: 32px 0 16px;
                  font-weight: 600;
              }
              
              .legal-section h2:first-of-type {
                  margin-top: 0;
              }
              
              .legal-section h3 {
                  font-size: 17px;
                  color: #1a1a2e;
                  margin: 24px 0 12px;
                  font-weight: 600;
              }
              
              .legal-section p {
                  color: rgba(26, 26, 46, 0.75);
                  margin-bottom: 16px;
                  font-size: 15px;
              }
              
              .legal-section ul {
                  margin: 16px 0;
                  padding-left: 24px;
                  color: rgba(26, 26, 46, 0.75);
              }
              
              .legal-section li {
                  margin-bottom: 8px;
                  font-size: 15px;
              }
              
              .legal-section a {
                  color: #d4a574;
                  text-decoration: none;
              }
              
              .legal-section a:hover {
                  text-decoration: underline;
              }
              
              .legal-section strong {
                  color: #1a1a2e;
                  font-weight: 600;
              }
              
              .contact-box {
                  background: rgba(212, 165, 116, 0.1);
                  border-radius: 16px;
                  padding: 24px;
                  margin-top: 32px;
              }
              
              .contact-box h3 {
                  margin-top: 0;
                  color: #1a1a2e;
              }
              
              @media (max-width: 600px) {
                  .legal-container {
                      padding: 40px 16px 60px;
                  }
                  
                  .legal-section {
                      padding: 32px 24px;
                      border-radius: 24px;
                  }
                  
                  .nav-tabs {
                      gap: 8px;
                  }
                  
                  .nav-tab {
                      padding: 10px 16px;
                      font-size: 13px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="legal-container">
              <a href="/" class="back-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back to Home
              </a>
              
              <div class="page-header">
                  <h1>Legal Information</h1>
                  <p class="last-updated">Last Updated: February 3, 2026</p>
              </div>
              
              <nav class="nav-tabs">
                  <a href="#privacy" class="nav-tab">Privacy Policy</a>
                  <a href="#terms" class="nav-tab">Terms of Service</a>
                  <a href="#accessibility" class="nav-tab">Accessibility</a>
              </nav>
              
              <!-- ==================== PRIVACY POLICY ==================== -->
              <section id="privacy" class="legal-section">
                  <h1 class="section-title">Privacy Policy</h1>
                  
                  <h2>Introduction</h2>
                  <p>Morning Star Christian Church ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website ms.church (the "Site"). This policy applies only to information collected through this website and does not apply to information collected offline or through in-person church activities.</p>
                  <p>Please read this privacy policy carefully. By using the Site and submitting information through our contact form, you consent to the practices described in this policy.</p>
                  
                  <h2>Information We Collect</h2>
                  
                  <h3>1. Information You Provide Voluntarily</h3>
                  <p>When you use our contact form (powered by Jotform), you may voluntarily provide us with personal information, including but not limited to:</p>
                  <ul>
                      <li><strong>Full Name</strong> – to identify and address you personally</li>
                      <li><strong>Email Address</strong> – to respond to your inquiries and communicate with you</li>
                      <li><strong>Phone Number</strong> – to contact you if requested or necessary</li>
                      <li><strong>Message Content</strong> – any additional information you choose to share</li>
                  </ul>
                  <p>This information is collected for the purpose of potentially responding to your inquiries, facilitating communication regarding church activities, services, or prayer requests, and sending you promotional materials about our church including newsletters, event announcements, and ministry updates via email and text message. <strong>Please note:</strong> Submitting information through our contact form does not obligate us to respond or take any action. See our Terms of Service for details.</p>
                  <p><strong>Sensitive Information Warning:</strong> Please do not submit sensitive personal information (such as medical details, financial information, or other confidential data) through our contact form unless you choose to share it. If you include such information (for example, in a prayer request), you understand it may be viewed by church staff and volunteers who handle these requests.</p>
                  <p><strong>Who Receives Your Information:</strong> When you submit information through our contact form, it is stored in Jotform, emailed to church staff at our church email address, and may be accessed by authorized church members and volunteers for the purpose of responding to your inquiry or fulfilling ministry-related activities (such as outreach drives).</p>
                  
                  <h3>2. Automatically Collected Information (Analytics)</h3>
                  <p>We use <strong>Vercel Web Analytics</strong> and <strong>Vercel Speed Insights</strong> to understand overall traffic and website performance. These services are designed to be privacy-focused. The data collected may include:</p>
                  <ul>
                      <li><strong>Page Views</strong> – which pages/URLs are visited</li>
                      <li><strong>Referrer Information</strong> – how you arrived at our Site</li>
                      <li><strong>Device Information</strong> – browser type, operating system, and device category (desktop/mobile)</li>
                      <li><strong>Geographic Location</strong> – general location (which may include country, state, or city)</li>
                      <li><strong>Performance Metrics</strong> – page load times and web vitals</li>
                  </ul>
                  <p>Vercel states that these analytics tools are designed so recorded data points are anonymous and not tied to an individual visitor or IP address, and they do not enable reconstruction of a person's browsing session across pages. Sessions are short-lived and discarded after 24 hours. For more details, please review <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener">Vercel's Analytics Privacy Policy</a>.</p>
                  <p><strong>Note on Cookies:</strong> While Vercel Analytics does not use cookies, our Site may include third-party embedded content (such as YouTube videos) that may set their own cookies when loaded. See the "Third-Party Services" section below for more information.</p>
                  
                  <h2>How We Use Your Information</h2>
                  <p>We use the information we collect for the following purposes:</p>
                  <ul>
                      <li>To respond to your inquiries and prayer requests</li>
                      <li>To provide information about church services, events, and activities</li>
                      <li>To send church updates and ministry communications, including newsletters, event announcements, and ministry updates via email and/or text message</li>
                      <li>To improve our website and user experience based on aggregated analytics</li>
                      <li>To maintain the security and functionality of our Site</li>
                  </ul>
                  <p><strong>Consent:</strong> Our contact form requires you to agree to receive church updates by email and text message before submission. By checking the required consent boxes and submitting the form, you expressly consent to receiving communications from Morning Star Christian Church at the email address and phone number you provide. Standard message and data rates may apply to text messages. Message frequency varies. <strong>Consent to receive messages is not a condition of attending church services or receiving ministry support.</strong></p>
                  <p><strong>Opt-Out:</strong> You may opt out of communications at any time. See the "Your Rights" section below for opt-out instructions. Reply HELP to any text message for assistance.</p>
                  <p><strong>Access Controls:</strong> Access to your personal information is limited to church staff and authorized volunteers who need it to respond to your inquiry or fulfill ministry-related activities.</p>
                  
                  <h2>Third-Party Services</h2>
                  
                  <h3>Jotform (Contact Form)</h3>
                  <p>Our contact form is powered by Jotform. Jotform processes form submissions on our behalf. When you submit information through our form, it is stored by Jotform and also emailed to our church staff. Jotform maintains industry-standard security measures. For more information, please review <a href="https://www.jotform.com/privacy/" target="_blank" rel="noopener">Jotform's Privacy Policy</a>.</p>
                  
                  <h3>Vercel (Hosting and Analytics)</h3>
                  <p>Our website is hosted on Vercel, which also provides our analytics services. Vercel Web Analytics is designed to be privacy-focused and does not use cookies. For more information, please review <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener">Vercel's Analytics Privacy Policy</a>.</p>
                  
                  <h3>YouTube (Embedded Videos)</h3>
                  <p>Our Site contains embedded YouTube videos. <strong>Please note:</strong> Our website is designed to automatically display and play YouTube videos at scheduled times during the week (for example, during our regular service times). When these videos load or play—whether automatically or by your interaction—YouTube may collect information and set cookies in accordance with their privacy policy.</p>
                  <p><strong>YouTube Data Collection:</strong> When YouTube videos are loaded on our Site, YouTube/Google may collect:</p>
                  <ul>
                      <li>IP address and general location information</li>
                      <li>Device and browser information</li>
                      <li>Viewing history and interactions with the video player</li>
                      <li>Cookies and similar tracking technologies</li>
                  </ul>
                  <p><strong>Privacy-Enhanced Mode:</strong> Where possible, we utilize YouTube's privacy-enhanced embed mode (youtube-nocookie.com) to minimize tracking. In this mode, YouTube states that it does not store information about visitors on your website unless they play the video. However, once a video is played, standard YouTube data collection applies.</p>
                  <p><strong>Your Controls:</strong> You can manage YouTube/Google cookies and tracking through your browser settings or by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener">Google's Ad Settings</a>. You may also use browser extensions that block third-party cookies or trackers. Note that blocking cookies may affect video playback functionality.</p>
                  <p>While our website analytics (Vercel) do not use cookies, embedded YouTube videos may set their own cookies and trackers when loaded. For more information, please review <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google's Privacy Policy</a>.</p>
                  
                  <h3>Social Media Platforms</h3>
                  <p>Our Site contains links to third-party social media platforms. When you click on these links, you will be directed to external websites that are not operated by us. We encourage you to review the privacy policies of these platforms:</p>
                  <ul>
                      <li><strong>Instagram</strong> – <a href="https://privacycenter.instagram.com/policy" target="_blank" rel="noopener">Instagram Privacy Policy</a></li>
                      <li><strong>Facebook</strong> – <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener">Facebook Privacy Policy</a></li>
                      <li><strong>YouTube</strong> – <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">YouTube/Google Privacy Policy</a></li>
                  </ul>
                  <p>We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>
                  
                  <p><strong>Important:</strong> Even though our own analytics do not use cookies, third-party embedded content (such as YouTube videos and the Jotform contact form) may collect data and set cookies independently. We cannot control or monitor this third-party data collection.</p>
                  
                  <h2>Data Retention</h2>
                  <p><strong>Contact Form Submissions:</strong> Form submissions are retained in Jotform and our email records for as long as needed for ministry purposes and church recordkeeping. We periodically review stored data and delete or anonymize information when it is no longer needed. If you would like your information deleted sooner, please submit a written request by mail as described in the "Your Rights" section below.</p>
                  <p><strong>Analytics Data:</strong> Analytics data is retained in accordance with Vercel's data retention policies and is used solely for aggregated statistical purposes.</p>
                  <p><strong>Backups:</strong> Please note that your information may also exist in routine backups, which are retained for operational and security purposes.</p>
                  
                  <h2>Legal Requirements and Disclosures</h2>
                  <p>We may disclose your personal information if required to do so by law or in response to valid requests by public authorities (e.g., a court order, subpoena, or government request). We may also disclose information when we believe in good faith that disclosure is necessary to:</p>
                  <ul>
                      <li>Comply with a legal obligation</li>
                      <li>Protect and defend the rights or property of Morning Star Christian Church</li>
                      <li>Prevent or investigate possible wrongdoing in connection with the Site</li>
                      <li>Protect the personal safety of users of the Site or the public</li>
                  </ul>
                  
                  <h2>Data Security</h2>
                  <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:</p>
                  <ul>
                      <li>SSL/TLS encryption for all data transmitted to and from our Site</li>
                      <li>Secure form submission through Jotform's encrypted platform</li>
                      <li>Limited access to personal information on a need-to-know basis</li>
                  </ul>
                  <p>However, please be aware that no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
                  
                  <h2>Your Rights</h2>
                  <p>Depending on your location and applicable law, you may have certain rights regarding your personal information, including:</p>
                  <ul>
                      <li><strong>Right to Access</strong> – request a copy of the personal information we hold about you</li>
                      <li><strong>Right to Rectification</strong> – request correction of inaccurate information</li>
                      <li><strong>Right to Erasure</strong> – request deletion of your personal information</li>
                      <li><strong>Right to Restrict Processing</strong> – request limitation of how we use your data</li>
                      <li><strong>Right to Data Portability</strong> – request transfer of your data in a structured format</li>
                  </ul>
                  
                  <h3>Formal Requests by Mail</h3>
                  <p>To help protect your privacy and prevent fraud, we require formal privacy requests (such as requests to access, correct, or delete personal information) to be submitted in writing by mail to:</p>
                  <p style="margin-left: 20px;">
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
                  
                  <h3>Email as a Convenience</h3>
                  <p>We may accept privacy requests submitted by email to <a href="mailto:morningstarchurchboise@gmail.com">morningstarchurchboise@gmail.com</a> as a convenience. However, please be aware that this email inbox may not be monitored regularly, and submitting a request by email does not guarantee a response. If you do not receive a response to an email request within a reasonable time, please submit your request by mail to the address above.</p>
                  
                  <h3>Opt-Out Requests</h3>
                  <p><strong>Exception for Opt-Out:</strong> Opt-out requests do not require a mailed letter. You can opt out of communications at any time by:</p>
                  <ul>
                      <li><strong>Text messages:</strong> Reply STOP to any text message.</li>
                      <li><strong>Email:</strong> Click the unsubscribe link in any email, or email us with "Unsubscribe" in the subject line.</li>
                  </ul>
                  
                  <h3>Response Timing</h3>
                  <p>If we receive a valid privacy request, we will make reasonable efforts to respond within a reasonable time. Response times may vary depending on the nature of the request, the need to verify your identity, and the availability of staff and volunteers. As a religious organization operated primarily by volunteers, we appreciate your patience.</p>
                  <p>To protect your privacy, we may need to verify your identity before processing your request.</p>
                  
                  <h2>Children's Privacy</h2>
                  <p>Our Site is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately by mail or email (see "How to Contact Us" below) so we can delete such information.</p>
                  
                  <h2>Changes to This Policy</h2>
                  <p>We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this page with an updated "Last Updated" date. We encourage you to review this Privacy Policy periodically.</p>
                  
                  <h2>Do Not Track Signals</h2>
                  <p>Some web browsers have a "Do Not Track" feature that signals to websites that you do not want your online activity tracked. Our Site does not currently respond to Do Not Track signals, as there is no industry standard for how to handle such requests. However, as noted above, our analytics are already designed to be privacy-focused and do not track individual users across sites.</p>
                  
                  <h2>California Privacy Rights</h2>
                  <p>As a nonprofit religious organization, we are generally not subject to the California Consumer Privacy Act (CCPA). However, we are committed to transparency and will endeavor to respond to privacy-related questions from California residents as time permits. We do not sell personal information to third parties. If you have questions about your privacy rights, please contact us by mail or email as described in "How to Contact Us" below.</p>
                  
                  <h2>International Users</h2>
                  <p>If you are accessing our Site from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located. By using our Site, you consent to such transfer.</p>
                  
                  <h2>How to Contact Us</h2>
                  <p>If you have any questions about this Privacy Policy or our data practices, you may contact us using the methods below.</p>
                  
                  <div class="contact-box">
                      <h3>Contact Information</h3>
                      <p><strong>By Mail (Primary Method):</strong></p>
                      <p style="margin-left: 20px;">
                          Morning Star Christian Church<br>
                          Attn: Privacy<br>
                          3080 Wildwood St<br>
                          Boise, Idaho 83713
                      </p>
                      <p style="margin-top: 16px;"><strong>By Email or Contact Form (Convenience):</strong></p>
                      <p>You may also reach us by email at <a href="mailto:morningstarchurchboise@gmail.com">morningstarchurchboise@gmail.com</a> or through our <a href="/#contact">website contact form</a>. Please note that email and form submissions are provided as a convenience only. These channels may not be monitored regularly, and we cannot guarantee a response. For formal requests requiring a response, please contact us by mail.</p>
                      <p style="font-size: 13px; color: rgba(26, 26, 46, 0.5); margin-top: 16px;"><em>Note: As a volunteer-operated religious organization, we are under no obligation to respond to any communication. Response times vary based on volunteer availability.</em></p>
                  </div>
              </section>
              
              <!-- ==================== TERMS OF SERVICE ==================== -->
              <section id="terms" class="legal-section">
                  <h1 class="section-title">Terms of Service</h1>
                  
                  <h2>Agreement to Terms</h2>
                  <p>By accessing and using the Morning Star Christian Church website at ms.church (the "Site"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Site. We reserve the right to modify these Terms at any time, and such modifications will be effective immediately upon posting. Your continued use of the Site constitutes acceptance of the modified Terms.</p>
                  
                  <h2>Use of the Site</h2>
                  <p>This Site is provided by Morning Star Christian Church for informational and spiritual purposes. You may use this Site for lawful purposes only and in accordance with these Terms. You agree not to:</p>
                  <ul>
                      <li>Use the Site in any way that violates any applicable federal, state, local, or international law or regulation</li>
                      <li>Attempt to gain unauthorized access to any portion of the Site, other accounts, computer systems, or networks connected to the Site</li>
                      <li>Use any robot, spider, or other automatic device, process, or means to access the Site for any purpose</li>
                      <li>Introduce any viruses, Trojan horses, worms, logic bombs, or other material that is malicious or technologically harmful</li>
                      <li>Interfere with or disrupt the Site or servers or networks connected to the Site</li>
                      <li>Use the Site to transmit any advertising or promotional material without our prior written consent</li>
                  </ul>
                  
                  <h2>Intellectual Property Rights</h2>
                  <p>All content on this website, including but not limited to text, graphics, logos, images, audio clips, video clips, digital downloads, data compilations, and software, is the property of Morning Star Christian Church or its content suppliers and is protected by United States and international copyright laws.</p>
                  <p>You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Site, except as follows:</p>
                  <ul>
                      <li>Your computer may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials</li>
                      <li>You may store files that are automatically cached by your web browser for display enhancement purposes</li>
                      <li>You may print or download one copy of a reasonable number of pages of the Site for your own personal, non-commercial use and not for further reproduction, publication, or distribution</li>
                  </ul>
                  
                  <h2>Copyright Complaints (DMCA)</h2>
                  <p>If you believe that any content on our Site infringes your copyright, please submit a written notice by mail to:</p>
                  <p style="margin-left: 20px;">
                      Morning Star Christian Church<br>
                      Attn: Copyright Complaint<br>
                      3080 Wildwood St<br>
                      Boise, Idaho 83713
                  </p>
                  <p>You may also submit a notice by email to <a href="mailto:morningstarchurchboise@gmail.com">morningstarchurchboise@gmail.com</a> with the subject line "Copyright Complaint" as a convenience, though mail is preferred. Please include a description of the copyrighted work, the location (URL) of the allegedly infringing material on our Site, and your contact information. We will review and respond to valid copyright complaints in accordance with applicable law.</p>
                  
                  <h2>User Conduct</h2>
                  <p>By using this website, you agree to conduct yourself in a manner consistent with the values and mission of Morning Star Christian Church. When using our contact form or otherwise interacting with the Site, you agree not to:</p>
                  <ul>
                      <li>Submit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
                      <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</li>
                      <li>Attempt to gain unauthorized access to any portion of the Site or its systems</li>
                      <li>Use the contact form for spam, advertising, or any commercial purpose unrelated to legitimate church inquiries</li>
                      <li>Attempt to attack, disrupt, or compromise the security of the Site</li>
                  </ul>
                  <p><strong>Termination of Access:</strong> We reserve the right to block access to the Site or refuse form submissions from any user who violates these Terms or misuses the Site, without prior notice.</p>
                  
                  <h2>Contact Form Submissions</h2>
                  <p><strong>No Obligation to Respond:</strong> Morning Star Christian Church is under no obligation to respond to any message, inquiry, or submission received through our contact form, email, or any other communication channel. Submitting information through our contact form or otherwise contacting us does not create any relationship, duty, or obligation on our part to respond, acknowledge, or take action on your submission.</p>
                  <p>While we endeavor to respond to legitimate inquiries as time and resources permit, we expressly reserve the right to:</p>
                  <ul>
                      <li>Not respond to any message for any reason or no reason at all</li>
                      <li>Not respond to messages that appear to be spam, solicitations, or unrelated to church matters</li>
                      <li>Not respond to messages that are abusive, inappropriate, or inconsistent with our mission</li>
                      <li>Delay response indefinitely based on staff and volunteer availability</li>
                      <li>Delete or discard messages without response or notification</li>
                  </ul>
                  <p><strong>No Confidentiality:</strong> Unless you have a pre-existing confidential relationship with Morning Star Christian Church, any information you submit through our contact form or other communication channels shall be deemed non-confidential. We have no obligation to keep such information confidential, though we will handle personal information in accordance with our Privacy Policy.</p>
                  <p><strong>As a volunteer-operated religious organization</strong>, our ability to respond to communications is limited and dependent on the availability of volunteers. Your patience and understanding are appreciated.</p>
                  
                  <h2>Changes to the Site</h2>
                  <p>We may change, suspend, or discontinue any part of the Site at any time, including the availability of any feature, content, or service, without prior notice. We will not be liable if any part of the Site is unavailable at any time or for any period.</p>
                  
                  <h2>Disclaimer of Warranties</h2>
                  <p>THE SITE AND ALL CONTENT, MATERIALS, INFORMATION, AND SERVICES PROVIDED ON THE SITE ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. MORNING STAR CHRISTIAN CHURCH DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.</p>
                  <p>Morning Star Christian Church does not warrant that the Site will be uninterrupted, error-free, or free of viruses or other harmful components. The content on this Site is provided for general informational and spiritual encouragement purposes only and is not intended to be a substitute for professional advice, including but not limited to legal, financial, medical, or counseling advice.</p>
                  
                  <h2>Limitation of Liability</h2>
                  <p>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, MORNING STAR CHRISTIAN CHURCH, ITS STAFF, VOLUNTEERS, AND WEBSITE OPERATORS SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH:</p>
                  <ul>
                      <li>Your access to, use of, or inability to use the Site</li>
                      <li>Any conduct or content of any third party on the Site</li>
                      <li>Any content obtained from the Site</li>
                      <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                  </ul>
                  <p>This limitation applies regardless of whether such damages arise from contract, tort, negligence, strict liability, or any other legal theory, even if Morning Star Christian Church has been advised of the possibility of such damages.</p>
                  
                  <h2>Indemnification</h2>
                  <p>You agree to defend, indemnify, and hold harmless Morning Star Christian Church, its staff, volunteers, and website operators from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney's fees) arising from:</p>
                  <ul>
                      <li>Your use of and access to the Site</li>
                      <li>Your violation of any term of these Terms</li>
                      <li>Your violation of any third-party right, including without limitation any copyright, property, or privacy right</li>
                      <li>Any claim that your use of the Site caused damage to a third party</li>
                  </ul>
                  
                  <h2>External Links</h2>
                  <p>This website may contain links to third-party websites, including social media platforms, for your convenience and reference. These links do not constitute an endorsement or approval of the content, products, services, or opinions expressed on those external sites. Morning Star Christian Church has no control over and assumes no responsibility for the content, privacy policies, or practices of any third-party websites. You access external links at your own risk and subject to the terms and conditions of those sites.</p>
                  
                  <h2>Third-Party Services</h2>
                  <p>Our Site uses third-party services including but not limited to Jotform (contact forms), Vercel (hosting and analytics), and YouTube (embedded videos). Your use of these services is subject to their respective terms of service and privacy policies. We are not responsible for the practices of these third-party services.</p>
                  
                  <h2>Governing Law and Jurisdiction</h2>
                  <p>These Terms shall be governed by and construed in accordance with the laws of the State of Idaho, United States, without regard to its conflict of law provisions. Any legal action or proceeding arising out of or relating to these Terms or your use of the Site shall be brought exclusively in the state or federal courts located in Ada County, Idaho, and you consent to the personal jurisdiction of such courts.</p>
                  
                  <h2>Severability</h2>
                  <p>If any provision of these Terms is found to be unenforceable or invalid by a court of competent jurisdiction, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect and enforceable.</p>
                  
                  <h2>Entire Agreement</h2>
                  <p>These Terms, together with our Privacy Policy and Accessibility Statement, constitute the entire agreement between you and Morning Star Christian Church regarding your use of the Site and supersede all prior and contemporaneous understandings, agreements, representations, and warranties.</p>
                  
                  <h2>Waiver</h2>
                  <p>The failure of Morning Star Christian Church to enforce any right or provision of these Terms will not be deemed a waiver of such right or provision. Any waiver of any provision of these Terms will be effective only if in writing and signed by Morning Star Christian Church.</p>
                  
                  <h2>How to Contact Us</h2>
                  <p>If you have any questions about these Terms of Service, you may contact us using the methods below.</p>
                  
                  <div class="contact-box">
                      <h3>Contact Information</h3>
                      <p><strong>By Mail (Primary Method):</strong></p>
                      <p style="margin-left: 20px;">
                          Morning Star Christian Church<br>
                          Attn: Terms Inquiry<br>
                          3080 Wildwood St<br>
                          Boise, Idaho 83713
                      </p>
                      <p style="margin-top: 16px;"><strong>By Email or Contact Form (Convenience):</strong></p>
                      <p>You may also reach us by email at <a href="mailto:morningstarchurchboise@gmail.com">morningstarchurchboise@gmail.com</a> or through our <a href="/#contact">website contact form</a>. Please note that email and form submissions are provided as a convenience only. These channels may not be monitored regularly, and we cannot guarantee a response.</p>
                      <p style="font-size: 13px; color: rgba(26, 26, 46, 0.5); margin-top: 16px;"><em>Note: As a volunteer-operated religious organization, we are under no obligation to respond to any communication. Response times vary based on volunteer availability.</em></p>
                  </div>
              </section>
              
              <!-- ==================== ACCESSIBILITY STATEMENT ==================== -->
              <section id="accessibility" class="legal-section">
                  <h1 class="section-title">Accessibility Statement</h1>
                  
                  <h2>Religious Organization Status</h2>
                  <p>Morning Star Christian Church is a religious organization. As a religious entity, we are generally exempt from Title III of the Americans with Disabilities Act (ADA). This exemption is recognized by the ADA National Network and is rooted in the First Amendment to the United States Constitution, which protects the free exercise of religion. However, we recognize that laws and requirements can vary by situation and jurisdiction.</p>
                  <p>Regardless of any legal exemptions, we want our website to be as accessible and welcoming as practical for all visitors. Our commitment to accessibility reflects our values of inclusion and service to our community.</p>
                  
                  <h2>Our Voluntary Commitment to Accessibility</h2>
                  <p>While Morning Star Christian Church is legally exempt from ADA compliance requirements, we are committed to making our website as accessible as possible to all visitors, including those with disabilities. This commitment reflects our core values of love, inclusion, and service to our community.</p>
                  <p>We voluntarily strive to follow the principles of the <strong>Web Content Accessibility Guidelines (WCAG) 2.1</strong> where practical, recognizing that digital accessibility aligns with our mission to welcome all people.</p>
                  
                  <h2>Accessibility Features</h2>
                  <p>We have made efforts to include the following accessibility considerations on our website:</p>
                  <ul>
                      <li>Semantic HTML structure for screen reader compatibility</li>
                      <li>Descriptive alt text for images where applicable</li>
                      <li>Clear navigation and logical page structure</li>
                      <li>Readable fonts and text sizing</li>
                      <li>ARIA labels on interactive elements</li>
                      <li>Sufficient color contrast for text readability</li>
                      <li>Keyboard-navigable interface elements</li>
                  </ul>
                  
                  <h2>Known Limitations</h2>
                  <p>As a volunteer-operated religious organization with limited resources, some areas of our website may not fully meet all accessibility standards. We are continually working to improve the accessibility of our site as resources permit. Known limitations may include:</p>
                  <ul>
                      <li>Some older content may not have complete alt text descriptions</li>
                      <li>Certain interactive elements may have limited keyboard accessibility</li>
                      <li>Video content may not have closed captions in all cases</li>
                  </ul>
                  
                  <h2>Third-Party Content</h2>
                  <p>Our website may include embedded content from third-party services (such as YouTube videos, Jotform contact forms, and social media platforms). We do not control the accessibility features of these external services, and their accessibility practices are governed by their respective providers:</p>
                  <ul>
                      <li><strong>YouTube</strong> – <a href="https://support.google.com/youtube/answer/189278" target="_blank" rel="noopener">YouTube Accessibility Features</a></li>
                      <li><strong>Jotform</strong> – <a href="https://www.jotform.com/accessibility/" target="_blank" rel="noopener">Jotform Accessibility</a></li>
                  </ul>
                  
                  <h2>Assistive Technologies</h2>
                  <p>Our website is designed to be compatible with the following assistive technologies:</p>
                  <ul>
                      <li>Screen readers (such as JAWS, NVDA, VoiceOver)</li>
                      <li>Screen magnification software</li>
                      <li>Speech recognition software</li>
                      <li>Keyboard-only navigation</li>
                  </ul>
                  
                  <h2>Alternative Formats</h2>
                  <p>If you need information from our website in an alternative format, we are happy to help as resources permit. Upon request, we can provide key information in formats such as:</p>
                  <ul>
                      <li>Large print documents</li>
                      <li>Information read aloud over the phone</li>
                      <li>Plain text versions of content</li>
                  </ul>
                  <p>Please contact us using the methods described in "How to Contact Us" below to request an alternative format.</p>
                  
                  <h2>Feedback and Assistance</h2>
                  <p>We welcome feedback on the accessibility of our website. If you encounter any accessibility barriers or need assistance accessing any content, please contact us using the methods described in "How to Contact Us" below. We will make reasonable efforts to provide the information you need in an accessible format.</p>
                  <p>When contacting us about accessibility, please include:</p>
                  <ul>
                      <li>The web address (URL) of the content you were trying to access</li>
                      <li>A description of the accessibility problem you encountered</li>
                      <li>Your preferred format for receiving the information (e.g., large print, audio, etc.)</li>
                  </ul>
                  
                  <h2>Continuous Improvement</h2>
                  <p>We are committed to continuously improving the accessibility of our website. We periodically review our site for accessibility issues and work to address them as resources allow. If you have suggestions for improving accessibility, we welcome your input.</p>
                  
                  <h2>How to Contact Us</h2>
                  <p>If you need assistance, want to report an accessibility issue, or have suggestions for improvement, you may contact us using the methods below.</p>
                  
                  <div class="contact-box">
                      <h3>Contact Information</h3>
                      <p><strong>By Mail (Primary Method):</strong></p>
                      <p style="margin-left: 20px;">
                          Morning Star Christian Church<br>
                          Attn: Accessibility<br>
                          3080 Wildwood St<br>
                          Boise, Idaho 83713
                      </p>
                      <p style="margin-top: 16px;"><strong>By Email or Contact Form (Convenience):</strong></p>
                      <p>You may also reach us by email at <a href="mailto:morningstarchurchboise@gmail.com">morningstarchurchboise@gmail.com</a> or through our <a href="/#contact">website contact form</a>. Please note that email and form submissions are provided as a convenience only. These channels may not be monitored regularly, and we cannot guarantee a response.</p>
                      <p style="font-size: 13px; color: rgba(26, 26, 46, 0.5); margin-top: 16px;"><em>Note: As a volunteer-operated religious organization, we are under no obligation to respond to any communication. Response times vary based on volunteer availability. We will make reasonable efforts to assist with accessibility needs as resources permit.</em></p>
                  </div>
              </section>
          </div>
          
          <script>
              // Smooth scroll and active tab highlighting
              document.addEventListener('DOMContentLoaded', function() {
                  const tabs = document.querySelectorAll('.nav-tab');
                  const sections = document.querySelectorAll('.legal-section');
                  
                  // Update active tab based on scroll position
                  function updateActiveTab() {
                      let current = '';
                      sections.forEach(section => {
                          const sectionTop = section.offsetTop;
                          if (scrollY >= sectionTop - 100) {
                              current = section.getAttribute('id');
                          }
                      });
                      
                      tabs.forEach(tab => {
                          tab.classList.remove('active');
                          if (tab.getAttribute('href') === '#' + current) {
                              tab.classList.add('active');
                          }
                      });
                  }
                  
                  window.addEventListener('scroll', updateActiveTab);
                  updateActiveTab();
                  
                  // Smooth scroll on tab click
                  tabs.forEach(tab => {
                      tab.addEventListener('click', function(e) {
                          e.preventDefault();
                          const targetId = this.getAttribute('href').substring(1);
                          const targetSection = document.getElementById(targetId);
                          if (targetSection) {
                              targetSection.scrollIntoView({ behavior: 'smooth' });
                          }
                      });
                  });
                  
                  // Check URL hash on load
                  if (window.location.hash) {
                      const targetSection = document.querySelector(window.location.hash);
                      if (targetSection) {
                          setTimeout(() => {
                              targetSection.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                      }
                  }
              });
          </script>
      </body>
      </html>
    `);
  })
  
}
