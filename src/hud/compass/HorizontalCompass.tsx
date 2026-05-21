import { useMemo } from 'react';
import { useAppStore, type AppState } from '../../state/appStore';
import { useGlitchTransition } from '../../transitions/useGlitchTransition';
import { sfx } from '../../audio/sfx';
import { BbbMonogram } from '../components/BbbMonogram';

interface NavOption {
  label: string;
  target: AppState;
}

const ALL_OPTIONS: NavOption[] = [
  { label: 'ARSENAL',     target: 'hud.arsenal' },
  { label: 'INFORMATION', target: 'hud.information' },
  { label: 'CART',        target: 'hud.cart' },
  { label: 'SIMULATOR',   target: 'hud.simulator' },
  { label: 'DISCONNECT',  target: 'landing' },
];

/**
 * Top navigation bar — flat, predictable, always-visible horizontal row.
 * Replaced the scroll-driven carousel because the sliding strip was making
 * clicks miss their targets. KISS: every option is a clickable button,
 * styled to evoke a retro CRT terminal HUD.
 */
export function HorizontalCompass() {
  const appState = useAppStore(s => s.state);
  const triggerGlitch = useGlitchTransition();

  const options = useMemo(
    () => ALL_OPTIONS.filter(o => o.target !== appState),
    [appState],
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 54,
        zIndex: 20,
        pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 100%)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        borderBottom: '1px solid rgba(57,255,20,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
      }}
    >
      {/* Left brand mark */}
      <div
        style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'rgba(57,255,20,0.85)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          filter: 'drop-shadow(var(--bbb-glow-green-subtle))',
        }}
      >
        <BbbMonogram size={26} />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--bbb-text-xs)',
            letterSpacing: '0.34em',
            fontWeight: 700,
            color: 'rgba(57,255,20,0.7)',
          }}
        >
          BIG BOYS BOMBS
        </span>
      </div>

      {/* Options */}
      {options.map((opt) => (
        <CompassButton
          key={opt.target}
          option={opt}
          onClick={() => {
            sfx.play('click');
            triggerGlitch(opt.target);
          }}
        />
      ))}
    </div>
  );
}

// ─── A single nav button ─────────────────────────────────────────────────────

function CompassButton({ option, onClick }: { option: NavOption; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => sfx.play('hoverBeep')}
      style={{
        appearance: 'none',
        background: 'transparent',
        border: 'none',
        color: 'rgba(57,255,20,0.55)',
        fontFamily: 'var(--font-terminal)',
        fontSize: 18,
        letterSpacing: '0.14em',
        padding: '10px 18px',
        cursor: 'pointer',
        pointerEvents: 'auto',
        textShadow: 'var(--bbb-glow-green-subtle)',
        transition: 'color 0.15s, text-shadow 0.15s, background 0.15s',
        position: 'relative',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.color = 'var(--color-bbb-green)';
        e.currentTarget.style.textShadow = 'var(--bbb-glow-green-default)';
        e.currentTarget.style.background = 'rgba(57,255,20,0.06)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.color = 'rgba(57,255,20,0.55)';
        e.currentTarget.style.textShadow = 'var(--bbb-glow-green-subtle)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {option.label}
    </button>
  );
}
