/** biome-ignore-all lint/suspicious/noArrayIndexKey: skipped */
/** biome-ignore-all lint/suspicious/useIterableCallbackReturn: skipped */
"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import React from "react";
import ReactMarkdown from "react-markdown";
import { SquareTopDown } from "reicon-react";
import remarkGfm from "remark-gfm";
import { tabFilters } from "@/constants/filters";
import { workItemVariants } from "@/constants/variants";
import { soundFx } from "@/lib/uisfx";
import { cn, formatDate } from "@/lib/utils";
import type { ISearchFilterProps } from "@/types";
import type { ProjectsListQueryResult } from "~/sanity.types";
import { useImagePreview } from "../provider/preview";
import { Frame } from "../reusable/reui/frame";
import { Container } from "./container";
import { FadeLine } from "./fade-line";
import { LocalImg } from "./image";

// 1. Shared Framer Motion animation configuration
const MOTION_ITEM_PROPS = {
  variants: workItemVariants,
  initial: "hidden" as const,
  whileInView: "visible" as const,
  exit: "exit" as const,
  layout: true,
  viewport: { once: true, margin: "-50px" },
};

// Create a motion-enhanced Link component
const MotionLink = motion(Link);

// 2. Extracted List Item Component (unchanged)
const ProjectListItem: React.FC<{
  item: ProjectsListQueryResult[0];
  index: number;
  isLast: boolean;
  activeTab?: string;
}> = ({ item, index, isLast, activeTab }) => {
  const { handleMouseEnter, handleMouseLeave } = useImagePreview();
  const Icon = tabFilters.find((filter) => filter.value === activeTab)?.icon;

  return (
    <motion.div
      key={item.url}
      custom={index}
      {...MOTION_ITEM_PROPS}
      className="group relative transition-all duration-500 ease-out hover:bg-muted dark:hover:bg-black"
    >
      <Container className="px-0!">
        <Link
          href={item.url as Route}
          target="_blank"
          rel="noreferrer"
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          onClick={() => soundFx.play("forward")}
        >
          <FadeLine orientation="horizontal" className="top-0" />
          {isLast && <FadeLine orientation="horizontal" className="bottom-0" />}

          <Container size="md" className="py-5 md:py-7">
            <div className="flex items-start justify-between gap-6 md:items-center">
              <div className="flex min-w-0 items-start gap-3 md:gap-4">
                {Icon && (
                  <Icon className="mt-1 md:mt-1.5 lg:mt-2 xl:mt-4 size-5" />
                )}
                <div className="flex flex-1 flex-col gap-1 md:gap-3">
                  <h1 className="font-serif text-2xl sm:text-3xl transition-[inherit] ease-[inherit] group-hover:text-primary md:text-4xl lg:text-5xl xl:text-6xl">
                    {item.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.date as string)}
                    </span>
                    <span className="text-xs text-muted-foreground">/</span>
                    {item.tags &&
                      item.tags?.length > 0 &&
                      item.tags.map((badge) => (
                        <span
                          key={badge}
                          className="rounded-full border bg-background px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary md:px-2.5 md:py-1"
                        >
                          {badge}
                        </span>
                      ))}
                  </div>

                  <div className="mt-1 text-sm font-light leading-relaxed text-muted-foreground lg:hidden">
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

              <div className="mt-1 flex shrink-0 items-center gap-4 md:mt-0">
                <div className="hidden max-w-xs text-right text-sm font-light leading-relaxed text-muted-foreground lg:block">
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
                <SquareTopDown
                  style={{
                    animationDelay: `${index * 1000}ms`,
                  }}
                  className="size-4 animate-bell-ring text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary"
                />
              </div>
            </div>
          </Container>
        </Link>
      </Container>
    </motion.div>
  );
};

// 3. Extracted Grid/Card Item Component – FIXED
const ProjectGridItem: React.FC<{
  item: ProjectsListQueryResult[0];
  index: number;
  activeTab?: string;
}> = ({ item, index, activeTab }) => {
  const Icon = tabFilters.find((filter) => filter.value === activeTab)?.icon;

  return (
    <MotionLink
      key={item.url}
      href={item.url as Route}
      target="_blank"
      rel="noreferrer"
      custom={index}
      {...MOTION_ITEM_PROPS}
      onClick={() => soundFx.play("forward")}
      className={cn(
        "group relative flex flex-col transition-all duration-500 ease-out",
      )}
    >
      <Frame variant="inverse" className="rounded-3xl">
        <div className="relative h-auto overflow-hidden rounded-[20px]! border">
          <LocalImg
            src={item.mainImage.image as string}
            ogUrl={item.url as string}
            alt={item.name as string}
            className="size-auto object-contain transition-all duration-500 ease-initial group-hover:scale-110"
          />

          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent px-6 pb-4 pt-16">
            <div className="flex flex-wrap items-center gap-2">
              {item.tags &&
                item.tags?.length > 0 &&
                item.tags.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-white px-2 py-0.5 text-[10px] uppercase tracking-wide text-white backdrop-blur-sm md:px-2.5 md:py-1"
                  >
                    {badge}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </Frame>

      <div className="flex flex-col gap-0.5 md:px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="mb-1.25 size-5" />}
            <p className="font-serif text-lg font-normal">{item.name}</p>
          </div>

          <p className="text-sm font-light">
            {formatDate(item.date as string)}
          </p>
        </div>

        <div className="text-sm font-extralight leading-relaxed text-muted-foreground">
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

// 4. Main View Component (unchanged)
export const ProjectsView: React.FC<{
  view?: ISearchFilterProps["view"];
  projects: ProjectsListQueryResult;
  activeTab?: string;
}> = ({ view = "list", projects, activeTab }) => {
  // Helper to split projects into columns for true Left-to-Right Masonry
  // We attach originalIndex so Framer Motion's staggered entrance doesn't break
  const cols2 = React.useMemo(() => {
    const cols: {
      item: ProjectsListQueryResult[0];
      originalIndex: number;
    }[][] = [[], []];
    projects.forEach((item, i) => cols[i % 2].push({ item, originalIndex: i }));
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
