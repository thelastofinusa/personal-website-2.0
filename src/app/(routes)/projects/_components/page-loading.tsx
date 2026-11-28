/** biome-ignore-all lint/suspicious/noArrayIndexKey: just ignore */
"use client";

import { useSearchParams } from "next/navigation";
import React from "react";
import { Skeleton } from "@/components/reusable/shadcn/skeleton";
import { Container } from "@/components/shared/container";
import { CurveThingy } from "@/components/shared/curve-thingy";
import { cn } from "@/lib/utils";
import type { ISearchFilterProps } from "@/types";

const MASONRY_COLUMNS = [
  // Mobile (1 column)
  {
    key: "mobile",
    className: "flex flex-col gap-5 md:hidden",
    columnHeights: [["h-44", "h-56", "h-48"]],
  },
  // Tablet (2 columns)
  {
    key: "tablet",
    className: "hidden items-start gap-5 md:flex lg:hidden",
    columnHeights: [
      ["h-48", "h-60", "h-44"],
      ["h-56", "h-44", "h-52"],
    ],
  },
  // Desktop (3 columns)
  {
    key: "desktop",
    className: "hidden items-start gap-6 lg:flex",
    columnHeights: [
      ["h-48", "h-60"],
      ["h-60", "h-48"],
      ["h-52", "h-56"],
    ],
  },
] as const;

export const ProjectsListSkeleton: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 4, className }) => (
  <div className={cn("flex flex-col gap-6", className)}>
    {/* Tier section header (e.g. IMPORTANT (8) + horizontal rule) */}
    <Container size="md">
      <div className="flex items-center gap-4">
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="h-3.5 w-24 rounded-full" />
          <Skeleton className="h-3.5 w-7 rounded-full" />
        </div>
        <div className="bg-border/60 h-px flex-1" />
      </div>
    </Container>

    {/* Editorial rows */}
    <div className="flex flex-col">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-t last:border-b">
          <Container size="md" className="py-8 md:py-10">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[7.5rem_minmax(0,1fr)_auto] md:items-start md:gap-8">
              {/* Left: index + icon + date */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-6 rounded-full" />
                  <Skeleton className="size-4 rounded-sm" />
                </div>
                <Skeleton className="h-3.5 w-24 rounded-full" />
              </div>

              {/* Middle: title + description */}
              <div className="flex min-w-0 flex-col gap-3">
                <Skeleton className="h-8 w-56 rounded-full md:h-10 md:w-72" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-full max-w-xl rounded-full" />
                  <Skeleton className="h-4 w-11/12 max-w-lg rounded-full" />
                  <Skeleton className="h-4 w-24 rounded-full" />
                </div>
              </div>

              {/* Right: tag pills */}
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-22 rounded-full" />
                <Skeleton className="h-7 w-18 rounded-full" />
              </div>
            </div>
          </Container>
        </div>
      ))}
    </div>
  </div>
);

export const GridLoading = () => (
  <Container className="flex flex-col gap-10">
    {MASONRY_COLUMNS.map(({ key, className, columnHeights }) => (
      <div key={key} className={className}>
        {columnHeights.map((heights, colIndex) => (
          <div
            key={colIndex}
            className={cn(
              "flex flex-col gap-6",
              columnHeights.length > 1 && "flex-1",
            )}
          >
            {heights.map((imageHeightClass, cardIndex) => (
              <div
                key={cardIndex}
                className="border-border/60 bg-card/40 flex flex-col gap-3 rounded-3xl border p-3"
              >
                <Skeleton
                  className={cn("w-full rounded-2xl", imageHeightClass)}
                />
                <div className="flex flex-col gap-2.5 px-2 pt-2 pb-2">
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-5 w-36 rounded-full" />
                    <Skeleton className="h-3 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3.5 w-full rounded-full" />
                  <Skeleton className="h-3.5 w-3/4 rounded-full" />
                  <div className="flex items-center gap-1.5 pt-1">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    ))}
  </Container>
);

const ShowcaseBodyLoading = () => {
  const searchParams = useSearchParams();
  const view =
    (searchParams.get("view") as ISearchFilterProps["view"]) ?? "list";

  return view === "grid" ? <GridLoading /> : <ProjectsListSkeleton />;
};

export const ProjectsPageLoading: React.FC = () => {
  return (
    <>
      <section className="bg-background sticky top-0 pt-26 pb-16 md:py-30 lg:pt-36">
        <Container size="sm">
          <div className="flex flex-col gap-1.5">
            <div className="mb-4 flex w-max items-center gap-2">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-3 w-24 rounded-full" />
            </div>

            <Skeleton className="h-10 w-72 rounded-full" />

            <Skeleton className="mt-2.5 h-4 w-full max-w-md rounded-full" />
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
            <Skeleton className="mb-2 ml-4 h-3 w-full max-w-sm rounded-full" />
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-11 w-full max-w-md rounded-full" />
              <Skeleton className="hidden h-10 w-24 rounded-full sm:block" />
            </div>
          </Container>

          <React.Suspense fallback={<ProjectsListSkeleton />}>
            <ShowcaseBodyLoading />
          </React.Suspense>
        </div>
      </CurveThingy>
    </>
  );
};
