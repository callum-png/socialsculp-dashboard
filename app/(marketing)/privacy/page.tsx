import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for SocialSculp LLC.',
}

export default function PrivacyPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Figtree:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #04060E; color: #E6EBF8; font-family: 'Figtree', sans-serif; line-height: 1.7; }
        a { color: #008CFF; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .wrap { max-width: 760px; margin: 0 auto; padding: 80px 32px; }
        .back { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #4A607A; margin-bottom: 48px; }
        .back:hover { color: #E6EBF8; text-decoration: none; }
        h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 40px); letter-spacing: -0.02em; color: #E6EBF8; margin-bottom: 8px; }
        .meta { font-size: 12px; color: #4A607A; margin-bottom: 48px; letter-spacing: 0.06em; text-transform: uppercase; }
        h2 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; color: #E6EBF8; margin: 40px 0 12px; }
        p { color: #8A9BB8; margin-bottom: 16px; font-size: 15px; }
        ul { color: #8A9BB8; font-size: 15px; padding-left: 20px; margin-bottom: 16px; }
        li { margin-bottom: 8px; }
        hr { border: none; border-top: 1px solid #141A32; margin: 40px 0; }
        .footer-note { font-size: 12px; color: #4A607A; margin-top: 48px; }
      `}</style>
      <div className="wrap">
        <Link href="/" className="back">← Back to SocialSculp</Link>

        <h1>Privacy Policy</h1>
        <p className="meta">Effective Date: January 1, 2026 &nbsp;·&nbsp; SocialSculp LLC</p>

        <p>SocialSculp LLC (&ldquo;SocialSculp,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard information when you visit our website or use our services.</p>

        <h2>1. Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <ul>
          <li><strong>Contact Information:</strong> Name, email address, and phone number when you reach out to us or book a call</li>
          <li><strong>Account Information:</strong> Email, name, and role when you sign up for our platform</li>
          <li><strong>Usage Data:</strong> Pages visited, time on site, browser type, and IP address via standard web analytics</li>
          <li><strong>Campaign Data:</strong> Creator handles, performance metrics, deal terms, and content data provided through our platform</li>
          <li><strong>Communications:</strong> Emails, messages, and meeting notes related to your engagement with SocialSculp</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use collected information to:</p>
        <ul>
          <li>Provide, operate, and improve our services and platform</li>
          <li>Communicate with clients, creators, and partners</li>
          <li>Process campaign data and deliver analytics</li>
          <li>Send service-related updates and notifications</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p>We do not sell your personal information to third parties.</p>

        <h2>3. Platform Authentication</h2>
        <p>Our platform uses Clerk for authentication. When you create an account, Clerk collects and stores authentication data on our behalf. Please review <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer">Clerk&apos;s Privacy Policy</a> for details on how they handle your data.</p>

        <h2>4. Cookies and Tracking</h2>
        <p>We use cookies and similar technologies to maintain sessions, remember preferences, and analyze site usage. You can control cookies through your browser settings, though some features may not function properly without them.</p>

        <h2>5. Data Storage and Security</h2>
        <p>Your data is stored on secure cloud infrastructure. We implement industry-standard security measures including encryption in transit (TLS) and at rest. However, no method of transmission over the internet is 100% secure.</p>

        <h2>6. Third-Party Services</h2>
        <p>We may share data with trusted service providers who assist in operating our platform, including:</p>
        <ul>
          <li>Clerk (authentication)</li>
          <li>Vercel (hosting and deployment)</li>
          <li>Neon (database)</li>
          <li>Google (calendar and email)</li>
        </ul>
        <p>These providers are contractually obligated to protect your data.</p>

        <h2>7. Data Retention</h2>
        <p>We retain personal information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your data by contacting us.</p>

        <h2>8. Your Rights</h2>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Opt out of certain data processing activities</li>
        </ul>
        <p>To exercise these rights, email us at <a href="mailto:business@socialsculp.io">business@socialsculp.io</a>.</p>

        <h2>9. Children&apos;s Privacy</h2>
        <p>Our services are not directed at individuals under the age of 13. We do not knowingly collect personal information from children.</p>

        <h2>10. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Changes are effective upon posting to this page. We encourage you to review this policy periodically.</p>

        <h2>11. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us:</p>
        <p><a href="mailto:business@socialsculp.io">business@socialsculp.io</a><br />SocialSculp LLC, Louisiana, USA</p>

        <hr />
        <p className="footer-note">&copy; 2026 SocialSculp LLC. All rights reserved. Established 2024.</p>
      </div>
    </>
  )
}
