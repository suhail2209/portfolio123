import * as THREE from 'three'
import { useMemo, useEffect } from 'react'
import { NOISE_GLSL } from './glsl.js'

/**
 * Surface materials
 * -----------------
 * Every stylised surface in the room is a MeshStandardMaterial with a small,
 * modular GLSL injection (onBeforeCompile). Lighting, shadows and tone mapping
 * therefore stay fully three-native and each material can be tuned alone.
 *
 * kinds:
 *  wood     procedural grain (uses world position, continuous across meshes)
 *  wall     large soft tonal variation + fine plaster speckle
 *  fabric   fine speckle + soft velvet rim (stylised falloff)
 *  stripes  fur stripes (cat)
 *  curtain  vertex-displaced folds + breeze sway (plane in XY, hangs along -Y)
 *  sway     gentle leaf/stem sway, weighted by height (plants)
 *  plain    no color change (still gets the rim option)
 */

const registry = new Set()
/** Called once per frame by MaterialClock in Scene. */
export function tickSurfaceMaterials(t) {
  registry.forEach((m) => {
    if (m.userData.shader) m.userData.shader.uniforms.uTime.value = t
  })
}

const COLOR_FRAGMENTS = {
  wood: /* glsl */ `
    {
      vec3 p = vSPos * uScale;
      float along = GRAIN_ALONG;
      float across = GRAIN_ACROSS;
      float seam = 1.0;
      if (uPlanks > 0.0) {
        float id = floor(across * uPlanks);
        float f = fract(across * uPlanks);
        seam = 1.0 - smoothstep(0.955, 1.0, abs(f * 2.0 - 1.0)) * 0.45;
        across += hash21(vec2(id, 1.7)) * 3.0;
        along += hash21(vec2(id, 3.1)) * 7.0;
        diffuseColor.rgb *= 0.93 + hash21(vec2(id, 5.3)) * 0.14;
      }
      float warp = fbm(vec2(along * 0.35, across * 1.4)) * 2.2;
      float rings = sin(across * 14.0 + warp + along * 0.6) * 0.5 + 0.5;
      rings = pow(rings, 2.2);
      float fine = vnoise(vec2(along * 40.0, across * 240.0));
      float broad = fbm(vec2(along * 0.25, across * 0.6));
      float t = clamp(rings * 0.45 + fine * 0.22 + broad * 0.33, 0.0, 1.0);
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * uDark, t * uStrength) * seam;
    }
  `,
  wall: /* glsl */ `
    {
      vec3 p = vSPos * uScale;
      float big = fbm(vec2(p.x * 0.45 + p.z * 0.35, p.y * 0.45));
      float fine = vnoise(vec2(p.x * 70.0 + p.z * 70.0, p.y * 70.0));
      float t = (big - 0.5) * 0.14 + (fine - 0.5) * 0.045;
      diffuseColor.rgb *= 1.0 + t * uStrength;
    }
  `,
  fabric: /* glsl */ `
    {
      vec3 p = vSPos * uScale;
      float fine = vnoise(vec2(p.x * 160.0 + p.z * 160.0, p.y * 160.0));
      float weave = sin(p.x * 260.0) * sin(p.y * 260.0 + p.z * 260.0) * 0.5 + 0.5;
      diffuseColor.rgb *= 1.0 + ((fine - 0.5) * 0.10 + (weave - 0.5) * 0.03) * uStrength;
    }
  `,
  stripes: /* glsl */ `
    {
      vec3 p = vSPos * uScale;
      float w = fbm(vec2(p.x * 3.0, p.z * 3.0)) * 3.0;
      float s = sin(p.x * 34.0 + p.y * 12.0 + w);
      float stripe = smoothstep(0.35, 0.95, s);
      float belly = smoothstep(-0.02, -0.09, p.y);
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * uDark, stripe * (1.0 - belly) * uStrength);
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.98, 0.93, 0.85), belly * 0.55);
    }
  `,
  curtain: /* glsl */ `
    {
      vec3 p = vSPos * uScale;
      float fine = vnoise(vec2(p.x * 140.0, p.y * 140.0));
      float thread = sin(p.y * 600.0) * 0.5 + 0.5;
      diffuseColor.rgb *= 1.0 + ((fine - 0.5) * 0.08 + (thread - 0.5) * 0.02) * uStrength;
    }
  `,
  sway: '',
  plain: '',
}

const RIM_FRAGMENT = /* glsl */ `
  {
    vec3 vDir = normalize(vViewPosition);
    float rim = pow(1.0 - clamp(dot(vDir, normal), 0.0, 1.0), 3.0);
    totalEmissiveRadiance += diffuseColor.rgb * rim * uRim;
  }
`

const CURTAIN_DISPLACE = /* glsl */ `
  float curtainZ(vec3 p, float t) {
    float folds = sin(p.x * 21.0) * 0.028 + sin(p.x * 9.0 + 1.3) * 0.018;
    float h = clamp((uTop - p.y) / uHeight, 0.0, 1.0);
    float sway = sin(t * 0.55 + p.x * 4.0) * 0.045 + sin(t * 1.15 + p.x * 9.0 + p.y * 2.0) * 0.014;
    float lift = sin(t * 0.32 + p.x * 2.0) * 0.02;
    return folds + (sway + lift) * pow(h, 1.6);
  }
`
const SWAY_DISPLACE = /* glsl */ `
  vec3 swayOffset(vec3 p, float t) {
    float ph = (modelMatrix[3].x * 3.1 + modelMatrix[3].z * 2.7);
    float wy = (modelMatrix * vec4(p, 1.0)).y - uTop; // uTop = base height of the plant
    float w = clamp(wy / max(uHeight, 0.001), 0.0, 1.0);
    w = w * w;
    float sx = sin(t * 0.9 + ph) * 0.018 + sin(t * 2.1 + ph * 1.7) * 0.006;
    float sz = cos(t * 0.7 + ph * 1.3) * 0.014;
    return vec3(sx, 0.0, sz) * w * uStrength;
  }
`

const VS_CURTAIN_NORMAL = /* glsl */ `
        #include <beginnormal_vertex>
        {
          float e = 0.01;
          float z0 = curtainZ(position, uTime);
          float zx = curtainZ(position + vec3(e, 0.0, 0.0), uTime);
          float zy = curtainZ(position + vec3(0.0, e, 0.0), uTime);
          objectNormal = normalize(vec3(-(zx - z0) / e, -(zy - z0) / e, 1.0));
        }`

/**
 * options:
 *  kind      wood | wall | fabric | stripes | curtain | sway | plain
 *  color     base colour
 *  dark      grain / stripe colour multiplier
 *  strength  0..1 amount of procedural variation
 *  scale     spatial scale of the pattern
 *  rim       stylised rim light amount
 *  grain     x | z | y   wood grain direction
 *  space     world | object
 *  top/height  curtain rod height and drop (curtain kind) / plant height (sway kind)
 */
export function createSurfaceMaterial(o) {
  const {
    kind = 'plain',
    color = '#ffffff',
    dark = '#6b4d33',
    strength = 1,
    scale = 1,
    rim = 0,
    grain = 'x',
    space = 'world',
    top = 2.6,
    height = 2.3,
    planks = 0,
    ...rest
  } = o

  const mat = new THREE.MeshStandardMaterial({ color, ...rest })
  const uniforms = {
    uTime: { value: 0 },
    uScale: { value: scale },
    uStrength: { value: strength },
    uDark: { value: new THREE.Color(dark) },
    uRim: { value: rim },
    uTop: { value: top },
    uHeight: { value: height },
    uPlanks: { value: planks },
  }
  mat.userData.uniforms = uniforms

  const grainAlong = grain === 'x' ? 'p.x' : grain === 'z' ? 'p.z' : 'p.y'
  const grainAcross = grain === 'x' ? '(p.z + p.y * 0.35)' : grain === 'z' ? '(p.x + p.y * 0.35)' : '(p.x + p.z)'
  const colorFrag = (COLOR_FRAGMENTS[kind] || '').replace('GRAIN_ALONG', grainAlong).replace('GRAIN_ACROSS', grainAcross)
  const spaceExpr = space === 'object' ? 'transformed' : '(modelMatrix * vec4(transformed, 1.0)).xyz'

  const header = /* glsl */ `
      uniform float uTime;
      uniform float uScale;
      uniform float uStrength;
      uniform vec3 uDark;
      uniform float uRim;
      uniform float uTop;
      uniform float uHeight;
      uniform float uPlanks;
      varying vec3 vSPos;
      ${NOISE_GLSL}
    `
  const MAIN = 'void main() {'
  const BEGIN_VERTEX = '#include <begin_vertex>'
  const BEGIN_NORMAL = '#include <beginnormal_vertex>'
  const COLOR_FRAG = '#include <color_fragment>'
  const EMISSIVE_FRAG = '#include <emissivemap_fragment>'

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)

    let vs = shader.vertexShader
    const extra = (kind === 'curtain' ? CURTAIN_DISPLACE : '') + (kind === 'sway' ? SWAY_DISPLACE : '')
    vs = vs.replace(MAIN, header + extra + '\n' + MAIN)
    if (kind === 'curtain') {
      vs = vs.replace(BEGIN_NORMAL, VS_CURTAIN_NORMAL)
      vs = vs.replace(BEGIN_VERTEX, BEGIN_VERTEX + '\n transformed.z += curtainZ(position, uTime);\n vSPos = ' + spaceExpr + ';')
    } else if (kind === 'sway') {
      vs = vs.replace(BEGIN_VERTEX, BEGIN_VERTEX + '\n transformed += swayOffset(position, uTime);\n vSPos = ' + spaceExpr + ';')
    } else {
      vs = vs.replace(BEGIN_VERTEX, BEGIN_VERTEX + '\n vSPos = ' + spaceExpr + ';')
    }
    shader.vertexShader = vs

    let fs = shader.fragmentShader
    fs = fs.replace(MAIN, header + '\n' + MAIN)
    if (colorFrag) fs = fs.replace(COLOR_FRAG, COLOR_FRAG + '\n' + colorFrag)
    if (rim > 0) fs = fs.replace(EMISSIVE_FRAG, EMISSIVE_FRAG + '\n' + RIM_FRAGMENT)
    shader.fragmentShader = fs

    mat.userData.shader = shader
  }
  mat.customProgramCacheKey = () => 'surface-' + kind + '-' + grain + '-' + space + '-' + (rim > 0 ? 'rim' : 'norim')

  registry.add(mat)
  return mat
}

/** React hook: memoised material that is disposed on unmount. */
export function useSurfaceMaterial(options) {
  const key = JSON.stringify(options)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mat = useMemo(() => createSurfaceMaterial(options), [key])
  useEffect(
    () => () => {
      registry.delete(mat)
      mat.dispose()
    },
    [mat],
  )
  return mat
}
