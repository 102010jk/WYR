import { useEffect, useRef, useState } from 'react';
import { anime, EASE, typewriter } from '../animations/anime';
import { sfx } from '../audio/sfx';
import { useAudioStore } from '../state/audioStore';

const BOOT_KEY = 'bbb-boot-played';
const LOGO_LETTERS = ['B', 'B', 'B'];
const LINES = [
  'AUTH: SYSTEM 0xA47 :: STANDBY',
  'BIOMETRIC SCAN: ACCEPTED',
  'WELCOME, OPERATOR',
];

interface BootSequenceProps {
  onComplete: () => void;
}

/**
 * Played once per session. Establishes BBB brand identity before dropping
 * the visitor onto the landing scene. Skippable on any click/keypress.
 *
 * Timeline (anime.js):
 *   1. scanlines bloom in            (260 ms)
 *   2. BBB logo letters stagger in   (420 ms, 40 ms stagger)
 *   3. terminal lines type out       (≈ 1.8 s total)
 *   4. fade out                      (520 ms) → triggers onComplete
 */
export function BootSequence({ onComplete }: BootSequenceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scanlinesRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  const skipHintRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const [skipped, setSkipped] = useState(false);

  // Skip handler — also used on completion.
  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    sessionStorage.setItem(BOOT_KEY, '1');
    if (rootRef.current) {
      anime({
        targets: rootRef.current,
        opacity: [1, 0],
        duration: 520,
        easing: EASE.outExpo,
        complete: () => onComplete(),
      });
    } else {
      onComplete();
    }
  };

  useEffect(() => {
    // Build the full sequence.
    const muted = useAudioStore.getState().muted;

    const tl = anime.timeline({
      easing: EASE.outExpo,
      complete: () => {
        // Idle a moment then fade out.
        setTimeout(finish, 480);
      },
    });

    // 1. Scanlines bloom
    tl.add({
      targets: scanlinesRef.current,
      opacity: [0, 1],
      duration: 260,
    });

    // 2. Logo letters stagger
    if (logoRef.current) {
      const letterEls = logoRef.current.querySelectorAll('span');
      tl.add(
        {
          targets: letterEls,
          opacity: [0, 1],
          translateY: [18, 0],
          duration: 420,
          delay: anime.stagger(60),
          easing: EASE.outBack,
        },
        '-=80',
      );
    }

    // Boot SFX after logo lands.
    tl.add({
      duration: 80,
      complete: () => {
        if (!muted) sfx.play('lockOn');
      },
    });

    // 3. Terminal typewriter lines (each on its own line, sequential)
    const playLine = (
      ref: React.RefObject<HTMLSpanElement>,
      text: string,
      dur: number,
    ) => {
      tl.add({
        duration: 60,
        complete: () => {
          if (!ref.current) return;
          ref.current.style.opacity = '1';
          typewriter(ref.current, text, {
            duration: dur,
            onChar: (ch) => {
              if (!muted && ch !== ' ' && Math.random() < 0.32) sfx.play('hoverBeep');
            },
          });
        },
      });
      tl.add({ duration: dur + 220 });
    };

    playLine(line1Ref, LINES[0], 620);
    playLine(line2Ref, LINES[1], 520);
    playLine(line3Ref, LINES[2], 560);

    // Skip hint fades in after a beat.
    tl.add(
      {
        targets: skipHintRef.current,
        opacity: [0, 0.7],
        duration: 400,
      },
      0,
    );

    return () => {
      anime.remove(scanlinesRef.current);
      anime.remove(logoRef.current);
      anime.remove(line1Ref.current);
      anime.remove(line2Ref.current);
      anime.remove(line3Ref.current);
      anime.remove(skipHintRef.current);
      anime.remove(rootRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Skip on any interaction.
  useEffect(() => {
    const onSkip = () => {
      if (skipped) return;
      setSkipped(true);
      finish();
    };
    window.addEventListener('click', onSkip);
    window.addEventListener('keydown', onSkip);
    return () => {
      window.removeEventListener('click', onSkip);
      window.removeEventListener('keydown', onSkip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipped]);

  return (
    <div ref={rootRef} className="bbb-boot-root">
      <div ref={scanlinesRef} className="bbb-boot-scanlines" />

      <div ref={logoRef} className="bbb-boot-logo">
        {LOGO_LETTERS.map((ch, i) => (
          <span key={i}>{ch}</span>
        ))}
      </div>

      <div className="bbb-boot-terminal">
        <span ref={line1Ref} className="line">{' '}</span>
        <br />
        <span ref={line2Ref} className="line">{' '}</span>
        <br />
        <span ref={line3Ref} className="line">{' '}</span>
      </div>

      <div ref={skipHintRef} className="bbb-boot-skip-hint">
        PRESS ANY KEY TO SKIP
      </div>
    </div>
  );
}

/** Persists across reloads in the same tab session. */
export function shouldPlayBoot(): boolean {
  try {
    return sessionStorage.getItem(BOOT_KEY) !== '1';
  } catch {
    return true;
  }
}
