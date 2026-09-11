/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import { differenceInMonths } from "date-fns";
import { InfinityIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ComponentProps } from "react";
import { useCallback, useRef, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
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
                <FadeLine orientation="horizontal" className="bottom-0" />
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
    <div className="grid grid-cols-1 gap-8 py-8 md:grid-cols-[220px_1fr] md:gap-12 lg:grid-cols-[260px_1fr]">
      {/* LEFT COLUMN: Organization Info (Sticky on scroll) */}
      <div className="flex-1 h-max pt-3">
        <div className="flex items-center gap-2">
          {group.logo && (
            <LocalImg
              width={16}
              height={16}
              src={group.logo}
              alt={group.organization ?? ""}
              className="size-4 object-contain"
              aria-hidden
            />
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
            <>
              <span className="text-border/60">•</span>
              <span className="relative flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary">
                <span className="relative flex size-2.5 items-center justify-center">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative flex size-2 rounded-full bg-primary" />
                </span>
                PRESENT
              </span>
            </>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Items Stream with Left Threading */}
      <div className="group relative flex flex-col space-y-8 pl-4 before:absolute before:bottom-3 before:left-0 md:before:-left-2 before:top-7.5 before:w-px before:bg-border">
        {items.map((item, _index) => (
          <motion.div key={item._key} layout className="relative">
            {/* Text-free visual differentiation:
                - Experience: Circular node (rounded-full)
                - Education: Diamond/rotated square node (rounded-xs rotate-45) */}
            <span
              className={cn(
                "absolute -left-5.5 md:left-[-29.5px] top-4.5 size-3 border transition-colors bg-background",
                isEdu ? "rounded-xs rotate-45 scale-90" : "rounded-full",
                item.description && "group-hover:bg-primary",
              )}
            />
            <TimelineItem item={item} />
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
};

export function TimelineItem({ item }: TimelineItemProps) {
  const [isOpen, setIsOpen] = useState(item.isExpanded ?? false);
  const chevronsUpDownIconRef = useRef<ChevronsUpDownIconHandle>(null);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open); // Track state for Framer Motion
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

  return (
    <Collapsible
      defaultOpen={item.isExpanded ?? false}
      onOpenChange={handleOpenChange}
      disabled={!item.description}
      render={
        <div className="group/timeline-item -mx-3">
          <CollapsibleTrigger
            className={cn(
              "flex w-full select-none items-start p-3 gap-0! rounded-lg transition-all justify-between text-left outline-none",
              "data-disabled:cursor-default",
              item.description &&
                "group-hover/timeline-item:bg-muted/40 dark:group-hover/timeline-item:bg-muted/20",
            )}
          >
            {/* Title & Metadata */}
            <div className="flex-1 space-y-1.5">
              <h4
                className={cn(
                  "flex items-center gap-2 text-base font-medium text-foreground transition-colors",
                  item.description && "group-hover/timeline-item:text-primary",
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
              <div className="mt-1 shrink-0 text-muted-foreground transition-colors group-hover/timeline-item:text-foreground group-disabled/timeline-item:hidden [&_svg]:h-lh [&_svg]:w-4">
                <ChevronsUpDownIcon
                  ref={chevronsUpDownIconRef}
                  duration={0.15}
                />
              </div>
            )}
          </CollapsibleTrigger>

          <AnimatePresence initial={false}>
            {isOpen && (
              <CollapsibleContent
                render={
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden px-3"
                  >
                    {item.description && (
                      <Prose>
                        <PortableText value={item.description} />
                      </Prose>
                    )}
                  </motion.div>
                }
              />
            )}
          </AnimatePresence>

          {Array.isArray(item.skills) && item.skills.length > 0 && (
            <div className="px-3">
              <ul className="flex flex-wrap gap-1.5">
                {item.skills.map((skill, index) => (
                  <li key={index}>
                    <Skill>{skill}</Skill>
                  </li>
                ))}
              </ul>
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
