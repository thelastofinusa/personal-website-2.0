/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
"use client";

import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} from "date-fns";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import type { ComponentProps } from "react";
import { useCallback, useRef, useState } from "react";
import { Blend, Infinite } from "reicon-react";
import { useSoundFx } from "@/components/provider/sound-fx";
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/components/reusable/shadcn/collapsible";
import { Separator } from "@/components/reusable/shadcn/separator";
import { FadeLine } from "@/components/shared/fade-line";
import { PortableText } from "@/components/shared/portable-text";
import { Reicon } from "@/components/shared/reicon";
import { getTimelineVariants, workItemVariants } from "@/constants/variants";
import { cn } from "@/lib/utils";
import type { TimelineListQueryResult } from "~/sanity.types";
import { LinkPreview } from "../aceternity/link-preview";
import { Frame } from "../reui/frame";
import { Badge } from "../shadcn/badge";
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
    <div className="grid grid-cols-1 gap-4 py-8 md:grid-cols-[220px_1fr] md:gap-12">
      {/* LEFT COLUMN: Organization Info (Sticky on scroll) */}
      <div className="flex-1 h-max">
        <div className="flex items-center gap-2">
          {group.logo?.type === "icon" ? (
            <Reicon
              name={group.logo.value}
              className="size-4.5 text-muted-foreground"
            />
          ) : group.logo?.value ? (
            <img
              src={group.logo.value}
              alt={group.organization ?? ""}
              width={20}
              height={20}
              className="size-4.5 object-contain"
              aria-hidden
            />
          ) : (
            <Blend className="size-4.5 text-muted-foreground" />
          )}
          <h3 className="text-sm font-normal leading-snug text-foreground">
            {group.website ? (
              <LinkPreview
                target="_blank"
                url={group.website}
                className="link-underline transition-colors hover:text-primary"
              >
                {group.organization}
              </LinkPreview>
            ) : (
              <span>{group.organization}</span>
            )}
          </h3>
          {group.isCurrent && (
            <span className="relative flex size-2.5 ml-2 items-center justify-center">
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
            <TimelineItem item={item} isEdu={isEdu} />
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
  isEdu: boolean;
};

export function TimelineItem({ item, isEdu }: TimelineItemProps) {
  const { play } = useSoundFx();
  const [isOpen, setIsOpen] = useState(item.isExpanded ?? false);
  const [isHovered, setIsHovered] = useState(false);
  const chevronsUpDownIconRef = useRef<ChevronsUpDownIconHandle>(null);

  const { lineVariants, node1Variants, node2Variants } =
    getTimelineVariants(isOpen);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      play(open ? "expand" : "collapse");
      const controls = chevronsUpDownIconRef.current;
      if (!controls) return;

      if (open) {
        controls.startAnimation();
      } else {
        controls.stopAnimation();
      }
    },
    [play],
  );

  const start = item.period?.start;
  const end = item.period?.end;
  const isOngoing = !end;
  const duration = formatDuration(start, end);

  // Current animation state
  const state = isOpen ? "expanded" : isHovered ? "hover" : "idle";

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
                "absolute size-2.5 -left-4.25 md:-left-5.75 z-10 top-4.25 border bg-background",
                isEdu ? "rounded-xs rotate-45 scale-90" : "rounded-full",
              )}
            />

            {/* Second Node */}
            <motion.span
              variants={node2Variants}
              animate={state}
              className={cn(
                "absolute size-2.5 -left-4.25 md:-left-5.75 z-10 -bottom-4.75 border bg-background",
                isEdu ? "rounded-xs rotate-45 scale-90" : "rounded-full",
              )}
            />

            {/* Default Thread Line */}
            <span className="absolute w-px bg-border top-5 -bottom-4.75 left-[-12.5px] md:left-[-18.5px]" />

            {/* Animated Connection Line */}
            <motion.span
              variants={lineVariants}
              animate={state}
              className="absolute w-px top-5 -bottom-4.75 left-[-12.5px] md:left-[-18.5px] origin-top rounded-full"
            />

            <CollapsibleTrigger
              className={cn(
                "flex w-full select-none items-start -mt-3 p-3 gap-0! rounded-lg transition-all justify-between text-left outline-none",
                "data-disabled:cursor-default",
                item.description && "group-hover/timeline-item:bg-background",
                isOpen && "bg-background",
              )}
            >
              {/* Title & Metadata */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  {item.icon && (
                    <span className="text-muted-foreground [&_svg]:size-4.5">
                      <Reicon
                        name={item.icon}
                        className="motion-safe:animate-bell-ring"
                      />
                    </span>
                  )}
                  <h3
                    className={cn(
                      "text-sm font-normal leading-snug text-foreground",
                      item.description &&
                        "group-hover/timeline-item:text-primary",
                      isOpen && "text-primary",
                    )}
                  >
                    {item.title}
                  </h3>
                </div>

                <dl className="flex flex-wrap items-center gap-2 text-xs font-normal text-muted-foreground sm:text-sm">
                  {start && (
                    <div>
                      <dt className="sr-only">Period</dt>
                      <dd className="flex items-center gap-1 text-xs tabular-nums">
                        <span>{formatPeriod(start)}</span>
                        <Separator
                          className="data-horizontal:w-2 data-horizontal:self-center"
                          orientation="horizontal"
                        />
                        {isOngoing ? (
                          <span className="flex items-center gap-1 5">
                            <Infinite className="size-4" aria-label="Present" />
                            <span>Till date</span>
                          </span>
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
                        <dd className="text-xs tabular-nums">{duration}</dd>
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
                <div
                  className={cn(
                    "mt-1 shrink-0 text-muted-foreground transition-colors group-disabled/timeline-item:hidden [&_svg]:h-lh [&_svg]:w-4",
                    "group-hover/timeline-item:text-foreground",
                    isOpen && "text-foreground",
                  )}
                >
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
                  <Prose className="pb-4 pt-3">
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
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-muted-foreground",
                        item.description &&
                          "group-hover/timeline-item:bg-primary/10 group-hover/timeline-item:text-primary",
                        isOpen && "bg-primary/10 text-primary",
                      )}
                    >
                      {skill}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interactive Animated Images Gallery */}
          {Array.isArray(item.images) && item.images.length > 0 && (
            <LayoutGroup>
              <div className="px-3 pt-3">
                <TimelineItemImages images={item.images} />
              </div>
            </LayoutGroup>
          )}
        </div>
      }
    />
  );
}

export type TimelineItemImagesProps = {
  images: NonNullable<TimelineItem["images"]>;
};

export function TimelineItemImages({ images }: TimelineItemImagesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { play } = useSoundFx();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    play(nextState ? "expand" : "collapse");
  };

  const stackPreviews = images.slice(0, 3);

  return (
    <div className="flex flex-col gap-3">
      {/* Toggle / Header Controls */}
      <button
        type="button"
        onClick={handleToggle}
        className="group/deck w-max outline-0 border-0 p-0 flex items-center gap-3 cursor-pointer select-none"
      >
        {/* Deck Container stays permanently mounted */}
        <div className="relative h-5 w-7 ml-2 shrink-0">
          {stackPreviews.map((img, idx) => (
            <div
              key={img.url ?? idx}
              className={cn(
                "absolute inset-0 rounded-[4px] border border-border/60 bg-background shadow-2xs transition-transform duration-300 ease-out",
                idx === 0 &&
                  "z-30 group-hover/deck:-rotate-6 group-hover/deck:-translate-x-1.5",
                idx === 1 &&
                  "z-20 rotate-6 scale-95 opacity-80 group-hover/deck:rotate-12 group-hover/deck:translate-x-1.5",
                idx === 2 &&
                  "z-10 -rotate-3 scale-90 opacity-60 group-hover/deck:-rotate-12 group-hover/deck:-translate-x-3",
              )}
            >
              {/* Image card sits in stack slot when collapsed */}
              {!isExpanded && (
                <motion.div
                  layoutId={`gallery-img-${img.url ?? idx}`}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="size-full overflow-hidden rounded-[3px] bg-card"
                >
                  <img
                    src={img.url as string}
                    alt={img.alt ?? ""}
                    className="size-full object-cover"
                  />
                </motion.div>
              )}
            </div>
          ))}
        </div>

        <span className="text-xs font-mono text-muted-foreground transition-colors group-hover/deck:text-foreground">
          {isExpanded ? "$ cd .." : `$ cd gallery (${images.length})`}
        </span>
      </button>

      {/* Morphing Expanded Grid View */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "grid gap-2.5",
                images.length > 2
                  ? "grid-cols-2 sm:grid-cols-4"
                  : images.length === 2
                    ? "grid-cols-2 sm:grid-cols-3"
                    : "grid-cols-2",
              )}
            >
              {images.map((image, idx) => (
                <motion.div
                  key={image.url ?? idx}
                  layoutId={`gallery-img-${image.url ?? idx}`}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 28,
                    delay: isExpanded ? idx * 0.03 : 0,
                  }}
                  className="relative"
                >
                  <Frame
                    className="rounded-lg p-0.5 transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/5"
                    variant="inverse"
                  >
                    <div className="aspect-[1.5] overflow-hidden rounded-sm border bg-card">
                      <img
                        src={image.url as string}
                        alt={image.alt}
                        className="size-full object-cover"
                      />
                    </div>
                  </Frame>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Prose({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "prose prose-ncdai max-w-none text-[15px] font-light text-foreground",
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
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function formatDuration(
  start?: string | null,

  end?: string | null,
): string {
  const startDate = parsePeriodDate(start);

  if (!startDate) return "";

  const endDate = end ? parsePeriodDate(end) : new Date();

  if (!endDate) return "";

  if (endDate < startDate) return "";

  const totalDays = differenceInDays(endDate, startDate);

  // Less than a week

  if (totalDays < 7) {
    return `${totalDays || 1} ${totalDays === 1 ? "day" : "days"}`;
  }

  // Less than a month

  if (totalDays < 30) {
    const weeks = Math.floor(totalDays / 7);

    return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
  }

  // Less than a year

  const totalMonths = differenceInMonths(endDate, startDate);

  if (totalMonths < 12) {
    return `${totalMonths} ${totalMonths === 1 ? "mo" : "mos"}`;
  }

  // One year or more

  const years = differenceInYears(endDate, startDate);

  const remainingMonths = differenceInMonths(endDate, startDate) % 12;

  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? "yr" : "yrs"}`;
  }

  return `${years} ${years === 1 ? "yr" : "yrs"} ${remainingMonths} ${
    remainingMonths === 1 ? "mo" : "mos"
  }`;
}

function parsePeriodDate(date?: string | null): Date | null {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}
