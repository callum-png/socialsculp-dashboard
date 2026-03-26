'use client'

import { useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── Orbital config [radius, speed (rad/s), phase] ─────────────
const ORBITS_DESKTOP = [
  [5.5, 0.18, 0.0],
  [7.2, 0.12, 1.1],
  [6.0, 0.22, 2.3],
  [8.5, 0.09, 3.7],
  [6.8, 0.16, 4.8],
  [9.0, 0.07, 5.5],
] as const

const ORBITS_MOBILE = ORBITS_DESKTOP.slice(0, 4)

// ── GLSL: single Points shader for ALL point types ─────────────
const VERT = /* glsl */`
  attribute float aSize;
  attribute float aBrightness;
  varying float vBrightness;
  void main() {
    vBrightness = aBrightness;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (280.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`
const FRAG = /* glsl */`
  varying float vBrightness;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float core = 1.0 - smoothstep(0.0, 0.12, d);
    float mid  = 1.0 - smoothstep(0.08, 0.30, d);
    float glow = 1.0 - smoothstep(0.15, 0.50, d);
    vec3 blue  = vec3(0.0, 0.55, 1.0);
    vec3 white = vec3(1.0, 1.0, 1.0);
    vec3 col = mix(blue, white, core * 0.85);
    float a = (core + mid * 0.6 + glow * 0.3) * vBrightness;
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  }
`

// ── Scene ──────────────────────────────────────────────────────
function GalaxyScene({
  mouseRef,
  isMobile,
}: {
  mouseRef: React.MutableRefObject<{ tx: number; ty: number; tz: number; cx: number; cy: number; cz: number }>
  isMobile: boolean
}) {
  const orbits   = isMobile ? ORBITS_MOBILE : ORBITS_DESKTOP
  const CC       = orbits.length        // creator count
  const AC       = isMobile ? 22 : 72  // audience count

  // ── Point indices ────────────────────────────────────────────
  // 0         = brand node
  // 1..CC     = creator nodes
  // CC+1..2CC = signal packets
  // 2CC+1..   = audience
  const TOTAL = 1 + CC + CC + AC

  // ── Build geometry once ──────────────────────────────────────
  const { geo, lineGeo, packetT, autoRotY, linePosArr } = useMemo(() => {
    const pos  = new Float32Array(TOTAL * 3)
    const size = new Float32Array(TOTAL)
    const brt  = new Float32Array(TOTAL)

    // Brand node at origin
    size[0] = 28; brt[0] = 1.0

    // Creator nodes — initial positions (will be updated each frame)
    for (let i = 0; i < CC; i++) {
      size[1 + i] = 14; brt[1 + i] = 0.90
    }

    // Signal packets — start at origin
    for (let i = 0; i < CC; i++) {
      size[1 + CC + i] = 6; brt[1 + CC + i] = 1.0
    }

    // Audience — random shell at r=12–18
    for (let i = 0; i < AC; i++) {
      const idx = 1 + CC + CC + i
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = 11.5 + Math.random() * 6
      pos[idx * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos[idx * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[idx * 3 + 2] = r * Math.cos(phi)
      size[idx] = 1.5 + Math.random() * 2.5
      brt[idx]  = 0.08 + Math.random() * 0.12
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position',   new THREE.BufferAttribute(pos,  3))
    g.setAttribute('aSize',      new THREE.BufferAttribute(size, 1))
    g.setAttribute('aBrightness', new THREE.BufferAttribute(brt,  1))

    // Connection lines: CC pairs, each [0,0,0] → creatorPos
    const linePosArr = new Float32Array(CC * 2 * 3) // start=0,end=creator
    const lg = new THREE.BufferGeometry()
    lg.setAttribute('position', new THREE.BufferAttribute(linePosArr, 3))

    // Signal packet progress offsets (staggered so they don't all start at same point)
    const packetT = new Float32Array(CC)
    for (let i = 0; i < CC; i++) packetT[i] = i / CC

    const autoRotY = { current: 0 }

    return { geo: g, lineGeo: lg, packetT, autoRotY, linePosArr }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CC, AC])

  // ── Frame loop — zero heap allocation ────────────────────────
  useFrame(({ clock, camera }) => {
    const t   = clock.getElapsedTime()
    const pos = geo.attributes.position.array as Float32Array
    const m   = mouseRef.current

    // Lerp camera mouse offset
    const lerp = 0.032
    m.cx += (m.tx - m.cx) * lerp
    m.cy += (m.ty - m.cy) * lerp
    m.cz += (m.tz - m.cz) * lerp

    // Camera orbit
    autoRotY.current += 0.0008
    camera.position.x = Math.sin(autoRotY.current) * 0.8 + m.cx * 2.5
    camera.position.y = 2.5 + m.cy * 1.5
    camera.position.z = 22 + m.cz
    camera.lookAt(0, 0.5, 0)

    // Creator orbits
    for (let i = 0; i < CC; i++) {
      const [r, speed, phase] = orbits[i]
      const angle = t * speed + phase
      const x = Math.cos(angle) * r
      const y = Math.sin(angle * 0.55 + phase) * r * 0.28
      const z = Math.sin(angle) * r * 0.82
      const ci = (1 + i) * 3
      pos[ci]     = x
      pos[ci + 1] = y
      pos[ci + 2] = z
    }

    // Signal packets — lerp from origin toward creator
    for (let i = 0; i < CC; i++) {
      packetT[i] = (packetT[i] + 0.005) % 1
      const ci  = (1 + i) * 3
      const pi  = (1 + CC + i) * 3
      // Ease in/out along the path
      const ease = packetT[i] < 0.5
        ? 2 * packetT[i] * packetT[i]
        : 1 - Math.pow(-2 * packetT[i] + 2, 2) / 2
      pos[pi]     = pos[ci]     * ease
      pos[pi + 1] = pos[ci + 1] * ease
      pos[pi + 2] = pos[ci + 2] * ease
    }

    geo.attributes.position.needsUpdate = true

    // Connection lines — update end vertices only (starts are always 0,0,0)
    for (let i = 0; i < CC; i++) {
      const ci = (1 + i) * 3
      const li = i * 6       // each line = 2 vertices × 3 floats
      // start vertex stays at 0,0,0 (already zero from Float32Array init)
      linePosArr[li + 3] = pos[ci]
      linePosArr[li + 4] = pos[ci + 1]
      linePosArr[li + 5] = pos[ci + 2]
    }
    lineGeo.attributes.position.needsUpdate = true
  })

  return (
    <>
      <color attach="background" args={['#040810']} />

      {/* All nodes in one draw call */}
      <points geometry={geo}>
        <shaderMaterial
          vertexShader={VERT}
          fragmentShader={FRAG}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Connection lines — one draw call */}
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial
          color="#008CFF"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </>
  )
}

// ── Export ─────────────────────────────────────────────────────
export function NetworkHero() {
  const mouse    = useRef({ tx: 0, ty: 0, tz: 0, cx: 0, cy: 0, cz: 0 })
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth  - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      mouse.current.tx =  nx * 1.2
      mouse.current.ty = -ny * 0.8
      mouse.current.tz =  ny * 2.0
    }
    const onTouch = (e: TouchEvent) => {
      const t  = e.touches[0]
      const nx = t.clientX / window.innerWidth  - 0.5
      const ny = t.clientY / window.innerHeight - 0.5
      mouse.current.tx =  nx * 1.2
      mouse.current.ty = -ny * 0.8
      mouse.current.tz =  ny * 2.0
    }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('touchmove', onTouch, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 2.5, 22], fov: 52 }}
      gl={{ antialias: !isMobile, alpha: false, powerPreference: 'high-performance' }}
      dpr={isMobile ? 1 : Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <GalaxyScene mouseRef={mouse} isMobile={isMobile} />
    </Canvas>
  )
}
