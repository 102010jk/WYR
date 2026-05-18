import {
  useRef,
  useMemo,
  useEffect,
  useCallback,
  type MutableRefObject,
} from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Html } from '@react-three/drei';
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
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);

    ringPos[i * 3 + 0] = x;
    ringPos[i * 3 + 1] = 0;
    ringPos[i * 3 + 2] = z;

    // Default: rect = ring (particle doesn't move).
    rectPos[i * 3 + 0] = x;
    rectPos[i * 3 + 1] = 0;
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

function SlotElement({ slot, radius, morphRef, onEnter, onLeave, onClick }: SlotElementProps) {
  const divRef = useRef<HTMLDivElement>(null);

  // Drive HTML opacity + scale directly from morphRef — no React state, no re-renders.
  useFrame(() => {
    const v = morphRef.current;
    if (!divRef.current) return;
    divRef.current.style.opacity = String(v);
    divRef.current.style.transform = `scale(${0.88 + v * 0.12})`;
  });

  const pos: [number, number, number] = [
    radius * Math.cos(slot.theta),
    0,
    radius * Math.sin(slot.theta),
  ];

  return (
    <group position={pos}>
      {/* Invisible plane that always faces the camera — used for hover detection. */}
      <Billboard>
        <mesh
          onPointerEnter={onEnter}
          onPointerLeave={onLeave}
          onClick={onClick}
        >
          <planeGeometry args={[BUTTON_W + 0.5, BUTTON_H + 0.45]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </Billboard>

      {/* HTML label — rendered as a DOM element at the projected 3D position. */}
      <Html center zIndexRange={[5, 6]}>
        <div
          ref={divRef}
          onClick={onClick}
          style={{
            opacity: 0,
            pointerEvents: 'auto',
            cursor: 'crosshair',
            fontFamily: '"Orbitron", ui-sans-serif, sans-serif',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.22em',
            color: '#39ff14',
            textShadow: '0 0 12px rgba(57,255,20,0.9), 0 0 4px rgba(57,255,20,0.6)',
            background: 'rgba(255,255,255,0.045)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(57,255,20,0.38)',
            boxShadow:
              '0 0 18px rgba(57,255,20,0.14), inset 0 0 14px rgba(57,255,20,0.06)',
            padding: '7px 20px',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            willChange: 'opacity, transform',
          }}
        >
          {slot.label.toUpperCase()}
        </div>
      </Html>
    </group>
  );
}

// ─── ParticleRing ─────────────────────────────────────────────────────────────

export function ParticleRing({
  radius,
  particleCount = 1200,
  rotationSpeed,
  slots,
}: ParticleRingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const tweenRefs = useRef<Record<number, gsap.core.Tween | null>>({});

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
      useNavigationStore.getState().setHovered(slots.find(s => s.slotIndex === slotIndex)?.appTarget ?? null);
      if (tweenRefs.current[slotIndex]) tweenRefs.current[slotIndex]!.kill();
      const morphRef = morphRefs[slotIndex];
      const target = { v: morphRef.current };
      tweenRefs.current[slotIndex] = gsap.to(target, {
        v: 1,
        duration: 0.38,
        ease: 'power2.out',
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
      useNavigationStore.getState().setHovered(null);
      if (tweenRefs.current[slotIndex]) tweenRefs.current[slotIndex]!.kill();
      const morphRef = morphRefs[slotIndex];
      const target = { v: morphRef.current };
      tweenRefs.current[slotIndex] = gsap.to(target, {
        v: 0,
        duration: 0.38,
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
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed * delta;
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
