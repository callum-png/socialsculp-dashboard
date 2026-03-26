'use client'

import { Canvas } from '@react-three/fiber'
import { View, Preload } from '@react-three/drei'

// Single shared WebGL canvas — all ScrollScene Views render here (1 context, not 6)
export function SharedCanvas() {
  return (
    <Canvas
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
      }}
      gl={{ antialias: true, alpha: true }}
    >
      <View.Port />
      <Preload all />
    </Canvas>
  )
}
