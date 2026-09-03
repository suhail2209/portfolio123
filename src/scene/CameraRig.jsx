import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CAMERA } from './layout.js'

/**
 * Fixed third-person camera for Frame 1.
 * - keeps a constant horizontal field of view across aspect ratios
 * - adds a barely-there pointer parallax and idle drift for a cinematic feel
 * Scroll-driven camera moves between frames will plug in here later.
 */
export default function CameraRig() {
  const { camera, size } = useThree()
  // Dev aid: ?cam=x,y,z,tx,ty,tz[&fov=deg] overrides the hero camera (used for headless checks).
  const override = useMemo(() => {
    const q = new URLSearchParams(window.location.search)
    const c = q.get('cam')
    if (!c) return null
    const v = c.split(',').map(Number)
    if (v.length < 6 || v.some((n) => Number.isNaN(n))) return null
    return { position: v.slice(0, 3), target: v.slice(3, 6), fov: Number(q.get('fov')) || null }
  }, [])
  const target = useMemo(() => new THREE.Vector3(...(override ? override.target : CAMERA.target)), [override])
  const base = useMemo(() => new THREE.Vector3(...(override ? override.position : CAMERA.position)), [override])
  const smooth = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const aspect = size.width / size.height
    const h = THREE.MathUtils.degToRad(override?.fov || CAMERA.horizontalFov)
    const v = 2 * Math.atan(Math.tan(h / 2) / aspect)
    camera.fov = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(v), 20, 82)
    camera.updateProjectionMatrix()
  }, [camera, size, override])

  useFrame((state, dt) => {
    if (override) {
      camera.position.copy(base)
      camera.lookAt(target)
      return
    }
    const t = state.clock.getElapsedTime()
    const k = 1 - Math.exp(-dt * 2.2)
    smooth.current.x += (state.pointer.x - smooth.current.x) * k
    smooth.current.y += (state.pointer.y - smooth.current.y) * k
    camera.position.set(
      base.x + smooth.current.x * 0.05 + Math.sin(t * 0.23) * 0.006,
      base.y + smooth.current.y * 0.03 + Math.sin(t * 0.31) * 0.004,
      base.z,
    )
    camera.lookAt(target.x + smooth.current.x * 0.02, target.y + smooth.current.y * 0.015, target.z)
  })

  return null
}
