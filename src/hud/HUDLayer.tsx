import { useEffect } from 'react';
import { useAppStore, isHudState } from '../state/appStore';
import { useNavigationStore } from '../state/navigationStore';
import { useAudioStore } from '../state/audioStore';
import { useGlitchTransition } from '../transitions/useGlitchTransition';
import { useStaggerIn } from '../animations/useStaggerIn';
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
  const color = muted ? 'rgba(220,38,38,0.9)' : 'rgba(57,255,20,0.85)';
  return (
    <button
      onClick={toggle}
      title={muted ? 'Unmute audio' : 'Mute audio'}
      aria-label={muted ? 'Unmute audio' : 'Mute audio'}
      style={{
        position: 'fixed',
        top: 14,
        right: 16,
        zIndex: 25,
        appearance: 'none',
        background: 'rgba(0,0,0,0.45)',
        border: `1px solid ${muted ? 'rgba(220,38,38,0.45)' : 'rgba(57,255,20,0.3)'}`,
        color,
        padding: 8,
        width: 36,
        height: 36,
        cursor: 'pointer',
        pointerEvents: 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: muted
          ? 'drop-shadow(var(--bbb-glow-crimson-subtle))'
          : 'drop-shadow(var(--bbb-glow-green-subtle))',
        transition: 'border-color 0.15s, color 0.15s',
      }}
    >
      <SpeakerIcon muted={muted} color={color} />
    </button>
  );
}

function SpeakerIcon({ muted, color }: { muted: boolean; color: string }) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H3v6h3l5 4V5z" fill={color} fillOpacity={0.16} />
      {muted ? (
        <>
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </>
      ) : (
        <>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </>
      )}
    </svg>
  );
}

// ─── Information overlay ─────────────────────────────────────────────────────

function InformationOverlay() {
  const ref = useStaggerIn<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: 100,
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'auto',
      }}
    >
      <GlassPanel data-bbb-stagger style={{ width: 'min(640px, 86vw)', padding: '32px 40px' }}>
        <TerminalText style={{ fontSize: 'var(--bbb-text-xl)', display: 'block' }}>
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
      {/* Mute toggle: landing has no audio source yet, so the control is meaningless there. */}
      {isHudState(appState) && <MuteToggle />}
      {isHudState(appState) && <HorizontalCompass />}

      {appState === 'hud.arsenal'     && <ArsenalOverlay />}
      {appState === 'hud.cart'        && <CartOverlay />}
      {appState === 'hud.simulator'   && <SimulatorOverlay />}
      {appState === 'hud.information' && <InformationOverlay />}
    </div>
  );
}
