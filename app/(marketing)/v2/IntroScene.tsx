'use client'

import { useEffect, useRef, useState, useMemo, Suspense, Component, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'

// Error boundary so a font-load failure doesn't crash the whole app
class Text3DErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error) {
    console.warn('[IntroScene] Text3D failed to load:', error.message)
  }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

// ── Duration ──────────────────────────────────────────────────
const INTRO_DURATION = 2800 // ms
const NODE_COUNT = 55
const SPHERE_RADIUS = 9
const MIN_DIST = 2.3
const CONNECTION_RADIUS = 4.2

// ── GLSL: Nodes ───────────────────────────────────────────────
const NODE_VERT = /* glsl */`
  attribute float aActive;
  varying float vActive;
  void main() {
    vActive = aActive;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // Large halo point — the fragment shader does the glow falloff
    gl_PointSize = mix(6.0, 52.0, vActive) * (300.0 / -mv.z);
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

    float pulse = sin(uTime * 2.6) * 0.08 * vActive;

    // Three-layer glow — core / mid / wide outer halo
    float core  = 1.0 - smoothstep(0.0,  0.07, d);
    float mid   = 1.0 - smoothstep(0.07, 0.22, d);
    float outer = 1.0 - smoothstep(0.18, 0.50, d);

    vec3 dormant = vec3(0.18, 0.35, 0.75);
    vec3 active  = vec3(0.05, 0.72, 1.0);
    vec3 hot     = vec3(0.92, 0.98, 1.0);

    vec3 col = mix(dormant, active, vActive);
    col = mix(col, hot, core * vActive * 0.9);

    // Additive alpha: core burns white, mid glows blue, outer halos wide
    float a = core * 1.0
            + mid   * 0.85 * (0.35 + vActive * 0.65)
            + outer * 0.70 * vActive
            + pulse;
    // Dormant nodes stay faintly visible
    a = clamp(a, 0.55 * core + 0.12 * (1.0 - vActive), 1.0);

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
    if (vActive < 0.015) discard;
    // Dormant edges faintly visible; active edges bright blue
    vec3 dormant = vec3(0.06, 0.16, 0.40);
    vec3 active  = vec3(0.08, 0.62, 1.0);
    vec3 col = mix(dormant, active, smoothstep(0.1, 0.8, vActive));
    float a = mix(0.18, 0.92, smoothstep(0.05, 0.9, vActive));
    gl_FragColor = vec4(col, a);
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

// ── R3F: Brand lights (only mounted when text is showing) ──────
function BrandLights() {
  return (
    <>
      <pointLight position={[0, 8, 12]}  intensity={4}   color="#ffffff" />
      <pointLight position={[-10, 2, 8]} intensity={3}   color="#008CFF" />
      <pointLight position={[10, -3, 6]} intensity={1.5} color="#40c4ff" />
    </>
  )
}

// ── R3F: 3D extruded SOCIALSCULP title card ────────────────────
function BrandText3D({ showTextRef, textScale }: { showTextRef: React.MutableRefObject<boolean>; textScale: number }) {
  const groupRef      = useRef<THREE.Group>(null)
  const matRef        = useRef<THREE.MeshStandardMaterial>(null)
  const revealStart   = useRef(0)
  const revealDoneRef = useRef(false)

  useFrame(({ clock }) => {
    if (!groupRef.current || !matRef.current) return
    if (!showTextRef.current) {
      groupRef.current.visible = false
      return
    }
    groupRef.current.visible = true
    const t = clock.getElapsedTime()

    // Track when reveal started
    if (revealStart.current === 0) revealStart.current = t
    const elapsed = t - revealStart.current

    // Entrance: dramatic zoom from far behind (2.5s ease-out)
    const entranceT = Math.min(elapsed / 2.5, 1)
    const eased = 1 - Math.pow(1 - entranceT, 4) // quartic ease-out

    if (!revealDoneRef.current) {
      // Scale: 0.15 → 1 (starts small and far, punches forward)
      const scale = 0.15 + eased * 0.85
      groupRef.current.scale.setScalar(scale)
      // Z position: push from behind → 0
      groupRef.current.position.z = -12 * (1 - eased)
      // Rotate from angled to face-on
      groupRef.current.rotation.y = -0.4 * (1 - eased)
      groupRef.current.rotation.x = 0.15 * (1 - eased)
      // Opacity ramp (via emissive intensity)
      matRef.current.opacity = eased
      if (entranceT >= 1) revealDoneRef.current = true
    }

    // Idle: lock in place — no movement after reveal
    if (revealDoneRef.current) {
      groupRef.current.rotation.y = 0
      groupRef.current.rotation.z = 0
      groupRef.current.position.y = 0.2
    }

    // Emissive: subtle glow pulse only
    matRef.current.emissiveIntensity = revealDoneRef.current ? 0.4 : 0.3 + eased * 0.3
  })

  return (
    <group ref={groupRef} scale={0}>
      <Center>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={1.4 * textScale}
          height={0.42 * textScale}
          bevelEnabled
          bevelSize={0.03}
          bevelThickness={0.025}
          bevelSegments={8}
          curveSegments={16}
        >
          SOCIALSCULP
          <meshStandardMaterial
            ref={matRef}
            color="#F0E6DE"
            emissive="#008CFF"
            emissiveIntensity={0.4}
            metalness={0.85}
            roughness={0.08}
            transparent
            opacity={0}
          />
        </Text3D>
      </Center>
    </group>
  )
}

// ── Scene — group rotates slowly on Y ─────────────────────────
function Scene({ nodes, edges, activRef, edgeActivRef, pRef, showTextRef, textScale }: {
  nodes: THREE.Vector3[]
  edges: [number, number][]
  activRef: React.MutableRefObject<Float32Array>
  edgeActivRef: React.MutableRefObject<Float32Array>
  pRef: React.MutableRefObject<number>
  showTextRef: React.MutableRefObject<boolean>
  textScale: number
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
      <BrandLights />
      <Camera pRef={pRef} />
    </>
  )
}

// ── IntroScene (export) ───────────────────────────────────────
export function IntroScene({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const [mounted, setMounted] = useState(true)
  const [sceneReady, setSceneReady] = useState(false)

  // Responsive 3D text scale — shrinks on narrow viewports
  const [textScale, setTextScale] = useState(1)
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setTextScale(w < 480 ? 0.45 : w < 768 ? 0.6 : w < 1024 ? 0.8 : 1)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Store callback in ref — prevents animation effect from restarting when
  // parent re-renders and creates a new function reference
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  const activRef = useRef(new Float32Array(NODE_COUNT))
  const edgeActivRef = useRef(new Float32Array(0))
  const pRef = useRef(0)
  const showTextRef = useRef(false)

  // Defer heavy computation to after first paint so counter shows instantly
  const nodesRef = useRef<THREE.Vector3[]>([])
  const edgesRef = useRef<[number, number][]>([])
  const levelsRef = useRef<number[][]>([])

  useEffect(() => {
    setSceneReady(false)
    setProgress(0)
    setFading(false)
    setMounted(true)

    const activ = activRef.current
    const start = performance.now()
    let raf: number

    // Counter starts immediately — no waiting for node computation
    const tick = () => {
      const pct = Math.min(100, ((performance.now() - start) / INTRO_DURATION) * 100)
      pRef.current = pct
      setProgress(Math.floor(pct))
      showTextRef.current = pct >= 70

      const ns = nodesRef.current
      const es = edgesRef.current
      const ls = levelsRef.current

      // Network animation only runs once nodes are computed
      if (ns.length > 0) {
        if (pct < 15) {
          const n = Math.floor((pct / 15) * ns.length)
          for (let i = 0; i < ns.length; i++) {
            const t = i < n ? 0.32 : 0
            activ[i] += (t - activ[i]) * 0.14
          }
        } else if (pct < 70) {
          const sp = (pct - 15) / 55
          const lp = sp * ls.length
          for (let l = 0; l < ls.length; l++) {
            const raw = Math.max(0, Math.min(1, lp - l))
            const smooth = raw * raw * (3 - 2 * raw)
            const target = l === 0 ? 1.0 : smooth > 0.05 ? 0.28 + smooth * 0.72 : 0.32
            for (const idx of ls[l]) activ[idx] += (target - activ[idx]) * 0.10
          }
          es.forEach(([a, b], i) => {
            const t = Math.min(activ[a], activ[b]) * 1.2
            edgeActivRef.current[i] += (t - edgeActivRef.current[i]) * 0.11
          })
        } else {
          for (let i = 0; i < ns.length; i++) activ[i] += (1.0 - activ[i]) * 0.06
          es.forEach((_, i) => { edgeActivRef.current[i] += (0.85 - edgeActivRef.current[i]) * 0.06 })
        }
      }

      if (pct < 100) {
        raf = requestAnimationFrame(tick)
      } else {
        setTimeout(() => {
          setFading(true)
          setTimeout(() => { setMounted(false); onCompleteRef.current() }, 1000)
        }, 300)
      }
    }
    raf = requestAnimationFrame(tick)

    // Compute nodes after first paint — canvas renders once ready
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

    return () => { cancelAnimationFrame(raf); clearTimeout(id) }
  }, [])

  if (!mounted) return null

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
          <Scene nodes={nodesRef.current} edges={edgesRef.current} activRef={activRef} edgeActivRef={edgeActivRef} pRef={pRef} showTextRef={showTextRef} textScale={textScale} />
        </Canvas>
      )}

      {/* CSS ambient bloom — radial glow expands as network activates */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: `radial-gradient(ellipse ${40 + progress * 0.5}% ${25 + progress * 0.3}% at 55% 48%,
          rgba(0,140,255,${0.04 + progress * 0.0006}) 0%,
          rgba(0,80,200,${0.03 + progress * 0.0003}) 40%,
          transparent 75%)`,
      }} />

      {/* Scan line — descends from top at 0.25x progress speed */}
      <div style={{
        position: 'absolute', left: 0, right: 0, zIndex: 9, pointerEvents: 'none',
        top: `${Math.min(progress * 1.1, 100)}%`,
        height: 2,
        background: 'linear-gradient(to right, transparent 0%, rgba(0,140,255,0.4) 15%, rgba(0,180,255,1) 50%, rgba(0,140,255,0.4) 85%, transparent 100%)',
        boxShadow: '0 0 18px 3px rgba(0,140,255,0.7), 0 0 40px 8px rgba(0,100,255,0.3)',
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

      {/* Counter — centred on screen */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        zIndex: 10,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic', fontWeight: 300,
          fontSize: 'clamp(2rem, 9vw, 7rem)',
          color: 'rgba(240,230,222,0.9)', lineHeight: 0.82, letterSpacing: '-0.04em',
          textShadow: '0 0 80px rgba(0,140,255,0.15)',
        }}>
          {String(progress).padStart(3, '0')}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 16,
        }}>
          <div style={{ width: 28, height: 1, background: 'rgba(0,140,255,0.6)' }} />
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem',
            letterSpacing: '0.24em', textTransform: 'uppercase',
            color: 'rgba(0,140,255,0.8)',
          }}>
            {phaseLabel}
          </div>
          <div style={{ width: 28, height: 1, background: 'rgba(0,140,255,0.6)' }} />
        </div>
      </div>

      {/* Progress bar — glowing fill */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.05)', zIndex: 10 }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'linear-gradient(to right, #003db3, #008CFF, #40c4ff)',
          boxShadow: '0 0 16px 2px rgba(0,140,255,0.9), 0 0 40px rgba(0,100,255,0.4)',
          transition: 'width 0.06s linear',
        }} />
      </div>
    </div>
  )
}
