import { useMemo } from 'react'
import { ROOM, PALETTE } from '../layout.js'
import { useSurfaceMaterial } from '../materials/useSurfaceMaterial.js'
import { makeRoundedSlabGeometry } from '../utils/geometry.js'

/**
 * Room shell: floor, back + right walls, skirting, rug.
 * The left (window) wall lives in Environment.jsx because it is cut by the window.
 */
export default function Room() {
  const floor = useSurfaceMaterial({
    kind: 'wood',
    color: PALETTE.woodLight,
    dark: PALETTE.woodDark,
    strength: 0.55,
    scale: 1,
    grain: 'z',
    planks: 7.5,
    roughness: 0.62,
  })
  const wall = useSurfaceMaterial({ kind: 'wall', color: PALETTE.wall, strength: 1, roughness: 0.96 })
  const trim = useSurfaceMaterial({ kind: 'plain', color: '#f9f3e8', roughness: 0.7 })
  const ceiling = useSurfaceMaterial({ kind: 'wall', color: '#f3ebdc', strength: 0.6, roughness: 1, emissive: '#e8dfcf', emissiveIntensity: 0.55 })
  const rug = useSurfaceMaterial({ kind: 'fabric', color: '#a9a380', strength: 1, roughness: 1, rim: 0.05 })
  const rugInner = useSurfaceMaterial({ kind: 'fabric', color: '#c4bc98', strength: 1, roughness: 1, rim: 0.05 })
  const rugGeo = useMemo(() => makeRoundedSlabGeometry(2.0, 1.5, 0.014, 0.08, 0.004), [])
  const rugInnerGeo = useMemo(() => makeRoundedSlabGeometry(1.74, 1.24, 0.006, 0.05, 0.002), [])

  return (
    <group name="room">
      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow material={floor}>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
      </mesh>

      {/* ceiling (only visible on tall/narrow viewports) */}
      <mesh position={[0, ROOM.h, 0]} rotation-x={Math.PI / 2} material={ceiling}>
        <planeGeometry args={[ROOM.w + 0.3, ROOM.d]} />
      </mesh>

      {/* back wall */}
      <mesh position={[0, ROOM.h / 2, ROOM.back]} receiveShadow material={wall}>
        <planeGeometry args={[ROOM.w, ROOM.h]} />
      </mesh>

      {/* right wall */}
      <mesh position={[ROOM.right, ROOM.h / 2, 0]} rotation-y={-Math.PI / 2} receiveShadow material={wall}>
        <planeGeometry args={[ROOM.d, ROOM.h]} />
      </mesh>

      {/* skirting boards */}
      <mesh position={[0, 0.05, ROOM.back + 0.008]} material={trim} castShadow receiveShadow>
        <boxGeometry args={[ROOM.w, 0.1, 0.016]} />
      </mesh>
      <mesh position={[ROOM.right - 0.008, 0.05, 0]} material={trim} receiveShadow>
        <boxGeometry args={[0.016, 0.1, ROOM.d]} />
      </mesh>

      {/* rug under the chair */}
      <mesh geometry={rugGeo} material={rug} rotation-x={-Math.PI / 2} position={[0.15, 0.007, -1.4]} receiveShadow />
      <mesh geometry={rugInnerGeo} material={rugInner} rotation-x={-Math.PI / 2} position={[0.15, 0.016, -1.4]} receiveShadow />
    </group>
  )
}
