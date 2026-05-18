import { useAppStore } from '../state/appStore';

/**
 * Top-level HTML overlay. Sits above the Three.js canvas and pointer-events: none
 * by default so it doesn't steal canvas interactions; individual overlays opt in
 * with `pointer-events: auto`.
 *
 * Milestone 1 deliverable: prove the routing by rendering `STATE: <state>` in green
 * VT323. Real overlays land in Milestones 3–5.
 */
export function HUDLayer() {
  const state = useAppStore((s) => s.state);
  const transitionPhase = useAppStore((s) => s.transitionPhase);

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
          fontSize: 22,
          lineHeight: 1.2,
          textShadow: '0 0 6px rgba(57,255,20,0.55)',
          letterSpacing: '0.04em',
        }}
      >
        <div>BBB // BIG BOYS BOMBS</div>
        <div>STATE: {state}</div>
        <div style={{ opacity: 0.6 }}>PHASE: {transitionPhase}</div>
      </div>
    </div>
  );
}
