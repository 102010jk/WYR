import { useEffect, useRef } from 'react';
import { staggerIn } from './anime';

/**
 * Attaches to an overlay root. On mount, finds every descendant element
 * with `data-bbb-stagger` and fades-and-slides them in via anime.js.
 *
 * Usage:
 *   const ref = useStaggerIn<HTMLDivElement>();
 *   return <div ref={ref}>... children with data-bbb-stagger ...</div>;
 */
export function useStaggerIn<T extends HTMLElement = HTMLDivElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!ref.current) return;
    const els = ref.current.querySelectorAll<HTMLElement>('[data-bbb-stagger]');
    if (els.length === 0) return;
    // Reset opacity to 0 so anime can ramp it (in case React already painted).
    els.forEach((el) => {
      el.style.opacity = '0';
    });
    staggerIn(Array.from(els));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
