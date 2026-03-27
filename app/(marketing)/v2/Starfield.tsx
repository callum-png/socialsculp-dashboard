'use client'

import { useMemo } from 'react'

/**
 * Starfield — fixed-position twinkling stars that cover the entire page.
 * Renders once, stays behind all content via z-index 0.
 */
export function Starfield() {
  const stars = useMemo(() => {
    const arr: { x: number; y: number; size: number; opacity: number; delay: number }[] = []
    for (let i = 0; i < 180; i++) {
      const s1 = Math.sin(i * 127.1 + 311.7) * 43758.5453
      const s2 = Math.sin(i * 269.5 + 183.3) * 43758.5453
      const s3 = Math.sin(i * 419.2 + 71.9) * 43758.5453
      arr.push({
        x: (s1 - Math.floor(s1)) * 100,
        y: (s2 - Math.floor(s2)) * 100,
        size: 1 + (s3 - Math.floor(s3)) * 1.5,
        opacity: 0.12 + (s3 - Math.floor(s3)) * 0.5,
        delay: (s1 - Math.floor(s1)) * 6,
      })
    }
    return arr
  }, [])

  return (
    <div className="page-starfield" aria-hidden="true">
      {stars.map((s, i) => (
        <div
          key={i}
          className="hero-star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      {/* Subtle space gradients */}
      <div className="hero-space-gradient" />
    </div>
  )
}
