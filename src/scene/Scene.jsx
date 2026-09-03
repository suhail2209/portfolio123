import * as THREE from 'three'
import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment as DreiEnvironment, Lightformer } from '@react-three/drei'
import CameraRig from './CameraRig.jsx'
import Lighting from './Lighting.jsx'
import Frame1Room from './frames/Frame1Room.jsx'
import { tickSurfaceMaterials } from './materials/useSurfaceMaterial.js'
import { PALETTE } from './layout.js'

/** Drives uTime for every procedural surface material. */
function MaterialClock() {
  useFrame(({ clock }) => tickSurfaceMaterials(clock.getElapsedTime()))
  return null
}

/** Dev aid (?debug): writes fps + renderer stats into #debug-perf once a second. */
function DebugProbe() {
  const acc = useRef({ frames: 0, last: 0, worst: 0 })
  useFrame(({ gl, clock }, dt) => {
    const a = acc.current
    a.frames++
    a.worst = Math.max(a.worst, dt)
    const t = clock.getElapsedTime()
    if (t - a.last < 1) return
    const el = document.getElementById('debug-perf')
    if (el) {
      const i = gl.info
      el.textContent =
        `fps ${(a.frames / (t - a.last)).toFixed(1)} | worst ${(a.worst * 1000).toFixed(0)}ms | calls ${i.render.calls} | tris ${i.render.triangles} | ` +
        `geoms ${i.memory.geometries} | textures ${i.memory.textures} | programs ${i.programs?.length ?? '?'}`
    }
    a.frames = 0
    a.worst = 0
    a.last = t
  })
  return null
}
const DEBUG = typeof window !== 'undefined' && window.location.search.includes('debug')

/**
 * Scene
 * ─ CameraRig : fixed cinematic camera for Frame 1 (scroll-driven later)
 * ─ Lighting  : sun through the window + warm fills
 * ─ Frames    : Frame1Room now; Frame2..4 will be siblings later
 */
export default function Scene() {
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        outputColorSpace: THREE.SRGBColorSpace,
        powerPreference: 'high-performance',
      }}
      camera={{ fov: 50, near: 0.1, far: 40, position: [1.4, 1.7, 1.1] }}
    >
      <color attach="background" args={[PALETTE.cream]} />
      <fog attach="fog" args={['#f6ecd9', 5.5, 13]} />

      <CameraRig />
      <Lighting />
      <MaterialClock />
      {DEBUG && <DebugProbe />}

      {/* Procedural, asset-free environment for soft reflections on glass + metal */}
      <DreiEnvironment resolution={64} frames={1} background={false}>
        <Lightformer intensity={2.2} color="#fff1dc" rotation-y={Math.PI / 2} position={[-5, 2, -1.5]} scale={[4, 3, 1]} />
        <Lightformer intensity={0.5} color="#ffffff" rotation-x={Math.PI / 2} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={0.35} color="#e6d3ba" rotation-y={-Math.PI / 2} position={[5, 1, 0]} scale={[4, 2, 1]} />
        <Lightformer intensity={0.25} color="#dcd0c0" position={[0, 1, -5]} scale={[8, 3, 1]} />
      </DreiEnvironment>

      <Suspense fallback={null}>
        <Frame1Room />
      </Suspense>
    </Canvas>
  )
}
