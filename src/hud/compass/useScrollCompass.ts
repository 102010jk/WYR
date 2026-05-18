import { useEffect, useRef, useState } from 'react';

export const COMPASS_OPTION_WIDTH = 190; // px per compass tick slot

const DAMPING = 0.87;
const SNAP_STRENGTH = 0.14;
const SNAP_THRESHOLD = 0.004;

/**
 * Scroll-physics hook for the horizontal compass.
 *
 * - `wheel` events drive a damped velocity → continuous `offsetRef` (0 to count−1).
 * - When velocity is near-zero, `offsetRef` snaps toward the nearest integer.
 * - `stripRef` is applied a `translateX` every frame via direct DOM mutation
 *   (no React re-renders) for 60fps smoothness.
 * - `activeIdx` is React state — updates only on discrete option changes, so
 *   CompassTick highlight re-renders are cheap.
 */
export function useScrollCompass(count: number) {
  const offsetRef = useRef(0);
  const velRef = useRef(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const prevIdxRef = useRef(0);

  useEffect(() => {
    if (count === 0) return;

    // Prevent the compass from remembering scroll position across state changes.
    offsetRef.current = 0;
    velRef.current = 0;
    setActiveIdx(0);
    prevIdxRef.current = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      velRef.current += e.deltaY * 0.006;
    };

    let lastTouchY = 0;
    const onTouchStart = (e: TouchEvent) => { lastTouchY = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const dy = lastTouchY - e.touches[0].clientY;
      velRef.current += dy * 0.01;
      lastTouchY = e.touches[0].clientY;
    };

    let rafId: number;
    const tick = () => {
      velRef.current *= DAMPING;
      offsetRef.current += velRef.current;
      // Clamp to valid range.
      offsetRef.current = Math.max(0, Math.min(count - 1, offsetRef.current));

      const nearest = Math.round(offsetRef.current);
      if (Math.abs(velRef.current) < SNAP_THRESHOLD) {
        offsetRef.current += (nearest - offsetRef.current) * SNAP_STRENGTH;
      }

      // Direct DOM update — bypasses React reconciler entirely.
      if (stripRef.current) {
        const viewCenter = window.innerWidth / 2;
        const tx = viewCenter - COMPASS_OPTION_WIDTH / 2 - offsetRef.current * COMPASS_OPTION_WIDTH;
        stripRef.current.style.transform = `translateX(${tx}px)`;
      }

      const idx = Math.round(offsetRef.current);
      if (idx !== prevIdxRef.current) {
        prevIdxRef.current = idx;
        setActiveIdx(idx);
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [count]);

  return { stripRef, activeIdx };
}
