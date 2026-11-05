"use client";

import { motion } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import type React from "react";
import ReactMarkdown from "react-markdown";
import { itemVariants, parentVariants } from "@/constants/variants";
import { LinkPreview } from "../reusable/aceternity/link-preview";
import { PronounceMyName } from "./pronunce-my-name";

interface TextContentProps {
  content: string;
  namePronunciationUrl?: string;
}

export const TextContent: React.FC<TextContentProps> = ({
  content,
  namePronunciationUrl,
}) => {
  return (
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
              className="mb-6 text-[15px] font-light tracking-[0.03em] last:mb-0 md:text-[17px]"
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

            const isInternal = href?.startsWith("/");

            if (isInternal) {
              return (
                <Link
                  href={href as Route}
                  className="link-underline hover:text-primary! transition-colors"
                >
                  {children}
                </Link>
              );
            }

            return (
              <LinkPreview
                href={href as string}
                target="_blank"
                rel="noreferrer"
                className="link-underline hover:text-primary! transition-colors"
              >
                {children}
              </LinkPreview>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </motion.div>
  );
};
