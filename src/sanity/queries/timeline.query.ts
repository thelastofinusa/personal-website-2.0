import { defineQuery } from "next-sanity";
import type { TimelineListQueryResult } from "~/sanity.types";
import { sanityQuery } from "../lib/fetch";
import { NO_STEGA, sanityFetch } from "../lib/live";

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
 } | order(timelineStart desc, timelineEnd desc)[0...4]
`);

const query = {
  all: timelineListQuery,
  latest: latestTimelinesQuery,
};

export async function fetchTimeline(): Promise<TimelineListQueryResult> {
  return sanityQuery<TimelineListQueryResult>({ query: query.all });
}

export async function fetchLatestTimelines(): Promise<TimelineListQueryResult> {
  return sanityQuery<TimelineListQueryResult>({ query: query.latest });
}
