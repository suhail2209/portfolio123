import { useMemo } from 'react'
import { useSurfaceMaterial } from '../materials/useSurfaceMaterial.js'
import { useInteractive } from '../hooks/useInteractive.js'
import { makeRoundedSlabGeometry } from '../utils/geometry.js'
import Character from './Character.jsx'
import Tooltip from '../../ui/Tooltip.jsx'

/** Chair + character placement. Values refined from the skeleton analysis. */
export const CHAIR_Z = -1.85
export const CHARACTER_ROOT = [0, -0.453, -1.72]

/**
 * The desk chair and the designer sitting in it (GLB avatar, see Character.jsx).
 * The chair stays procedural; only the person is an external asset now.
 */
export default function Designer() {
  const chairFabric = useSurfaceMaterial({ kind: 'fabric', color: '#5c6452', strength: 1, roughness: 1, rim: 0.08 })
  const chairMetal = useSurfaceMaterial({ kind: 'plain', color: '#2b2826', roughness: 0.4, metalness: 0.6 })

  const seatGeo = useMemo(() => makeRoundedSlabGeometry(0.5, 0.46, 0.085, 0.06, 0.02), [])
  const backGeo = useMemo(() => makeRoundedSlabGeometry(0.46, 0.56, 0.06, 0.07, 0.018), [])

  const { ref, hovered, bind } = useInteractive('designer', { scale: 1 })

  return (
    <group name="designer">
      {/* chair */}
      <group name="chair" position={[0, 0, CHAIR_Z + 0.02]}>
        <mesh position={[0, 0.24, 0]} material={chairMetal} castShadow>
          <cylinderGeometry args={[0.022, 0.028, 0.4, 16]} />
        </mesh>
        {Array.from({ length: 5 }).map((_, i) => (
          <group key={i} rotation-y={(i / 5) * Math.PI * 2 + 0.3}>
            <mesh position={[0.15, 0.035, 0]} rotation-z={-0.12} material={chairMetal} castShadow>
              <boxGeometry args={[0.3, 0.022, 0.03]} />
            </mesh>
            <mesh position={[0.29, 0.02, 0]} material={chairMetal} castShadow>
              <sphereGeometry args={[0.022, 12, 12]} />
            </mesh>
          </group>
        ))}
        <mesh geometry={seatGeo} material={chairFabric} rotation-x={-Math.PI / 2} position={[0, 0.465, 0]} castShadow receiveShadow />
        <mesh geometry={backGeo} material={chairFabric} rotation-x={0.12} position={[0, 0.85, 0.22]} castShadow receiveShadow />
        <mesh position={[0, 0.6, 0.23]} material={chairMetal} castShadow>
          <boxGeometry args={[0.1, 0.24, 0.03]} />
        </mesh>
        {[-0.27, 0.27].map((x) => (
          <group key={x}>
            <mesh position={[x, 0.68, 0.02]} material={chairMetal} castShadow>
              <boxGeometry args={[0.055, 0.022, 0.26]} />
            </mesh>
            <mesh position={[x, 0.58, 0.08]} material={chairMetal} castShadow>
              <boxGeometry args={[0.03, 0.2, 0.03]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* person (interactive) */}
      <group ref={ref} {...bind}>
        <Character position={CHARACTER_ROOT} />
        <Tooltip visible={hovered} position={[0, 1.55, CHAIR_Z]} title="Shh... I'm designing." />
      </group>
    </group>
  )
}
