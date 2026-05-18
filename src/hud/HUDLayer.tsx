import { useEffect } from 'react';
import { useAppStore, isHudState } from '../state/appStore';
import { useNavigationStore } from '../state/navigationStore';
import { useGlitchTransition } from '../transitions/useGlitchTransition';
import { HorizontalCompass } from './compass/HorizontalCompass';
import { GlassPanel } from './components/GlassPanel';
import { TerminalText } from './components/TerminalText';
import { ArsenalOverlay } from './arsenal/ArsenalOverlay';
import { CartOverlay } from './cart/CartOverlay';

// ─── CSS glitch overlay ───────────────────────────────────────────────────────

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

// ─── Simulator + Information placeholders ────────────────────────────────────

function SimulatorOverlay() {
  return (
    <div style={{ position: 'fixed', top: 72, right: 24, pointerEvents: 'auto' }}>
      <GlassPanel style={{ width: 280, padding: '20px 24px' }}>
        <TerminalText style={{ fontSize: 22, display: 'block', marginBottom: 8 }}>
          // SIMULATOR
        </TerminalText>
        <TerminalText dim style={{ fontSize: 16 }}>
          TARGETING SYSTEMS OFFLINE [M5]
        </TerminalText>
      </GlassPanel>
    </div>
  );
}

function InformationOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 72,
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'auto',
      }}
    >
      <GlassPanel style={{ width: 'min(640px, 86vw)', padding: '24px 32px' }}>
        <TerminalText style={{ fontSize: 22, display: 'block' }}>
          // INFORMATION SUBSYSTEM // RESERVED
        </TerminalText>
      </GlassPanel>
    </div>
  );
}

// ─── Root HUD layer ───────────────────────────────────────────────────────────

export function HUDLayer() {
  const appState = useAppStore(s => s.state);
  const pendingSelect = useNavigationStore(s => s.pendingSelect);
  const clearSelect = useNavigationStore(s => s.clearSelect);
  const triggerGlitch = useGlitchTransition();

  // Bridge: 3D landing button click → set pendingSelect → fire transition here.
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
