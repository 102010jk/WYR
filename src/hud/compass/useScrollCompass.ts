import { useCallback, useEffect, useRef, useState } from 'react';

export const COMPASS_OPTION_WIDTH = 200; // px per compass tick slot

/** Pixels of wheel deltaY required to advance one option. Tuned for predictability. */
const SCROLL_STEP = 70;
/** Per-frame easing factor for the strip animation (higher = snappier). */
const EASING = 0.22;

/**
 * Discrete-stepping compass control.
 *
 * - Wheel deltaY accumulates; each SCROLL_STEP px advances ±1 option.
 * - Arrow keys (←/→/↑/↓) advance ±1 option immediately.
 * - Touch swipe accumulates similarly.
 * - The strip's CSS transform eases toward the target each frame via a DOM-direct
 *   write (no React re-render during animation).
 * - `activeIdx` is React state — only updates on discrete option changes.
 */
export function useScrollCompass(count: number) {
  const [activeIdx, setActiveIdx] = useState(0);
  const targetIdxRef = useRef(0);
  const offsetRef = useRef(0);
  const stripRef = useRef<HTMLDivElement>(null);

  const advance = useCallback(
    (dir: number) => {
      setActiveIdx((prev) => {
        const next = Math.max(0, Math.min(count - 1, prev + dir));
        targetIdxRef.current = next;
        return next;
      });
    },
    [count],
  );

  useEffect(() => {
    if (count === 0) return;

    // Reset on options change.
    setActiveIdx(0);
    targetIdxRef.current = 0;
    offsetRef.current = 0;
    let wheelAcc = 0;
    let touchAcc = 0;
    let lastTouchY = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelAcc += e.deltaY;
      while (Math.abs(wheelAcc) >= SCROLL_STEP) {
        const dir = wheelAcc > 0 ? 1 : -1;
        wheelAcc -= dir * SCROLL_STEP;
        advance(dir);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        advance(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        advance(-1);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY;
      touchAcc = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const dy = lastTouchY - e.touches[0].clientY;
      touchAcc += dy;
      lastTouchY = e.touches[0].clientY;
      while (Math.abs(touchAcc) >= SCROLL_STEP) {
        const dir = touchAcc > 0 ? 1 : -1;
        touchAcc -= dir * SCROLL_STEP;
        advance(dir);
      }
    };

    let rafId: number;
    const tick = () => {
      offsetRef.current += (targetIdxRef.current - offsetRef.current) * EASING;
      if (stripRef.current) {
        const viewCenter = window.innerWidth / 2;
        const tx = viewCenter - COMPASS_OPTION_WIDTH / 2 - offsetRef.current * COMPASS_OPTION_WIDTH;
        stripRef.current.style.transform = `translateX(${tx}px)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [count, advance]);

  return { stripRef, activeIdx };
}
