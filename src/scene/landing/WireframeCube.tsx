import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Edges-only wireframe cube at the scene centre.
 * Rotates slowly on Y and X axes to give the impression of gentle tumbling.
 */
export function WireframeCube() {
  const meshRef = useRef<THREE.LineSegments>(null);

  useFrame((_, delta) => {
    const m = meshRef.current;
    if (!m) return;
    m.rotation.y += 0.18 * delta;
    m.rotation.x += 0.07 * delta;
  });

  return (
    <lineSegments ref={meshRef}>
      <edgesGeometry args={[new THREE.BoxGeometry(1.1, 1.1, 1.1)]} />
      <lineBasicMaterial color={0xffffff} transparent opacity={0.55} />
    </lineSegments>
  );
}
