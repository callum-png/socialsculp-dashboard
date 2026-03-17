import { auth, clerkClient } from '@clerk/nextjs/server'
import Link from 'next/link'
import type { UserRole } from '@/types'

const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: '/admin',
  AGENT: '/agent',
  CREATOR: '/creator',
  BRAND: '/brand',
}

export default async function RootPage() {
  // If already signed in, redirect straight to their portal
  const { userId } = await auth()
  if (userId) {
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      const role = user.publicMetadata?.role as UserRole | undefined
      if (role && ROLE_HOME[role]) {
        const { redirect } = await import('next/navigation')
        redirect(ROLE_HOME[role])
      }
    } catch { /* fall through to landing */ }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue: #008cff;
          --blue-dim: #0055a0;
          --bg: #080808;
          --bg2: #0d0d0d;
          --border: #1a1a1a;
          --muted: #333333;
          --dim: #555555;
          --text: #ede8de;
          --text-muted: #6b6860;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'Syne', sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Grid background ── */
        .grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,140,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,140,255,0.03) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none;
          z-index: 0;
        }
        .grid-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,140,255,0.08) 0%, transparent 70%);
        }

        /* ── Nav ── */
        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 40px;
          border-bottom: 1px solid var(--border);
          background: rgba(8,8,8,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .nav-logo {
          display: flex;
          align-items: baseline;
          gap: 0;
          text-decoration: none;
        }
        .nav-logo-main {
          font-size: 18px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .nav-logo-dot { color: var(--blue); font-size: 18px; font-weight: 800; }

        .nav-right { display: flex; align-items: center; gap: 12px; }

        .nav-tag {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--dim);
          border: 1px solid var(--border);
          padding: 4px 10px;
        }

        .btn-sign-in {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--blue);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.15s;
        }
        .btn-sign-in:hover { background: #0070cc; }

        /* ── Hero ── */
        .hero {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 140px 40px 80px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.1s forwards;
        }
        .eyebrow-line { width: 32px; height: 1px; background: var(--blue); }
        .eyebrow-text {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--blue);
        }

        .hero-headline {
          font-size: clamp(52px, 8vw, 120px);
          font-weight: 800;
          line-height: 0.92;
          letter-spacing: -0.03em;
          color: var(--text);
          margin-bottom: 0;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.2s forwards;
        }
        .hero-headline em {
          font-style: normal;
          color: transparent;
          -webkit-text-stroke: 1px rgba(237,232,222,0.25);
        }
        .hero-headline .blue { color: var(--blue); -webkit-text-stroke: 0; }

        .hero-sub {
          margin-top: 40px;
          max-width: 520px;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.35s forwards;
        }
        .hero-sub p {
          font-family: 'Fraunces', serif;
          font-size: 18px;
          line-height: 1.6;
          color: var(--text-muted);
          font-style: italic;
        }

        .hero-cta {
          margin-top: 48px;
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.5s forwards;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          background: var(--blue);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.15s;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.1);
          opacity: 0;
          transition: opacity 0.15s;
        }
        .btn-primary:hover::after { opacity: 1; }
        .btn-primary svg { width: 14px; height: 14px; }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.15s;
        }
        .btn-secondary:hover { color: var(--text); }
        .btn-secondary svg { width: 12px; height: 12px; }

        /* ── Metrics ticker ── */
        .metrics {
          display: flex;
          align-items: center;
          gap: 0;
          margin-top: 80px;
          border-top: 1px solid var(--border);
          padding-top: 40px;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.7s forwards;
        }

        .metric {
          flex: 1;
          padding-right: 40px;
          border-right: 1px solid var(--border);
        }
        .metric:last-child { border-right: none; padding-right: 0; padding-left: 40px; }
        .metric:not(:first-child):not(:last-child) { padding: 0 40px; }
        .metric-value {
          font-size: clamp(28px, 3.5vw, 44px);
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.03em;
          line-height: 1;
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .metric-value sup { font-size: 50%; color: var(--blue); }
        .metric-label {
          margin-top: 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* ── Feature section ── */
        .features {
          position: relative;
          z-index: 1;
          max-width: 1400px;
          margin: 0 auto;
          padding: 120px 40px;
          border-top: 1px solid var(--border);
        }

        .section-label {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 64px;
        }
        .section-label-line { width: 24px; height: 1px; background: var(--blue); }
        .section-label-text {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--blue);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--border);
        }

        .feature-card {
          background: var(--bg);
          padding: 40px;
          position: relative;
          overflow: hidden;
          transition: background 0.2s;
        }
        .feature-card:hover { background: var(--bg2); }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--blue);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .feature-card:hover::before { transform: scaleX(1); }

        .feature-num {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--muted);
          margin-bottom: 28px;
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          background: var(--bg2);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          color: var(--blue);
        }
        .feature-icon svg { width: 18px; height: 18px; }

        .feature-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.01em;
          margin-bottom: 12px;
        }

        .feature-desc {
          font-family: 'Fraunces', serif;
          font-size: 14px;
          line-height: 1.7;
          color: var(--text-muted);
          font-style: italic;
        }

        /* ── Roles section ── */
        .roles {
          position: relative;
          z-index: 1;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px 120px;
        }

        .roles-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: var(--border);
        }

        .role-card {
          background: var(--bg);
          padding: 32px;
          transition: background 0.2s;
          text-decoration: none;
        }
        .role-card:hover { background: var(--bg2); }

        .role-badge {
          display: inline-block;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 3px 8px;
          border: 1px solid;
          margin-bottom: 20px;
        }
        .role-badge.admin { color: var(--blue); border-color: #003366; background: #001a33; }
        .role-badge.agent { color: #34D399; border-color: #004d2e; background: #001a0e; }
        .role-badge.brand { color: #FFB547; border-color: #4d3200; background: #1f1200; }
        .role-badge.creator { color: #A78BFA; border-color: #2d1f55; background: #1a1033; }

        .role-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.02em;
          margin-bottom: 10px;
        }
        .role-desc {
          font-family: 'Fraunces', serif;
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-muted);
          font-style: italic;
        }

        /* ── CTA band ── */
        .cta-band {
          position: relative;
          z-index: 1;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: var(--bg2);
          overflow: hidden;
        }
        .cta-band-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 80px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }
        .cta-band::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(ellipse 50% 100% at 0% 50%, rgba(0,140,255,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .cta-headline {
          font-size: clamp(28px, 3.5vw, 48px);
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.03em;
          line-height: 1.05;
        }
        .cta-headline span { color: var(--blue); }

        .cta-right { flex-shrink: 0; }

        /* ── Footer ── */
        footer {
          position: relative;
          z-index: 1;
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .footer-logo {
          font-size: 13px;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: -0.01em;
        }
        .footer-logo span { color: var(--blue); }

        .footer-copy {
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.05em;
        }

        /* ── Scan line ── */
        .scanline {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, var(--blue) 50%, transparent 100%);
          opacity: 0.4;
          animation: scan 4s linear infinite;
          pointer-events: none;
          z-index: 999;
        }

        /* ── Ticker tape ── */
        .ticker {
          position: relative;
          z-index: 1;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: var(--bg2);
          overflow: hidden;
          height: 36px;
          display: flex;
          align-items: center;
        }
        .ticker-inner {
          display: flex;
          gap: 0;
          animation: ticker 25s linear infinite;
          white-space: nowrap;
        }
        .ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 0 32px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
          border-right: 1px solid var(--border);
        }
        .ticker-item .dot { width: 4px; height: 4px; background: var(--blue); display: inline-block; }
        .ticker-item.active { color: var(--blue); }

        /* ── Status bar ── */
        .status-bar {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34D399;
          animation: pulse 2s ease infinite;
        }
        .status-text {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #34D399;
        }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scan {
          0% { top: -2px; }
          100% { top: 100%; }
        }

        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          nav { padding: 16px 20px; }
          .nav-tag { display: none; }
          .hero { padding: 120px 20px 60px; }
          .hero-headline { font-size: clamp(40px, 12vw, 80px); }
          .metrics { flex-wrap: wrap; gap: 24px; }
          .metric { flex: 0 0 calc(50% - 12px); border-right: none; padding: 0; }
          .features { padding: 60px 20px; }
          .features-grid { grid-template-columns: 1fr; }
          .roles { padding: 0 20px 60px; }
          .roles-grid { grid-template-columns: repeat(2, 1fr); }
          .cta-band-inner { flex-direction: column; text-align: center; padding: 60px 20px; }
          footer { padding: 24px 20px; flex-direction: column; text-align: center; }
        }

        @media (max-width: 600px) {
          .hero-headline em { display: none; }
          .roles-grid { grid-template-columns: 1fr; }
          .metrics { flex-direction: column; }
          .metric { flex: 1 1 auto; width: 100%; }
        }
      `}</style>

      <div className="grid-bg" />
      <div className="scanline" />

      {/* Nav */}
      <nav>
        <a href="/" className="nav-logo">
          <span className="nav-logo-main">SocialSculp</span>
          <span className="nav-logo-dot">.</span>
        </a>
        <div className="nav-right">
          <div className="status-bar">
            <div className="status-dot" />
            <span className="status-text">All Systems Live</span>
          </div>
          <span className="nav-tag">Campaign Intelligence</span>
          <Link href="/sign-in" className="btn-sign-in">
            Sign In
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </nav>

      {/* Ticker */}
      <div className="ticker" style={{ marginTop: 61 }}>
        <div className="ticker-inner">
          {[
            { label: 'Campaigns', val: 'Active', active: true },
            { label: 'Creator Network', val: 'Global' },
            { label: 'Deal Pipeline', val: 'Live' },
            { label: 'Analytics', val: 'Real-time', active: true },
            { label: 'CRM', val: 'Multi-role' },
            { label: 'Brand Portal', val: 'Access' },
            { label: 'Agent CRM', val: 'Isolated' },
            { label: 'CSV Import', val: 'Enabled' },
            { label: 'Campaigns', val: 'Active', active: true },
            { label: 'Creator Network', val: 'Global' },
            { label: 'Deal Pipeline', val: 'Live' },
            { label: 'Analytics', val: 'Real-time', active: true },
            { label: 'CRM', val: 'Multi-role' },
            { label: 'Brand Portal', val: 'Access' },
            { label: 'Agent CRM', val: 'Isolated' },
            { label: 'CSV Import', val: 'Enabled' },
          ].map((item, i) => (
            <div key={i} className={`ticker-item${item.active ? ' active' : ''}`}>
              <span className="dot" />
              {item.label} — {item.val}
            </div>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="eyebrow-line" />
          <span className="eyebrow-text">Influencer Marketing Intelligence</span>
        </div>

        <h1 className="hero-headline">
          Campaign<br />
          <em>Intelligence</em><br />
          <span className="blue">Platform.</span>
        </h1>

        <div className="hero-sub">
          <p>
            End-to-end campaign management for brands, creators, and the agents who connect them. Built for scale. Designed for clarity.
          </p>
        </div>

        <div className="hero-cta">
          <Link href="/sign-in" className="btn-primary">
            Access Platform
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <a href="#portals" className="btn-secondary">
            View Portals
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </a>
        </div>

        <div className="metrics">
          <div className="metric">
            <div className="metric-value">4<sup>×</sup></div>
            <div className="metric-label">Avg Campaign ROAS</div>
          </div>
          <div className="metric">
            <div className="metric-value">12M<sup>+</sup></div>
            <div className="metric-label">Creator Reach Tracked</div>
          </div>
          <div className="metric">
            <div className="metric-value">6</div>
            <div className="metric-label">Pipeline Stages</div>
          </div>
          <div className="metric">
            <div className="metric-value">4</div>
            <div className="metric-label">Role-Based Portals</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="section-label">
          <span className="section-label-line" />
          <span className="section-label-text">Platform Capabilities</span>
        </div>

        <div className="features-grid">
          {[
            {
              num: '01',
              title: 'Campaign Management',
              desc: 'Full campaign lifecycle from brief to close. Track status, budgets, creators, and performance in one view.',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z"/>
                </svg>
              ),
            },
            {
              num: '02',
              title: 'Deal Pipeline',
              desc: 'Kanban-style deal tracking across 6 stages. Move deals from appointment set through to closed won.',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="3" width="5" height="18" rx="1"/><rect x="9.5" y="3" width="5" height="14" rx="1"/><rect x="17" y="3" width="5" height="10" rx="1"/>
                </svg>
              ),
            },
            {
              num: '03',
              title: 'Creator & Brand Roster',
              desc: 'Manage your full network of creators and brand partners. Stats, niches, contact info — all structured.',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              ),
            },
            {
              num: '04',
              title: 'Master CRM',
              desc: 'Admin-level visibility across all agent activity. Filter by agent, export leads as CSV, track every contact.',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              ),
            },
            {
              num: '05',
              title: 'Analytics Dashboard',
              desc: 'ROAS trends, reach breakdowns, platform splits, engagement rates. Real data or seeded mock views.',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              ),
            },
            {
              num: '06',
              title: 'CSV Import / Export',
              desc: 'Import lead lists from spreadsheets with flexible header mapping. Export filtered data instantly.',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              ),
            },
          ].map((f) => (
            <div key={f.num} className="feature-card">
              <div className="feature-num">{f.num}</div>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Portals */}
      <section className="roles" id="portals">
        <div className="section-label">
          <span className="section-label-line" />
          <span className="section-label-text">Role-Based Access</span>
        </div>

        <div className="roles-grid">
          {[
            {
              badge: 'admin',
              label: 'Admin',
              title: 'Operations Hub',
              desc: 'Full platform access. Manage campaigns, deals, creators, brands, and all agent activity from one master view.',
            },
            {
              badge: 'agent',
              label: 'Agent',
              title: 'Procurement CRM',
              desc: 'Dedicated pipeline for procurement agents. Log leads, move deals, import contacts. Feeds directly into master CRM.',
            },
            {
              badge: 'brand',
              label: 'Brand',
              title: 'Brand Portal',
              desc: 'Campaign visibility and reporting for brand partners. See active campaigns, creator performance, and results.',
            },
            {
              badge: 'creator',
              label: 'Creator',
              title: 'Creator Portal',
              desc: 'Manage your campaigns, review deals, and track analytics. Everything you need to run your creator business.',
            },
          ].map((r) => (
            <div key={r.badge} className="role-card">
              <div className={`role-badge ${r.badge}`}>{r.label}</div>
              <div className="role-title">{r.title}</div>
              <div className="role-desc">{r.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Band */}
      <div className="cta-band">
        <div className="cta-band-inner">
          <div className="cta-headline">
            Ready to run your<br />
            <span>campaigns smarter?</span>
          </div>
          <div className="cta-right">
            <Link href="/sign-in" className="btn-primary" style={{ padding: '18px 40px', fontSize: '13px' }}>
              Sign In to Platform
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer>
        <div className="footer-logo">
          SocialSculp<span>.</span>
          <span style={{ marginLeft: 12, fontSize: 10, fontWeight: 400, letterSpacing: '0.1em', color: 'var(--muted)' }}>
            © {new Date().getFullYear()} S23 Operations Ltd
          </span>
        </div>
        <div className="footer-copy">Campaign Intelligence Platform</div>
      </footer>
    </>
  )
}
