import type { Metadata } from "next";
import { Suspense } from "react";
import { navLinksData } from "@/constants/navigation";
import { getOgImage } from "@/lib/og";
import { fetchAllProjects } from "@/sanity/queries/project.query";
import { fetchAllProjectFilters } from "@/sanity/queries/projectFilter.query";
import { ProjectsPageClient } from "./_components/client";

const nav = navLinksData("/projects");

export const metadata: Metadata = {
  title: nav?.eyebrow,
  description: nav?.description,

  openGraph: {
    title: nav?.eyebrow,
    description: nav?.description,
    url: "/projects",
    images: [
      {
        url: getOgImage({
          title: nav?.eyebrow ?? "Projects",
          description: nav?.description,
          category: "Projects",
        }),
        width: 1200,
        height: 630,
        alt: nav?.eyebrow ?? "Projects",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: nav?.eyebrow,
    description: nav?.description,
    images: [
      getOgImage({
        title: nav?.eyebrow ?? "Projects",
        description: nav?.description,
        category: "Projects",
      }),
    ],
  },
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
