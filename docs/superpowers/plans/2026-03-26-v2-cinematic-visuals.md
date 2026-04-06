# SocialSculp v2 — Cinematic Visual Redesign

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two weakest visual moments on the v2 landing — the loading screen brand text and the CTA footer — with genuinely cinematic, story-telling 3D graphics that reflect SocialSculp's identity as a creator virality agency.

**Architecture:** Both visuals live inside the existing R3F (React Three Fiber) + drei setup. Section 1 (SOCIALSCULP text) renders inside the already-mounted IntroScene `<Canvas>` to avoid a second WebGL context. Section 2 (CTA) gets a dedicated `<Canvas>` as a full-bleed background — it's mounted only after the intro completes and is the only canvas on screen at that point (NetworkHero is above the fold, not simultaneously visible).

**Tech Stack:** `@react-three/fiber ^9.5`, `@react-three/drei ^10.7`, `three ^0.183`, `@react-three/postprocessing ^3.0.4`. Font: `/public/fonts/helvetiker_bold.typeface.json` (already copied). Files touch `app/(marketing)/v2/`.

---

## Visual Concepts

### Section 1 — SOCIALSCULP Signal Title Card

**The story:** The node network finishes illuminating (the creator signals have all connected). Then the brand name materialises from the light of the network itself — like a neon sign powering up from the energy that just flowed through the graph.

**Exact visual:**
- At progress = 70%: `Text3D` group fades in from scale 0.6 → 1.0 over ~0.6 seconds with a Y-rotation sweep from –15° → 0°. Feels like a physical panel rotating into place.
- Material: `MeshStandardMaterial` — cream base `#F0E6DE`, metalness 0.75, roughness 0.12. The front face has a blue emissive (`#008CFF`) at `emissiveIntensity 0.4` that pulses `0.2 → 0.6` using `sin(t)`.
- Bevel: `height 0.28` (real depth), `bevelEnabled`, `bevelSize 0.025`, `bevelThickness 0.02`, `bevelSegments 6`.
- Lighting (added to Scene): One `pointLight` at `[0, 8, 12]` intensity 4 white (key), one `pointLight` at `[-10, 2, 8]` intensity 3 `#008CFF` (blue rim), one `pointLight` at `[10, -3, 6]` intensity 1.5 `#40c4ff` (fill). These are inside `<BrandLights />` and are only mounted when `showText` is true — no impact on node rendering phase.
- The `S` in SCULP (index 6) has a separate emissiveIntensity of 1.0 and color `#008CFF` (pure brand accent, matches the S-highlight in the old HTML version).
- After reveal, text gently bobs: `position.y = sin(t * 0.7) * 0.06`, `rotation.y = sin(t * 0.4) * 0.04`.
- Camera during this phase already orbits at z≈18–20 looking at [0,0,0]. Text is placed at `[0, 0.5, 0]` (centre of scene) — it fills roughly 70% of viewport width at that camera distance, which is cinematic.

**Performance:** Uses the existing canvas — zero extra context. `Text3D` generates geometry once. Three new point lights, unmounted before progress 70%.

---

### Section 2 — CTA: "Viral Signal Burst"

**The story:** The CTA section is the climax of the page. The viewer has just learned how SocialSculp works (Brief → Seed → Scale). Now they see the result: content explodes outward from a single origin point across the globe, representing virality.

**Exact visual — three acts, looping:**

**Act 1 — Convergence (0–2.5s):** ~400 particles drift inward from the edges of the scene toward the centre. Each particle is a small glowing dot coloured by platform: TikTok `#ff0050`, Instagram `#e1306c`, Snapchat `#fffc00`, YouTube `#ff0000`, Twitter `#1da1f2`. They spiral in (helical inward paths via `sin/cos` with decaying radius). This visualises creators from every platform feeding content toward the brand.

**Act 2 — Flash (2.5–3.0s):** All particles converge to a bright white core at origin. A `PointLight` at [0,0,0] pulses from 0 → 20 intensity (blinding flash). The white core expands and contracts. This is the "seed" moment — the brand is loaded.

**Act 3 — Explosion (3.0–5.0s):** Particles detonate outward in all directions at high velocity, trailing off in opacity as they reach distance 20+. Velocity is stored per-particle as a unit direction vector × random speed (3–8). This is the "viral reach" — content going everywhere. Then loop.

**Implementation — single `BufferGeometry` Points, one ShaderMaterial, zero per-frame allocation:**
- `positions` Float32Array updated in `useFrame` — particles move along pre-computed direction vectors stored in a second Float32Array
- `aPhase` attribute per particle (0–1, random stagger) drives which act each particle is in
- `aColor` attribute (vec3) per particle — set at init based on platform bucket
- Vertex shader: reads position, outputs `gl_PointSize = aSize * (220.0 / -mv.z)`
- Fragment shader: soft circle discard + per-particle `aColor` with additive blending
- `loopT` uniform: 0→1 over 5s, reset. Each particle's `aPhase` offsets its position in the loop.
- `act` computed in vert shader: `loopT + aPhase` mod 1.0, branching on ranges 0–0.5 / 0.5–0.6 / 0.6–1.0
- Camera: fixed `[0, 0, 18]`, `fov 65`, no movement — the explosion should feel like it's coming AT the viewer.
- `pointLight` at [0,0,0] with `intensity = clamp((act - 0.5) / 0.1, 0, 1) * 18` — the flash.

**Canvas placement:** `position: absolute; inset: 0; z-index: 0` inside `.v2-cta`. Existing eyebrow/headline/buttons sit above it at `z-index: 1`. Canvas has `gl={{ alpha: true }}` so the dark section background shows through the sparse edges.

**CTA Typography redesign:** The "ugly" typography comes from using the same `font-style: italic` Cormorant Garamond that's used everywhere. For this section only, make the headline feel distinct:
- `"Let's Build"` — small, sans-serif (`DM Sans 300`), wide letter-spacing `0.15em`, all-caps, dim cream `rgba(240,230,222,0.55)`
- `"Something"` — massive, Cormorant Garamond italic, `clamp(5rem, 10vw, 11rem)`, full cream, the visual anchor
- `"Unforgettable."` — medium, Cormorant Garamond, outlined (`-webkit-text-stroke`), accent blue `#008CFF`
- This creates a 3-tier typographic hierarchy that feels deliberate and editorial, not repetitive.

**Remove:** The CSS orbital rings (`.v2-cta-rings` divs). They're decorative filler. The particle canvas replaces them.

---

## File Map

| File | Change |
|------|--------|
| `app/(marketing)/v2/IntroScene.tsx` | Add `Text3D`, `Center` imports; add `BrandText3D` + `BrandLights` components; mount inside existing `Scene`; pass `showText` bool via ref |
| `app/(marketing)/v2/CtaCanvas.tsx` | **New file** — particle burst canvas component |
| `app/(marketing)/v2/V2Client.tsx` | Import + use `CtaCanvas` in CTA section; remove `.v2-cta-rings` divs; update headline JSX structure |
| `app/(marketing)/v2/landing-v2.css` | Remove `.v2-cta-rings` CSS; add `.v2-cta-canvas-wrap` CSS; update CTA headline typography structure |
| `public/fonts/helvetiker_bold.typeface.json` | Already present ✓ |

---

## Task 1 — BrandText3D inside IntroScene

**Files:**
- Modify: `app/(marketing)/v2/IntroScene.tsx`

- [ ] **Step 1: Add drei import at top of IntroScene.tsx**
```tsx
import { Text3D, Center } from '@react-three/drei'
```

- [ ] **Step 2: Add `showTextRef` to Scene props and add BrandLights + BrandText3D components**

Add these components ABOVE the `Scene` function definition:

```tsx
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
function BrandText3D({ showTextRef }: { showTextRef: React.MutableRefObject<boolean> }) {
  const groupRef  = useRef<THREE.Group>(null)
  const matRef    = useRef<THREE.MeshStandardMaterial>(null)
  const scaleRef  = useRef(0)       // 0 → 1 reveal
  const rotYRef   = useRef(-0.28)   // -15deg → 0 reveal

  useFrame(({ clock }) => {
    if (!groupRef.current || !matRef.current) return
    if (!showTextRef.current) return
    const t = clock.getElapsedTime()

    // Reveal: lerp scale and rotation into place
    scaleRef.current  += (1    - scaleRef.current)  * 0.06
    rotYRef.current   += (0    - rotYRef.current)   * 0.06

    groupRef.current.scale.setScalar(scaleRef.current)
    groupRef.current.rotation.y = rotYRef.current

    // Idle float
    groupRef.current.position.y = 0.5 + Math.sin(t * 0.7) * 0.06

    // Emissive pulse
    matRef.current.emissiveIntensity = 0.28 + Math.sin(t * 1.4) * 0.14
  })

  return (
    <group ref={groupRef} scale={0}>
      <Center>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={0.9}
          height={0.28}
          bevelEnabled
          bevelSize={0.025}
          bevelThickness={0.02}
          bevelSegments={6}
          curveSegments={14}
        >
          SOCIALSCULP
          <meshStandardMaterial
            ref={matRef}
            color="#F0E6DE"
            emissive="#008CFF"
            emissiveIntensity={0.28}
            metalness={0.75}
            roughness={0.12}
          />
        </Text3D>
      </Center>
    </group>
  )
}
```

- [ ] **Step 3: Thread `showTextRef` into Scene and mount BrandText3D + BrandLights**

Update Scene signature and JSX:

```tsx
function Scene({ nodes, edges, activRef, edgeActivRef, pRef, showTextRef }: {
  nodes: THREE.Vector3[]
  edges: [number, number][]
  activRef: React.MutableRefObject<Float32Array>
  edgeActivRef: React.MutableRefObject<Float32Array>
  pRef: React.MutableRefObject<number>
  showTextRef: React.MutableRefObject<boolean>
}) {
  // ... existing code ...
  return (
    <>
      <color attach="background" args={['#040810']} />
      <group ref={groupRef}>
        <Nodes positions={positions} activRef={activRef} />
        <Edges nodes={nodes} edges={edges} edgeActivRef={edgeActivRef} />
      </group>
      {/* 3D brand text + lights — mounted permanently, activated via ref */}
      <BrandText3D showTextRef={showTextRef} />
      <BrandLights />
      <Camera pRef={pRef} />
    </>
  )
}
```

- [ ] **Step 4: Add `showTextRef` to IntroScene component and wire it up**

In `IntroScene`, add:
```tsx
const showTextRef = useRef(false)
```

In the render tick, where `showText` is computed:
```tsx
const showText = progress >= 70
showTextRef.current = showText
```

Pass it to Canvas > Scene:
```tsx
<Scene ... showTextRef={showTextRef} />
```

- [ ] **Step 5: Remove the HTML brand text overlay entirely**

Delete this JSX block (the `{showText && (<div ...>...SOCIALSCULP letters...</div>)}` block) and the `@keyframes letterFlip3d` style tag.

Also remove `const textCount = ...` computation — no longer needed.

- [ ] **Step 6: Test visually**

Open `localhost:3100/v2` — watch loading screen. At 70% the SOCIALSCULP text should rotate into view in 3D, metallic cream with blue glow, floating above the node network.

- [ ] **Step 7: Commit**
```bash
git add app/(marketing)/v2/IntroScene.tsx
git commit -m "feat: replace CSS brand text with drei Text3D title card in intro scene"
```

---

## Task 2 — CtaCanvas (Viral Signal Burst)

**Files:**
- Create: `app/(marketing)/v2/CtaCanvas.tsx`

- [ ] **Step 1: Create the file with particle system**

```tsx
'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── Platform colour palette ──────────────────────────────────
const PLATFORM_COLORS = [
  [1.0, 0.0, 0.31],  // TikTok red
  [0.88, 0.19, 0.42], // Instagram
  [1.0, 0.99, 0.0],   // Snapchat
  [0.11, 0.63, 0.95], // Twitter/X
  [1.0, 0.0, 0.0],    // YouTube
]

const PARTICLE_COUNT = 360
const LOOP_DURATION  = 5.0  // seconds per full act cycle

// ── GLSL ─────────────────────────────────────────────────────
const VERT = /* glsl */`
  attribute float aPhase;   // 0–1 stagger offset per particle
  attribute vec3  aColor;
  attribute vec3  aDir;     // unit explosion direction
  attribute float aSpeed;   // 3–8
  attribute float aInDir;   // inward spiral angle
  uniform float uLoopT;     // 0→1 per LOOP_DURATION
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    float t = mod(uLoopT + aPhase, 1.0);  // per-particle time 0→1

    vec3 pos = vec3(0.0);
    float alpha = 1.0;

    if (t < 0.50) {
      // Act 1: spiral inward from radius 18
      float r = 18.0 * (1.0 - t / 0.50);
      float angle = aInDir + t * 6.28 * 2.5;
      pos = vec3(cos(angle) * r, sin(angle * 0.6) * r * 0.4, sin(angle) * r * 0.7);
      alpha = t / 0.50;
    } else if (t < 0.60) {
      // Act 2: converge to core, flash bright
      float ct = (t - 0.50) / 0.10;
      pos = vec3(0.0) * ct;
      alpha = 1.0;
    } else {
      // Act 3: explode outward
      float et = (t - 0.60) / 0.40;
      pos = aDir * aSpeed * et * 22.0;
      alpha = 1.0 - smoothstep(0.5, 1.0, et);
    }

    vColor = aColor;
    vAlpha = alpha;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
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
    const pos     = new Float32Array(PARTICLE_COUNT * 3) // all zeros

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      phase[i]  = Math.random()
      speeds[i] = 3 + Math.random() * 5
      inDirs[i] = Math.random() * Math.PI * 2

      // Random unit direction for explosion
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      dirs[i*3]   = Math.sin(phi) * Math.cos(theta)
      dirs[i*3+1] = Math.sin(phi) * Math.sin(theta)
      dirs[i*3+2] = Math.cos(phi)

      // Platform colour
      const c = PLATFORM_COLORS[Math.floor(Math.random() * PLATFORM_COLORS.length)]
      colors[i*3] = c[0]; colors[i*3+1] = c[1]; colors[i*3+2] = c[2]
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
    <>
      <pointLight position={[0, 0, 4]} intensity={0} ref={(el) => {
        // Flash light driven by loop position — handled via uniform instead
      }} />
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
    </>
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
```

- [ ] **Step 2: Verify the file has no TypeScript errors**
```bash
cd /c/Users/Cal/socialsculp-dashboard && npx tsc --noEmit 2>&1 | grep CtaCanvas
```
Expected: no output (no errors).

- [ ] **Step 3: Commit the new file**
```bash
git add app/(marketing)/v2/CtaCanvas.tsx
git commit -m "feat: add CtaCanvas viral particle burst for CTA section"
```

---

## Task 3 — Wire CtaCanvas into V2Client + redesign CTA typography

**Files:**
- Modify: `app/(marketing)/v2/V2Client.tsx`
- Modify: `app/(marketing)/v2/landing-v2.css`

- [ ] **Step 1: Import CtaCanvas dynamically in V2Client.tsx**

```tsx
const CtaCanvas = dynamic(
  () => import('./CtaCanvas').then(m => ({ default: m.CtaCanvas })),
  { ssr: false }
)
```

- [ ] **Step 2: Replace the CTA section JSX**

Remove the `.v2-cta-rings` divs entirely. Add the canvas wrap and restructure the headline:

```tsx
{/* ── CTA ── */}
<section className="v2-cta" id="contact">
  {/* Viral particle burst background */}
  <div className="v2-cta-canvas-wrap" aria-hidden="true">
    {introComplete && <CtaCanvas />}
  </div>

  <div className="v2-cta-eyebrow">Ready to grow?</div>
  <h2 className="v2-cta-headline">
    <span className="v2-cta-hl-small">Let&apos;s Build</span>
    <span className="v2-cta-hl-big">Something</span>
    <span className="v2-cta-hl-outline">Unforgettable.</span>
  </h2>
  <div className="v2-cta-actions">
    <a href="https://calendar.app.google/4wcPnasps28aBHTJ9" target="_blank" rel="noopener noreferrer" className="v2-cta-btn primary">Book a Strategy Call →</a>
    <a href="/sign-up" className="v2-cta-btn outline">Create Account</a>
  </div>
</section>
```

- [ ] **Step 3: Update landing-v2.css — CTA section overhaul**

Replace the `.v2-cta`, `.v2-cta-rings`, `.v2-cta-headline` rules:

```css
/* CTA canvas wrap */
.v2-cta-canvas-wrap {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* CTA content above canvas */
.v2-cta-eyebrow,
.v2-cta-headline,
.v2-cta-actions { position: relative; z-index: 1; }

/* Three-tier typographic hierarchy */
.v2-cta-headline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  margin-bottom: 52px;
  line-height: 1;
}
.v2-cta-hl-small {
  font-family: var(--font-sans);
  font-size: clamp(0.7rem, 1.2vw, 1rem);
  font-weight: 300;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: rgba(240,230,222,0.45);
  margin-bottom: 12px;
}
.v2-cta-hl-big {
  font-family: var(--font-disp);
  font-style: italic;
  font-size: clamp(4rem, 10vw, 11rem);
  font-weight: 300;
  color: var(--cream);
  letter-spacing: -0.03em;
  line-height: 0.88;
  text-shadow:
    0 0 120px rgba(0,140,255,0.5),
    0 0 60px rgba(0,140,255,0.25),
    0 0 20px rgba(0,140,255,0.1);
}
.v2-cta-hl-outline {
  font-family: var(--font-disp);
  font-style: italic;
  font-size: clamp(2rem, 4vw, 4.5rem);
  font-weight: 300;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(0,140,255,0.7);
  letter-spacing: -0.01em;
  filter: drop-shadow(0 0 20px rgba(0,140,255,0.6));
  margin-top: 8px;
}

/* Mobile CTA */
@media (max-width: 640px) {
  .v2-cta-hl-big    { font-size: clamp(3rem, 13vw, 5rem); }
  .v2-cta-hl-outline { font-size: clamp(1.5rem, 7vw, 2.5rem); }
}
```

Also remove all `.v2-cta-ring*` and `@keyframes ctaRingPulse` rules.

- [ ] **Step 4: Test end-to-end**
Open `localhost:3100/v2?skip=1` → scroll to CTA section. Should see multi-coloured particles spiralling inward, flashing, then exploding outward. Headline should have 3-tier hierarchy: small sans → giant italic → outlined accent.

- [ ] **Step 5: Commit**
```bash
git add app/(marketing)/v2/V2Client.tsx app/(marketing)/v2/landing-v2.css
git commit -m "feat: wire CtaCanvas + redesign CTA typography hierarchy"
```

---

## Task 4 — Final push + verify

- [ ] **Step 1: TypeScript check**
```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 2: Visual QA checklist**
  - [ ] Intro loading screen: SOCIALSCULP appears in 3D at 70%, metallic + blue emissive, no HTML overlay remnants
  - [ ] CTA: particles burst on loop, not laggy
  - [ ] CTA headline: 3 tiers, centred, no overflow on 375px mobile
  - [ ] Stats strip: all 4 stats perfectly centred in their cells
  - [ ] `@arospeaks` card not covering Book a Call button

- [ ] **Step 3: Push both branches**
```bash
git push origin main
git checkout preview-unseen-inspired && git merge main && git push origin preview-unseen-inspired && git checkout main
```

---

## Performance Notes
- Text3D geometry is built once by Three.js, no per-frame work
- CtaCanvas uses 360 particles with a single shader draw call — negligible vs the network hero
- CtaCanvas is guarded by `introComplete` — never runs during the intro WebGL phase
- Both canvases use `powerPreference: 'high-performance'`, `dpr` capped at 1.5

