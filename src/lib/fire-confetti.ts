import type confetti from "canvas-confetti";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Fires one confetti burst that adapts to the screen.
 *
 * - Starts from the center of `origin` (e.g. the "click." button), so the
 *   burst comes from where the person pressed.
 * - Particle count follows the viewport area: a phone gets ~100, a laptop
 *   several hundred, so a small screen isn't buried and a big one isn't bare.
 * - Particle size and launch speed follow the viewport width, so the burst
 *   covers a similar share of the screen on every device.
 * - Does nothing for people who prefer reduced motion.
 *
 * canvas-confetti is imported on demand to keep it out of the main bundle.
 */
export async function fireConfetti(origin?: HTMLElement | null) {
  const { default: confettiFn }: { default: typeof confetti } = await import(
    "canvas-confetti"
  );

  const width = window.innerWidth;
  const height = window.innerHeight;
  const rect = origin?.getBoundingClientRect();

  confettiFn({
    zIndex: 9999,
    disableForReducedMotion: true,
    origin: rect
      ? {
          x: (rect.left + rect.width / 2) / width,
          y: (rect.top + rect.height / 2) / height,
        }
      : { x: 0.5, y: 0.5 },
    particleCount: Math.round(clamp((width * height) / 3000, 80, 450)),
    spread: 360,
    startVelocity: clamp(width / 28, 22, 55),
    scalar: clamp(width / 1100, 0.6, 1.2),
    decay: 0.92,
    ticks: 220,
    gravity: 1,
  });
}
