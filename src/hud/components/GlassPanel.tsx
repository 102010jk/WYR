import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

/**
 * Reusable holographic glass container. Combines backdrop blur, faint dark
 * fill, a subtle scanline gradient, and a dim border. Forwards any extra
 * props (data-attrs, ref handlers, etc.) to the inner div.
 */
export function GlassPanel({ children, style, className, ...rest }: GlassPanelProps) {
  return (
    <div
      className={className}
      {...rest}
      style={{
        background: 'rgba(0,0,0,0.32)',
        backdropFilter: 'blur(4px) saturate(115%)',
        WebkitBackdropFilter: 'blur(4px) saturate(115%)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: 'var(--bbb-shadow-panel)',
        backgroundImage:
          'repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 4px)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
