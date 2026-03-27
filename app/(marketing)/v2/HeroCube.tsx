'use client'

/**
 * HeroCube — CSS 3D rotating geometric form for the hero background.
 * Inspired by unseen.co: pure CSS transforms, no WebGL, buttery smooth.
 * Brand-colored edges with SocialSculp's #008CFF accent.
 */
export function HeroCube() {
  return (
    <div className="cube-scene" aria-hidden="true">
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
