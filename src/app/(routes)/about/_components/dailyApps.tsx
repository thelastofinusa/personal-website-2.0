"use client";

import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { Blend } from "reicon-react";
import { useSoundFx } from "@/components/provider/sound-fx";
import { Frame } from "@/components/reusable/reui/frame";
import { Badge } from "@/components/reusable/shadcn/badge";
import { buttonVariants } from "@/components/reusable/shadcn/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/reusable/shadcn/pagination";
import { CustomImage } from "@/components/shared/image";
import { Reicon } from "@/components/shared/reicon";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getPageItems } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import type { DailyAppListQueryResult } from "~/sanity.types";

// Rows of apps per page. The page size is `columns × ROWS_PER_PAGE`, so every
// full page ends on a complete row at any screen width.
const ROWS_PER_PAGE = 3;

// With this many pages or fewer, every page number is shown. Past it, the
// pager collapses the gaps into an ellipsis (e.g. `1 2 … 10`).
const PAGES_SHOWN_IN_FULL = 3;

export const DailyApps: React.FC<{ apps: DailyAppListQueryResult }> = ({
  apps,
}) => {
  const { play } = useSoundFx();
  // Matches the Tailwind `lg` breakpoint: hover drives the spotlight on desktop,
  // tapping does on mobile.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isSm = useMediaQuery("(min-width: 640px)");
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isXl = useMediaQuery("(min-width: 1280px)");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [page, setPage] = React.useState(1);

  if (!apps?.length) return null;

  // Keep in sync with the grid's `grid-cols-*` classes below
  const columns = isXl ? 5 : isLg ? 4 : isSm ? 6 : 5;
  const pageSize = columns * ROWS_PER_PAGE;
  const totalPages = Math.ceil(apps.length / pageSize);
  // Clamp: the page size changes on resize and the app list can change live
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageApps = apps.slice(pageStart, pageStart + pageSize);

  const activeApp = apps[activeIndex] ?? apps[0];

  const goToPage = (next: number) => {
    const target = Math.min(Math.max(next, 1), totalPages);
    if (target === currentPage) return;

    setPage(target);
    // Spotlight an app that's actually on the new page
    setActiveIndex((target - 1) * pageSize);
    play("select");
  };

  // Helper to render the correct icon type consistently
  const renderIcon = (app: DailyAppListQueryResult[number], className = "") => {
    if (app.logo?.type === "icon") {
      return (
        <Reicon
          name={app.logo.value}
          className={cn("text-muted-foreground", className)}
        />
      );
    }
    if (app.logo?.value) {
      return (
        <CustomImage
          width={64}
          height={64}
          src={app.logo.value as string}
          alt={app.name as string}
          className={cn("object-contain", className)}
          aria-hidden
        />
      );
    }
    return <Blend className={cn("text-muted-foreground", className)} />;
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
      <div className="lg:h-87.5">
        <Frame className="h-max! rounded-[28px]">
          <div className="relative flex min-h-44 w-full shrink-0 flex-col overflow-hidden rounded-3xl border bg-card lg:w-85">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeApp._id}
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex h-full flex-col rounded-[20px] bg-background/40 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Large Spotlight Icon */}
                  {renderIcon(
                    activeApp,
                    "size-18 transition-colors text-primary",
                  )}

                  <Badge variant="secondary" className="mt-1 font-medium">
                    {activeApp.category}
                  </Badge>
                </div>

                <div className="mt-4 flex flex-col gap-1 px-2">
                  <h3 className="font-semibold text-foreground text-xl tracking-tight">
                    {activeApp.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {activeApp.description}
                  </p>
                </div>

                {/* Action Button */}
                {activeApp.url && (
                  <motion.a
                    href={activeApp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({
                      className: "mt-6 inline-flex md:hidden",
                    })}
                    style={{
                      backgroundColor:
                        activeApp.button?.backgroundColor ?? "var(--primary)",
                      color:
                        activeApp.button?.textColor ??
                        "var(--primary-foreground)",
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-medium">
                      {activeApp.button?.label || "Launch App"}
                    </span>
                  </motion.a>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Frame>
      </div>

      <div className="flex flex-1 flex-col gap-6">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="grid h-max grid-cols-5 content-start gap-1 px-4 sm:grid-cols-6 sm:gap-3 sm:px-0 lg:grid-cols-4 xl:grid-cols-5"
        >
          {pageApps.map((app, i) => {
            const idx = pageStart + i;
            const isActive = idx === activeIndex;
            const isLink = Boolean(app.url);
            const Component = isLink ? "a" : "button";

            return (
              <Component
                key={app._id}
                {...(isLink
                  ? {
                      href: app.url as string,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }
                  : {
                      type: "button",
                    })}
                onClick={(e: React.MouseEvent) => {
                  if (!isDesktop) {
                    // Mobile: Prevent navigation, just show it in the spotlight
                    if (isLink) e.preventDefault();
                    setActiveIndex(idx);
                  } else if (!isLink) {
                    // Desktop (fallback): If no URL exists, still activate it on click
                    setActiveIndex(idx);
                  }
                }}
                onMouseEnter={() => {
                  // Desktop: Hover sets it active
                  setActiveIndex(idx);
                  play("hover");
                }}
                className={cn(
                  "group relative flex aspect-square w-full items-center justify-center outline-none",
                  isLink ? "cursor-pointer" : "cursor-default",
                )}
              >
                {/* Magic Sliding Focus Ring */}
                {isActive && (
                  <motion.div
                    layoutId="app-drawer-focus"
                    className="absolute inset-0 rounded-xl border-2 border-primary bg-primary/15 shadow-xs sm:rounded-2xl md:rounded-[20px]"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${
                        activeApp.button?.backgroundColor ?? "var(--primary)"
                      } 15%, transparent)`,

                      borderColor:
                        activeApp.button?.backgroundColor ?? "var(--primary)",
                    }}
                    transition={{
                      type: "spring",
                      bounce: 0.25,
                      duration: 0.5,
                      stiffness: 350,
                      damping: 28,
                    }}
                  />
                )}

                {/* Base Button Background (shown when not active) */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl border border-transparent transition-colors duration-300 sm:rounded-2xl md:rounded-[20px]",
                    !isActive &&
                      "border-border bg-card hover:bg-muted/50 group-focus-visible:ring-2 group-focus-visible:ring-primary",
                  )}
                />

                {/* Icon Container */}
                <div
                  className={cn(
                    "relative z-10 flex size-full items-center justify-center transition-transform duration-300",
                    isActive ? "scale-110" : "group-hover:scale-110",
                  )}
                >
                  {renderIcon(
                    app,
                    cn(
                      "size-10 transition-colors duration-300 sm:size-14",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground",
                    ),
                  )}
                </div>
              </Component>
            );
          })}
        </motion.div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  text="Prev"
                  aria-disabled={currentPage === 1}
                  tabIndex={currentPage === 1 ? -1 : undefined}
                  className={cn(
                    currentPage === 1 && "pointer-events-none opacity-50",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    goToPage(currentPage - 1);
                  }}
                />
              </PaginationItem>

              {getPageItems(currentPage, totalPages, {
                showAllUpTo: PAGES_SHOWN_IN_FULL,
              }).map((item) => (
                <PaginationItem key={item}>
                  {typeof item === "number" ? (
                    <PaginationLink
                      href="#"
                      isActive={item === currentPage}
                      aria-label={`Go to page ${item}`}
                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(item);
                      }}
                    >
                      {item}
                    </PaginationLink>
                  ) : (
                    <PaginationEllipsis />
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  text="Next"
                  aria-disabled={currentPage === totalPages}
                  tabIndex={currentPage === totalPages ? -1 : undefined}
                  className={cn(
                    currentPage === totalPages &&
                      "pointer-events-none opacity-50",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    goToPage(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};
