/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import { differenceInMonths } from "date-fns";
import { Briefcase, GraduationCap, InfinityIcon } from "lucide-react";
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
    <div className={cn("flex flex-col", className)}>
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
            className="border-b border-border/40 last:border-0"
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
  const isEdu = group.category === "education";

  return (
    <div className="grid grid-cols-1 gap-6 py-10 md:grid-cols-[220px_1fr] md:gap-12">
      {/* LEFT COLUMN: Organization Info */}
      <div className="flex flex-col items-start">
        {/* Raw Logo: No borders, no background, no border-radius */}
        {group.logo && (
          <LocalImg
            width={24}
            height={24}
            src={group.logo}
            alt={group.organization ?? ""}
            className="size-6 object-contain mb-4"
            aria-hidden
          />
        )}

        <h3 className="text-base font-normal leading-snug text-primary md:text-lg">
          {group.website ? (
            <a
              className="transition-colors hover:text-muted-foreground hover:underline hover:decoration-muted-foreground/50 hover:underline-offset-4"
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

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isEdu ? (
            <span className="flex items-center gap-1.5 font-medium text-primary/70">
              <GraduationCap className="size-4" />
              Education
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-medium text-primary/70">
              <Briefcase className="size-4" />
              Experience
            </span>
          )}

          {group.isCurrent && (
            <>
              <span className="text-border">•</span>
              <span className="relative flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-primary">
                <span className="relative flex size-2 items-center justify-center">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                </span>
                Present
              </span>
            </>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Items Stream */}
      <div className="flex flex-col space-y-10">
        {items.map((item, index) => (
          <motion.div key={item._key} layout>
            <TimelineItem
              item={item}
              isLast={index === items.length - 1}
              category={group.category}
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
  isLast?: boolean;
  category?: string | null;
};

export function TimelineItem({ item }: TimelineItemProps) {
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
        <div className="group/timeline-item relative flex flex-col gap-3">
          <CollapsibleTrigger
            className={cn(
              "flex w-full select-none items-start justify-between gap-4 text-left outline-none",
              "data-disabled:cursor-default",
            )}
          >
            {/* Title & Metadata */}
            <div className="flex-1 space-y-1.5">
              <h4 className="flex items-center gap-2 text-base font-medium text-foreground md:text-[17px]">
                {item.icon && (
                  <span className="text-muted-foreground/60 [&_svg]:size-4.5">
                    <Reicon name={item.icon} />
                  </span>
                )}
                {item.title}
              </h4>

              <dl className="flex flex-wrap items-center gap-2 text-sm font-light text-muted-foreground">
                {start && (
                  <div>
                    <dt className="sr-only">Period</dt>
                    <dd className="flex items-center gap-1 font-mono text-xs tracking-tight sm:text-sm">
                      <span>{formatPeriod(start)}</span>
                      <span>—</span>
                      {isOngoing ? (
                        <InfinityIcon
                          className="size-4 translate-y-[0.5px]"
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
                      className="data-vertical:h-3.5 data-vertical:self-center"
                      orientation="vertical"
                    />
                    <div>
                      <dt className="sr-only">Duration</dt>
                      <dd className="font-mono text-xs tabular-nums tracking-tight sm:text-sm">
                        {duration}
                      </dd>
                    </div>
                  </>
                )}

                {item.type && (
                  <>
                    <Separator
                      className="data-vertical:h-3.5 data-vertical:self-center"
                      orientation="vertical"
                    />
                    <div>
                      <dt className="sr-only">Type</dt>
                      <dd>{item.type}</dd>
                    </div>
                  </>
                )}
              </dl>
            </div>

            {/* Chevron */}
            {item.description && (
              <div className="mt-1 shrink-0 text-muted-foreground transition-colors group-hover/timeline-item:text-foreground group-disabled/timeline-item:hidden [&_svg]:h-lh [&_svg]:w-4.5">
                <ChevronsUpDownIcon
                  ref={chevronsUpDownIconRef}
                  duration={0.15}
                />
              </div>
            )}
          </CollapsibleTrigger>

          <CollapsibleContent className="overflow-hidden">
            {item.description && (
              <Prose className="pt-2">
                <PortableText value={item.description} />
              </Prose>
            )}
          </CollapsibleContent>

          {Array.isArray(item.skills) && item.skills.length > 0 && (
            <div className="pt-2">
              <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
                {item.skills.map((skill, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <span className="size-1 rounded-full bg-border" />
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
        "prose prose-ncdai prose-zinc max-w-none text-sm font-light text-muted-foreground dark:prose-invert md:text-base md:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

function Skill({ className, ...props }: ComponentProps<"span">) {
  return (
    <span className={cn("font-medium tracking-wide", className)} {...props} />
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
  }).format(parsed); // e.g., "Aug 2022"
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
