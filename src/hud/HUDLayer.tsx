import { useEffect } from 'react';
import { useAppStore, isHudState } from '../state/appStore';
import { useNavigationStore } from '../state/navigationStore';
import { useAudioStore } from '../state/audioStore';
import { useGlitchTransition } from '../transitions/useGlitchTransition';
import { HorizontalCompass } from './compass/HorizontalCompass';
import { GlassPanel } from './components/GlassPanel';
import { TerminalText } from './components/TerminalText';
import { ArsenalOverlay } from './arsenal/ArsenalOverlay';
import { CartOverlay } from './cart/CartOverlay';
import { SimulatorOverlay } from './simulator/SimulatorOverlay';

// ─── CSS glitch overlay ──────────────────────────────────────────────────────

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

// ─── Mute toggle ─────────────────────────────────────────────────────────────

function MuteToggle() {
  const muted = useAudioStore(s => s.muted);
  const toggle = useAudioStore(s => s.toggleMute);
  return (
    <button
      onClick={toggle}
      title={muted ? 'Unmute audio' : 'Mute audio'}
      style={{
        position: 'fixed',
        top: 12,
        right: 16,
        zIndex: 25,
        appearance: 'none',
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(57,255,20,0.3)',
        color: muted ? 'rgba(220,38,38,0.85)' : 'rgba(57,255,20,0.85)',
        fontFamily: 'var(--font-display)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.2em',
        padding: '8px 12px',
        cursor: 'pointer',
        pointerEvents: 'auto',
        textShadow: muted ? '0 0 8px rgba(220,38,38,0.5)' : '0 0 8px rgba(57,255,20,0.5)',
      }}
    >
      {muted ? '🔇 MUTED' : '◉ AUDIO'}
    </button>
  );
}

// ─── Information overlay ─────────────────────────────────────────────────────

function InformationOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 100,
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'auto',
      }}
    >
      <GlassPanel style={{ width: 'min(640px, 86vw)', padding: '32px 40px' }}>
        <TerminalText style={{ fontSize: 22, display: 'block' }}>
          // INFORMATION SUBSYSTEM // RESERVED
        </TerminalText>
      </GlassPanel>
    </div>
  );
}

// ─── Root HUD layer ──────────────────────────────────────────────────────────

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
    <div style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
      <GlitchOverlay />
      <MuteToggle />
      {isHudState(appState) && <HorizontalCompass />}

      {appState === 'hud.arsenal'     && <ArsenalOverlay />}
      {appState === 'hud.cart'        && <CartOverlay />}
      {appState === 'hud.simulator'   && <SimulatorOverlay />}
      {appState === 'hud.information' && <InformationOverlay />}
    </div>
  );
}
