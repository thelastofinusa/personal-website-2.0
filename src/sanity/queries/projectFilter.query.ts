import { defineQuery } from "next-sanity";
import type { ProjectFiltersListQueryResult } from "~/sanity.types";
import { sanityQuery } from "../lib/fetch";

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
  return sanityQuery<ProjectFiltersListQueryResult>({ query: query.all });
}
