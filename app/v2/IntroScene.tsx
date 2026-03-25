'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

// ── Duration ──────────────────────────────────────────────────
const INTRO_DURATION = 8000 // ms
const NODE_COUNT = 80
const SPHERE_RADIUS = 9
const MIN_DIST = 2.1
const CONNECTION_RADIUS = 3.9
const BRAND_TEXT = 'SOCIALSCULP'

// ── GLSL: Nodes ───────────────────────────────────────────────
const NODE_VERT = /* glsl */`
  attribute float aActive;
  varying float vActive;
  void main() {
    vActive = aActive;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = mix(3.0, 22.0, vActive) * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`
const NODE_FRAG = /* glsl */`
  varying float vActive;
  uniform float uTime;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float core = 1.0 - smoothstep(0.0, 0.13, d);
    float mid  = 1.0 - smoothstep(0.13, 0.3, d);
    float glow = 1.0 - smoothstep(0.3, 0.5, d);
    vec3 dormant = vec3(0.07, 0.12, 0.24);
    vec3 edge    = vec3(0.0, 0.58, 1.0);
    vec3 bright  = vec3(0.8, 0.94, 1.0);
    vec3 col = mix(dormant, edge, vActive);
    col = mix(col, bright, core * vActive * 0.85);
    float pulse = sin(uTime * 2.8) * 0.06 * vActive;
    float a = clamp(core * 0.95 + mid * 0.5 * vActive + glow * 0.3 * vActive + pulse, 0.06 * core, 1.0);
    gl_FragColor = vec4(col, a);
  }
`

// ── GLSL: Edges ───────────────────────────────────────────────
const EDGE_VERT = /* glsl */`
  attribute float aActive;
  varying float vActive;
  void main() {
    vActive = aActive;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const EDGE_FRAG = /* glsl */`
  varying float vActive;
  void main() {
    if (vActive < 0.02) discard;
    vec3 col = mix(vec3(0.04, 0.10, 0.20), vec3(0.0, 0.62, 1.0), vActive);
    gl_FragColor = vec4(col, vActive * 0.55);
  }
`

// ── Helpers ───────────────────────────────────────────────────
function generateNodes(count: number, radius: number, minD: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)]
  let tries = 0
  while (pts.length < count && tries < 20000) {
    tries++
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = Math.cbrt(Math.random()) * radius
    const c = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    )
    if (pts.every(p => p.distanceTo(c) >= minD)) pts.push(c)
  }
  return pts
}

function buildEdges(nodes: THREE.Vector3[], radius: number): [number, number][] {
  const edges: [number, number][] = []
  const seen = new Set<string>()
  for (let i = 0; i < nodes.length; i++) {
    const nearby = nodes
      .map((n, j) => ({ j, d: nodes[i].distanceTo(n) }))
      .filter(({ j, d }) => j !== i && d <= radius)
      .sort((a, b) => a.d - b.d)
    const max = 2 + Math.floor(Math.random() * 2)
    for (const { j } of nearby.slice(0, max)) {
      const k = `${Math.min(i, j)}-${Math.max(i, j)}`
      if (!seen.has(k)) { seen.add(k); edges.push([i, j]) }
    }
  }
  return edges
}

function bfs(count: number, edges: [number, number][]): number[][] {
  const adj: number[][] = Array.from({ length: count }, () => [])
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a) })
  const visited = new Set([0])
  const levels: number[][] = [[0]]
  let front = [0]
  while (front.length) {
    const next: number[] = []
    for (const n of front)
      for (const nb of adj[n])
        if (!visited.has(nb)) { visited.add(nb); next.push(nb) }
    if (next.length) levels.push(next)
    front = next
  }
  return levels
}

// ── R3F: Nodes ────────────────────────────────────────────────
function Nodes({ positions, activRef }: {
  positions: Float32Array
  activRef: React.MutableRefObject<Float32Array>
}) {
  const pts = useRef<THREE.Points>(null)
  const mat = useRef<THREE.ShaderMaterial>(null)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3))
    g.setAttribute('aActive', new THREE.BufferAttribute(new Float32Array(positions.length / 3), 1))
    return g
  }, [positions])
  useFrame(({ clock }) => {
    if (!mat.current || !pts.current) return
    mat.current.uniforms.uTime.value = clock.getElapsedTime()
    const a = pts.current.geometry.getAttribute('aActive') as THREE.BufferAttribute
    ;(a.array as Float32Array).set(activRef.current)
    a.needsUpdate = true
  })
  return (
    <points ref={pts} geometry={geo}>
      <shaderMaterial ref={mat} vertexShader={NODE_VERT} fragmentShader={NODE_FRAG}
        uniforms={{ uTime: { value: 0 } }} transparent depthWrite={false}
        blending={THREE.AdditiveBlending} />
    </points>
  )
}

// ── R3F: Edges ────────────────────────────────────────────────
function Edges({ nodes, edges, edgeActivRef }: {
  nodes: THREE.Vector3[]
  edges: [number, number][]
  edgeActivRef: React.MutableRefObject<Float32Array>
}) {
  const lines = useRef<THREE.LineSegments>(null)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(edges.length * 6)
    edges.forEach(([a, b], i) => {
      pos[i*6]=nodes[a].x; pos[i*6+1]=nodes[a].y; pos[i*6+2]=nodes[a].z
      pos[i*6+3]=nodes[b].x; pos[i*6+4]=nodes[b].y; pos[i*6+5]=nodes[b].z
    })
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aActive', new THREE.BufferAttribute(new Float32Array(edges.length * 2), 1))
    return g
  }, [nodes, edges])
  useFrame(() => {
    if (!lines.current) return
    const a = lines.current.geometry.getAttribute('aActive') as THREE.BufferAttribute
    const arr = a.array as Float32Array
    edgeActivRef.current.forEach((v, i) => { arr[i*2] = v; arr[i*2+1] = v })
    a.needsUpdate = true
  })
  return (
    <lineSegments ref={lines} geometry={geo}>
      <shaderMaterial vertexShader={EDGE_VERT} fragmentShader={EDGE_FRAG}
        uniforms={{}} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </lineSegments>
  )
}

// ── R3F: Camera ───────────────────────────────────────────────
function Camera({ pRef }: { pRef: React.MutableRefObject<number> }) {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime()
    const p = pRef.current
    const radius = p < 60 ? 22 - p * 0.06 : 18 + (p - 60) * 0.18
    camera.position.x = Math.sin(t * 0.055) * radius
    camera.position.y = 4 + Math.sin(t * 0.028) * 3.5
    camera.position.z = Math.cos(t * 0.055) * radius
    camera.lookAt(0, 0, 0)
  })
  return null
}

// ── Scene ─────────────────────────────────────────────────────
function Scene({ nodes, edges, activRef, edgeActivRef, pRef }: {
  nodes: THREE.Vector3[]
  edges: [number, number][]
  activRef: React.MutableRefObject<Float32Array>
  edgeActivRef: React.MutableRefObject<Float32Array>
  pRef: React.MutableRefObject<number>
}) {
  const positions = useMemo(() => {
    const a = new Float32Array(nodes.length * 3)
    nodes.forEach((p, i) => { a[i*3]=p.x; a[i*3+1]=p.y; a[i*3+2]=p.z })
    return a
  }, [nodes])
  return (
    <>
      <color attach="background" args={['#040810']} />
      <Nodes positions={positions} activRef={activRef} />
      <Edges nodes={nodes} edges={edges} edgeActivRef={edgeActivRef} />
      <Camera pRef={pRef} />
      <EffectComposer>
        <Bloom intensity={2.0} luminanceThreshold={0.1} luminanceSmoothing={0.9} mipmapBlur />
        <ChromaticAberration offset={[0.0007, 0.0007] as [number, number]} />
        <Vignette eskil={false} offset={0.1} darkness={0.9} />
      </EffectComposer>
    </>
  )
}

// ── IntroScene (export) ───────────────────────────────────────
export function IntroScene({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const [mounted, setMounted] = useState(true)

  const activRef = useRef(new Float32Array(NODE_COUNT))
  const edgeActivRef = useRef(new Float32Array(0))
  const pRef = useRef(0)

  const { nodes, edges, levels } = useMemo(() => {
    const nodes = generateNodes(NODE_COUNT, SPHERE_RADIUS, MIN_DIST)
    const edges = buildEdges(nodes, CONNECTION_RADIUS)
    const levels = bfs(nodes.length, edges)
    return { nodes, edges, levels }
  }, [])

  useEffect(() => { edgeActivRef.current = new Float32Array(edges.length) }, [edges.length])

  useEffect(() => {
    const activ = activRef.current
    const start = performance.now()
    let raf: number

    const tick = () => {
      const pct = Math.min(100, ((performance.now() - start) / INTRO_DURATION) * 100)
      pRef.current = pct
      setProgress(Math.floor(pct))

      if (pct < 25) {
        // Nodes appear one by one
        const n = Math.floor((pct / 25) * nodes.length)
        for (let i = 0; i < nodes.length; i++) {
          const t = i < n ? 0.18 : 0
          activ[i] += (t - activ[i]) * 0.1
        }
      } else if (pct < 78) {
        // BFS signal propagation
        const sp = (pct - 25) / 53
        const lp = sp * levels.length
        for (let l = 0; l < levels.length; l++) {
          const raw = Math.max(0, Math.min(1, lp - l))
          const smooth = raw * raw * (3 - 2 * raw)
          const target = l === 0 ? 1.0 : smooth > 0.05 ? 0.2 + smooth * 0.8 : 0.18
          for (const idx of levels[l]) activ[idx] += (target - activ[idx]) * 0.07
        }
        edges.forEach(([a, b], i) => {
          const t = Math.min(activ[a], activ[b]) * 1.15
          edgeActivRef.current[i] += (t - edgeActivRef.current[i]) * 0.08
        })
      } else {
        // Full glow
        for (let i = 0; i < nodes.length; i++) activ[i] += (1.0 - activ[i]) * 0.04
        edges.forEach((_, i) => { edgeActivRef.current[i] += (0.75 - edgeActivRef.current[i]) * 0.04 })
      }

      if (pct < 100) {
        raf = requestAnimationFrame(tick)
      } else {
        setTimeout(() => {
          setFading(true)
          setTimeout(() => { setMounted(false); onComplete() }, 1200)
        }, 500)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [nodes, edges, levels, onComplete])

  if (!mounted) return null

  const showText = progress >= 78
  const textCount = showText ? Math.floor(((progress - 78) / 14) * BRAND_TEXT.length) : 0

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      transition: 'opacity 1.2s ease',
      opacity: fading ? 0 : 1,
      pointerEvents: fading ? 'none' : 'auto',
    }}>
      <Canvas
        camera={{ position: [0, 4, 22], fov: 55 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <Scene nodes={nodes} edges={edges} activRef={activRef} edgeActivRef={edgeActivRef} pRef={pRef} />
      </Canvas>

      {/* Brand text */}
      {showText && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic', fontWeight: 300,
          fontSize: 'clamp(2.8rem, 6vw, 7rem)',
          letterSpacing: '-0.02em', color: '#F0E6DE',
          textShadow: '0 0 80px rgba(0,140,255,0.5)',
          whiteSpace: 'nowrap', zIndex: 10, pointerEvents: 'none',
        }}>
          {BRAND_TEXT.slice(0, textCount).split('').map((ch, i) => (
            <span key={i} style={{ display: 'inline-block', animation: 'iLetIn 0.25s ease forwards' }}>
              {i === 6 ? <em style={{ color: '#008CFF', fontStyle: 'normal' }}>{ch}</em> : ch}
            </span>
          ))}
        </div>
      )}

      {/* Counter */}
      <div style={{
        position: 'absolute', bottom: 48, left: 48, zIndex: 10, pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic', fontWeight: 300,
          fontSize: 'clamp(3.5rem, 7vw, 6.5rem)',
          color: 'rgba(240,230,222,0.92)', lineHeight: 1, letterSpacing: '-0.03em',
        }}>
          {String(progress).padStart(3, '0')}
        </div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem',
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'rgba(0,140,255,0.75)', marginTop: 6,
        }}>
          Creator Network Initialising
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.07)', zIndex: 10 }}>
        <div style={{
          height: '100%', width: `${progress}%`, background: '#008CFF',
          boxShadow: '0 0 16px rgba(0,140,255,0.9)', transition: 'width 0.08s linear',
        }} />
      </div>

      <style>{`@keyframes iLetIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  )
}
