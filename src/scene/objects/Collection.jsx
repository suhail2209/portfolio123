import { useMemo } from 'react'
import { useSurfaceMaterial } from '../materials/useSurfaceMaterial.js'
import { useInteractive } from '../hooks/useInteractive.js'
import { makeRoundedBoxGeometry, seeded } from '../utils/geometry.js'
import Tooltip from '../../ui/Tooltip.jsx'

const COLORS = ['#c94f3f', '#3f6d9e', '#e2b13c', '#efe6d6', '#3d8b73', '#e07a3f', '#8a6ab8', '#2f3336', '#d9a4b8']

/** One miniature die-cast car (generic, unbranded). */
function Car({ color, rotation = 0, bodyGeo, cabinGeo, wheelMat, glassMat }) {
  const paint = useMemo(() => ({ color, metalness: 0.65, roughness: 0.28 }), [color])
  return (
    <group rotation-y={rotation}>
      <mesh geometry={bodyGeo} position={[0, 0.013, 0]} castShadow>
        <meshStandardMaterial {...paint} />
      </mesh>
      <mesh geometry={cabinGeo} position={[-0.004, 0.027, 0]} material={glassMat} castShadow />
      {[-0.024, 0.024].map((x) =>
        [-0.017, 0.017].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.008, z]} rotation-x={Math.PI / 2} material={wheelMat}>
            <cylinderGeometry args={[0.008, 0.008, 0.006, 12]} />
          </mesh>
        )),
      )}
    </group>
  )
}

/**
 * Wall-mounted display of miniature cars above the PC. Hidden personality detail.
 */
export default function Collection() {
  const shelfWood = useSurfaceMaterial({ kind: 'wood', color: '#d6b98f', dark: '#9a7a54', strength: 0.4, scale: 3, grain: 'x', roughness: 0.7 })
  const wheel = useSurfaceMaterial({ kind: 'plain', color: '#2a2725', roughness: 0.7 })
  const glass = useSurfaceMaterial({ kind: 'plain', color: '#2b3038', roughness: 0.15, metalness: 0.4 })
  const bodyGeo = useMemo(() => makeRoundedBoxGeometry(0.078, 0.015, 0.034, 0.005), [])
  const cabinGeo = useMemo(() => makeRoundedBoxGeometry(0.042, 0.014, 0.03, 0.005), [])
  const rand = useMemo(() => seeded(7), [])
  const jitter = useMemo(() => Array.from({ length: 9 }, () => (rand() - 0.5) * 0.3), [rand])

  const { ref, hovered, bind } = useInteractive('cars', { scale: 1.03 })

  const W = 0.62
  const H = 0.5
  const D = 0.085

  return (
    <group ref={ref} {...bind} name="collection" position={[1.5, 1.62, -2.96]}>
      {/* back board */}
      <mesh position={[0, 0, -0.03]} material={shelfWood} receiveShadow>
        <boxGeometry args={[W, H, 0.012]} />
      </mesh>
      {/* frame */}
      <mesh position={[0, H / 2 - 0.006, 0]} material={shelfWood} castShadow receiveShadow>
        <boxGeometry args={[W, 0.012, D]} />
      </mesh>
      <mesh position={[0, -H / 2 + 0.006, 0]} material={shelfWood} castShadow receiveShadow>
        <boxGeometry args={[W, 0.012, D]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * (W - 0.012)) / 2, 0, 0]} material={shelfWood} castShadow receiveShadow>
          <boxGeometry args={[0.012, H, D]} />
        </mesh>
      ))}
      {/* shelves + cars */}
      {[-0.085, 0.08].map((y) => (
        <mesh key={y} position={[0, y, 0]} material={shelfWood} castShadow receiveShadow>
          <boxGeometry args={[W - 0.02, 0.01, D - 0.01]} />
        </mesh>
      ))}
      {[-H / 2 + 0.012, -0.08, 0.085].map((y, row) =>
        [-0.19, 0, 0.19].map((x, col) => {
          const i = row * 3 + col
          return (
            <group key={i} position={[x, y, 0.005]}>
              <Car color={COLORS[i]} rotation={-0.5 + jitter[i]} bodyGeo={bodyGeo} cabinGeo={cabinGeo} wheelMat={wheel} glassMat={glass} />
            </group>
          )
        }),
      )}

      <Tooltip visible={hovered} position={[0, 0.36, 0.05]} title="Small cars. Big obsession." />
    </group>
  )
}
