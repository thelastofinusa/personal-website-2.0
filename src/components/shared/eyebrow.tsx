"use client";

import { cn } from "cn";
import { motion } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import type React from "react";
import type { IconComponent } from "reicon-react";
import { itemVariants } from "@/constants/variants";
import { soundFx } from "@/lib/uisfx";
import { ShimmeringText } from "../reusable/chanhdai/shimmering-text";

const MotionLink = motion.create(Link);

export const Eyebrow: React.FC<{
  icon?: IconComponent;
  label: string;
  href?: string;
  className?: string;
  reverse?: boolean;
}> = ({ icon: Icon, label, href, className, reverse }) => {
  const content = (
    <>
      {Icon && <Icon className="mb-px size-4 motion-safe:animate-bell-ring" />}

      <ShimmeringText
        className="text-xs font-light uppercase tracking-[0.1em] sm:text-xs"
        text={label}
      />
    </>
  );

  if (href) {
    return (
      <MotionLink
        href={href as Route}
        variants={itemVariants}
        onClick={() => soundFx.play("back")}
        className={cn(
          "flex items-center flex-row gap-2 w-max text-muted-foreground",
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
        "flex items-center flex-row w-max gap-2 text-muted-foreground",
        reverse && "flex-row-reverse",
        className,
      )}
    >
      {content}
    </motion.p>
  );
};
