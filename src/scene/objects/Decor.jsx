import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ROOM } from '../layout.js'
import { useSurfaceMaterial } from '../materials/useSurfaceMaterial.js'
import { useStaticCanvas } from '../hooks/useScreenCanvas.js'
import { paintPosterA, paintPosterB, paintPosterC } from '../screens/textures.js'
import { makeRoundedBoxGeometry } from '../utils/geometry.js'

const Z = ROOM.back + 0.012

/** Framed print on the back wall. */
function Poster({ position, size, painter, res, frameMat, matMat }) {
  const tex = useStaticCanvas(res[0], res[1], painter)
  const art = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }), [tex])
  const [w, h] = size
  return (
    <group position={position}>
      <mesh material={frameMat} castShadow receiveShadow>
        <boxGeometry args={[w + 0.05, h + 0.05, 0.022]} />
      </mesh>
      <mesh position={[0, 0, 0.0115]} material={matMat}>
        <planeGeometry args={[w + 0.02, h + 0.02]} />
      </mesh>
      <mesh position={[0, 0, 0.0125]} material={art}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </group>
  )
}

/** Cable as a tube along a few points. */
function Cable({ points, radius = 0.005, material }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))
    return new THREE.TubeGeometry(curve, 24, radius, 6, false)
  }, [points, radius])
  return <mesh geometry={geo} material={material} castShadow />
}

/** Small wall clock with real-time hands (tiny ambient motion). */
function Clock({ position }) {
  const hour = useRef()
  const minute = useRef()
  const second = useRef()
  useFrame(() => {
    const d = new Date()
    const s = d.getSeconds() + d.getMilliseconds() / 1000
    const m = d.getMinutes() + s / 60
    const h = (d.getHours() % 12) + m / 60
    if (second.current) second.current.rotation.z = -(s / 60) * Math.PI * 2
    if (minute.current) minute.current.rotation.z = -(m / 60) * Math.PI * 2
    if (hour.current) hour.current.rotation.z = -(h / 12) * Math.PI * 2
  })
  return (
    <group position={position}>
      <mesh rotation-x={Math.PI / 2} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.025, 40]} />
        <meshStandardMaterial color="#e9dfcc" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.013]}>
        <circleGeometry args={[0.098, 40]} />
        <meshStandardMaterial color="#fbf7ef" roughness={0.9} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[Math.sin((i / 12) * Math.PI * 2) * 0.082, Math.cos((i / 12) * Math.PI * 2) * 0.082, 0.014]}>
          <boxGeometry args={[0.004, i % 3 === 0 ? 0.014 : 0.008, 0.001]} />
          <meshStandardMaterial color="#3b342d" />
        </mesh>
      ))}
      <group ref={hour} position={[0, 0, 0.016]}>
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[0.006, 0.055, 0.002]} />
          <meshStandardMaterial color="#3b342d" />
        </mesh>
      </group>
      <group ref={minute} position={[0, 0, 0.018]}>
        <mesh position={[0, 0.036, 0]}>
          <boxGeometry args={[0.004, 0.078, 0.002]} />
          <meshStandardMaterial color="#3b342d" />
        </mesh>
      </group>
      <group ref={second} position={[0, 0, 0.02]}>
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.0015, 0.085, 0.001]} />
          <meshStandardMaterial color="#c97b4a" />
        </mesh>
      </group>
    </group>
  )
}

/**
 * Lived-in details: wall shelf with books + camera, posters, sticky notes,
 * cables, power strip, a bag on the floor and a clock.
 */
export default function Decor() {
  const shelfWood = useSurfaceMaterial({ kind: 'wood', color: '#caa274', dark: '#8a6238', strength: 0.4, scale: 2, grain: 'x', roughness: 0.55 })
  const frameDark = useSurfaceMaterial({ kind: 'plain', color: '#3b342d', roughness: 0.6 })
  const frameLight = useSurfaceMaterial({ kind: 'wood', color: '#dcc4a0', dark: '#a98a63', strength: 0.35, scale: 4, grain: 'x', roughness: 0.6 })
  const matte = useSurfaceMaterial({ kind: 'plain', color: '#fbf7ef', roughness: 0.95 })
  const cable = useSurfaceMaterial({ kind: 'plain', color: '#2a2725', roughness: 0.6 })
  const camBody = useSurfaceMaterial({ kind: 'plain', color: '#2b2926', roughness: 0.45, metalness: 0.3 })
  const camLeather = useSurfaceMaterial({ kind: 'fabric', color: '#6b5646', strength: 1, roughness: 0.9 })
  const camLens = useSurfaceMaterial({ kind: 'plain', color: '#1a1c22', roughness: 0.15, metalness: 0.6 })
  const ceramic = useSurfaceMaterial({ kind: 'plain', color: '#efe6d6', roughness: 0.4 })
  const bagMat = useSurfaceMaterial({ kind: 'fabric', color: '#6d7361', strength: 1, roughness: 1, rim: 0.06 })
  const white = useSurfaceMaterial({ kind: 'plain', color: '#f2ede4', roughness: 0.6 })
  const bagGeo = useMemo(() => makeRoundedBoxGeometry(0.28, 0.36, 0.15, 0.04), [])

  const books = [
    ['#7c9a72', 0.2, 0.03],
    ['#3b342d', 0.22, 0.026],
    ['#d3956a', 0.18, 0.02],
    ['#e8dcc6', 0.21, 0.034],
    ['#5b7a9e', 0.19, 0.024],
    ['#c9b5e6', 0.17, 0.018],
  ]

  return (
    <group name="decor">
      {/* wall shelf between window and desk */}
      <group position={[-1.6, 1.5, ROOM.back + 0.1]}>
        <mesh material={shelfWood} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.03, 0.2]} />
        </mesh>
        {[-0.3, 0.3].map((x) => (
          <mesh key={x} position={[x, -0.06, -0.05]} material={frameDark} castShadow>
            <boxGeometry args={[0.02, 0.09, 0.09]} />
          </mesh>
        ))}
        {/* books */}
        {books.map(([c, h, w], i) => {
          const x = -0.36 + books.slice(0, i).reduce((a, b) => a + b[2], 0) + w / 2
          const lean = i === books.length - 1 ? 0.28 : 0
          return (
            <mesh key={i} position={[x + (lean ? 0.02 : 0), 0.015 + h / 2, -0.02]} rotation-z={lean} castShadow receiveShadow>
              <boxGeometry args={[w, h, 0.14]} />
              <meshStandardMaterial color={c} roughness={0.85} />
            </mesh>
          )
        })}
        {/* camera */}
        <group position={[0.15, 0.048, 0.0]} rotation-y={-0.5}>
          <mesh material={camBody} castShadow>
            <boxGeometry args={[0.11, 0.066, 0.05]} />
          </mesh>
          <mesh position={[0, 0, 0.001]} material={camLeather}>
            <boxGeometry args={[0.108, 0.036, 0.051]} />
          </mesh>
          <mesh position={[0.005, 0.005, 0.038]} rotation-x={Math.PI / 2} material={camLens} castShadow>
            <cylinderGeometry args={[0.024, 0.026, 0.03, 20]} />
          </mesh>
          <mesh position={[0.005, 0.005, 0.054]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.016, 0.016, 0.002, 20]} />
            <meshStandardMaterial color="#3a4b6a" roughness={0.1} metalness={0.5} />
          </mesh>
          <mesh position={[-0.035, 0.04, 0]} material={camBody}>
            <cylinderGeometry args={[0.012, 0.012, 0.012, 14]} />
          </mesh>
          <mesh position={[0.04, 0.04, 0]} material={camBody}>
            <cylinderGeometry args={[0.008, 0.008, 0.01, 14]} />
          </mesh>
        </group>
        {/* small ceramic vase */}
        <group position={[0.32, 0.015, 0.02]}>
          <mesh position={[0, 0.05, 0]} material={ceramic} castShadow>
            <cylinderGeometry args={[0.028, 0.04, 0.1, 20]} />
          </mesh>
          <mesh position={[0, 0.1, 0]} material={ceramic}>
            <sphereGeometry args={[0.02, 14, 12]} />
          </mesh>
        </group>
      </group>

      {/* framed prints */}
      <Poster position={[-1.05, 2.02, Z]} size={[0.36, 0.48]} res={[256, 340]} painter={paintPosterA} frameMat={frameLight} matMat={matte} />
      <Poster position={[-0.55, 2.12, Z]} size={[0.26, 0.26]} res={[256, 256]} painter={paintPosterB} frameMat={frameDark} matMat={matte} />
      <Poster position={[0.7, 1.95, Z]} size={[0.3, 0.225]} res={[320, 240]} painter={paintPosterC} frameMat={frameDark} matMat={matte} />

      {/* sticky notes near the secondary monitor */}
      {[
        [-1.22, 1.32, '#f4de7a', 0.08],
        [-1.13, 1.24, '#f6c6c0', -0.12],
        [-1.28, 1.2, '#c9e2c4', 0.2],
      ].map(([x, y, c, r], i) => (
        <mesh key={i} position={[x, y, Z]} rotation-z={r}>
          <planeGeometry args={[0.065, 0.065]} />
          <meshStandardMaterial color={c} roughness={0.95} />
        </mesh>
      ))}

      {/* clock above the car display */}
      <Clock position={[1.5, 2.35, Z + 0.01]} />

      {/* cables: monitors + PC -> down behind the desk -> power strip */}
      <Cable
        material={cable}
        points={[
          [0.05, 0.95, -2.78],
          [0.1, 0.7, -2.86],
          [0.4, 0.12, -2.9],
          [0.6, 0.05, -2.9],
        ]}
      />
      <Cable
        material={cable}
        points={[
          [-0.76, 0.95, -2.75],
          [-0.7, 0.6, -2.87],
          [-0.2, 0.05, -2.9],
          [0.55, 0.04, -2.92],
        ]}
      />
      <Cable
        material={cable}
        points={[
          [0.76, 0.78, -2.72],
          [0.8, 0.5, -2.88],
          [0.7, 0.06, -2.92],
        ]}
        radius={0.004}
      />
      {/* power strip */}
      <mesh position={[0.6, 0.02, -2.92]} material={white} castShadow receiveShadow>
        <boxGeometry args={[0.26, 0.04, 0.06]} />
      </mesh>

      {/* bag leaning against the wall left of the desk */}
      <group position={[-1.25, 0.18, -2.78]} rotation={[-0.18, 0.25, 0]}>
        <mesh geometry={bagGeo} material={bagMat} castShadow receiveShadow />
        <mesh position={[0, 0.16, 0.06]} rotation-x={0.4} material={frameDark}>
          <torusGeometry args={[0.05, 0.008, 8, 20, Math.PI]} />
        </mesh>
      </group>
    </group>
  )
}
