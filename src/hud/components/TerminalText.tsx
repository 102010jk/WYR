import type { CSSProperties, ReactNode } from 'react';

interface TerminalTextProps {
  children: ReactNode;
  dim?: boolean;
  style?: CSSProperties;
}

/** VT323 monospaced text with optional CRT flicker. */
export function TerminalText({ children, dim = false, style }: TerminalTextProps) {
  return (
    <span
      className={dim ? '' : 'bbb-flicker'}
      style={{
        fontFamily: 'var(--font-terminal)',
        color: dim ? 'rgba(57,255,20,0.45)' : 'var(--color-bbb-green)',
        textShadow: dim ? 'none' : '0 0 6px rgba(57,255,20,0.5)',
        letterSpacing: '0.05em',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
