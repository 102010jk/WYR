import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

/**
 * Holographic projection panel. Dark green-tinted fill, green border with
 * brighter top edge, corner bracket markers, green scanlines. Looks like a
 * terminal display floating in space rather than frosted glass.
 */
export function GlassPanel({ children, style, className, ...rest }: GlassPanelProps) {
  return (
    <div
      className={`bbb-glass-panel ${className ?? ''}`}
      {...rest}
      style={{
        background: 'rgba(0, 14, 2, 0.22)',
        backdropFilter: 'blur(3px) saturate(110%)',
        WebkitBackdropFilter: 'blur(3px) saturate(110%)',
        border: '1px solid rgba(57, 255, 20, 0.18)',
        borderTop: '1px solid rgba(57, 255, 20, 0.42)',
        boxShadow:
          '0 0 50px rgba(0,0,0,0.65),' +
          '0 0 30px rgba(57,255,20,0.04) inset,' +
          '0 0 1px rgba(57,255,20,0.25)',
        backgroundImage:
          'repeating-linear-gradient(0deg, rgba(57,255,20,0.016) 0px, rgba(57,255,20,0.016) 1px, transparent 1px, transparent 4px)',
        ...style,
      }}
    >
      <span className="bbb-glass-corner bbb-glass-corner--tl" />
      <span className="bbb-glass-corner bbb-glass-corner--tr" />
      <span className="bbb-glass-corner bbb-glass-corner--bl" />
      <span className="bbb-glass-corner bbb-glass-corner--br" />
      {children}
    </div>
  );
}
