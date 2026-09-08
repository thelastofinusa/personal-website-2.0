/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import { useSearchParams } from "next/navigation";
import type React from "react";
import { Skeleton } from "@/components/reusable/shadcn/skeleton";
import { Container } from "@/components/shared/container";
import { CurveThingy } from "@/components/shared/curve-thingy";
import type { ISearchFilterProps } from "@/types";

const ProjectsCardsSkeletonList = () => (
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

const ProjectsCardsSkeletonGrid = () => (
  <Container>
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-4/3 w-full rounded-[20px]" />
          <div className="flex items-center justify-between px-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  </Container>
);

export const ProjectsCardsSkeleton: React.FC<{
  view: ISearchFilterProps["view"];
}> = ({ view }) =>
  view === "list" ? (
    <ProjectsCardsSkeletonList />
  ) : (
    <ProjectsCardsSkeletonGrid />
  );

// Static, motion-free stand-in for QuickHero. The real QuickHero pulls in
// framer-motion (useScroll/motion.div) purely for scroll-linked animation,
// which a loading skeleton doesn't need — so this mirrors its markup and
// class names without the motion wrapper, and simulates the eyebrow as a
// skeleton shape instead of rendering real label/icon data.
const QuickHeroSkeleton = () => (
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
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-36 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
    </Container>
  </section>
);

export const ProjectsPageSkeleton = () => {
  const searchParams = useSearchParams();
  const view =
    (searchParams.get("view") as ISearchFilterProps["view"]) ?? "list";

  return (
    <div className="flex-1 overflow-x-clip">
      <QuickHeroSkeleton />

      <CurveThingy tCurve hash="showcase">
        <div className="flex flex-col gap-8 pt-20 sm:pt-30 md:gap-12 md:pt-36">
          <Container size={view === "list" ? "sm" : "md"}>
            <Skeleton className="h-3 max-w-sm w-full rounded-full mb-2 ml-4" />
            <Skeleton className="h-10 w-full max-w-md rounded-full" />
          </Container>
          <ProjectsCardsSkeleton view={view} />
        </div>
      </CurveThingy>
    </div>
  );
};
