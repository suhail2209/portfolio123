import * as THREE from 'three'

/** Concave curved screen (faces +Z, edges bend toward the viewer). */
export function makeCurvedScreenGeometry(width, height, radius, segments = 40) {
  const geo = new THREE.PlaneGeometry(width, height, segments, 1)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = radius - Math.sqrt(Math.max(radius * radius - x * x, 0))
    pos.setZ(i, z)
  }
  geo.computeVertexNormals()
  return geo
}

/**
 * Curved monitor shell: an arc band (thickness) extruded to `height`, matching
 * the screen curvature so the shell's front face reads as the bezel.
 */
export function makeCurvedShellGeometry(width, height, radius, thickness = 0.035) {
  const a = Math.asin(Math.min(width / 2 / radius, 0.999))
  const r1 = radius + 0.0015
  const r2 = radius + thickness
  const steps = 32
  const shape = new THREE.Shape()
  for (let i = 0; i <= steps; i++) {
    const t = -a + (2 * a * i) / steps
    const x = r2 * Math.sin(t)
    const y = radius - r2 * Math.cos(t)
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  for (let i = steps; i >= 0; i--) {
    const t = -a + (2 * a * i) / steps
    shape.lineTo(r1 * Math.sin(t), radius - r1 * Math.cos(t))
  }
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 4 })
  geo.translate(0, 0, -height / 2)
  geo.rotateX(Math.PI / 2)
  geo.computeVertexNormals()
  return geo
}

/** Transform for a capsule spanning two points. */
export function limbTransform(from, to) {
  const a = new THREE.Vector3(...from)
  const b = new THREE.Vector3(...to)
  const dir = b.clone().sub(a)
  const length = dir.length()
  const mid = a.clone().add(b).multiplyScalar(0.5)
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
  return { position: mid, quaternion: q, length }
}

/** 2D rounded rectangle shape centred on the origin. */
export function roundedRectShape(w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  const x = -w / 2
  const y = -h / 2
  const s = new THREE.Shape()
  s.moveTo(x + rr, y)
  s.lineTo(x + w - rr, y)
  s.quadraticCurveTo(x + w, y, x + w, y + rr)
  s.lineTo(x + w, y + h - rr)
  s.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
  s.lineTo(x + rr, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - rr)
  s.lineTo(x, y + rr)
  s.quadraticCurveTo(x, y, x + rr, y)
  s.closePath()
  return s
}

/**
 * Rounded slab: rounded-rect footprint (w along X, h along Y) extruded `d`
 * along Z with a small edge bevel. Centered. Rotate -90deg on X to lay flat.
 */
export function makeRoundedSlabGeometry(w, h, d, r = 0.02, bevel = 0.003, smooth = 2) {
  const b = Math.min(bevel, d / 2 - 0.0001)
  const shape = roundedRectShape(w - b * 2, h - b * 2, Math.max(r - b, 0.001))
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(d - b * 2, 0.0002),
    bevelEnabled: b > 0,
    bevelSegments: smooth,
    steps: 1,
    bevelSize: b,
    bevelThickness: b,
    curveSegments: 6,
  })
  geo.center()
  geo.computeVertexNormals()
  return geo
}

/**
 * Rounded box: all 12 edges softened (bevel = corner radius). Centered.
 * w along X, h along Y, d along Z.
 */
export function makeRoundedBoxGeometry(w, h, d, r = 0.01, smooth = 3) {
  const rr = Math.min(r, w / 2 - 0.0001, h / 2 - 0.0001, d / 2 - 0.0001)
  const shape = roundedRectShape(w - rr * 2, h - rr * 2, 0.0005)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d - rr * 2,
    bevelEnabled: true,
    bevelSegments: smooth,
    steps: 1,
    bevelSize: rr,
    bevelThickness: rr,
    curveSegments: 4,
  })
  geo.center()
  geo.computeVertexNormals()
  return geo
}

/** Simple leaf outline (base at origin, tip at +Y). */
export function makeLeafGeometry(length = 0.3, width = 0.14, notch = 0) {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.bezierCurveTo(width * 0.9, length * 0.15, width * 1.05, length * 0.6, 0, length)
  s.bezierCurveTo(-width * 1.05, length * 0.6, -width * 0.9, length * 0.15, 0, 0)
  const holes = []
  if (notch > 0) {
    const h = new THREE.Path()
    h.moveTo(width * 0.55, length * 0.5)
    h.quadraticCurveTo(width * 0.2, length * 0.55, width * 0.35, length * 0.75)
    h.quadraticCurveTo(width * 0.6, length * 0.7, width * 0.55, length * 0.5)
    holes.push(h)
  }
  s.holes = holes
  const geo = new THREE.ShapeGeometry(s, 8)
  return geo
}

/** Deterministic pseudo-random generator. */
export function seeded(seed) {
  let s = seed >>> 0 || 1
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}
