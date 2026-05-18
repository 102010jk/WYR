import { useMemo } from 'react';
import { useAppStore, type AppState } from '../../state/appStore';
import { useGlitchTransition } from '../../transitions/useGlitchTransition';
import { useScrollCompass, COMPASS_OPTION_WIDTH } from './useScrollCompass';
import { CompassTick, type NavOption } from './CompassTick';

const ALL_OPTIONS: NavOption[] = [
  { label: 'ARSENAL',     target: 'hud.arsenal' },
  { label: 'INFORMATION', target: 'hud.information' },
  { label: 'CART',        target: 'hud.cart' },
  { label: 'SIMULATOR',   target: 'hud.simulator' },
  { label: 'DISCONNECT',  target: 'landing' },
];

/**
 * Top-mounted retro green compass bar.
 * Visible only in HUD states. Active page is excluded from options.
 * Scroll anywhere rotates the strip; clicking a tick triggers the glitch transition.
 */
export function HorizontalCompass() {
  const appState = useAppStore(s => s.state);
  const triggerGlitch = useGlitchTransition();

  const options = useMemo(
    () => ALL_OPTIONS.filter(o => o.target !== appState),
    [appState],
  );

  const { stripRef, activeIdx } = useScrollCompass(options.length);

  const initialTx = window.innerWidth / 2 - COMPASS_OPTION_WIDTH / 2;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 52,
        zIndex: 20,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderBottom: '1px solid rgba(57,255,20,0.18)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Active-tick indicator: fixed vertical bars at viewport centre */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: COMPASS_OPTION_WIDTH,
          transform: 'translateX(-50%)',
          borderLeft: '1px solid rgba(57,255,20,0.28)',
          borderRight: '1px solid rgba(57,255,20,0.28)',
          background: 'rgba(57,255,20,0.04)',
          pointerEvents: 'none',
        }}
      />

      {/* Scrolling strip — position updated every frame via DOM ref */}
      <div
        ref={stripRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'flex',
          height: '100%',
          willChange: 'transform',
          transform: `translateX(${initialTx}px)`,
          pointerEvents: 'none',
        }}
      >
        {options.map((opt, i) => (
          <CompassTick
            key={opt.target}
            option={opt}
            isActive={i === activeIdx}
            onClick={() => triggerGlitch(opt.target as AppState)}
          />
        ))}
      </div>
    </div>
  );
}
