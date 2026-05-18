/**
 * BBB · Global constants.
 *
 * Palette tokens mirror those declared in `src/index.css` (@theme block) so that
 * non-Tailwind layers (Three.js materials, GSAP color tweens) reference the same
 * values without drift. Keep this file synchronized with `index.css`.
 */

export const PALETTE = {
  BLACK: '#000000',
  WHITE: '#ffffff',
  GREEN: '#39ff14',
  GREEN_DIM: '#1a9c0a',
  CRIMSON: '#dc2626',
  CRIMSON_BRIGHT: '#ff2d2d',
} as const;

export const SCENE = {
  STARFIELD_COUNT: 5000,
  STARFIELD_RADIUS: 60,
  STARFIELD_DRIFT_SPEED: 0.0008,
  CAMERA_FOV: 55,
  CAMERA_NEAR: 0.1,
  CAMERA_FAR: 200,
  /** Slight overhead angle so the flat XZ rings read as 3D circles. Camera pulled
   * back enough to frame the large (R=4.6) landing ring with breathing room. */
  CAMERA_LANDING_POS: [0, 2.4, 9.2] as const,
} as const;

export const TRANSITION = {
  GLITCH_OUT_MS: 350,
  GLITCH_IN_MS: 350,
} as const;
