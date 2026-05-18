import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

interface WireframeEarthProps {
  radius?: number;
  /** Called with lat/lon when user clicks the surface (and didn't drag). */
  onTargetSelect?: (lat: number, lon: number) => void;
  /** If provided, draws a pulsing crosshair at this lat/lon. */
  marker?: { lat: number; lon: number } | null;
}

const CLICK_DRAG_THRESHOLD = 6; // px before we treat pointer-move as drag

/**
 * Stylised wireframe globe.
 *
 * - Outer faintly-glowing wireframe sphere (visual only).
 * - Lat/lng grid drawn as LineSegments for orientation.
 * - Invisible solid sphere as the raycast surface.
 * - Pointer-drag rotates the group around Y (yaw) and X (limited pitch).
 * - Pointer-up that didn't drag = click → resolves lat/lon via the hit point.
 */
export function WireframeEarth({
  radius = 1.6,
  onTargetSelect,
  marker = null,
}: WireframeEarthProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [autoSpin, setAutoSpin] = useState(true);
  const dragRef = useRef<{ x: number; y: number; total: number } | null>(null);
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(radius, 36, 24), [radius]);
  const wireGeo = useMemo(() => new THREE.WireframeGeometry(sphereGeo), [sphereGeo]);

  // Lat/lng grid — every 30°, drawn on top in slightly brighter green.
  const gridGeo = useMemo(() => {
    const pts: number[] = [];
    const seg = 64;
    // Latitude rings every 30°
    for (let lat = -60; lat <= 60; lat += 30) {
      const phi = (90 - lat) * (Math.PI / 180);
      const r = radius * Math.sin(phi);
      const y = radius * Math.cos(phi);
      for (let i = 0; i < seg; i++) {
        const a = (i / seg) * Math.PI * 2;
        const b = ((i + 1) / seg) * Math.PI * 2;
        pts.push(r * Math.cos(a), y, r * Math.sin(a));
        pts.push(r * Math.cos(b), y, r * Math.sin(b));
      }
    }
    // Longitude meridians every 30°
    for (let lon = 0; lon < 360; lon += 30) {
      const theta = (lon + 180) * (Math.PI / 180);
      for (let i = 0; i < seg; i++) {
        const a = (i / seg) * Math.PI;
        const b = ((i + 1) / seg) * Math.PI;
        const phi1 = a, phi2 = b;
        pts.push(
          radius * Math.sin(phi1) * Math.cos(theta),
          radius * Math.cos(phi1),
          radius * Math.sin(phi1) * Math.sin(theta),
        );
        pts.push(
          radius * Math.sin(phi2) * Math.cos(theta),
          radius * Math.cos(phi2),
          radius * Math.sin(phi2) * Math.sin(theta),
        );
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [radius]);

  // Dispose geometries on unmount.
  useEffect(() => {
    return () => {
      sphereGeo.dispose();
      wireGeo.dispose();
      gridGeo.dispose();
    };
  }, [sphereGeo, wireGeo, gridGeo]);

  useFrame((_, delta) => {
    if (!groupRef.current || !autoSpin) return;
    groupRef.current.rotation.y += 0.05 * delta;
  });

  // ── Drag / click handlers ──────────────────────────────────────────────────
  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, total: 0 };
    setAutoSpin(false);
  };

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragRef.current || !groupRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current.total += Math.abs(dx) + Math.abs(dy);
    dragRef.current.x = e.clientX;
    dragRef.current.y = e.clientY;

    groupRef.current.rotation.y += dx * 0.006;
    // Clamp pitch so user can't flip the globe.
    const next = groupRef.current.rotation.x + dy * 0.005;
    groupRef.current.rotation.x = Math.max(-0.9, Math.min(0.9, next));
  };

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!dragRef.current) return;
    const wasClick = dragRef.current.total < CLICK_DRAG_THRESHOLD;
    dragRef.current = null;

    if (wasClick && onTargetSelect && e.point && groupRef.current) {
      // World-space hit point → local-space (account for group rotation).
      const local = e.point.clone();
      groupRef.current.worldToLocal(local);
      local.normalize();
      // Convert local point on sphere → lat/lon.
      const lat = 90 - (Math.acos(local.y) * 180) / Math.PI;
      const lon = ((Math.atan2(local.z, -local.x) * 180) / Math.PI) - 180;
      onTargetSelect(lat, lon);
    }
  };

  // ── Marker position (local space) ──────────────────────────────────────────
  const markerLocal = useMemo<[number, number, number] | null>(() => {
    if (!marker) return null;
    const phi = (90 - marker.lat) * (Math.PI / 180);
    const theta = (marker.lon + 180) * (Math.PI / 180);
    const r = radius * 1.02;
    return [
      -(r * Math.sin(phi) * Math.cos(theta)),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
    ];
  }, [marker, radius]);

  return (
    <group ref={groupRef}>
      {/* Wireframe surface */}
      <lineSegments>
        <primitive attach="geometry" object={wireGeo} />
        <lineBasicMaterial color={0x39ff14} transparent opacity={0.18} />
      </lineSegments>

      {/* Lat/lng grid */}
      <lineSegments>
        <primitive attach="geometry" object={gridGeo} />
        <lineBasicMaterial color={0x39ff14} transparent opacity={0.42} />
      </lineSegments>

      {/* Invisible solid sphere for raycasting */}
      <mesh
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <primitive attach="geometry" object={sphereGeo} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Target marker (pulsing crosshair) */}
      {markerLocal && <TargetCrosshair position={markerLocal} />}
    </group>
  );
}

// ─── Target crosshair ────────────────────────────────────────────────────────

function TargetCrosshair({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const s = 1 + Math.sin(t * 4) * 0.18;
    groupRef.current.scale.setScalar(s);
  });

  // Crosshair: ring + two perpendicular lines.
  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <ringGeometry args={[0.05, 0.075, 24]} />
        <meshBasicMaterial color={0xdc2626} side={THREE.DoubleSide} transparent opacity={0.95} />
      </mesh>
      <mesh>
        <planeGeometry args={[0.18, 0.012]} />
        <meshBasicMaterial color={0xdc2626} transparent opacity={0.85} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[0.18, 0.012]} />
        <meshBasicMaterial color={0xdc2626} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}
