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

type ProjectImportance = "important" | "less-important";

type AnnotatedProject = {
  item: Project;
  originalIndex: number;
  importance: ProjectImportance;
};

type ProjectItemProps = {
  item: Project;
  displayIndex: number;
  previewIndex: number;
  importance: ProjectImportance;
  activeTab?: string;
  projects: ProjectsListQueryResult;
  tabFilters: ProjectFiltersListQueryResult;
};

type ProjectsViewProps = {
  view?: ISearchFilterProps["view"];
  projects: ProjectsListQueryResult;
  activeTab?: string;
  tabFilters: ProjectFiltersListQueryResult;
  isFiltered?: boolean;
};

const MOTION_ITEM_PROPS = {
  variants: workItemVariants,
  initial: "hidden" as const,
  whileInView: "visible" as const,
  exit: "exit" as const,
  layout: true,
  viewport: { once: true, margin: "-50px" },
};

const MotionLink = motion.create(Link);

function getProjectImportance(item: Project): ProjectImportance {
  const raw = item as Record<string, unknown>;
  const candidate =
    raw.importance ??
    raw.priority ??
    raw.importanceLabel ??
    raw.label ??
    raw.tier;

  if (typeof candidate === "string") {
    const normalized = candidate
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-");
    if (
      normalized === "less-important" ||
      normalized === "lessimportant" ||
      normalized === "low" ||
      normalized === "secondary"
    ) {
      return "less-important";
    }
  }

  return "important";
}

function groupProjectsByImportance(projects: ProjectsListQueryResult) {
  const important: AnnotatedProject[] = [];
  const lessImportant: AnnotatedProject[] = [];

  projects.forEach((item, originalIndex) => {
    const importance = getProjectImportance(item);
    const entry = { item, originalIndex, importance };
    if (importance === "less-important") {
      lessImportant.push(entry);
    } else {
      important.push(entry);
    }
  });

  return {
    important,
    lessImportant,
    combined: [...important, ...lessImportant],
  };
}

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

const SectionHeader: React.FC<{ title: string; count: number }> = ({
  title,
  count,
}) => (
  <div className="pt-4 pb-2 md:pt-6 md:pb-3">
    <Container size="md">
      <div className="flex items-center gap-3">
        <span className="font-serif text-xs font-medium tracking-[0.08em] lowercase">
          {title}
        </span>
        <span className="text-muted-foreground/60 font-mono text-[11px]">
          ({count})
        </span>
        <span className="bg-border/70 h-px flex-1" />
      </div>
    </Container>
  </div>
);

const ProjectListItem: React.FC<ProjectItemProps & { isLast: boolean }> = ({
  item,
  displayIndex,
  previewIndex,
  importance,
  isLast,
  activeTab,
  projects,
  tabFilters,
}) => {
  const { handleMouseEnter, handleMouseLeave } = useImagePreview();
  const { isActive, onClick } = useProjectCardClick(item, projects);
  const icon = getFilterIcon(tabFilters, activeTab);
  const formattedIndex = String(displayIndex + 1).padStart(2, "0");
  const isLessImportant = importance === "less-important";

  return (
    <motion.div
      custom={displayIndex}
      {...MOTION_ITEM_PROPS}
      onClick={onClick}
      className={cn(
        "group relative transition-colors duration-300 hover:bg-muted/35 dark:hover:bg-accent/10",
        isLessImportant && "opacity-90 hover:opacity-100",
        isActive && "pointer-events-none opacity-50!",
      )}
    >
      <Container className="px-0!">
        <Link
          href={(item.url ?? "#") as Route}
          target="_blank"
          rel="noreferrer"
          onMouseEnter={() => handleMouseEnter(previewIndex)}
          onMouseLeave={handleMouseLeave}
          className="block"
        >
          <FadeLine orientation="horizontal" className="top-0" />
          {isLast && <FadeLine orientation="horizontal" className="bottom-0" />}

          <Container
            size="md"
            className={cn(isLessImportant ? "py-5 md:py-6" : "py-7 md:py-9")}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-baseline md:gap-6">
              <div className="flex items-center justify-between md:col-span-2 md:flex-col md:items-start md:gap-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-muted-foreground group-hover:text-primary font-mono text-xs transition-colors">
                    {formattedIndex}
                  </span>
                  <Reicon
                    name={icon}
                    className="text-muted-foreground/70 group-hover:text-primary size-3.5 transition-colors"
                  />
                </div>
                <span className="text-muted-foreground/70 font-mono text-xs">
                  {formatDate(item.date as string)}
                </span>
              </div>

              <div className="flex flex-col gap-2 md:col-span-6">
                <div className="flex items-center gap-3 transition-transform duration-300 ease-out group-hover:translate-x-1.5">
                  <h2 className="group-hover:text-primary font-serif text-2xl font-light tracking-tight transition-colors md:text-3xl lg:text-[34px]">
                    {item.name}
                  </h2>
                </div>

                <div className="text-muted-foreground/85 group-hover:text-foreground/90 text-sm leading-relaxed font-light transition-colors">
                  <InlineMarkdown>{item.description}</InlineMarkdown>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 md:col-span-4 md:justify-end md:pt-0">
                <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
                  {item.tags?.map((badge) => (
                    <Badge
                      key={badge}
                      variant="secondary"
                      className="text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary font-normal transition-colors"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Link>
      </Container>
    </motion.div>
  );
};

const ProjectGridItem: React.FC<ProjectItemProps> = ({
  item,
  displayIndex,
  previewIndex,
  importance,
  activeTab,
  projects,
  tabFilters,
}) => {
  const { isActive, onClick } = useProjectCardClick(item, projects);
  const icon = getFilterIcon(tabFilters, activeTab);
  const isLessImportant = importance === "less-important";

  return (
    <MotionLink
      href={(item.url ?? "#") as Route}
      target="_blank"
      rel="noreferrer"
      custom={displayIndex}
      {...MOTION_ITEM_PROPS}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col rounded-3xl border border-border/60 bg-card/40 p-3 transition-all duration-300 ease-out hover:border-border hover:bg-muted/30",
        isLessImportant && "opacity-90 hover:opacity-100",
        isActive && "pointer-events-none opacity-50!",
      )}
    >
      <Frame
        variant="inverse"
        className="rounded-2xl transition-transform duration-500 ease-out group-hover:-translate-y-0.5"
      >
        <div className="border-border/50 bg-muted/20 relative overflow-hidden rounded-[16px]! border">
          <CustomImage
            src={item.mainImage?.image as string}
            ogUrl={item.url as string}
            alt={item.name as string}
            unoptimized
            className="size-auto object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </div>
      </Frame>

      <div className="flex flex-col gap-3 px-2 pt-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Reicon
              name={icon}
              className="text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-colors"
            />
            <h3 className="group-hover:text-primary font-serif text-xl font-normal tracking-tight transition-colors">
              {item.name}
            </h3>
          </div>

          <span className="text-muted-foreground shrink-0 font-mono text-xs">
            {formatDate(item.date as string)}
          </span>
        </div>

        <div className="text-muted-foreground text-sm leading-relaxed font-light">
          <InlineMarkdown>{item.description}</InlineMarkdown>
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {item.tags.map((badge) => (
              <Badge
                key={badge}
                variant="secondary"
                className="text-muted-foreground text-[11px] font-normal"
              >
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </MotionLink>
  );
};

const GRID_LAYOUTS = [
  { columns: 1, className: "group/list flex flex-col gap-5 md:hidden" },
  {
    columns: 2,
    className: "group/list hidden items-start gap-5 md:flex lg:hidden",
  },
  { columns: 3, className: "group/list hidden items-start gap-6 lg:flex" },
] as const;

const GridBlock: React.FC<{
  entries: AnnotatedProject[];
  projects: ProjectsListQueryResult;
  tabFilters: ProjectFiltersListQueryResult;
  activeTab?: string;
}> = ({ entries, projects, tabFilters, activeTab }) => {
  const items = React.useMemo(
    () => entries.map((entry) => entry.item),
    [entries],
  );

  return (
    <Container>
      {GRID_LAYOUTS.map(({ columns, className }) => {
        const columnsData = splitIntoColumns(items, columns);

        return (
          <div key={columns} className={className}>
            {columnsData.map((column, colIndex) => (
              <div
                key={colIndex}
                className={cn("flex flex-col gap-6", columns > 1 && "flex-1")}
              >
                {column.map(({ item, originalIndex: entryIndex }) => {
                  const entry = entries[entryIndex];
                  const importance =
                    entry?.importance ?? getProjectImportance(item);
                  const previewIndex = entry?.originalIndex ?? entryIndex;

                  return (
                    <ProjectGridItem
                      key={item.url ?? previewIndex}
                      item={item}
                      displayIndex={entryIndex}
                      previewIndex={previewIndex}
                      importance={importance}
                      projects={projects}
                      tabFilters={tabFilters}
                      activeTab={activeTab}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
    </Container>
  );
};

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  view = "list",
  projects,
  tabFilters,
  activeTab,
  isFiltered = false,
}) => {
  const { handleMouseLeave } = useImagePreview();

  // biome-ignore lint/correctness/useExhaustiveDependencies: just ignore
  React.useLayoutEffect(() => {
    handleMouseLeave();
  }, [view, handleMouseLeave]);

  const { important, lessImportant, combined } = React.useMemo(
    () => groupProjectsByImportance(projects),
    [projects],
  );

  const showSections =
    !isFiltered && important.length > 0 && lessImportant.length > 0;

  return (
    <AnimatePresence mode="popLayout">
      {view === "list" ? (
        showSections ? (
          <div className="flex flex-col gap-4">
            <section className="flex flex-col">
              <SectionHeader title="Important" count={important.length} />
              <div className="group/list flex flex-col">
                {important.map(({ item, originalIndex, importance }, index) => (
                  <ProjectListItem
                    key={item.url ?? originalIndex}
                    item={item}
                    displayIndex={index}
                    previewIndex={originalIndex}
                    importance={importance}
                    isLast={index === important.length - 1}
                    projects={projects}
                    tabFilters={tabFilters}
                    activeTab={activeTab}
                  />
                ))}
              </div>
            </section>

            <section className="flex flex-col">
              <SectionHeader
                title="Less Important"
                count={lessImportant.length}
              />
              <div className="group/list flex flex-col">
                {lessImportant.map(
                  ({ item, originalIndex, importance }, index) => (
                    <ProjectListItem
                      key={item.url ?? originalIndex}
                      item={item}
                      displayIndex={index}
                      previewIndex={originalIndex}
                      importance={importance}
                      isLast={index === lessImportant.length - 1}
                      projects={projects}
                      tabFilters={tabFilters}
                      activeTab={activeTab}
                    />
                  ),
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="group/list flex flex-col">
            {combined.map(({ item, originalIndex, importance }, index) => (
              <ProjectListItem
                key={item.url ?? originalIndex}
                item={item}
                displayIndex={index}
                previewIndex={originalIndex}
                importance={importance}
                isLast={index === combined.length - 1}
                projects={projects}
                tabFilters={tabFilters}
                activeTab={activeTab}
              />
            ))}
          </div>
        )
      ) : showSections ? (
        <div className="flex flex-col gap-12">
          <section className="flex flex-col gap-4">
            <SectionHeader title="Important" count={important.length} />
            <GridBlock
              entries={important}
              projects={projects}
              tabFilters={tabFilters}
              activeTab={activeTab}
            />
          </section>

          <section className="flex flex-col gap-4">
            <SectionHeader
              title="Less Important"
              count={lessImportant.length}
            />
            <GridBlock
              entries={lessImportant}
              projects={projects}
              tabFilters={tabFilters}
              activeTab={activeTab}
            />
          </section>
        </div>
      ) : (
        <GridBlock
          entries={combined}
          projects={projects}
          tabFilters={tabFilters}
          activeTab={activeTab}
        />
      )}
    </AnimatePresence>
  );
};
