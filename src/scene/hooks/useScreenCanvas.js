import * as THREE from 'three'
import { useMemo, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Animated 2D canvas -> CanvasTexture, repainted at a throttled fps.
 * painter(ctx, width, height, timeSeconds)
 */
export function useScreenCanvas(width, height, painter, fps = 12) {
  const { canvas, texture } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = true
    return { canvas, texture }
  }, [width, height])

  const last = useRef(-1)
  const ctx = useMemo(() => canvas.getContext('2d'), [canvas])

  useEffect(() => () => texture.dispose(), [texture])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (t - last.current < 1 / fps) return
    last.current = t
    painter(ctx, width, height, t)
    texture.needsUpdate = true
  })

  return texture
}

/** Static painted texture (posters, outside backdrop). */
export function useStaticCanvas(width, height, painter) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    painter(canvas.getContext('2d'), width, height)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return tex
  }, [width, height, painter])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}
