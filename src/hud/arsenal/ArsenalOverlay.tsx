import { useMemo } from 'react';
import { WEAPON_CATEGORIES } from '../../data/categories';
import { WEAPONS_BY_CATEGORY, WEAPON_MAP } from '../../data/weapons';
import { useArsenalStore } from '../../state/arsenalStore';
import { useCartStore } from '../../state/cartStore';
import { useGlitchTransition } from '../../transitions/useGlitchTransition';
import { useStaggerIn } from '../../animations/useStaggerIn';
import { GlassPanel } from '../components/GlassPanel';
import { TerminalText } from '../components/TerminalText';
import { DataReadout } from '../components/DataReadout';
import { RedAlertButton } from '../components/RedAlertButton';
import { MiniChart } from '../components/MiniChart';
import type { Weapon } from '../../data/types';

// ─── Currency formatter ──────────────────────────────────────────────────────

const fmtUsd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

// ─── Category list (left column) ─────────────────────────────────────────────

function CategoryAccordion() {
  const expanded = useArsenalStore((s) => s.expandedCategory);
  const selected = useArsenalStore((s) => s.selectedWeaponId);
  const toggleCategory = useArsenalStore((s) => s.toggleCategory);
  const selectWeapon = useArsenalStore((s) => s.selectWeapon);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {WEAPON_CATEGORIES.map((cat) => {
        const isOpen = expanded === cat.id;
        const weapons = WEAPONS_BY_CATEGORY[cat.id] ?? [];
        return (
          <div key={cat.id}>
            <button
              onClick={() => toggleCategory(cat.id)}
              style={{
                appearance: 'none',
                width: '100%',
                background: isOpen ? 'rgba(57,255,20,0.08)' : 'transparent',
                border: 'none',
                borderLeft: `2px solid ${isOpen ? 'var(--color-bbb-green)' : 'rgba(57,255,20,0.15)'}`,
                color: isOpen ? 'var(--color-bbb-green)' : 'rgba(57,255,20,0.55)',
                fontFamily: 'var(--font-terminal)',
                fontSize: 20,
                letterSpacing: '0.08em',
                textAlign: 'left',
                padding: '10px 16px',
                cursor: 'pointer',
                pointerEvents: 'auto',
                textShadow: isOpen ? '0 0 8px rgba(57,255,20,0.6)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {isOpen ? '▾ ' : '▸ '}
              {cat.label}
            </button>
            {isOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 0 6px 18px' }}>
                {weapons.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => selectWeapon(w.id)}
                    style={{
                      appearance: 'none',
                      background: selected === w.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                      border: 'none',
                      color: selected === w.id ? '#fff' : 'rgba(255,255,255,0.55)',
                      fontFamily: 'var(--font-terminal)',
                      fontSize: 17,
                      letterSpacing: '0.06em',
                      textAlign: 'left',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                    }}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Weapon details (right column) ───────────────────────────────────────────

function WeaponDetails({ weapon }: { weapon: Weapon }) {
  const addItem = useCartStore((s) => s.addItem);
  const triggerGlitch = useGlitchTransition();

  const handleTest = () => {
    addItem(weapon.id); // pre-load into cart so simulator can target it eventually
    triggerGlitch('hud.simulator');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '0.16em',
            color: '#fff',
            textShadow: '0 0 14px rgba(255,255,255,0.4)',
          }}
        >
          {weapon.name}
        </div>
        <div style={{ marginTop: 6, color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.5 }}>
          {weapon.description}
        </div>
      </div>

      <div>
        <DataReadout label="YIELD"    value={weapon.statistics.yieldKt.toString()} unit="kt" />
        <DataReadout label="RANGE"    value={weapon.statistics.rangeKm.toLocaleString()} unit="km" />
        <DataReadout label="ACCURACY" value={weapon.statistics.accuracy.toString()} unit="%" />
        <DataReadout label="MASS"     value={weapon.statistics.massKg.toLocaleString()} unit="kg" />
        <DataReadout
          label="UNIT COST"
          value={fmtUsd.format(weapon.statistics.costUsd)}
          emphasis
        />
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <MiniChart
          data={weapon.performanceCurve}
          title="EFFECTIVENESS / RANGE"
          xLabel="km"
          yLabel="%"
        />
        <MiniChart
          data={weapon.accuracyCurve}
          title="ACCURACY / ALTITUDE"
          xLabel="km"
          yLabel="%"
          color="#5cffe4"
        />
      </div>

      <div>
        <div style={{ color: 'rgba(57,255,20,0.5)', fontSize: 12, letterSpacing: '0.18em', marginBottom: 6 }}>
          CAPABILITIES
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {weapon.capabilities.map((c) => (
            <li
              key={c}
              style={{
                fontFamily: 'var(--font-terminal)',
                fontSize: 17,
                color: 'rgba(255,255,255,0.78)',
                padding: '3px 0',
              }}
            >
              ▸ {c}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <RedAlertButton onClick={handleTest}>TEST</RedAlertButton>
        <button
          onClick={() => addItem(weapon.id)}
          style={{
            appearance: 'none',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.28)',
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.32em',
            padding: '14px 28px',
            cursor: 'pointer',
            pointerEvents: 'auto',
          }}
        >
          + ADD TO CART
        </button>
      </div>
    </div>
  );
}

// ─── Top-level Arsenal overlay ───────────────────────────────────────────────

export function ArsenalOverlay() {
  const selectedId = useArsenalStore((s) => s.selectedWeaponId);
  const selectedWeapon = useMemo(
    () => (selectedId ? WEAPON_MAP.get(selectedId) ?? null : null),
    [selectedId],
  );
  const rootRef = useStaggerIn<HTMLDivElement>();

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed',
        top: 72,
        bottom: 24,
        left: 24,
        right: 24,
        zIndex: 11,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <GlassPanel
        data-bbb-stagger
        style={{
          width: '100%',
          maxWidth: 1100,
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: 0,
          pointerEvents: 'auto',
          overflow: 'hidden',
        }}
      >
        {/* Left: category accordion */}
        <div
          data-bbb-stagger
          style={{
            borderRight: '1px solid rgba(57,255,20,0.12)',
            padding: '18px 12px',
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: '0 12px 12px', borderBottom: '1px solid rgba(57,255,20,0.12)', marginBottom: 10 }}>
            <TerminalText style={{ fontSize: 18 }}>// ARSENAL</TerminalText>
          </div>
          <CategoryAccordion />
        </div>

        {/* Right: details */}
        <div data-bbb-stagger style={{ padding: '24px 32px', overflowY: 'auto' }}>
          {selectedWeapon ? (
            <WeaponDetails weapon={selectedWeapon} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <TerminalText dim style={{ fontSize: 22 }}>
                ▸ SELECT A WEAPON FROM THE CATALOGUE
              </TerminalText>
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
