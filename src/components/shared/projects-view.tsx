/** biome-ignore-all lint/suspicious/noArrayIndexKey: skipped */
/** biome-ignore-all lint/suspicious/useIterableCallbackReturn: skipped */
"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { workItemVariants } from "@/constants/variants";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn, formatDate } from "@/lib/utils";
import type { ISearchFilterProps } from "@/types";
import type {
  ProjectFiltersListQueryResult,
  ProjectsListQueryResult,
} from "~/sanity.types";
import { useLivePreview } from "../provider/live-preview";
import { useImagePreview } from "../provider/preview";
import { Frame } from "../reusable/reui/frame";
import { Container } from "./container";
import { FadeLine } from "./fade-line";
import { LocalImg } from "./image";
import { Reicon } from "./reicon";

// 1. Shared Framer Motion animation configuration
const MOTION_ITEM_PROPS = {
  variants: workItemVariants,
  initial: "hidden" as const,
  whileInView: "visible" as const,
  exit: "exit" as const,
  layout: true,
  viewport: { once: true, margin: "-50px" },
};

const MotionLink = motion.create(Link);

// 2. Extracted List Item Component
const ProjectListItem: React.FC<{
  item: ProjectsListQueryResult[0];
  index: number;
  isLast: boolean;
  activeTab?: string;
  projects: ProjectsListQueryResult;
  tabFilters: ProjectFiltersListQueryResult;
}> = ({ item, index, isLast, activeTab, projects, tabFilters }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { openPreview, currentProject } = useLivePreview();
  const { handleMouseEnter, handleMouseLeave } = useImagePreview();
  const icon = tabFilters.find((filter) => filter.slug === activeTab)?.icon;
  const isActive = currentProject?.url === item.url;

  // Format index as 01, 02, 03...
  const formattedIndex = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      key={item.url}
      custom={index}
      {...MOTION_ITEM_PROPS}
      onClick={(event) => {
        if (isActive) {
          event.preventDefault();
          return;
        }
        if (isDesktop) {
          event.preventDefault();
          openPreview(
            item,
            event.currentTarget.getBoundingClientRect(),
            projects,
          );
        }
      }}
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
          onClick={(e) => isActive && e.preventDefault()}
        >
          <FadeLine orientation="horizontal" className="top-0" />
          {isLast && <FadeLine orientation="horizontal" className="bottom-0" />}

          <Container size="md" className="py-6 md:py-8">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center lg:gap-8">
              {/* Left Column: Index, Icon, Title & Tags */}
              <div className="flex items-start gap-4 lg:col-span-7 lg:items-center lg:gap-6">
                {/* Index + Icon Stack */}
                <div className="flex flex-col items-center gap-1 pt-1 lg:pt-0">
                  <span className="font-mono text-xs font-normal text-muted-foreground transition-colors group-hover:text-primary">
                    {formattedIndex}
                  </span>
                  <Reicon
                    name={icon}
                    className="size-4 text-muted-foreground transition-transform duration-300 group-hover:scale-110 group-hover:text-primary"
                  />
                </div>

                {/* Title & Micro Metadata */}
                <div className="flex flex-1 flex-col gap-2 transition-transform duration-300 ease-out lg:group-hover:translate-x-2">
                  <h1 className="font-serif text-3xl font-light tracking-tight transition-colors duration-300 group-hover:text-primary md:text-4xl lg:text-5xl">
                    {item.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground/70">
                      {formatDate(item.date as string)}
                    </span>

                    {item.tags && item.tags.length > 0 && (
                      <>
                        <span className="text-xs text-muted-foreground/30">
                          •
                        </span>
                        {item.tags.map((badge) => (
                          <span
                            key={badge}
                            className="rounded-md bg-muted/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary"
                          >
                            {badge}
                          </span>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Mobile Description */}
                  <div className="mt-2 text-sm font-light leading-relaxed text-muted-foreground/80 lg:hidden">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <>{children}</>,
                        strong: ({ children }) => (
                          <strong className="font-medium text-foreground">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => <em>{children}</em>,
                        a: ({ children, href }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-4 transition-colors hover:text-primary"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {item.description}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Right Column: Desktop Description & Trailing Indicator */}
              <div className="hidden lg:col-span-5 lg:flex lg:items-center lg:justify-between lg:gap-6">
                <div className="text-right text-sm font-light leading-relaxed text-muted-foreground/80 transition-colors duration-300 group-hover:text-foreground">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <>{children}</>,
                      strong: ({ children }) => (
                        <strong className="font-medium text-foreground">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => <em>{children}</em>,
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-4 transition-colors hover:text-primary"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {item.description}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </Container>
        </Link>
      </Container>
    </motion.div>
  );
};

// 3. Extracted Grid/Card Item Component
const ProjectGridItem: React.FC<{
  item: ProjectsListQueryResult[0];
  index: number;
  activeTab?: string;
  projects: ProjectsListQueryResult;
  tabFilters: ProjectFiltersListQueryResult;
}> = ({ item, index, activeTab, projects, tabFilters }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { openPreview, currentProject } = useLivePreview();
  const icon = tabFilters.find((filter) => filter.slug === activeTab)?.icon;
  const isActive = currentProject?.url === item.url;

  return (
    <MotionLink
      key={item.url}
      href={(item.url ?? "#") as Route}
      target="_blank"
      rel="noreferrer"
      custom={index}
      {...MOTION_ITEM_PROPS}
      onClick={(event) => {
        if (isActive) {
          event.preventDefault();
          return;
        }
        if (isDesktop) {
          event.preventDefault();
          openPreview(
            item,
            event.currentTarget.getBoundingClientRect(),
            projects,
          );
        }
      }}
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
          <LocalImg
            src={item.mainImage?.image as string}
            ogUrl={item.url as string}
            alt={item.name as string}
            unoptimized
            className="size-auto object-contain transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Gradient Overlay with Glassmorphic Badges */}
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/30 to-transparent px-5 pb-4 pt-12">
            <div className="flex flex-wrap items-center gap-1.5">
              {item.tags &&
                item.tags?.length > 0 &&
                item.tags.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-white/20 bg-black/40 px-2.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wider text-white/90 backdrop-blur-md transition-colors duration-300 group-hover:border-white/40"
                  >
                    {badge}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </Frame>

      <div className="flex flex-col gap-0.5 px-4 md:px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Reicon name={icon} className="mb-1 size-4" />
            <p className="font-serif text-lg font-normal">{item.name}</p>
          </div>

          <p className="text-sm font-light">
            {formatDate(item.date as string)}
          </p>
        </div>

        <div className="text-[13px] font-extralight leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <>{children}</>,
              strong: ({ children }) => (
                <strong className="font-medium text-foreground">
                  {children}
                </strong>
              ),
              em: ({ children }) => <em>{children}</em>,
              a: ({ children, href }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 transition-colors hover:text-primary"
                  onClick={(event) => event.stopPropagation()}
                >
                  {children}
                </a>
              ),
            }}
          >
            {item.description}
          </ReactMarkdown>
        </div>
      </div>

      <FadeLine orientation="horizontal" className="mx-auto w-[85%] bottom-0" />
    </MotionLink>
  );
};

// 4. Main View Component
export const ProjectsView: React.FC<{
  view?: ISearchFilterProps["view"];
  projects: ProjectsListQueryResult;
  activeTab?: string;
  tabFilters: ProjectFiltersListQueryResult;
}> = ({ view = "list", projects, tabFilters, activeTab }) => {
  const { handleMouseLeave } = useImagePreview();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useLayoutEffect(() => {
    handleMouseLeave();
  }, [view, handleMouseLeave]);

  const cols2 = React.useMemo(() => {
    const cols: {
      item: ProjectsListQueryResult[0];
      originalIndex: number;
    }[][] = [[], []];

    projects.forEach((item, i) =>
      cols[i % 2].push({
        item,
        originalIndex: i,
      }),
    );

    return cols;
  }, [projects]);

  const cols3 = React.useMemo(() => {
    const cols: {
      item: ProjectsListQueryResult[0];
      originalIndex: number;
    }[][] = [[], [], []];
    projects.forEach((item, i) => cols[i % 3].push({ item, originalIndex: i }));
    return cols;
  }, [projects]);

  return (
    <AnimatePresence mode="popLayout">
      {view === "list" ? (
        <div className="flex flex-col group/list">
          {projects.map((item, index) => (
            <ProjectListItem
              key={item.url}
              item={item}
              index={index}
              isLast={index === projects.length - 1}
              activeTab={activeTab}
              projects={projects}
              tabFilters={tabFilters}
            />
          ))}
        </div>
      ) : (
        <Container>
          {/* MOBILE VIEW (1 Column) */}
          <div className="flex flex-col gap-6 md:hidden group/list">
            {projects.map((item, index) => (
              <ProjectGridItem
                key={item.url}
                item={item}
                index={index}
                activeTab={activeTab}
                projects={projects}
                tabFilters={tabFilters}
              />
            ))}
          </div>

          {/* TABLET VIEW (2 Columns) */}
          <div className="hidden md:flex lg:hidden items-start gap-4 group/list">
            {cols2.map((col, colIndex) => (
              <div key={colIndex} className="flex flex-1 flex-col gap-6">
                {col.map(({ item, originalIndex }) => (
                  <ProjectGridItem
                    key={item.url}
                    item={item}
                    index={originalIndex}
                    activeTab={activeTab}
                    projects={projects}
                    tabFilters={tabFilters}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW (3 Columns) */}
          <div className="hidden lg:flex items-start gap-4 group/list">
            {cols3.map((col, colIndex) => (
              <div key={colIndex} className="flex flex-1 flex-col gap-6">
                {col.map(({ item, originalIndex }) => (
                  <ProjectGridItem
                    key={item.url}
                    item={item}
                    index={originalIndex}
                    activeTab={activeTab}
                    projects={projects}
                    tabFilters={tabFilters}
                  />
                ))}
              </div>
            ))}
          </div>
        </Container>
      )}
    </AnimatePresence>
  );
};
