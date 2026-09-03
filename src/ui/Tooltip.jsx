import { Html } from '@react-three/drei'

/**
 * Small HTML tooltip anchored to a 3D position. Styled like the portfolio UI
 * (paper card, serif italic), not like a game label.
 */
export default function Tooltip({ visible, position, title, sub }) {
  if (!visible) return null
  return (
    <Html position={position} zIndexRange={[13, 13]} style={{ pointerEvents: 'none' }}>
      <div className="tip">
        <div className="tip__card">
          <div className="tip__title">{title}</div>
          {sub && <div className="tip__sub">{sub}</div>}
        </div>
        <div className="tip__stem" />
      </div>
    </Html>
  )
}
