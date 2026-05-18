import { useEffect, useRef, useState } from 'react';
import { useSimulatorStore } from '../../state/simulatorStore';
import { countUp, EASE } from '../../animations/anime';
import { GlassPanel } from '../components/GlassPanel';
import { TerminalText } from '../components/TerminalText';
import { MiniChart } from '../components/MiniChart';

const fmtNum = new Intl.NumberFormat('en-US');
const fmtUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/**
 * Drives `target.textContent` with anime.js whenever `value` changes.
 * Smoother than the previous lerp-on-RAF hook and avoids per-frame React renders.
 */
function useAnimeCountUp(
  value: number,
  ref: React.RefObject<HTMLElement>,
  format: (n: number) => string,
) {
  const prevRef = useRef(value);
  useEffect(() => {
    if (!ref.current) return;
    const from = prevRef.current;
    const to = value;
    prevRef.current = to;
    if (from === to) {
      ref.current.textContent = format(to);
      return;
    }
    const anim = countUp(ref.current, from, to, {
      duration: 720,
      format,
      easing: EASE.outCubic,
    });
    return () => anim.pause();
  }, [value, format, ref]);
}

// Animated number readout — a single row, slightly richer than DataReadout
// because it has to expose a ref to its <span>.
function AnimatedReadout({
  label,
  value,
  format,
  emphasis = false,
  unit,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
  emphasis?: boolean;
  unit?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useAnimeCountUp(value, ref, format);
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 12,
        padding: '6px 0',
        borderBottom: '1px solid rgba(57,255,20,0.08)',
        fontFamily: 'var(--font-terminal)',
        fontSize: 'var(--bbb-text-md)',
      }}
    >
      <span style={{ color: 'rgba(57,255,20,0.5)', letterSpacing: '0.08em' }}>{label}</span>
      <span
        style={{
          color: emphasis ? 'var(--color-bbb-crimson)' : 'var(--color-bbb-green)',
          textShadow: emphasis
            ? 'var(--bbb-glow-crimson-default)'
            : 'var(--bbb-glow-green-default)',
          letterSpacing: '0.04em',
        }}
      >
        <span ref={ref}>{format(0)}</span>
        {unit && <span style={{ marginLeft: 4, opacity: 0.6, fontSize: 14 }}>{unit}</span>}
      </span>
    </div>
  );
}

export function LiveAnalytics() {
  const analytics = useSimulatorStore((s) => s.analytics);
  const reset = useSimulatorStore((s) => s.reset);

  // History buffer for the casualties chart — appended each time shots changes.
  const [history, setHistory] = useState<{ x: number; y: number }[]>([{ x: 0, y: 0 }]);
  const lastShotsRef = useRef(0);
  useEffect(() => {
    if (analytics.shots !== lastShotsRef.current) {
      lastShotsRef.current = analytics.shots;
      setHistory((h) => {
        const next = [...h, { x: h.length, y: analytics.casualties }];
        return next.length > 32 ? next.slice(next.length - 32) : next;
      });
    }
  }, [analytics.shots, analytics.casualties]);

  return (
    <GlassPanel
      style={{
        width: 300,
        padding: '18px 18px',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ paddingBottom: 10, borderBottom: '1px solid rgba(220,38,38,0.25)' }}>
        <TerminalText style={{ fontSize: 'var(--bbb-text-lg)', color: 'var(--color-bbb-crimson)' }}>
          // BATTLE-DAMAGE ASSESSMENT
        </TerminalText>
      </div>

      <div>
        <AnimatedReadout label="SHOTS"      value={analytics.shots}        format={fmtNum.format} />
        <AnimatedReadout label="CASUALTIES" value={analytics.casualties}   format={fmtNum.format} emphasis />
        <AnimatedReadout
          label="MAX RADIUS"
          value={analytics.maxRadiusKm}
          format={(n) => n.toFixed(2)}
          unit="km"
        />
        <AnimatedReadout label="TOTAL COST" value={analytics.totalCostUsd} format={fmtUsd.format} emphasis />
      </div>

      <MiniChart
        data={history}
        title="CUMULATIVE CASUALTIES"
        width={264}
        height={120}
        color="#ff5252"
      />

      <button
        onClick={reset}
        style={{
          appearance: 'none',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.18)',
          color: 'rgba(255,255,255,0.7)',
          fontFamily: 'var(--font-display)',
          fontSize: 11,
          letterSpacing: '0.28em',
          padding: '10px 14px',
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
      >
        RESET SIMULATION
      </button>
    </GlassPanel>
  );
}
