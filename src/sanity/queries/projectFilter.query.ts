import { defineQuery } from "next-sanity";
import type { ProjectFiltersListQueryResult } from "~/sanity.types";
import { NO_STEGA, sanityFetch } from "../lib/live";

const projectFiltersList = `
_id,
name,
"slug": value.current,
description,
icon,
`;

const projectFiltersListQuery = defineQuery(`
*[_type == "projectFilter"] | order(_createdAt asc) {
  ${projectFiltersList}
}`);

const query = {
  all: projectFiltersListQuery,
};

export async function fetchAllProjectFilters(): Promise<ProjectFiltersListQueryResult> {
  const { data } = await sanityFetch({ query: query.all, ...NO_STEGA });
  return data;
}
