/** biome-ignore-all lint/correctness/useExhaustiveDependencies: ignore */
"use client";
import { format } from "date-fns";
import { useEffect, useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/reusable/shadcn/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../shadcn/empty";
import { Skeleton } from "../shadcn/skeleton";
import type { Activity } from "./contribution-graph";
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from "./contribution-graph";

export type GitHubContributionsResponse = {
  contributions: Activity[];
};

export type GitHubContributionsResult =
  | {
      data: Activity[];
      error: null;
    }
  | {
      data: [];
      error: string;
    };

// --- Reusable Decorative & Base Components ---

function DecorativeContributionGrid() {
  return (
    <div className="grid grid-cols-24 gap-0.5 opacity-40">
      {Array.from({ length: 144 }).map((_, index) => {
        const level =
          index % 11 === 0
            ? "bg-foreground/80"
            : index % 7 === 0
              ? "bg-foreground/60"
              : index % 5 === 0
                ? "bg-foreground/40"
                : "bg-foreground/20";

        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: static decorative items
            key={index}
            className={cn("size-3 rounded-[2px]", level)}
          />
        );
      })}
    </div>
  );
}

function ContributionsState({
  title,
  description,
  className,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
  className?: string;
}) {
  return (
    <Empty className={cn("p-0!", className)}>
      <EmptyHeader>
        <EmptyMedia className="mb-4">
          <DecorativeContributionGrid />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

// --- Exported Components ---

export function GitHubContributions({
  contributions,
  githubProfileUrl,
  className,
}: {
  contributions: GitHubContributionsResult;
  githubProfileUrl: string;
  className?: string;
}) {
  const result = contributions;
  const isMobile = useMediaQuery("(max-width: 767px)");
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calendar = calendarRef.current;
    if (!calendar) return;
    calendar.scrollLeft = calendar.scrollWidth;
  }, [result]);

  if (result.error) {
    return (
      <GitHubContributionsError message={result.error} className={className} />
    );
  }

  if (result.data.length === 0) {
    return <GitHubContributionsEmptyState className={className} />;
  }

  return (
    <ContributionGraph
      className={cn("mx-auto py-2 bg-background", className)}
      data={result.data}
      blockSize={isMobile ? 10 : 12}
      blockMargin={3}
      blockRadius={100}
    >
      <ContributionGraphCalendar
        calendarRef={calendarRef}
        className="no-scrollbar px-2 text-[11px] font-mono font-light uppercase sm:text-xs"
        title="GitHub Contributions"
      >
        {({ activity, dayIndex, weekIndex }) => (
          <Tooltip>
            <TooltipTrigger
              render={
                <g>
                  <ContributionGraphBlock
                    className="cursor-pointer"
                    activity={activity}
                    dayIndex={dayIndex}
                    weekIndex={weekIndex}
                  />
                </g>
              }
            />
            <TooltipContent className="font-sans">
              <p>
                {activity.count} contribution{activity.count !== 1 ? "s" : ""}{" "}
                on {format(new Date(activity.date), "dd.MM.yyyy")}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </ContributionGraphCalendar>
      <ContributionGraphFooter className="px-2 text-sm font-light">
        <ContributionGraphTotalCount>
          {({ totalCount, year }) => (
            <div className="text-muted-foreground">
              {totalCount.toLocaleString("en")} contributions in {year} on{" "}
              <a
                className="text-primary underline"
                href={githubProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              .
            </div>
          )}
        </ContributionGraphTotalCount>

        <ContributionGraphLegend />
      </ContributionGraphFooter>
    </ContributionGraph>
  );
}

export function GitHubContributionsFallback() {
  return (
    <div className="flex w-full gap-2 flex-col items-center justify-center">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="w-full h-28" />
      <div className="flex items-center w-full justify-between gap-4">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function GitHubContributionsEmptyState({
  className,
}: {
  className?: string;
}) {
  return (
    <ContributionsState
      className={className}
      title="Something went sideways."
      description={
        <>
          The contributions are probably there. <br /> GitHub just forgot to
          tell us.
        </>
      }
    />
  );
}

export function GitHubContributionsError({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <ContributionsState
      className={className}
      title="The GitHub birds are confused."
      description={message}
    />
  );
}
