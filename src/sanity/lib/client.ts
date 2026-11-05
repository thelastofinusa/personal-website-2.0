import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

export const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});

/**
 * Sanity client configured with the write token for server mutations.
 *
 * Only ever used in server actions (never exposed to the browser) because
 * SANITY_API_WRITE_TOKEN is a secret, non-NEXT_PUBLIC variable.
 */
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
  token: process.env.SANITY_API_WRITE_TOKEN,
});
