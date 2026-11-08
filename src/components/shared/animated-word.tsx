"use client";

import {
  motion,
  useAnimationControls,
  useInView,
  useReducedMotion,
  type Variants,
} from "motion/react";
import React from "react";

/** Where a letter rests once it has landed. All offsets are in em. */
type Pose = { x?: number; y: number; rotate: number };
type PoseFn = (index: number, total: number) => Pose;

const flat: PoseFn = () => ({ y: 0, rotate: 0 });

/** -1 (first letter) .. 0 (middle) .. 1 (last letter) */
const spread = (index: number, total: number) =>
  total <= 1 ? 0 : (index / (total - 1)) * 2 - 1;

/**
 * Lays letters out along a smile: the ends sit higher, the middle sits lower,
 * each letter tilts to follow the curve, and the ends fan out a little like
 * cheeks pulling apart.
 */
export const smilePose: PoseFn = (index, total) => {
  const t = spread(index, total);
  return { x: t * 0.05, y: 0.16 * (1 - t * t), rotate: -t * 14 };
};

/** How much further the grin pushes the resting smile. */
const GRIN_GAIN = 1.8;

type AnimatedWordProps = {
  word: string;
  /** Which side the letters fall in from. */
  from?: "above" | "below";
  /** Resting position of each letter. Defaults to a straight line. */
  pose?: PoseFn;
  /**
   * What plays on repeat.
   *   hop:  a wave of jumps runs left to right.
   *   grin: the resting curve deepens from the middle outward, holds, then
   *         relaxes, like a smile spreading across a face.
   *   press: letters squash down one after another like keys being pressed,
   *         then spring back.
   */
  idle?: "hop" | "grin" | "press";
  /**
   * Bump this number to play a one-off burst (letters pop up and spin).
   * Meant for a click: `setBurst((n) => n + 1)`. Ignored until the entrance
   * has finished.
   */
  burst?: number;
  /** How high a letter jumps during the hop, in em. */
  hop?: number;
  /** Extra wobble (degrees) added to each letter during the hop. */
  hopRotate?: number;
  /** Seconds to wait before the entrance starts. */
  delay?: number;
  /** Seconds between idle animations. Hovering triggers one right away. */
  interval?: number;
  className?: string;
};

/**
 * One word, animated letter by letter.
 *
 *   1. Entrance: letters spring in one after another.
 *   2. Idle: every few seconds the `idle` animation plays.
 *   3. Hover (or touch): the same animation plays on demand.
 *
 * Only transforms and opacity are animated, so the word never changes size.
 * That matters when it sits inside <Highlighter>, which draws its marks from
 * the element's layout box.
 */
export const AnimatedWord = ({
  word,
  from = "below",
  pose = flat,
  idle = "hop",
  burst,
  hop = 0.2,
  hopRotate = 0,
  delay = 0.9,
  interval = 6,
  className,
}: AnimatedWordProps) => {
  const reduceMotion = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const controls = useAnimationControls();
  const busy = React.useRef(false);
  const [ready, setReady] = React.useState(false);

  const letters = Array.from(word);
  const total = letters.length;
  const side = from === "below" ? 1 : -1;

  const parentVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.055, delayChildren: delay } },
    // The grin sets its own per-letter delay (outward from the middle).
    idle: {
      transition: {
        staggerChildren: idle === "hop" ? 0.06 : idle === "press" ? 0.07 : 0,
      },
    },
    burst: { transition: { staggerChildren: 0.03 } },
  };

  const letterVariants: Variants = {
    hidden: {
      opacity: 0,
      y: `${0.7 * side}em`,
      rotate: -12 * side,
      scale: 0.6,
    },
    show: (index: number) => {
      const rest = pose(index, total);
      return {
        opacity: 1,
        x: `${rest.x ?? 0}em`,
        y: `${rest.y}em`,
        rotate: rest.rotate,
        scale: 1,
        transition: { type: "spring", stiffness: 420, damping: 14, mass: 0.7 },
      };
    },
    idle: (index: number) => {
      const rest = pose(index, total);

      if (idle === "grin") {
        // Middle letters move first, the "cheeks" follow.
        const fromMiddle = Math.abs(index - (total - 1) / 2);
        const x = rest.x ?? 0;

        return {
          x: [`${x}em`, `${x * GRIN_GAIN}em`, `${x * GRIN_GAIN}em`, `${x}em`],
          y: [
            `${rest.y}em`,
            `${rest.y * GRIN_GAIN}em`,
            `${rest.y * GRIN_GAIN}em`,
            `${rest.y}em`,
          ],
          rotate: [
            rest.rotate,
            rest.rotate * GRIN_GAIN,
            rest.rotate * GRIN_GAIN,
            rest.rotate,
          ],
          scale: [1, 1.12, 1.12, 1],
          transition: {
            duration: 1.2,
            times: [0, 0.3, 0.7, 1],
            ease: "easeInOut",
            delay: fromMiddle * 0.08,
          },
        };
      }

      if (idle === "press") {
        // Squash toward the baseline, overshoot back up, settle.
        return {
          y: [
            `${rest.y}em`,
            `${rest.y + 0.07}em`,
            `${rest.y - 0.05}em`,
            `${rest.y}em`,
          ],
          scaleX: [1, 1.1, 0.97, 1],
          scaleY: [1, 0.72, 1.08, 1],
          transition: {
            duration: 0.5,
            times: [0, 0.3, 0.65, 1],
            ease: "easeInOut",
          },
        };
      }

      return {
        y: [`${rest.y}em`, `${rest.y - hop}em`, `${rest.y}em`],
        rotate: [rest.rotate, rest.rotate + hopRotate, rest.rotate],
        scale: [1, 1.12, 1],
        transition: { duration: 0.55, ease: "easeInOut" },
      };
    },
    burst: (index: number) => {
      const rest = pose(index, total);
      const dir = index % 2 === 0 ? -1 : 1;

      return {
        y: [`${rest.y}em`, `${rest.y - 0.4}em`, `${rest.y}em`],
        rotate: [rest.rotate, rest.rotate + dir * 14, rest.rotate],
        scale: [1, 1.4, 1],
        transition: {
          duration: 0.7,
          times: [0, 0.35, 1],
          ease: ["easeOut", "easeIn"],
        },
      };
    },
  };

  // Entrance
  React.useEffect(() => {
    if (reduceMotion) return;

    let cancelled = false;
    controls.start("show").then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [controls, reduceMotion]);

  const play = React.useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    await controls.start("idle");
    busy.current = false;
  }, [controls]);

  // One-off burst, e.g. on click. Interrupts whatever is playing.
  const lastBurst = React.useRef(burst);
  React.useEffect(() => {
    if (burst === undefined || burst === lastBurst.current) return;
    lastBurst.current = burst;
    if (!ready || reduceMotion) return;

    busy.current = true;
    controls.start("burst").then(() => {
      busy.current = false;
    });
  }, [burst, ready, reduceMotion, controls]);

  // Idle loop. Pauses while the word is off screen.
  React.useEffect(() => {
    if (!ready || !inView || reduceMotion) return;

    const id = window.setInterval(play, interval * 1000);
    return () => window.clearInterval(id);
  }, [ready, inView, reduceMotion, interval, play]);

  if (reduceMotion) return <span className={className}>{word}</span>;

  return (
    <span
      ref={ref}
      className={className}
      onPointerEnter={() => ready && play()}
    >
      {/* Letters are split into spans, so give screen readers the real word. */}
      <span className="sr-only">{word}</span>
      <motion.span
        aria-hidden="true"
        className="inline-block"
        variants={parentVariants}
        initial="hidden"
        animate={controls}
      >
        {letters.map((letter, index) => (
          <motion.span
            // biome-ignore lint/suspicious/noArrayIndexKey: letters never reorder
            key={`${letter}-${index}`}
            custom={index}
            variants={letterVariants}
            // Press squashes toward the baseline, so scale from the bottom.
            style={idle === "press" ? { originY: 1 } : undefined}
            className="inline-block"
          >
            {letter}
          </motion.span>
        ))}
      </motion.span>
    </span>
  );
};
