import { useEffect, useRef, useState } from 'react';
import { Route } from '../types';

const COMPASS_ROUTES: { id: Route | 'landing'; label: string; disc?: boolean }[] = [
  { id: 'arsenal',     label: 'ARSENAL'    },
  { id: 'information', label: 'INFORMATION'},
  { id: 'cart',        label: 'CART'       },
  { id: 'simulator',   label: 'SIMULATOR'  },
  { id: 'landing',     label: 'DISCONNECT', disc: true },
];

const COMPASS_GAP = 200;

interface Props {
  route: Route;
  onNavigate: (route: Route) => void;
}

export default function Compass({ route, onNavigate }: Props) {
  const visible = route !== 'landing';
  const [activeIdx, setActiveIdx] = useState(() => COMPASS_ROUTES.findIndex(r => r.id === route));
  const accumRef = useRef(0);
  const dwellRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Sync active index when route changes externally
  useEffect(() => {
    const idx = COMPASS_ROUTES.findIndex(r => r.id === route);
    if (idx >= 0) setActiveIdx(idx);
  }, [route]);

  function select(idx: number, commit: boolean) {
    const clamped = Math.max(0, Math.min(COMPASS_ROUTES.length - 1, idx));
    setActiveIdx(clamped);
    if (commit) {
      const r = COMPASS_ROUTES[clamped];
      if (r && r.id !== route) onNavigate(r.id as Route);
    }
  }

  // Scroll handler
  useEffect(() => {
    if (!visible) return;
    function onWheel(e: WheelEvent) {
      if ((e.target as HTMLElement)?.closest?.('.tweaks, .accordion, .items, .summary, .picker, .analytics, .detail, .pick-overlay')) return;
      e.preventDefault();
      accumRef.current += e.deltaY || e.deltaX;
      const STEP = 180;
      if (Math.abs(accumRef.current) > STEP) {
        const dir = accumRef.current > 0 ? 1 : -1;
        accumRef.current = 0;
        setActiveIdx(prev => {
          const next = Math.max(0, Math.min(COMPASS_ROUTES.length - 1, prev + dir));
          if (dwellRef.current) clearTimeout(dwellRef.current);
          dwellRef.current = setTimeout(() => {
            const r = COMPASS_ROUTES[next];
            if (r) onNavigate(r.id as Route);
          }, 450);
          return next;
        });
      }
    }
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [visible, onNavigate]);

  const transform = `translate(${-(activeIdx * COMPASS_GAP + 100)}px, -50%)`;

  return (
    <div className={`compass${visible ? ' on' : ''}`}>
      <div className="frame">
        <div className="ticks" />
        <div className="ticks bot" />
        <div
          className="track"
          ref={trackRef}
          style={{ transform }}
        >
          {COMPASS_ROUTES.map((r, i) => (
            <div
              key={r.id}
              className={`item${r.disc ? ' disc' : ''}${i === activeIdx ? ' active' : ''}`}
              onClick={() => select(i, true)}
            >
              {r.label}
            </div>
          ))}
        </div>
        <div className="reticle" />
      </div>
    </div>
  );
}
