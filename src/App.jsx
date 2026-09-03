import { useEffect, useState } from 'react'
import Scene from './scene/Scene.jsx'
import Overlay from './ui/Overlay.jsx'

/**
 * App
 *  Scene   : the 3D world (Canvas). Frames live under scene/frames.
 *  Overlay : the HTML portfolio UI layered on top (name, hints, design laws).
 * The two layers never share DOM; they only talk through the zustand store.
 */
export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Let the first frames compile shaders, then reveal the scene.
    const t = setTimeout(() => setReady(true), 350)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`app ${ready ? 'is-ready' : ''}`}>
      <Scene />
      <Overlay />
      <div className="vignette" aria-hidden="true" />
      <div className="veil" aria-hidden="true" />
    </div>
  )
}
