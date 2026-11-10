"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useState } from "react";
import { useSoundFx } from "@/components/provider/sound-fx";
import { Highlighter } from "@/components/reusable/magicui/highlighter";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/reusable/shadcn/avatar";
import { AnimatedWord, smilePose } from "@/components/shared/animated-word";
import { siteConfig } from "@/config/site.config";
import { itemVariants, parentVariants } from "@/constants/variants";
import { fireConfetti } from "@/lib/fire-confetti";
import { getInitials } from "@/lib/utils";

export const HomeHero = () => {
  const { play } = useSoundFx();
  const { scrollYProgress } = useScroll();
  // Bumped on every click so "click." plays its burst animation.
  const [clickBurst, setClickBurst] = useState(0);

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
              <AnimatedWord
                word="websites"
                from="below"
                hopRotate={-6}
                delay={0.9}
                interval={6}
              />
            </Highlighter>
          </i>{" "}
          that make people{" "}
          {/* Extra padding keeps the underline below the dipping smile. */}
          <Highlighter action="underline" color="var(--primary)" padding={8}>
            <AnimatedWord
              word="smile"
              from="above"
              pose={smilePose}
              idle="grin"
              delay={1.3}
              interval={5}
            />{" "}
            and{" "}
            <button
              type="button"
              className="cursor-pointer"
              onClick={(event) => {
                play("streak");
                setClickBurst((count) => count + 1);
                fireConfetti(event.currentTarget);
              }}
            >
              <AnimatedWord
                word="click."
                from="below"
                idle="press"
                burst={clickBurst}
                delay={1.7}
                interval={4}
              />
            </button>
          </Highlighter>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-muted-foreground mt-4 max-w-md text-[15px] font-normal md:text-center md:text-[17px]"
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
