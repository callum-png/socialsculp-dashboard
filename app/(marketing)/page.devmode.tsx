import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function RootPage() {
  // Redirect signed-in users to their dashboard immediately
  const { userId } = await auth()
  if (userId) {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const role = user.publicMetadata?.role as string | undefined
    const status = user.publicMetadata?.status as string | undefined

    if (role && status !== 'PENDING') {
      switch (role) {
        case 'ADMIN': redirect('/admin')
        case 'AGENT': redirect('/agent')
        case 'CREATOR': redirect('/creator')
        case 'BRAND': redirect('/brand')
      }
    } else {
      redirect('/pending')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Figtree:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }

        :root {
          --blue: #008cff;
          --bg: #060606;
          --border: #161616;
          --border2: #1e1e1e;
          --text: #edeae0;
          --text-muted-foreground: #3a3830;
          --text-dim: #6b6860;
        }

        body {
          font-family: 'Figtree', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
        }

        /* Noise texture overlay */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.025;
          pointer-events: none;
          z-index: 0;
        }

        /* Subtle radial glow */
        body::after {
          content: '';
          position: fixed;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(0,140,255,0.06) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        nav {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 40px;
          border-bottom: 1px solid var(--border);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 1px;
        }

        .logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.02em;
        }

        .logo-dot {
          color: var(--blue);
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
        }

        .nav-tag {
          font-family: 'Syne', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted-foreground);
          border: 1px solid var(--border2);
          padding: 4px 10px;
          border-radius: 2px;
        }

        main {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          text-align: center;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--blue);
          margin-bottom: 32px;
          padding: 5px 14px;
          border: 1px solid rgba(0,140,255,0.2);
          border-radius: 100px;
          background: rgba(0,140,255,0.05);
        }

        .eyebrow-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--blue);
          animation: blink 1.6s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.15; }
        }

        h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(36px, 6vw, 64px);
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.03em;
          line-height: 1.05;
          max-width: 680px;
          margin-bottom: 24px;
        }

        h1 em {
          font-style: normal;
          color: var(--blue);
        }

        .sub {
          font-size: clamp(15px, 2vw, 17px);
          color: var(--text-dim);
          line-height: 1.7;
          max-width: 440px;
          margin-bottom: 48px;
        }

        .cta-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #060606;
          background: var(--blue);
          padding: 12px 28px;
          text-decoration: none;
          border-radius: 2px;
          transition: background 0.2s, transform 0.15s;
        }

        .btn-primary:hover {
          background: #0077dd;
          transform: translateY(-1px);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-dim);
          text-decoration: none;
          padding: 12px 24px;
          border: 1px solid var(--border2);
          border-radius: 2px;
          transition: color 0.2s, border-color 0.2s;
        }

        .btn-secondary:hover {
          color: var(--text);
          border-color: #333;
        }

        .divider {
          width: 1px;
          height: 60px;
          background: linear-gradient(to bottom, transparent, var(--border2), transparent);
          margin: 60px auto;
        }

        .stat-row {
          display: flex;
          align-items: center;
          gap: 40px;
          flex-wrap: wrap;
          justify-content: center;
          opacity: 0.5;
        }

        .stat {
          text-align: center;
        }

        .stat-val {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.02em;
        }

        .stat-label {
          font-size: 11px;
          color: var(--text-muted-foreground);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 4px;
        }

        .stat-sep {
          width: 1px;
          height: 36px;
          background: var(--border2);
        }

        footer {
          position: relative;
          z-index: 1;
          padding: 20px 40px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .footer-copy {
          font-size: 11px;
          color: var(--text-muted-foreground);
          letter-spacing: 0.05em;
        }

        .footer-location {
          font-size: 11px;
          color: var(--text-muted-foreground);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        @media (max-width: 600px) {
          nav { padding: 20px 24px; }
          footer { flex-direction: column; gap: 8px; text-align: center; }
          .stat-sep { display: none; }
        }
      `}</style>

      <nav>
        <div className="logo">
          <span className="logo-text">SocialSculp</span>
          <span className="logo-dot">.</span>
        </div>
        <span className="nav-tag">Private Beta</span>
      </nav>

      <main>
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          Invite Only — Now in Development
        </div>

        <h1>
          The Platform for<br />
          <em>Serious</em> Creator Campaigns.
        </h1>

        <p className="sub">
          SocialSculp is building the intelligence layer for influencer marketing — campaign analytics, creator CRM, deal tracking, and performance media. Launching soon.
        </p>

        <div className="cta-row">
          <Link href="/sign-in" className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
            </svg>
            Sign In
          </Link>
          <Link href="/sign-up" className="btn-secondary">
            Request Access
          </Link>
        </div>

        <div className="divider" />

        <div className="stat-row">
          <div className="stat">
            <div className="stat-val">1.9B+</div>
            <div className="stat-label">Views Managed</div>
          </div>
          <div className="stat-sep" />
          <div className="stat">
            <div className="stat-val">50+</div>
            <div className="stat-label">Creators</div>
          </div>
          <div className="stat-sep" />
          <div className="stat">
            <div className="stat-val">20+</div>
            <div className="stat-label">Brand Partners</div>
          </div>
          <div className="stat-sep" />
          <div className="stat">
            <div className="stat-val">$2</div>
            <div className="stat-label">Blended CPM</div>
          </div>
        </div>
      </main>

      <footer>
        <span className="footer-copy">© 2026 SocialSculp. All rights reserved.</span>
        <span className="footer-location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{opacity:0.4}}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          Louisiana, USA
        </span>
      </footer>
    </>
  )
}
