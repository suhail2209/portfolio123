import * as THREE from 'three'

/**
 * Screen material: unlit canvas texture + soft vignette + gentle breathing glow.
 * uHover lifts brightness slightly when the monitor is hovered.
 *
 * UV source (uUvMode):
 *   0 = geometry uv (default)
 *   1 = derived from local position.xz inside [uMin, uMax]  (Z-up meshes, e.g. Sketchfab OBJ exports)
 *   2 = derived from local position.xy inside [uMin, uMax]
 * Position-derived UVs make it possible to project the screen onto an imported
 * mesh whose own UVs are unknown, without touching the asset.
 */
export function createScreenMaterial(map, { uvMode = 0, min = [0, 0], max = [1, 1] } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: map },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uBoost: { value: 1.18 },
      uUvMode: { value: uvMode },
      uMin: { value: new THREE.Vector2(min[0], min[1]) },
      uMax: { value: new THREE.Vector2(max[0], max[1]) },
    },
    vertexShader: /* glsl */ `
      uniform float uUvMode;
      uniform vec2 uMin;
      uniform vec2 uMax;
      varying vec2 vUv;
      void main() {
        if (uUvMode > 0.5 && uUvMode < 1.5) vUv = (position.xz - uMin) / (uMax - uMin);
        else if (uUvMode > 1.5) vUv = (position.xy - uMin) / (uMax - uMin);
        else vUv = uv;
        vUv = clamp(vUv, 0.0, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uTime;
      uniform float uHover;
      uniform float uBoost;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv;
        vec3 col = texture2D(uMap, uv).rgb;
        float vig = smoothstep(0.0, 0.16, uv.x) * smoothstep(1.0, 0.84, uv.x)
                  * smoothstep(0.0, 0.22, uv.y) * smoothstep(1.0, 0.78, uv.y);
        col *= mix(0.88, 1.0, vig);
        col *= uBoost * (1.0 + 0.02 * sin(uTime * 0.7) + 0.10 * uHover);
        float sheen = smoothstep(0.42, 0.0, abs(uv.y - 0.86 + uv.x * 0.22));
        col += vec3(1.0, 0.985, 0.96) * 0.035 * sheen;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  })
}
