import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PendingPage() {
  const { userId } = await auth()

  // If already approved and has a role, redirect them to the right dashboard
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
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Figtree:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue: #008cff;
          --bg: #060606;
          --bg2: #0b0b0b;
          --border: #1a1a1a;
          --text: #edeae0;
          --text-muted-foreground: #55524a;
        }

        body {
          font-family: 'Figtree', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .page {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 40px 24px;
          max-width: 480px;
          width: 100%;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 2px;
          margin-bottom: 48px;
        }

        .logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.02em;
        }

        .logo-dot {
          color: var(--blue);
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 700;
        }

        .icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: #0f0f0f;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
        }

        .icon-wrap::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(0,140,255,0.12) 0%, transparent 70%);
        }

        .icon-wrap svg {
          position: relative;
          z-index: 1;
        }

        .pulse-ring {
          position: absolute;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 1px solid rgba(0,140,255,0.3);
          animation: pulse-out 2s ease-out infinite;
        }

        .pulse-ring:nth-child(2) { animation-delay: 0.7s; }
        .pulse-ring:nth-child(3) { animation-delay: 1.4s; }

        @keyframes pulse-out {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.4); opacity: 0; }
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(0,140,255,0.08);
          border: 1px solid rgba(0,140,255,0.2);
          border-radius: 100px;
          padding: 4px 12px;
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--blue);
          margin-bottom: 24px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--blue);
          animation: blink 1.4s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(24px, 4vw, 30px);
          font-weight: 700;
          color: var(--text);
          margin-bottom: 16px;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .sub {
          font-size: 15px;
          color: var(--text-muted-foreground);
          line-height: 1.6;
          margin-bottom: 40px;
          max-width: 380px;
        }

        .info-box {
          width: 100%;
          background: #0a0a0a;
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 20px 24px;
          margin-bottom: 32px;
          text-align: left;
        }

        .info-box-label {
          font-family: 'Syne', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted-foreground);
          margin-bottom: 12px;
        }

        .info-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
        }

        .info-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .info-row:first-of-type {
          padding-top: 0;
        }

        .check-icon {
          flex-shrink: 0;
          margin-top: 2px;
          color: var(--blue);
        }

        .info-row-text {
          font-size: 13px;
          color: #6b6860;
          line-height: 1.5;
        }

        .info-row-text strong {
          color: var(--text);
          font-weight: 500;
        }

        .sign-out-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted-foreground);
          text-decoration: none;
          padding: 10px 20px;
          border: 1px solid var(--border);
          border-radius: 2px;
          transition: color 0.2s, border-color 0.2s;
        }

        .sign-out-btn:hover {
          color: var(--text);
          border-color: #333;
        }

        .btn-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .home-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--blue);
          text-decoration: none;
          padding: 10px 20px;
          border: 1px solid rgba(0,140,255,0.3);
          border-radius: 2px;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }

        .home-btn:hover {
          background: rgba(0,140,255,0.08);
          border-color: rgba(0,140,255,0.5);
        }
      `}</style>

      <div className="page">
        <div className="logo">
          <span className="logo-text">SocialSculp</span>
          <span className="logo-dot">.</span>
        </div>

        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <div className="pulse-ring" />
          <div className="pulse-ring" />
          <div className="icon-wrap">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="#008cff" opacity="0.9"/>
            </svg>
          </div>
        </div>

        <div className="status-badge">
          <span className="status-dot" />
          Under Review
        </div>

        <h1>Access Request Received</h1>
        <p className="sub">
          Your account is pending approval. Our team will review your request and grant access within 24–48 hours.
        </p>

        <div className="info-box">
          <div className="info-box-label">What happens next</div>
          <div className="info-row">
            <svg className="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            <span className="info-row-text">
              <strong>Request logged</strong> — your signup is confirmed in our system
            </span>
          </div>
          <div className="info-row">
            <svg className="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
            </svg>
            <span className="info-row-text">
              <strong>Admin review</strong> — a SocialSculp team member will approve your account
            </span>
          </div>
          <div className="info-row">
            <svg className="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <span className="info-row-text">
              <strong>You'll be notified</strong> — once approved, sign back in to access the platform
            </span>
          </div>
        </div>

        <div className="btn-row">
          <a href="https://www.socialsculp.io" className="home-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            Back to Home
          </a>
          <Link href="/sign-in" className="sign-out-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
            Back to Sign In
          </Link>
        </div>
      </div>
    </>
  )
}
