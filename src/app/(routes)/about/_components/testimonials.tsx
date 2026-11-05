/** biome-ignore-all lint/suspicious/noArrayIndexKey: ignore */
"use client";

import { motion } from "motion/react";
import type React from "react";
import { VscStarEmpty, VscStarFull, VscStarHalf } from "react-icons/vsc";
import { Frame, FramePanel } from "@/components/reusable/reui/frame";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/reusable/shadcn/avatar";
import { itemVariants } from "@/constants/variants";
import { cn, getInitials } from "@/lib/utils";
import type { TestimonialsListQueryResult } from "~/sanity.types";

export const Testimonials: React.FC<{
  testimonials: TestimonialsListQueryResult;
}> = (props) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => {
      const diff = rating - i;
      if (diff >= 1) {
        return <VscStarFull key={i} className="text-primary size-3.5" />;
      } else if (diff > 0) {
        return <VscStarHalf key={i} className="text-primary size-3.5" />;
      } else {
        return (
          <VscStarEmpty key={i} className="text-muted-foreground/40 size-3.5" />
        );
      }
    });
  };

  return (
    <div className="columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3">
      {props.testimonials &&
        props.testimonials.length > 0 &&
        props.testimonials.map((item) => {
          const UrlLink = item.url ? motion.a : motion.div;

          return (
            <motion.div
              initial="hidden"
              whileInView="visible"
              exit="exit"
              layout
              key={item._id}
              variants={itemVariants}
              className={cn(
                "group inline-block w-full break-inside-avoid rounded-[20px]! transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[102%]",
                "shadow-[0_5px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_5px_20px_rgba(0,0,0,0.8)]",
              )}
            >
              <Frame
                variant="inverse"
                className="bg-background dark:bg-card flex flex-col justify-between overflow-hidden rounded-[20px]"
              >
                <FramePanel className="bg-background flex flex-col gap-8 overflow-y-auto rounded-2xl px-4 py-3">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center">
                      {renderStars(item.rating as number)}
                    </div>

                    <p className="text-sm font-normal">
                      {item.rating?.toFixed(1)}{" "}
                      <span className="text-muted-foreground">of</span> 5
                    </p>
                  </div>

                  <blockquote className="text-sm font-light">
                    "{item.content}"
                  </blockquote>
                </FramePanel>

                <UrlLink
                  href={item.url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-0.5 px-4 py-3"
                >
                  <div className="flex items-center gap-1.5">
                    <Avatar size="xs">
                      <AvatarImage
                        src={item.avatar as string}
                        alt={item.name as string}
                      />
                      <AvatarFallback>
                        {getInitials(item.name as string)}
                      </AvatarFallback>
                    </Avatar>

                    <p className="group-hover:text-primary text-sm font-medium transition-colors duration-150">
                      <span>{item.name}</span>
                    </p>
                  </div>

                  <p className="text-muted-foreground text-xs font-light">
                    {item.role}
                    {item.company ? ` at ${item.company}` : ""}
                  </p>
                </UrlLink>
              </Frame>
            </motion.div>
          );
        })}
    </div>
  );
};
