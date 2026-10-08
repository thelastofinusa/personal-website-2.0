/** biome-ignore-all lint/correctness/useExhaustiveDependencies: ignore */
"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/reusable/shadcn/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn, formatDate } from "@/lib/utils";
import { LinkPreview } from "../aceternity/link-preview";
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

const FADE_SIZE = 32;

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

  // inside GitHubContributions, above the early returns:
  const [ready, setReady] = useState(false);

  const updateFade = useCallback(() => {
    const el = calendarRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const left = Math.min(el.scrollLeft, FADE_SIZE);
    const right = Math.min(Math.max(maxScroll - el.scrollLeft, 0), FADE_SIZE);
    el.style.setProperty("--fade-l", `${left}px`);
    el.style.setProperty("--fade-r", `${right}px`);
  }, []);

  // Jump to the latest week before paint. "instant" overrides the global
  // `scroll-behavior: smooth`, so it doesn't animate in from the left.
  useLayoutEffect(() => {
    const el = calendarRef.current;
    if (!el) return;
    el.scrollTo({ left: el.scrollWidth, behavior: "instant" });
    updateFade();
    setReady(true);
  }, [result, isMobile, updateFade]);

  useEffect(() => {
    const el = calendarRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateFade, { passive: true });
    const observer = new ResizeObserver(updateFade);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", updateFade);
      observer.disconnect();
    };
  }, [result, updateFade]);

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
      className={cn("mx-auto bg-background py-2", className)}
      data={result.data}
      blockSize={isMobile ? 10 : 12}
      blockMargin={3}
      blockRadius={4}
    >
      <ContributionGraphCalendar
        calendarRef={calendarRef}
        className={cn(
          "no-scrollbar fade-edges-x px-2 font-light font-mono text-[11px] uppercase transition-opacity duration-300 sm:text-xs",
          ready ? "opacity-100" : "opacity-0",
        )}
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
            <TooltipContent className="font-sans" sideOffset={8}>
              <p className="text-center">
                {activity.count} contribution{activity.count !== 1 ? "s" : ""}{" "}
                <br />
                on {formatDate(activity.date)}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </ContributionGraphCalendar>
      <ContributionGraphFooter className="px-2 font-light text-sm">
        <ContributionGraphTotalCount>
          {({ totalCount, year }) => (
            <div className="text-muted-foreground">
              {totalCount.toLocaleString("en")} contributions in {year} on{" "}
              <LinkPreview
                className="text-primary! underline"
                href={githubProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </LinkPreview>
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
    <div className="flex w-full flex-col items-center justify-center gap-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-28 w-full" />
      <div className="flex w-full items-center justify-between gap-4">
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
