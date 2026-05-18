import { WireframeCube } from './WireframeCube';
import { ParticleRing, type SlotConfig } from './ParticleRing';

/**
 * STATE 0 — Landing scene.
 *
 * Single large ring with the 4 nav slots distributed 90° apart:
 *   θ = 0      → Arsenal       (right)
 *   θ = π/2    → Information   (front, closer to camera)
 *   θ = π      → Cart          (left)
 *   θ = 3π/2   → Simulator     (back, farther from camera)
 *
 * The ring rotates slowly so the user has to track each label as it sweeps
 * through the visible arc.
 */

const slots: SlotConfig[] = [
  { label: 'Arsenal',     theta: 0,             slotIndex: 0, appTarget: 'hud.arsenal' },
  { label: 'Information', theta: Math.PI / 2,   slotIndex: 1, appTarget: 'hud.information' },
  { label: 'Cart',        theta: Math.PI,       slotIndex: 2, appTarget: 'hud.cart' },
  { label: 'Simulator',   theta: Math.PI * 1.5, slotIndex: 3, appTarget: 'hud.simulator' },
];

export function LandingScene() {
  return (
    <group>
      <WireframeCube />
      <ParticleRing radius={3.4} particleCount={7000} rotationSpeed={0.11} slots={slots} />
    </group>
  );
}
