import { useEffect, useRef, useState } from 'react';
import { useSimulatorStore } from '../../state/simulatorStore';
import { GlassPanel } from '../components/GlassPanel';
import { TerminalText } from '../components/TerminalText';
import { DataReadout } from '../components/DataReadout';
import { MiniChart } from '../components/MiniChart';

const fmtNum = new Intl.NumberFormat('en-US');
const fmtUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/**
 * Animated count-up: lerps a displayed value toward a target each RAF tick.
 * Returns the rounded current value as React state — re-renders only when the
 * integer part changes (cheap).
 */
function useAnimatedNumber(target: number, speed = 0.18) {
  const [displayed, setDisplayed] = useState(target);
  const valueRef = useRef(target);
  const lastDisplayedRef = useRef(target);

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      const diff = target - valueRef.current;
      valueRef.current += diff * speed;
      if (Math.abs(diff) < 0.5) valueRef.current = target;
      const rounded = Math.round(valueRef.current);
      if (rounded !== lastDisplayedRef.current) {
        lastDisplayedRef.current = rounded;
        setDisplayed(rounded);
      }
      if (valueRef.current !== target) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, speed]);

  return displayed;
}

export function LiveAnalytics() {
  const analytics = useSimulatorStore((s) => s.analytics);
  const reset = useSimulatorStore((s) => s.reset);

  const casualties = useAnimatedNumber(analytics.casualties);
  const cost = useAnimatedNumber(analytics.totalCostUsd, 0.12);

  // History buffer for the casualties chart — appended each time analytics changes.
  const [history, setHistory] = useState<{ x: number; y: number }[]>([{ x: 0, y: 0 }]);
  useEffect(() => {
    setHistory((h) => {
      const next = [...h, { x: h.length, y: analytics.casualties }];
      // Keep last 32 samples.
      return next.length > 32 ? next.slice(next.length - 32) : next;
    });
  }, [analytics.casualties, analytics.shots]);

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
        <TerminalText style={{ fontSize: 18, color: 'var(--color-bbb-crimson)' }}>
          // BATTLE-DAMAGE ASSESSMENT
        </TerminalText>
      </div>

      <div>
        <DataReadout label="SHOTS"       value={fmtNum.format(analytics.shots)} />
        <DataReadout label="CASUALTIES"  value={fmtNum.format(casualties)} emphasis />
        <DataReadout label="MAX RADIUS"  value={analytics.maxRadiusKm.toFixed(2)} unit="km" />
        <DataReadout label="TOTAL COST"  value={fmtUsd.format(cost)} emphasis />
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
