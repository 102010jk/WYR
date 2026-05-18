import { create } from 'zustand';
import type { DeploymentMode } from '../data/types';
import { CATEGORY_MAP } from '../data/categories';
import { WEAPON_MAP } from '../data/weapons';

export interface CartItem {
  /** Stable per-row id (cart-uuid, not weapon id — same weapon can appear twice). */
  rowId: string;
  weaponId: string;
  mode: DeploymentMode | null;
  /** DROP: lat/lon; DELIVER: address string. Null until set. */
  target: { lat: number; lon: number } | string | null;
}

interface CartStore {
  items: CartItem[];
  /** rowId currently picking a DROP target (renders fullscreen Earth). */
  targetPickingRowId: string | null;
  /** Whether the INSUFFICIENT FUNDS modal is open. */
  showInsufficientFunds: boolean;

  addItem: (weaponId: string) => void;
  removeItem: (rowId: string) => void;
  setMode: (rowId: string, mode: DeploymentMode) => void;
  setTarget: (rowId: string, target: CartItem['target']) => void;
  beginTargetPick: (rowId: string) => void;
  cancelTargetPick: () => void;
  executePurchase: () => void;
  dismissModal: () => void;
}

let rowCounter = 0;
const nextRowId = () => `row-${++rowCounter}`;

/**
 * Resolves the default mode for a weapon when added to cart — picks the first
 * allowed mode for that weapon's category (so users don't see a "pick a mode"
 * empty state on add).
 */
function defaultMode(weaponId: string): DeploymentMode | null {
  const w = WEAPON_MAP.get(weaponId);
  if (!w) return null;
  const cat = CATEGORY_MAP.get(w.category);
  return cat?.allowedModes[0] ?? null;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  targetPickingRowId: null,
  showInsufficientFunds: false,

  addItem: (weaponId) =>
    set((s) => ({
      items: [
        ...s.items,
        {
          rowId: nextRowId(),
          weaponId,
          mode: defaultMode(weaponId),
          target: null,
        },
      ],
    })),

  removeItem: (rowId) =>
    set((s) => ({ items: s.items.filter((i) => i.rowId !== rowId) })),

  setMode: (rowId, mode) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.rowId === rowId
          ? { ...i, mode, target: null } // clear target when switching modes
          : i,
      ),
    })),

  setTarget: (rowId, target) =>
    set((s) => ({
      items: s.items.map((i) => (i.rowId === rowId ? { ...i, target } : i)),
    })),

  beginTargetPick: (rowId) => set({ targetPickingRowId: rowId }),
  cancelTargetPick: () => set({ targetPickingRowId: null }),

  executePurchase: () => set({ showInsufficientFunds: true }),
  dismissModal: () => set({ showInsufficientFunds: false }),
}));

/**
 * True if `mode` is valid for the weapon's category.
 */
export function isModeAllowed(weaponId: string, mode: DeploymentMode): boolean {
  const w = WEAPON_MAP.get(weaponId);
  if (!w) return false;
  const cat = CATEGORY_MAP.get(w.category);
  return cat?.allowedModes.includes(mode) ?? false;
}
