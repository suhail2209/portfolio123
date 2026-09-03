import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useGLTF, useAnimations } from '@react-three/drei'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
import { useSurfaceMaterial } from '../materials/useSurfaceMaterial.js'
import { useInteractive } from '../hooks/useInteractive.js'
import { makeRoundedSlabGeometry } from '../utils/geometry.js'
import Tooltip from '../../ui/Tooltip.jsx'

export const CAT_URL = '/models/bicolor-cat.glb'

/**
 * Playback configuration for the cat's single clip. Refined from the animation analysis.
 *  mode: 'loop-segment' | 'freeze-frame' | 'play-all' | 'still'
 */
export const CAT_ANIM = { mode: 'still', start: 0, end: 0, freezeTime: 0, timeScale: 1 }
/** Placement of the model root inside the cat-house group (local space). */
export const CAT_PLACEMENT = { position: [0, 0.07, 0.02], rotationY: 0, scale: 1 }

/** The GLB cat (materials/textures untouched). */
function CatModel({ anim = CAT_ANIM, placement = CAT_PLACEMENT }) {
  const { scene, animations } = useGLTF(CAT_URL)
  const model = useMemo(() => {
    const m = SkeletonUtils.clone(scene)
    m.traverse((o) => {
      if (o.isMesh || o.isSkinnedMesh) {
        o.castShadow = true
        o.receiveShadow = true
        o.frustumCulled = false
      }
    })
    return m
  }, [scene])
  const root = useRef()

  // Sub-clip when a segment is requested so looping stays within it.
  const clips = useMemo(() => {
    if (!animations?.length) return []
    const clip = animations[0]
    if (anim.mode === 'loop-segment' && anim.end > anim.start) {
      const fps = 30
      const sub = THREE.AnimationUtils.subclip(clip, 'segment', Math.round(anim.start * fps), Math.round(anim.end * fps), fps)
      return [sub]
    }
    return [clip]
  }, [animations, anim])

  const { actions, mixer } = useAnimations(clips, root)

  useEffect(() => {
    const name = clips[0]?.name
    const action = name ? actions[name] : null
    if (!action) return
    if (anim.mode === 'still') return
    action.reset()
    action.setLoop(THREE.LoopRepeat, Infinity)
    action.timeScale = anim.timeScale ?? 1
    action.play()
    if (anim.mode === 'freeze-frame') {
      action.paused = true
      action.time = anim.freezeTime
      mixer.update(0)
    }
    return () => action.stop()
  }, [actions, mixer, clips, anim])

  return (
    <group ref={root} position={placement.position} rotation-y={placement.rotationY} scale={placement.scale} name="cat-model">
      <primitive object={model} />
    </group>
  )
}

/**
 * Cat house on the right side of the room with the GLB cat inside.
 * Interaction + tooltip + Zzz are kept from the placeholder version.
 */
export default function Cat() {
  const houseWood = useSurfaceMaterial({ kind: 'wood', color: '#f1e6d2', dark: '#c9b69a', strength: 0.35, scale: 3, grain: 'y', roughness: 0.8 })
  const roof = useSurfaceMaterial({ kind: 'fabric', color: '#8c9c79', strength: 0.8, roughness: 0.95 })
  const cushion = useSurfaceMaterial({ kind: 'fabric', color: '#d9c9a8', strength: 1, roughness: 1, rim: 0.06 })
  const bowl = useSurfaceMaterial({ kind: 'plain', color: '#dfd6c6', roughness: 0.5 })
  const cushionGeo = useMemo(() => makeRoundedSlabGeometry(0.42, 0.38, 0.05, 0.12, 0.02), [])

  const { ref, hovered, bind } = useInteractive('cat', { scale: 1.02 })
  const zzz = useRef()
  useFrame(() => {})

  return (
    <group ref={ref} {...bind} name="cat" position={[1.84, 0, -2.36]} rotation-y={-0.18}>
      {/* cat house */}
      <group>
        <mesh position={[0, 0.01, 0]} material={houseWood} castShadow receiveShadow>
          <boxGeometry args={[0.52, 0.02, 0.46]} />
        </mesh>
        <mesh position={[0, 0.19, -0.22]} material={houseWood} castShadow receiveShadow>
          <boxGeometry args={[0.52, 0.36, 0.02]} />
        </mesh>
        {[-0.25, 0.25].map((x) => (
          <mesh key={x} position={[x, 0.19, 0]} material={houseWood} castShadow receiveShadow>
            <boxGeometry args={[0.02, 0.36, 0.46]} />
          </mesh>
        ))}
        <group position={[0, 0.37, 0]}>
          <mesh position={[-0.145, 0.075, 0]} rotation-z={0.52} material={roof} castShadow receiveShadow>
            <boxGeometry args={[0.34, 0.022, 0.52]} />
          </mesh>
          <mesh position={[0.145, 0.075, 0]} rotation-z={-0.52} material={roof} castShadow receiveShadow>
            <boxGeometry args={[0.34, 0.022, 0.52]} />
          </mesh>
          <mesh position={[0, 0, -0.22]} rotation-x={Math.PI / 2} material={houseWood}>
            <cylinderGeometry args={[0.0, 0.29, 0.02, 3, 1]} />
          </mesh>
        </group>
        <mesh geometry={cushionGeo} material={cushion} rotation-x={-Math.PI / 2} position={[0, 0.045, 0]} receiveShadow castShadow />
      </group>

      {/* the cat (external asset) */}
      <CatModel />

      {/* Zzz above the cat's head */}
      <group ref={zzz} position={[0.12, 0.3, 0.12]}>
        <Html zIndexRange={[12, 12]} style={{ pointerEvents: 'none' }}>
          <div className="zzz">
            <span>z</span>
            <span>z</span>
            <span>z</span>
          </div>
        </Html>
      </group>

      {/* food bowl + toy */}
      <mesh position={[-0.38, 0.015, 0.12]} material={bowl} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.042, 0.03, 20]} />
      </mesh>
      <mesh position={[-0.3, 0.02, 0.28]} castShadow>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshStandardMaterial color="#d3956a" roughness={0.8} />
      </mesh>

      <Tooltip visible={hovered} position={[0, 0.72, 0]} title="My furry co-worker." sub="Currently doing absolutely nothing." />
    </group>
  )
}

useGLTF.preload(CAT_URL)
