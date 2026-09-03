import * as THREE from 'three'
import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { DESK, PALETTE } from '../layout.js'
import { useSurfaceMaterial } from '../materials/useSurfaceMaterial.js'
import { createSteamMaterial } from '../materials/SteamMaterial.js'
import { makeRoundedSlabGeometry, makeLeafGeometry, limbTransform } from '../utils/geometry.js'

const T = DESK.top

/**
 * Desk + accessories. The monitor, keyboard, mouse and PC now come from the
 * imported set (Setup.jsx); the secondary monitor lives in Monitors.jsx.
 */
export default function Desk() {
  const wood = useSurfaceMaterial({
    kind: 'wood',
    color: PALETTE.woodDesk,
    dark: PALETTE.woodDark,
    strength: 0.42,
    scale: 1.6,
    grain: 'x',
    roughness: 0.5,
  })
  const metal = useSurfaceMaterial({ kind: 'plain', color: '#2d2a27', roughness: 0.45, metalness: 0.6 })
  const deskMat = useSurfaceMaterial({ kind: 'fabric', color: PALETTE.sageDark, strength: 1, roughness: 1 })
  const cream = useSurfaceMaterial({ kind: 'plain', color: '#efe8db', roughness: 0.55 })
  const ceramic = useSurfaceMaterial({ kind: 'plain', color: PALETTE.ceramic, roughness: 0.3 })
  const coffee = useSurfaceMaterial({ kind: 'plain', color: '#3a2315', roughness: 0.2 })
  const terracotta = useSurfaceMaterial({ kind: 'plain', color: '#d8a07a', roughness: 0.85 })
  const soil = useSurfaceMaterial({ kind: 'plain', color: '#4a3a2c', roughness: 1 })
  const leaf = useSurfaceMaterial({
    kind: 'sway',
    color: '#7f9c6c',
    strength: 0.5,
    top: T + 0.07,
    height: 0.2,
    roughness: 0.7,
    side: THREE.DoubleSide,
  })
  const bronze = useSurfaceMaterial({ kind: 'plain', color: '#4a3b30', roughness: 0.4, metalness: 0.5 })
  const dark = useSurfaceMaterial({ kind: 'plain', color: '#2b2826', roughness: 0.5 })
  const sketch = useSurfaceMaterial({ kind: 'plain', color: '#3b342d', roughness: 0.8 })
  const paper = useSurfaceMaterial({ kind: 'plain', color: '#f6f1e7', roughness: 0.9 })
  const phoneMat = useSurfaceMaterial({ kind: 'plain', color: '#1e1c1b', roughness: 0.3, metalness: 0.3 })
  const swatchMats = [
    useSurfaceMaterial({ kind: 'plain', color: '#7c9a72', roughness: 0.9 }),
    useSurfaceMaterial({ kind: 'plain', color: '#d3956a', roughness: 0.9 }),
    useSurfaceMaterial({ kind: 'plain', color: '#bcd3e6', roughness: 0.9 }),
  ]

  const matGeo = useMemo(() => makeRoundedSlabGeometry(0.9, 0.29, 0.004, 0.03, 0.001), [])
  const phoneGeo = useMemo(() => makeRoundedSlabGeometry(0.07, 0.145, 0.008, 0.01, 0.002), [])
  const bookGeo = useMemo(() => makeRoundedSlabGeometry(0.21, 0.29, 0.014, 0.008, 0.002), [])
  const swatchGeo = useMemo(() => makeRoundedSlabGeometry(0.06, 0.16, 0.004, 0.006, 0.001), [])
  const leafGeo = useMemo(() => makeLeafGeometry(0.085, 0.032), [])
  const steamMat = useMemo(() => createSteamMaterial(), [])

  useFrame(({ clock }) => {
    steamMat.uniforms.uTime.value = clock.getElapsedTime()
  })

  const lampArm1 = useMemo(() => limbTransform([0, 0.014, 0], [0, 0.3, 0]), [])
  const lampArm2 = useMemo(() => limbTransform([0, 0.3, 0], [0.1, 0.37, 0.1]), [])

  const legX = DESK.w / 2 - 0.08

  return (
    <group name="desk">
      {/* desk top */}
      <mesh position={[DESK.x, T - 0.0175, DESK.z]} material={wood} castShadow receiveShadow>
        <boxGeometry args={[DESK.w, 0.035, DESK.d]} />
      </mesh>
      {/* legs: two loop frames */}
      {[-legX, legX].map((x) => (
        <group key={x} position={[x, 0, DESK.z]}>
          <mesh position={[0, 0.36, -0.3]} material={metal} castShadow>
            <boxGeometry args={[0.03, 0.72, 0.03]} />
          </mesh>
          <mesh position={[0, 0.36, 0.3]} material={metal} castShadow>
            <boxGeometry args={[0.03, 0.72, 0.03]} />
          </mesh>
          <mesh position={[0, 0.015, 0]} material={metal} castShadow>
            <boxGeometry args={[0.03, 0.03, 0.66]} />
          </mesh>
          <mesh position={[0, 0.71, 0]} material={metal}>
            <boxGeometry args={[0.03, 0.03, 0.66]} />
          </mesh>
        </group>
      ))}
      {/* crossbar under the top */}
      <mesh position={[0, 0.7, DESK.z - 0.3]} material={metal}>
        <boxGeometry args={[legX * 2 - 0.03, 0.03, 0.03]} />
      </mesh>

      {/* desk mat (keyboard + mouse from the imported set sit on it) */}
      <mesh geometry={matGeo} material={deskMat} rotation-x={-Math.PI / 2} position={[0.2, T + 0.002, -2.225]} receiveShadow />

      {/* coffee cup */}
      <group position={[-0.42, T, -2.18]}>
        <mesh position={[0, 0.0425, 0]} material={ceramic} castShadow receiveShadow>
          <cylinderGeometry args={[0.038, 0.032, 0.085, 28]} />
        </mesh>
        <mesh position={[0, 0.078, 0]} material={coffee}>
          <cylinderGeometry args={[0.034, 0.034, 0.012, 28]} />
        </mesh>
        <mesh position={[0.042, 0.045, 0]} rotation-y={Math.PI / 2} material={ceramic} castShadow>
          <torusGeometry args={[0.022, 0.0065, 10, 24, Math.PI * 1.9]} />
        </mesh>
        <mesh position={[0, 0.002, 0]} material={deskMat} receiveShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.004, 28]} />
        </mesh>
        <Billboard position={[0, 0.17, 0]}>
          <mesh material={steamMat}>
            <planeGeometry args={[0.1, 0.17]} />
          </mesh>
        </Billboard>
      </group>

      {/* small potted plant (right front corner) */}
      <group position={[0.88, T, -2.18]}>
        <mesh position={[0, 0.035, 0]} material={terracotta} castShadow receiveShadow>
          <cylinderGeometry args={[0.046, 0.036, 0.07, 24]} />
        </mesh>
        <mesh position={[0, 0.068, 0]} material={soil}>
          <cylinderGeometry args={[0.042, 0.042, 0.008, 24]} />
        </mesh>
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2 + 0.4
          return (
            <group key={i} position={[0, 0.07, 0]} rotation-y={a}>
              <mesh geometry={leafGeo} material={leaf} position={[0.012, 0, 0]} rotation-x={-0.55 - (i % 3) * 0.15} castShadow />
            </group>
          )
        })}
      </group>

      {/* pen holder (left, beside the cup) */}
      <group position={[-0.62, T, -2.3]}>
        <mesh position={[0, 0.045, 0]} material={deskMat} castShadow receiveShadow>
          <cylinderGeometry args={[0.03, 0.028, 0.09, 20]} />
        </mesh>
        {[
          ['#2b2826', 0.12, 0.012, 0.15],
          ['#d3956a', 0.14, -0.35, 0.1],
          ['#efe6d6', 0.13, 0.2, -0.3],
        ].map(([c, h, rx, rz], i) => (
          <mesh key={i} position={[rz * 0.04, 0.08 + h / 2, rx * 0.04]} rotation={[rx, 0, rz]} castShadow>
            <cylinderGeometry args={[0.004, 0.004, h, 8]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* colour swatch cards (right, behind the plant) */}
      <group position={[0.88, T, -2.42]} rotation-y={0.35}>
        {swatchMats.map((m, i) => (
          <mesh key={i} geometry={swatchGeo} material={m} rotation-x={-Math.PI / 2} rotation-z={i * 0.25} position={[i * 0.012, 0.002 + i * 0.004, 0]} castShadow receiveShadow />
        ))}
      </group>

      {/* phone */}
      <mesh geometry={phoneGeo} material={phoneMat} rotation-x={-Math.PI / 2} rotation-z={-0.2} position={[0.7, T + 0.004, -2.15]} castShadow receiveShadow />

      {/* sketchbook with a pencil */}
      <group position={[-0.5, T, -2.47]} rotation-y={0.28}>
        <mesh geometry={bookGeo} material={sketch} rotation-x={-Math.PI / 2} position={[0, 0.007, 0]} castShadow receiveShadow />
        <mesh material={paper} position={[0, 0.0145, 0]}>
          <boxGeometry args={[0.2, 0.001, 0.28]} />
        </mesh>
        <mesh position={[0.06, 0.018, 0.02]} rotation={[0, 0.5, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.004, 0.004, 0.15, 8]} />
          <meshStandardMaterial color="#d8a04f" roughness={0.6} />
        </mesh>
      </group>

      {/* headphones on a stand */}
      <group position={[-0.84, T, -2.34]}>
        <mesh position={[0, 0.006, 0]} material={bronze} castShadow receiveShadow>
          <cylinderGeometry args={[0.05, 0.055, 0.012, 24]} />
        </mesh>
        <mesh position={[0, 0.13, 0]} material={bronze} castShadow>
          <cylinderGeometry args={[0.007, 0.007, 0.25, 12]} />
        </mesh>
        <group position={[0, 0.27, 0]} rotation-y={0.5}>
          <mesh material={cream} castShadow>
            <torusGeometry args={[0.075, 0.011, 10, 32, Math.PI]} />
          </mesh>
          {[-0.075, 0.075].map((x) => (
            <group key={x} position={[x, -0.01, 0]}>
              <mesh rotation-z={Math.PI / 2} material={cream} castShadow>
                <cylinderGeometry args={[0.036, 0.036, 0.024, 24]} />
              </mesh>
              <mesh rotation-z={Math.PI / 2} position={[x > 0 ? -0.014 : 0.014, 0, 0]} material={dark}>
                <cylinderGeometry args={[0.03, 0.03, 0.006, 24]} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* desk lamp (on), left rear corner beside the secondary monitor */}
      <group position={[-0.93, T, -2.74]}>
        <mesh position={[0, 0.007, 0]} material={bronze} castShadow receiveShadow>
          <cylinderGeometry args={[0.055, 0.06, 0.014, 24]} />
        </mesh>
        <mesh position={lampArm1.position} quaternion={lampArm1.quaternion} material={bronze} castShadow>
          <cylinderGeometry args={[0.006, 0.006, lampArm1.length, 10]} />
        </mesh>
        <mesh position={[0, 0.3, 0]} material={bronze}>
          <sphereGeometry args={[0.012, 12, 12]} />
        </mesh>
        <mesh position={lampArm2.position} quaternion={lampArm2.quaternion} material={bronze} castShadow>
          <cylinderGeometry args={[0.006, 0.006, lampArm2.length, 10]} />
        </mesh>
        <group position={[0.12, 0.35, 0.12]} rotation-z={0.45}>
          <mesh material={bronze} castShadow>
            <coneGeometry args={[0.062, 0.1, 24, 1, true]} />
          </mesh>
          <mesh position={[0, -0.02, 0]}>
            <sphereGeometry args={[0.018, 12, 12]} />
            <meshBasicMaterial color="#ffe4b8" />
          </mesh>
          <pointLight position={[0, -0.05, 0]} intensity={1.1} color="#ffd6a4" distance={1.5} decay={2} />
        </group>
      </group>
    </group>
  )
}
