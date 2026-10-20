import { defineQuery } from "next-sanity";
import type { SnapshotQueryResult } from "~/sanity.types";
import { NO_STEGA, sanityFetch } from "../lib/live";

const snapshotQuery = defineQuery(`
  *[_type == "snapshot" && _id == "aboutPageSnapshots"][0] {
    _id,
    "images": images[] {
      "url": asset->url,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    }
  }
`);

export async function fetchSnapshots(): Promise<SnapshotQueryResult> {
  const { data } = await sanityFetch({
    query: snapshotQuery,
    ...NO_STEGA,
  });

  return data;
}
