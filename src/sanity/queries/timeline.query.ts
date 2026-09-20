import { defineQuery } from "next-sanity";
import { revalidateOption } from "@/lib/utils";
import type { TimelineListQueryResult } from "~/sanity.types";
import { readClient } from "../lib/client";

const timelineList = `
_id,
category,
organization,

"logo": select(
  logo.type == "url" => { "type": "url", "value": logo.url },
  logo.type == "upload" => { "type": "upload", "value": logo.image.asset->url },
  logo.type == "icon" => { "type": "icon", "value": logo.icon }
),

website,
isCurrent,
featured,

items[] {
  _key,
  title,
  period {
    start,
    end
  },
  "images": images[]{
    "url": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height,
    "alt": coalesce(asset->altText, "")
  },
  type,
  icon,
  description,
  skills,
  isExpanded
},

"timelineStart": items[0].period.start,
"timelineEnd": items[0].period.end
`;

const timelineListQuery = defineQuery(`
 *[_type == "timeline"] {
  ${timelineList}
 } | order(timelineStart desc, timelineEnd desc)
`);

const latestTimelinesQuery = defineQuery(`
 *[_type == "timeline" && featured == true] {
  ${timelineList}
 } | order(timelineStart desc, timelineEnd desc)[0...3]
`);

const query = {
  all: timelineListQuery,
  latest: latestTimelinesQuery,
};

export async function fetchTimeline(): Promise<TimelineListQueryResult> {
  const result = await readClient.fetch(query.all, {}, revalidateOption);
  return result;
}

export async function fetchLatestTimelines(): Promise<TimelineListQueryResult> {
  const result = await readClient.fetch(query.latest, {}, revalidateOption);
  return result;
}
