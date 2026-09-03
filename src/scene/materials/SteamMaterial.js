import * as THREE from 'three'
import { NOISE_GLSL } from './glsl.js'

/** Coffee steam: noise-driven wisps on a small billboard, alpha only. */
export function createSteamMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;
      ${NOISE_GLSL}
      void main() {
        vec2 uv = vUv;
        float t = uTime * 0.22;
        float wob = sin(uv.y * 5.0 + t * 2.0) * 0.12 * uv.y;
        float n = fbm(vec2((uv.x + wob) * 3.2, uv.y * 2.2 - t * 1.7));
        float wisp = smoothstep(0.42, 0.72, n);
        float shape = smoothstep(0.0, 0.3, uv.x) * smoothstep(1.0, 0.7, uv.x)
                    * pow(1.0 - uv.y, 1.3) * smoothstep(0.0, 0.12, uv.y);
        float a = wisp * shape * 0.5;
        gl_FragColor = vec4(vec3(1.0, 0.99, 0.97), a);
      }
    `,
  })
}
