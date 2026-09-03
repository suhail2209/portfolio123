import * as THREE from 'three'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'

export const CHARACTER_URL = '/models/designer.glb'

/**
 * Static seated pose.
 * Each entry aims a bone's +Y axis (which runs along the bone toward its child)
 * at a WORLD direction, with minimal twist. Applied once at load. No animation.
 * World frame here is the final scene frame: character faces -Z, left hand at -X.
 * Numbers are refined from the skeleton analysis (see tools/ and the report).
 */
export const SEATED_POSE = [
  { bone: 'Spine', aim: [0, 0.985, -0.17] },
  { bone: 'Spine1', aim: [0, 0.99, -0.14] },
  { bone: 'Spine2', aim: [0, 0.995, -0.1] },
  { bone: 'Neck', aim: [0, 0.98, -0.2] },
  { bone: 'Head', aim: [0, 1, 0.02] },
  { bone: 'LeftUpLeg', aim: [-0.1, -0.12, -1] },
  { bone: 'RightUpLeg', aim: [0.1, -0.12, -1] },
  { bone: 'LeftLeg', aim: [0, -1, -0.05] },
  { bone: 'RightLeg', aim: [0, -1, -0.05] },
  { bone: 'LeftFoot', aim: [0, -0.35, -1] },
  { bone: 'RightFoot', aim: [0, -0.35, -1] },
  { bone: 'LeftArm', aim: [-0.2, -0.88, -0.42] },
  { bone: 'RightArm', aim: [0.2, -0.88, -0.42] },
  { bone: 'LeftForeArm', aim: [0.12, -0.12, -1] },
  { bone: 'RightForeArm', aim: [-0.12, -0.12, -1] },
  { bone: 'LeftHand', aim: [0.05, -0.3, -1] },
  { bone: 'RightHand', aim: [-0.05, -0.3, -1] },
]

const _q1 = new THREE.Quaternion()
const _q2 = new THREE.Quaternion()
const _q3 = new THREE.Quaternion()
const _v1 = new THREE.Vector3()
const _v2 = new THREE.Vector3()

/** Rotate `bone` so its local +Y points along worldDir (minimal twist). */
export function aimBone(bone, worldDir) {
  bone.updateWorldMatrix(true, false)
  bone.parent.getWorldQuaternion(_q1)
  bone.getWorldQuaternion(_q2)
  _v1.set(0, 1, 0).applyQuaternion(_q2).normalize()
  _v2.set(worldDir[0], worldDir[1], worldDir[2]).normalize()
  _q3.setFromUnitVectors(_v1, _v2)
  _q3.multiply(_q2) // delta * world
  bone.quaternion.copy(_q1.invert().multiply(_q3))
  bone.updateMatrixWorld(true)
}

/**
 * Ready Player Me style avatar, loaded from /public/models/designer.glb.
 * Materials, textures and proportions are left exactly as exported.
 */
export default function Character({ position = [0, 0, 0], rotation = [0, Math.PI, 0], pose = SEATED_POSE, scale = 1 }) {
  const { scene } = useGLTF(CHARACTER_URL)
  const root = useRef()
  // Clone so the cached GLTF scene stays pristine (skeleton-aware clone).
  const model = useMemo(() => {
    const m = SkeletonUtils.clone(scene)
    m.traverse((o) => {
      if (o.isMesh || o.isSkinnedMesh) {
        o.castShadow = true
        o.receiveShadow = true
        o.frustumCulled = false // skinned bounds are static; never cull the avatar
      }
    })
    return m
  }, [scene])

  useLayoutEffect(() => {
    if (!root.current || !pose) return
    root.current.updateWorldMatrix(true, true)
    for (const { bone, aim } of pose) {
      const b = model.getObjectByName(bone)
      if (!b) {
        console.warn(`[Character] bone not found: ${bone}`)
        continue
      }
      aimBone(b, aim)
    }
    model.updateMatrixWorld(true)
  }, [model, pose])

  return (
    <group ref={root} position={position} rotation={rotation} scale={scale} name="character">
      <primitive object={model} />
    </group>
  )
}

useGLTF.preload(CHARACTER_URL)
