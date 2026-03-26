'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'

// ── Duration ──────────────────────────────────────────────────
const INTRO_DURATION = 4000 // ms
const NODE_COUNT = 55
const SPHERE_RADIUS = 9
const MIN_DIST = 2.3
const CONNECTION_RADIUS = 4.2
const BRAND_TEXT = 'SOCIALSCULP'

// ── GLSL: Nodes ───────────────────────────────────────────────
const NODE_VERT = /* glsl */`
  attribute float aActive;
  varying float vActive;
  void main() {
    vActive = aActive;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = mix(3.5, 20.0, vActive) * (300.0 / -mv.z);
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
    // High dormant floor so nodes appear clearly even before activation
    vec3 dormant = vec3(0.12, 0.22, 0.48);
    vec3 edge    = vec3(0.0, 0.65, 1.0);
    vec3 bright  = vec3(0.88, 0.97, 1.0);
    vec3 col = mix(dormant, edge, vActive);
    col = mix(col, bright, core * vActive * 0.9);
    float pulse = sin(uTime * 2.8) * 0.08 * vActive;
    // dormant floor 0.22*core ensures visibility; active nodes are vivid
    float a = clamp(core * 1.0 + mid * 0.6 * vActive + glow * 0.45 * vActive + pulse, 0.22 * core, 1.0);
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

// ── R3F: Camera — gentle orbit, stays close ────────────────────
function Camera({ pRef }: { pRef: React.MutableRefObject<number> }) {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime()
    // Gentle slow orbit — reduced amplitude vs original
    camera.position.x = Math.sin(t * 0.04) * 3.5
    camera.position.y = 3 + Math.sin(t * 0.022) * 1.8
    camera.position.z = 20 - Math.abs(Math.sin(t * 0.015)) * 1.5
    camera.lookAt(0, 0, 0)
    void pRef
  })
  return null
}

// ── Scene — group rotates slowly on Y ─────────────────────────
function Scene({ nodes, edges, activRef, edgeActivRef, pRef }: {
  nodes: THREE.Vector3[]
  edges: [number, number][]
  activRef: React.MutableRefObject<Float32Array>
  edgeActivRef: React.MutableRefObject<Float32Array>
  pRef: React.MutableRefObject<number>
}) {
  const groupRef = useRef<THREE.Group>(null)
  const positions = useMemo(() => {
    const a = new Float32Array(nodes.length * 3)
    nodes.forEach((p, i) => { a[i*3]=p.x; a[i*3+1]=p.y; a[i*3+2]=p.z })
    return a
  }, [nodes])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0006
    }
  })

  return (
    <>
      <color attach="background" args={['#040810']} />
      <group ref={groupRef}>
        <Nodes positions={positions} activRef={activRef} />
        <Edges nodes={nodes} edges={edges} edgeActivRef={edgeActivRef} />
      </group>
      <Camera pRef={pRef} />
      <EffectComposer>
        <Bloom intensity={3.2} luminanceThreshold={0.05} luminanceSmoothing={0.75} mipmapBlur />
        <ChromaticAberration offset={[0.0007, 0.0007] as [number, number]} />
      </EffectComposer>
    </>
  )
}

// ── IntroScene (export) ───────────────────────────────────────
export function IntroScene({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const [mounted, setMounted] = useState(true)
  const [sceneReady, setSceneReady] = useState(false)

  const activRef = useRef(new Float32Array(NODE_COUNT))
  const edgeActivRef = useRef(new Float32Array(0))
  const pRef = useRef(0)

  // Defer heavy computation to after first paint so counter shows instantly
  const nodesRef = useRef<THREE.Vector3[]>([])
  const edgesRef = useRef<[number, number][]>([])
  const levelsRef = useRef<number[][]>([])

  useEffect(() => {
    // Run after first paint via setTimeout 0
    const id = setTimeout(() => {
      const nodes = generateNodes(NODE_COUNT, SPHERE_RADIUS, MIN_DIST)
      const edges = buildEdges(nodes, CONNECTION_RADIUS)
      const levels = bfs(nodes.length, edges)
      nodesRef.current = nodes
      edgesRef.current = edges
      levelsRef.current = levels
      edgeActivRef.current = new Float32Array(edges.length)
      setSceneReady(true)
    }, 0)
    return () => clearTimeout(id)
  }, [])

  // Convenience aliases (only valid after sceneReady)
  const nodes = nodesRef.current
  const edges = edgesRef.current
  const levels = levelsRef.current

  useEffect(() => {
    if (!sceneReady) return
    const activ = activRef.current
    const start = performance.now()
    let raf: number

    const tick = () => {
      const pct = Math.min(100, ((performance.now() - start) / INTRO_DURATION) * 100)
      pRef.current = pct
      setProgress(Math.floor(pct))

      const ns = nodesRef.current
      const es = edgesRef.current
      const ls = levelsRef.current

      if (pct < 15) {
        const n = Math.floor((pct / 15) * ns.length)
        for (let i = 0; i < ns.length; i++) {
          const t = i < n ? 0.18 : 0
          activ[i] += (t - activ[i]) * 0.12
        }
      } else if (pct < 70) {
        const sp = (pct - 15) / 55
        const lp = sp * ls.length
        for (let l = 0; l < ls.length; l++) {
          const raw = Math.max(0, Math.min(1, lp - l))
          const smooth = raw * raw * (3 - 2 * raw)
          const target = l === 0 ? 1.0 : smooth > 0.05 ? 0.2 + smooth * 0.8 : 0.18
          for (const idx of ls[l]) activ[idx] += (target - activ[idx]) * 0.08
        }
        es.forEach(([a, b], i) => {
          const t = Math.min(activ[a], activ[b]) * 1.15
          edgeActivRef.current[i] += (t - edgeActivRef.current[i]) * 0.09
        })
      } else {
        for (let i = 0; i < ns.length; i++) activ[i] += (1.0 - activ[i]) * 0.05
        es.forEach((_, i) => { edgeActivRef.current[i] += (0.75 - edgeActivRef.current[i]) * 0.05 })
      }

      if (pct < 100) {
        raf = requestAnimationFrame(tick)
      } else {
        setTimeout(() => {
          setFading(true)
          setTimeout(() => { setMounted(false); onComplete() }, 1000)
        }, 300)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [sceneReady, onComplete])

  if (!mounted) return null

  // Brand text appears at 70%
  const showText = progress >= 70
  const textCount = showText ? Math.floor(((progress - 70) / 20) * BRAND_TEXT.length) : 0

  // Phase-aware status copy
  const phaseLabel =
    progress < 20  ? 'MAPPING CREATOR NETWORK' :
    progress < 55  ? 'PROPAGATING SIGNAL' :
    progress < 80  ? 'NETWORK ONLINE' :
    'SOCIALSCULP'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      transition: 'opacity 1.2s ease',
      opacity: fading ? 0 : 1,
      pointerEvents: fading ? 'none' : 'auto',
    }}>
      {/* Dark background always shows instantly */}
      <div style={{ position: 'absolute', inset: 0, background: '#040810' }} />
      {/* Canvas only mounts once nodes are computed (deferred by setTimeout 0) */}
      {sceneReady && (
        <Canvas
          camera={{ position: [0, 3, 20], fov: 52 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          <Scene nodes={nodesRef.current} edges={edgesRef.current} activRef={activRef} edgeActivRef={edgeActivRef} pRef={pRef} />
        </Canvas>
      )}

      {/* Scan line — descends from top at 0.25x progress speed */}
      <div style={{
        position: 'absolute', left: 0, right: 0, zIndex: 9, pointerEvents: 'none',
        top: `${Math.min(progress * 1.1, 100)}%`,
        height: 1,
        background: 'linear-gradient(to right, transparent, rgba(0,140,255,0.5) 20%, rgba(0,140,255,0.8) 50%, rgba(0,140,255,0.5) 80%, transparent)',
        boxShadow: '0 0 12px rgba(0,140,255,0.6)',
        transition: 'top 0.06s linear',
      }} />

      {/* Top-right system labels */}
      <div style={{
        position: 'absolute', top: 24, right: 32, zIndex: 10, pointerEvents: 'none',
        fontFamily: "'DM Sans', sans-serif", fontSize: '0.56rem',
        letterSpacing: '0.20em', textTransform: 'uppercase',
        color: 'rgba(0,140,255,0.55)',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
      }}>
        <span>SIGNAL PROPAGATION</span>
        <span style={{ color: 'rgba(0,140,255,0.35)' }}>v2.0.1 — {new Date().getFullYear()}</span>
      </div>

      {/* Brand text — cinematic centre reveal */}
      {showText && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic', fontWeight: 300,
          fontSize: 'clamp(4rem, 10vw, 11rem)',
          letterSpacing: '-0.02em',
          color: '#F0E6DE',
          whiteSpace: 'nowrap', zIndex: 10, pointerEvents: 'none',
          perspective: '1200px',
          textShadow: '0 0 120px rgba(0,140,255,0.5), 0 0 40px rgba(0,140,255,0.2)',
        }}>
          {BRAND_TEXT.slice(0, textCount).split('').map((ch, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                animation: 'letterFlip3d 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                animationDelay: `${i * 0.015}s`,
                opacity: 0,
              }}
            >
              {i === 6 ? (
                <span style={{
                  color: '#008CFF',
                  textShadow: '0 0 40px rgba(0,140,255,1), 0 0 80px rgba(0,140,255,0.5)',
                }}>{ch}</span>
              ) : ch}
            </span>
          ))}
        </div>
      )}

      {/* Counter — LARGE editorial presence */}
      <div style={{
        position: 'absolute', bottom: 40, left: 48, zIndex: 10, pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic', fontWeight: 300,
          fontSize: 'clamp(9rem, 18vw, 22rem)',
          color: 'rgba(240,230,222,0.9)', lineHeight: 0.82, letterSpacing: '-0.04em',
          textShadow: '0 0 80px rgba(0,140,255,0.15)',
        }}>
          {String(progress).padStart(3, '0')}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginTop: 16,
        }}>
          <div style={{ width: 28, height: 1, background: 'rgba(0,140,255,0.6)' }} />
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem',
            letterSpacing: '0.24em', textTransform: 'uppercase',
            color: 'rgba(0,140,255,0.8)',
          }}>
            {phaseLabel}
          </div>
        </div>
      </div>

      {/* Progress bar — glowing fill */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.06)', zIndex: 10 }}>
        <div style={{
          height: '100%', width: `${progress}%`, background: 'linear-gradient(to right, #0055cc, #008CFF)',
          boxShadow: '0 0 20px rgba(0,140,255,1)', transition: 'width 0.06s linear',
        }} />
      </div>

      <style>{`
        @keyframes letterFlip3d {
          from { opacity: 0; transform: perspective(1200px) rotateX(80deg) translateY(20px); }
          to   { opacity: 1; transform: perspective(1200px) rotateX(0deg) translateY(0); }
        }
      `}</style>
    </div>
  )
}
