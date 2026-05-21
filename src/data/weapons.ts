import type { Weapon } from './types';

/**
 * Helper to build a smooth performance curve.
 * Peaks at `peakX` km and tails off.
 */
function buildCurve(peakX: number, peakY: number, samples = 8, maxX = peakX * 3) {
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < samples; i++) {
    const x = (i / (samples - 1)) * maxX;
    // Lorentzian-ish peak
    const y = peakY / (1 + ((x - peakX) / (peakX * 0.6)) ** 2);
    out.push({ x: Math.round(x * 10) / 10, y: Math.round(y) });
  }
  return out;
}

function buildAccuracyCurve(centreKm: number, peak: number, samples = 8) {
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < samples; i++) {
    const x = (i / (samples - 1)) * (centreKm * 2);
    // Inverse-bell, lower accuracy at extreme altitudes.
    const y = peak * (1 - Math.abs(x - centreKm) / (centreKm * 1.4));
    out.push({ x: Math.round(x * 10) / 10, y: Math.max(8, Math.round(y)) });
  }
  return out;
}

export const WEAPONS: Weapon[] = [
  // ── HAND GRENADES ──────────────────────────────────────────────────────────
  {
    id: 'g-m67',
    name: 'M67 FRAGMENTATION',
    category: 'grenade',
    statistics: { yieldKt: 0.000018, rangeKm: 0.04, accuracy: 72, massKg: 0.4, costUsd: 45 },
    capabilities: ['Steel-fragment burst', '5-second fuze', 'AP/AT casing'],
    description: 'Standard-issue fragmentation hand grenade. Reliable, low-cost casualty munition.',
    performanceCurve: buildCurve(0.012, 95, 8, 0.05),
    accuracyCurve: buildAccuracyCurve(0.01, 85, 8),
  },
  {
    id: 'g-an14',
    name: 'AN-M14 INCENDIARY',
    category: 'grenade',
    statistics: { yieldKt: 0.0001, rangeKm: 0.03, accuracy: 64, massKg: 0.9, costUsd: 88 },
    capabilities: ['Thermite-TH3 mix', '2200°C burn', 'Material denial'],
    description: 'Thermite charge for equipment destruction and area denial. Burns through steel plate.',
    performanceCurve: buildCurve(0.008, 88, 8, 0.04),
    accuracyCurve: buildAccuracyCurve(0.008, 78, 8),
  },
  {
    id: 'g-m84',
    name: 'M84 STUN',
    category: 'grenade',
    statistics: { yieldKt: 0.0, rangeKm: 0.02, accuracy: 88, massKg: 0.27, costUsd: 35 },
    capabilities: ['170-180 dB blast', '6-8 million candela', 'Non-lethal'],
    description: 'Flash-bang for breach-and-clear. Sensory overload, no shrapnel.',
    performanceCurve: buildCurve(0.005, 98, 8, 0.025),
    accuracyCurve: buildAccuracyCurve(0.005, 92, 8),
  },
  {
    id: 'g-plasma',
    name: 'BBB-PLASMA VORTEX',
    category: 'grenade',
    statistics: { yieldKt: 0.0008, rangeKm: 0.06, accuracy: 58, massKg: 1.1, costUsd: 14_500 },
    capabilities: ['Ionised plasma core', 'EMP secondary', 'Experimental'],
    description: 'Magnetically-confined plasma micro-burst. EMP knocks unshielded electronics within 30 m.',
    performanceCurve: buildCurve(0.015, 92, 8, 0.07),
    accuracyCurve: buildAccuracyCurve(0.012, 70, 8),
  },

  // ── ORBITAL LASERS ─────────────────────────────────────────────────────────
  {
    id: 'l-zeus',
    name: 'ZEUS-X CUTTING BEAM',
    category: 'orbital-laser',
    statistics: { yieldKt: 0.5, rangeKm: 36_000, accuracy: 96, massKg: 12_400, costUsd: 4_200_000 },
    capabilities: ['8 MW continuous', 'Adaptive optics', 'Sub-metre CEP'],
    description: 'Geo-stationary cutting laser. Designed for hardened bunker penetration and surgical infrastructure denial.',
    performanceCurve: buildCurve(40, 98, 8, 200),
    accuracyCurve: buildAccuracyCurve(80, 95, 8),
  },
  {
    id: 'l-helios',
    name: 'HELIOS BURN ARRAY',
    category: 'orbital-laser',
    statistics: { yieldKt: 1.8, rangeKm: 36_000, accuracy: 88, massKg: 38_000, costUsd: 11_800_000 },
    capabilities: ['28 MW phased array', 'Area saturation', 'Multi-target'],
    description: 'Six-element phased laser array. Carpets a 1.2 km area in raw thermal energy.',
    performanceCurve: buildCurve(60, 94, 8, 240),
    accuracyCurve: buildAccuracyCurve(100, 86, 8),
  },
  {
    id: 'l-prometheus',
    name: 'PROMETHEUS CORONAL',
    category: 'orbital-laser',
    statistics: { yieldKt: 6.4, rangeKm: 42_000, accuracy: 82, massKg: 96_000, costUsd: 64_000_000 },
    capabilities: ['Tunable X-ray channel', 'City-scale impact', 'Black-budget'],
    description: 'Coronal-class platform. Single discharge equivalent to a small tactical nuke. Strategic deterrent.',
    performanceCurve: buildCurve(80, 96, 8, 320),
    accuracyCurve: buildAccuracyCurve(120, 80, 8),
  },

  // ── NUCLEAR DEVICES ────────────────────────────────────────────────────────
  {
    id: 'n-b83',
    name: 'B83-MOD7 STRATEGIC',
    category: 'nuke',
    statistics: { yieldKt: 1_200, rangeKm: 0, accuracy: 78, massKg: 1_090, costUsd: 28_000_000 },
    capabilities: ['Variable yield', 'Hardened-target fuze', 'Air or ground burst'],
    description: 'Mod-7 strategic gravity bomb. Dial-a-yield from 100 kt to 1.2 Mt.',
    performanceCurve: buildCurve(15, 100, 8, 90),
    accuracyCurve: buildAccuracyCurve(8, 82, 8),
  },
  {
    id: 'n-w88',
    name: 'W88 MULTI-STAGE',
    category: 'nuke',
    statistics: { yieldKt: 475, rangeKm: 11_300, accuracy: 92, massKg: 360, costUsd: 19_000_000 },
    capabilities: ['MIRV-capable', 'Re-entry shielded', 'Hard-target kill'],
    description: 'Thermonuclear warhead optimised for SLBM payload. Multiple-warhead delivery.',
    performanceCurve: buildCurve(10, 98, 8, 60),
    accuracyCurve: buildAccuracyCurve(12, 90, 8),
  },
  {
    id: 'n-titan',
    name: 'TITAN-X HYPERCORE',
    category: 'nuke',
    statistics: { yieldKt: 50_000, rangeKm: 0, accuracy: 72, massKg: 27_000, costUsd: 380_000_000 },
    capabilities: ['Tri-stage F-F-F', 'Civilisation-grade', 'BBB exclusive'],
    description: 'Three-stage fusion device. 50 Mt yield. Reserved for strategic deterrence and corporate negotiation leverage.',
    performanceCurve: buildCurve(30, 100, 8, 180),
    accuracyCurve: buildAccuracyCurve(20, 75, 8),
  },
  {
    id: 'n-shiva',
    name: 'SHIVA-IX MEGATON',
    category: 'nuke',
    statistics: { yieldKt: 9_000, rangeKm: 14_800, accuracy: 86, massKg: 4_800, costUsd: 96_000_000 },
    capabilities: ['Salted U-238 jacket', 'Cobalt option', 'Fallout-rated'],
    description: 'High-fallout thermonuclear with optional cobalt salting. Region-denial class.',
    performanceCurve: buildCurve(20, 99, 8, 120),
    accuracyCurve: buildAccuracyCurve(15, 84, 8),
  },

  // ── DRONE STRIKES ──────────────────────────────────────────────────────────
  {
    id: 'd-hellfire',
    name: 'HELLFIRE-K SWARM',
    category: 'drone-strike',
    statistics: { yieldKt: 0.012, rangeKm: 1_200, accuracy: 91, massKg: 4_800, costUsd: 6_400_000 },
    capabilities: ['64-unit swarm', 'Mesh-net comms', 'Autonomous targeting'],
    description: 'Sixty-four micro-UAVs operating as a self-coordinating mesh. Saturation strikes against soft targets.',
    performanceCurve: buildCurve(80, 94, 8, 400),
    accuracyCurve: buildAccuracyCurve(60, 90, 8),
  },
  {
    id: 'd-reaper',
    name: 'REAPER WOLFPACK',
    category: 'drone-strike',
    statistics: { yieldKt: 0.08, rangeKm: 3_200, accuracy: 95, massKg: 21_600, costUsd: 38_000_000 },
    capabilities: ['8 × MQ-9B', 'Long-loiter', 'Network-controlled'],
    description: 'Eight long-endurance UCAVs flown as a single coordinated strike package. Persistent overwatch.',
    performanceCurve: buildCurve(160, 96, 8, 800),
    accuracyCurve: buildAccuracyCurve(180, 93, 8),
  },
  {
    id: 'd-cobalt',
    name: 'COBALT TALON',
    category: 'drone-strike',
    statistics: { yieldKt: 0.32, rangeKm: 6_800, accuracy: 88, massKg: 84_000, costUsd: 142_000_000 },
    capabilities: ['Stealth airframe', 'Penetrator payload', 'EW suite'],
    description: 'Heavy stealth strike drone. Designed to penetrate A2/AD bubbles and deliver bunker-buster ordnance.',
    performanceCurve: buildCurve(400, 92, 8, 2000),
    accuracyCurve: buildAccuracyCurve(220, 88, 8),
  },

  // ── MISSILES ───────────────────────────────────────────────────────────────
  {
    id: 'm-hellfire',
    name: 'AGM-114 HELLFIRE',
    category: 'missile',
    statistics: { yieldKt: 0.004, rangeKm: 11, accuracy: 96, massKg: 49, costUsd: 150_000 },
    capabilities: ['Laser/Millimetre-wave', 'Tandem warhead', 'Multi-role'],
    description: 'Workhorse air-to-ground missile. Tandem-shaped charge defeats reactive armour.',
    performanceCurve: buildCurve(5, 98, 8, 30),
    accuracyCurve: buildAccuracyCurve(3, 94, 8),
  },
  {
    id: 'm-trident',
    name: 'TRIDENT-D7 BALLISTIC',
    category: 'missile',
    statistics: { yieldKt: 100, rangeKm: 12_000, accuracy: 89, massKg: 59_000, costUsd: 36_000_000 },
    capabilities: ['SLBM platform', 'MIRV bus', 'Hardened guidance'],
    description: 'Submarine-launched intercontinental ballistic missile. 8 independently-targetable warheads.',
    performanceCurve: buildCurve(8_000, 96, 8, 20_000),
    accuracyCurve: buildAccuracyCurve(120, 88, 8),
  },
  {
    id: 'm-kinzhal',
    name: 'KINZHAL-K9 HYPERSONIC',
    category: 'missile',
    statistics: { yieldKt: 480, rangeKm: 2_000, accuracy: 81, massKg: 4_300, costUsd: 18_000_000 },
    capabilities: ['Mach 10+', 'Terminal manoeuvring', 'Anti-ABM'],
    description: 'Air-launched hypersonic glide vehicle. Defeats current-generation interceptor systems.',
    performanceCurve: buildCurve(1_200, 94, 8, 4_000),
    accuracyCurve: buildAccuracyCurve(60, 82, 8),
  },
  {
    id: 'm-minuteman',
    name: 'SS-MINUTEMAN-XI',
    category: 'missile',
    statistics: { yieldKt: 335, rangeKm: 13_000, accuracy: 87, massKg: 36_000, costUsd: 28_500_000 },
    capabilities: ['Silo-launched ICBM', 'Three-warhead bus', 'Hardened C2'],
    description: 'Eleventh-generation intercontinental ballistic missile. Silo or transporter-erector launch.',
    performanceCurve: buildCurve(9_000, 95, 8, 22_000),
    accuracyCurve: buildAccuracyCurve(150, 86, 8),
  },
];

export const WEAPONS_BY_CATEGORY: Record<string, Weapon[]> = WEAPONS.reduce(
  (acc, w) => {
    (acc[w.category] ??= []).push(w);
    return acc;
  },
  {} as Record<string, Weapon[]>,
);

export const WEAPON_MAP = new Map(WEAPONS.map(w => [w.id, w]));
