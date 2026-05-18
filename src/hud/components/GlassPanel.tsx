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
        background: 'rgba(0,0,0,0.32)',
        backdropFilter: 'blur(4px) saturate(115%)',
        WebkitBackdropFilter: 'blur(4px) saturate(115%)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 0 60px rgba(0,0,0,0.55)',
        backgroundImage:
          'repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 4px)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
