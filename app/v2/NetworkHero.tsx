'use client'

import { useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ── Constants ─────────────────────────────────────────────────────
const CREATOR_COUNT_DESKTOP = 6
const CREATOR_COUNT_MOBILE  = 4
const AUDIENCE_COUNT_DESKTOP = 60
const AUDIENCE_COUNT_MOBILE  = 22

// Creator orbital config [radius, speed (rad/s), phase offset, node size]
const CREATOR_ORBITS_DESKTOP = [
  [5.5, 0.18, 0.0,  0.55],
  [7.2, 0.12, 1.1,  0.85],
  [6.0, 0.22, 2.3,  0.60],
  [8.5, 0.09, 3.7,  1.00],
  [6.8, 0.16, 4.8,  0.70],
  [9.0, 0.07, 5.5,  0.90],
] as const
const CREATOR_ORBITS_MOBILE = CREATOR_ORBITS_DESKTOP.slice(0, 4)

// ── GLSL: Brand Node (sphere with Fresnel rim glow) ───────────────
const BRAND_VERT = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`
const BRAND_FRAG = /* glsl */`
  uniform float uTime;
  uniform vec3 cameraPos;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vec3 viewDir = normalize(cameraPos - vWorldPos);
    float rim = 1.0 - max(0.0, dot(normalize(vNormal), viewDir));
    float glow = pow(rim, 1.8);
    float pulse = 0.5 + 0.5 * sin(uTime * 1.1);
    float core = 1.0 - smoothstep(0.0, 0.7, rim);
    vec3 col = mix(
      mix(vec3(1.0, 0.97, 0.90), vec3(0.9, 0.98, 1.0), core),
      vec3(0.05, 0.55, 1.0),
      glow * 0.85
    );
    float a = core * (0.75 + 0.25 * pulse) + glow * 0.55;
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  }
`

// ── GLSL: Creator Nodes (instanced glowing spheres) ───────────────
const CREATOR_VERT = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying float vInstanceId;
  attribute float aInstanceId;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vInstanceId = aInstanceId;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`
const CREATOR_FRAG = /* glsl */`
  uniform float uTime;
  uniform vec3 cameraPos;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying float vInstanceId;
  void main() {
    vec3 viewDir = normalize(cameraPos - vWorldPos);
    float rim = 1.0 - max(0.0, dot(normalize(vNormal), viewDir));
    float glow = pow(rim, 2.0);
    float pulse = 0.5 + 0.5 * sin(uTime * 1.6 + vInstanceId * 1.2);
    float core = 1.0 - smoothstep(0.0, 0.65, rim);
    vec3 baseBlue  = vec3(0.0, 0.55, 1.0);
    vec3 brightBlue = vec3(0.5, 0.88, 1.0);
    vec3 col = mix(baseBlue, brightBlue, core * 0.7 + glow * 0.3);
    float a = core * (0.65 + 0.25 * pulse) + glow * 0.5;
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  }
`

// ── GLSL: Signal packets (bright moving sparks) ───────────────────
const PACKET_VERT = /* glsl */`
  attribute float aSize;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (280.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`
const PACKET_FRAG = /* glsl */`
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float core = 1.0 - smoothstep(0.0, 0.15, d);
    float glow = 1.0 - smoothstep(0.0, 0.5, d);
    vec3 col = mix(vec3(0.3, 0.78, 1.0), vec3(1.0, 1.0, 1.0), core * 0.8);
    gl_FragColor = vec4(col, core * 0.95 + glow * 0.4);
  }
`

// ── GLSL: Audience ripple rings ───────────────────────────────────
const RIPPLE_VERT = /* glsl */`
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const RIPPLE_FRAG = /* glsl */`
  uniform float uOpacity;
  void main() {
    gl_FragColor = vec4(0.0, 0.55, 1.0, uOpacity);
  }
`

// ── GLSL: Audience particles ──────────────────────────────────────
const AUDIENCE_VERT = /* glsl */`
  attribute float aPhase;
  attribute float aRadius;
  uniform float uTime;
  void main() {
    vec3 pos = position;
    pos.x += sin(uTime * 0.12 + aPhase * 2.1) * 0.35;
    pos.y += cos(uTime * 0.09 + aPhase * 1.7) * 0.25;
    pos.z += sin(uTime * 0.11 + aPhase * 1.3) * 0.28;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aRadius * (220.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`
const AUDIENCE_FRAG = /* glsl */`
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float a = 1.0 - smoothstep(0.1, 0.5, d);
    gl_FragColor = vec4(0.55, 0.80, 1.0, a * 0.18);
  }
`

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function randomSphereShell(minR: number, maxR: number) {
  const theta = Math.random() * Math.PI * 2
  const phi = Math.acos(2 * Math.random() - 1)
  const r = minR + Math.random() * (maxR - minR)
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  )
}

/** Catmull-Rom arc from A → B with a mid-point lifted perpendicularly */
function buildSignalPath(from: THREE.Vector3, to: THREE.Vector3, lift = 2.5): THREE.CatmullRomCurve3 {
  const mid = from.clone().lerp(to, 0.5)
  const perp = new THREE.Vector3().crossVectors(to.clone().sub(from), new THREE.Vector3(0, 1, 0.4)).normalize()
  mid.addScaledVector(perp, lift)
  return new THREE.CatmullRomCurve3([from, mid, to])
}

// ─────────────────────────────────────────────────────────────────
// Brand node
// ─────────────────────────────────────────────────────────────────
function BrandNode() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t
      matRef.current.uniforms.cameraPos.value.copy(camera.position)
    }
    if (meshRef.current) {
      const s = 1 + Math.sin(t * 1.2) * 0.04
      meshRef.current.scale.setScalar(s)
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.7, 48, 48]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={BRAND_VERT}
        fragmentShader={BRAND_FRAG}
        uniforms={{ uTime: { value: 0 }, cameraPos: { value: new THREE.Vector3() } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.FrontSide}
      />
    </mesh>
  )
}

// ─────────────────────────────────────────────────────────────────
// Creator orbit nodes + signal packets + ripples
// ─────────────────────────────────────────────────────────────────
function CreatorConstellation({ isMobile }: { isMobile: boolean }) {
  const { camera } = useThree()

  const orbits = isMobile ? CREATOR_ORBITS_MOBILE : CREATOR_ORBITS_DESKTOP
  const creatorCount = orbits.length
  const rippleCount = isMobile ? 0 : creatorCount * 2

  // ── Creator instanced mesh ──────────────────────────────────────
  const isMat = useRef<THREE.ShaderMaterial>(null)
  const instancedRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const instanceIds = useMemo(() => {
    const arr = new Float32Array(creatorCount)
    for (let i = 0; i < creatorCount; i++) arr[i] = i
    return arr
  }, [creatorCount])

  // ── Signal packets — plain state array, no nested useRef ────────
  const packetState = useRef(
    orbits.map(() => ({ t: Math.random(), speed: 0.28 + Math.random() * 0.14 }))
  )
  const packetGeos = useMemo(() =>
    orbits.map(() => {
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3))
      g.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array([3.5]), 1))
      return g
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [creatorCount])
  const packetMats = useMemo(() =>
    orbits.map(() => new THREE.ShaderMaterial({
      vertexShader: PACKET_VERT,
      fragmentShader: PACKET_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [creatorCount])

  // ── Audience ripples — refs array, no nested useRef ─────────────
  const rippleState = useRef(
    Array.from({ length: rippleCount }, (_, i) => ({
      t: Math.random(),
      speed: 0.22 + Math.random() * 0.1,
      creatorIdx: Math.floor(i / 2),
    }))
  )
  // Plain mutable array of Three.js objects — assigned via ref callbacks in JSX
  const rippleMeshes = useRef<(THREE.Mesh | null)[]>(Array(rippleCount).fill(null))
  const rippleMats = useMemo(() =>
    Array.from({ length: rippleCount }, () => new THREE.ShaderMaterial({
      vertexShader: RIPPLE_VERT,
      fragmentShader: RIPPLE_FRAG,
      uniforms: { uOpacity: { value: 0.25 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })),
  [rippleCount])

  // ── Audience particles ──────────────────────────────────────────
  const { audPosArr, audPhaseArr, audRadArr } = useMemo(() => {
    const n = isMobile ? AUDIENCE_COUNT_MOBILE : AUDIENCE_COUNT_DESKTOP
    const audPosArr   = new Float32Array(n * 3)
    const audPhaseArr = new Float32Array(n)
    const audRadArr   = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const p = randomSphereShell(11.5, 17)
      audPosArr[i*3]=p.x; audPosArr[i*3+1]=p.y; audPosArr[i*3+2]=p.z
      audPhaseArr[i] = Math.random() * Math.PI * 2
      audRadArr[i]   = 1.5 + Math.random() * 2.5
    }
    return { audPosArr, audPhaseArr, audRadArr }
  }, [isMobile])

  const audGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(audPosArr, 3))
    g.setAttribute('aPhase',   new THREE.BufferAttribute(audPhaseArr, 1))
    g.setAttribute('aRadius',  new THREE.BufferAttribute(audRadArr, 1))
    return g
  }, [audPosArr, audPhaseArr, audRadArr])

  const audMat = useRef<THREE.ShaderMaterial>(null)

  // ── Creator world positions (updated each frame) ────────────────
  const creatorPositions = useRef<THREE.Vector3[]>(orbits.map(() => new THREE.Vector3()))

  // ── Frame loop ──────────────────────────────────────────────────
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Update creator orbit positions
    if (instancedRef.current && isMat.current) {
      isMat.current.uniforms.uTime.value = t
      isMat.current.uniforms.cameraPos.value.copy(camera.position)

      for (let i = 0; i < creatorCount; i++) {
        const [r, speed, phase, size] = orbits[i]
        const angle = t * speed + phase
        const tilt  = (i % 2 === 0 ? 0.3 : -0.25) * (i * 0.15)
        const x = Math.cos(angle) * r
        const y = Math.sin(angle * 0.6 + phase) * r * 0.35 + tilt
        const z = Math.sin(angle) * r * 0.85
        creatorPositions.current[i].set(x, y, z)
        dummy.position.set(x, y, z)
        dummy.scale.setScalar(size)
        dummy.updateMatrix()
        instancedRef.current.setMatrixAt(i, dummy.matrix)
      }
      instancedRef.current.instanceMatrix.needsUpdate = true
    }

    // Update signal packets along Catmull-Rom curves
    packetState.current.forEach((p, i) => {
      p.t = (p.t + p.speed * 0.008) % 1
      const creatorPos = creatorPositions.current[i]
      const curve = buildSignalPath(new THREE.Vector3(0, 0, 0), creatorPos, 2.2)
      const pt = curve.getPoint(p.t)
      const pos = packetGeos[i].attributes.position as THREE.BufferAttribute
      ;(pos.array as Float32Array)[0] = pt.x
      ;(pos.array as Float32Array)[1] = pt.y
      ;(pos.array as Float32Array)[2] = pt.z
      pos.needsUpdate = true
    })

    // Update audience ripples
    if (!isMobile) {
      rippleState.current.forEach((r, i) => {
        const mesh = rippleMeshes.current[i]
        const mat  = rippleMats[i]
        if (!mesh) return
        r.t = (r.t + r.speed * 0.006) % 1
        const creatorPos = creatorPositions.current[r.creatorIdx]
        mesh.position.copy(creatorPos)
        mesh.lookAt(camera.position)
        mesh.scale.setScalar(1 + r.t * 3.5)
        mat.uniforms.uOpacity.value = (1 - r.t) * 0.28
      })
    }

    // Update audience particles
    if (audMat.current) audMat.current.uniforms.uTime.value = t
  })

  return (
    <>
      {/* Creator instanced spheres */}
      <instancedMesh ref={instancedRef} args={[undefined, undefined, creatorCount]}>
        <sphereGeometry args={[1, 20, 20]}>
          <instancedBufferAttribute attach="attributes-aInstanceId" args={[instanceIds, 1]} />
        </sphereGeometry>
        <shaderMaterial
          ref={isMat}
          vertexShader={CREATOR_VERT}
          fragmentShader={CREATOR_FRAG}
          uniforms={{ uTime: { value: 0 }, cameraPos: { value: new THREE.Vector3() } }}
          transparent depthWrite={false} blending={THREE.AdditiveBlending}
        />
      </instancedMesh>

      {/* Signal packets — one Points per creator, geometry updated in useFrame */}
      {packetGeos.map((geo, i) => (
        <points key={`pkt-${i}`} geometry={geo} material={packetMats[i]} />
      ))}

      {/* Audience ripple rings — ref callback assigns mesh into plain array */}
      {!isMobile && rippleMats.map((mat, i) => (
        <mesh
          key={`rpl-${i}`}
          ref={(el) => { rippleMeshes.current[i] = el }}
        >
          <ringGeometry args={[0.85, 1.0, 48]} />
          <primitive object={mat} attach="material" />
        </mesh>
      ))}

      {/* Audience particles */}
      <points geometry={audGeo}>
        <shaderMaterial
          ref={audMat}
          vertexShader={AUDIENCE_VERT}
          fragmentShader={AUDIENCE_FRAG}
          uniforms={{ uTime: { value: 0 } }}
          transparent depthWrite={false} blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────
// Camera controller (mouse + touch parallax + auto-orbit)
// ─────────────────────────────────────────────────────────────────
function CameraController({ mouseRef }: { mouseRef: React.MutableRefObject<{ tx: number; ty: number; tz: number; cx: number; cy: number; cz: number }> }) {
  const autoRotY = useRef(0)
  useFrame(({ camera }) => {
    const m = mouseRef.current
    const lerp = 0.035
    m.cx += (m.tx - m.cx) * lerp
    m.cy += (m.ty - m.cy) * lerp
    m.cz += (m.tz - m.cz) * lerp

    autoRotY.current += 0.0009
    camera.position.x = Math.sin(autoRotY.current) * 0.8 + m.cx * 2.5
    camera.position.y = 2.5 + m.cy * 1.5
    camera.position.z = 22 + m.cz
    camera.lookAt(0, 0.5, 0)
  })
  return null
}

// ─────────────────────────────────────────────────────────────────
// Scene wrapper
// ─────────────────────────────────────────────────────────────────
function CreatorGalaxy({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      <color attach="background" args={['#040810']} />
      <BrandNode />
      <CreatorConstellation isMobile={isMobile} />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────
export function NetworkHero() {
  const mouse = useRef({ tx: 0, ty: 0, tz: 0, cx: 0, cy: 0, cz: 0 })
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  useEffect(() => {
    const mouseFn = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      mouse.current.tx = nx * 1.2
      mouse.current.ty = -ny * 0.8
      mouse.current.tz = ny * 2.0
    }
    const touchFn = (e: TouchEvent) => {
      const touch = e.touches[0]
      const nx = touch.clientX / window.innerWidth - 0.5
      const ny = touch.clientY / window.innerHeight - 0.5
      mouse.current.tx = nx * 1.2
      mouse.current.ty = -ny * 0.8
      mouse.current.tz = ny * 2.0
    }
    window.addEventListener('mousemove', mouseFn)
    window.addEventListener('touchmove', touchFn, { passive: true })
    return () => {
      window.removeEventListener('mousemove', mouseFn)
      window.removeEventListener('touchmove', touchFn)
    }
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 2.5, 22], fov: 52 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 2)}
    >
      <CreatorGalaxy isMobile={isMobile} />
      <CameraController mouseRef={mouse} />
    </Canvas>
  )
}
