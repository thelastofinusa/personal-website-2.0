"use client";

import type confetti from "canvas-confetti";
import { motion, useScroll, useTransform } from "motion/react";
import { useSoundFx } from "@/components/provider/sound-fx";
import { Highlighter } from "@/components/reusable/magicui/highlighter";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/reusable/shadcn/avatar";
import { siteConfig } from "@/config/site.config";
import { itemVariants, parentVariants } from "@/constants/variants";
import { getInitials } from "@/lib/utils";

export const HomeHero = () => {
  const { play } = useSoundFx();
  const { scrollYProgress } = useScroll();

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  return (
    <motion.div
      variants={parentVariants}
      initial="hidden"
      animate="visible"
      className="h-full pt-36 pb-16 md:py-0"
    >
      <motion.div
        style={{ opacity, scale }}
        transformTemplate={({ scale }) => `scale(${scale})`}
        className="flex h-full origin-center flex-col items-start gap-4 md:items-center md:justify-center md:gap-6"
      >
        <motion.p
          variants={itemVariants}
          className="flex items-center gap-2 text-sm md:text-lg"
        >
          <span className="font-normal">Your friendly</span>
          <Avatar size="xs" className="mb-0.5">
            <AvatarImage
              src={siteConfig.author.avatar}
              alt={siteConfig.author.name}
            />
            <AvatarFallback className="border">
              {getInitials(siteConfig.author.name)}
            </AvatarFallback>
          </Avatar>
          <span className="font-normal">neighborhood developer</span>
        </motion.p>

        <motion.h1
          variants={itemVariants}
          className="relative max-w-xl text-3xl sm:text-4xl md:mx-auto md:text-center md:text-5xl lg:max-w-3xl lg:text-6xl"
        >
          <i className="text-background dark:text-foreground">
            <Highlighter action="highlight" color="var(--primary)">
              Good ideas
            </Highlighter>
          </i>{" "}
          deserve{" "}
          <i>
            <Highlighter action="circle" color="var(--primary)">
              websites
            </Highlighter>
          </i>{" "}
          that make people{" "}
          <Highlighter action="underline" color="var(--primary)">
            smile and{" "}
            <button
              type="button"
              className="motion-safe:animate-bell-ring"
              onClick={async () => {
                play("streak");
                const { default: confettiFn }: { default: typeof confetti } =
                  await import("canvas-confetti");
                confettiFn({
                  zIndex: 9999,
                  particleCount: 500,
                  spread: 9000,
                  decay: 0.93,
                  disableForReducedMotion: true,
                  angle: 0,
                });
              }}
            >
              click.
            </button>
          </Highlighter>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-muted-foreground mt-4 max-w-md text-sm font-normal md:text-center md:text-base"
        >
          Equal parts{" "}
          <span className="text-foreground font-normal">design</span> and{" "}
          <span className="text-foreground font-normal">code</span>, fueled by{" "}
          <span className="text-foreground font-normal">curiosity</span>,{" "}
          <span className="text-foreground font-normal">chai</span>, and an
          unhealthy amount of attention to detail. I guess.
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
