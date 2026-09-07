// initially work experience

import { differenceInMonths } from "date-fns";
import { InfinityIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ComponentProps } from "react";
import { useCallback, useRef } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/reusable/shadcn/collapsible";
import { Separator } from "@/components/reusable/shadcn/separator";
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
        {items.map((group, index) => (
          <motion.div
            key={group._id}
            custom={index}
            variants={workItemVariants}
            initial="hidden"
            whileInView="visible"
            exit="exit"
            layout
            viewport={{ once: true, margin: "-50px" }}
          >
            <TimelineGroup group={group} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export type TimelineGroupProps = {
  group: TimelineListQueryResult[number];
};

export function TimelineGroup({ group }: TimelineGroupProps) {
  const items = group.items ?? [];

  return (
    <div className="space-y-4 py-4">
      <div className="not-prose flex items-center gap-3">
        <div className="ml-1 flex size-5 shrink-0 items-center justify-center backdrop-blur-md">
          {group.logo ? (
            <LocalImg
              src={group.logo}
              alt={group.organization ?? ""}
              className="size-5 rounded-sm border object-cover"
              aria-hidden
            />
          ) : (
            <span className="size-5 rounded-sm border bg-muted" />
          )}
        </div>

        <h3 className="mt-px text-sm font-normal uppercase leading-snug text-primary">
          {group.website ? (
            <a
              className="link underline"
              href={group.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {group.organization}
            </a>
          ) : (
            group.organization
          )}
        </h3>

        {group.isCurrent && (
          <span className="relative flex items-center justify-center">
            <span className="absolute inline-flex size-3 animate-ping rounded-full bg-primary opacity-50" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
        )}
      </div>

      <div className="relative space-y-4 before:absolute before:left-3 before:h-full before:w-px before:bg-border">
        {items.map((item, index) => (
          <motion.div key={item._key} layout>
            <TimelineItem item={item} isLast={index === items.length - 1} />
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
  isLast?: boolean;
};

export function TimelineItem({ item, isLast }: TimelineItemProps) {
  const chevronsUpDownIconRef = useRef<ChevronsUpDownIconHandle>(null);

  const handleOpenChange = useCallback((open: boolean) => {
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
        <div className="relative last:before:absolute last:before:h-full last:before:w-4 last:before:bg-transparent">
          <CollapsibleTrigger
            className={cn(
              "group/timeline-item not-prose block w-full select-none text-left",
              "relative before:absolute before:-right-1 before:-bottom-1.5 before:-left-7 before:-top-1 before:rounded-lg hover:before:bg-muted/60",
              "data-disabled:before:content-none",
            )}
          >
            <div className="relative z-1 flex items-start gap-3 text-base md:mb-1">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-sm",
                  "bg-muted text-muted-foreground",
                  "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                )}
              >
                <Reicon name={item.icon ?? ""} />
              </div>

              <h4 className="mt-0.5 flex-1 text-balance text-base font-normal">
                {item.title}
              </h4>

              <div className="shrink-0 text-muted-foreground group-disabled/timeline-item:hidden [&_svg]:h-lh [&_svg]:w-4">
                <ChevronsUpDownIcon
                  ref={chevronsUpDownIconRef}
                  duration={0.15}
                />
              </div>
            </div>

            <dl className="relative z-1 flex items-center gap-2 pl-10 text-xs font-light text-muted-foreground sm:text-sm">
              {item.type && (
                <>
                  <div>
                    <dt className="sr-only">Type</dt>
                    <dd>{item.type}</dd>
                  </div>

                  <Separator
                    className="data-vertical:h-4 data-vertical:self-center"
                    orientation="vertical"
                  />
                </>
              )}

              {start && (
                <div>
                  <dt className="sr-only">Period</dt>

                  <dd className="flex items-center gap-0.5 tabular-nums">
                    <span>{formatPeriod(start)}</span>

                    <span className="font-mono">—</span>

                    {isOngoing ? (
                      <InfinityIcon
                        className="size-4.5 translate-y-[0.5px]"
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
                    className="data-vertical:h-4 data-vertical:self-center"
                    orientation="vertical"
                  />

                  <div>
                    <dt className="sr-only">Duration</dt>
                    <dd className="tabular-nums">{duration}</dd>
                  </div>
                </>
              )}
            </dl>
          </CollapsibleTrigger>

          <CollapsibleContent className="overflow-hidden">
            {item.description && (
              <Prose className="pl-9 pt-2">
                <PortableText value={item.description} />
              </Prose>
            )}
          </CollapsibleContent>

          {Array.isArray(item.skills) && item.skills.length > 0 && (
            <ul
              className={cn(
                "relative not-prose flex flex-wrap gap-1.5 pl-9 pt-3",
                // Connector line
                "before:absolute before:left-3 before:top-0 before:h-6 before:w-4",
                "before:rounded-bl-lg before:border-b before:border-l before:border-border",

                // Mask the main vertical line after the curve
                isLast &&
                  "after:absolute after:left-3 after:top-4 after:-bottom-2 after:w-px after:bg-card",
              )}
            >
              {item.skills.map((skill, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: ignore
                <li key={index} className="relative z-10 flex">
                  <Skill>{skill}</Skill>
                </li>
              ))}
            </ul>
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
        "prose prose-ncdai prose-zinc max-w-none text-sm font-light dark:prose-invert md:text-base",
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
        "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground backdrop-blur-sm md:px-2.5 md:py-1",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Convert Sanity's date value:
 *
 * "2022-08-01" → "08/2022"
 */
function formatPeriod(date?: string | null): string {
  if (!date) return "";

  const parsed = new Date(`${date}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

/**
 * Calculate the duration between two Sanity dates.
 *
 * "2022-08-01" → "2024-02-01"
 * becomes:
 *
 * "1y 7m"
 *
 * If there is no end date, the current date is used.
 */
function formatDuration(start?: string | null, end?: string | null): string {
  const startDate = parsePeriodDate(start);

  if (!startDate) {
    return "";
  }

  const endDate = end ? parsePeriodDate(end) : new Date();

  if (!endDate) {
    return "";
  }

  const totalMonths = differenceInMonths(endDate, startDate) + 1;

  if (totalMonths <= 0) {
    return "";
  }

  if (totalMonths < 12) {
    return `${totalMonths}m`;
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (months === 0) {
    return `${years}y`;
  }

  return `${years}y ${months}m`;
}

function parsePeriodDate(date?: string | null): Date | null {
  if (!date) {
    return null;
  }

  const parsed = new Date(`${date}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}
