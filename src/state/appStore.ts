import { create } from 'zustand';

/**
 * Top-level state machine.
 *
 * STATE 0 .................... 'landing'
 * STATE 1.A (Arsenal) ........ 'hud.arsenal'
 * STATE 1.B (Cart) ........... 'hud.cart'
 * STATE 1.C (Simulator) ...... 'hud.simulator'
 * STATE 1.D (Information) .... 'hud.information'
 *
 * Glitch transitions are gated through `transitionPhase`:
 *   idle → glitching-out → (state swap @ peak) → glitching-in → idle
 *
 * Milestone 1 wires the store + read paths; the transition driver lands in Milestone 3.
 */

export type AppState =
  | 'landing'
  | 'hud.arsenal'
  | 'hud.cart'
  | 'hud.simulator'
  | 'hud.information';

export type TransitionPhase = 'idle' | 'glitching-out' | 'glitching-in';

export const HUD_STATES: ReadonlyArray<AppState> = [
  'hud.arsenal',
  'hud.information',
  'hud.cart',
  'hud.simulator',
];

export const isHudState = (s: AppState): boolean => s.startsWith('hud.');

interface AppStore {
  state: AppState;
  transitionPhase: TransitionPhase;

  setState: (next: AppState) => void;
  setTransitionPhase: (phase: TransitionPhase) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  state: 'landing',
  transitionPhase: 'idle',

  setState: (next) => set({ state: next }),
  setTransitionPhase: (phase) => set({ transitionPhase: phase }),
}));
