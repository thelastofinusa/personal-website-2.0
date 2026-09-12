/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */

import React from "react";
import { Skeleton } from "@/components/reusable/shadcn/skeleton";
import { Container } from "@/components/shared/container";
import { CurveThingy } from "@/components/shared/curve-thingy";
import { TextContent } from "@/components/shared/text-content";
import { fetchFeaturedProjects } from "@/sanity/queries/project.query";
import { fetchAllProjectFilters } from "@/sanity/queries/projectFilter.query";
import { ContactComp } from "./_components/contact";
import { HomeHero } from "./_components/hero";
import { ProjectsComp } from "./_components/projects";

const aboutContent = `
I work across **Frontend**, **Web3**, and **Developer Experience** — building interfaces, wiring up APIs and smart contracts, and spending a fair amount of time wondering why that one thing suddenly stopped working.

Lately, I’ve been exploring **AI**, building **open-source** and **dev tools**, and experimenting with new ways to make software more useful and enjoyable to work with.

There’s more to the story, but this paragraph is already getting suspiciously long. Go bother my **[about page](/about)** if you want the full lore.
`;

export default async function Home() {
  const projects = await fetchFeaturedProjects();
  const projectFilters = await fetchAllProjectFilters();

  return (
    <div className="flex-1 overflow-x-clip bg-background">
      <HomeHero />
      <CurveThingy tCurve tMargin>
        <TextContent hash="about" content={aboutContent} />
        <React.Suspense
          fallback={
            <div className="flex flex-col">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border-t last:border-b">
                  <Container size="md" className="py-5 md:py-7">
                    <div className="flex items-start justify-between gap-6 md:items-center">
                      <div className="flex min-w-0 flex-1 flex-col gap-2 md:gap-3">
                        <Skeleton className="h-8 w-2/3 max-w-xs md:h-10 lg:h-12" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-5 w-14 rounded-full" />
                          <Skeleton className="h-5 w-14 rounded-full" />
                        </div>
                      </div>
                      <Skeleton className="hidden h-4 w-40 lg:block" />
                    </div>
                  </Container>
                </div>
              ))}
            </div>
          }
        >
          <ProjectsComp projects={projects} filters={projectFilters} />
        </React.Suspense>
        <ContactComp />
      </CurveThingy>
    </div>
  );
}
