import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Impact } from '../../state/simulatorStore';
import { WEAPON_MAP } from '../../data/weapons';

interface ImpactEffectProps {
  impact: Impact;
  globeRadius: number;
  onDone: () => void;
}

/**
 * Visualises a single impact event.
 *
 * Phases (depending on weapon type):
 *   1. STREAK / BEAM — projectile leaves the camera position (the "ship") and
 *      reaches the surface. For lasers this is a thick red cylinder drawn
 *      instantly; for missiles/drones a short streak; grenades skip this phase.
 *   2. FIREBALL — an expanding additive sphere at the impact point.
 *   3. SHOCKWAVE RING — a flat ring expanding outward, fading out.
 *
 * Visual style varies by weapon.category. Color ramps go
 * white → yellow → orange → crimson → black over the impact's lifetime.
 */
export function ImpactEffect({ impact, globeRadius, onDone }: ImpactEffectProps) {
  const weapon = WEAPON_MAP.get(impact.weaponId);
  const groupRef = useRef<THREE.Group>(null);
  const fireballRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const beamGroupRef = useRef<THREE.Group>(null);
  const completedRef = useRef(false);
  const { camera } = useThree();

  // ── Local space surface point (relative to the globe at origin) ──────────
  const localPos = useMemo<THREE.Vector3>(() => {
    const phi = (90 - impact.lat) * (Math.PI / 180);
    const theta = (impact.lon + 180) * (Math.PI / 180);
    const r = globeRadius * 1.005;
    return new THREE.Vector3(
      -(r * Math.sin(phi) * Math.cos(theta)),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
    );
  }, [impact.lat, impact.lon, globeRadius]);

  // ── Orient the beam group: local +Y points from the impact toward the ship.
  useEffect(() => {
    if (!beamGroupRef.current) return;
    const shipPos = camera.position.clone();
    // Direction from impact → ship (outward).
    const dir = shipPos.sub(localPos).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir,
    );
    beamGroupRef.current.quaternion.copy(quat);
    // Length of the beam = distance from impact to ship.
    const dist = camera.position.distanceTo(localPos);
    beamGroupRef.current.scale.set(1, dist, 1);
  }, [camera, localPos]);

  // ── Color ramp ────────────────────────────────────────────────────────────
  const colorAt = (t: number, base: THREE.Color): THREE.Color => {
    // 0..0.15 = white-hot
    // 0.15..0.35 = yellow
    // 0.35..0.6 = orange
    // 0.6..0.9 = crimson
    // 0.9..1 = black
    const c = new THREE.Color();
    if (t < 0.15) c.setRGB(1, 1, 1);
    else if (t < 0.35) c.lerpColors(new THREE.Color(1, 1, 1), new THREE.Color(1, 0.85, 0.3), (t - 0.15) / 0.2);
    else if (t < 0.6) c.lerpColors(new THREE.Color(1, 0.85, 0.3), new THREE.Color(1, 0.35, 0.05), (t - 0.35) / 0.25);
    else if (t < 0.9) c.lerpColors(new THREE.Color(1, 0.35, 0.05), base, (t - 0.6) / 0.3);
    else c.lerpColors(base, new THREE.Color(0.05, 0, 0), (t - 0.9) / 0.1);
    return c;
  };

  // ── Animation tick ────────────────────────────────────────────────────────
  useFrame(() => {
    if (completedRef.current || !weapon) return;
    const now = performance.now() / 1000;
    const elapsed = now - impact.t0;
    const t = elapsed / impact.duration;
    if (t >= 1) {
      completedRef.current = true;
      onDone();
      return;
    }

    // Effect tuning per category.
    let fireballMax = 0.12;
    let ringMax = 0.5;
    let beamLifetime = 0;          // seconds the beam stays visible
    let baseColor = new THREE.Color(0.6, 0.1, 0.05);
    switch (weapon.category) {
      case 'nuke':
        fireballMax = globeRadius * 0.32;
        ringMax = globeRadius * 0.85;
        beamLifetime = 0.45;
        baseColor = new THREE.Color(0.7, 0.18, 0.06);
        break;
      case 'missile':
        fireballMax = globeRadius * 0.16;
        ringMax = globeRadius * 0.45;
        beamLifetime = 0.5;
        baseColor = new THREE.Color(0.7, 0.18, 0.06);
        break;
      case 'orbital-laser':
        fireballMax = globeRadius * 0.10;
        ringMax = globeRadius * 0.22;
        beamLifetime = impact.duration; // beam holds the whole shot
        baseColor = new THREE.Color(0.85, 0.08, 0.08);
        break;
      case 'drone-strike':
        fireballMax = globeRadius * 0.07;
        ringMax = globeRadius * 0.18;
        beamLifetime = 0.3;
        baseColor = new THREE.Color(0.85, 0.4, 0.05);
        break;
      case 'grenade':
        fireballMax = globeRadius * 0.025;
        ringMax = globeRadius * 0.05;
        beamLifetime = 0;
        baseColor = new THREE.Color(0.9, 0.6, 0.1);
        break;
    }

    const eased = 1 - (1 - t) ** 3; // ease-out cubic
    const fade = Math.min(1, (1 - t) * 1.6);

    if (fireballRef.current) {
      fireballRef.current.scale.setScalar(fireballMax * Math.min(1, eased * 1.4));
      const mat = fireballRef.current.material as THREE.MeshBasicMaterial;
      mat.color.copy(colorAt(t, baseColor));
      mat.opacity = fade;
    }
    if (ringRef.current) {
      ringRef.current.scale.setScalar(ringMax * eased);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.color.copy(colorAt(t, baseColor));
      mat.opacity = fade * 0.6;
    }
    if (beamRef.current && beamLifetime > 0) {
      // Beam intensity profile: rise quickly, hold, then fade.
      let beamA: number;
      const lifeT = elapsed / beamLifetime;
      if (lifeT < 0.1) beamA = lifeT / 0.1;
      else if (lifeT < 0.7) beamA = 1;
      else if (lifeT < 1) beamA = 1 - (lifeT - 0.7) / 0.3;
      else beamA = 0;
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = beamA * 0.95;
    } else if (beamRef.current) {
      (beamRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
    }
  });

  if (!weapon) return null;

  const isBeam = weapon.category === 'orbital-laser';
  const beamColor =
    isBeam ? 0xff2020
    : weapon.category === 'missile' || weapon.category === 'nuke' ? 0xffaa55
    : 0xffd07a;
  const beamRadius =
    isBeam ? 0.018
    : weapon.category === 'nuke' ? 0.012
    : 0.008;

  // The unit cylinder is centred at origin with height 1; we offset it so it
  // sits ABOVE the impact along local +Y. The group's scale.y = beam length.
  return (
    <group ref={groupRef} position={localPos}>
      {/* Beam / streak group — oriented in useEffect so +Y points to the ship. */}
      <group ref={beamGroupRef}>
        <mesh ref={beamRef} position={[0, 0.5, 0]}>
          <cylinderGeometry args={[beamRadius, beamRadius * 0.4, 1, 10, 1, true]} />
          <meshBasicMaterial
            color={beamColor}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Fireball */}
      <mesh ref={fireballRef} scale={[0.001, 0.001, 0.001]}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshBasicMaterial
          color={0xffffff}
          transparent
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Shockwave ring — flat, lying tangent to the surface at the impact. */}
      <mesh ref={ringRef} scale={[0.001, 0.001, 0.001]} quaternion={
        new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          localPos.clone().normalize(),
        )
      }>
        <ringGeometry args={[0.7, 1.0, 32]} />
        <meshBasicMaterial
          color={0xffaa55}
          transparent
          opacity={0.5}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
