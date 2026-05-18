import { Canvas } from '@react-three/fiber';
import { Starfield } from './Starfield';
import { SCENE } from '../lib/constants';

/**
 * The single, persistent WebGL canvas. Mounted once at app root and never
 * unmounted — all "navigation" inside BBB shifts camera + sub-scenes, never
 * the renderer.
 */
export function SceneCanvas() {
  return (
    <Canvas
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: '#000',
      }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      dpr={[1, 2]}
      camera={{
        position: [...SCENE.CAMERA_LANDING_POS],
        fov: SCENE.CAMERA_FOV,
        near: SCENE.CAMERA_NEAR,
        far: SCENE.CAMERA_FAR,
      }}
    >
      <color attach="background" args={['#000000']} />
      <Starfield />
    </Canvas>
  );
}
