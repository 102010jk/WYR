import type { CSSProperties, ReactNode } from 'react';

interface RedAlertButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: CSSProperties;
}

/**
 * Crimson "danger" CTA. Reserved for TEST / EXECUTE PURCHASE / etc.
 */
export function RedAlertButton({
  children,
  onClick,
  disabled = false,
  fullWidth = false,
  style,
}: RedAlertButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        appearance: 'none',
        background: disabled
          ? 'rgba(220,38,38,0.18)'
          : 'rgba(220,38,38,0.16)',
        border: `1px solid ${disabled ? 'rgba(220,38,38,0.3)' : 'rgba(220,38,38,0.7)'}`,
        color: disabled ? 'rgba(220,38,38,0.5)' : '#ff6b6b',
        textShadow: 'var(--bbb-glow-crimson-default)',
        fontFamily: 'var(--font-display)',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.32em',
        padding: '14px 28px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        pointerEvents: 'auto',
        width: fullWidth ? '100%' : undefined,
        boxShadow: disabled
          ? 'none'
          : '0 0 24px rgba(220,38,38,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
        transition: 'background 0.15s, box-shadow 0.15s',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = 'rgba(220,38,38,0.28)';
        e.currentTarget.style.boxShadow = '0 0 36px rgba(220,38,38,0.4), inset 0 1px 0 rgba(255,255,255,0.12)';
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = 'rgba(220,38,38,0.16)';
        e.currentTarget.style.boxShadow = '0 0 24px rgba(220,38,38,0.22), inset 0 1px 0 rgba(255,255,255,0.08)';
      }}
    >
      {children}
    </button>
  );
}
