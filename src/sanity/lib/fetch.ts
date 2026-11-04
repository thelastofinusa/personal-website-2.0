import { readClient } from "./client";
import { NO_STEGA, sanityFetch } from "./live";

type FetchOptions = {
  query: any;
  params?: Record<string, any>;
  /** Time in seconds to revalidate cache in development (defaults to 3600s / 1 hour) */
  revalidate?: number | false;
  /** Optional Next.js cache tags */
  tags?: string[];
};

export async function sanityQuery<T>({
  query,
  params,
  revalidate = 3600,
  tags,
}: FetchOptions): Promise<T> {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    // Development: Use client.fetch and cache the data using Next.js fetch options
    return await readClient.fetch<T>(query, params ?? {}, {
      next: {
        revalidate,
        tags,
      },
    });
  }

  // Production: Use sanityFetch
  const { data } = await sanityFetch({
    query,
    params,
    ...NO_STEGA,
  });

  return data as T;
}
