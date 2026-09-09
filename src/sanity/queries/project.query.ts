import { defineQuery } from "next-sanity";
import { revalidateOption } from "@/lib/utils";
import type { ProjectsListQueryResult } from "~/sanity.types";
import { readClient } from "../lib/client";

const projectsList = `
_id,
name,
url,

"mainImage": {
  "image": mainImage.asset->url,
  "width": mainImage.asset->metadata.dimensions.width,
  "height": mainImage.asset->metadata.dimensions.height
},

date,
description,
tags,

"filters": filters[]->value.current
`;

const projectsListQuery = defineQuery(`
*[_type == "project"] | order(date desc) {
  ${projectsList}
}`);

const featuredProjectsQuery = defineQuery(`
  *[_type == "project" && featured == true]
  | order(_createdAt desc)[0...4] {
    ${projectsList}
  }
`);

const query = {
  all: projectsListQuery,
  featured: featuredProjectsQuery,
};

export async function fetchAllProjects(): Promise<ProjectsListQueryResult> {
  const result = await readClient.fetch(query.all, {}, revalidateOption);
  return result;
}

export async function fetchFeaturedProjects(): Promise<ProjectsListQueryResult> {
  const result = await readClient.fetch(query.featured, {}, revalidateOption);

  return result;
}
