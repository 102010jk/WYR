import { create } from 'zustand';
import type { WeaponCategoryId } from '../data/types';

interface ArsenalStore {
  expandedCategory: WeaponCategoryId | null;
  selectedWeaponId: string | null;
  toggleCategory: (id: WeaponCategoryId) => void;
  selectWeapon: (weaponId: string) => void;
  closeWeapon: () => void;
}

export const useArsenalStore = create<ArsenalStore>((set) => ({
  expandedCategory: 'nuke',
  selectedWeaponId: null,
  toggleCategory: (id) =>
    set((s) => ({
      expandedCategory: s.expandedCategory === id ? null : id,
      // Closing/switching category clears the selected weapon.
      selectedWeaponId: s.expandedCategory === id ? s.selectedWeaponId : null,
    })),
  selectWeapon: (weaponId) => set({ selectedWeaponId: weaponId }),
  closeWeapon: () => set({ selectedWeaponId: null }),
}));
