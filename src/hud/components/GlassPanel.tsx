import type { CSSProperties, ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

/**
 * Reusable holographic glass container. Combines backdrop blur, faint white
 * fill, a subtle scanline gradient, and a dim border.
 * Used by all HUD state overlays (Arsenal, Cart, etc.).
 */
export function GlassPanel({ children, style, className }: GlassPanelProps) {
  return (
    <div
      className={className}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 0 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,255,255,0.02)',
        backgroundImage:
          'repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 4px)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
