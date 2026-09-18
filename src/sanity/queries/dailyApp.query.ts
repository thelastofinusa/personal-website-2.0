import { defineQuery } from "next-sanity";
import { revalidateOption } from "@/lib/utils";
import type { DailyAppListQueryResult } from "~/sanity.types";
import { readClient } from "../lib/client";

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

export async function fetchDailyApp(): Promise<DailyAppListQueryResult> {
  const result = await readClient.fetch(
    dailyAppListQuery,
    {},
    revalidateOption,
  );

  return result;
}
