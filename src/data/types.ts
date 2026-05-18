export type WeaponCategoryId =
  | 'grenade'
  | 'orbital-laser'
  | 'nuke'
  | 'drone-strike'
  | 'missile';

export type DeploymentMode = 'DROP' | 'DELIVER';

export interface WeaponStatistics {
  /** Effective yield (kt TNT-equivalent). */
  yieldKt: number;
  /** Operational range (km). */
  rangeKm: number;
  /** CEP-derived accuracy, 0-100. */
  accuracy: number;
  /** Unit mass (kg). */
  massKg: number;
  /** Unit cost in USD. */
  costUsd: number;
}

export interface Weapon {
  id: string;
  name: string;
  category: WeaponCategoryId;
  statistics: WeaponStatistics;
  capabilities: string[];
  description: string;
  /** Effectiveness vs distance curve. x = km, y = 0–100. */
  performanceCurve: { x: number; y: number }[];
  /** Accuracy vs altitude curve. x = km, y = 0–100. */
  accuracyCurve: { x: number; y: number }[];
}

export interface WeaponCategory {
  id: WeaponCategoryId;
  label: string;
  shortLabel: string;
  description: string;
  allowedModes: ReadonlyArray<DeploymentMode>;
}
