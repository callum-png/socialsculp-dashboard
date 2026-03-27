'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useScrollAnimations } from './useScrollAnimations'
import { HeroCube } from './HeroCube'

// Shared canvas that all ScrollScene Views render into — prevents context limit
const SharedCanvas = dynamic(
  () => import('./SharedCanvas').then(m => ({ default: m.SharedCanvas })),
  { ssr: false }
)

// Dynamically import 3D components — no SSR
// IntroScene has an inline loading fallback so the counter shows instantly
const IntroScene = dynamic(
  () => import('./IntroScene').then(m => ({ default: m.IntroScene })),
  {
    ssr: false,
    loading: () => (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#040810' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', whiteSpace: 'nowrap' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2rem, 9vw, 7rem)', color: 'rgba(240,230,222,0.9)', lineHeight: 0.82, letterSpacing: '-0.04em' }}>000</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 16 }}>
            <div style={{ width: 28, height: 1, background: 'rgba(0,140,255,0.6)' }} />
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: 'rgba(0,140,255,0.75)' }}>CREATOR NETWORK — INITIALISING</div>
            <div style={{ width: 28, height: 1, background: 'rgba(0,140,255,0.6)' }} />
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.05)' }} />
      </div>
    )
  }
)
const ScrollScene = dynamic(
  () => import('./ScrollScene').then(m => ({ default: m.ScrollScene })),
  { ssr: false }
)

// ── Floating creator card (glassmorphism overlay on hero) ───────
function FloatingCreatorCard({ handle, platform, views, delay, style }: {
  handle: string; platform: 'tiktok' | 'instagram'; views: string; delay: number;
  style?: React.CSSProperties
}) {
  const platformColor = platform === 'tiktok' ? '#00f2ea' : '#e1306c'
  const platformLabel = platform === 'tiktok' ? 'TikTok' : 'Instagram'
  return (
    <div style={{
      position: 'absolute', zIndex: 3, pointerEvents: 'none',
      width: 210,
      background: 'rgba(4,12,28,0.78)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 14,
      padding: '14px 18px',
      animation: `creatorCardFloat 6s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: `linear-gradient(135deg, ${platformColor}33, rgba(0,140,255,0.3))`,
          border: `1.5px solid ${platformColor}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, color: platformColor, fontWeight: 700, flexShrink: 0,
        }}>{handle[0].toUpperCase()}</div>
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>{handle}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3, background: `${platformColor}1a`, borderRadius: 4, padding: '1px 6px' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: platformColor }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', letterSpacing: '0.06em', color: platformColor }}>{platformLabel}</span>
          </div>
        </div>
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: '1.6rem', fontWeight: 300, color: '#F0E6DE', lineHeight: 1, letterSpacing: '-0.02em' }}>{views}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Total Views</span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', color: '#22c55e', fontWeight: 600 }}>↑ Live</span>
      </div>
    </div>
  )
}

type GeoType = 'seeding' | 'narrative' | 'media' | 'mgmt' | 'strategy' | 'analytics'

interface CaseStudyHighlight { label: string; value: string }
interface CaseStudy {
  num: string
  title: string
  logo?: string
  tags: string[]
  metric: string
  metricLbl: string
  campaignType?: string
  description?: string
  highlights?: CaseStudyHighlight[]
}
interface Service { num: string; name: string; desc: string; tags: string[]; geo: GeoType }

function AnimatedCounter({ target, suffix = '', isFloat = false }: { target: number; suffix?: string; isFloat?: boolean }) {
  return (
    <span data-count={target} data-suffix={suffix} data-float={isFloat ? 'true' : undefined}>
      {isFloat ? target.toFixed(1) : Math.round(target)}{suffix}
    </span>
  )
}

function ServiceCard({ svc }: { svc: Service }) {
  return (
    <div className="v2-svc-card">
      <div className="v2-svc-3d" aria-hidden="true">
        <ScrollScene type={svc.geo} />
      </div>
      <div className="v2-svc-num">{svc.num}</div>
      <div className="v2-svc-name">{svc.name}</div>
      <div className="v2-svc-desc">{svc.desc}</div>
      <div className="v2-svc-tags">
        {svc.tags.map(t => <span className="v2-svc-tag" key={t}>{t}</span>)}
      </div>
    </div>
  )
}

function BrandLogo({ domain, title, size = 32 }: { domain?: string; title: string; size?: number }) {
  const [err, setErr] = useState(false)
  const letterAvatar = (
    <div style={{
      width: size, height: size, borderRadius: 6,
      background: 'linear-gradient(135deg, rgba(0,140,255,0.25), rgba(0,80,200,0.15))',
      border: '1px solid rgba(0,140,255,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
      fontSize: size * 0.38, color: 'rgba(0,140,255,0.9)',
      flexShrink: 0,
    }}>
      {title[0].toUpperCase()}
    </div>
  )
  if (!domain || err) return letterAvatar
  // Google favicon API — free, reliable, no CORS issues
  const src = `https://www.google.com/s2/favicons?domain=${domain}&sz=${size >= 48 ? 128 : 64}`
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      width={size}
      height={size}
      onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: 6, objectFit: 'contain', background: 'rgba(255,255,255,0.08)', padding: 4, flexShrink: 0 }}
    />
  )
}

function CaseStudyModal({ c, onClose }: { c: CaseStudy; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div className="v2-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="v2-modal-panel" onClick={e => e.stopPropagation()}>
        <button className="v2-modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="v2-modal-header">
          <BrandLogo domain={c.logo} title={c.title} size={52} />
          <div>
            <div className="v2-modal-eyebrow">{c.campaignType || c.tags[0]}</div>
            <h3 className="v2-modal-title">{c.title}</h3>
          </div>
        </div>

        {c.description && (
          <p className="v2-modal-desc">{c.description}</p>
        )}

        {c.highlights && c.highlights.length > 0 && (
          <div className="v2-modal-stats">
            {c.highlights.map((h, i) => (
              <div className="v2-modal-stat" key={i}>
                <div className="v2-modal-stat-val">{h.value}</div>
                <div className="v2-modal-stat-lbl">{h.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="v2-modal-tags">
          {c.tags.map(t => <span className="v2-case-tag" key={t}>{t}</span>)}
        </div>

        <a
          href="https://calendar.app.google/4wcPnasps28aBHTJ9"
          target="_blank"
          rel="noopener noreferrer"
          className="v2-modal-cta"
        >
          Start a Similar Campaign →
        </a>
      </div>
    </div>
  )
}

export function V2PageWrapper({ caseStudies, services, brands }: { caseStudies: CaseStudy[]; services: Service[]; brands: string[] }) {
  const [introComplete, setIntroComplete] = useState(false)
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null)

  useScrollAnimations()

  // Always start at top of page on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // ?skip=1 in URL bypasses the intro instantly (useful for development)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('skip')) {
      setIntroComplete(true)
    }
  }, [])

  const handleIntroComplete = () => {
    setIntroComplete(true)
  }

  return (
    <>
      {!introComplete && <IntroScene onComplete={handleIntroComplete} />}

      <div className="v2-root" style={{ opacity: introComplete ? 1 : 0, transition: 'opacity 0.8s ease' }}>

        {/* ── Nav ── */}
        <nav className="v2-nav">
          <a href="/v2" className="v2-nav-logo">Social<em>Sculp</em></a>
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
          {/* CSS 3D rotating geometric form */}
          <HeroCube />

          <div className="v2-hero-overlay" aria-hidden="true" />
          <div className="v2-hero-center">
            <div className="v2-hero-headline-wrap">
              <h1 className="v2-hero-headline">We Engineer<br /><span className="v2-gradient-text">Narratives</span><br />at Scale.</h1>
            </div>
            <p className="v2-hero-desc">A data-driven creator seeding agency. 1.9B+ views across TikTok, Instagram, YouTube &amp; Snapchat.</p>
            <div className="v2-hero-actions">
              <a href="https://calendar.app.google/4wcPnasps28aBHTJ9" target="_blank" rel="noopener noreferrer" className="v2-btn-primary">Book a Call</a>
              <a href="#work" className="v2-btn-ghost">View Work
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
              </a>
            </div>
          </div>
          <div className="v2-hero-scroll"><div className="v2-scroll-line" /><span>Scroll</span></div>
        </section>

        {/* ── Stats strip ── */}
        <div className="v2-stats-strip">
          <div className="v2-stat"><div className="v2-stat-num"><AnimatedCounter target={50} suffix="+" /></div><div className="v2-stat-label">Active Creators</div></div>
          <div className="v2-stat"><div className="v2-stat-num"><AnimatedCounter target={20} suffix="+" /></div><div className="v2-stat-label">Brands Served</div></div>
          <div className="v2-stat"><div className="v2-stat-num">$<AnimatedCounter target={2} /></div><div className="v2-stat-label">Blended CPM</div></div>
        </div>

        {/* ── Marquee ── */}
        <div className="v2-marquee-wrap">
          <div className="v2-marquee-track">
            {[...brands, ...brands].map((b, i) => (
              <span key={i} className="v2-marquee-item">{b}{i < brands.length * 2 - 1 && <span className="v2-marquee-sep"> ◆ </span>}</span>
            ))}
          </div>
        </div>

        {/* ── Work ── */}
        <section className="v2-work" id="work">
          <div className="v2-section-header">
            <div>
              <span className="v2-eyebrow">Selected Work</span>
              <h2 className="v2-section-title v2-split-reveal">Results That Move Culture.</h2>
            </div>
            <a href="https://calendar.app.google/4wcPnasps28aBHTJ9" target="_blank" rel="noopener noreferrer" className="v2-section-link">
              Work With Us <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </a>
          </div>
          {caseStudies.map((c, i) => (
            <div className="v2-case-row" key={i} onClick={() => setSelectedCase(c)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setSelectedCase(c)}>
              <div className="v2-case-num">{c.num}</div>
              <div className="v2-case-logo-col"><BrandLogo domain={c.logo} title={c.title} size={36} /></div>
              <div className="v2-case-body">
                <div className="v2-case-title">{c.title}</div>
                <div className="v2-case-tags">{c.tags.map(t => <span className="v2-case-tag" key={t}>{t}</span>)}</div>
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
          <div className="v2-section-header" style={{ marginBottom: '48px' }}>
            <div>
              <span className="v2-eyebrow">What We Offer</span>
              <h2 className="v2-section-title v2-split-reveal">Full-Stack Creator Intelligence.</h2>
            </div>
          </div>
          <div className="v2-svc-grid">
            {services.map((s, i) => <ServiceCard key={i} svc={s} />)}
          </div>
        </section>

        {/* ── About ── */}
        <section className="v2-about" id="about">
          <div className="v2-about-text v2-reveal">
            <span className="v2-eyebrow">About SocialSculp</span>
            <p className="v2-about-copy">We don&apos;t run campaigns — we <em>engineer</em> movements.</p>
            <p className="v2-about-body">SocialSculp was built by marketers who understood that the future of growth isn&apos;t in ads — it&apos;s in authentic creator voices reaching the right audience at precisely the right moment.</p>
            <div style={{ marginTop: '36px' }}>
              <a href="https://calendar.app.google/4wcPnasps28aBHTJ9" target="_blank" rel="noopener noreferrer" className="v2-btn-primary">Talk to the team</a>
            </div>
          </div>
          <div className="v2-about-visual v2-reveal">
            <div className="v2-about-bg" /><div className="v2-about-grid" />
            <div className="v2-about-stat-cards">
              <div className="v2-about-stat-card"><div className="v2-about-stat-card-num">1.9<span className="asc-accent">B</span></div><div className="v2-about-stat-card-info"><div className="v2-about-stat-card-lbl">Total Views</div><div className="v2-about-stat-card-change">↑ All-Time</div></div></div>
              <div className="v2-about-stat-card"><div className="v2-about-stat-card-num">50<span className="asc-accent">+</span></div><div className="v2-about-stat-card-info"><div className="v2-about-stat-card-lbl">Live Creators</div><div className="v2-about-stat-card-change">↑ Active Network</div></div></div>
              <div className="v2-about-chart">
                <div className="v2-about-chart-label">Views — Last 12 Months</div>
                <svg viewBox="0 0 300 60" preserveAspectRatio="none" fill="none">
                  <defs><linearGradient id="v2cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#008CFF" stopOpacity="0.35"/><stop offset="100%" stopColor="#008CFF" stopOpacity="0"/></linearGradient></defs>
                  <path d="M0 55 C30 52 50 48 80 42 S120 32 150 24 S210 12 250 8 S280 5 300 3" stroke="#008CFF" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M0 55 C30 52 50 48 80 42 S120 32 150 24 S210 12 250 8 S280 5 300 3 V60 H0Z" fill="url(#v2cg)"/>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="v2-process">
          <div className="v2-section-header">
            <div>
              <span className="v2-eyebrow">The Method</span>
              <h2 className="v2-section-title v2-split-reveal">Three Steps. Real Results.</h2>
            </div>
          </div>
          <div className="v2-process-steps">
            {[
              { num: '01', title: 'Brief', body: 'You share your campaign goal. We map the creator landscape — reach, CPM, audience overlap, niche authority.' },
              { num: '02', title: 'Seed', body: 'We place your product with 10–50 vetted creators simultaneously. Organic posts, no ad labels, authentic voice.' },
              { num: '03', title: 'Scale', body: 'We analyse which creators drove results, double down, and build you a perpetual-motion content engine.' },
            ].map((s, i) => (
              <div className="v2-process-step v2-reveal" key={i} data-delay={`${i * 0.15}`}>
                <div className="v2-process-num">{s.num}</div>
                <div className="v2-process-title">{s.title}</div>
                <p className="v2-process-body">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="v2-cta" id="contact">
          <span className="v2-cta-ring" />
          <span className="v2-cta-ring" />
          <span className="v2-cta-ring" />
          <div className="v2-cta-eyebrow v2-reveal">Ready to grow?</div>
          <h2 className="v2-cta-headline">
            <span className="v2-cta-hl-small v2-reveal d1">Let&apos;s Build</span>
            <span className="v2-cta-hl-big v2-reveal d2">Something</span>
            <span className="v2-cta-hl-outline v2-reveal d3">Unforgettable.</span>
          </h2>
          <div className="v2-cta-actions v2-reveal d3">
            <a href="https://calendar.app.google/4wcPnasps28aBHTJ9" target="_blank" rel="noopener noreferrer" className="v2-cta-btn primary">Book a Strategy Call →</a>
            <a href="/sign-up" className="v2-cta-btn outline">Create Account</a>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="v2-footer">
          <a href="/v2" className="v2-footer-logo">Social<em>Sculp</em></a>
          <ul className="v2-footer-links"><li><a href="#work">Work</a></li><li><a href="#services">Services</a></li><li><a href="mailto:business@socialsculp.io">business@socialsculp.io</a></li><li><a href="/sign-in">Sign In</a></li><li><a href="/sign-up">Get Started</a></li></ul>
          <div className="v2-footer-legal">© 2025 SocialSculp LLC.</div>
        </footer>
      </div>

      {/* Single shared WebGL canvas for all ScrollScene views — always present */}
      <SharedCanvas />

      {/* Case study detail modal */}
      {selectedCase && <CaseStudyModal c={selectedCase} onClose={() => setSelectedCase(null)} />}
    </>
  )
}
