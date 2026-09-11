import { defineQuery } from "next-sanity";
import { revalidateOption } from "@/lib/utils";
import type { TimelineListQueryResult } from "~/sanity.types";
import { readClient } from "../lib/client";

// Removed the `$category` variable requirement so we pull ALL timelines into a single list
const timelineListQuery = defineQuery(`
  *[
    _type == "timeline"
  ] | order(_createdAt asc) {
    _id,
    category,
    organization,

    "logo": select(
      logo.type == "url" => logo.url,
      logo.type == "upload" => logo.image.asset->url
    ),

    website,
    isCurrent,
    
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
    }
  }
`);

export async function fetchTimeline(): Promise<TimelineListQueryResult> {
  const result = await readClient.fetch(
    timelineListQuery,
    {},
    revalidateOption,
  );

  return result;
}
