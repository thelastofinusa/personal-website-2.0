"use client";

import { cn } from "cn";
import { motion } from "motion/react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type React from "react";
import { keyOptions } from "@/constants/keys";
import { useSoundFx } from "../provider/sound-fx";
import { Container } from "./container";
import { FadeLine } from "./fade-line";

type Props = {
  children: React.ReactNode;
  className?: string;
  tCurve?: boolean;
  tMargin?: boolean;
  hideHash?: boolean;
  hash?: string;
};

export const CurveThingy: React.FC<Props> = (props) => {
  const router = useRouter();
  const { play } = useSoundFx();

  return (
    <div
      className={cn(
        "relative bg-card",
        "flex flex-col gap-20 pb-20 sm:gap-30 sm:pb-30 md:gap-36 md:pb-36",
        "-mb-16 rounded-b-[46px] sm:rounded-b-[64px] md:rounded-b-[84px]",
        props.tCurve &&
          "rounded-t-[46px] sm:rounded-t-[64px] md:rounded-t-[84px]",
        props.tMargin && "md:-mt-16",
        props.className,
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="pointer-events-none absolute bottom-full left-1/2 hidden w-full -translate-x-1/2 lg:block"
      >
        <Container className="select-none bg-linear-to-b from-transparent via-background/50 to-background py-2">
          <div className="flex items-center justify-between gap-8">
            {keyOptions.map((item) => (
              <p
                key={item.key}
                className="w-full max-w-33.75 text-center font-mono text-[10px] text-muted-foreground uppercase tracking-[0.12em]"
              >
                <span className="text-foreground">[{item.key}]</span>
                <span>{item.label}</span>
              </p>
            ))}
          </div>
        </Container>
      </motion.div>

      {props.tCurve && <FadeLine className="top-0 mx-auto w-[80%]" />}

      {!props.hideHash && (
        <div className="absolute top-4 z-10 flex w-full items-center justify-center md:top-6">
          <button
            type="button"
            name="quick scroll button"
            onClick={() => {
              router.push(`#${props.hash}` as Route);
              play("swipe");
            }}
            disabled={!props.hash}
            className="h-2 w-10 rounded-full bg-muted-foreground/50 transition-[width] duration-300 ease-in-out hover:w-16 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:w-10 md:h-2.5"
          />
        </div>
      )}

      {props.children}

      <FadeLine className="bottom-0 mx-auto w-[80%]" />
    </div>
  );
};
