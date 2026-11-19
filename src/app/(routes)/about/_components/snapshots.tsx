"use client";

import { Maximize2Icon } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { Frame, FramePanel } from "@/components/reusable/reui/frame";
import { CustomImage } from "@/components/shared/image";
import { cn } from "@/lib/utils";

type SnapshotImage = { url: string | null };

type SnapshotsGalleryProps = {
  images: SnapshotImage[];
  altPrefix: string;
  action: (index: number) => void;
};

const pad = (value: number) => String(value).padStart(2, "0");

export const SnapshotsGallery: React.FC<SnapshotsGalleryProps> = ({
  images,
  altPrefix,
  action,
}) => {
  const validImages = images.filter((img): img is { url: string } =>
    Boolean(img.url),
  );
  const centerIndex = Math.max(0, Math.floor((validImages.length - 1) / 2));
  const [active, setActive] = React.useState<number>(centerIndex);

  React.useEffect(() => {
    setActive(centerIndex);
  }, [centerIndex]);

  if (!validImages.length) return null;

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center py-6">
      {/* Background ambient color wash */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25 blur-3xl">
        <div className="bg-primary/40 h-64 w-full rounded-full transition-all duration-700" />
      </div>

      <Frame
        variant="inverse"
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setActive(centerIndex);
        }}
        className="bg-background dark:bg-card relative h-64 w-full flex-row gap-2 overflow-hidden rounded-3xl p-1.5 sm:h-80 md:h-96 lg:h-105"
      >
        {validImages.map((image, index) => {
          const isActive = index === active;

          return (
            <motion.button
              // biome-ignore lint/suspicious/noArrayIndexKey: images never reorder
              key={`aperture-${index}`}
              type="button"
              aria-label={`Photo ${index + 1} of ${validImages.length}${isActive ? ", open full screen" : ""}`}
              aria-current={isActive ? "true" : undefined}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") setActive(index);
              }}
              onFocus={(e) => {
                if (e.currentTarget.matches(":focus-visible")) setActive(index);
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (isActive) action(index);
                else setActive(index);
              }}
              animate={{
                flexGrow: isActive ? 6 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 25,
              }}
              className="group relative h-full min-w-0 cursor-pointer overflow-hidden rounded-[20px] p-0 text-left outline-none"
            >
              <FramePanel className="relative h-full w-full rounded-[20px] p-0">
                <CustomImage
                  src={image.url}
                  alt={`${altPrefix} ${index + 1}`}
                  width={1000}
                  height={1200}
                  className={cn(
                    "absolute inset-0 size-full object-cover object-[50%_30%] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isActive
                      ? "scale-100 brightness-100 saturate-100"
                      : "scale-110 brightness-40 saturate-50 group-hover:brightness-60",
                  )}
                />

                {/* Shading gradient for text readability */}
                <div
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20 transition-opacity duration-500",
                    isActive ? "opacity-80" : "opacity-0",
                  )}
                />

                {/* Active Header/Counter */}
                <div
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute top-4 left-4 flex items-center gap-2 rounded-xl bg-black/50 px-3 py-1.5 font-mono text-xs text-white backdrop-blur-md transition-all duration-500",
                    isActive
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-4 opacity-0",
                  )}
                >
                  <span className="font-bold text-white">{pad(index + 1)}</span>
                  <span className="text-white/40">/</span>
                  <span className="text-white/70">
                    {pad(validImages.length)}
                  </span>
                </div>

                {/* Active Fullscreen Action Pill */}
                <div
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all duration-500",
                    isActive ? "scale-100 opacity-100" : "scale-75 opacity-0",
                  )}
                >
                  <Maximize2Icon className="size-4" />
                </div>

                {/* Vertical Rotated Text for Inactive Slim Strips */}
                <div
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                    isActive ? "opacity-0" : "opacity-100",
                  )}
                >
                  <span className="font-mono text-sm font-semibold tracking-widest text-white/75 [writing-mode:vertical-lr] md:text-base">
                    {pad(index + 1)}
                  </span>
                </div>
              </FramePanel>
            </motion.button>
          );
        })}
      </Frame>
    </div>
  );
};
