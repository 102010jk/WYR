import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAppStore } from '../state/appStore';
import { CAMERA_WAYPOINTS } from '../transitions/sceneTransitions';

/**
 * Sits inside the Canvas. Reacts to `appStore.state` changes and animates
 * the camera position via GSAP. `camera.lookAt` is applied every frame so the
 * camera always faces the target even while position is animating.
 *
 * Mounted once — never unmounts.
 */
export function CameraRig() {
  const { camera } = useThree();
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  const prevState = useRef(useAppStore.getState().state);

  useEffect(() => {
    return useAppStore.subscribe((store) => {
      const { state } = store;
      if (state === prevState.current) return;
      prevState.current = state;

      const wp = CAMERA_WAYPOINTS[state];

      gsap.to(camera.position, {
        x: wp.pos[0],
        y: wp.pos[1],
        z: wp.pos[2],
        duration: 0.75,
        ease: 'power2.inOut',
      });

      gsap.to(lookAtTarget.current, {
        x: wp.lookAt[0],
        y: wp.lookAt[1],
        z: wp.lookAt[2],
        duration: 0.75,
        ease: 'power2.inOut',
      });
    });
  }, [camera]);

  useFrame(() => {
    camera.lookAt(lookAtTarget.current);
  });

  return null;
}
