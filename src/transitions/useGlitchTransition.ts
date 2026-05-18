import { useCallback, useRef } from 'react';
import { useAppStore, type AppState } from '../state/appStore';
import { TRANSITION } from '../lib/constants';

/**
 * Orchestrates the full glitch transition sequence:
 *
 *   idle → glitching-out → (state swap at peak) → glitching-in → idle
 *
 * Guards against re-entrant calls — a transition in flight blocks new ones.
 * The CSS glitch overlay in HUDLayer reacts to `transitionPhase`.
 * The CameraRig reacts to `appStore.state` changing.
 */
export function useGlitchTransition() {
  const isActive = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const trigger = useCallback((target: AppState) => {
    if (isActive.current) return;
    isActive.current = true;

    const { setState, setTransitionPhase } = useAppStore.getState();

    setTransitionPhase('glitching-out');

    const t1 = setTimeout(() => {
      setState(target);
      setTransitionPhase('glitching-in');

      const t2 = setTimeout(() => {
        setTransitionPhase('idle');
        isActive.current = false;
      }, TRANSITION.GLITCH_IN_MS);

      timers.current.push(t2);
    }, TRANSITION.GLITCH_OUT_MS);

    timers.current.push(t1);
  }, []);

  return trigger;
}
