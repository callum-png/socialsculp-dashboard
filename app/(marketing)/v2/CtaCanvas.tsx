'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── Platform colour palette ──────────────────────────────────
const PLATFORM_COLORS: [number, number, number][] = [
  [1.0, 0.0, 0.31],   // TikTok red
  [0.88, 0.19, 0.42], // Instagram
  [1.0, 0.99, 0.0],   // Snapchat
  [0.11, 0.63, 0.95], // Twitter/X
  [1.0, 0.0, 0.0],    // YouTube
]

const PARTICLE_COUNT = 360
const LOOP_DURATION  = 5.0  // seconds per full act cycle

// ── GLSL ─────────────────────────────────────────────────────
const VERT = /* glsl */`
  attribute float aPhase;
  attribute vec3  aColor;
  attribute vec3  aDir;
  attribute float aSpeed;
  attribute float aInDir;
  uniform float uLoopT;
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    float t = mod(uLoopT + aPhase, 1.0);

    vec3 pos = vec3(0.0);
    float alpha = 1.0;

    if (t < 0.50) {
      float r     = 18.0 * (1.0 - t / 0.50);
      float angle = aInDir + t * 6.28318 * 2.5;
      pos   = vec3(cos(angle) * r, sin(angle * 0.6) * r * 0.4, sin(angle) * r * 0.7);
      alpha = t / 0.50;
    } else if (t < 0.60) {
      alpha = 1.0;
    } else {
      float et = (t - 0.60) / 0.40;
      pos   = aDir * aSpeed * et * 22.0;
      alpha = 1.0 - smoothstep(0.5, 1.0, et);
    }

    vColor = aColor;
    vAlpha = alpha;
    vec4 mv  = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 3.5 * (220.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`

const FRAG = /* glsl */`
  varying vec3  vColor;
  varying float vAlpha;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float core = 1.0 - smoothstep(0.0, 0.15, d);
    float glow = 1.0 - smoothstep(0.0, 0.50, d);
    float a    = (core * 0.95 + glow * 0.35) * vAlpha;
    gl_FragColor = vec4(vColor + core * 0.4, a);
  }
`

// ── Particle Scene ────────────────────────────────────────────
function BurstScene() {
  const matRef  = useRef<THREE.ShaderMaterial>(null)
  const loopRef = useRef(0)

  const geo = useMemo(() => {
    const phase   = new Float32Array(PARTICLE_COUNT)
    const colors  = new Float32Array(PARTICLE_COUNT * 3)
    const dirs    = new Float32Array(PARTICLE_COUNT * 3)
    const speeds  = new Float32Array(PARTICLE_COUNT)
    const inDirs  = new Float32Array(PARTICLE_COUNT)
    const pos     = new Float32Array(PARTICLE_COUNT * 3)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      phase[i]  = Math.random()
      speeds[i] = 3 + Math.random() * 5
      inDirs[i] = Math.random() * Math.PI * 2

      const theta    = Math.random() * Math.PI * 2
      const phi      = Math.acos(2 * Math.random() - 1)
      dirs[i * 3]     = Math.sin(phi) * Math.cos(theta)
      dirs[i * 3 + 1] = Math.sin(phi) * Math.sin(theta)
      dirs[i * 3 + 2] = Math.cos(phi)

      const c = PLATFORM_COLORS[Math.floor(Math.random() * PLATFORM_COLORS.length)]
      colors[i * 3]     = c[0]
      colors[i * 3 + 1] = c[1]
      colors[i * 3 + 2] = c[2]
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos,    3))
    g.setAttribute('aPhase',   new THREE.BufferAttribute(phase,  1))
    g.setAttribute('aColor',   new THREE.BufferAttribute(colors, 3))
    g.setAttribute('aDir',     new THREE.BufferAttribute(dirs,   3))
    g.setAttribute('aSpeed',   new THREE.BufferAttribute(speeds, 1))
    g.setAttribute('aInDir',   new THREE.BufferAttribute(inDirs, 1))
    return g
  }, [])

  useFrame((_, delta) => {
    if (!matRef.current) return
    loopRef.current = (loopRef.current + delta / LOOP_DURATION) % 1
    matRef.current.uniforms.uLoopT.value = loopRef.current
  })

  return (
    <points geometry={geo}>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={{ uLoopT: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ── Export ────────────────────────────────────────────────────
export function CtaCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 18], fov: 65 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <BurstScene />
    </Canvas>
  )
}
