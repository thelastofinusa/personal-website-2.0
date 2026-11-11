"use client";

import { Maximize2Icon } from "lucide-react";
import { motion, type Variants } from "motion/react";
import React from "react";
import { CustomImage } from "@/components/shared/image";
import { cn } from "@/lib/utils";

type SnapshotImage = { url: string | null };

type SnapshotsGalleryProps = {
  images: SnapshotImage[];
  /** Used to build alt text: "<altPrefix> 1", "<altPrefix> 2", ... */
  altPrefix: string;
  /** Called with the image's index when it is opened full screen. */
  action: (index: number) => void;
};

const stripVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 24 },
  },
};

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * An accordion of tall photo panels. One panel is open at a time: hover it
 * (mouse), focus it (keyboard) or tap it (touch) and it widens while the
 * others narrow and dim. Opening the already-open panel launches the
 * lightbox.
 *
 * Touch needs two taps on purpose: the first one opens the panel, the second
 * opens the lightbox. With a mouse, hovering already opens the panel, so a
 * single click opens the lightbox.
 */
export const SnapshotsGallery: React.FC<SnapshotsGalleryProps> = ({
  images,
  altPrefix,
  action,
}) => {
  const center = Math.floor((images.length - 1) / 2);
  const [active, setActive] = React.useState(center);

  return (
    <motion.div
      variants={stripVariants}
      initial="hidden"
      animate="visible"
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setActive(center);
      }}
      className="flex h-52 gap-2 sm:h-72 md:h-80 md:gap-3 lg:h-104"
    >
      {images.map((image, index) => {
        if (!image.url) return null;
        const isActive = index === active;

        return (
          <motion.button
            // biome-ignore lint/suspicious/noArrayIndexKey: images never reorder
            key={`snapshot-${index}`}
            type="button"
            variants={panelVariants}
            aria-label={`Photo ${index + 1} of ${images.length}${isActive ? ", open full screen" : ""}`}
            aria-current={isActive ? "true" : undefined}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setActive(index);
            }}
            onFocus={(e) => {
              // Only keyboard focus. A tap also focuses on some phones and
              // would skip the "first tap opens the panel" step.
              if (e.currentTarget.matches(":focus-visible")) setActive(index);
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (isActive) action(index);
              else setActive(index);
            }}
            className={cn(
              "group bg-background relative min-w-0 basis-0 cursor-pointer overflow-hidden rounded-xl border p-0",
              "transition-[flex-grow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              "focus-visible:ring-ring outline-none focus-visible:ring-2",
              isActive ? "border-primary grow-5 md:grow-7" : "grow",
            )}
          >
            <CustomImage
              src={image.url}
              alt={`${altPrefix} ${index + 1}`}
              width={800}
              height={1000}
              className={cn(
                "absolute inset-0 size-full object-cover object-[50%_30%]",
                "transition-[transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                isActive
                  ? "scale-100 brightness-100 saturate-100"
                  : "scale-110 brightness-50 saturate-50",
              )}
            />

            {/* Bottom shade so the labels stay readable on any photo. */}
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0 transition-opacity duration-500",
                isActive ? "opacity-100" : "opacity-0",
              )}
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgb(0 0 0 / 0.6), transparent 50%)",
              }}
            />

            <span
              aria-hidden="true"
              className={cn(
                "absolute bottom-3 left-3 flex items-baseline gap-1.5 text-white transition-all duration-500 md:bottom-4 md:left-4",
                isActive
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0",
              )}
            >
              <span className="text-lg leading-none font-medium tabular-nums md:text-2xl">
                {pad(index + 1)}
              </span>
              <span className="text-[11px] leading-none text-white/60 tabular-nums">
                / {pad(images.length)}
              </span>
            </span>

            <span
              aria-hidden="true"
              className={cn(
                "absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition-all duration-500 md:top-4 md:right-4",
                isActive ? "scale-100 opacity-100" : "scale-75 opacity-0",
              )}
            >
              <Maximize2Icon className="size-3.5" />
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
};
