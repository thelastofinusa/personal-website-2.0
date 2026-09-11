/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
"use client";

import { differenceInMonths } from "date-fns";
import { InfinityIcon } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import type { ComponentProps } from "react";
import { useCallback, useRef, useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/components/reusable/shadcn/collapsible";
import { Separator } from "@/components/reusable/shadcn/separator";
import { FadeLine } from "@/components/shared/fade-line";
import { LocalImg } from "@/components/shared/image";
import { PortableText } from "@/components/shared/portable-text";
import { Reicon } from "@/components/shared/reicon";
import { workItemVariants } from "@/constants/variants";
import { cn } from "@/lib/utils";
import type { TimelineListQueryResult } from "~/sanity.types";
import type { ChevronsUpDownIconHandle } from "./chevrons-up-down-icon";
import { ChevronsUpDownIcon } from "./chevrons-up-down-icon";

export type TimelineProps = {
  className?: string;
  items: TimelineListQueryResult;
};

export function Timeline({ className, items }: TimelineProps) {
  return (
    <div className={cn(className)}>
      <AnimatePresence mode="popLayout">
        {items.map((group, index) => {
          const isLast = index === items.length - 1;
          return (
            <motion.div
              key={group._id}
              custom={index}
              variants={workItemVariants}
              initial="hidden"
              whileInView="visible"
              exit="exit"
              layout
              viewport={{ once: true, margin: "-50px" }}
              className="relative"
            >
              <TimelineGroup group={group} />
              {!isLast && (
                <FadeLine orientation="horizontal" className="relative" />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export type TimelineGroupProps = {
  group: TimelineListQueryResult[number];
};

export function TimelineGroup({ group }: TimelineGroupProps) {
  const items = group.items ?? [];
  const isEdu = group.category === "education";

  return (
    <div className="grid grid-cols-1 gap-4 py-8 md:grid-cols-[220px_1fr] md:gap-12 lg:grid-cols-[260px_1fr]">
      {/* LEFT COLUMN: Organization Info (Sticky on scroll) */}
      <div className="flex-1 h-max">
        <div className="flex items-center gap-2">
          {group.logo ? (
            <LocalImg
              width={16}
              height={16}
              src={group.logo}
              alt={group.organization ?? ""}
              className="size-4 object-contain"
              aria-hidden
            />
          ) : (
            <span className="rounded-md size-4 bg-secondary" />
          )}
          <h3 className="text-sm font-normal leading-snug text-foreground">
            {group.website ? (
              <a
                className="link-underline transition-colors hover:text-primary"
                href={group.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {group.organization}
              </a>
            ) : (
              <span>{group.organization}</span>
            )}
          </h3>
          {group.isCurrent && (
            <span className="relative flex size-2.5 ml-4 items-center justify-center">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative flex size-2 rounded-full bg-primary" />
            </span>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Items Stream with Left Threading */}
      <div className="group relative flex flex-col space-y-8">
        {items.map((item) => (
          <motion.div key={item._key} layout className="relative">
            <TimelineItem
              item={item}
              isCurrent={Boolean(group.isCurrent)}
              isEdu={isEdu}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

type TimelineGroup = TimelineListQueryResult[number];
type TimelineItem = NonNullable<TimelineGroup["items"]>[number];

export type TimelineItemProps = {
  item: TimelineItem;
  isCurrent: boolean;
  isEdu: boolean;
};

export function TimelineItem({ item, isCurrent, isEdu }: TimelineItemProps) {
  const [isOpen, setIsOpen] = useState(item.isExpanded ?? false);
  const [isHovered, setIsHovered] = useState(false);
  const chevronsUpDownIconRef = useRef<ChevronsUpDownIconHandle>(null);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    const controls = chevronsUpDownIconRef.current;
    if (!controls) return;

    if (open) {
      controls.startAnimation();
    } else {
      controls.stopAnimation();
    }
  }, []);

  const start = item.period?.start;
  const end = item.period?.end;
  const isOngoing = !end;
  const duration = formatDuration(start, end);

  // Current animation state
  const state = isOpen ? "expanded" : isHovered ? "hover" : "idle";

  // Animation variants
  const node1Variants: Variants = {
    idle: {
      backgroundColor: "var(--background)",
      borderColor: "var(--border)",
    },
    hover: {
      backgroundColor: isOpen ? "var(--primary)" : "var(--foreground)",
      borderColor: isOpen ? "var(--primary)" : "var(--foreground)",
      transition: { duration: 0.15, delay: 0 },
    },
    expanded: {
      backgroundColor: isOpen ? "var(--primary)" : "var(--foreground)",
      borderColor: isOpen ? "var(--primary)" : "var(--foreground)",
      transition: { duration: 0.15, delay: 0 },
    },
  };

  const lineVariants: Variants = {
    idle: {
      scaleY: 0,
      opacity: 0,
    },
    hover: {
      scaleY: 0,
      opacity: 0,
    },
    expanded: {
      scaleY: 1,
      opacity: 1,
      backgroundColor: isOpen ? "var(--primary)" : "var(--foreground)",
      transition: {
        scaleY: { duration: 0.3, delay: 0.12, ease: "easeInOut" },
        opacity: { duration: 0.01, delay: 0.12 },
      },
    },
  };

  const node2Variants: Variants = {
    idle: {
      backgroundColor: "var(--background)",
      borderColor: "var(--border)",
    },
    hover: {
      backgroundColor: isOpen ? "var(--primary)" : "var(--foreground)",
      borderColor: isOpen ? "var(--primary)" : "var(--foreground)",
      transition: { duration: 0.15, delay: 0.1 },
    },
    expanded: {
      backgroundColor: isOpen ? "var(--primary)" : "var(--foreground)",
      borderColor: isOpen ? "var(--primary)" : "var(--foreground)",
      transition: { duration: 0.15, delay: 0.4 },
    },
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleOpenChange}
      disabled={!item.description}
      render={
        <div
          className="group/timeline-item pl-8 md:pl-6 -mx-3"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative">
            {/* First Node */}
            <motion.span
              variants={node1Variants}
              animate={state}
              className={cn(
                "absolute size-3 -left-4.5 md:-left-6 z-10 top-4.25 border bg-background",
                isEdu ? "rounded-xs rotate-45 scale-90" : "rounded-full",
              )}
            />

            {/* Second Node */}
            <motion.span
              variants={node2Variants}
              animate={state}
              className={cn(
                "absolute size-3 -left-4.5 md:-left-6 z-10 -bottom-4.75 border bg-background",
                isEdu ? "rounded-xs rotate-45 scale-90" : "rounded-full",
              )}
            />

            {/* Default Thread Line */}
            <span className="absolute w-px bg-border top-4.5 -bottom-4.75 left-[-12.5px] md:left-[-18.5px]" />

            {/* Animated Connection Line */}
            <motion.span
              variants={lineVariants}
              animate={state}
              className="absolute w-px top-4.5 -bottom-4.75 left-[-12.5px] md:left-[-18.5px] origin-top rounded-full"
            />

            <CollapsibleTrigger
              className={cn(
                "flex w-full select-none items-start -mt-3 p-3 gap-0! rounded-lg transition-all justify-between text-left outline-none",
                "data-disabled:cursor-default",
                item.description && "group-hover/timeline-item:bg-background",
              )}
            >
              {/* Title & Metadata */}
              <div className="flex-1 space-y-1.5">
                <h4
                  className={cn(
                    "flex items-center gap-2 text-base font-medium text-foreground transition-colors",
                    item.description &&
                      "group-hover/timeline-item:text-primary",
                  )}
                >
                  {item.icon && (
                    <span className="text-muted-foreground [&_svg]:size-4.5">
                      <Reicon
                        name={item.icon}
                        className="motion-safe:animate-bell-ring"
                      />
                    </span>
                  )}
                  {item.title}
                </h4>

                <dl className="flex flex-wrap items-center gap-2 text-xs font-normal text-muted-foreground sm:text-sm">
                  {start && (
                    <div>
                      <dt className="sr-only">Period</dt>
                      <dd className="flex items-center gap-1 text-xs tabular-nums">
                        <span>{formatPeriod(start)}</span>
                        <span className="text-muted">—</span>
                        {isOngoing ? (
                          <InfinityIcon
                            className="size-3.5 text-primary"
                            aria-label="Present"
                          />
                        ) : (
                          <span>{formatPeriod(end)}</span>
                        )}
                      </dd>
                    </div>
                  )}

                  {duration && (
                    <>
                      <Separator
                        className="data-vertical:h-2 data-vertical:self-center"
                        orientation="vertical"
                      />
                      <div>
                        <dt className="sr-only">Duration</dt>
                        <dd className="text-xs tabular-nums">
                          {duration} {!isCurrent && "ago"}
                        </dd>
                      </div>
                    </>
                  )}

                  {item.type && (
                    <>
                      <Separator
                        className="data-vertical:h-2 data-vertical:self-center"
                        orientation="vertical"
                      />
                      <div>
                        <dt className="sr-only">Type</dt>
                        <dd className="text-xs">{item.type}</dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>

              {/* Expand Chevron Icon */}
              {item.description && (
                <div className="mt-1 shrink-0 text-muted-foreground transition-colors group-hover/timeline-item:text-foreground group-disabled/timeline-item:hidden [&_svg]:h-lh [&_svg]:w-4">
                  <ChevronsUpDownIcon
                    ref={chevronsUpDownIconRef}
                    duration={0.15}
                  />
                </div>
              )}
            </CollapsibleTrigger>

            <AnimatePresence initial={false}>
              {isOpen && item.description && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden px-3"
                >
                  <Prose>
                    <PortableText value={item.description} />
                  </Prose>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {Array.isArray(item.skills) && item.skills.length > 0 && (
            <div className="px-3">
              <ul className="flex flex-wrap gap-x-1.5 gap-y-0.5">
                {item.skills.map((skill, index) => (
                  <li key={index}>
                    <Skill>{skill}</Skill>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(item.images) && item.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 px-3 pt-4">
              {item.images.map((item) => (
                <div key={item.url} className="overflow-hidden aspect-[1.5]">
                  <LocalImg
                    src={item.url as string}
                    alt={item.alt}
                    className="size-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      }
    />
  );
}

export function Prose({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "prose prose-ncdai max-w-none text-sm font-light text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function Skill({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function formatPeriod(date?: string | null): string {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function formatDuration(start?: string | null, end?: string | null): string {
  const startDate = parsePeriodDate(start);
  if (!startDate) return "";

  const endDate = end ? parsePeriodDate(end) : new Date();
  if (!endDate) return "";

  const totalMonths = differenceInMonths(endDate, startDate) + 1;
  if (totalMonths <= 0) return "";

  if (totalMonths < 12) return `${totalMonths} mo`;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (months === 0) return `${years} yr`;
  return `${years} yr ${months} mo`;
}

function parsePeriodDate(date?: string | null): Date | null {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}
