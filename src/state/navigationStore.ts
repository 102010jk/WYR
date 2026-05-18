import { create } from 'zustand';
import type { AppState } from './appStore';

/**
 * Navigation intent store.
 *
 * M2 role: record hover + selection from the 3D landing buttons.
 * M3 role: `pendingSelect` will be consumed by `useGlitchTransition` to
 * trigger the camera move + glitch sequence.
 */
interface NavigationStore {
  hoveredOption: AppState | null;
  pendingSelect: AppState | null;
  setHovered: (o: AppState | null) => void;
  select: (o: AppState) => void;
  clearSelect: () => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  hoveredOption: null,
  pendingSelect: null,
  setHovered: (o) => set({ hoveredOption: o }),
  select: (o) => set({ pendingSelect: o }),
  clearSelect: () => set({ pendingSelect: null }),
}));
