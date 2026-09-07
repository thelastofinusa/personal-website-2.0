"use client";

import { motion } from "motion/react";
import type React from "react";
import ReactMarkdown from "react-markdown";

import { itemVariants, parentVariants } from "@/constants/variants";

import { Container } from "./container";

export const TextContent: React.FC<{ content: string; hash?: string }> = (
  props,
) => {
  return (
    <section
      id={props.hash ? `#${props.hash}` : undefined}
      className="pt-20 sm:pt-30 md:pt-36"
    >
      <Container size="xs">
        <motion.div
          variants={parentVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <motion.p
                  variants={itemVariants}
                  className="mb-6 text-base font-extralight tracking-[0.03em] last:mb-0 md:text-lg"
                >
                  {children}
                </motion.p>
              ),
            }}
          >
            {props.content}
          </ReactMarkdown>
        </motion.div>
      </Container>
    </section>
  );
};
