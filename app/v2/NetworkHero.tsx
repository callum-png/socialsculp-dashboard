'use client'

import { useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function genNodes(count: number, r: number, minD: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)]
  let t = 0
  while (pts.length < count && t++ < 20000) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const rad = Math.cbrt(Math.random()) * r
    const c = new THREE.Vector3(
      rad * Math.sin(phi) * Math.cos(theta),
      rad * Math.sin(phi) * Math.sin(theta),
      rad * Math.cos(phi)
    )
    if (pts.every(p => p.distanceTo(c) >= minD)) pts.push(c)
  }
  return pts
}

function genEdges(nodes: THREE.Vector3[], radius: number): [number, number][] {
  const edges: [number, number][] = []
  const seen = new Set<string>()
  for (let i = 0; i < nodes.length; i++) {
    const nb = nodes
      .map((n, j) => ({ j, d: nodes[i].distanceTo(n) }))
      .filter(({ j, d }) => j !== i && d <= radius)
      .sort((a, b) => a.d - b.d)
    for (const { j } of nb.slice(0, 2 + Math.floor(Math.random() * 2))) {
      const k = `${Math.min(i, j)}-${Math.max(i, j)}`
      if (!seen.has(k)) { seen.add(k); edges.push([i, j]) }
    }
  }
  return edges
}

// Nodes — boosted brightness to compensate for no post-processing bloom
const HERO_NODE_VERT = /* glsl */`
  attribute float aPhase;
  varying float vPhase;
  void main() {
    vPhase = aPhase;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (9.0 + sin(aPhase) * 4.5) * (280.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`
const HERO_NODE_FRAG = /* glsl */`
  varying float vPhase;
  uniform float uTime;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float core = 1.0 - smoothstep(0.0, 0.12, d);
    float glow = 1.0 - smoothstep(0.12, 0.5, d);
    float pulse = 0.5 + 0.5 * sin(uTime * 0.6 + vPhase);
    vec3 dormant = vec3(0.0, 0.25, 0.6);
    vec3 active  = vec3(0.35, 0.80, 1.0);
    vec3 col = mix(dormant, active, pulse * 0.6);
    // Larger, brighter glow ring — simulates bloom without post-processing
    float a = (core * 0.95 + glow * 0.55) * (0.55 + 0.45 * pulse);
    gl_FragColor = vec4(col, a);
  }
`
const HERO_EDGE_VERT = /* glsl */`
  varying float vDummy;
  void main() { vDummy = 0.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
// Brighter edges: 0.45 opacity, more visible connection lines
const HERO_EDGE_FRAG = /* glsl */`
  varying float vDummy;
  void main() { gl_FragColor = vec4(0.05, 0.5, 0.95, 0.45 + vDummy); }
`

function HeroNetwork({ nodesData, edgesData }: { nodesData: THREE.Vector3[], edgesData: [number, number][] }) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const groupRef = useRef<THREE.Group>(null)

  const { nodePosArr, edgePosArr, phaseArr } = useMemo(() => {
    const nodePosArr = new Float32Array(nodesData.length * 3)
    const phaseArr = new Float32Array(nodesData.length)
    nodesData.forEach((p, i) => {
      nodePosArr[i*3]=p.x; nodePosArr[i*3+1]=p.y; nodePosArr[i*3+2]=p.z
      phaseArr[i] = Math.random() * Math.PI * 2
    })
    const edgePosArr = new Float32Array(edgesData.length * 6)
    edgesData.forEach(([a, b], i) => {
      edgePosArr[i*6]=nodesData[a].x; edgePosArr[i*6+1]=nodesData[a].y; edgePosArr[i*6+2]=nodesData[a].z
      edgePosArr[i*6+3]=nodesData[b].x; edgePosArr[i*6+4]=nodesData[b].y; edgePosArr[i*6+5]=nodesData[b].z
    })
    return { nodePosArr, edgePosArr, phaseArr }
  }, [nodesData, edgesData])

  const nodeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(nodePosArr, 3))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phaseArr, 1))
    return g
  }, [nodePosArr, phaseArr])

  const edgeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(edgePosArr, 3))
    return g
  }, [edgePosArr])

  // Mouse: tx/ty/tz = targets, cx/cy/cz = current (smoothed)
  const mouse = useRef({ tx: 0, ty: 0, tz: 0, cx: 0, cy: 0, cz: 0 })
  const { camera } = useThree()

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5   // -0.5 → 0.5
      const ny = e.clientY / window.innerHeight - 0.5  // -0.5 → 0.5
      mouse.current.tx = nx * 1.4          // ±0.7 rad Y (dramatic horizontal)
      mouse.current.ty = -ny * 0.9         // ±0.45 rad X (dramatic vertical)
      mouse.current.tz = ny * 2.0          // camera Z: top=near, bottom=far
    }
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [])

  // Track auto-rotation separately so mouse Y offset doesn't fight it
  const autoRotY = useRef(0)

  useFrame(({ clock }) => {
    if (mat.current) mat.current.uniforms.uTime.value = clock.getElapsedTime()

    const m = mouse.current
    // Faster lerp = more responsive feel
    const lerp = 0.04
    m.cx += (m.tx - m.cx) * lerp
    m.cy += (m.ty - m.cy) * lerp
    m.cz += (m.tz - m.cz) * lerp

    // Auto-orbit: ~52 sec full rotation (clearly visible 3D movement)
    autoRotY.current += 0.0012

    if (groupRef.current) {
      groupRef.current.rotation.y = autoRotY.current + m.cx
      groupRef.current.rotation.x = m.cy
    }

    // Camera Z parallax: base=20, drifts ±2 with mouse Y
    camera.position.z = 20 + m.cz
    // Subtle camera X/Y shift for depth parallax
    camera.position.x += (-m.cx * 1.5 - camera.position.x) * 0.03
    camera.position.y += (m.cy * 1.0 - camera.position.y) * 0.03
  })

  return (
    <group ref={groupRef}>
      <points geometry={nodeGeo}>
        <shaderMaterial ref={mat} vertexShader={HERO_NODE_VERT} fragmentShader={HERO_NODE_FRAG}
          uniforms={{ uTime: { value: 0 } }} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <lineSegments geometry={edgeGeo}>
        <shaderMaterial vertexShader={HERO_EDGE_VERT} fragmentShader={HERO_EDGE_FRAG}
          uniforms={{ uTime: { value: 0 } }} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  )
}

export function NetworkHero() {
  const { nodes, edges } = useMemo(() => {
    const nodes = genNodes(45, 9, 2.5)
    const edges = genEdges(nodes, 4.0)
    return { nodes, edges }
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 3, 20], fov: 52 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#040810']} />
      <HeroNetwork nodesData={nodes} edgesData={edges} />
    </Canvas>
  )
}
