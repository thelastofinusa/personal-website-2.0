"use client";

import { motion } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
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
                  className="mb-6 text-[15px] font-extralight tracking-[0.03em] last:mb-0 md:text-[17px]"
                >
                  {children}
                </motion.p>
              ),

              a: ({ href, children }) => {
                if (href === "pronunciation") {
                  return (
                    <PronounceMyName
                      className="text-primary"
                      namePronunciationUrl={namePronunciationUrl as string}
                    />
                  );
                }

                const isInternal = href?.startsWith("/");

                if (isInternal) {
                  return (
                    <Link
                      href={href as Route}
                      className="text-primary underline underline-offset-4"
                    >
                      {children}
                    </Link>
                  );
                }

                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline underline-offset-4"
                  >
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
