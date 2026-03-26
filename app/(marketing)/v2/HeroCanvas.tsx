'use client'
import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Config ────────────────────────────────────────────────────
const CYCLE_LEN = 3.5   // seconds per creator-send cycle

const CREATORS_DESKTOP: [number, number, number, string][] = [
  [-4.2,  1.8, -1.0, '#69C9D0'], // TikTok  teal
  [ 4.0,  2.2, -1.5, '#E1306C'], // Instagram pink
  [-5.0, -0.5, -0.5, '#69C9D0'], // TikTok
  [ 4.8, -0.8, -1.0, '#FF0000'], // YouTube  red
  [-3.0, -2.2, -0.5, '#E1306C'], // Instagram
  [ 3.2, -2.0, -1.5, '#69C9D0'], // TikTok
  [-1.5,  2.8, -2.0, '#FFFC00'], // Snapchat yellow
  [ 2.0, -2.8, -0.5, '#E1306C'], // Instagram
]

const CREATORS_MOBILE: [number, number, number, string][] = [
  [-2.8,  1.2, -0.5, '#69C9D0'],
  [ 2.8,  1.5, -1.0, '#E1306C'],
  [-3.2, -0.8, -0.5, '#69C9D0'],
  [ 3.0, -1.2, -0.5, '#FF0000'],
  [ 0.0, -2.5, -1.0, '#E1306C'],
]

// ─── GLSL ──────────────────────────────────────────────────────
const VERT = /* glsl */`
  attribute float aRole;
  attribute float aCreatorIdx;
  attribute float aPhaseOffset;
  attribute vec3  aStartPos;
  attribute vec3  aEndPos;
  attribute float aSize;
  attribute vec3  aColor;

  uniform float uTime;
  uniform float uCycleLen;
  uniform float uNCr;

  varying float vAlpha;
  varying vec3  vColor;

  float easeInOut(float t) {
    return t * t * (3.0 - 2.0 * t);
  }

  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = max(length(mv.xyz), 0.001);

    if (aRole < 0.5) {
      // Brand node
      float pulse = 0.85 + sin(uTime * 1.2) * 0.15;
      gl_PointSize = aSize * pulse * (300.0 / dist);
      gl_Position  = projectionMatrix * mv;
      vAlpha = 1.0;

    } else if (aRole < 1.5) {
      // Creator node
      float pulse = 0.65 + sin(uTime * 0.9 + aCreatorIdx * 1.3) * 0.35;
      gl_PointSize = aSize * pulse * (300.0 / dist);
      gl_Position  = projectionMatrix * mv;
      vAlpha = pulse;

    } else if (aRole < 2.5) {
      // Stream particle
      float activeC = mod(floor(uTime / uCycleLen), uNCr);
      float isMine  = 1.0 - step(0.5, abs(aCreatorIdx - activeC));
      float cycleT  = mod(uTime, uCycleLen) / uCycleLen;
      float pT      = clamp((cycleT - aPhaseOffset * 0.35) / 0.55, 0.0, 1.0);
      float smooth  = easeInOut(pT);
      vec3 pos      = mix(aStartPos, aEndPos, smooth);
      pos.y        += sin(pT * 3.14159) * 0.4;
      vec4 mv2      = modelViewMatrix * vec4(pos, 1.0);
      gl_Position   = projectionMatrix * mv2;
      gl_PointSize  = aSize * (300.0 / max(length(mv2.xyz), 0.001));
      vAlpha        = isMine * sin(pT * 3.14159);

    } else {
      // Burst particle
      float activeC = mod(floor(uTime / uCycleLen), uNCr);
      float isMine  = 1.0 - step(0.5, abs(aCreatorIdx - activeC));
      float cycleT  = mod(uTime, uCycleLen) / uCycleLen;
      float burstT  = clamp((cycleT - 0.55) / 0.45, 0.0, 1.0);
      float decel   = 1.0 - (1.0 - burstT) * (1.0 - burstT);
      vec3 pos      = aStartPos + aEndPos * decel * 2.8;
      pos.y        -= burstT * burstT * 0.6;
      vec4 mv2      = modelViewMatrix * vec4(pos, 1.0);
      gl_Position   = projectionMatrix * mv2;
      float fade    = (1.0 - burstT) * (1.0 - burstT);
      gl_PointSize  = aSize * fade * (300.0 / max(length(mv2.xyz), 0.001));
      vAlpha        = isMine * fade;
    }
  }
`

const FRAG = /* glsl */`
  varying float vAlpha;
  varying vec3  vColor;
  void main() {
    vec2  uv   = gl_PointCoord - 0.5;
    float d    = length(uv);
    if (d > 0.5) discard;
    float core = 1.0 - smoothstep(0.0,  0.12, d);
    float mid  = 1.0 - smoothstep(0.10, 0.32, d);
    float glow = 1.0 - smoothstep(0.20, 0.50, d);
    float a    = (core + mid * 0.55 + glow * 0.25) * vAlpha;
    vec3  col  = vColor + core * vec3(0.25);
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  }
`

// ─── Scene ────────────────────────────────────────────────────
function PropagationScene({ isMobile }: { isMobile: boolean }) {
  const mouseRef = useRef({ tx: 0, ty: 0, cx: 0, cy: 0 })
  const creators = isMobile ? CREATORS_MOBILE : CREATORS_DESKTOP
  const NC = creators.length

  const SP_PER_C = isMobile ? 5 : 8
  const BP_PER_C = isMobile ? 8 : 14
  const TOTAL    = 1 + NC + NC * SP_PER_C + NC * BP_PER_C

  // Line geometry: brand → each creator (static)
  const lineGeo = useMemo(() => {
    const pos = new Float32Array(NC * 2 * 3)
    for (let i = 0; i < NC; i++) {
      const [x, y, z] = creators[i]
      pos[i * 6 + 3] = x
      pos[i * 6 + 4] = y
      pos[i * 6 + 5] = z
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [NC, isMobile])

  // Point geometry: brand + creators (stream/burst slots zeroed — hidden by shader)
  const { geo, mat } = useMemo(() => {
    const pos   = new Float32Array(TOTAL * 3)
    const role  = new Float32Array(TOTAL)
    const cidx  = new Float32Array(TOTAL)
    const phase = new Float32Array(TOTAL)
    const start = new Float32Array(TOTAL * 3)
    const end_  = new Float32Array(TOTAL * 3)
    const size  = new Float32Array(TOTAL)
    const color = new Float32Array(TOTAL * 3)

    // Brand node at origin
    role[0]    = 0
    size[0]    = isMobile ? 64 : 52
    color[0]   = 1.0; color[1] = 0.96; color[2] = 0.93

    // Creator nodes
    for (let i = 0; i < NC; i++) {
      const idx = 1 + i
      const [x, y, z, hex] = creators[i]
      pos[idx * 3]     = x
      pos[idx * 3 + 1] = y
      pos[idx * 3 + 2] = z
      role[idx]  = 1
      cidx[idx]  = i
      size[idx]  = isMobile ? 18 : 13
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      color[idx * 3]     = r
      color[idx * 3 + 1] = g
      color[idx * 3 + 2] = b
    }

    // Stream particle slots (role=2, all zeros → hidden by shader until Task 2 fills them)
    const streamStart = 1 + NC
    for (let i = 0; i < NC * SP_PER_C; i++) {
      const idx = streamStart + i
      role[idx] = 2
    }

    // Burst particle slots (role=3, all zeros → hidden by shader until Task 3 fills them)
    const burstStart = 1 + NC + NC * SP_PER_C
    for (let i = 0; i < NC * BP_PER_C; i++) {
      const idx = burstStart + i
      role[idx] = 3
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position',     new THREE.BufferAttribute(pos,   3))
    g.setAttribute('aRole',        new THREE.BufferAttribute(role,  1))
    g.setAttribute('aCreatorIdx',  new THREE.BufferAttribute(cidx,  1))
    g.setAttribute('aPhaseOffset', new THREE.BufferAttribute(phase, 1))
    g.setAttribute('aStartPos',    new THREE.BufferAttribute(start, 3))
    g.setAttribute('aEndPos',      new THREE.BufferAttribute(end_,  3))
    g.setAttribute('aSize',        new THREE.BufferAttribute(size,  1))
    g.setAttribute('aColor',       new THREE.BufferAttribute(color, 3))

    const m = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      transparent:    true,
      depthWrite:     false,
      blending:       THREE.AdditiveBlending,
      uniforms: {
        uTime:     { value: 0 },
        uCycleLen: { value: CYCLE_LEN },
        uNCr:      { value: NC },
      },
    })

    return { geo: g, mat: m }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [NC, isMobile, TOTAL, SP_PER_C, BP_PER_C])

  // Mouse / touch tracking
  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mouseRef.current.tx =  (e.clientX / window.innerWidth  - 0.5) * 2.5
      mouseRef.current.ty = -(e.clientY / window.innerHeight - 0.5) * 1.5
    }
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      mouseRef.current.tx =  (t.clientX / window.innerWidth  - 0.5) * 2.5
      mouseRef.current.ty = -(t.clientY / window.innerHeight - 0.5) * 1.5
    }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('touchmove', onTouch, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [])

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime()
    mat.uniforms.uTime.value = t

    const m = mouseRef.current
    m.cx += (m.tx - m.cx) * 0.03
    m.cy += (m.ty - m.cy) * 0.03
    const autoX = Math.sin(t * 0.22) * 0.9
    camera.position.x = autoX + m.cx * 0.4
    camera.position.y = 2.0 + m.cy * 0.3
    camera.position.z = isMobile ? 15 : 13
    camera.lookAt(0, 0.5, 0)
  })

  return (
    <>
      <points geometry={geo} material={mat} />
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial
          color="#008CFF"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </>
  )
}

// ─── Export ────────────────────────────────────────────────────
export function HeroCanvas() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  return (
    <Canvas
      camera={{ position: [0, 2.0, 13], fov: 55 }}
      gl={{ antialias: !isMobile, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, isMobile ? 1 : 1.5]}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#040810']} />
      <PropagationScene isMobile={isMobile} />
    </Canvas>
  )
}
