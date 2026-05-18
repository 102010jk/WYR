export const TWO_PI = Math.PI * 2;

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Normalize angle to [−π, π]. */
export function normalizeAngle(a: number): number {
  while (a > Math.PI) a -= TWO_PI;
  while (a < -Math.PI) a += TWO_PI;
  return a;
}

/** Convert polar angle + radius to XZ coordinates (Y = 0). */
export function polarToXZ(r: number, theta: number): [number, number] {
  return [r * Math.cos(theta), r * Math.sin(theta)];
}

/** Lat/lon degrees → XYZ on a sphere of `radius`. Used in Cart/Simulator. */
export function latLonToVec3(
  lat: number,
  lon: number,
  radius: number,
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}
