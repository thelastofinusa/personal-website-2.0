import type { Metadata } from "next";
import { Suspense } from "react";
import { navLinksData } from "@/constants/navigation";
import { fetchAllProjects } from "@/sanity/queries/project.query";
import { fetchAllProjectFilters } from "@/sanity/queries/projectFilter.query";
import { ProjectsPageClient } from "./_components/client";

export const metadata: Metadata = {
  title: navLinksData("/projects")?.eyebrow,
  description: navLinksData("/projects")?.description,
};

export default async function Projects() {
  const projects = await fetchAllProjects();
  const projectFilters = await fetchAllProjectFilters();

  return (
    <Suspense fallback={null}>
      <ProjectsPageClient initialProjects={projects} filters={projectFilters} />
    </Suspense>
  );
}
