import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { DESK } from '../layout.js'
import { createScreenMaterial } from '../materials/ScreenMaterial.js'
import { useScreenCanvas } from '../hooks/useScreenCanvas.js'
import { useInteractive } from '../hooks/useInteractive.js'
import { paintMainScreen } from '../screens/mainScreen.js'

export const SETUP_URL = '/models/pc-setup.glb'

/**
 * "Gaming PC with Curved Monitor" (SINNIK, Sketchfab, CC-BY-4.0).
 * The set ships with its own glass table; we keep the room's wooden desk and
 * hide the table meshes (showTable=false), lifting the rest onto our desk top.
 * Materials are left as exported except the dead-black "MonitorScreen" mesh,
 * which receives the portfolio's animated design-tool screen (projected by
 * position so the asset's UVs are never needed). Set liveScreen=false to keep
 * the original black screen.
 *
 * Model facts (from tools/inspect-glb.mjs): Y-up after its root matrix, faces +Z,
 * table top at y=0.64..0.69, monitor 1.09 m wide, PC on the right at x 0.6..0.82.
 */
export const SETUP_PLACEMENT = { position: [0.05, DESK.top - 0.686, -2.49], rotationY: 0, scale: 1 }

// Screen mesh bounds in its own (Z-up) mesh space: x = width, z = height.
const SCREEN_BOUNDS = { min: [-0.533, 0.836], max: [0.531, 1.164] }

export default function Setup({ showTable = false, liveScreen = true, placement = SETUP_PLACEMENT }) {
  const { scene } = useGLTF(SETUP_URL)
  const screenTex = useScreenCanvas(1024, 432, paintMainScreen, 12)
  const screenMat = useMemo(() => createScreenMaterial(screenTex, { uvMode: 1, ...SCREEN_BOUNDS }), [screenTex])

  const model = useMemo(() => {
    const m = scene.clone(true)
    m.traverse((o) => {
      if (!o.isMesh) return
      o.castShadow = true
      o.receiveShadow = true
      const mat = o.material?.name || ''
      if (mat.startsWith('LLIM_Table')) o.visible = showTable
      if (mat === 'MonitorScreen' && liveScreen) o.material = screenMat
    })
    return m
  }, [scene, showTable, liveScreen, screenMat])

  const { ref, hovered, bind } = useInteractive('monitor', { scale: 1 })
  const hover = useRef(0)
  useFrame(({ clock }, dt) => {
    hover.current += ((hovered ? 1 : 0) - hover.current) * (1 - Math.exp(-dt * 6))
    screenMat.uniforms.uTime.value = clock.getElapsedTime()
    screenMat.uniforms.uHover.value = hover.current
  })

  return (
    <group name="setup" ref={ref} {...bind} position={placement.position} rotation-y={placement.rotationY} scale={placement.scale}>
      <primitive object={model} />
    </group>
  )
}

useGLTF.preload(SETUP_URL)
