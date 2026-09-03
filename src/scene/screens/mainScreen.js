/**
 * Main monitor: a fictional design tool ("Fern" plant-care app being designed).
 * Everything is drawn with 2D canvas primitives so no assets are needed.
 * Animation: a cursor travels between elements, the selection + inspector follow,
 * a save indicator pulses, and small UI values drift slowly.
 */

const C = {
  bg: '#f2eee7',
  panel: '#faf8f4',
  line: '#e6e0d5',
  ink: '#3b342d',
  inkSoft: '#8a8177',
  inkFaint: '#bdb5a9',
  accent: '#7c9a72',
  accent2: '#d3956a',
  canvas: '#e9e4db',
  sel: '#5b8ee6',
}

const FONT = '"Manrope", "Inter", system-ui, sans-serif'

function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.arcTo(x + w, y, x + w, y + h, rad)
  ctx.arcTo(x + w, y + h, x, y + h, rad)
  ctx.arcTo(x, y + h, x, y, rad)
  ctx.arcTo(x, y, x + w, y, rad)
  ctx.closePath()
}
function fillRR(ctx, x, y, w, h, r, color) {
  rr(ctx, x, y, w, h, r)
  ctx.fillStyle = color
  ctx.fill()
}
function strokeRR(ctx, x, y, w, h, r, color, lw = 1) {
  rr(ctx, x, y, w, h, r)
  ctx.strokeStyle = color
  ctx.lineWidth = lw
  ctx.stroke()
}
function text(ctx, s, x, y, size, color, weight = 500, align = 'left') {
  ctx.font = `${weight} ${size}px ${FONT}`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillText(s, x, y)
}
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// Layout constants (1024 x 432)
const TOP = 34
const TOOLS = 46
const LAYERS = 190
const PROPS = 236

// Elements inside the phone artboard the cursor "works on"
// each: [x, y, w, h, label] relative to phone frame origin
const PHONE = { x: 372, y: 62, w: 176, h: 344 }
const ELEMENTS = [
  [16, 92, 144, 96, 'Hero card'],
  [16, 204, 66, 74, 'Tile / Water'],
  [94, 204, 66, 74, 'Tile / Light'],
  [16, 292, 144, 38, 'Primary button'],
  [16, 40, 110, 22, 'Greeting'],
]
const LAYER_ROWS = [
  ['Home / iPhone', 0, true],
  ['Status bar', 1],
  ['Greeting', 1],
  ['Hero card', 1],
  ['Plant image', 2],
  ['Title', 2],
  ['Progress ring', 2],
  ['Tile / Water', 1],
  ['Tile / Light', 1],
  ['Primary button', 1],
  ['Tab bar', 1],
  ['Wallet / iPhone', 0, true],
]

const SEG = 4.2 // seconds per cursor stop
const MOVE = 0.9

export function paintMainScreen(ctx, W, H, t) {
  // ── selection / cursor state ───────────────────────────
  const idx = Math.floor(t / SEG) % ELEMENTS.length
  const prev = (idx - 1 + ELEMENTS.length) % ELEMENTS.length
  const phase = (t % SEG) / MOVE
  const k = ease(Math.min(phase, 1))
  const a = ELEMENTS[prev]
  const b = ELEMENTS[idx]
  const cx = PHONE.x + (a[0] + a[2] * 0.62) + ((b[0] + b[2] * 0.62) - (a[0] + a[2] * 0.62)) * k
  const cy = PHONE.y + (a[1] + a[3] * 0.55) + ((b[1] + b[3] * 0.55) - (a[1] + a[3] * 0.55)) * k
  const selected = phase >= 1 ? idx : prev

  // ── background ─────────────────────────────────────────
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, W, H)

  // ── canvas area ────────────────────────────────────────
  const canX = TOOLS + LAYERS
  const canW = W - canX - PROPS
  ctx.fillStyle = C.canvas
  ctx.fillRect(canX, TOP, canW, H - TOP)
  // dot grid
  ctx.fillStyle = 'rgba(60,50,40,0.07)'
  for (let y = TOP + 12; y < H; y += 16) for (let x = canX + 12; x < canX + canW; x += 16) ctx.fillRect(x, y, 1.5, 1.5)

  // artboard labels
  text(ctx, 'Home / iPhone 15', PHONE.x, PHONE.y - 10, 9, C.inkSoft, 600)
  text(ctx, 'Wallet / iPhone 15', PHONE.x + 208, PHONE.y - 10, 9, C.inkSoft, 600)
  text(ctx, 'Components', PHONE.x - 130, PHONE.y - 10, 9, C.inkSoft, 600)

  drawPhone(ctx, PHONE.x, PHONE.y, PHONE.w, PHONE.h, t, 0)
  drawPhone(ctx, PHONE.x + 208, PHONE.y, PHONE.w, PHONE.h, t, 1)
  drawComponents(ctx, PHONE.x - 130, PHONE.y, 110, PHONE.h, t)

  // selection box
  const s = ELEMENTS[selected]
  const sx = PHONE.x + s[0]
  const sy = PHONE.y + s[1]
  const pulse = 0.85 + 0.15 * Math.sin(t * 4)
  ctx.save()
  ctx.globalAlpha = pulse
  strokeRR(ctx, sx - 1, sy - 1, s[2] + 2, s[3] + 2, 3, C.sel, 1.5)
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = C.sel
  ctx.lineWidth = 1
  for (const [hx, hy] of [
    [sx, sy],
    [sx + s[2], sy],
    [sx, sy + s[3]],
    [sx + s[2], sy + s[3]],
  ]) {
    ctx.fillRect(hx - 3, hy - 3, 6, 6)
    ctx.strokeRect(hx - 3, hy - 3, 6, 6)
  }
  // dimension tag
  fillRR(ctx, sx + s[2] / 2 - 22, sy + s[3] + 6, 44, 14, 3, C.sel)
  text(ctx, `${s[2]} × ${s[3]}`, sx + s[2] / 2, sy + s[3] + 13, 8, '#fff', 600, 'center')
  ctx.restore()

  // cursor
  drawCursor(ctx, cx, cy)

  // ── top bar ────────────────────────────────────────────
  ctx.fillStyle = C.panel
  ctx.fillRect(0, 0, W, TOP)
  ctx.fillStyle = C.line
  ctx.fillRect(0, TOP - 1, W, 1)
  // app mark
  ctx.fillStyle = C.accent
  ctx.beginPath()
  ctx.arc(20, 17, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = C.panel
  ctx.beginPath()
  ctx.arc(22, 15, 3.5, 0, Math.PI * 2)
  ctx.fill()
  text(ctx, 'Fern · Onboarding v3', 38, 17, 11, C.ink, 700)
  text(ctx, 'Drafts / Mobile', 172, 17, 10, C.inkFaint, 500)
  // center tabs
  const tabs = ['Design', 'Prototype', 'Inspect']
  tabs.forEach((s, i) => {
    const x = W / 2 - 90 + i * 70
    if (i === 0) fillRR(ctx, x - 24, 8, 58, 18, 9, '#ece7de')
    text(ctx, s, x + 5, 17, 10, i === 0 ? C.ink : C.inkSoft, 600, 'center')
  })
  // right side: avatars + share + save pulse
  const colors = ['#d3956a', '#7c9a72', '#c9b5e6']
  colors.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(W - 150 + i * 16, 17, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = C.panel
    ctx.lineWidth = 2
    ctx.stroke()
  })
  fillRR(ctx, W - 92, 8, 56, 18, 9, C.ink)
  text(ctx, 'Share', W - 64, 17, 10, '#fff', 700, 'center')
  const saveA = 0.55 + 0.45 * Math.sin(t * 1.6)
  ctx.fillStyle = `rgba(124,154,114,${saveA})`
  ctx.beginPath()
  ctx.arc(W - 22, 17, 3.5, 0, Math.PI * 2)
  ctx.fill()

  // ── left toolbar ───────────────────────────────────────
  ctx.fillStyle = C.panel
  ctx.fillRect(0, TOP, TOOLS, H - TOP)
  ctx.fillStyle = C.line
  ctx.fillRect(TOOLS - 1, TOP, 1, H - TOP)
  const tools = 8
  for (let i = 0; i < tools; i++) {
    const y = TOP + 22 + i * 34
    const active = i === 1
    if (active) fillRR(ctx, 9, y - 12, 28, 24, 6, '#e8e3d9')
    ctx.strokeStyle = active ? C.ink : C.inkSoft
    ctx.fillStyle = active ? C.ink : C.inkSoft
    ctx.lineWidth = 1.5
    drawToolIcon(ctx, i, 23, y)
  }

  // ── layers panel ───────────────────────────────────────
  ctx.fillStyle = C.panel
  ctx.fillRect(TOOLS, TOP, LAYERS, H - TOP)
  ctx.fillStyle = C.line
  ctx.fillRect(TOOLS + LAYERS - 1, TOP, 1, H - TOP)
  text(ctx, 'LAYERS', TOOLS + 14, TOP + 18, 8.5, C.inkFaint, 700)
  text(ctx, 'ASSETS', TOOLS + 70, TOP + 18, 8.5, C.inkFaint, 700)
  ctx.fillStyle = C.ink
  ctx.fillRect(TOOLS + 14, TOP + 27, 38, 1.5)
  const selName = ELEMENTS[selected][4]
  LAYER_ROWS.forEach((row, i) => {
    const y = TOP + 46 + i * 24
    const [name, depth, frame] = row
    const isSel = name === selName
    if (isSel) fillRR(ctx, TOOLS + 6, y - 10, LAYERS - 12, 20, 5, '#e3ecdf')
    const x = TOOLS + 16 + depth * 14
    ctx.strokeStyle = isSel ? C.accent : C.inkFaint
    ctx.lineWidth = 1.2
    if (frame) ctx.strokeRect(x + 0.5, y - 4.5, 9, 9)
    else {
      ctx.beginPath()
      ctx.arc(x + 5, y, 3.5, 0, Math.PI * 2)
      ctx.stroke()
    }
    text(ctx, name, x + 17, y, 10, isSel ? C.ink : frame ? C.ink : C.inkSoft, frame ? 700 : 500)
  })

  // ── properties / inspector ─────────────────────────────
  const px = W - PROPS
  ctx.fillStyle = C.panel
  ctx.fillRect(px, TOP, PROPS, H - TOP)
  ctx.fillStyle = C.line
  ctx.fillRect(px, TOP, 1, H - TOP)
  text(ctx, selName, px + 16, TOP + 20, 11, C.ink, 700)
  text(ctx, 'Auto layout · Vertical', px + 16, TOP + 36, 8.5, C.inkFaint, 500)
  ctx.fillStyle = C.line
  ctx.fillRect(px + 12, TOP + 50, PROPS - 24, 1)

  const cur = ELEMENTS[selected]
  const fields = [
    ['X', cur[0]],
    ['Y', cur[1]],
    ['W', cur[2]],
    ['H', cur[3]],
  ]
  fields.forEach(([l, v], i) => {
    const fx = px + 16 + (i % 2) * 104
    const fy = TOP + 62 + Math.floor(i / 2) * 30
    fillRR(ctx, fx, fy, 92, 22, 5, '#f1ede6')
    text(ctx, l, fx + 9, fy + 11, 9, C.inkFaint, 700)
    text(ctx, String(v), fx + 24, fy + 11, 10, C.ink, 600)
  })
  // radius + opacity
  const ry = TOP + 126
  text(ctx, 'Radius', px + 16, ry, 9, C.inkSoft, 600)
  fillRR(ctx, px + 130, ry - 11, 90, 22, 5, '#f1ede6')
  text(ctx, selected === 3 ? '999' : '16', px + 139, ry, 10, C.ink, 600)
  text(ctx, 'Opacity', px + 16, ry + 30, 9, C.inkSoft, 600)
  fillRR(ctx, px + 130, ry + 19, 90, 22, 5, '#f1ede6')
  text(ctx, '100%', px + 139, ry + 30, 10, C.ink, 600)

  // Fill section
  const fy = ry + 60
  ctx.fillStyle = C.line
  ctx.fillRect(px + 12, fy - 14, PROPS - 24, 1)
  text(ctx, 'FILL', px + 16, fy, 8.5, C.inkFaint, 700)
  const fillCol = selected === 3 ? C.accent : selected === 0 ? '#e7efe2' : selected === 4 ? '#3b342d' : '#ffffff'
  fillRR(ctx, px + 16, fy + 12, 18, 18, 4, fillCol)
  strokeRR(ctx, px + 16, fy + 12, 18, 18, 4, C.line, 1)
  text(ctx, fillCol.toUpperCase().replace('#', ''), px + 42, fy + 21, 10, C.ink, 600)
  text(ctx, '100%', px + 190, fy + 21, 10, C.inkSoft, 500)

  // Typography
  const ty = fy + 56
  ctx.fillStyle = C.line
  ctx.fillRect(px + 12, ty - 14, PROPS - 24, 1)
  text(ctx, 'TEXT', px + 16, ty, 8.5, C.inkFaint, 700)
  fillRR(ctx, px + 16, ty + 12, 204, 22, 5, '#f1ede6')
  text(ctx, 'Manrope · Semibold · 15 / 20', px + 25, ty + 23, 9.5, C.ink, 500)

  // Export
  const ey = ty + 60
  ctx.fillStyle = C.line
  ctx.fillRect(px + 12, ey - 14, PROPS - 24, 1)
  text(ctx, 'EXPORT', px + 16, ey, 8.5, C.inkFaint, 700)
  fillRR(ctx, px + 16, ey + 12, 204, 22, 6, '#ece7de')
  text(ctx, '+ Add export', px + 118, ey + 23, 9.5, C.inkSoft, 600, 'center')

  // ── bottom status strip ────────────────────────────────
  text(ctx, `${Math.round(78 + Math.sin(t * 0.1) * 0.5)}%`, canX + canW - 16, H - 14, 9, C.inkSoft, 600, 'right')
  text(ctx, 'Saved · just now', canX + 14, H - 14, 9, C.inkFaint, 500)
}

function drawCursor(ctx, x, y) {
  ctx.save()
  ctx.translate(x, y)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, 15)
  ctx.lineTo(4, 11.5)
  ctx.lineTo(7, 17)
  ctx.lineTo(9.5, 16)
  ctx.lineTo(6.5, 10.5)
  ctx.lineTo(11.5, 10.5)
  ctx.closePath()
  ctx.fillStyle = '#1f1b18'
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.2
  ctx.stroke()
  ctx.restore()
}

function drawToolIcon(ctx, i, x, y) {
  ctx.beginPath()
  switch (i) {
    case 0: // move
      ctx.moveTo(x - 4, y - 6)
      ctx.lineTo(x - 4, y + 5)
      ctx.lineTo(x - 1, y + 2)
      ctx.lineTo(x + 3, y + 6)
      ctx.lineTo(x + 5, y + 4)
      ctx.lineTo(x + 1, y + 1)
      ctx.lineTo(x + 5, y - 1)
      ctx.closePath()
      ctx.fill()
      break
    case 1: // frame
      ctx.rect(x - 5, y - 5, 10, 10)
      ctx.stroke()
      break
    case 2: // shape
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.stroke()
      break
    case 3: // pen
      ctx.moveTo(x - 5, y + 5)
      ctx.lineTo(x + 3, y - 5)
      ctx.lineTo(x + 5, y - 3)
      ctx.lineTo(x - 3, y + 6)
      ctx.closePath()
      ctx.stroke()
      break
    case 4: // text
      ctx.moveTo(x - 5, y - 5)
      ctx.lineTo(x + 5, y - 5)
      ctx.moveTo(x, y - 5)
      ctx.lineTo(x, y + 6)
      ctx.stroke()
      break
    case 5: // comment
      ctx.arc(x, y - 1, 5, Math.PI * 0.9, Math.PI * 2.4)
      ctx.lineTo(x - 4, y + 6)
      ctx.stroke()
      break
    case 6: // components
      ctx.moveTo(x, y - 6)
      ctx.lineTo(x + 6, y)
      ctx.lineTo(x, y + 6)
      ctx.lineTo(x - 6, y)
      ctx.closePath()
      ctx.stroke()
      break
    default: // hand / zoom
      ctx.arc(x - 1, y - 1, 4.5, 0, Math.PI * 2)
      ctx.moveTo(x + 2.5, y + 2.5)
      ctx.lineTo(x + 6, y + 6)
      ctx.stroke()
  }
}

function drawPhone(ctx, x, y, w, h, t, variant) {
  // frame
  fillRR(ctx, x, y, w, h, 22, '#ffffff')
  strokeRR(ctx, x, y, w, h, 22, '#d9d2c6', 1)
  // status bar
  text(ctx, '9:41', x + 16, y + 16, 8.5, C.ink, 700)
  fillRR(ctx, x + w - 34, y + 12, 18, 8, 2, C.ink)
  fillRR(ctx, x + w - 50, y + 13, 3, 6, 1, C.ink)
  fillRR(ctx, x + w - 45, y + 11, 3, 8, 1, C.ink)
  if (variant === 0) {
    // greeting
    text(ctx, 'Good morning, Ada', x + 16, y + 46, 12, C.ink, 700)
    text(ctx, '3 plants need you today', x + 16, y + 60, 8.5, C.inkSoft, 500)
    // hero card
    fillRR(ctx, x + 16, y + 92, 144, 96, 16, '#e7efe2')
    // plant blob
    ctx.fillStyle = C.accent
    ctx.beginPath()
    ctx.ellipse(x + 44, y + 128, 14, 20, -0.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(x + 58, y + 126, 12, 18, 0.5, 0, Math.PI * 2)
    ctx.fill()
    fillRR(ctx, x + 40, y + 148, 22, 22, 5, '#c98c62')
    text(ctx, 'Monstera', x + 80, y + 116, 10, C.ink, 700)
    text(ctx, 'Water in 2 days', x + 80, y + 132, 8, C.inkSoft, 500)
    // progress ring
    const prog = 0.62 + Math.sin(t * 0.3) * 0.02
    ctx.beginPath()
    ctx.arc(x + 130, y + 158, 12, 0, Math.PI * 2)
    ctx.strokeStyle = '#cfdcc8'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x + 130, y + 158, 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog)
    ctx.strokeStyle = C.accent
    ctx.stroke()
    // tiles
    tile(ctx, x + 16, y + 204, 66, 74, 'Water', '4 pl.', '#dbe9f4')
    tile(ctx, x + 94, y + 204, 66, 74, 'Light', 'Good', '#f7e9d3')
    // button
    fillRR(ctx, x + 16, y + 292, 144, 38, 19, C.accent)
    text(ctx, 'Log care', x + 88, y + 311, 10.5, '#fff', 700, 'center')
    // tab bar
    for (let i = 0; i < 4; i++) {
      const tx = x + 32 + i * 37
      ctx.fillStyle = i === 0 ? C.ink : C.inkFaint
      ctx.beginPath()
      ctx.arc(tx, y + h - 16, 3.5, 0, Math.PI * 2)
      ctx.fill()
    }
  } else {
    text(ctx, 'Your garden', x + 16, y + 46, 12, C.ink, 700)
    text(ctx, '12 plants · 2 rooms', x + 16, y + 60, 8.5, C.inkSoft, 500)
    const shades = ['#e7efe2', '#f7e9d3', '#dbe9f4', '#efe2ee', '#e7efe2', '#f2ede5']
    for (let i = 0; i < 6; i++) {
      const gx = x + 16 + (i % 2) * 74
      const gy = y + 80 + Math.floor(i / 2) * 66
      fillRR(ctx, gx, gy, 66, 56, 12, shades[i])
      ctx.fillStyle = C.accent
      ctx.beginPath()
      ctx.ellipse(gx + 20, gy + 26, 7, 11, -0.3 + i * 0.2, 0, Math.PI * 2)
      ctx.fill()
      fillRR(ctx, gx + 32, gy + 16, 26, 5, 2.5, C.inkFaint)
      fillRR(ctx, gx + 32, gy + 27, 18, 4, 2, '#d9d2c6')
    }
    // floating add button
    const bob = Math.sin(t * 1.2) * 1.5
    ctx.fillStyle = C.ink
    ctx.beginPath()
    ctx.arc(x + w - 32, y + h - 48 + bob, 16, 0, Math.PI * 2)
    ctx.fill()
    text(ctx, '+', x + w - 32, y + h - 48 + bob, 16, '#fff', 500, 'center')
    for (let i = 0; i < 4; i++) {
      const tx = x + 32 + i * 37
      ctx.fillStyle = i === 1 ? C.ink : C.inkFaint
      ctx.beginPath()
      ctx.arc(tx, y + h - 16, 3.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function tile(ctx, x, y, w, h, label, value, bg) {
  fillRR(ctx, x, y, w, h, 12, bg)
  ctx.fillStyle = C.ink
  ctx.beginPath()
  ctx.arc(x + 16, y + 18, 6, 0, Math.PI * 2)
  ctx.fill()
  text(ctx, label, x + 10, y + 42, 8.5, C.inkSoft, 600)
  text(ctx, value, x + 10, y + 58, 11, C.ink, 700)
}

function drawComponents(ctx, x, y, w, h, t) {
  fillRR(ctx, x, y, w, h, 10, '#f6f3ee')
  strokeRR(ctx, x, y, w, h, 10, '#ddd6ca', 1)
  const rows = [
    ['Button / Primary', C.accent],
    ['Button / Ghost', '#ffffff'],
    ['Chip', '#f7e9d3'],
    ['Toggle', '#dbe9f4'],
  ]
  rows.forEach(([n, c], i) => {
    const ry = y + 22 + i * 58
    text(ctx, n, x + 10, ry, 7.5, C.inkFaint, 700)
    fillRR(ctx, x + 10, ry + 10, w - 20, 22, 11, c)
    if (i === 1) strokeRR(ctx, x + 10, ry + 10, w - 20, 22, 11, C.accent, 1)
    if (i === 3) {
      const on = Math.sin(t * 0.8) > 0
      fillRR(ctx, x + 14, ry + 14, 26, 14, 7, on ? C.accent : '#c9c2b6')
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(on ? x + 33 : x + 21, ry + 21, 5, 0, Math.PI * 2)
      ctx.fill()
    }
  })
  text(ctx, 'v1.4', x + 10, y + h - 14, 7.5, C.inkFaint, 600)
}
