"use client";

import Link from "next/link";
import type React from "react";
import { Link4Newicons } from "reicon-react";
import { ImagePreviewProvider } from "@/components/provider/preview";
import { useSoundFx } from "@/components/provider/sound-fx";
import { buttonVariants } from "@/components/reusable/shadcn/button";
import { Container } from "@/components/shared/container";
import { ProjectsView } from "@/components/shared/projects-view";
import type { IImagePreviewPortalProps } from "@/types";
import type { ProjectsListQueryResult } from "~/sanity.types";

export const ProjectsComp: React.FC<{
  projects: ProjectsListQueryResult;
}> = ({ projects }) => {
  const { play } = useSoundFx();

  if (projects.length === 0) return null;

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
    <div className="flex flex-col gap-8 md:gap-12">
      <ImagePreviewProvider images={projectImages}>
        <ProjectsView projects={projects} />
      </ImagePreviewProvider>

      <Container size="md" className="flex justify-end">
        <Link
          href="/projects"
          onClick={() => play("forward")}
          className={buttonVariants({
            size: "lg",
            variant: "link",
            className: "p-0! h-auto!",
          })}
        >
          <span>Checkout the rest of my work</span>
          <Link4Newicons className="size-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
        </Link>
      </Container>
    </div>
  );
};
