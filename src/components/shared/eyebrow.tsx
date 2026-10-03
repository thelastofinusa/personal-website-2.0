"use client";

import { cn } from "cn";
import { motion } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import type React from "react";
import type { IconComponent } from "reicon-react";
import { itemVariants } from "@/constants/variants";
import { useSoundFx } from "../provider/sound-fx";
import { ShimmeringText } from "../reusable/chanhdai/shimmering-text";

const MotionLink = motion.create(Link);

export const Eyebrow: React.FC<{
  icon?: IconComponent;
  label: string;
  href?: string;
  className?: string;
  reverse?: boolean;
}> = ({ icon: Icon, label, href, className, reverse }) => {
  const { play } = useSoundFx();

  const content = (
    <>
      {Icon && <Icon className="mb-px size-4 motion-safe:animate-bell-ring" />}

      <ShimmeringText
        className="font-light text-xs uppercase tracking-[0.1em] sm:text-xs"
        text={label}
      />
    </>
  );

  if (href) {
    return (
      <MotionLink
        href={href as Route}
        variants={itemVariants}
        onClick={() => play("back")}
        className={cn(
          "flex w-max flex-row items-center gap-2 text-muted-foreground",
          reverse && "flex-row-reverse",
          className,
        )}
      >
        {content}
      </MotionLink>
    );
  }

  return (
    <motion.p
      variants={itemVariants}
      className={cn(
        "flex w-max flex-row items-center gap-2 text-muted-foreground",
        reverse && "flex-row-reverse",
        className,
      )}
    >
      {content}
    </motion.p>
  );
};
