import anime from 'animejs';

/**
 * BBB anime.js motion vocabulary.
 *
 * All HUD-level / DOM animations route through these helpers so the easing
 * curves and durations stay coherent across the app. 3D-layer animations
 * (particle morph, camera) continue to use GSAP — different sweet spots.
 */

export { anime };

/** Standard easings used throughout. anime.js accepts cubic-bezier strings. */
export const EASE = {
  outExpo: 'cubicBezier(0.16, 1, 0.3, 1)',
  outCubic: 'cubicBezier(0.33, 1, 0.68, 1)',
  inOutQuart: 'cubicBezier(0.76, 0, 0.24, 1)',
  outBack: 'cubicBezier(0.34, 1.4, 0.64, 1)',
} as const;

export const DUR = {
  fast: 220,
  base: 380,
  slow: 620,
} as const;

// ─── Entrance stagger ───────────────────────────────────────────────────────

interface StaggerInOpts {
  /** ms between consecutive elements */
  delay?: number;
  /** total per-element duration */
  duration?: number;
  /** initial translateY in px (will animate to 0) */
  fromY?: number;
}

/**
 * Fade + slide-up stagger across a NodeList / element array. Used by all HUD
 * overlay entrances. Returns the anime instance (callable .pause/.restart).
 */
export function staggerIn(
  targets: HTMLElement[] | NodeListOf<Element> | string,
  opts: StaggerInOpts = {},
) {
  const { delay = 55, duration = DUR.base, fromY = 12 } = opts;
  return anime({
    targets,
    opacity: [0, 1],
    translateY: [fromY, 0],
    easing: EASE.outExpo,
    duration,
    delay: anime.stagger(delay),
  });
}

// ─── Typewriter ─────────────────────────────────────────────────────────────

interface TypewriterOpts {
  /** Total ms to type the whole string. */
  duration?: number;
  /** Per-character SFX callback (optional). */
  onChar?: (ch: string, index: number) => void;
  /** Called once the full string is written. */
  onComplete?: () => void;
}

/**
 * Types `text` into `target.innerText` character by character. Implemented as
 * a tiny anime.js-driven proxy on `{ i: 0 }` so behaviour matches the rest
 * of the motion system (easings, killable, chainable).
 */
export function typewriter(
  target: HTMLElement,
  text: string,
  opts: TypewriterOpts = {},
) {
  const { duration = 600, onChar, onComplete } = opts;
  const proxy = { i: 0 };
  let lastEmitted = -1;
  return anime({
    targets: proxy,
    i: text.length,
    duration,
    easing: 'linear',
    update: () => {
      const n = Math.floor(proxy.i);
      if (n === lastEmitted) return;
      // Each newly-revealed character can trigger a callback (typing SFX).
      for (let k = lastEmitted + 1; k <= n; k++) {
        if (onChar && k < text.length) onChar(text[k], k);
      }
      lastEmitted = n;
      target.innerText = text.slice(0, n);
    },
    complete: () => {
      target.innerText = text;
      onComplete?.();
    },
  });
}

// ─── Count-up ───────────────────────────────────────────────────────────────

interface CountUpOpts {
  /** ms */
  duration?: number;
  /** Format the number for display. */
  format?: (n: number) => string;
  /** Cubic-bezier or named easing string. */
  easing?: string;
}

/**
 * Animates the textContent of `target` from `from` → `to` with anime.js easing.
 * Honours `format` for currency / casualty / radius rendering. Returns the
 * anime instance so callers can `.pause()` or chain.
 */
export function countUp(
  target: HTMLElement,
  from: number,
  to: number,
  opts: CountUpOpts = {},
) {
  const { duration = 620, format = (n) => String(Math.round(n)), easing = EASE.outCubic } = opts;
  const proxy = { v: from };
  return anime({
    targets: proxy,
    v: to,
    duration,
    easing,
    update: () => {
      target.textContent = format(proxy.v);
    },
    complete: () => {
      target.textContent = format(to);
    },
  });
}

// ─── Pulse glow ─────────────────────────────────────────────────────────────

/** Quick attention pulse on an element. Re-runs each time you call it. */
export function pulseGlow(target: HTMLElement) {
  return anime({
    targets: target,
    boxShadow: [
      '0 0 14px rgba(220,38,38,0.5)',
      '0 0 48px rgba(220,38,38,0.95)',
      '0 0 14px rgba(220,38,38,0.5)',
    ],
    duration: 600,
    easing: 'easeInOutSine',
  });
}
