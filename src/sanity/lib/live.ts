// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import { defineLive } from "next-sanity/live";
import { assertValue } from "@/lib/utils";
import { readClient } from "./client";

const readToken = assertValue(
  process.env.SANITY_API_READ_TOKEN,
  "Missing environment variable: SANITY_API_READ_TOKEN",
);

export const { sanityFetch, SanityLive } = defineLive({
  client: readClient,
  serverToken: readToken,
  browserToken: readToken,
});

/**
 * Spread into every `sanityFetch` call: `sanityFetch({ query, ...NO_STEGA })`.
 *
 * Since next-sanity 13.3, `sanityFetch` brands every string in `data` as
 * `StegaString` unless it is called with the literal `stega: false`. Branded
 * strings are not assignable to TypeGen's literal unions (`category`, `type`…),
 * which is what produced the DailyApp / Timeline type errors.
 *
 * This site has no Visual Editing (no `stega.studioUrl`, no draft mode), so
 * strings are never encoded at runtime and the clean types are the truth.
 * `as const` keeps the literal `false` (a plain `boolean` re-brands the data).
 *
 * If you add Visual Editing later, drop this and use `stegaClean()` on the
 * enum fields instead.
 */
export const NO_STEGA = { stega: false } as const;
