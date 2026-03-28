import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service governing the use of SocialSculp creator seeding and narrative engineering services.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function TermsPage() {
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

        <h1>Terms of Service</h1>
        <p className="meta">Effective Date: January 1, 2026 &nbsp;·&nbsp; SocialSculp LLC</p>

        <p>Welcome to SocialSculp. By accessing or using our website, platform, or services, you agree to be bound by these Terms of Service. Please read them carefully.</p>

        <h2>1. About SocialSculp</h2>
        <p>SocialSculp LLC (&ldquo;SocialSculp,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is a Louisiana-based influencer marketing and narrative engineering agency. We provide services including creator seeding, influencer marketing, media buying, creative production, performance marketing, and talent management.</p>

        <h2>2. Acceptance of Terms</h2>
        <p>By visiting our website at socialsculp.io, engaging with our services, or using our proprietary campaign platform, you agree to these Terms. If you do not agree, please discontinue use immediately.</p>

        <h2>3. Services</h2>
        <p>SocialSculp offers the following services to brands and creators:</p>
        <ul>
          <li>Influencer marketing and creator seeding campaigns</li>
          <li>Media buying and performance advertising</li>
          <li>Creative production and content strategy</li>
          <li>Talent management and brand partnership brokering</li>
          <li>Access to the SocialSculp campaign management platform (invite-only)</li>
        </ul>
        <p>All service engagements are governed by separate written agreements between SocialSculp and the client or talent.</p>

        <h2>4. Platform Access</h2>
        <p>The SocialSculp dashboard platform is invite-only and accessible only to approved agents, creators, and administrators. Unauthorized access attempts are prohibited. SocialSculp reserves the right to revoke access at any time without notice.</p>

        <h2>5. Intellectual Property</h2>
        <p>All content on this website — including text, graphics, logos, and campaign materials — is the property of SocialSculp LLC and protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.</p>

        <h2>6. User Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use our services for any unlawful purpose</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Misrepresent your identity or affiliation with SocialSculp</li>
          <li>Interfere with the operation of our platform or services</li>
          <li>Share confidential campaign or client information without authorization</li>
        </ul>

        <h2>7. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, SocialSculp LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or services, even if advised of the possibility of such damages.</p>

        <h2>8. Disclaimer of Warranties</h2>
        <p>Our website and services are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied. SocialSculp does not warrant that our services will be uninterrupted, error-free, or free of viruses or other harmful components.</p>

        <h2>9. Third-Party Links</h2>
        <p>Our website may contain links to third-party websites. SocialSculp is not responsible for the content, privacy practices, or terms of those websites.</p>

        <h2>10. Governing Law</h2>
        <p>These Terms are governed by the laws of the State of Louisiana, without regard to its conflict of law principles. Any disputes shall be resolved in the courts of Louisiana.</p>

        <h2>11. Changes to Terms</h2>
        <p>SocialSculp reserves the right to modify these Terms at any time. Changes take effect upon posting to this page. Continued use of our services after changes constitutes acceptance.</p>

        <h2>12. Contact</h2>
        <p>For questions regarding these Terms, contact us at: <a href="mailto:business@socialsculp.io">business@socialsculp.io</a></p>

        <hr />
        <p className="footer-note">&copy; 2026 SocialSculp LLC. All rights reserved. Established 2024.</p>
      </div>
    </>
  )
}
