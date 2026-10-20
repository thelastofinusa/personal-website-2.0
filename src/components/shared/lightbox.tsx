/** biome-ignore-all lint/a11y/noStaticElementInteractions: backdrop click closes the dialog */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: Escape is handled globally */
/** biome-ignore-all lint/performance/noImgElement: lightbox needs natural-size contain behaviour */
"use client";

import {
  AnimatePresence,
  motion,
  type PanInfo,
  useReducedMotion,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Xmark } from "reicon-react";
import { cn } from "@/lib/utils";
import { Button } from "../reusable/shadcn/button";

export type LightboxImage = {
  url?: string | null;
  alt?: string | null;
};

export type ImageLightboxProps = {
  images: LightboxImage[];
  initialIndex: number;
  onClose: () => void;
};

const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 500;
const SLIDE_OFFSET = 48;

/**
 * Render inside <AnimatePresence> so the exit animation can play:
 *
 *   <AnimatePresence>
 *     {index !== null && <ImageLightbox ... />}
 *   </AnimatePresence>
 */
export function ImageLightbox({
  images,
  initialIndex,
  onClose,
}: ImageLightboxProps) {
  const [[index, direction], setPage] = useState<[number, number]>([
    initialIndex,
    0,
  ]);
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const count = images.length;
  const hasMany = count > 1;
  const current = images[index];
  const offset = reduceMotion ? 0 : SLIDE_OFFSET;

  const paginate = useCallback(
    (dir: number) => {
      if (count < 2) return;
      setPage(([i]) => [(i + dir + count) % count, dir]);
    },
    [count],
  );

  // Keyboard, scroll lock, focus management
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        paginate(1);
      } else if (e.key === "ArrowLeft") {
        paginate(-1);
      } else if (e.key === "Tab") {
        // Keep focus inside the dialog
        const focusable =
          dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose, paginate]);

  // Preload neighbours so next/previous feels instant
  useEffect(() => {
    if (count < 2) return;
    for (const i of [(index + 1) % count, (index - 1 + count) % count]) {
      const url = images[i]?.url;
      if (url) {
        const img = new Image();
        img.src = url;
      }
    }
  }, [index, count, images]);

  const handleDragEnd = (_: unknown, { offset: o, velocity }: PanInfo) => {
    if (o.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) paginate(1);
    else if (o.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) paginate(-1);
  };

  if (typeof document === "undefined" || !current?.url) return null;

  return createPortal(
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClose}
      className="fixed inset-0 z-100 flex flex-col bg-background/80 backdrop-blur-xl"
    >
      {/* Top bar */}
      <div className="flex items-center justify-end p-4 sm:p-6">
        <Button
          ref={closeRef}
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Close image viewer"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <Xmark />
        </Button>
      </div>

      {/* Stage */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20">
        {hasMany && (
          <Button
            type="button"
            aria-label="Previous image"
            variant="secondary"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              paginate(-1);
            }}
            className={cn("absolute left-3 z-10 sm:left-6")}
          >
            <ChevronLeft />
          </Button>
        )}

        <div className="relative flex size-full items-center justify-center">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={index}
              custom={direction}
              variants={{
                enter: (d: number) => ({ x: d * offset, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: d * -offset, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 320, damping: 32 },
                opacity: { duration: 0.2 },
              }}
              drag={hasMany ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={handleDragEnd}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "flex max-h-full max-w-full items-center justify-center",
                hasMany && "cursor-grab active:cursor-grabbing",
              )}
            >
              <img
                src={current.url}
                alt={current.alt ?? ""}
                draggable={false}
                className="max-h-[75vh] max-w-full select-none border bg-card object-contain shadow-2xl"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {hasMany && (
          <Button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              paginate(1);
            }}
            className={cn("absolute right-3 z-10 sm:right-6")}
            variant="secondary"
            size="icon"
          >
            <ChevronRight />
          </Button>
        )}
      </div>

      {/* Caption + counter */}
      <div
        className="flex items-center justify-center gap-3 p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {current.alt && (
          <p className="max-w-[60ch] truncate text-muted-foreground text-sm">
            {current.alt}
          </p>
        )}
        {hasMany && (
          <span
            className="shrink-0 font-mono text-muted-foreground text-xs tabular-nums"
            aria-live="polite"
          >
            {index + 1} / {count}
          </span>
        )}
      </div>
    </motion.div>,
    document.body,
  );
}
