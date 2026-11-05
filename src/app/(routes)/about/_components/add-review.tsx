"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Add } from "reicon-react";
import { Frame, FramePanel } from "@/components/reusable/reui/frame";
import { itemVariants } from "@/constants/variants";

export const AddReview = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      exit="exit"
      layout
      variants={itemVariants}
    >
      <div className="group inline-block w-full cursor-pointer break-inside-avoid rounded-[20px]! shadow-2xs">
        <Frame
          variant="inverse"
          className="bg-background dark:bg-card flex flex-col justify-between overflow-hidden rounded-[20px]"
        >
          <FramePanel className="bg-background flex flex-col gap-6 overflow-y-auto rounded-2xl border-dashed px-5 py-4">
            <div className="flex aspect-[1.5] flex-col items-center justify-center">
              <Add className="text-muted-foreground/50 size-12" />

              <div className="space-y-1 py-3 text-center">
                <p className="text-foreground text-sm font-medium">
                  Share Your Experience
                </p>
                <p className="text-muted-foreground text-xs font-light">
                  Worked with me? Leave a quick review.
                </p>
              </div>
            </div>
          </FramePanel>
        </Frame>
      </div>
    </motion.div>
  );
};
