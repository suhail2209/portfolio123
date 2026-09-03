import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DESK } from '../layout.js'
import { useSurfaceMaterial } from '../materials/useSurfaceMaterial.js'
import { createScreenMaterial } from '../materials/ScreenMaterial.js'
import { useScreenCanvas } from '../hooks/useScreenCanvas.js'
import { paintSecondaryScreen } from '../screens/secondaryScreen.js'
import { makeRoundedSlabGeometry } from '../utils/geometry.js'

const T = DESK.top

/**
 * Secondary monitor (procedural), angled toward the designer on the left.
 * The main curved monitor now comes from the imported PC set (Setup.jsx).
 */
export default function Monitors() {
  const secTex = useScreenCanvas(640, 372, paintSecondaryScreen, 6)
  const secMat = useMemo(() => createScreenMaterial(secTex), [secTex])
  const secBaseGeo = useMemo(() => makeRoundedSlabGeometry(0.22, 0.15, 0.012, 0.02, 0.003), [])
  const shell = useSurfaceMaterial({ kind: 'plain', color: '#34312e', roughness: 0.6, metalness: 0.2 })
  const stand = useSurfaceMaterial({ kind: 'plain', color: '#3a3733', roughness: 0.5, metalness: 0.4 })

  useFrame(({ clock }) => {
    secMat.uniforms.uTime.value = clock.getElapsedTime() + 3
  })

  return (
    <group name="monitors">
      <group position={[-0.76, T, -2.68]} rotation-y={0.5}>
        <mesh geometry={secBaseGeo} material={stand} rotation-x={-Math.PI / 2} position={[0, 0.006, -0.02]} castShadow receiveShadow />
        <mesh material={stand} position={[0, 0.09, -0.03]} castShadow>
          <boxGeometry args={[0.05, 0.16, 0.025]} />
        </mesh>
        <mesh material={shell} position={[0, 0.31, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.54, 0.33, 0.025]} />
        </mesh>
        <mesh material={secMat} position={[0, 0.31, 0.0135]}>
          <planeGeometry args={[0.5, 0.29]} />
        </mesh>
      </group>

      {/* screen glow on the desk + designer */}
      <pointLight position={[0, 1.05, -2.35]} intensity={0.7} color="#e3ebff" distance={1.6} decay={2} />
    </group>
  )
}
