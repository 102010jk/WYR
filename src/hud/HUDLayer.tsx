import { useEffect } from 'react';
import { useAppStore, isHudState } from '../state/appStore';
import { useNavigationStore } from '../state/navigationStore';
import { useGlitchTransition } from '../transitions/useGlitchTransition';
import { HorizontalCompass } from './compass/HorizontalCompass';
import { GlassPanel } from './components/GlassPanel';
import { TerminalText } from './components/TerminalText';

// ─── CSS glitch overlay ───────────────────────────────────────────────────────

/**
 * Full-screen overlay that plays a CSS glitch animation during transitions.
 * Renders nothing during 'idle'. Does not intercept pointer events.
 */
function GlitchOverlay() {
  const phase = useAppStore(s => s.transitionPhase);
  if (phase === 'idle') return null;

  return (
    <div
      key={phase}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 30,
        pointerEvents: 'none',
        animation: 'bbb-glitch-overlay 0.7s ease-out forwards',
      }}
    />
  );
}

// ─── Per-state HUD overlays (placeholders for M4) ────────────────────────────

function ArsenalOverlay() {
  return (
    <GlassPanel
      style={{
        position: 'fixed',
        top: 64,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(900px, 92vw)',
        padding: '32px 40px',
        pointerEvents: 'auto',
      }}
    >
      <TerminalText style={{ fontSize: 28, display: 'block', marginBottom: 12 }}>
        // ARSENAL SUBSYSTEM
      </TerminalText>
      <TerminalText dim style={{ fontSize: 20 }}>
        WEAPON CATALOG LOADING... [M4]
      </TerminalText>
    </GlassPanel>
  );
}

function CartOverlay() {
  return (
    <GlassPanel
      style={{
        position: 'fixed',
        top: 64,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(900px, 92vw)',
        padding: '32px 40px',
        pointerEvents: 'auto',
      }}
    >
      <TerminalText style={{ fontSize: 28, display: 'block', marginBottom: 12 }}>
        // PROCUREMENT CART
      </TerminalText>
      <TerminalText dim style={{ fontSize: 20 }}>
        AWAITING PAYLOAD SELECTION... [M4]
      </TerminalText>
    </GlassPanel>
  );
}

function SimulatorOverlay() {
  return (
    <GlassPanel
      style={{
        position: 'fixed',
        top: 64,
        right: 24,
        width: 280,
        padding: '24px 28px',
        pointerEvents: 'auto',
      }}
    >
      <TerminalText style={{ fontSize: 24, display: 'block', marginBottom: 10 }}>
        // SIMULATOR
      </TerminalText>
      <TerminalText dim style={{ fontSize: 18 }}>
        TARGETING SYSTEMS OFFLINE [M5]
      </TerminalText>
    </GlassPanel>
  );
}

function InformationOverlay() {
  return (
    <GlassPanel
      style={{
        position: 'fixed',
        top: 64,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(900px, 92vw)',
        padding: '32px 40px',
        pointerEvents: 'auto',
      }}
    >
      <TerminalText style={{ fontSize: 28, display: 'block', marginBottom: 12 }}>
        // INFORMATION SUBSYSTEM // RESERVED
      </TerminalText>
    </GlassPanel>
  );
}

// ─── Root HUD layer ───────────────────────────────────────────────────────────

export function HUDLayer() {
  const appState = useAppStore(s => s.state);
  const pendingSelect = useNavigationStore(s => s.pendingSelect);
  const clearSelect = useNavigationStore(s => s.clearSelect);
  const triggerGlitch = useGlitchTransition();

  // Bridge: when a 3D landing button is clicked, pendingSelect is set.
  // Pick it up here and fire the transition.
  useEffect(() => {
    if (!pendingSelect) return;
    triggerGlitch(pendingSelect);
    clearSelect();
  }, [pendingSelect, clearSelect, triggerGlitch]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <GlitchOverlay />

      {isHudState(appState) && <HorizontalCompass />}

      {appState === 'hud.arsenal'     && <ArsenalOverlay />}
      {appState === 'hud.cart'        && <CartOverlay />}
      {appState === 'hud.simulator'   && <SimulatorOverlay />}
      {appState === 'hud.information' && <InformationOverlay />}
    </div>
  );
}
