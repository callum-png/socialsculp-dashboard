'use client'
import { useEffect, useState } from 'react'

export function HeroVisualBento() {
  const [views, setViews] = useState(0.0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let frame = 0
    const total = 90
    const target = 1.9
    const tick = () => {
      frame++
      const progress = frame / total
      const eased = 1 - Math.pow(1 - progress, 3)
      setViews(parseFloat((eased * target).toFixed(1)))
      if (frame < total) requestAnimationFrame(tick)
    }
    const t = setTimeout(() => requestAnimationFrame(tick), 400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`hero-bento${mounted ? ' hero-bento--in' : ''}`}>

      {/* ── Main stat card ── */}
      <div className="hb-main">
        <div className="hb-glow" aria-hidden="true" />

        <div className="hb-live">
          <span className="hb-dot" />
          Live Campaigns
        </div>

        <div className="hb-big-num">
          {views.toFixed(1)}<span className="hb-suffix">B+</span>
        </div>
        <div className="hb-big-label">All-Time Views Delivered</div>

        {/* Sparkline */}
        <div className="hb-spark">
          <svg viewBox="0 0 300 56" fill="none" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="hbg1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#008CFF" stopOpacity="0.28"/>
                <stop offset="100%" stopColor="#008CFF" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path
              d="M0 54 C20 54 30 50 50 46 S80 38 110 30 S160 17 200 10 S250 4 300 2"
              stroke="#008CFF" strokeWidth="1.8" fill="none" strokeLinecap="round"
              className="hb-spark-line"
            />
            <path
              d="M0 54 C20 54 30 50 50 46 S80 38 110 30 S160 17 200 10 S250 4 300 2 V56 H0Z"
              fill="url(#hbg1)"
              className="hb-spark-fill"
            />
            {/* Trailing dot */}
            <circle cx="300" cy="2" r="3.5" fill="#008CFF" opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
      </div>

      {/* ── Three metric chips ── */}
      <div className="hb-chips">
        <div className="hb-chip">
          <div className="hb-chip-icon hb-icon-cpm" aria-hidden="true">↓</div>
          <div className="hb-chip-val">$2</div>
          <div className="hb-chip-lbl">Blended CPM</div>
        </div>
        <div className="hb-chip">
          <div className="hb-chip-icon hb-icon-ctr" aria-hidden="true">◈</div>
          <div className="hb-chip-val">50+</div>
          <div className="hb-chip-lbl">Creators</div>
        </div>
        <div className="hb-chip">
          <div className="hb-chip-icon hb-icon-br" aria-hidden="true">◆</div>
          <div className="hb-chip-val">20+</div>
          <div className="hb-chip-lbl">Brands Served</div>
        </div>
      </div>

      {/* ── Content preview tiles ── */}
      <div className="hb-tiles">
        {[
          { views: '3.7M', label: '@kasuniversity', hue: '208,88,48' },
          { views: '2.1M', label: '@shadezstudies',  hue: '196,70,42' },
          { views: '890K', label: '@masoncapodanno', hue: '220,60,36' },
        ].map((t, i) => (
          <div className="hb-tile" key={i}>
            <div
              className="hb-tile-thumb"
              style={{ background: `radial-gradient(135deg at 30% 30%, hsl(${t.hue}) 0%, hsl(220,45%,8%) 100%)` }}
              aria-hidden="true"
            >
              <span className="hb-play">▶</span>
            </div>
            <div className="hb-tile-meta">
              <div className="hb-tile-views">{t.views}</div>
              <div className="hb-tile-handle">{t.label}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
