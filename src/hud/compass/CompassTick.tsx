import { COMPASS_OPTION_WIDTH } from './useScrollCompass';

export interface NavOption {
  label: string;
  /** AppState target or 'landing' for Disconnect. */
  target: string;
}

interface CompassTickProps {
  option: NavOption;
  isActive: boolean;
  onClick: () => void;
}

/**
 * One item in the horizontal compass strip.
 * Active = bright + brackets; inactive = dimmed.
 */
export function CompassTick({ option, isActive, onClick }: CompassTickProps) {
  return (
    <div
      onClick={onClick}
      style={{
        width: COMPASS_OPTION_WIDTH,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        cursor: 'crosshair',
        pointerEvents: 'auto',
        fontFamily: 'var(--font-terminal)',
        fontSize: isActive ? 20 : 17,
        letterSpacing: '0.12em',
        color: isActive ? 'var(--color-bbb-green)' : 'rgba(57,255,20,0.38)',
        textShadow: isActive
          ? '0 0 10px rgba(57,255,20,0.85), 0 0 3px rgba(57,255,20,0.4)'
          : 'none',
        transition: 'color 0.15s, text-shadow 0.15s, font-size 0.1s',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {isActive ? `[ ${option.label} ]` : option.label}
    </div>
  );
}
