'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function HeroThreeCanvas() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount || typeof window === 'undefined') return

    // ── Scene ──────────────────────────────────────────────────
    const scene = new THREE.Scene()

    // ── Camera ─────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      42,
      mount.clientWidth / mount.clientHeight,
      0.1,
      200
    )
    camera.position.set(-1.2, 0.6, 9.5)
    camera.lookAt(2.2, -0.2, 0)

    // ── Renderer ───────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    renderer.shadowMap.enabled = false
    renderer.domElement.style.pointerEvents = 'none' // clicks pass through to UI
    mount.appendChild(renderer.domElement)

    // ── Environment (inline equirect gradient — no file needed) ─
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    pmremGenerator.compileEquirectangularShader()

    // Build a tiny 4×2 gradient texture as the env map
    const envCanvas = document.createElement('canvas')
    envCanvas.width = 256; envCanvas.height = 128
    const ctx = envCanvas.getContext('2d')!
    const grad = ctx.createLinearGradient(0, 0, 256, 128)
    grad.addColorStop(0, '#f5e8dc')
    grad.addColorStop(0.4, '#e8d5c4')
    grad.addColorStop(0.7, '#c8b8a8')
    grad.addColorStop(1, '#8a9ab5')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 256, 128)
    const envTex = new THREE.CanvasTexture(envCanvas)
    envTex.mapping = THREE.EquirectangularReflectionMapping
    const envMap = pmremGenerator.fromEquirectangular(envTex).texture
    scene.environment = envMap
    envTex.dispose()
    pmremGenerator.dispose()

    // ── Sphere ─────────────────────────────────────────────────
    const sphereGeo = new THREE.SphereGeometry(2.9, 256, 256)
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xf8f0e8),
      metalness: 0.08,
      roughness: 0.03,
      transmission: 0.88,
      thickness: 2.0,
      ior: 1.45,
      iridescence: 1.0,
      iridescenceIOR: 1.55,
      iridescenceThicknessRange: [80, 900],
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      envMapIntensity: 2.2,
      sheen: 0.4,
      sheenRoughness: 0.3,
      sheenColor: new THREE.Color(0xffccaa),
    })
    const sphere = new THREE.Mesh(sphereGeo, sphereMat)
    sphere.position.set(2.6, -0.4, 0)
    scene.add(sphere)

    // ── Lights ─────────────────────────────────────────────────
    // Warm key light — upper left (mimics window light)
    const warmKey = new THREE.PointLight(0xffd9b0, 6, 25)
    warmKey.position.set(-6, 7, 6)
    scene.add(warmKey)

    // Cool fill — lower right (prismatic complement)
    const coolFill = new THREE.PointLight(0xb0d4ff, 4, 20)
    coolFill.position.set(9, -4, 4)
    scene.add(coolFill)

    // Rim top
    const rimTop = new THREE.DirectionalLight(0xfff5ee, 1.8)
    rimTop.position.set(1, 12, 6)
    scene.add(rimTop)

    // Subtle ambient
    const ambient = new THREE.AmbientLight(0xf5ede0, 0.7)
    scene.add(ambient)

    // Accent blue point — back left (iridescence kick)
    const accentBlue = new THREE.PointLight(0x66aaff, 2.5, 18)
    accentBlue.position.set(-4, -2, -3)
    scene.add(accentBlue)

    // ── Particles ──────────────────────────────────────────────
    const COUNT = 220
    const pPositions = new Float32Array(COUNT * 3)
    const pSizes = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      const r = 3.8 + Math.random() * 5.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pPositions[i * 3]     = 2.6 + r * Math.sin(phi) * Math.cos(theta)
      pPositions[i * 3 + 1] = -0.4 + r * Math.sin(phi) * Math.sin(theta)
      pPositions[i * 3 + 2] = r * Math.cos(phi) - 1.5
      pSizes[i] = 0.5 + Math.random() * 2.5
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3))
    pGeo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1))

    const pMat = new THREE.PointsMaterial({
      color: 0xc8a888,
      size: 0.055,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    // Larger, rarer dust motes
    const moteGeo = new THREE.BufferGeometry()
    const motePos = new Float32Array(40 * 3)
    for (let i = 0; i < 40; i++) {
      motePos[i * 3]     = 2.6 + (Math.random() - 0.5) * 14
      motePos[i * 3 + 1] = (Math.random() - 0.5) * 10
      motePos[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3))
    const moteMat = new THREE.PointsMaterial({
      color: 0xffe8d0,
      size: 0.12,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const motes = new THREE.Points(moteGeo, moteMat)
    scene.add(motes)

    // ── Mouse parallax ─────────────────────────────────────────
    let mouseX = 0, mouseY = 0
    let smoothX = 0, smoothY = 0
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Resize ─────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    // ── Animation loop ─────────────────────────────────────────
    let animId = 0
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Smooth lerp mouse
      smoothX += (mouseX - smoothX) * 0.035
      smoothY += (mouseY - smoothY) * 0.035

      // Sphere: slow breathing rotation + mouse tilt
      sphere.rotation.y = t * 0.07 + smoothX * 0.12
      sphere.rotation.x = smoothY * 0.09
      sphere.rotation.z = Math.sin(t * 0.15) * 0.018

      // Sphere subtle float
      sphere.position.y = -0.4 + Math.sin(t * 0.4) * 0.08

      // Particles slow orbit
      particles.rotation.y = t * 0.02
      particles.rotation.x = t * 0.01
      motes.rotation.y = -t * 0.015
      motes.rotation.z = t * 0.008

      // Lights animate — warm/cool pulse
      warmKey.intensity = 6 + Math.sin(t * 0.6) * 0.8
      coolFill.intensity = 4 + Math.cos(t * 0.5) * 0.6

      // Camera parallax
      camera.position.x = -1.2 + smoothX * 0.45
      camera.position.y =  0.6 + smoothY * 0.35
      camera.lookAt(2.2, -0.2, 0)

      renderer.render(scene, camera)
    }
    animate()

    // ── Cleanup ────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      sphereGeo.dispose()
      sphereMat.dispose()
      pGeo.dispose()
      pMat.dispose()
      moteGeo.dispose()
      moteMat.dispose()
      envMap.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
      }}
    />
  )
}
