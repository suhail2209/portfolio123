// Dependency-free GLB inspector. Usage: node tools/inspect-glb.mjs <file.glb> [--json out.json]
import fs from 'node:fs'
import path from 'node:path'

const file = process.argv[2]
const outIdx = process.argv.indexOf('--json')
const outFile = outIdx > -1 ? process.argv[outIdx + 1] : null
if (!file) {
  console.error('usage: node tools/inspect-glb.mjs <file.glb> [--json out.json]')
  process.exit(1)
}

const buf = fs.readFileSync(file)
const magic = buf.readUInt32LE(0)
if (magic !== 0x46546c67) throw new Error('not a GLB (magic mismatch)')
const version = buf.readUInt32LE(4)
const length = buf.readUInt32LE(8)
let offset = 12
let json = null
let bin = null
while (offset < length) {
  const chunkLen = buf.readUInt32LE(offset)
  const chunkType = buf.readUInt32LE(offset + 4)
  const data = buf.subarray(offset + 8, offset + 8 + chunkLen)
  if (chunkType === 0x4e4f534a) json = JSON.parse(data.toString('utf8'))
  else if (chunkType === 0x004e4942) bin = data
  offset += 8 + chunkLen
}

// ── accessor helpers ────────────────────────────────────────
const COMP = { 5120: [1, 'i8'], 5121: [1, 'u8'], 5122: [2, 'i16'], 5123: [2, 'u16'], 5125: [4, 'u32'], 5126: [4, 'f32'] }
const NUM = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 }
function readAccessor(i) {
  const a = json.accessors[i]
  const bv = json.bufferViews[a.bufferView]
  const [size, kind] = COMP[a.componentType]
  const n = NUM[a.type]
  const stride = bv.byteStride || size * n
  const base = (bv.byteOffset || 0) + (a.byteOffset || 0)
  const out = new Float64Array(a.count * n)
  for (let k = 0; k < a.count; k++) {
    for (let c = 0; c < n; c++) {
      const o = base + k * stride + c * size
      let v
      switch (kind) {
        case 'i8': v = bin.readInt8(o); break
        case 'u8': v = bin.readUInt8(o); break
        case 'i16': v = bin.readInt16LE(o); break
        case 'u16': v = bin.readUInt16LE(o); break
        case 'u32': v = bin.readUInt32LE(o); break
        default: v = bin.readFloatLE(o)
      }
      if (a.normalized) v = kind === 'u8' ? v / 255 : kind === 'u16' ? v / 65535 : kind === 'i8' ? Math.max(v / 127, -1) : kind === 'i16' ? Math.max(v / 32767, -1) : v
      out[k * n + c] = v
    }
  }
  return { data: out, n, count: a.count }
}

// ── mat4 helpers (column-major like glTF) ───────────────────
const I4 = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
function mul(a, b) {
  const o = new Array(16)
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]
  return o
}
function compose(t = [0, 0, 0], q = [0, 0, 0, 1], s = [1, 1, 1]) {
  const [x, y, z, w] = q
  const x2 = x + x, y2 = y + y, z2 = z + z
  const xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2
  return [
    (1 - (yy + zz)) * s[0], (xy + wz) * s[0], (xz - wy) * s[0], 0,
    (xy - wz) * s[1], (1 - (xx + zz)) * s[1], (yz + wx) * s[1], 0,
    (xz + wy) * s[2], (yz - wx) * s[2], (1 - (xx + yy)) * s[2], 0,
    t[0], t[1], t[2], 1,
  ]
}
function invert(m) {
  const [n11, n21, n31, n41, n12, n22, n32, n42, n13, n23, n33, n43, n14, n24, n34, n44] = m
  const t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44
  const t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44
  const t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44
  const t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34
  const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14
  if (det === 0) return I4()
  const d = 1 / det
  return [
    t11 * d,
    (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * d,
    (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * d,
    (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * d,
    t12 * d,
    (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * d,
    (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * d,
    (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * d,
    t13 * d,
    (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * d,
    (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * d,
    (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * d,
    t14 * d,
    (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * d,
    (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * d,
    (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * d,
  ]
}
const xform = (m, p) => [
  m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
  m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
  m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
]
const localMatrix = (n) => (n.matrix ? n.matrix : compose(n.translation, n.rotation, n.scale))
const r = (v, d = 3) => (typeof v === 'number' ? +v.toFixed(d) : Array.isArray(v) ? v.map((x) => r(x, d)) : v)

// ── world matrices ─────────────────────────────────────────
const nodes = json.nodes || []
const world = new Array(nodes.length)
const parentOf = new Array(nodes.length).fill(-1)
function walk(i, parent) {
  world[i] = mul(parent, localMatrix(nodes[i]))
  for (const c of nodes[i].children || []) {
    parentOf[c] = i
    walk(c, world[i])
  }
}
const scene = json.scenes?.[json.scene ?? 0] || { nodes: [] }
for (const rt of scene.nodes) walk(rt, I4())

// ── meshes / triangles / bbox ──────────────────────────────
let triangles = 0
let vertices = 0
const meshReports = []
const bbox = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }
const bboxRaw = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }
function grow(b, p) {
  for (let k = 0; k < 3; k++) {
    b.min[k] = Math.min(b.min[k], p[k])
    b.max[k] = Math.max(b.max[k], p[k])
  }
}
nodes.forEach((n, ni) => {
  if (n.mesh == null) return
  const mesh = json.meshes[n.mesh]
  const wm = world[ni] || I4()
  const prims = mesh.primitives.map((p) => {
    const pos = json.accessors[p.attributes.POSITION]
    const mode = p.mode ?? 4
    let tri = 0
    const idxCount = p.indices != null ? json.accessors[p.indices].count : pos.count
    if (mode === 4) tri = idxCount / 3
    else if (mode === 5 || mode === 6) tri = idxCount - 2
    triangles += tri
    vertices += pos.count
    // bbox corners
    const mn = pos.min, mx = pos.max
    if (mn && mx) {
      for (let c = 0; c < 8; c++) {
        const corner = [c & 1 ? mx[0] : mn[0], c & 2 ? mx[1] : mn[1], c & 4 ? mx[2] : mn[2]]
        grow(bboxRaw, corner)
        grow(bbox, n.skin != null ? corner : xform(wm, corner))
      }
    }
    return {
      material: p.material != null ? json.materials[p.material]?.name ?? `#${p.material}` : null,
      mode,
      triangles: tri,
      vertices: pos.count,
      attributes: Object.keys(p.attributes),
      morphTargets: p.targets?.length || 0,
      posMin: r(mn),
      posMax: r(mx),
      extensions: p.extensions ? Object.keys(p.extensions) : [],
    }
  })
  meshReports.push({ node: n.name || `node#${ni}`, nodeIndex: ni, mesh: mesh.name, skinned: n.skin != null, primitives: prims, worldTranslation: r(wm.slice(12, 15)) })
})

// ── materials / textures ───────────────────────────────────
function imageDims(img) {
  if (img.bufferView == null) return null
  const bv = json.bufferViews[img.bufferView]
  const d = bin.subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength)
  if (d[0] === 0x89 && d[1] === 0x50) return { w: d.readUInt32BE(16), h: d.readUInt32BE(20) }
  if (d[0] === 0xff && d[1] === 0xd8) {
    let o = 2
    while (o < d.length) {
      if (d[o] !== 0xff) { o++; continue }
      const m = d[o + 1]
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: d.readUInt16BE(o + 5), w: d.readUInt16BE(o + 7) }
      o += 2 + d.readUInt16BE(o + 2)
    }
  }
  if (d.toString('ascii', 0, 4) === 'RIFF' && d.toString('ascii', 8, 12) === 'WEBP') {
    const t = d.toString('ascii', 12, 16)
    if (t === 'VP8X') return { w: 1 + d.readUIntLE(24, 3), h: 1 + d.readUIntLE(27, 3) }
    if (t === 'VP8 ') return { w: d.readUInt16LE(26) & 0x3fff, h: d.readUInt16LE(28) & 0x3fff }
    if (t === 'VP8L') { const b = d.readUInt32LE(21); return { w: 1 + (b & 0x3fff), h: 1 + ((b >> 14) & 0x3fff) } }
  }
  return null
}
const images = (json.images || []).map((img, i) => ({
  index: i,
  name: img.name,
  mimeType: img.mimeType,
  uri: img.uri ? img.uri.slice(0, 60) : undefined,
  bytes: img.bufferView != null ? json.bufferViews[img.bufferView].byteLength : null,
  dims: imageDims(img),
}))
const texName = (t) => (t ? `tex#${t.index}->img#${json.textures[t.index]?.source}` + (t.texCoord ? ` uv${t.texCoord}` : '') : undefined)
const materials = (json.materials || []).map((m, i) => ({
  index: i,
  name: m.name,
  baseColorFactor: r(m.pbrMetallicRoughness?.baseColorFactor),
  baseColorTexture: texName(m.pbrMetallicRoughness?.baseColorTexture),
  metallicFactor: m.pbrMetallicRoughness?.metallicFactor,
  roughnessFactor: m.pbrMetallicRoughness?.roughnessFactor,
  metallicRoughnessTexture: texName(m.pbrMetallicRoughness?.metallicRoughnessTexture),
  normalTexture: texName(m.normalTexture),
  occlusionTexture: texName(m.occlusionTexture),
  emissiveTexture: texName(m.emissiveTexture),
  emissiveFactor: m.emissiveFactor,
  alphaMode: m.alphaMode || 'OPAQUE',
  alphaCutoff: m.alphaCutoff,
  doubleSided: !!m.doubleSided,
  extensions: m.extensions ? Object.keys(m.extensions) : [],
}))

// ── skins / joints in bind pose ────────────────────────────
const skins = (json.skins || []).map((s, si) => {
  const ibm = s.inverseBindMatrices != null ? readAccessor(s.inverseBindMatrices) : null
  const joints = s.joints.map((j, k) => {
    let bind = null
    if (ibm) bind = invert(Array.from(ibm.data.slice(k * 16, k * 16 + 16))).slice(12, 15)
    return { node: j, name: nodes[j].name || `node#${j}`, bindPos: r(bind), worldPos: r(world[j]?.slice(12, 15)) }
  })
  return { index: si, name: s.name, skeleton: s.skeleton != null ? nodes[s.skeleton]?.name : undefined, jointCount: s.joints.length, joints }
})

// ── animations ─────────────────────────────────────────────
const animations = (json.animations || []).map((a, i) => {
  let dur = 0
  const paths = {}
  const targets = new Set()
  a.channels.forEach((ch) => {
    const smp = a.samplers[ch.sampler]
    const inp = json.accessors[smp.input]
    if (inp.max) dur = Math.max(dur, inp.max[0])
    paths[ch.target.path] = (paths[ch.target.path] || 0) + 1
    targets.add(nodes[ch.target.node]?.name || `node#${ch.target.node}`)
  })
  return { index: i, name: a.name, duration: r(dur), channels: a.channels.length, paths, targets: [...targets].slice(0, 40), targetCount: targets.size }
})

// ── hierarchy ──────────────────────────────────────────────
function tree(i, depth, out) {
  const n = nodes[i]
  const flags = [n.mesh != null ? `mesh:${json.meshes[n.mesh].name ?? n.mesh}` : null, n.skin != null ? `skin:${n.skin}` : null, n.camera != null ? 'camera' : null].filter(Boolean)
  const trs = []
  if (n.translation) trs.push(`t=${r(n.translation).join(',')}`)
  if (n.rotation) trs.push(`q=${r(n.rotation, 4).join(',')}`)
  if (n.scale) trs.push(`s=${r(n.scale).join(',')}`)
  if (n.matrix) trs.push('matrix')
  out.push(`${'  '.repeat(depth)}${n.name || `node#${i}`}${flags.length ? ' [' + flags.join(' ') + ']' : ''}${trs.length ? ' {' + trs.join(' ') + '}' : ''}`)
  if (depth < 6) for (const c of n.children || []) tree(c, depth + 1, out)
  else if (n.children?.length) out.push(`${'  '.repeat(depth + 1)}... (${n.children.length} children)`)
}
const hierarchy = []
for (const rt of scene.nodes) tree(rt, 0, hierarchy)

const size = (b) => (b.min[0] === Infinity ? null : { min: r(b.min), max: r(b.max), size: r(b.max.map((v, k) => v - b.min[k])), center: r(b.max.map((v, k) => (v + b.min[k]) / 2)) })

const report = {
  file: path.basename(file),
  fileBytes: buf.length,
  fileMB: r(buf.length / 1048576, 2),
  glbVersion: version,
  asset: json.asset,
  extensionsUsed: json.extensionsUsed || [],
  extensionsRequired: json.extensionsRequired || [],
  counts: {
    scenes: json.scenes?.length || 0,
    nodes: nodes.length,
    meshes: json.meshes?.length || 0,
    primitives: (json.meshes || []).reduce((a, m) => a + m.primitives.length, 0),
    materials: materials.length,
    textures: json.textures?.length || 0,
    images: images.length,
    skins: skins.length,
    animations: animations.length,
    triangles,
    vertices,
    binBytes: bin?.length || 0,
    imageBytesTotal: images.reduce((a, i) => a + (i.bytes || 0), 0),
  },
  bboxWorld_bindPose: size(bbox),
  bboxRaw_meshSpace: size(bboxRaw),
  hierarchy: hierarchy.slice(0, 120),
  hierarchyTruncated: hierarchy.length > 120,
  meshes: meshReports,
  materials,
  images,
  skins: skins.map((s) => ({ ...s, joints: s.joints.length > 80 ? s.joints.slice(0, 80) : s.joints, jointsTruncated: s.joints.length > 80 })),
  animations,
}

if (outFile) fs.writeFileSync(outFile, JSON.stringify(report, null, 2))
const brief = { ...report, hierarchy: report.hierarchy.slice(0, 60), skins: report.skins.map((s) => ({ ...s, joints: s.joints.filter((j) => /head|eye|nose|jaw|neck|hip|pelvis|spine|foot|toe|hand|tail|root|ear/i.test(j.name)).slice(0, 40) })) }
console.log(JSON.stringify(brief, null, 2))
