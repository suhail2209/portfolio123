import { useCallback, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../../store/useStore.js'

/**
 * Makes a group hoverable/clickable with a subtle lift.
 * Returns { ref, bind, hovered } where `bind` spreads onto the <group>.
 */
export function useInteractive(id, { scale = 1.02, lift = 0 } = {}) {
  const ref = useRef()
  const hovered = useStore((s) => s.hovered === id)
  const setHovered = useStore((s) => s.setHovered)
  const base = useRef(null)

  const onPointerOver = useCallback(
    (e) => {
      e.stopPropagation()
      setHovered(id)
    },
    [id, setHovered],
  )
  const onPointerOut = useCallback(
    (e) => {
      e.stopPropagation()
      setHovered((cur) => (cur === id ? null : cur))
    },
    [id, setHovered],
  )
  const onClick = useCallback(
    (e) => {
      e.stopPropagation()
      setHovered(id)
    },
    [id, setHovered],
  )

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered])

  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    if (!base.current) base.current = { y: g.position.y }
    const k = 1 - Math.exp(-dt * 8)
    const s = hovered ? scale : 1
    g.scale.x += (s - g.scale.x) * k
    g.scale.y += (s - g.scale.y) * k
    g.scale.z += (s - g.scale.z) * k
    const ty = base.current.y + (hovered ? lift : 0)
    g.position.y += (ty - g.position.y) * k
  })

  return { ref, hovered, bind: { onPointerOver, onPointerOut, onClick } }
}
