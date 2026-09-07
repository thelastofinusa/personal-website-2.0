import type { ProjectsListQueryResult } from "~/sanity.types";

export function projectMatchesSearch(
  project: ProjectsListQueryResult[0],
  query: string,
): boolean {
  if (!query) return true;
  const lower = query.toLowerCase();
  return (
    project.name?.toLowerCase().includes(lower) ||
    project.description?.toLowerCase().includes(lower) ||
    project.tags?.some((tag) => tag.toLowerCase().includes(lower)) ||
    false
  );
}
