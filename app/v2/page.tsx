import './landing-v2.css'
import { V2Loader, V2RevealObserver, V2Counter } from './V2Client'

const caseStudies = [
  {
    num: '01',
    title: 'Cal AI — 400M+ Impressions',
    tags: ['Creator Seeding', 'TikTok', 'Instagram'],
    metric: '400M+',
    metricLbl: 'Impressions',
  },
  {
    num: '02',
    title: 'GoWish — Viral Launch Campaign',
    tags: ['Narrative Engineering', 'Multi-Platform'],
    metric: '120+',
    metricLbl: 'Creators Seeded',
  },
  {
    num: '03',
    title: 'StealthGPT — Organic Growth Drive',
    tags: ['Creator Strategy', 'Short-Form Video'],
    metric: '$2',
    metricLbl: 'Blended CPM',
  },
  {
    num: '04',
    title: 'Alpha Lion — Sports Nutrition Seeding',
    tags: ['Fitness Vertical', 'UGC Strategy'],
    metric: '3.7M',
    metricLbl: 'Views Delivered',
  },
]

const services = [
  {
    num: '01',
    name: 'Creator Seeding',
    desc: 'We engineer seeding campaigns that place your product in front of the right audience through an authentic creator voice. Data-driven, psychologically informed, virally engineered.',
    tags: ['TikTok', 'Instagram', 'YouTube'],
  },
  {
    num: '02',
    name: 'Narrative Engineering',
    desc: 'We don\'t write ads — we build narratives. Every campaign has a story architecture that guides how audiences discover, relate to, and share your brand.',
    tags: ['Scripting', 'Hooks', 'Storyboarding'],
  },
  {
    num: '03',
    name: 'Media Buying',
    desc: 'Precision media buying across TikTok, Meta, and Snap. We optimize for blended CPM below $2 and measurable ROAS, not vanity metrics.',
    tags: ['TikTok Ads', 'Meta', 'Snap'],
  },
  {
    num: '04',
    name: 'Creator Management',
    desc: 'Full-service talent coordination across our 50+ creator network — briefing, contract, content approval, and performance tracking in one pipeline.',
    tags: ['Talent', 'Contracts', 'Pipeline'],
  },
  {
    num: '05',
    name: 'Brand Strategy',
    desc: 'From positioning to platform-specific playbooks. We help brands understand where they sit in culture, and how to move it.',
    tags: ['Positioning', 'Playbooks', 'Platform'],
  },
  {
    num: '06',
    name: 'Campaign Analytics',
    desc: 'Real-time dashboards, creator performance scoring, and transparent reporting. Know exactly where every dollar went and what it earned.',
    tags: ['Dashboard', 'Reporting', 'ROAS'],
  },
]

const brands = [
  'Cal AI', 'StealthGPT', 'Quizard', 'Alpha Lion', 'Bucked Up',
  'PrizePicks', 'Sweatcoin', 'Fitbod', 'GoWish', 'BKFC',
  'Block Blast', '1st Phorm', 'Based Body Works', 'Plutus Gaming',
]

export default function V2Page() {
  return (
    <div className="v2-root">

      {/* Loader */}
      <V2Loader />
      <V2RevealObserver />

      {/* ── Navigation ── */}
      <nav className="v2-nav">
        <a href="/v2" className="v2-nav-logo">
          Social<em>Sculp</em>
        </a>
        <ul className="v2-nav-links">
          <li><a href="#work">Work</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <a href="/sign-in" className="v2-nav-cta">Sign In</a>
      </nav>

      {/* ── Hero ── */}
      <section className="v2-hero" id="hero">
        <div className="v2-hero-overlay" aria-hidden="true" />
        <div className="v2-hero-vignette" aria-hidden="true" />
        <div className="v2-hero-tag">
          Social Media Sculptors — Est. 2024
        </div>

        <h1 className="v2-hero-headline">
          We Engineer<br />
          <span className="outline">Narratives</span><br />
          at <span className="blue">Scale.</span>
        </h1>

        <div className="v2-hero-sub-row">
          <p className="v2-hero-desc">
            SocialSculp is a data-driven creator seeding agency. We turn consumer psychology into viral reach through strategic influencer marketing — elevated.
          </p>
          <div className="v2-hero-actions">
            <a
              href="https://calendar.app.google/4wcPnasps28aBHTJ9"
              target="_blank"
              rel="noopener noreferrer"
              className="v2-btn-primary"
            >
              Book a Call
            </a>
            <a href="#work" className="v2-btn-ghost">
              View Work
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="v2-hero-scroll">
          <div className="v2-scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="v2-stats-strip v2-reveal">
        <div className="v2-stat">
          <div className="v2-stat-num">
            <V2Counter target={1.9} suffix="B+" />
          </div>
          <div className="v2-stat-label">All-Time Views Delivered</div>
        </div>
        <div className="v2-stat">
          <div className="v2-stat-num">
            <V2Counter target={50} suffix="+" />
          </div>
          <div className="v2-stat-label">Active Creators</div>
        </div>
        <div className="v2-stat">
          <div className="v2-stat-num">
            <V2Counter target={20} suffix="+" />
          </div>
          <div className="v2-stat-label">Brands Served</div>
        </div>
        <div className="v2-stat">
          <div className="v2-stat-num">
            $<V2Counter target={2} />
          </div>
          <div className="v2-stat-label">Blended CPM</div>
        </div>
      </div>

      {/* ── Brand marquee ── */}
      <div className="v2-marquee-wrap">
        <div className="v2-marquee-track">
          {[...brands, ...brands].map((b, i) => (
            <span key={i} className="v2-marquee-item">
              {b}
              {i < brands.length * 2 - 1 && (
                <span className="v2-marquee-sep"> ◆ </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* ── Work / Case Studies ── */}
      <section className="v2-work" id="work">
        <div className="v2-section-header v2-reveal">
          <div>
            <span className="v2-eyebrow">Selected Work</span>
            <h2 className="v2-section-title">
              Results That<br />Move Culture.
            </h2>
          </div>
          <a href="https://calendar.app.google/4wcPnasps28aBHTJ9" target="_blank" rel="noopener noreferrer" className="v2-section-link">
            Work With Us
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
            </svg>
          </a>
        </div>

        {caseStudies.map((c, i) => (
          <div className={`v2-case-row v2-reveal d${(i % 3) + 1}`} key={i}>
            <div className="v2-case-num">{c.num}</div>
            <div className="v2-case-body">
              <div className="v2-case-title">{c.title}</div>
              <div className="v2-case-tags">
                {c.tags.map((t) => (
                  <span className="v2-case-tag" key={t}>{t}</span>
                ))}
              </div>
            </div>
            <div className="v2-case-metric">
              <div className="v2-case-metric-val">{c.metric}</div>
              <div className="v2-case-metric-lbl">{c.metricLbl}</div>
            </div>
            <div className="v2-case-arrow">↗</div>
          </div>
        ))}
      </section>

      {/* ── Services ── */}
      <section className="v2-services" id="services">
        <div className="v2-section-header v2-reveal" style={{ marginBottom: '48px' }}>
          <div>
            <span className="v2-eyebrow">What We Offer</span>
            <h2 className="v2-section-title">
              Full-Stack<br />Creator Intelligence.
            </h2>
          </div>
          <a href="#contact" className="v2-section-link">
            All Services
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
            </svg>
          </a>
        </div>

        <div className="v2-svc-grid">
          {services.map((s, i) => (
            <div className={`v2-svc-card v2-reveal d${(i % 3) + 1}`} key={i}>
              <div className="v2-svc-num">{s.num}</div>
              <div className="v2-svc-name">{s.name}</div>
              <div className="v2-svc-desc">{s.desc}</div>
              <div className="v2-svc-tags">
                {s.tags.map((t) => (
                  <span className="v2-svc-tag" key={t}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Metrics bento ── */}
      <div className="v2-metrics v2-reveal">
        <div className="v2-metrics-label">Platform Performance</div>
        <div className="v2-metrics-row">
          <div className="v2-metric-cell featured">
            <div className="v2-metric-val">
              <V2Counter target={1.9} suffix="B" /><span className="v2-metric-accent">+</span>
            </div>
            <div className="v2-metric-lbl">All-Time Views</div>
            <div className="v2-metric-sub">Across TikTok, Instagram Reels, YouTube Shorts, and Snapchat Spotlight.</div>
          </div>
          <div className="v2-metric-cell">
            <div className="v2-metric-val">$<V2Counter target={2} /></div>
            <div className="v2-metric-lbl">Blended CPM</div>
            <div className="v2-metric-sub">Consistently beating paid media CPMs.</div>
          </div>
          <div className="v2-metric-cell">
            <div className="v2-metric-val"><V2Counter target={50} suffix="+" /></div>
            <div className="v2-metric-lbl">Creators</div>
            <div className="v2-metric-sub">Vetted, contracted, briefed.</div>
          </div>
          <div className="v2-metric-cell">
            <div className="v2-metric-val"><V2Counter target={20} suffix="+" /></div>
            <div className="v2-metric-lbl">Brands Served</div>
            <div className="v2-metric-sub">From YC startups to category leaders.</div>
          </div>
        </div>
      </div>

      {/* ── About ── */}
      <section className="v2-about" id="about">
        <div className="v2-about-text v2-reveal">
          <span className="v2-eyebrow">About SocialSculp</span>
          <p className="v2-about-copy">
            We don&apos;t run campaigns —<br />
            we <em>engineer</em> movements.
          </p>
          <p className="v2-about-body">
            SocialSculp was built by marketers who understood that the future of growth wasn&apos;t in ads — it was in authentic creator voices reaching the right audience at precisely the right moment. Every campaign we run is rooted in data, driven by psychology, and executed with creative precision.
          </p>
          <div style={{ marginTop: '36px' }}>
            <a
              href="https://calendar.app.google/4wcPnasps28aBHTJ9"
              target="_blank"
              rel="noopener noreferrer"
              className="v2-btn-primary"
            >
              Talk to the team
            </a>
          </div>
        </div>

        <div className="v2-about-visual v2-reveal d2">
          <div className="v2-about-bg" />
          <div className="v2-about-grid" />
          <div className="v2-about-stat-cards">
            <div className="v2-about-stat-card">
              <div className="v2-about-stat-card-num">
                1.9<span className="asc-accent">B</span>
              </div>
              <div className="v2-about-stat-card-info">
                <div className="v2-about-stat-card-lbl">Total Views</div>
                <div className="v2-about-stat-card-change">↑ All-Time</div>
              </div>
            </div>
            <div className="v2-about-stat-card">
              <div className="v2-about-stat-card-num">
                50<span className="asc-accent">+</span>
              </div>
              <div className="v2-about-stat-card-info">
                <div className="v2-about-stat-card-lbl">Live Creators</div>
                <div className="v2-about-stat-card-change">↑ Active Network</div>
              </div>
            </div>
            <div className="v2-about-chart">
              <div className="v2-about-chart-label">Campaign Views — Last 12 Months</div>
              <svg viewBox="0 0 300 60" preserveAspectRatio="none" fill="none">
                <defs>
                  <linearGradient id="v2cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#008CFF" stopOpacity="0.35"/>
                    <stop offset="100%" stopColor="#008CFF" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path
                  d="M0 55 C30 52 50 48 80 42 S120 32 150 24 S210 12 250 8 S280 5 300 3"
                  stroke="#008CFF" strokeWidth="1.5" strokeLinecap="round"
                />
                <path
                  d="M0 55 C30 52 50 48 80 42 S120 32 150 24 S210 12 250 8 S280 5 300 3 V60 H0Z"
                  fill="url(#v2cg)"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="v2-cta" id="contact">
        <div className="v2-cta-eyebrow">Ready to grow?</div>
        <h2 className="v2-cta-headline">
          Let&apos;s Build<br />
          <span className="v2-cta-outline">Something</span><br />
          Unforgettable.
        </h2>
        <div className="v2-cta-actions">
          <a
            href="https://calendar.app.google/4wcPnasps28aBHTJ9"
            target="_blank"
            rel="noopener noreferrer"
            className="v2-cta-btn primary"
          >
            Book a Strategy Call
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
            </svg>
          </a>
          <a href="/sign-up" className="v2-cta-btn outline">
            Create Account
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="v2-footer">
        <a href="/v2" className="v2-footer-logo">
          Social<em>Sculp</em>
        </a>
        <ul className="v2-footer-links">
          <li><a href="#work">Work</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="/sign-in">Sign In</a></li>
          <li><a href="/sign-up">Get Started</a></li>
        </ul>
        <div className="v2-footer-legal">
          © 2024 S23 Operations Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
