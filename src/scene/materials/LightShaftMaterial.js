import * as THREE from 'three'

/** Additive, very faint sunlight slab. uv.y = 1 at the window, 0 at the floor. */
export function createLightShaftMaterial(opacity = 0.07) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: opacity },
      uColor: { value: new THREE.Color('#ffe7b8') },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float along = pow(vUv.y, 1.4);
        float edge = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
        float drift = 0.85 + 0.15 * sin(uTime * 0.28 + vUv.x * 4.0 + vUv.y * 2.0);
        float a = along * edge * drift * uOpacity;
        gl_FragColor = vec4(uColor * a, a);
      }
    `,
  })
}
