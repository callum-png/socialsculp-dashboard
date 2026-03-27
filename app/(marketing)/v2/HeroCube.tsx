'use client'

import { useMemo } from 'react'

/**
 * HeroCube — CSS 3D rotating geometric form + starfield background.
 * Inspired by unseen.co: pure CSS transforms, no WebGL, buttery smooth.
 * Brand-colored edges with SocialSculp's #008CFF accent.
 */
export function HeroCube() {
  // Generate deterministic star positions (seeded by index)
  const stars = useMemo(() => {
    const arr: { x: number; y: number; size: number; opacity: number; delay: number }[] = []
    for (let i = 0; i < 120; i++) {
      // Simple pseudo-random from index
      const s1 = Math.sin(i * 127.1 + 311.7) * 43758.5453
      const s2 = Math.sin(i * 269.5 + 183.3) * 43758.5453
      const s3 = Math.sin(i * 419.2 + 71.9) * 43758.5453
      arr.push({
        x: (s1 - Math.floor(s1)) * 100,
        y: (s2 - Math.floor(s2)) * 100,
        size: 1 + (s3 - Math.floor(s3)) * 1.5,
        opacity: 0.15 + (s3 - Math.floor(s3)) * 0.55,
        delay: (s1 - Math.floor(s1)) * 6,
      })
    }
    return arr
  }, [])

  return (
    <div className="cube-scene" aria-hidden="true">
      {/* Starfield layer */}
      <div className="hero-stars">
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
      </div>

      {/* Subtle radial gradient for depth */}
      <div className="hero-space-gradient" />

      {/* Outer rotating cube */}
      <div className="cube-rig">
        <div className="cube">
          <div className="cube-face cube-front" />
          <div className="cube-face cube-back" />
          <div className="cube-face cube-left" />
          <div className="cube-face cube-right" />
          <div className="cube-face cube-top" />
          <div className="cube-face cube-bottom" />
        </div>

        {/* Inner counter-rotating cube for depth */}
        <div className="cube cube-inner">
          <div className="cube-face cube-front" />
          <div className="cube-face cube-back" />
          <div className="cube-face cube-left" />
          <div className="cube-face cube-right" />
          <div className="cube-face cube-top" />
          <div className="cube-face cube-bottom" />
        </div>

        {/* Wireframe octahedron accent */}
        <div className="octa">
          <div className="octa-edge octa-e1" />
          <div className="octa-edge octa-e2" />
          <div className="octa-edge octa-e3" />
          <div className="octa-edge octa-e4" />
        </div>
      </div>

      {/* Ambient glow */}
      <div className="cube-glow" />
    </div>
  )
}
