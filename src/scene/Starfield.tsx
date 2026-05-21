import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SCENE } from '../lib/constants';

/**
 * 5,000 additively-blended white points distributed inside a sphere shell.
 * Each star carries a per-vertex size attribute for subtle parallax-feeling depth.
 * The whole field drifts via a slow group rotation in `useFrame`.
 */
export function Starfield() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const count = SCENE.STARFIELD_COUNT;
    const R = SCENE.STARFIELD_RADIUS;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Uniformly distributed direction (Marsaglia method)
      let x: number, y: number, z: number, lenSq: number;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        lenSq = x * x + y * y + z * z;
      } while (lenSq === 0 || lenSq > 1);
      const len = Math.sqrt(lenSq);

      // Bias radius toward the outer shell so the cube/rings live in less dense space
      const radius = R * (0.55 + Math.random() * 0.45);
      positions[i * 3 + 0] = (x / len) * radius;
      positions[i * 3 + 1] = (y / len) * radius;
      positions[i * 3 + 2] = (z / len) * radius;

      sizes[i] = 0.6 + Math.random() * 1.4;
    }

    return { positions, sizes };
  }, []);

  useFrame((_, delta) => {
    const group = pointsRef.current;
    if (!group) return;
    group.rotation.y += SCENE.STARFIELD_DRIFT_SPEED * delta * 60;
    group.rotation.x += SCENE.STARFIELD_DRIFT_SPEED * 0.4 * delta * 60;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
          count={sizes.length}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        color={0xffffff}
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
