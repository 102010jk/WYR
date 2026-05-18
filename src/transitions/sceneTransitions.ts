import type { AppState } from '../state/appStore';

/**
 * Camera position + lookAt target for each app state.
 * Positions are [x, y, z].
 * lookAt is always (0, 0, 0) in M3 — the planet/Earth waypoints are added in M4/M5.
 */

export interface CameraWaypoint {
  pos: [number, number, number];
  lookAt: [number, number, number];
}

export const CAMERA_WAYPOINTS: Record<AppState, CameraWaypoint> = {
  landing:          { pos: [0, 2.2, 7.5], lookAt: [0, 0, 0] },
  'hud.arsenal':    { pos: [0, 1.2, 8.5], lookAt: [0, 0, 0] },
  'hud.cart':       { pos: [0, 1.2, 8.5], lookAt: [0, 0, 0] },
  'hud.simulator':  { pos: [0, 1.2, 8.5], lookAt: [0, 0, 0] },
  'hud.information':{ pos: [0, 1.2, 8.5], lookAt: [0, 0, 0] },
};
