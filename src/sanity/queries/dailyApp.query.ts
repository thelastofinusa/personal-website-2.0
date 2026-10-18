import { defineQuery } from "next-sanity";
import type { DailyAppListQueryResult } from "~/sanity.types";
import { NO_STEGA, sanityFetch } from "../lib/live";

const dailyAppListQuery = defineQuery(`
  *[_type == "dailyApp"] | order(_createdAt desc) {
    _id,
    name,
    description,
    category,

    "logo": select(
      logo.type == "url" => {
        "type": "url",
        "value": logo.url
      },
      logo.type == "upload" => {
        "type": "upload",
        "value": logo.image.asset->url
      },
      logo.type == "icon" => {
        "type": "icon",
        "value": logo.icon
      }
    ),

    url,

    "button": {
      "label": button.label,
      "backgroundColor": button.backgroundColor.hex,
      "textColor": button.textColor.hex
    }
  }
`);

const query = {
  all: dailyAppListQuery,
};

export async function fetchDailyApp(): Promise<DailyAppListQueryResult> {
  const { data } = await sanityFetch({ query: query.all, ...NO_STEGA });
  return data;
}
