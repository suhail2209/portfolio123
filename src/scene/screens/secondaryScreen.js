/**
 * Secondary monitor: the "Fern" design-system sheet. Slowly scrolls up and down
 * as if being browsed. 640 x 372.
 */
const C = {
  bg: '#f7f4ee',
  ink: '#3b342d',
  soft: '#8a8177',
  faint: '#c4bcb0',
  line: '#e6e0d5',
  accent: '#7c9a72',
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
function fill(ctx, x, y, w, h, r, c) {
  rr(ctx, x, y, w, h, r)
  ctx.fillStyle = c
  ctx.fill()
}
function stroke(ctx, x, y, w, h, r, c, lw = 1) {
  rr(ctx, x, y, w, h, r)
  ctx.strokeStyle = c
  ctx.lineWidth = lw
  ctx.stroke()
}
function text(ctx, s, x, y, size, color, weight = 500, align = 'left', font = FONT) {
  ctx.font = `${weight} ${size}px ${font}`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillText(s, x, y)
}

const CONTENT_H = 640
const SWATCHES = [
  ['Moss', '#7c9a72'],
  ['Clay', '#d3956a'],
  ['Cream', '#f3ead9'],
  ['Sky', '#bcd3e6'],
  ['Ink', '#3b342d'],
  ['Mist', '#e9e4db'],
]

export function paintSecondaryScreen(ctx, W, H, t) {
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, W, H)

  // slow ping-pong scroll
  const scroll = ((1 - Math.cos(t * 0.09)) / 2) * (CONTENT_H - H + 24)

  ctx.save()
  ctx.translate(0, -scroll)

  // header
  text(ctx, 'Fern', 28, 32, 22, C.ink, 700)
  text(ctx, 'Design System', 84, 33, 12, C.soft, 500)
  fill(ctx, W - 92, 20, 64, 22, 11, '#e3ecdf')
  text(ctx, 'v1.4', W - 60, 31, 10, C.accent, 700, 'center')

  // section: colour
  section(ctx, 'COLOUR', 74)
  SWATCHES.forEach(([n, c], i) => {
    const x = 28 + i * 98
    fill(ctx, x, 92, 82, 54, 10, c)
    if (c === '#f3ead9' || c === '#e9e4db') stroke(ctx, x, 92, 82, 54, 10, C.line)
    text(ctx, n, x, 160, 10, C.ink, 700)
    text(ctx, c.toUpperCase(), x, 174, 8.5, C.faint, 500)
  })

  // section: type
  section(ctx, 'TYPE', 206)
  const rows = [
    ['Display', 30, 700],
    ['Heading', 20, 700],
    ['Body', 13, 500],
    ['Caption', 10, 600],
  ]
  rows.forEach(([n, s, w], i) => {
    const y = 236 + i * 44
    text(ctx, n, 28, y, 9, C.faint, 700)
    text(ctx, 'Grow something gentle', 120, y, s, C.ink, w)
    text(ctx, `${s} / ${Math.round(s * 1.35)}`, W - 28, y, 9, C.faint, 600, 'right')
  })

  // section: components
  section(ctx, 'COMPONENTS', 414)
  // buttons
  fill(ctx, 28, 434, 110, 34, 17, C.accent)
  text(ctx, 'Log care', 83, 451, 11, '#fff', 700, 'center')
  stroke(ctx, 150, 434, 110, 34, 17, C.accent, 1.2)
  text(ctx, 'Remind me', 205, 451, 11, C.accent, 700, 'center')
  text(ctx, 'Skip for now', 320, 451, 11, C.soft, 600, 'center')
  // input (focused with blinking caret)
  fill(ctx, 28, 484, 232, 36, 9, '#ffffff')
  stroke(ctx, 28, 484, 232, 36, 9, C.accent, 1.4)
  text(ctx, 'Monstera deli', 42, 502, 11, C.ink, 500)
  if (Math.floor(t * 1.6) % 2 === 0) {
    ctx.fillStyle = C.ink
    ctx.fillRect(126, 493, 1.2, 18)
  }
  fill(ctx, 276, 484, 180, 36, 9, '#ffffff')
  stroke(ctx, 276, 484, 180, 36, 9, C.line, 1)
  text(ctx, 'Room', 290, 502, 11, C.faint, 500)
  // toggles + chips
  const on = Math.sin(t * 0.5) > 0
  fill(ctx, 476, 492, 40, 20, 10, on ? C.accent : '#cfc8bc')
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(on ? 506 : 486, 502, 7, 0, Math.PI * 2)
  ctx.fill()
  ;['Indoor', 'Low light', 'Weekly'].forEach((c, i) => {
    const x = 28 + i * 84
    fill(ctx, x, 536, 74, 24, 12, i === 0 ? '#e3ecdf' : '#efeae1')
    text(ctx, c, x + 37, 548, 9.5, i === 0 ? C.accent : C.soft, 700, 'center')
  })
  // card
  fill(ctx, 300, 536, 312, 76, 14, '#ffffff')
  stroke(ctx, 300, 536, 312, 76, 14, C.line, 1)
  ctx.fillStyle = '#e7efe2'
  ctx.beginPath()
  ctx.arc(334, 574, 20, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = C.accent
  ctx.beginPath()
  ctx.ellipse(334, 574, 8, 13, -0.3, 0, Math.PI * 2)
  ctx.fill()
  text(ctx, 'Fiddle-leaf fig', 368, 565, 11.5, C.ink, 700)
  text(ctx, 'Bright indirect · Water Fri', 368, 583, 9.5, C.soft, 500)
  fill(ctx, 540, 562, 56, 22, 11, '#f7e9d3')
  text(ctx, 'Thirsty', 568, 573, 9, '#b06a3a', 700, 'center')

  // section: spacing
  section(ctx, 'SPACING', 640)
  ;[4, 8, 12, 16, 24, 32, 48].forEach((s, i) => {
    const x = 28 + i * 84
    fill(ctx, x, 660, s, s, 3, '#dfe6d9')
    text(ctx, `${s}`, x, 720, 9, C.faint, 600)
  })

  ctx.restore()

  // sticky top bar over scrolled content
  const g = ctx.createLinearGradient(0, 0, 0, 14)
  g.addColorStop(0, 'rgba(247,244,238,1)')
  g.addColorStop(1, 'rgba(247,244,238,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, 14)
  // scrollbar
  const trackH = H - 20
  const thumbH = (H / CONTENT_H) * trackH
  const thumbY = 10 + (scroll / (CONTENT_H - H + 24)) * (trackH - thumbH)
  fill(ctx, W - 8, thumbY, 4, thumbH, 2, 'rgba(59,52,45,0.18)')
}

function section(ctx, label, y) {
  text(ctx, label, 28, y, 9, C.faint, 700)
  ctx.fillStyle = C.line
  ctx.fillRect(28 + label.length * 7.2 + 10, y, 640 - 56 - label.length * 7.2 - 10, 1)
}
