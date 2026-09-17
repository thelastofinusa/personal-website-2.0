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
import { Container } from "@/components/shared/container";
import { siteConfig } from "@/config/site.config";
import { itemVariants, parentVariants } from "@/constants/variants";
import { getInitials } from "@/lib/utils";

export const HomeHero = () => {
  const { play } = useSoundFx();
  const { scrollYProgress } = useScroll();

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  return (
    <section className="sticky top-0 flex-1 md:h-dvh">
      <Container className="h-full" size="xs">
        <motion.div
          variants={parentVariants}
          initial="hidden"
          animate="visible"
          className="h-full pb-16 pt-36 md:py-0"
        >
          <motion.div
            style={{ opacity, scale }}
            transformTemplate={({ scale }) => `scale(${scale})`}
            className="origin-center flex h-full flex-col items-start gap-4 md:items-center md:justify-center md:gap-6"
          >
            <motion.p
              variants={itemVariants}
              className="flex items-center gap-2 text-sm md:text-lg"
            >
              <span className="font-extralight">Your friendly</span>
              <Avatar size="xs" className="mb-0.5">
                <AvatarImage
                  src={siteConfig.author.avatar}
                  alt={siteConfig.author.name}
                />
                <AvatarFallback className="border">
                  {getInitials(siteConfig.author.name)}
                </AvatarFallback>
              </Avatar>
              <span className="font-extralight">neighborhood developer</span>
            </motion.p>

            <motion.h1
              variants={itemVariants}
              className="text-3xl relative sm:text-4xl max-w-xl lg:max-w-3xl md:text-5xl lg:text-6xl md:mx-auto md:text-center"
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
                    const {
                      default: confettiFn,
                    }: { default: typeof confetti } = await import(
                      "canvas-confetti"
                    );
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
              className="mt-4 max-w-lg text-base font-extralight text-muted-foreground md:text-center md:text-lg"
            >
              Equal parts{" "}
              <span className="font-normal text-foreground">design</span> and{" "}
              <span className="font-normal text-foreground">code</span>, powered
              by <span className="font-normal text-foreground">curiosity</span>,{" "}
              <span className="font-normal text-foreground">chai</span>, and a
              slightly unreasonable attention to detail.
            </motion.p>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};
