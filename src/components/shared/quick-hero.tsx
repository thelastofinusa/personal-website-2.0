"use client";
import { motion, useScroll, useTransform } from "motion/react";
import type React from "react";
import { Container } from "@/components/shared/container";
import { itemVariants, parentVariants } from "@/constants/variants";
import type { IQuickHeroProps } from "@/types";
import { Eyebrow } from "./eyebrow";

export const QuickHero: React.FC<IQuickHeroProps> = (props) => {
  const { scrollYProgress } = useScroll();

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  return (
    <section className="pt-26 pb-16 sticky top-0 sm:py-30 md:pt-36 bg-background">
      <motion.div variants={parentVariants} initial="hidden" animate="visible">
        <motion.div
          style={{ opacity, scale }}
          transformTemplate={({ scale }) => `scale(${scale})`}
        >
          <Container size="sm">
            <div className="flex flex-col gap-1.5">
              {props.eyebrow && (
                <Eyebrow
                  label={props.eyebrow.label}
                  icon={props.eyebrow.icon}
                  href={props.eyebrow.href}
                  className="mb-4"
                />
              )}

              <motion.h4
                variants={itemVariants}
                className="font-light capitalize text-primary font-serif text-3xl md:text-4xl"
              >
                {props.title}
              </motion.h4>

              <motion.p
                variants={itemVariants}
                className="max-w-xl text-sm md:text-base font-extralight flex-1"
              >
                {props.description}
              </motion.p>
            </div>
          </Container>
          {props.component?.content && (
            <Container size={props.component.maxWidth ?? "sm"} className="mt-5">
              <motion.div variants={itemVariants}>
                {props.component.content}
              </motion.div>
            </Container>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
};
