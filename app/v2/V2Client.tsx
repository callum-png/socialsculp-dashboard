'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useScrollAnimations } from './useScrollAnimations'

// Shared canvas that all ScrollScene Views render into — prevents context limit
const SharedCanvas = dynamic(
  () => import('@react-three/fiber').then(m => {
    const { Canvas } = m
    const { Preload, View } = require('@react-three/drei')
    function SC() {
      return (
        <Canvas
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 1 }}
          gl={{ antialias: true, alpha: true }}
        >
          <View.Port />
          <Preload all />
        </Canvas>
      )
    }
    return { default: SC }
  }),
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
        <div style={{ position: 'absolute', bottom: 48, left: 48 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(9rem,18vw,22rem)', color: 'rgba(240,230,222,0.9)', lineHeight: 0.82, letterSpacing: '-0.04em' }}>000</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: 'rgba(0,140,255,0.75)', marginTop: 6 }}>CREATOR NETWORK — INITIALISING</div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.07)' }} />
      </div>
    )
  }
)
const NetworkHero = dynamic(
  () => import('./NetworkHero').then(m => ({ default: m.NetworkHero })),
  { ssr: false }
)
const ScrollScene = dynamic(
  () => import('./ScrollScene').then(m => ({ default: m.ScrollScene })),
  { ssr: false }
)

type GeoType = 'seeding' | 'narrative' | 'media' | 'mgmt' | 'strategy' | 'analytics'

interface CaseStudy { num: string; title: string; tags: string[]; metric: string; metricLbl: string }
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

export function V2PageWrapper({ caseStudies, services, brands }: { caseStudies: CaseStudy[]; services: Service[]; brands: string[] }) {
  const [introComplete, setIntroComplete] = useState(false)
  const [heroVisible, setHeroVisible] = useState(false)

  useScrollAnimations()

  // ?skip=1 in URL bypasses the intro instantly (useful for development)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('skip')) {
      setIntroComplete(true)
      setHeroVisible(true)
    }
  }, [])

  const handleIntroComplete = () => {
    setIntroComplete(true)
    setTimeout(() => setHeroVisible(true), 200)
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
          <div className="v2-hero-canvas-wrap" style={{ opacity: heroVisible ? 1 : 0, transition: 'opacity 1.5s ease' }} aria-hidden="true">
            <NetworkHero />
          </div>
          <div className="v2-hero-overlay" aria-hidden="true" />
          <div className="v2-hero-tag">Creator Seeding Agency — Est. 2024</div>
          <h1 className="v2-hero-headline">We Engineer<br /><span className="v2-gradient-text">Narratives</span><br />at Scale.</h1>
          <div className="v2-hero-sub-row">
            <p className="v2-hero-desc">SocialSculp is a data-driven creator seeding agency. 1.9B+ views, $2 blended CPM, 50+ creators.</p>
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
          <div className="v2-stat"><div className="v2-stat-num"><AnimatedCounter target={1.9} suffix="B+" isFloat /></div><div className="v2-stat-label">All-Time Views</div></div>
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
            <div className="v2-case-row" key={i}>
              <div className="v2-case-num">{c.num}</div>
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

        {/* ── Metrics ── */}
        <div className="v2-metrics v2-reveal">
          <div className="v2-metrics-label">Platform Performance</div>
          <div className="v2-metrics-row">
            <div className="v2-metric-cell featured">
              <div className="v2-metric-val"><AnimatedCounter target={1.9} suffix="B+" isFloat /></div>
              <div className="v2-metric-lbl">All-Time Views</div>
              <div className="v2-metric-sub">Across TikTok, Instagram, YouTube Shorts & Snapchat.</div>
            </div>
            <div className="v2-metric-cell"><div className="v2-metric-val">$<AnimatedCounter target={2} /></div><div className="v2-metric-lbl">Blended CPM</div></div>
            <div className="v2-metric-cell"><div className="v2-metric-val"><AnimatedCounter target={50} suffix="+" /></div><div className="v2-metric-lbl">Creators</div></div>
            <div className="v2-metric-cell"><div className="v2-metric-val"><AnimatedCounter target={20} suffix="+" /></div><div className="v2-metric-lbl">Brands Served</div></div>
          </div>
        </div>

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

        {/* ── CTA ── */}
        <section className="v2-cta" id="contact">
          <div className="v2-cta-eyebrow">Ready to grow?</div>
          <h2 className="v2-cta-headline">Let&apos;s Build<br /><span className="v2-cta-outline">Something</span><br />Unforgettable.</h2>
          <div className="v2-cta-actions">
            <a href="https://calendar.app.google/4wcPnasps28aBHTJ9" target="_blank" rel="noopener noreferrer" className="v2-cta-btn primary">Book a Strategy Call →</a>
            <a href="/sign-up" className="v2-cta-btn outline">Create Account</a>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="v2-footer">
          <a href="/v2" className="v2-footer-logo">Social<em>Sculp</em></a>
          <ul className="v2-footer-links"><li><a href="#work">Work</a></li><li><a href="#services">Services</a></li><li><a href="/sign-in">Sign In</a></li><li><a href="/sign-up">Get Started</a></li></ul>
          <div className="v2-footer-legal">© 2024 S23 Operations Ltd.</div>
        </footer>
      </div>

      {/* Single shared WebGL canvas for all ScrollScene views — prevents context limit */}
      {introComplete && <SharedCanvas />}
    </>
  )
}
