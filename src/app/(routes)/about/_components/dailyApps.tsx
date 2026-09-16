"use client";

import { cn } from "cn";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { Blend } from "reicon-react";
import { Frame } from "@/components/reusable/reui/frame";
import { Badge } from "@/components/reusable/shadcn/badge";
import { buttonVariants } from "@/components/reusable/shadcn/button";
import { LocalImg } from "@/components/shared/image";
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
        <LocalImg
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
      <Frame className="rounded-[28px] h-max">
        <div className="relative rounded-3xl h-max bg-card min-h-55 flex w-full shrink-0 flex-col overflow-hidden border lg:w-85">
          <div className="relative z-10 flex h-full flex-col justify-between rounded-[20px] bg-background/40 p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeApp._id}
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex h-full flex-col"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Large Spotlight Icon */}
                  {renderIcon(activeApp, "transition-colors text-primary")}

                  <Badge
                    variant="secondary"
                    className="bg-muted/50 text-[10px] font-medium mt-1"
                  >
                    {activeApp.category}
                  </Badge>
                </div>

                <div className="mt-6 flex flex-col gap-1 px-2">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {activeApp.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {activeApp.description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Action Button */}
            {activeApp.url ? (
              <motion.a
                href={activeApp.url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ className: "mt-6" })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Launch App
              </motion.a>
            ) : (
              <div className="mt-6 h-10" />
            )}
          </div>
        </div>
      </Frame>

      <div className="grid h-max flex-1 grid-cols-4 content-start gap-3 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5">
        {apps.map((app, idx) => {
          const isActive = idx === activeIndex;

          return (
            <button
              key={app._id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              onMouseEnter={() => setActiveIndex(idx)}
              className="group relative flex aspect-square w-full items-center justify-center outline-none"
            >
              {/* Magic Sliding Focus Ring */}
              {isActive && (
                <motion.div
                  layoutId="app-drawer-focus"
                  className="absolute inset-0 rounded-[20px] border-2 border-primary/20 bg-primary/5 shadow-xs"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}

              {/* Base Button Background (shown when not active) */}
              <div
                className={cn(
                  "absolute inset-0 rounded-[20px] border border-border/40 transition-colors duration-300",
                  !isActive &&
                    "bg-card hover:bg-muted/50 group-focus-visible:ring-2 group-focus-visible:ring-primary",
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
                    "transition-colors duration-300",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  ),
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
