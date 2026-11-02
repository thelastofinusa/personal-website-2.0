import "server-only";

/**
 * Dependency-free, key-free rate limiting for the contact form.
 *
 * Sliding-window counters kept in memory. No Redis, no env vars.
 *
 * Honest limitation: on Vercel this memory belongs to one running function
 * instance. Instances are reused while warm (and Fluid compute shares one
 * instance across many requests), so this stops casual spam and double
 * clicks, but it is not a hard guarantee: a cold start resets the counts and
 * separate instances don't see each other. For a hard limit in production,
 * add a Vercel Firewall rate-limit rule (dashboard only, no keys). See the
 * notes that came with this file.
 */

// Resend's free plan allows 100 emails/day. Each submission sends two
// (one to you, one confirmation to the visitor), so 40 submissions = 80 emails.
const GLOBAL_DAILY_CAP =
  Number.parseInt(process.env.CONTACT_GLOBAL_DAILY_CAP ?? "", 10) || 40;

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

type Rule = { key: string; max: number; windowMs: number };

// Survives hot reloads in dev, so counts don't reset on every file save.
const globalRef = globalThis as unknown as {
  __contactRateLimit?: Map<string, number[]>;
};
// biome-ignore lint/suspicious/noAssignInExpressions: ignore
const store = (globalRef.__contactRateLimit ??= new Map<string, number[]>());

/** Drops IPs we haven't seen for a day so the Map can't grow forever. */
function sweep(now: number) {
  if (store.size < 2_000) return;

  for (const [key, hits] of store) {
    const newest = hits[hits.length - 1];
    if (newest === undefined || now - newest >= DAY) store.delete(key);
  }
}

export type RateLimitCheck =
  | { allowed: true }
  | { allowed: false; retryAfter: number };

export async function checkContactRateLimit(
  ip: string,
): Promise<RateLimitCheck> {
  const now = Date.now();
  sweep(now);

  const rules: Rule[] = [
    { key: `burst:${ip}`, max: 3, windowMs: 10 * MINUTE }, // 3 per 10 min per visitor
    { key: `daily:${ip}`, max: 8, windowMs: DAY }, // 8 per day per visitor
    { key: "global", max: GLOBAL_DAILY_CAP, windowMs: DAY }, // protects Resend quota
  ];

  // Check every rule first, so a blocked request doesn't use up the others
  const windows = rules.map((rule) => ({
    rule,
    hits: (store.get(rule.key) ?? []).filter((t) => now - t < rule.windowMs),
  }));

  const blocked = windows.filter(({ rule, hits }) => hits.length >= rule.max);

  if (blocked.length > 0) {
    // Persist the pruned lists, then report the longest wait
    for (const { rule, hits } of windows) store.set(rule.key, hits);

    const resetAt = Math.max(
      ...blocked.map(({ rule, hits }) => hits[0] + rule.windowMs),
    );

    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((resetAt - now) / 1000)),
    };
  }

  // JS is single-threaded, so check-then-record can't interleave
  for (const { rule, hits } of windows) {
    hits.push(now);
    store.set(rule.key, hits);
  }

  return { allowed: true };
}
