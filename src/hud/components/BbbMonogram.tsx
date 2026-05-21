interface BbbMonogramProps {
  size?: number;
  color?: string;
  /** Add a soft glow filter — for hero / boot. */
  emphasis?: boolean;
}

/**
 * Stacked-B monogram for the BBB corporate mark. Used in both the boot
 * sequence hero logo and the in-app compass-left brand. SVG so it renders
 * crisply at any size; `currentColor` so callers can drive colour via CSS.
 */
export function BbbMonogram({ size = 28, color = 'currentColor', emphasis = false }: BbbMonogramProps) {
  // Three stacked rounded "B" forms, slightly offset on the X axis to feel architectural.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinejoin="round"
      style={{
        filter: emphasis ? 'drop-shadow(var(--bbb-glow-emphasis))' : undefined,
      }}
    >
      {/* Three horizontal bars */}
      <path d="M14 12 L40 12 Q48 12 48 18 Q48 24 40 24 L14 24 Z" />
      <path d="M14 26 L42 26 Q50 26 50 32 Q50 38 42 38 L14 38 Z" />
      <path d="M14 40 L38 40 Q46 40 46 46 Q46 52 38 52 L14 52 Z" />
      {/* Spine */}
      <line x1="14" y1="12" x2="14" y2="52" />
    </svg>
  );
}
