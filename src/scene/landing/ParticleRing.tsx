import {
  useRef,
  useMemo,
  useEffect,
  useCallback,
  type MutableRefObject,
} from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { createRingMaterial, type RingUniforms } from './particleRingShader';
import { normalizeAngle } from '../../lib/math';
import { useNavigationStore } from '../../state/navigationStore';
import { useAppStore, type AppState } from '../../state/appStore';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SlotConfig {
  label: string;
  /** Angle in ring local space (radians). */
  theta: number;
  /** 0–3; local to THIS ring's shader. */
  slotIndex: number;
  /** Where clicking this slot navigates. */
  appTarget: AppState;
}

interface ParticleRingProps {
  radius: number;
  particleCount?: number;
  /** Radians per second. */
  rotationSpeed: number;
  slots: SlotConfig[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Half-arc (radians) that counts as "in the slot zone". ~24° */
const SLOT_HALF_ARC = 0.42;
const BUTTON_W = 1.95;
const BUTTON_H = 0.52;
/** Radial spread — gives rings visible volume instead of a hairline. */
const RING_THICKNESS = 0.42;
/** Vertical scatter so the ring isn't perfectly flat. */
const RING_Y_SPREAD = 0.18;

// ─── Geometry builder ─────────────────────────────────────────────────────────

function buildRingGeometry(
  radius: number,
  count: number,
  slots: SlotConfig[],
): THREE.BufferGeometry {
  const ringPos = new Float32Array(count * 3);
  const rectPos = new Float32Array(count * 3);
  const slotIdx = new Float32Array(count).fill(-1);

  for (let i = 0; i < count; i++) {
    const theta = (i / count) * Math.PI * 2;
    // Radial jitter gives the ring visible tube-like volume.
    const r = radius + (Math.random() - 0.5) * RING_THICKNESS;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    const y = (Math.random() - 0.5) * RING_Y_SPREAD;

    ringPos[i * 3 + 0] = x;
    ringPos[i * 3 + 1] = y;
    ringPos[i * 3 + 2] = z;

    // Default: rect = ring (particle doesn't move).
    rectPos[i * 3 + 0] = x;
    rectPos[i * 3 + 1] = y;
    rectPos[i * 3 + 2] = z;

    for (const slot of slots) {
      const diff = normalizeAngle(theta - slot.theta);
      if (Math.abs(diff) < SLOT_HALF_ARC) {
        slotIdx[i] = slot.slotIndex;

        // Map angular position to [-1, 1] along button's tangent axis.
        const u = diff / SLOT_HALF_ARC;
        // Random scatter along height axis for a "filled rectangle" look.
        const v = Math.random() * 2 - 1;

        const cx = radius * Math.cos(slot.theta);
        const cz = radius * Math.sin(slot.theta);
        // Tangent direction at slot.theta (perpendicular to radial in XZ plane).
        const tx = -Math.sin(slot.theta);
        const tz = Math.cos(slot.theta);

        rectPos[i * 3 + 0] = cx + u * (BUTTON_W / 2) * tx;
        rectPos[i * 3 + 1] = v * (BUTTON_H / 2);
        rectPos[i * 3 + 2] = cz + u * (BUTTON_W / 2) * tz;
        break;
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  // `position` is required by Three.js for bounding-sphere calc.
  geo.setAttribute('position', new THREE.BufferAttribute(ringPos.slice(), 3));
  geo.setAttribute('aRingPos', new THREE.BufferAttribute(ringPos, 3));
  geo.setAttribute('aRectPos', new THREE.BufferAttribute(rectPos, 3));
  geo.setAttribute('aSlotIdx', new THREE.BufferAttribute(slotIdx, 1));
  return geo;
}

// ─── SlotElement ─────────────────────────────────────────────────────────────

interface SlotElementProps {
  slot: SlotConfig;
  radius: number;
  morphRef: MutableRefObject<number>;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}

/** Radians between adjacent character centres along the ring arc. */
const CHAR_ARC_STEP = 0.052;

function SlotElement({ slot, radius, morphRef, onEnter, onLeave, onClick }: SlotElementProps) {
  const chars = slot.label.toUpperCase().split('');
  // Pre-allocate stable ref array — one entry per character.
  const charRefs = useRef<(any | null)[]>(chars.map(() => null));

  // Drive per-character fillOpacity from morphRef each frame — no React state, no re-renders.
  useFrame(() => {
    const v = morphRef.current;
    for (const mesh of charRefs.current) {
      if (mesh != null) mesh.fillOpacity = v;
    }
  });

  const pos: [number, number, number] = [
    radius * Math.cos(slot.theta),
    0,
    radius * Math.sin(slot.theta),
  ];

  return (
    <group>
      {/* Hover / click hit plane — Billboard so it always faces the camera. */}
      <group position={pos}>
        <Billboard>
          <mesh onPointerEnter={onEnter} onPointerLeave={onLeave} onClick={onClick}>
            <planeGeometry args={[BUTTON_W + 2.6, BUTTON_H + 2.2]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </Billboard>
      </group>

      {/* One <Text> per character, each Billboarded at its own arc position.
          The spread of 3D positions along the ring arc makes the label appear
          to curve with the ring when projected to screen — no background needed. */}
      {chars.map((char, i) => {
        const t = slot.theta + (i - (chars.length - 1) / 2) * CHAR_ARC_STEP;
        return (
          <Billboard key={i} position={[radius * Math.cos(t), 0, radius * Math.sin(t)]}>
            <Text
              ref={(el: any) => { charRefs.current[i] = el; }}
              font="/fonts/Orbitron.woff2"
              fontSize={0.30}
              color="white"
              fillOpacity={0}
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.05}
              depthTest={false}
              depthWrite={false}
              renderOrder={10}
            >
              {char}
            </Text>
          </Billboard>
        );
      })}
    </group>
  );
}

// ─── ParticleRing ─────────────────────────────────────────────────────────────

export function ParticleRing({
  radius,
  particleCount = 4000,
  rotationSpeed,
  slots,
}: ParticleRingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const tweenRefs = useRef<Record<number, gsap.core.Tween | null>>({});
  /** Magnetic dampening — incremented on enter, decremented on leave. While >0 the ring nearly stops, so a moving button is easy to click. */
  const hoverCountRef = useRef(0);
  const speedFactorRef = useRef(1);

  // One mutable ref per slot — GSAP tweens `.current` directly, SlotElement reads it in useFrame.
  const morphRefs = useMemo<Record<number, MutableRefObject<number>>>(() => {
    const out: Record<number, MutableRefObject<number>> = {};
    for (const slot of slots) {
      out[slot.slotIndex] = { current: 0 };
    }
    return out;
  }, [slots]);

  const geometry = useMemo(
    () => buildRingGeometry(radius, particleCount, slots),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [radius, particleCount],
  );

  const { material, uniforms } = useMemo(() => createRingMaterial(), []);

  useEffect(() => {
    materialRef.current = material;
    return () => {
      // Kill all in-flight tweens before geometry/material are disposed.
      Object.values(tweenRefs.current).forEach(t => t?.kill());
      geometry.dispose();
      material.dispose();
    };
  }, [material, geometry]);

  const setUniform = useCallback(
    (slotIndex: number, value: number) => {
      const u = uniforms as unknown as RingUniforms;
      switch (slotIndex) {
        case 0: u.uMorph0.value = value; break;
        case 1: u.uMorph1.value = value; break;
        case 2: u.uMorph2.value = value; break;
        case 3: u.uMorph3.value = value; break;
      }
    },
    [uniforms],
  );

  const handleEnter = useCallback(
    (slotIndex: number) => {
      hoverCountRef.current += 1;
      useNavigationStore.getState().setHovered(slots.find(s => s.slotIndex === slotIndex)?.appTarget ?? null);
      if (tweenRefs.current[slotIndex]) tweenRefs.current[slotIndex]!.kill();
      const morphRef = morphRefs[slotIndex];
      const target = { v: morphRef.current };
      tweenRefs.current[slotIndex] = gsap.to(target, {
        v: 1,
        duration: 0.32,
        ease: 'power3.out',
        onUpdate() {
          morphRef.current = target.v;
          setUniform(slotIndex, target.v);
        },
      });
    },
    [morphRefs, setUniform, slots],
  );

  const handleLeave = useCallback(
    (slotIndex: number) => {
      hoverCountRef.current = Math.max(0, hoverCountRef.current - 1);
      useNavigationStore.getState().setHovered(null);
      if (tweenRefs.current[slotIndex]) tweenRefs.current[slotIndex]!.kill();
      const morphRef = morphRefs[slotIndex];
      const target = { v: morphRef.current };
      tweenRefs.current[slotIndex] = gsap.to(target, {
        v: 0,
        duration: 0.45,
        ease: 'power2.in',
        onUpdate() {
          morphRef.current = target.v;
          setUniform(slotIndex, target.v);
        },
      });
    },
    [morphRefs, setUniform],
  );

  const handleClick = useCallback(
    (appTarget: AppState) => {
      const appState = useAppStore.getState().state;
      if (appState !== 'landing') return;
      useNavigationStore.getState().select(appTarget);
      // M3 will pick this up and fire the glitch transition.
    },
    [],
  );

  useFrame((_, delta) => {
    // Magnetic dampening: target factor is 0.08 while any slot is hovered, 1 otherwise.
    const targetFactor = hoverCountRef.current > 0 ? 0.08 : 1;
    speedFactorRef.current += (targetFactor - speedFactorRef.current) * Math.min(1, delta * 8);
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed * delta * speedFactorRef.current;
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry} material={material} frustumCulled={false} />

      {slots.map((slot) => (
        <SlotElement
          key={slot.label}
          slot={slot}
          radius={radius}
          morphRef={morphRefs[slot.slotIndex]}
          onEnter={() => handleEnter(slot.slotIndex)}
          onLeave={() => handleLeave(slot.slotIndex)}
          onClick={() => handleClick(slot.appTarget)}
        />
      ))}
    </group>
  );
}
