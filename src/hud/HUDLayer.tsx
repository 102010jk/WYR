import { useAppStore } from '../state/appStore';
import { useNavigationStore } from '../state/navigationStore';

/**
 * Top-level HTML overlay. Sits above the Three.js canvas; pointer-events: none
 * by default so it doesn't steal canvas interactions.
 *
 * M1/M2: renders a green debug readout (state + hover + selection).
 * M3+: replaced by the real HUD compass and per-state overlays.
 */
export function HUDLayer() {
  const state = useAppStore((s) => s.state);
  const hovered = useNavigationStore((s) => s.hoveredOption);
  const pending = useNavigationStore((s) => s.pendingSelect);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <div
        className="bbb-flicker"
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          color: 'var(--color-bbb-green)',
          fontFamily: 'var(--font-terminal)',
          fontSize: 20,
          lineHeight: 1.35,
          textShadow: '0 0 6px rgba(57,255,20,0.5)',
          letterSpacing: '0.04em',
        }}
      >
        <div>BBB // BIG BOYS BOMBS</div>
        <div>STATE: {state}</div>
        {hovered && <div style={{ color: '#fff' }}>HOVER: {hovered}</div>}
        {pending && (
          <div style={{ color: 'var(--color-bbb-crimson)' }}>
            &gt; NAVIGATING → {pending}
          </div>
        )}
      </div>
    </div>
  );
}
