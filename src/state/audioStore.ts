import { create } from 'zustand';
import { sfx } from '../audio/sfx';

interface AudioStore {
  muted: boolean;
  toggleMute: () => void;
}

export const useAudioStore = create<AudioStore>((set) => ({
  muted: false,
  toggleMute: () =>
    set((s) => {
      const next = !s.muted;
      sfx.setMuted(next);
      return { muted: next };
    }),
}));
