/** biome-ignore-all lint/suspicious/noArrayIndexKey: skipped */
"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import React from "react";
import { workItemVariants } from "@/constants/variants";
import { useMediaQuery } from "@/hooks/use-media-query";
import { splitIntoColumns } from "@/lib/masonry";
import { cn, formatDate } from "@/lib/utils";
import type { ISearchFilterProps } from "@/types";
import type {
  ProjectFiltersListQueryResult,
  ProjectsListQueryResult,
} from "~/sanity.types";
import { useLivePreview } from "../provider/live-preview";
import { useImagePreview } from "../provider/preview";
import { Frame } from "../reusable/reui/frame";
import { Badge } from "../reusable/shadcn/badge";
import { Container } from "./container";
import { FadeLine } from "./fade-line";
import { CustomImage } from "./image";
import { InlineMarkdown } from "./inline-markdown";
import { Reicon } from "./reicon";

type Project = ProjectsListQueryResult[number];

type ProjectItemProps = {
  item: Project;
  index: number;
  activeTab?: string;
  projects: ProjectsListQueryResult;
  tabFilters: ProjectFiltersListQueryResult;
};

// Shared animation configuration
const MOTION_ITEM_PROPS = {
  variants: workItemVariants,
  initial: "hidden" as const,
  whileInView: "visible" as const,
  exit: "exit" as const,
  layout: true,
  viewport: { once: true, margin: "-50px" },
};

const MotionLink = motion.create(Link);

/**
 * Shared click behaviour for list rows and grid cards:
 * - the project already open in the live preview is inert
 * - ⌘/Ctrl + click opens the live preview (desktop only)
 * - a plain click falls through to the link and opens a new tab
 */
function useProjectCardClick(item: Project, projects: ProjectsListQueryResult) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { openPreview, currentProject } = useLivePreview();
  const isActive = currentProject?.url === item.url;

  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isActive) {
      event.preventDefault();
      return;
    }

    if (isDesktop && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      openPreview(item, event.currentTarget.getBoundingClientRect(), projects);
    }
  };

  return { isActive, onClick };
}

const getFilterIcon = (
  tabFilters: ProjectFiltersListQueryResult,
  activeTab?: string,
) => tabFilters.find((filter) => filter.slug === activeTab)?.icon;

// List row
const ProjectListItem: React.FC<ProjectItemProps & { isLast: boolean }> = ({
  item,
  index,
  isLast,
  activeTab,
  projects,
  tabFilters,
}) => {
  const { handleMouseEnter, handleMouseLeave } = useImagePreview();
  const { isActive, onClick } = useProjectCardClick(item, projects);
  const icon = getFilterIcon(tabFilters, activeTab);

  // Format index as 01, 02, 03...
  const formattedIndex = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      custom={index}
      {...MOTION_ITEM_PROPS}
      onClick={onClick}
      className={cn(
        "group relative transition-colors duration-500 hover:bg-muted/40 dark:hover:bg-accent/10",
        isActive && "pointer-events-none opacity-50!",
      )}
    >
      <Container className="px-0!">
        <Link
          href={(item.url ?? "#") as Route}
          target="_blank"
          rel="noreferrer"
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
        >
          <FadeLine orientation="horizontal" className="top-0" />
          {isLast && <FadeLine orientation="horizontal" className="bottom-0" />}

          <Container size="md" className="py-6 md:py-8">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center lg:gap-8">
              {/* Left Column: Index, Icon, Title & Tags */}
              <div className="flex items-start gap-4 lg:col-span-7 lg:gap-6">
                {/* Index + Icon Stack */}
                <div className="mt-1.5 hidden flex-col items-center gap-1 md:block">
                  <span className="font-mono font-normal text-muted-foreground text-xs transition-colors group-hover:text-primary">
                    {formattedIndex}
                  </span>
                  <Reicon
                    name={icon}
                    className="size-4 text-muted-foreground transition-transform duration-300 group-hover:scale-110 group-hover:text-primary"
                  />
                </div>

                {/* Title & Micro Metadata */}
                <div className="flex flex-1 flex-col gap-2 transition-transform duration-300 ease-out lg:group-hover:translate-x-2">
                  <div className="flex items-center gap-2">
                    <Reicon
                      name={icon}
                      className="mb-0.5 block size-5 text-muted-foreground transition-transform duration-300 group-hover:scale-110 group-hover:text-primary md:hidden"
                    />
                    <h1 className="font-light font-serif text-[28px] tracking-tight transition-colors duration-300 group-hover:text-primary md:text-[32px] lg:text-[42px]">
                      {item.name}
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-muted-foreground/70 text-xs">
                      {formatDate(item.date as string)}
                    </span>

                    {item.tags && item.tags.length > 0 && (
                      <>
                        <span className="text-muted-foreground/30 text-xs">
                          •
                        </span>
                        {item.tags.map((badge) => (
                          <Badge
                            key={badge}
                            variant="secondary"
                            className="text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                          >
                            {badge}
                          </Badge>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Mobile Description */}
                  <div className="mt-2 font-light text-muted-foreground/80 text-sm leading-relaxed lg:hidden">
                    <InlineMarkdown>{item.description}</InlineMarkdown>
                  </div>
                </div>
              </div>

              {/* Right Column: Desktop Description */}
              <div className="hidden lg:col-span-5 lg:flex lg:items-center lg:justify-between lg:gap-6">
                <div className="text-right font-light text-muted-foreground/80 text-sm leading-relaxed transition-colors duration-300 group-hover:text-foreground">
                  <InlineMarkdown>{item.description}</InlineMarkdown>
                </div>
              </div>
            </div>
          </Container>
        </Link>
      </Container>
    </motion.div>
  );
};

// Grid card
const ProjectGridItem: React.FC<ProjectItemProps> = ({
  item,
  index,
  activeTab,
  projects,
  tabFilters,
}) => {
  const { isActive, onClick } = useProjectCardClick(item, projects);
  const icon = getFilterIcon(tabFilters, activeTab);

  return (
    <MotionLink
      href={(item.url ?? "#") as Route}
      target="_blank"
      rel="noreferrer"
      custom={index}
      {...MOTION_ITEM_PROPS}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col transition-all duration-500 ease-out",
        isActive && "pointer-events-none opacity-50!",
      )}
    >
      <Frame
        variant="inverse"
        className="rounded-3xl transition-transform duration-500 ease-out group-hover:-translate-y-1"
      >
        <div className="relative h-auto overflow-hidden rounded-[20px]! border border-border/60 bg-muted/20">
          <CustomImage
            src={item.mainImage?.image as string}
            ogUrl={item.url as string}
            alt={item.name as string}
            unoptimized
            className="size-auto object-contain transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Gradient Overlay with Glassmorphic Badges */}
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/30 to-transparent px-5 pt-12 pb-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {item.tags?.map((badge) => (
                <Badge
                  key={badge}
                  className="border border-white/20 bg-black/40 text-white/90 backdrop-blur-md transition-colors duration-300 group-hover:border-white/40"
                >
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Frame>

      <div className="flex flex-col gap-0.5 px-4 py-5 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Reicon name={icon} className="mb-0.5 size-4" />
            <p className="font-normal font-serif text-lg">{item.name}</p>
          </div>

          <p className="font-light text-sm">
            {formatDate(item.date as string)}
          </p>
        </div>

        <div className="font-extralight text-[13px] leading-relaxed">
          <InlineMarkdown>{item.description}</InlineMarkdown>
        </div>
      </div>

      <FadeLine orientation="horizontal" className="bottom-0 mx-auto w-[85%]" />
    </MotionLink>
  );
};

// One masonry layout per breakpoint; CSS decides which one is visible.
const GRID_LAYOUTS = [
  // Mobile (1 column)
  { columns: 1, className: "group/list flex flex-col gap-6 md:hidden" },
  // Tablet (2 columns)
  {
    columns: 2,
    className: "group/list hidden items-start gap-4 md:flex lg:hidden",
  },
  // Desktop (3 columns)
  { columns: 3, className: "group/list hidden items-start gap-4 lg:flex" },
] as const;

export const ProjectsView: React.FC<{
  view?: ISearchFilterProps["view"];
  projects: ProjectsListQueryResult;
  activeTab?: string;
  tabFilters: ProjectFiltersListQueryResult;
}> = ({ view = "list", projects, tabFilters, activeTab }) => {
  const { handleMouseLeave } = useImagePreview();

  // biome-ignore lint/correctness/useExhaustiveDependencies: just ignore
  React.useLayoutEffect(() => {
    handleMouseLeave();
  }, [view, handleMouseLeave]);

  const itemProps = { projects, tabFilters, activeTab };

  return (
    <AnimatePresence mode="popLayout">
      {view === "list" ? (
        <div className="group/list flex flex-col">
          {projects.map((item, index) => (
            <ProjectListItem
              key={item.url}
              item={item}
              index={index}
              isLast={index === projects.length - 1}
              {...itemProps}
            />
          ))}
        </div>
      ) : (
        <Container>
          {GRID_LAYOUTS.map(({ columns, className }) => (
            <div key={columns} className={className}>
              {splitIntoColumns(projects, columns).map((column, colIndex) => (
                <div
                  key={colIndex}
                  className={cn("flex flex-col gap-6", columns > 1 && "flex-1")}
                >
                  {column.map(({ item, originalIndex }) => (
                    <ProjectGridItem
                      key={item.url}
                      item={item}
                      index={originalIndex}
                      {...itemProps}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </Container>
      )}
    </AnimatePresence>
  );
};
