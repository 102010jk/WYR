import { WEAPON_CATEGORIES } from '../../data/categories';
import { WEAPONS_BY_CATEGORY } from '../../data/weapons';
import { useSimulatorStore } from '../../state/simulatorStore';
import { sfx } from '../../audio/sfx';
import { GlassPanel } from '../components/GlassPanel';
import { TerminalText } from '../components/TerminalText';

const fmtUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function WeaponPalette() {
  const activeId = useSimulatorStore((s) => s.activeWeaponId);
  const setActive = useSimulatorStore((s) => s.setActiveWeapon);

  return (
    <GlassPanel
      style={{
        width: 280,
        maxHeight: '100%',
        padding: '18px 16px',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ paddingBottom: 10, borderBottom: '1px solid rgba(57,255,20,0.15)', marginBottom: 10 }}>
        <TerminalText style={{ fontSize: 18 }}>// ORDNANCE</TerminalText>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {WEAPON_CATEGORIES.map((cat) => (
          <div key={cat.id} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontFamily: 'var(--font-terminal)',
                fontSize: 14,
                letterSpacing: '0.18em',
                color: 'rgba(57,255,20,0.55)',
                marginBottom: 4,
                paddingLeft: 6,
              }}
            >
              {cat.shortLabel}
            </div>
            {(WEAPONS_BY_CATEGORY[cat.id] ?? []).map((w) => {
              const isActive = activeId === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => { sfx.play('click'); setActive(w.id); }}
                  style={{
                    appearance: 'none',
                    width: '100%',
                    textAlign: 'left',
                    background: isActive ? 'rgba(220,38,38,0.18)' : 'rgba(255,255,255,0.025)',
                    border: `1px solid ${isActive ? 'rgba(220,38,38,0.7)' : 'rgba(255,255,255,0.08)'}`,
                    color: isActive ? '#ff7575' : 'rgba(255,255,255,0.78)',
                    fontFamily: 'var(--font-terminal)',
                    fontSize: 15,
                    letterSpacing: '0.04em',
                    padding: '6px 10px',
                    marginBottom: 4,
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    transition: 'all 0.12s',
                    textShadow: isActive ? '0 0 8px rgba(220,38,38,0.7)' : 'none',
                  }}
                >
                  <div>{isActive ? '▸ ' : '  '}{w.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                    {w.statistics.yieldKt} kt · {fmtUsd.format(w.statistics.costUsd)}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
