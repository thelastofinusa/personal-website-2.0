/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Route } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import type React from "react";
import { useSoundFx } from "@/components/provider/sound-fx";
import { Button } from "@/components/reusable/shadcn/button";
import { Skeleton } from "@/components/reusable/shadcn/skeleton";
import { Container } from "@/components/shared/container";
import { CurveThingy } from "@/components/shared/curve-thingy";
import { ProjectsView } from "@/components/shared/projects-view";
import { TextContent } from "@/components/shared/text-content";
import { navLinksData } from "@/constants/navigation";
import { parentVariants, workItemVariants } from "@/constants/variants";
import type { IImagePreviewPortalProps } from "@/types";
import type {
  ProjectFiltersListQueryResult,
  ProjectsListQueryResult,
} from "~/sanity.types";
import { ContactComp } from "./contact";
import { HomeHero } from "./hero";

const LivePreviewProvider = dynamic(
  () =>
    import("@/components/provider/live-preview").then(
      (mod) => mod.LivePreviewProvider,
    ),
  {
    ssr: false,
    loading: () => {
      return (
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
      );
    },
  },
);

const ImagePreviewProvider = dynamic(
  () =>
    import("@/components/provider/preview").then(
      (mod) => mod.ImagePreviewProvider,
    ),
  { ssr: false, loading: () => null },
);

const aboutContent = `
I work across **Frontend**, **Web3**, and **Developer Experience** — building interfaces, wiring up APIs and smart contracts, and spending a fair amount of time wondering why that one thing suddenly stopped working.

Lately, I’ve been exploring **AI**, building **open-source** and **dev tools**, and experimenting with new ways to make software and web apps more useful and enjoyable to work with.`;

export const HomeClientPage: React.FC<{
  projects: ProjectsListQueryResult;
  projectFilters: ProjectFiltersListQueryResult;
}> = ({ projectFilters, projects }) => {
  const { play } = useSoundFx();

  const projectsRoute = navLinksData("/projects");
  const ProjectIcon = projectsRoute?.icon;
  const aboutRoute = navLinksData("/about");
  const AboutIcon = aboutRoute?.icon;

  if (projects.length === 0) return null;

  const tabFilters: ProjectFiltersListQueryResult = [
    {
      _id: "first-all",
      slug: "all",
      name: "All",
      description: "Everything I’ve built",
      icon: "StackPerspective",
    },
    ...projectFilters,
  ];

  const projectImages: IImagePreviewPortalProps["images"] = projects.flatMap(
    (project) => {
      const image = project.mainImage;

      if (!image?.image || !image.width || !image.height) return [];

      return [
        {
          alt: project.name ?? undefined,
          url: image.image,
          ogUrl: project.url ?? undefined,
          width: image.width,
          height: image.height,
        },
      ];
    },
  );

  return (
    <div className="flex-1 overflow-x-clip bg-background">
      <section className="sticky top-0 flex-1 md:h-dvh">
        <Container className="h-full" size="xs">
          <HomeHero />
        </Container>
      </section>

      <CurveThingy tCurve tMargin>
        <motion.div
          variants={parentVariants}
          initial="hidden"
          whileInView="visible"
          className="flex flex-col gap-10 pt-20 sm:pt-30 md:pt-36"
        >
          <Container size="xs">
            <TextContent content={aboutContent} />
          </Container>

          <Container size="md">
            {projects.length > 0 && (
              <AnimatePresence mode="popLayout">
                <motion.div
                  variants={workItemVariants}
                  initial="hidden"
                  whileInView="visible"
                  exit="exit"
                  layout
                  className="relative"
                >
                  <Link
                    href={aboutRoute?.href as Route}
                    onClick={() => play("forward")}
                    className="wrapper mx-auto flex w-max items-center"
                  >
                    <Button variant="inverse">
                      <span>{aboutRoute?.action}</span>
                    </Button>
                    <Button variant="inverse" size="icon">
                      {AboutIcon && <AboutIcon />}
                    </Button>
                  </Link>
                </motion.div>
              </AnimatePresence>
            )}
          </Container>
        </motion.div>

        <LivePreviewProvider projects={projects}>
          <div className="flex flex-col gap-8 md:gap-12">
            <ImagePreviewProvider images={projectImages}>
              <ProjectsView
                projects={projects}
                tabFilters={tabFilters}
                activeTab="all"
              />
            </ImagePreviewProvider>

            <Container size="md">
              {projects.length > 0 && (
                <AnimatePresence mode="popLayout">
                  <motion.div
                    variants={workItemVariants}
                    initial="hidden"
                    whileInView="visible"
                    exit="exit"
                    layout
                    className="relative"
                  >
                    <Link
                      href={projectsRoute?.href as Route}
                      onClick={() => play("forward")}
                      className="wrapper mx-auto flex w-max items-center"
                    >
                      <Button variant="inverse">
                        <span>{projectsRoute?.action}</span>
                      </Button>
                      <Button variant="inverse" size="icon">
                        {ProjectIcon && <ProjectIcon />}
                      </Button>
                    </Link>
                  </motion.div>
                </AnimatePresence>
              )}
            </Container>
          </div>
        </LivePreviewProvider>

        <ContactComp />
      </CurveThingy>
    </div>
  );
};
