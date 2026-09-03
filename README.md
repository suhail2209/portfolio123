# Suhail — 3D UI/UX Designer Portfolio

A living 3D portfolio built with React, React Three Fiber and Three.js.
Everything in the scene is procedural geometry and custom shaders — no Blender, no downloaded assets.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build
```

Append `?debug` to the URL to surface runtime errors on screen.

## Status

**Frame 1 — Designer's Room** is built. Frames 2–4 are intentionally not started.

| Frame | Section | Status |
| ----- | ---------------------------- | ----------- |
| 1 | Designer's room (hero) | prototype ✓ |
| 2 | Work / notice board | not started |
| 3 | Skills / bookshelf | not started |
| 4 | Personal / studio / door | not started |

## Architecture

```
src/
  App.jsx                    Scene (3D) + Overlay (HTML) — separate layers
  store/useStore.js          zustand: hovered object, activeFrame; `anim` mutable bus
  ui/                        Overlay (name, scroll hint), DesignLaw ("i" card), Tooltip (3D-anchored)
  scene/
    Scene.jsx                Canvas, tone mapping, fog, procedural env map, MaterialClock
    CameraRig.jsx            fixed cinematic camera (constant horizontal FOV, tiny parallax)
    Lighting.jsx             sun through the window (shadows, slow drift) + warm fills
    layout.js                room / desk / window / sun / camera constants + palette
    frames/Frame1Room.jsx    composes the room objects; Frame2..4 become siblings later
    objects/
      Room.jsx               floor (planked wood shader), walls, skirting, rug
      Environment.jsx        window wall, frame, glass, curtain (vertex shader), outside view,
                             sun shafts, dust, floor plant, foliage outside (casts dapples)
      Desk.jsx               desk, keyboard (instanced keys), mouse, coffee + steam, plant,
                             headphones, lamp (lit), sketchbook, swatches, phone, pen holder
      Monitors.jsx           curved main monitor (interactive) + secondary monitor
      PC.jsx                 workstation tower: glass panel, internals, RGB rings, turning fans
      Designer.jsx           stylised designer + chair; breathing, typing, mouse, head glance
      Cat.jsx                cat house + sleeping cat; breathing, ear twitch, Zzz
      Collection.jsx         wall display of 9 unbranded miniature cars
      Decor.jsx              shelf, books, camera, posters, sticky notes, cables, bag, clock
    materials/
      useSurfaceMaterial.js  MeshStandardMaterial + GLSL injections: wood, wall, fabric,
                             stripes, curtain, sway — each tunable independently
      ScreenMaterial.js      canvas texture + vignette + breathing glow + hover lift
      LightShaftMaterial.js  additive sunlight slabs
      SteamMaterial.js       noise-driven coffee steam
      glsl.js                shared noise / fbm chunk
    screens/                 2D canvas painters: main design tool UI, design-system sheet,
                             posters, outside backdrop
    hooks/                   useInteractive (hover/click + lift), useScreenCanvas (animated textures)
    utils/geometry.js        curved screen/shell, rounded slabs/boxes, leaf shape, limb transforms
```

## Interaction map (Frame 1)

| Object | Tooltip |
| ------------- | --------------------------------------------------------- |
| Designer | "Shh... I'm designing." (also glances over the shoulder) |
| Cat | "My furry co-worker." / "Currently doing absolutely nothing." |
| Car display | "Small cars. Big obsession." |
| Main monitor | hover glow only (future gateway to the work section) |
| "i" (bottom right) | DESIGN LAW 01 |

## Next

Scroll → camera path between frames plugs into `CameraRig.jsx`; each new frame is a group
under `scene/frames/` positioned further along the room. Shared constants live in `layout.js`.
