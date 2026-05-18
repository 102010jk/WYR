import { WireframeCube } from './WireframeCube';
import { ParticleRing, type SlotConfig } from './ParticleRing';

/**
 * STATE 0 — Landing scene.
 *
 * Layout:
 *   Ring 0  (inner,  R=1.9):  Arsenal (θ=0) + Simulator (θ=π)
 *   Ring 1  (middle, R=3.0):  Information (θ=0)
 *   Ring 2  (outer,  R=4.2):  Cart (θ=0)
 *
 * Ring slot indices are LOCAL per ring (each ring's ShaderMaterial owns its
 * own uMorph0–uMorph3 uniforms).
 */

const ring0Slots: SlotConfig[] = [
  { label: 'Arsenal',   theta: 0,         slotIndex: 0, appTarget: 'hud.arsenal' },
  { label: 'Simulator', theta: Math.PI,   slotIndex: 1, appTarget: 'hud.simulator' },
];

const ring1Slots: SlotConfig[] = [
  { label: 'Information', theta: 0, slotIndex: 0, appTarget: 'hud.information' },
];

const ring2Slots: SlotConfig[] = [
  { label: 'Cart', theta: 0, slotIndex: 0, appTarget: 'hud.cart' },
];

export function LandingScene() {
  return (
    <group>
      <WireframeCube />
      <ParticleRing radius={1.9} rotationSpeed={0.22} slots={ring0Slots} />
      <ParticleRing radius={3.0} rotationSpeed={0.13} slots={ring1Slots} />
      <ParticleRing radius={4.2} rotationSpeed={0.08} slots={ring2Slots} />
    </group>
  );
}
