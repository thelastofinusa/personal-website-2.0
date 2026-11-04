import { defineQuery } from "next-sanity";
import type { ProjectsListQueryResult } from "~/sanity.types";
import { sanityQuery } from "../lib/fetch";

const projectsList = `
_id,
name,
url,
embeddable,

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
  return sanityQuery<ProjectsListQueryResult>({ query: query.all });
}

export async function fetchFeaturedProjects(): Promise<ProjectsListQueryResult> {
  return sanityQuery<ProjectsListQueryResult>({ query: query.featured });
}
