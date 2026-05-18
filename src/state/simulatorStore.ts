import { create } from 'zustand';
import type { Weapon } from '../data/types';
import { WEAPON_MAP } from '../data/weapons';

export interface Impact {
  id: string;
  weaponId: string;
  lat: number;
  lon: number;
  /** Performance.now() in seconds at spawn. */
  t0: number;
  duration: number;
}

export interface Analytics {
  casualties: number;
  maxRadiusKm: number;
  totalCostUsd: number;
  shots: number;
}

interface SimulatorStore {
  activeWeaponId: string | null;
  impacts: Impact[];
  analytics: Analytics;

  setActiveWeapon: (weaponId: string | null) => void;
  fireImpact: (lat: number, lon: number) => Impact | null;
  removeImpact: (id: string) => void;
  reset: () => void;
}

let impactCounter = 0;

/**
 * Plausible (but intentionally rough) damage maths.
 * - radius scales with cube-root of yield for blast weapons; linear for
 *   beam/projectile weapons.
 * - casualties = area × population density × accuracy × randomised lethality.
 * - cost = building damage + casualty cost.
 */
export function computeImpactStats(weapon: Weapon): { radiusKm: number; casualties: number; costUsd: number } {
  const y = Math.max(0.00001, weapon.statistics.yieldKt);
  const a = weapon.statistics.accuracy / 100;

  let radius = 0;
  let density = 0;

  switch (weapon.category) {
    case 'grenade':
      radius = 0.04 + y * 220;
      density = 90;
      break;
    case 'orbital-laser':
      radius = 0.3 + Math.pow(y, 0.4) * 1.0;
      density = 1400;
      break;
    case 'nuke':
      radius = 1.6 * Math.pow(y, 0.33);
      density = 2800;
      break;
    case 'drone-strike':
      radius = 0.45 + Math.pow(y, 0.5) * 1.6;
      density = 520;
      break;
    case 'missile':
      radius = 1.1 * Math.pow(y, 0.36) + 0.4;
      density = 1500;
      break;
  }

  const area = Math.PI * radius * radius;
  const lethality = 0.7 + Math.random() * 0.55;
  const casualties = Math.floor(area * density * a * lethality);
  const costUsd = Math.floor(area * 1_400_000 + casualties * 850_000);

  return { radiusKm: radius, casualties, costUsd };
}

function impactDuration(weapon: Weapon): number {
  switch (weapon.category) {
    case 'nuke':         return 4.2;
    case 'missile':      return 2.4;
    case 'orbital-laser':return 1.2;
    case 'drone-strike': return 1.1;
    case 'grenade':      return 0.7;
  }
}

export const useSimulatorStore = create<SimulatorStore>((set, get) => ({
  activeWeaponId: null,
  impacts: [],
  analytics: { casualties: 0, maxRadiusKm: 0, totalCostUsd: 0, shots: 0 },

  setActiveWeapon: (weaponId) => set({ activeWeaponId: weaponId }),

  fireImpact: (lat, lon) => {
    const weaponId = get().activeWeaponId;
    if (!weaponId) return null;
    const weapon = WEAPON_MAP.get(weaponId);
    if (!weapon) return null;

    const stats = computeImpactStats(weapon);
    const impact: Impact = {
      id: `imp-${++impactCounter}`,
      weaponId,
      lat,
      lon,
      t0: performance.now() / 1000,
      duration: impactDuration(weapon),
    };

    set((s) => ({
      impacts: [...s.impacts, impact],
      analytics: {
        casualties:   s.analytics.casualties   + stats.casualties,
        maxRadiusKm:  Math.max(s.analytics.maxRadiusKm, stats.radiusKm),
        totalCostUsd: s.analytics.totalCostUsd + stats.costUsd,
        shots:        s.analytics.shots        + 1,
      },
    }));

    return impact;
  },

  removeImpact: (id) =>
    set((s) => ({ impacts: s.impacts.filter((i) => i.id !== id) })),

  reset: () =>
    set({
      activeWeaponId: null,
      impacts: [],
      analytics: { casualties: 0, maxRadiusKm: 0, totalCostUsd: 0, shots: 0 },
    }),
}));
