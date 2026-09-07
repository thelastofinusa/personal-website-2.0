"use client";

import { cn } from "cn";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type React from "react";
import { useSoundFx } from "../provider/sound-fx";
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
        "relative overflow-hidden backdrop-blur-3xl bg-card",
        "gap-20 sm:gap-30 md:gap-36 flex flex-col pb-20 sm:pb-30 md:pb-36",
        "rounded-b-[46px] sm:rounded-b-[64px] md:rounded-b-[84px] -mb-16",
        props.tCurve &&
          "rounded-t-[46px] sm:rounded-t-[64px] md:rounded-t-[84px]",
        props.tMargin && "md:-mt-16",
        props.className,
      )}
    >
      {props.tCurve && <FadeLine className="top-0 mx-auto w-[80%]" />}

      {!props.hideHash && (
        <div className="absolute top-4 z-10 flex w-full items-center justify-center">
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
  );
};
