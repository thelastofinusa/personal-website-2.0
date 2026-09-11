"use client";

import { motion } from "motion/react";
import type React from "react";
import ReactMarkdown from "react-markdown";

import { itemVariants, parentVariants } from "@/constants/variants";

import { Container } from "./container";
import { PronounceMyName } from "./pronunce-my-name";

interface TextContentProps {
  content: string;
  hash?: string;
  namePronunciationUrl?: string;
}

export const TextContent: React.FC<TextContentProps> = ({
  content,
  hash,
  namePronunciationUrl,
}) => {
  return (
    <section id={hash} className="pt-20 sm:pt-30 md:pt-36">
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

              a: ({ href, children }) => {
                if (href === "pronunciation") {
                  return (
                    <PronounceMyName
                      namePronunciationUrl={namePronunciationUrl as string}
                    />
                  );
                }

                return (
                  <a href={href} target="_blank" rel="noreferrer">
                    {children}
                  </a>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </motion.div>
      </Container>
    </section>
  );
};
