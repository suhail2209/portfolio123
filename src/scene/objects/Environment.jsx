import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ROOM, WINDOW, SUN, PALETTE } from '../layout.js'
import { useSurfaceMaterial } from '../materials/useSurfaceMaterial.js'
import { createLightShaftMaterial } from '../materials/LightShaftMaterial.js'
import { useStaticCanvas } from '../hooks/useScreenCanvas.js'
import { paintOutside } from '../screens/textures.js'
import { makeLeafGeometry } from '../utils/geometry.js'

const SUN_DIR = new THREE.Vector3(...SUN.target).sub(new THREE.Vector3(...SUN.position)).normalize()

/** Sun shafts: a few faint additive slabs following the sun direction through the window. */
function SunShafts() {
  const mat = useMemo(() => createLightShaftMaterial(0.095), [])
  const geo = useMemo(() => {
    const zs = [-2.62, -2.36, -2.1, -1.84, -1.58]
    const verts = []
    const uvs = []
    const push = (v, u) => {
      verts.push(v.x, v.y, v.z)
      uvs.push(u[0], u[1])
    }
    const reach = 0.8
    zs.forEach((z) => {
      const A = new THREE.Vector3(WINDOW.x, WINDOW.yMax, z)
      const B = new THREE.Vector3(WINDOW.x, WINDOW.yMin, z)
      const C = A.clone().add(SUN_DIR.clone().multiplyScalar((WINDOW.yMax / -SUN_DIR.y) * reach))
      const D = B.clone().add(SUN_DIR.clone().multiplyScalar((WINDOW.yMin / -SUN_DIR.y) * reach))
      // two triangles: A B D, A D C
      push(A, [0, 1])
      push(B, [1, 1])
      push(D, [1, 0])
      push(A, [0, 1])
      push(D, [1, 0])
      push(C, [0, 0])
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    return g
  }, [])
  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.getElapsedTime()
  })
  return <mesh geometry={geo} material={mat} renderOrder={5} />
}

/** A handful of slow dust motes inside the sunlight. */
function Dust({ count = 70 }) {
  const ref = useRef()
  const { positions, base } = useMemo(() => {
    const base = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const y = WINDOW.yMin + Math.random() * (WINDOW.yMax - WINDOW.yMin)
      const z = WINDOW.zMin + Math.random() * (WINDOW.zMax - WINDOW.zMin)
      const s = 0.2 + Math.random() * 2.6
      base[i * 3] = WINDOW.x + SUN_DIR.x * s
      base[i * 3 + 1] = y + SUN_DIR.y * s
      base[i * 3 + 2] = z + SUN_DIR.z * s
    }
    return { positions: base.slice(), base }
  }, [count])
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const arr = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      arr[i * 3] = base[i * 3] + Math.sin(t * 0.21 + i) * 0.05
      arr[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.13 + i * 1.7) * 0.04
      arr[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.17 + i * 0.9) * 0.05
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.012} color="#fff3d6" transparent opacity={0.45} depthWrite={false} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  )
}

/** Big leafy plant on the floor beside the window. */
function FloorPlant({ position }) {
  const pot = useSurfaceMaterial({ kind: 'plain', color: PALETTE.terracotta, roughness: 0.85 })
  const soil = useSurfaceMaterial({ kind: 'plain', color: '#4a3a2c', roughness: 1 })
  const leaf = useSurfaceMaterial({ kind: 'sway', color: '#6f8f5e', strength: 1, top: 0.3, height: 1.0, roughness: 0.65, side: THREE.DoubleSide })
  const stem = useSurfaceMaterial({ kind: 'sway', color: '#5d7a4d', strength: 1, top: 0.3, height: 1.0, roughness: 0.8 })
  const leafGeo = useMemo(() => makeLeafGeometry(0.3, 0.13, 1), [])
  const leaves = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        a: (i / 7) * Math.PI * 2 + 0.7,
        h: 0.45 + (i % 3) * 0.14,
        tilt: 0.55 + (i % 2) * 0.25,
        len: 0.42 + (i % 3) * 0.08,
        s: 0.85 + (i % 4) * 0.08,
      })),
    [],
  )
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]} material={pot} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.3, 28]} />
      </mesh>
      <mesh position={[0, 0.295, 0]} material={soil}>
        <cylinderGeometry args={[0.14, 0.14, 0.012, 28]} />
      </mesh>
      {leaves.map((l, i) => (
        <group key={i} position={[0, 0.3, 0]} rotation-y={l.a}>
          <group rotation-z={-l.tilt * 0.55}>
            <mesh position={[0, l.len / 2, 0]} material={stem} castShadow>
              <cylinderGeometry args={[0.005, 0.008, l.len, 8]} />
            </mesh>
            <mesh geometry={leafGeo} material={leaf} position={[0, l.len, 0]} rotation-z={-l.tilt * 0.6} rotation-x={-0.3} scale={l.s} castShadow />
          </group>
        </group>
      ))}
    </group>
  )
}

/** Foliage just outside the window: casts soft moving dapples into the room. */
function OutsideFoliage({ position, seed = 0 }) {
  const leafA = useSurfaceMaterial({ kind: 'sway', color: '#7fa06c', strength: 1.8, top: 0.4, height: 1.6, roughness: 0.8 })
  const leafB = useSurfaceMaterial({ kind: 'sway', color: '#95b27e', strength: 1.8, top: 0.4, height: 1.6, roughness: 0.8 })
  const wood = useSurfaceMaterial({ kind: 'plain', color: '#6b5238', roughness: 0.9 })
  const blobs = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        p: [Math.sin(i * 2.1 + seed) * 0.22, Math.cos(i * 1.3 + seed) * 0.16, Math.sin(i * 0.7 + seed) * 0.2],
        r: 0.13 + ((i + seed) % 3) * 0.035,
        m: i % 2,
      })),
    [seed],
  )
  return (
    <group position={position}>
      <mesh position={[0, -0.6, 0]} material={wood} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 1.2, 10]} />
      </mesh>
      {blobs.map((b, i) => (
        <mesh key={i} position={b.p} material={b.m ? leafA : leafB} castShadow>
          <sphereGeometry args={[b.r, 16, 12]} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Left wall with the window, frame, glass, curtain, outside view,
 * sun shafts, dust and the floor plant.
 */
export default function Environment() {
  const wall = useSurfaceMaterial({ kind: 'wall', color: PALETTE.wall, strength: 1, roughness: 0.96 })
  const frame = useSurfaceMaterial({ kind: 'plain', color: '#f7f0e4', roughness: 0.6 })
  const curtainMat = useSurfaceMaterial({
    kind: 'curtain',
    color: '#f4e9d6',
    strength: 1,
    top: 1.15,
    height: 2.3,
    roughness: 0.95,
    side: THREE.DoubleSide,
  })
  const rod = useSurfaceMaterial({ kind: 'plain', color: '#4a3b30', roughness: 0.4, metalness: 0.5 })
  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#dcedf8',
        transparent: true,
        opacity: 0.14,
        roughness: 0.03,
        metalness: 0,
        envMapIntensity: 1.2,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [],
  )
  const outsideTex = useStaticCanvas(1024, 640, paintOutside)
  const outsideMat = useMemo(() => new THREE.MeshBasicMaterial({ map: outsideTex, fog: true }), [outsideTex])

  const wx = ROOM.left - 0.06 // wall centre (0.12 thick, inner face at ROOM.left)
  const { zMin, zMax, yMin, yMax } = WINDOW
  const zc = (zMin + zMax) / 2
  const zw = zMax - zMin
  const yc = (yMin + yMax) / 2
  const yh = yMax - yMin

  return (
    <group name="environment">
      {/* window wall (4 pieces around the opening) */}
      <mesh position={[wx, yMin / 2, zc]} material={wall} receiveShadow castShadow>
        <boxGeometry args={[0.12, yMin, zw]} />
      </mesh>
      <mesh position={[wx, (yMax + ROOM.h) / 2, zc]} material={wall} receiveShadow castShadow>
        <boxGeometry args={[0.12, ROOM.h - yMax, zw]} />
      </mesh>
      <mesh position={[wx, ROOM.h / 2, (ROOM.back + zMin) / 2]} material={wall} receiveShadow castShadow>
        <boxGeometry args={[0.12, ROOM.h, zMin - ROOM.back]} />
      </mesh>
      <mesh position={[wx, ROOM.h / 2, (zMax + ROOM.d / 2) / 2]} material={wall} receiveShadow castShadow>
        <boxGeometry args={[0.12, ROOM.h, ROOM.d / 2 - zMax]} />
      </mesh>
      {/* skirting on the window wall */}
      <mesh position={[ROOM.left + 0.008, 0.05, 0]} material={frame} receiveShadow>
        <boxGeometry args={[0.016, 0.1, ROOM.d]} />
      </mesh>

      {/* window frame + mullions + sill */}
      <group position={[ROOM.left - 0.04, 0, 0]}>
        <mesh position={[0, yMax - 0.025, zc]} material={frame} castShadow receiveShadow>
          <boxGeometry args={[0.07, 0.05, zw]} />
        </mesh>
        <mesh position={[0, yMin + 0.025, zc]} material={frame} castShadow receiveShadow>
          <boxGeometry args={[0.07, 0.05, zw]} />
        </mesh>
        <mesh position={[0, yc, zMin + 0.025]} material={frame} castShadow receiveShadow>
          <boxGeometry args={[0.07, yh, 0.05]} />
        </mesh>
        <mesh position={[0, yc, zMax - 0.025]} material={frame} castShadow receiveShadow>
          <boxGeometry args={[0.07, yh, 0.05]} />
        </mesh>
        <mesh position={[0, yc, zc]} material={frame} castShadow receiveShadow>
          <boxGeometry args={[0.05, yh, 0.035]} />
        </mesh>
        <mesh position={[0, yc + 0.18, zc]} material={frame} castShadow receiveShadow>
          <boxGeometry args={[0.05, 0.035, zw]} />
        </mesh>
        {/* sill */}
        <mesh position={[0.08, yMin - 0.012, zc]} material={frame} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.03, zw + 0.16]} />
        </mesh>
        {/* glass */}
        <mesh position={[-0.03, yc, zc]} rotation-y={Math.PI / 2} material={glass}>
          <planeGeometry args={[zw, yh]} />
        </mesh>
      </group>

      {/* outside */}
      <mesh position={[ROOM.left - 2.2, 2.1, -1.9]} rotation-y={Math.PI / 2} material={outsideMat}>
        <planeGeometry args={[10, 6]} />
      </mesh>
      <OutsideFoliage position={[ROOM.left - 0.55, 1.75, -1.6]} seed={0} />
      <OutsideFoliage position={[ROOM.left - 0.7, 1.55, -2.5]} seed={3} />

      {/* curtain (rod + one panel pulled to the front side of the window) */}
      <mesh position={[ROOM.left + 0.1, 2.58, (zMin + zMax) / 2 + 0.25]} rotation-x={Math.PI / 2} material={rod} castShadow>
        <cylinderGeometry args={[0.011, 0.011, zw + 0.9, 10]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[ROOM.left + 0.1, 2.58, (zMin + zMax) / 2 + 0.25 + (s * (zw + 0.9)) / 2]} material={rod}>
          <sphereGeometry args={[0.02, 10, 10]} />
        </mesh>
      ))}
      <group position={[ROOM.left + 0.12, 1.4, zMax + 0.16]} rotation-y={Math.PI / 2}>
        <mesh material={curtainMat} castShadow receiveShadow>
          <planeGeometry args={[0.72, 2.3, 48, 40]} />
        </mesh>
      </group>

      <SunShafts />
      <Dust />
      <FloorPlant position={[-2.25, 0, -2.45]} />
    </group>
  )
}
