/**
 * Shared spatial layout for Frame 1 (metres, Y up, camera looks toward -Z).
 * Keeping these in one place makes it easy to attach Frames 2-4 later.
 */
export const ROOM = { w: 5.6, d: 6.0, h: 3.2, back: -3.0, left: -2.8, right: 2.8 }

export const DESK = { x: 0, z: -2.45, w: 2.0, d: 0.75, top: 0.74 }

export const WINDOW = { x: ROOM.left, zMin: -2.75, zMax: -1.35, yMin: 0.9, yMax: 2.4 }

/** Sun position/target used by the directional light and the light shafts. */
export const SUN = { position: [-6, 5.2, -1.2], target: [0.4, 0.3, -2.0], color: '#ffe3bb', intensity: 3.3 }

export const CAMERA = {
  position: [1.38, 1.66, 1.0],
  target: [-0.1, 0.95, -2.4],
  horizontalFov: 78, // degrees; vertical fov is derived from the aspect ratio
}

export const PALETTE = {
  cream: '#f3ead9',
  wall: '#f1e5d0',
  woodLight: '#d9b98a',
  woodDesk: '#c9a070',
  woodDark: '#8a6238',
  sage: '#8fa07c',
  sageDark: '#5f6b58',
  terracotta: '#c98c62',
  ink: '#3b342d',
  oat: '#d4c3a6',
  ceramic: '#f4ede2',
}
