import { Canvas } from '@react-three/fiber';
import { Starfield } from './Starfield';
import { LandingScene } from './landing/LandingScene';
import { CameraRig } from './CameraRig';
import { CartEarthScene } from '../hud/cart/CartEarthScene';
import { useAppStore } from '../state/appStore';
import { SCENE } from '../lib/constants';

/**
 * The single, persistent WebGL canvas. Mounted once at app root and never
 * unmounted — all "navigation" inside BBB shifts camera + sub-scenes, never
 * the renderer.
 *
 * The wrapper div receives `bbb-canvas-glitching` during transitions so the
 * CSS keyframe can shake/filter the entire 3D viewport.
 */
export function SceneCanvas() {
  const appState = useAppStore(s => s.state);
  const phase = useAppStore(s => s.transitionPhase);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      className={phase !== 'idle' ? 'bbb-canvas-glitching' : ''}
    >
      <Canvas
        style={{ width: '100%', height: '100%', display: 'block', background: '#000' }}
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
        {appState === 'landing' && <LandingScene />}
        {appState === 'hud.cart' && <CartEarthScene />}
        <CameraRig />
      </Canvas>
    </div>
  );
}
