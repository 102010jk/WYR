import { useEffect } from 'react';
import { useSimulatorStore } from '../../state/simulatorStore';
import { WEAPON_MAP } from '../../data/weapons';
import { useStaggerIn } from '../../animations/useStaggerIn';
import { WeaponPalette } from './WeaponPalette';
import { LiveAnalytics } from './LiveAnalytics';

/**
 * Composes the simulator HUD around the 3D globe (rendered in canvas).
 * Left panel: weapon palette. Right panel: live analytics. Centre: empty (globe).
 * A status banner across the top reports the currently armed payload.
 */
export function SimulatorOverlay() {
  const activeId = useSimulatorStore((s) => s.activeWeaponId);
  const activeWeapon = activeId ? WEAPON_MAP.get(activeId) : null;

  // Auto-select a default weapon so the user can immediately fire on the globe.
  const setActive = useSimulatorStore((s) => s.setActiveWeapon);
  useEffect(() => {
    if (!useSimulatorStore.getState().activeWeaponId) {
      setActive('l-zeus'); // start armed with ZEUS-X (so the laser SFX is the first thing they hear)
    }
  }, [setActive]);

  const rootRef = useStaggerIn<HTMLDivElement>();

  return (
    <div ref={rootRef}>
      {/* Status banner */}
      <div
        data-bbb-stagger
        style={{
          position: 'fixed',
          top: 64,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 12,
          pointerEvents: 'none',
          padding: '8px 22px',
          background: 'rgba(0,0,0,0.65)',
          border: `1px solid ${activeWeapon ? 'rgba(220,38,38,0.55)' : 'rgba(57,255,20,0.3)'}`,
          fontFamily: 'var(--font-terminal)',
          fontSize: 'var(--bbb-text-md)',
          letterSpacing: '0.16em',
          color: activeWeapon ? '#ff7575' : 'rgba(57,255,20,0.7)',
          textShadow: activeWeapon
            ? 'var(--bbb-glow-crimson-default)'
            : 'var(--bbb-glow-green-subtle)',
        }}
      >
        {activeWeapon
          ? `▸ ARMED: ${activeWeapon.name} · CLICK GLOBE TO ENGAGE`
          : '▸ NO PAYLOAD SELECTED'}
      </div>

      {/* Left palette */}
      <div
        data-bbb-stagger
        style={{
          position: 'fixed',
          left: 18,
          top: 110,
          bottom: 24,
          zIndex: 11,
          pointerEvents: 'none',
          display: 'flex',
        }}
      >
        <WeaponPalette />
      </div>

      {/* Right analytics */}
      <div
        data-bbb-stagger
        style={{
          position: 'fixed',
          right: 18,
          top: 110,
          zIndex: 11,
          pointerEvents: 'none',
        }}
      >
        <LiveAnalytics />
      </div>
    </div>
  );
}
