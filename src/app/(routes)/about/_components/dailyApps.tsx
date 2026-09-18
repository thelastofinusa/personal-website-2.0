"use client";

import { cn } from "cn";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { Blend } from "reicon-react";
import { Frame } from "@/components/reusable/reui/frame";
import { Badge } from "@/components/reusable/shadcn/badge";
import { buttonVariants } from "@/components/reusable/shadcn/button";
import { CustomImage } from "@/components/shared/image";
import { Reicon } from "@/components/shared/reicon";
import type { DailyAppListQueryResult } from "~/sanity.types";

export const DailyApps: React.FC<{ apps: DailyAppListQueryResult }> = ({
  apps,
}) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  if (!apps?.length) return null;

  const activeApp = apps[activeIndex];

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
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 lg:items-stretch">
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
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {activeApp.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
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

      <div className="grid h-max flex-1 content-start grid-cols-5 gap-1 sm:gap-3 px-4 sm:grid-cols-6 sm:px-0 lg:grid-cols-4 xl:grid-cols-5">
        {apps.map((app, idx) => {
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
                // Match the Tailwind `lg` breakpoint (1024px) for desktop vs mobile behavior
                const isDesktop = window.innerWidth >= 1024;

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
              }}
              className={cn(
                "group relative flex w-full items-center justify-center outline-none aspect-square",
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
      </div>
    </div>
  );
};
