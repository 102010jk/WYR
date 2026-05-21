import type { WeaponCategory } from './types';

/**
 * Deployment-mode constraints per category:
 *   - Grenades cannot be DROPPED (too small, no terminal guidance).
 *   - Orbital lasers cannot be DELIVERED (fixed orbital platform).
 *   - Drone strikes cannot be DELIVERED (active flight system).
 *   - Nukes & missiles support both modes.
 */
export const WEAPON_CATEGORIES: WeaponCategory[] = [
  {
    id: 'grenade',
    label: 'HAND GRENADES',
    shortLabel: 'GRENADES',
    description: 'Sub-kt fragmentation, incendiary, and specialty hand-thrown munitions.',
    allowedModes: ['DELIVER'],
  },
  {
    id: 'orbital-laser',
    label: 'ORBITAL LASERS',
    shortLabel: 'LASERS',
    description: 'Geo-stationary directed-energy platforms. Line-of-sight delivery.',
    allowedModes: ['DROP'],
  },
  {
    id: 'nuke',
    label: 'NUCLEAR DEVICES',
    shortLabel: 'NUKES',
    description: 'Fission and multi-stage thermonuclear yields. Strategic class.',
    allowedModes: ['DROP', 'DELIVER'],
  },
  {
    id: 'drone-strike',
    label: 'DRONE STRIKES',
    shortLabel: 'DRONES',
    description: 'Autonomous swarms and precision UAV strike packages.',
    allowedModes: ['DROP'],
  },
  {
    id: 'missile',
    label: 'MISSILES',
    shortLabel: 'MISSILES',
    description: 'Ballistic, cruise, and hypersonic guided ordnance.',
    allowedModes: ['DROP', 'DELIVER'],
  },
];

export const CATEGORY_MAP = new Map(WEAPON_CATEGORIES.map(c => [c.id, c]));
