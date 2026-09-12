"use client";

import { cn } from "cn";
import { motion, useScroll, useTransform } from "motion/react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import React from "react";
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

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = React.useState(0);

  // Dynamically measure the full height of the CurveThingy component
  React.useEffect(() => {
    if (!containerRef.current) return;

    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Track scroll progress across the entire lifecycle of the component in the viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Map scroll progress (0 to 1) to the full height of the component (minus a small offset for padding)
  const maxTravelDistance = Math.max(0, containerHeight - 80);
  const yOffset = useTransform(scrollYProgress, [0, 1], [0, maxTravelDistance]);

  return (
    <React.Fragment>
      <div ref={containerRef} aria-hidden="true" />
      <div
        className={cn(
          "relative bg-card",
          "gap-20 sm:gap-30 md:gap-36 flex flex-col pb-20 sm:pb-30 md:pb-36",
          "rounded-b-[46px] sm:rounded-b-[64px] md:rounded-b-[84px] -mb-16",
          props.tCurve &&
            "rounded-t-[46px] sm:rounded-t-[64px] md:rounded-t-[84px]",
          props.tMargin && "md:-mt-16",
          props.className,
        )}
      >
        <motion.div
          style={{ y: yOffset }}
          className="absolute w-full hidden lg:block bottom-full left-1/2 -translate-x-1/2 pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="pointer-event-auto backdrop-blur-md bg-linear-to-b from-transparent via-background/50 to-background"
          >
            <Container className="py-2">
              <div className="flex items-center justify-between gap-8">
                {keyOptions.map((item) => (
                  <p
                    key={item.key}
                    className="text-[10px] font-mono tracking-[0.12em] max-w-33.75 text-center w-full text-muted-foreground uppercase"
                  >
                    <span className="text-foreground">{item.key}</span>
                    <span className="mx-1.5 opacity-40">/</span>
                    <span>{item.label}</span>
                  </p>
                ))}
              </div>
            </Container>
          </motion.div>
        </motion.div>

        {props.tCurve && <FadeLine className="top-0 mx-auto w-[80%]" />}

        {!props.hideHash && (
          <div className="absolute top-4 md:top-6 z-10 flex w-full items-center justify-center">
            <button
              type="button"
              name="quick scroll button"
              onClick={() => {
                router.push(`#${props.hash}` as Route);
                play("swipe");
              }}
              disabled={!props.hash}
              className="h-2 md:h-2.5 w-10 rounded-full bg-muted-foreground/50 transition-[width] duration-300 ease-in-out hover:w-16 disabled:hover:w-10 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        )}

        {props.children}

        <FadeLine className="bottom-0 mx-auto w-[80%]" />
      </div>
    </React.Fragment>
  );
};
