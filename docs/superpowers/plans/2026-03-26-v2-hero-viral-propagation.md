# Hero Canvas — Viral Propagation Engine

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic NetworkHero orbital-node sphere with a branded "Viral Propagation Engine" — a 3D scene that visually tells SocialSculp's service story: Brand seeds content → Creators receive and amplify → Audiences are reached.

**Architecture:** Single R3F canvas with 2 draw calls. One `Points` geometry holds every point type (brand node, creator nodes, stream particles, burst particles) — a custom GLSL vertex shader selects behaviour per-particle using an `aRole` attribute. A `LineSegments` draw call adds faint brand→creator network lines. `uTime` is the only per-frame uniform update. Zero heap allocation in the frame loop. Mobile uses fewer creators and smaller particle counts.

**Tech Stack:** `@react-three/fiber ^9.5`, `three ^0.183`, custom GLSL (no drei needed), `next/dynamic` with `ssr:false`, TypeScript.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `app/(marketing)/v2/HeroCanvas.tsx` | **CREATE** | Entire viral propagation scene — geometry, shaders, frame loop, export |
| `app/(marketing)/v2/V2Client.tsx` | **MODIFY** | Swap `NetworkHero` import → `HeroCanvas`, remove NetworkHero dynamic import |
| `app/(marketing)/v2/NetworkHero.tsx` | **DELETE** | Replaced entirely |

---

## Visual Spec (implement exactly as described)

**Brand node:** Centre of scene `[0, 0, 0]`. Large glowing white-cream point (`aSize=52` desktop / `64` mobile). Softly pulses scale via `sin(uTime * 1.2)`.

**Creator nodes:** 8 (desktop) / 5 (mobile) small points scattered in 3D space at fixed positions (listed in Task 1). Each has a platform color (`aColor`). Gentle brightness pulse staggered by creator index.

**Content stream:** One creator is "active" at a time, cycling every `CYCLE_LEN = 3.5s`. 8 stream particles (desktop) / 5 (mobile) per creator travel along a curved arc from brand `[0,0,0]` to the active creator. They fan out slightly as they travel (arc offset via sin).

**Audience burst:** 0.55 × CYCLE_LEN seconds into the cycle, the active creator emits 14 (desktop) / 8 (mobile) burst particles that scatter outward in pre-baked random directions, decelerating with slight gravity and fading out by cycle end.

**Network lines:** Faint `LineSegments` (opacity 0.12) permanently connecting brand to each creator.

**Camera:** Fixed at `[0, 2.0, 13]`, fov 55. Slowly auto-rotates Y-axis (±12° sine, 20s period). Responds to mouse/touch with gentle lerp (±2.5° extra tilt).

---

## Task 1: HeroCanvas scaffold — static scene

**Files:**
- Create: `app/(marketing)/v2/HeroCanvas.tsx`

- [ ] **Step 1: Create the file with canvas + GLSL shell**

```tsx
'use client'
import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Config ────────────────────────────────────────────────────
const CYCLE_LEN   = 3.5   // seconds per creator-send cycle
const BRAND_POS   = new THREE.Vector3(0, 0, 0)

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
  attribute float aRole;         // 0=brand 1=creator 2=stream 3=burst
  attribute float aCreatorIdx;
  attribute float aPhaseOffset;  // 0..1 stagger within group
  attribute vec3  aStartPos;     // stream: brand pos | burst: creator pos
  attribute vec3  aEndPos;       // stream: creator pos | burst: burst direction
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
      // ── Brand node ──────────────────────────────────────────
      float pulse = 0.85 + sin(uTime * 1.2) * 0.15;
      gl_PointSize = aSize * pulse * (300.0 / dist);
      gl_Position  = projectionMatrix * mv;
      vAlpha = 1.0;

    } else if (aRole < 1.5) {
      // ── Creator node ────────────────────────────────────────
      float pulse = 0.65 + sin(uTime * 0.9 + aCreatorIdx * 1.3) * 0.35;
      gl_PointSize = aSize * pulse * (300.0 / dist);
      gl_Position  = projectionMatrix * mv;
      vAlpha = pulse;

    } else if (aRole < 2.5) {
      // ── Stream particle ─────────────────────────────────────
      float activeC = mod(floor(uTime / uCycleLen), uNCr);
      float isMine  = 1.0 - step(0.5, abs(aCreatorIdx - activeC));
      float cycleT  = mod(uTime, uCycleLen) / uCycleLen;
      float pT      = clamp((cycleT - aPhaseOffset * 0.35) / 0.55, 0.0, 1.0);
      float smooth  = easeInOut(pT);
      vec3 pos      = mix(aStartPos, aEndPos, smooth);
      // slight upward arc
      pos.y        += sin(pT * 3.14159) * 0.4;
      vec4 mv2      = modelViewMatrix * vec4(pos, 1.0);
      gl_Position   = projectionMatrix * mv2;
      gl_PointSize  = aSize * (300.0 / max(length(mv2.xyz), 0.001));
      vAlpha        = isMine * sin(pT * 3.14159);

    } else {
      // ── Burst particle ──────────────────────────────────────
      float activeC = mod(floor(uTime / uCycleLen), uNCr);
      float isMine  = 1.0 - step(0.5, abs(aCreatorIdx - activeC));
      float cycleT  = mod(uTime, uCycleLen) / uCycleLen;
      float burstT  = clamp((cycleT - 0.55) / 0.45, 0.0, 1.0);
      float decel   = 1.0 - (1.0 - burstT) * (1.0 - burstT);
      vec3 pos      = aStartPos + aEndPos * decel * 2.8;
      pos.y        -= burstT * burstT * 0.6;  // gravity
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

// ─── Geometry builder ──────────────────────────────────────────
// placeholder for Task 2 — right now we just build the brand + creator points

// ─── Scene ────────────────────────────────────────────────────
function PropagationScene({ isMobile }: { isMobile: boolean }) {
  const mouseRef = useRef({ tx: 0, ty: 0, cx: 0, cy: 0 })
  const creators = isMobile ? CREATORS_MOBILE : CREATORS_DESKTOP
  const NC = creators.length

  // Line geometry: brand → each creator (static, built once)
  const lineGeo = useMemo(() => {
    const pos = new Float32Array(NC * 2 * 3)
    for (let i = 0; i < NC; i++) {
      // start: brand [0,0,0] — already 0
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

  // Point geometry: brand(1) + creators(NC) — stream/burst added in Task 2
  const { geo, mat } = useMemo(() => {
    const TOTAL = 1 + NC
    const pos    = new Float32Array(TOTAL * 3)
    const role   = new Float32Array(TOTAL)
    const cidx   = new Float32Array(TOTAL)
    const phase  = new Float32Array(TOTAL)
    const start  = new Float32Array(TOTAL * 3)
    const end_   = new Float32Array(TOTAL * 3)
    const size   = new Float32Array(TOTAL)
    const color  = new Float32Array(TOTAL * 3)

    // Brand node at origin
    role[0] = 0; size[0] = isMobile ? 64 : 52
    color[0] = 1.0; color[1] = 0.96; color[2] = 0.93  // cream-white

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
      // parse hex color
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      color[idx * 3]     = r
      color[idx * 3 + 1] = g
      color[idx * 3 + 2] = b
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position',    new THREE.BufferAttribute(pos,   3))
    g.setAttribute('aRole',       new THREE.BufferAttribute(role,  1))
    g.setAttribute('aCreatorIdx', new THREE.BufferAttribute(cidx,  1))
    g.setAttribute('aPhaseOffset',new THREE.BufferAttribute(phase, 1))
    g.setAttribute('aStartPos',   new THREE.BufferAttribute(start, 3))
    g.setAttribute('aEndPos',     new THREE.BufferAttribute(end_,  3))
    g.setAttribute('aSize',       new THREE.BufferAttribute(size,  1))
    g.setAttribute('aColor',      new THREE.BufferAttribute(color, 3))

    const m = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime:     { value: 0 },
        uCycleLen: { value: CYCLE_LEN },
        uNCr:      { value: NC },
      },
    })

    return { geo: g, mat: m }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [NC, isMobile])

  // Mouse tracking
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

    // Camera: slow Y oscillation + mouse lean
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
```

- [ ] **Step 2: Verify it compiles**

```bash
cd C:\Users\Cal\socialsculp-dashboard
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: View in browser — brand + creator nodes only**

Navigate to `http://localhost:3000/v2?skip=1` and confirm:
- Dark background ✅
- One large cream-white glow at centre ✅
- 8 smaller coloured dots scattered in 3D space ✅
- Faint blue lines connecting centre to each dot ✅
- No stream or burst particles yet (that's Task 2) ✅

- [ ] **Step 4: Commit scaffold**

```bash
git add "app/(marketing)/v2/HeroCanvas.tsx"
git commit -m "feat(v2): HeroCanvas scaffold — brand + creator static nodes"
```

---

## Task 2: Content stream particles

**Files:**
- Modify: `app/(marketing)/v2/HeroCanvas.tsx` — expand geometry builder to include stream particles

- [ ] **Step 1: Update geometry builder in `useMemo` to add stream particles**

Replace the `Point geometry` useMemo in Task 1 with this expanded version. Add stream particles after the creator block:

```tsx
// Inside useMemo, after creator nodes loop — add stream particles
const SP_PER_C = isMobile ? 5 : 8   // stream particles per creator
const BP_PER_C = isMobile ? 8 : 14  // burst particles per creator (Task 3)
const TOTAL    = 1 + NC + NC * SP_PER_C + NC * BP_PER_C

// ... (re-initialise all Float32Arrays to TOTAL length) ...

// Stream particles — per creator, per particle
let idx = 1 + NC
for (let c = 0; c < NC; c++) {
  const [cx, cy, cz, hex] = creators[c]
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  for (let p = 0; p < SP_PER_C; p++) {
    role[idx]  = 2
    cidx[idx]  = c
    phase[idx] = p / SP_PER_C
    size[idx]  = isMobile ? 5 : 4
    // aStartPos = brand (0,0,0) — already zero
    // aEndPos   = creator pos
    end_[idx * 3]     = cx
    end_[idx * 3 + 1] = cy
    end_[idx * 3 + 2] = cz
    // stream colour: lerp between brand blue and creator colour
    color[idx * 3]     = 0.1 + r * 0.4
    color[idx * 3 + 1] = 0.55 + g * 0.4
    color[idx * 3 + 2] = 1.0 + b * 0.0
    idx++
  }
}
// Leave burst slots at idx onward — zeros = hidden (Task 3)
```

> Note: `aStartPos` for stream particles is brand pos `[0,0,0]` — Float32Array is zero-initialised so no explicit write needed.

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Visual check — stream particles visible**

Refresh `http://localhost:3000/v2?skip=1`. Confirm:
- Bright stream of 8 particles travels from centre to one creator at a time ✅
- Arcs slightly upward mid-flight ✅
- Fades in then out along the arc ✅
- Cycles to the next creator every 3.5 seconds ✅
- Other creators' stream particles are invisible when not active ✅

- [ ] **Step 4: Commit**

```bash
git add "app/(marketing)/v2/HeroCanvas.tsx"
git commit -m "feat(v2): stream particles — brand-to-creator content flow"
```

---

## Task 3: Audience burst particles

**Files:**
- Modify: `app/(marketing)/v2/HeroCanvas.tsx` — fill in burst particle slots

- [ ] **Step 1: Add burst particles in geometry builder**

After the stream particle loop (`idx` is now pointing to the burst slots):

```tsx
// Burst particles — per creator, per particle
for (let c = 0; c < NC; c++) {
  const [cx, cy, cz, hex] = creators[c]
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  for (let p = 0; p < BP_PER_C; p++) {
    role[idx]  = 3
    cidx[idx]  = c
    size[idx]  = isMobile ? 4 : 3
    // aStartPos = creator pos (origin of burst)
    start[idx * 3]     = cx
    start[idx * 3 + 1] = cy
    start[idx * 3 + 2] = cz
    // aEndPos = pre-baked random unit direction (burst direction)
    const theta = Math.random() * Math.PI * 2
    const phi   = Math.acos(2 * Math.random() - 1)
    end_[idx * 3]     = Math.sin(phi) * Math.cos(theta)
    end_[idx * 3 + 1] = Math.abs(Math.sin(phi) * Math.sin(theta)) * 0.6 // bias upward
    end_[idx * 3 + 2] = Math.cos(phi) * 0.5
    // creator's platform colour for burst
    color[idx * 3]     = r
    color[idx * 3 + 1] = g
    color[idx * 3 + 2] = b
    idx++
  }
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Visual check — burst explosion visible**

Refresh `http://localhost:3000/v2?skip=1`. Confirm:
- After stream reaches creator, a burst of coloured particles scatter outward ✅
- Burst particles decelerate and fade out ✅
- Platform colour: TikTok=teal, Instagram=pink, YouTube=red, Snapchat=yellow ✅
- Creator node briefly glows brighter on burst (via sine pulse in shader already handles this) ✅

- [ ] **Step 4: Commit**

```bash
git add "app/(marketing)/v2/HeroCanvas.tsx"
git commit -m "feat(v2): audience burst particles — creator amplification visualised"
```

---

## Task 4: Wire into V2Client + remove NetworkHero

**Files:**
- Modify: `app/(marketing)/v2/V2Client.tsx`
- Delete: `app/(marketing)/v2/NetworkHero.tsx`

- [ ] **Step 1: Add HeroCanvas dynamic import in V2Client.tsx**

Replace the NetworkHero import block (around line 7-10) with:

```tsx
const HeroCanvas = dynamic(
  () => import('./HeroCanvas').then(m => ({ default: m.HeroCanvas })),
  { ssr: false }
)
```

Remove the `NetworkHero` dynamic import entirely.

- [ ] **Step 2: Replace NetworkHero usage in JSX**

Find this in V2Client.tsx (around line 260):
```tsx
{introComplete && <NetworkHero />}
```

Replace with:
```tsx
{introComplete && <HeroCanvas />}
```

- [ ] **Step 3: Delete NetworkHero.tsx**

```bash
del "app\(marketing)\v2\NetworkHero.tsx"
```

- [ ] **Step 4: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors. If NetworkHero is imported anywhere else, remove those references.

- [ ] **Step 5: Production build check**

```bash
npm run build
```

Expected: clean build, `/v2` listed as static or dynamic route, zero type errors.

- [ ] **Step 6: Visual QA — desktop**

Navigate to `http://localhost:3000/v2` (no skip) and verify full flow:
- Intro loads at top of page ✅
- Intro completes, hero fades in ✅
- Brand node glows at centre ✅
- Creator nodes scattered in 3D, platform-coloured ✅
- Content streams cycle creator-by-creator ✅
- Burst fires on arrival ✅
- Camera gently oscillates ✅
- Mouse/touch moves camera ✅
- Headline text is centred and legible over the graphic ✅

- [ ] **Step 7: Visual QA — mobile**

Resize browser to 375px width. Verify:
- 5 creator nodes visible (not 8) ✅
- Particles are appropriately sized ✅
- No overflow or clipping ✅
- Buttons stack vertically under text ✅

- [ ] **Step 8: Commit all**

```bash
git add "app/(marketing)/v2/V2Client.tsx"
git commit -m "feat(v2): wire HeroCanvas, remove NetworkHero — viral propagation engine live"
```

---

## Done

After all tasks complete: push `feat/v2-cta-polish` to GitHub and merge to `main` when ready to deploy.

```bash
git push origin feat/v2-cta-polish
```
