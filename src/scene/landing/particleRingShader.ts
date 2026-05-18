import * as THREE from 'three';

/**
 * Particle ring shader.
 *
 * Each particle carries:
 *   aRingPos  — rest position on the ring arc
 *   aRectPos  — target position inside the button rectangle (= aRingPos for
 *               particles that are not in a button slot zone)
 *   aSlotIdx  — which uMorphN uniform drives this particle (−1 = never morphs)
 *
 * The vertex shader interpolates mix(aRingPos, aRectPos, morphFactor).
 * The fragment shader draws soft additive white discs per point.
 */

const vertexShader = /* glsl */ `
  attribute vec3 aRingPos;
  attribute vec3 aRectPos;
  attribute float aSlotIdx;

  uniform float uMorph0;
  uniform float uMorph1;
  uniform float uMorph2;
  uniform float uMorph3;

  varying float vMorph;

  void main() {
    float m = 0.0;
    if      (aSlotIdx < -0.5) { m = 0.0; }
    else if (aSlotIdx <  0.5) { m = uMorph0; }
    else if (aSlotIdx <  1.5) { m = uMorph1; }
    else if (aSlotIdx <  2.5) { m = uMorph2; }
    else                      { m = uMorph3; }

    vMorph = m;

    vec3 pos = mix(aRingPos, aRectPos, m);
    gl_Position  = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 2.2 + m * 2.8;
  }
`;

const fragmentShader = /* glsl */ `
  varying float vMorph;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;

    float brightness = 0.55 + vMorph * 0.45;
    float alpha      = (1.0 - d * 1.85) * brightness;
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`;

export interface RingUniforms {
  uMorph0: THREE.IUniform<number>;
  uMorph1: THREE.IUniform<number>;
  uMorph2: THREE.IUniform<number>;
  uMorph3: THREE.IUniform<number>;
  [key: string]: THREE.IUniform<number>;
}

export function createRingMaterial(): {
  material: THREE.ShaderMaterial;
  uniforms: RingUniforms;
} {
  const uniforms: RingUniforms = {
    uMorph0: { value: 0 },
    uMorph1: { value: 0 },
    uMorph2: { value: 0 },
    uMorph3: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return { material, uniforms };
}
