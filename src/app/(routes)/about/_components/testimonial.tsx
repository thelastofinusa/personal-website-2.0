/** biome-ignore-all lint/suspicious/noArrayIndexKey: ignore */
"use client";

import { motion } from "motion/react";
import type React from "react";
import { VscStarEmpty, VscStarFull, VscStarHalf } from "react-icons/vsc";
import { Link4Newicons } from "reicon-react";
import { Frame, FramePanel } from "@/components/reusable/reui/frame";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/reusable/shadcn/avatar";
import { itemVariants } from "@/constants/variants";
import { cn, generateAvatar, getInitials } from "@/lib/utils";
import type { TestimonialsListQueryResult } from "~/sanity.types";

export const Testimonial: React.FC<{
  testimonial: TestimonialsListQueryResult[number];
  preview?: boolean;
}> = ({ testimonial, preview }) => {
  const UrlLink = testimonial.url ? motion.a : motion.div;
  const avatar = generateAvatar(testimonial.name as string);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => {
      const diff = rating - i;

      const delayClass = [
        "group-hover:delay-[0ms]",
        "group-hover:delay-[40ms]",
        "group-hover:delay-[80ms]",
        "group-hover:delay-[120ms]",
        "group-hover:delay-[160ms]",
      ][i];

      return (
        <span
          key={i}
          className={cn(
            "relative inline-flex size-3.5 items-center justify-center",
            preview && "size-4",
          )}
        >
          {/* If preview is true, show colored rating view immediately. Otherwise, use mobile/desktop conditional logic. */}
          {preview ? (
            <span>
              {diff >= 1 ? (
                <VscStarFull
                  className={cn("text-primary size-3.5", preview && "size-4")}
                />
              ) : diff > 0 ? (
                <VscStarHalf
                  className={cn("text-primary size-3.5", preview && "size-4")}
                />
              ) : (
                <VscStarEmpty
                  className={cn(
                    "text-muted-foreground size-3.5",
                    preview && "size-4",
                  )}
                />
              )}
            </span>
          ) : (
            <>
              {/* Mobile Default View (Shows real rating color immediately) */}
              <span className="md:hidden">
                {diff >= 1 ? (
                  <VscStarFull className="text-primary size-3.5" />
                ) : diff > 0 ? (
                  <VscStarHalf className="text-primary size-3.5" />
                ) : (
                  <VscStarEmpty className="text-muted-foreground size-3.5" />
                )}
              </span>

              {/* Desktop View (Empty by default -> Fills on card hover based on rating) */}
              <span className="hidden md:inline-flex">
                {/* Base Empty Star */}
                <VscStarEmpty
                  className={cn("text-muted-foreground size-3.5", delayClass)}
                />

                {/* Hover Star Fill Overlay */}
                {diff > 0 && (
                  <span
                    className={cn(
                      "absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                      delayClass,
                    )}
                  >
                    {diff >= 1 ? (
                      <VscStarFull className="text-primary size-3.5" />
                    ) : (
                      <VscStarHalf className="text-primary size-3.5" />
                    )}
                  </span>
                )}
              </span>
            </>
          )}
        </span>
      );
    });
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      exit="exit"
      layout
      key={testimonial._id}
      variants={itemVariants}
      className={cn(
        "group inline-block w-full break-inside-avoid rounded-[20px]! shadow-2xs transition-all duration-300 ease-out",
        !preview &&
          "hover:shadow-[0_5px_20px_rgba(0,0,0,0.05)] hover:dark:shadow-[0_5px_20px_rgba(0,0,0,0.8)]",
        !preview && "hover:-translate-y-1.5 hover:scale-[102%]",
      )}
    >
      <Frame
        variant="inverse"
        className="bg-background dark:bg-card flex flex-col justify-between overflow-hidden rounded-[20px]"
      >
        <FramePanel className="bg-background group relative flex flex-col gap-8 overflow-y-auto rounded-2xl px-4 py-3">
          {!preview && (
            <div className="from-primary/10 pointer-events-none absolute inset-0 bg-linear-to-br via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          )}

          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center">
              {renderStars(testimonial.rating as number)}
            </div>

            <p className="font-heading text-xs font-normal">
              {testimonial.rating?.toFixed(1)}{" "}
              <span className="text-muted-foreground">Star Rating</span>
            </p>
          </div>

          <blockquote
            className={cn("text-sm font-normal", preview && "text-[15px]")}
          >
            “{testimonial.content}”
          </blockquote>
        </FramePanel>

        <UrlLink
          href={testimonial.url as string}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col gap-0.5 px-4 py-2"
        >
          <div className="flex items-center gap-1.5">
            <Avatar size="xs">
              <AvatarImage src={avatar} alt={testimonial.name as string} />
              <AvatarFallback>
                {getInitials(testimonial.name as string)}
              </AvatarFallback>
            </Avatar>

            <p
              className={cn(
                "text-sm font-medium transition-colors duration-150",
                preview && "text-[15px]",
                testimonial.url && "group-hover:text-primary",
              )}
            >
              <span>{testimonial.name}</span>
            </p>

            {testimonial.url && <Link4Newicons className="ml-1 size-3.5" />}
          </div>

          <p
            className={cn(
              "text-muted-foreground text-xs font-normal",
              preview && "text-[13px]",
            )}
          >
            {testimonial.role}
            {testimonial.company ? ` at ${testimonial.company}` : ""}
          </p>
        </UrlLink>
      </Frame>
    </motion.div>
  );
};
