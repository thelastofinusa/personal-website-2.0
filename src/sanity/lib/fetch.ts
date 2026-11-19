import { readClient } from "./client";

type FetchOptions = {
  query: any;
  params?: Record<string, any>;
  /** Safety-net refresh in seconds. The webhook handles real updates. */
  revalidate?: number | false;
};

export async function sanityQuery<T>({
  query,
  params,
  revalidate = 86400,
}: FetchOptions): Promise<T> {
  return readClient.fetch<T>(query, params ?? {}, {
    next: { revalidate, tags: ["sanity"] },
  });
}
