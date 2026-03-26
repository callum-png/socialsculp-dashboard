'use client'

import { useRef, useState } from 'react'
import { View, PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Service geometry types
const GEOMETRIES = {
  seeding:   () => new THREE.TorusKnotGeometry(0.85, 0.28, 180, 20),
  narrative: () => new THREE.IcosahedronGeometry(1.05, 2),
  media:     () => new THREE.OctahedronGeometry(1.1, 2),
  mgmt:      () => new THREE.DodecahedronGeometry(1.0, 1),
  strategy:  () => new THREE.TorusGeometry(0.9, 0.32, 32, 80),
  analytics: () => new THREE.CylinderGeometry(0.4, 0.8, 1.6, 40, 1),
}

type GeoType = keyof typeof GEOMETRIES

// Iridescent material shader
const SVC_VERT = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
const SVC_FRAG = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewDir;
  uniform float uTime;
  uniform vec3 uBaseColor;

  vec3 iridescence(float angle, float time) {
    float shift = angle + time * 0.3;
    float r = 0.5 + 0.5 * sin(shift * 6.2 + 0.0);
    float g = 0.5 + 0.5 * sin(shift * 6.2 + 2.1);
    float b = 0.5 + 0.5 * sin(shift * 6.2 + 4.2);
    return vec3(r, g, b);
  }

  void main() {
    float fresnel = 1.0 - max(dot(vNormal, vViewDir), 0.0);
    fresnel = pow(fresnel, 2.0);

    vec3 iriCol = iridescence(fresnel, uTime);
    vec3 col = mix(uBaseColor, iriCol, fresnel * 0.7);

    float rim = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.5);
    col += vec3(0.0, 0.55, 1.0) * rim * 0.6;

    vec3 light = normalize(vec3(1.5, 2.0, 3.0));
    float diff = max(dot(vNormal, light), 0.0) * 0.5;
    col = col * (0.4 + diff);

    gl_FragColor = vec4(col, 1.0);
  }
`

function ServiceMesh({ type, hovered }: { type: GeoType; hovered: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.ShaderMaterial>(null)
  const currentSpeed = useRef(0.004)

  const geo = useRef(GEOMETRIES[type]())

  const baseColors: Record<GeoType, [number, number, number]> = {
    seeding:   [0.0, 0.28, 0.6],
    narrative: [0.04, 0.06, 0.2],
    media:     [0.0, 0.18, 0.5],
    mgmt:      [0.02, 0.1, 0.3],
    strategy:  [0.0, 0.22, 0.55],
    analytics: [0.03, 0.14, 0.4],
  }

  useFrame(({ clock }) => {
    if (!mesh.current || !mat.current) return
    mat.current.uniforms.uTime.value = clock.getElapsedTime()

    const target = hovered ? 0.022 : 0.004
    currentSpeed.current += (target - currentSpeed.current) * 0.06

    mesh.current.rotation.y += currentSpeed.current
    mesh.current.rotation.x += currentSpeed.current * 0.4

    if (hovered) {
      mesh.current.rotation.x += Math.sin(clock.getElapsedTime() * 2) * 0.002
    }
  })

  const [r, g, b] = baseColors[type]

  return (
    <mesh ref={mesh} geometry={geo.current}>
      <shaderMaterial
        ref={mat}
        vertexShader={SVC_VERT}
        fragmentShader={SVC_FRAG}
        uniforms={{
          uTime: { value: 0 },
          uBaseColor: { value: new THREE.Color(r, g, b) },
        }}
      />
    </mesh>
  )
}

// View IS the element — no wrapper needed, it fills the .v2-svc-3d container
export function ScrollScene({ type }: { type: GeoType }) {
  const [hovered, setHovered] = useState(false)

  return (
    <View
      style={{ width: '100%', height: '100%', display: 'block' }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 3.5]} fov={45} />
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#66aaff" />
      <pointLight position={[-4, -3, 2]} intensity={0.8} color="#0055ff" />
      <ServiceMesh type={type} hovered={hovered} />
    </View>
  )
}
