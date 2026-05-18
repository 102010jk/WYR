import type { CSSProperties } from 'react';

interface DataReadoutProps {
  label: string;
  value: string;
  unit?: string;
  emphasis?: boolean;
  style?: CSSProperties;
}

/**
 * A key:value terminal-style readout row. Used for weapon stats and analytics.
 */
export function DataReadout({ label, value, unit, emphasis = false, style }: DataReadoutProps) {
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
        fontSize: 18,
        ...style,
      }}
    >
      <span style={{ color: 'rgba(57,255,20,0.5)', letterSpacing: '0.08em' }}>
        {label}
      </span>
      <span
        style={{
          color: emphasis ? 'var(--color-bbb-crimson)' : 'var(--color-bbb-green)',
          textShadow: emphasis
            ? 'var(--bbb-glow-crimson-default)'
            : 'var(--bbb-glow-green-default)',
          letterSpacing: '0.04em',
        }}
      >
        {value}
        {unit && <span style={{ marginLeft: 4, opacity: 0.6, fontSize: 14 }}>{unit}</span>}
      </span>
    </div>
  );
}
