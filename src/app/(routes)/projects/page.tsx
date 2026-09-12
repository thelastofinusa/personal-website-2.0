/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/reusable/shadcn/skeleton";
import { Container } from "@/components/shared/container";
import { CurveThingy } from "@/components/shared/curve-thingy";
import { siteConfig } from "@/config/site.config";
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
    title: `${nav?.eyebrow} - ${siteConfig.author.nickname}`,
    description: nav?.description,
    url: nav?.href,
    siteName: siteConfig.title,
    images: [
      {
        url: getOgImage({
          title: `${nav?.eyebrow} - ${siteConfig.author.nickname}`,
          description: nav?.description,
          category: "Projects",
        }),
        width: 1200,
        height: 630,
        alt: `${nav?.eyebrow} - ${siteConfig.author.nickname}`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${nav?.eyebrow} - ${siteConfig.author.nickname}`,
    description: nav?.description,
    images: [
      getOgImage({
        title: `${nav?.eyebrow} - ${siteConfig.author.nickname}`,
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
    <Suspense fallback={<PageLoading />}>
      <ProjectsPageClient initialProjects={projects} filters={projectFilters} />
    </Suspense>
  );
}

const PageLoading = () => {
  return (
    <>
      <section className="pt-26 pb-16 sticky top-0 md:py-30 lg:pt-36 bg-background">
        <Container size="sm">
          <div className="flex flex-col gap-1.5">
            <div className="mb-4 flex w-max items-center gap-2">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-3 w-24 rounded-full" />
            </div>

            <Skeleton className="h-10 w-94 rounded-full" />

            <Skeleton className="h-4 max-w-md mt-2.5 w-full rounded-full" />
          </div>
        </Container>

        <Container size="sm" className="mt-5">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-9 w-32 rounded-full" />
            <Skeleton className="h-9 w-36 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </Container>
      </section>
      <CurveThingy tCurve hash="showcase">
        <div className="flex flex-col gap-8 pt-20 sm:pt-30 md:gap-12 md:pt-36">
          <Container size="sm">
            {/* // TODO: command click <Skeleton className="h-3 max-w-sm w-full rounded-full mb-2 ml-4" /> */}
            <Skeleton className="h-11 w-full max-w-md rounded-full" />
          </Container>
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
        </div>
      </CurveThingy>
    </>
  );
};
