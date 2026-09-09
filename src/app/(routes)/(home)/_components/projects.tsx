"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type React from "react";
import { useSoundFx } from "@/components/provider/sound-fx";
import { Button } from "@/components/reusable/shadcn/button";
import { Container } from "@/components/shared/container";
import { ProjectsView } from "@/components/shared/projects-view";
import { navLinksData } from "@/constants/navigation";
import type { IImagePreviewPortalProps } from "@/types";
import type {
  ProjectFiltersListQueryResult,
  ProjectsListQueryResult,
} from "~/sanity.types";

const LivePreviewProvider = dynamic(
  () =>
    import("@/components/provider/live-preview").then(
      (mod) => mod.LivePreviewProvider,
    ),
  { ssr: false, loading: () => null },
);

const ImagePreviewProvider = dynamic(
  () =>
    import("@/components/provider/preview").then(
      (mod) => mod.ImagePreviewProvider,
    ),
  { ssr: false, loading: () => null },
);

export const ProjectsComp: React.FC<{
  projects: ProjectsListQueryResult;
  filters: ProjectFiltersListQueryResult;
}> = ({ projects, filters }) => {
  const { play } = useSoundFx();
  const Icon = navLinksData("/projects")?.icon;

  if (projects.length === 0) return null;

  // Same synthetic "All" entry client.tsx builds for the /projects page —
  // ProjectsView resolves its Reicon by matching `activeTab` against this
  // list, so without it there's nothing for the lookup to find.
  const tabFilters: ProjectFiltersListQueryResult = [
    {
      _id: "first-all",
      slug: "all",
      name: "Everything",
      description: "Everything I've been up to",
      icon: "StackPerspective",
    },
    ...filters,
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
          <Link
            href="/projects"
            onClick={() => play("forward")}
            className="flex mx-auto wrapper items-center w-max"
          >
            <Button variant="inverse">
              <span>Go see what else exists</span>
            </Button>
            <Button variant="inverse" size="icon">
              {Icon && <Icon />}
            </Button>
          </Link>
        </Container>
      </div>
    </LivePreviewProvider>
  );
};
