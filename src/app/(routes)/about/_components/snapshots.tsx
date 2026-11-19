"use client";

import { Maximize2Icon } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { useSoundFx } from "@/components/provider/sound-fx";
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
  const { play } = useSoundFx();

  const validImages = images.filter((img): img is { url: string } =>
    Boolean(img.url),
  );
  const centerIndex = Math.max(0, Math.floor((validImages.length - 1) / 2));
  const [active, setActive] = React.useState<number>(centerIndex);
  const mobileTrackRef = React.useRef<HTMLDivElement | null>(null);
  const mobileItemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const hasUserInteractedMobile = React.useRef(false);

  React.useEffect(() => {
    hasUserInteractedMobile.current = false;
    setActive(centerIndex);
  }, [centerIndex]);

  const alignMobileItem = React.useCallback(
    (index: number, behavior: ScrollBehavior) => {
      const track = mobileTrackRef.current;
      const item = mobileItemRefs.current[index];
      if (!track || !item) return;

      const targetLeft =
        item.offsetLeft - (track.clientWidth - item.clientWidth) / 2;
      track.scrollTo({
        left: Math.max(0, targetLeft),
        behavior,
      });
    },
    [],
  );

  React.useLayoutEffect(() => {
    if (!validImages.length) return;
    alignMobileItem(centerIndex, "instant" as ScrollBehavior);
  }, [centerIndex, validImages.length, alignMobileItem]);

  React.useEffect(() => {
    const track = mobileTrackRef.current;
    if (!track || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      if (!hasUserInteractedMobile.current) {
        alignMobileItem(centerIndex, "instant" as ScrollBehavior);
      }
    });

    observer.observe(track);
    return () => observer.disconnect();
  }, [centerIndex, alignMobileItem]);

  if (!validImages.length) return null;

  const selectMobileSnapshot = (index: number) => {
    hasUserInteractedMobile.current = true;
    if (index === active) {
      action(index);
      return;
    }
    setActive(index);
    alignMobileItem(index, "smooth");
  };

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center py-6">
      {/* Background ambient color wash */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25 blur-3xl">
        <div className="bg-primary/40 h-64 w-full rounded-full transition-all duration-700" />
      </div>

      {/* Mobile: Horizontal Snap Strip starting at the center snapshot */}
      <Frame
        ref={mobileTrackRef}
        variant="inverse"
        className="bg-background dark:bg-card relative flex w-full snap-x snap-mandatory flex-row gap-2 overflow-x-auto rounded-3xl p-2 shadow-[0_5px_20px_rgba(0,0,0,0.05)] sm:hidden dark:shadow-[0_5px_20px_rgba(0,0,0,0.8)]"
      >
        {validImages.map((image, index) => {
          const isCurrent = index === active;

          return (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: images never reorder
              key={`mobile-snap-${index}`}
              ref={(el) => {
                mobileItemRefs.current[index] = el;
              }}
              type="button"
              aria-label={`Photo ${index + 1} of ${validImages.length}${isCurrent ? ", open full screen" : ", focus snapshot"}`}
              aria-current={isCurrent ? "true" : undefined}
              onClick={() => selectMobileSnapshot(index)}
              onMouseEnter={() => play("hover")}
              className="group focus-visible:ring-primary relative h-72 w-[78vw] max-w-xs shrink-0 cursor-pointer snap-center rounded-[20px] p-0 text-left outline-none focus-visible:ring-2"
            >
              <FramePanel
                className={cn(
                  "relative size-full overflow-hidden rounded-[20px] p-0 transition-opacity duration-300",
                  isCurrent ? "opacity-100" : "opacity-80",
                )}
              >
                <CustomImage
                  src={image.url}
                  alt={`${altPrefix} ${index + 1}`}
                  width={800}
                  height={1000}
                  onLoad={() => {
                    if (
                      !hasUserInteractedMobile.current &&
                      index === centerIndex
                    ) {
                      alignMobileItem(centerIndex, "instant" as ScrollBehavior);
                    }
                  }}
                  className="size-full object-cover object-[50%_30%] transition-transform duration-500 group-active:scale-[0.98]"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-transparent to-black/15"
                />

                <div
                  aria-hidden="true"
                  className="bg-foreground/55 dark:bg-background/55 pointer-events-none absolute top-3 left-3 flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs text-white backdrop-blur-md"
                >
                  <span className="font-bold text-white">{pad(index + 1)}</span>
                  <span className="text-white/40">/</span>
                  <span className="text-white/70">
                    {pad(validImages.length)}
                  </span>
                </div>

                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute top-3 right-3 flex size-8 items-center justify-center rounded-lg border text-white/90 backdrop-blur-md transition-colors",
                    isCurrent
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-foreground/50 dark:bg-background/50 border-white/15",
                  )}
                >
                  <Maximize2Icon className="size-3.5" />
                </span>

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between text-xs text-white/90"
                >
                  <span className="font-medium">
                    {altPrefix} {index + 1}
                  </span>
                  <span className="bg-foreground/50 dark:bg-background/50 rounded-lg px-2.5 py-1 text-[11px] backdrop-blur-md">
                    {isCurrent ? "Tap to expand" : "Double tap to expand"}
                  </span>
                </div>
              </FramePanel>
            </button>
          );
        })}
      </Frame>

      {/* Tablet & Desktop: Expanding Aperture Columns */}
      <Frame
        variant="inverse"
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setActive(centerIndex);
        }}
        className="bg-background dark:bg-card relative hidden h-80 w-full flex-row gap-2 overflow-hidden rounded-3xl p-2 shadow-[0_5px_20px_rgba(0,0,0,0.1)] sm:flex md:h-96 lg:h-105 dark:shadow-[0_5px_20px_rgba(0,0,0,0.8)]"
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
              onMouseEnter={() => play("hover")}
              initial={false}
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
