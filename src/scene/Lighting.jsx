import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SUN } from './layout.js'

/**
 * Warm daylight setup.
 * - hemisphere: soft cream sky / warm floor bounce
 * - sun: shadow-casting directional light entering through the window (drifts very slowly)
 * - fill: gentle warm point light near the ceiling, simulating bounce
 */
export default function Lighting() {
  const sun = useRef()
  const target = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (!sun.current) return
    sun.current.position.set(
      SUN.position[0] + Math.sin(t * 0.045) * 0.3,
      SUN.position[1] + Math.cos(t * 0.037) * 0.2,
      SUN.position[2] + Math.sin(t * 0.03) * 0.15,
    )
    sun.current.intensity = SUN.intensity * (0.95 + 0.05 * Math.sin(t * 0.11))
  })

  return (
    <>
      <hemisphereLight args={['#fff5e3', '#c7b394', 0.4]} />
      <directionalLight
        ref={sun}
        castShadow
        position={SUN.position}
        target={target}
        intensity={SUN.intensity}
        color={SUN.color}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={2.5}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-camera-near={1}
        shadow-camera-far={20}
      />
      <primitive object={target} position={SUN.target} />
      <pointLight position={[1.6, 2.7, 0.6]} intensity={7} color="#ffe8d2" distance={9} decay={2} />
      <pointLight position={[-1.4, 2.5, -1.2]} intensity={3} color="#fff0dc" distance={6} decay={2} />
    </>
  )
}
