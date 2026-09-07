import { defineQuery } from "next-sanity";
import { revalidateOption } from "@/lib/utils";
import type { ProjectFiltersListQueryResult } from "~/sanity.types";
import { readClient } from "../lib/client";

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
  const result = await readClient.fetch(query.all, {}, revalidateOption);
  return result;
}
