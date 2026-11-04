import { defineQuery } from "next-sanity";
import type { SnapshotQueryResult } from "~/sanity.types";
import { sanityQuery } from "../lib/fetch";

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
  return sanityQuery<SnapshotQueryResult>({ query: snapshotQuery });
}
