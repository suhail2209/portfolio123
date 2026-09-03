import DesignLaw from './DesignLaw.jsx'

/**
 * Minimal portfolio UI layered over the 3D scene.
 * Kept deliberately quiet: the room is the visual, the UI is the frame.
 */
export default function Overlay() {
  return (
    <div className="overlay">
      <header className="brand">
        <div className="brand__name">SUHAIL</div>
        <div className="brand__role">UI/UX DESIGNER</div>
      </header>

      <div className="scroll-hint">
        <span>Scroll to explore</span>
        <span className="scroll-hint__arrow">↓</span>
      </div>

      <DesignLaw index="01" lines={['Make the interface disappear.', 'Let the experience speak.']} />
    </div>
  )
}
