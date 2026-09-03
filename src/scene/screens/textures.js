/**
 * Static painted textures: framed posters and the view outside the window.
 */

function grain(ctx, W, H, amount = 0.05, count = 2200) {
  ctx.save()
  for (let i = 0; i < count; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    ctx.fillStyle = `rgba(60,40,20,${Math.random() * amount})`
    ctx.fillRect(x, y, 1.5, 1.5)
  }
  ctx.restore()
}

/** Poster A: warm abstract landscape (sun + hills). Portrait 256x340. */
export function paintPosterA(ctx, W, H) {
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.6)
  sky.addColorStop(0, '#f4e3c8')
  sky.addColorStop(1, '#f7cfa6')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, H)
  // sun
  ctx.fillStyle = '#e88a5a'
  ctx.beginPath()
  ctx.arc(W * 0.62, H * 0.34, W * 0.17, 0, Math.PI * 2)
  ctx.fill()
  // hills
  const hills = ['#c9b489', '#9fae84', '#6f8a66', '#4f6a4f']
  hills.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.beginPath()
    const base = H * (0.52 + i * 0.12)
    ctx.moveTo(0, H)
    ctx.lineTo(0, base + Math.sin(i) * 20)
    for (let x = 0; x <= W; x += 16) {
      const y = base + Math.sin(x * 0.02 + i * 1.7) * 18 + Math.cos(x * 0.045 + i) * 9
      ctx.lineTo(x, y)
    }
    ctx.lineTo(W, H)
    ctx.closePath()
    ctx.fill()
  })
  grain(ctx, W, H, 0.08)
  // caption
  ctx.fillStyle = '#3b342d'
  ctx.font = '600 10px "Manrope", system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('GOLDEN HOUR  ·  N° 03', 16, H - 16)
}

/** Poster B: geometric composition. Square 256x256. */
export function paintPosterB(ctx, W, H) {
  ctx.fillStyle = '#efe6d3'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#7c9a72'
  ctx.beginPath()
  ctx.arc(W * 0.42, H * 0.45, W * 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#d3956a'
  ctx.beginPath()
  ctx.arc(W * 0.66, H * 0.6, W * 0.2, Math.PI * 0.5, Math.PI * 1.5)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#3b342d'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(W * 0.42, H * 0.45, W * 0.38, Math.PI * 1.1, Math.PI * 1.7)
  ctx.stroke()
  ctx.fillStyle = '#3b342d'
  for (let i = 0; i < 5; i++) ctx.fillRect(W * 0.14 + i * 10, H * 0.8, 3, 26)
  ctx.font = '700 9px "Manrope", system-ui, sans-serif'
  ctx.fillText('FORM  /  FLOW', W * 0.14, H * 0.93)
  grain(ctx, W, H, 0.06, 1200)
}

/** Poster C: a small "photo print" (silhouetted trees at dusk). 320x240. */
export function paintPosterC(ctx, W, H) {
  ctx.fillStyle = '#fbf8f2'
  ctx.fillRect(0, 0, W, H)
  const pad = 14
  const g = ctx.createLinearGradient(0, pad, 0, H - pad - 24)
  g.addColorStop(0, '#b9c8dc')
  g.addColorStop(0.55, '#f0cfa8')
  g.addColorStop(1, '#d88a63')
  ctx.fillStyle = g
  ctx.fillRect(pad, pad, W - pad * 2, H - pad * 2 - 20)
  ctx.fillStyle = '#3c3530'
  // ground
  ctx.fillRect(pad, H - pad - 62, W - pad * 2, 42)
  // trees
  for (let i = 0; i < 9; i++) {
    const x = pad + 18 + i * 34 + Math.sin(i * 3) * 6
    const h = 40 + Math.sin(i * 1.3) * 16
    ctx.beginPath()
    ctx.moveTo(x, H - pad - 62)
    ctx.lineTo(x - 9, H - pad - 62)
    ctx.lineTo(x - 2, H - pad - 62 - h)
    ctx.lineTo(x + 5, H - pad - 62)
    ctx.closePath()
    ctx.fill()
  }
  ctx.fillStyle = '#8a8177'
  ctx.font = '500 9px "Manrope", system-ui, sans-serif'
  ctx.fillText('35mm  ·  f/2  ·  1/250', pad, H - 12)
  grain(ctx, W, H, 0.07, 1600)
}

/** The world outside the window: bright soft sky, hills, a few pastel houses. 1024x640. */
export function paintOutside(ctx, W, H) {
  const sky = ctx.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, '#a9c9e6')
  sky.addColorStop(0.45, '#d8e6ee')
  sky.addColorStop(0.72, '#f6e9cf')
  sky.addColorStop(1, '#f3dfb9')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, H)
  // soft clouds
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  const clouds = [
    [120, 110, 90],
    [200, 130, 70],
    [640, 80, 110],
    [730, 100, 80],
    [880, 190, 60],
  ]
  clouds.forEach(([x, y, r]) => {
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      ctx.arc(x + i * r * 0.55, y + Math.sin(i) * r * 0.15, r * (0.7 - i * 0.08), 0, Math.PI * 2)
      ctx.fill()
    }
  })
  // distant hills
  const hills = ['#cdd8bd', '#aebe9a', '#8fa580']
  hills.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.beginPath()
    const base = H * (0.6 + i * 0.09)
    ctx.moveTo(0, H)
    ctx.lineTo(0, base)
    for (let x = 0; x <= W; x += 24) {
      ctx.lineTo(x, base + Math.sin(x * 0.006 + i * 2.1) * 26 + Math.cos(x * 0.017 + i) * 10)
    }
    ctx.lineTo(W, H)
    ctx.closePath()
    ctx.fill()
  })
  // small pastel houses
  const houses = [
    [140, 0.78, '#f1e2cf'],
    [330, 0.8, '#e9d8c4'],
    [520, 0.79, '#f3e6d2'],
    [760, 0.81, '#ead9c2'],
    [900, 0.78, '#f0e1cd'],
  ]
  houses.forEach(([x, yf, c]) => {
    const y = H * yf
    ctx.fillStyle = c
    ctx.fillRect(x, y, 70, 60)
    ctx.fillStyle = '#c98c62'
    ctx.beginPath()
    ctx.moveTo(x - 6, y)
    ctx.lineTo(x + 35, y - 30)
    ctx.lineTo(x + 76, y)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#b9c8dc'
    ctx.fillRect(x + 12, y + 16, 14, 16)
    ctx.fillRect(x + 44, y + 16, 14, 16)
  })
  // trees
  for (let i = 0; i < 14; i++) {
    const x = 40 + i * 74 + Math.sin(i * 2.3) * 20
    const y = H * 0.84 + Math.sin(i) * 12
    ctx.fillStyle = '#6f8a66'
    ctx.fillRect(x - 3, y, 6, 30)
    ctx.fillStyle = i % 2 ? '#8fa87c' : '#7c9a72'
    ctx.beginPath()
    ctx.arc(x, y - 6, 22 + Math.sin(i * 1.7) * 6, 0, Math.PI * 2)
    ctx.fill()
  }
  // ground
  ctx.fillStyle = '#a9b98a'
  ctx.fillRect(0, H * 0.9, W, H * 0.1)
}
