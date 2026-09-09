/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  ArrowRight5,
  Soundwave,
  Tuning2,
  VolumeHigh,
  VolumeLow,
  VolumeLow2,
  VolumeMute,
  VolumeSlash,
  VolumeUp3,
} from "reicon-react";
import { type PackName, packNames } from "uisfx";
import { SOUND_KEY } from "@/constants/keys";
import { menuItemVariants, menuVariants } from "@/constants/variants";
import { useOnClickOutside } from "@/hooks/use-click-outside";
import { useSoundFx } from "../provider/sound-fx";
import { useToggle } from "../provider/toggle";
import { IconSwap, IconSwapItem } from "../reusable/chanhdai/icon-swap";
import { Frame, FramePanel } from "../reusable/reui/frame";
import { Button, type buttonVariants } from "../reusable/shadcn/button";
import { ButtonGroup } from "../reusable/shadcn/button-group";
import { Skeleton } from "../reusable/shadcn/skeleton";
import { Slider } from "../reusable/shadcn/slider";
import { CountingNumber } from "./count-number";
import { FadeLine } from "./fade-line";

const PACK_COLORS = [
  {
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    text: "text-sky-500",
    dot: "bg-sky-500",
  },
  {
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-500",
    dot: "bg-rose-500",
  },
  {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-500",
    dot: "bg-purple-500",
  },
  {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-500",
    dot: "bg-yellow-500",
  },
  {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-500",
    dot: "bg-green-500",
  },
  {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-500",
    dot: "bg-red-500",
  },
  {
    bg: "bg-blue-400/10",
    border: "border-blue-400/30",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
  {
    bg: "bg-orange-400/10",
    border: "border-orange-400/30",
    text: "text-orange-400",
    dot: "bg-orange-400",
  },
  {
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  {
    bg: "bg-pink-400/10",
    border: "border-pink-400/30",
    text: "text-pink-400",
    dot: "bg-pink-400",
  },
  {
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/30",
    text: "text-cyan-400",
    dot: "bg-cyan-400",
  },
  {
    bg: "bg-indigo-400/10",
    border: "border-indigo-400/30",
    text: "text-indigo-400",
    dot: "bg-indigo-400",
  },
];

function getPackColors(_packName: string, index: number) {
  const colors = PACK_COLORS[index % PACK_COLORS.length];
  return {
    bg: colors.bg,
    border: colors.border,
    text: colors.text,
    dot: colors.dot,
  };
}

export const SoundFXToggle: React.FC<
  ButtonPrimitive.Props & VariantProps<typeof buttonVariants>
> = ({ variant = "default", size = "icon-sm", ...props }) => {
  const {
    isOpen: openMenu,
    toggle: toggleMenu,
    close: closeMenu,
  } = useToggle("soundfx");
  const {
    enabled,
    pack,
    volume,
    toggle,
    setEnabled,
    setPack,
    setVolume,
    play,
  } = useSoundFx();

  const [mounted, setMounted] = React.useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // ─── Pagination State ──────────────────────────────
  const [page, setPage] = React.useState(0);
  const ITEMS_PER_PAGE = 4;

  const allPacks = React.useMemo(() => [...packNames], []);
  const totalPages = Math.ceil(allPacks.length / ITEMS_PER_PAGE);
  const visiblePacks = allPacks.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE,
  );

  const toggleOpenMenu = React.useCallback(() => {
    const next = !openMenu;
    play(next ? "toggle-on" : "toggle-off");
    toggleMenu();
  }, [play, openMenu, toggleMenu]);

  useOnClickOutside(containerRef, toggleOpenMenu, openMenu);

  useHotkeys(SOUND_KEY, toggleOpenMenu);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!enabled) {
      setShowVolumeSlider(false);
    }
  }, [enabled]);

  React.useEffect(() => {
    if (!openMenu) {
      setShowVolumeSlider(false);
      // Reset page when menu closes
      const timer = setTimeout(() => setPage(0), 300);
      return () => clearTimeout(timer);
    }

    const handleScroll = (event: Event) => {
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }
      closeMenu();
    };

    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [openMenu, closeMenu]);

  const handleSelectPack = (selectedPack: PackName) => {
    setPack(selectedPack);
    if (!enabled) setEnabled(true);
    play("achievement");
  };

  const lastVolumeStepRef = React.useRef<number | null>(null);

  const handleVolumeChange = (value: number | readonly number[]) => {
    const next = Array.isArray(value) ? value[0] : value;

    if (next === undefined) return;

    setVolume(next / 100);

    // Play only when crossing a 5% boundary.
    const volumeStep = Math.floor(next / 5);

    if (next > 0 && lastVolumeStepRef.current !== volumeStep) {
      play("press");
      lastVolumeStepRef.current = volumeStep;
    }
  };

  if (!mounted) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  const activePackIndex = allPacks.indexOf(pack);
  const activePackColors =
    activePackIndex >= 0
      ? getPackColors(pack, activePackIndex)
      : PACK_COLORS[0];

  const volumePercentage = Math.round(volume * 100);

  const VolumeIcon = !enabled
    ? VolumeSlash
    : volumePercentage === 0
      ? VolumeMute
      : volumePercentage <= 50
        ? VolumeLow2
        : VolumeHigh;

  return (
    <div ref={containerRef} className="inline-block">
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn(
          "relative z-50 overflow-hidden transition-all active:scale-95",
          props.className,
        )}
        {...props}
        onClick={toggleOpenMenu}
        aria-label="Sound settings"
      >
        <Tuning2 />
      </Button>

      <AnimatePresence>
        {openMenu && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={cn(
              "absolute right-0 top-full z-40 mt-3 w-72 origin-top-right rounded-[20px]!",
              "shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)]",
            )}
          >
            <Frame
              variant="inverse"
              className="rounded-[20px]! bg-background dark:bg-card"
            >
              {/* ─── Card Grid ──────────────────────── */}
              <FramePanel className="overflow-y-auto overscroll-contain bg-background p-3 flex flex-col gap-4">
                {/* ─── Header ─────────────────────────── */}
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-2">
                    <Soundwave className="size-4.5 text-muted-foreground" />
                    <span className="text-[13px] font-medium">
                      Sound Effects
                    </span>
                  </div>

                  <ButtonGroup>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-xs"
                      aria-label="More Options"
                      className="h-7 w-8"
                      onClick={() => {
                        toggle();
                        play(enabled ? "remove-from-cart" : "add-to-cart");
                      }}
                    >
                      <IconSwap>
                        <IconSwapItem
                          key={`${enabled ? "on" : "off"}-${VolumeIcon.displayName ?? VolumeIcon.name}`}
                        >
                          <VolumeIcon className="size-4" />
                        </IconSwapItem>
                      </IconSwap>
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      type="button"
                      disabled={!enabled}
                      onClick={() => {
                        if (!enabled) return;

                        setShowVolumeSlider((prev) => !prev);
                        play(showVolumeSlider ? "toggle-off" : "toggle-on");
                      }}
                    >
                      <span className="w-7 font-mono text-xs font-medium tabular-nums">
                        <CountingNumber
                          number={enabled ? Math.round(volume * 100) : 0}
                          fromNumber={0}
                        />
                        %
                      </span>
                    </Button>
                  </ButtonGroup>

                  {/* Inline volume popover */}
                  <AnimatePresence>
                    {showVolumeSlider && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full z-50 mt-2 w-full rounded-lg border bg-card p-3 shadow-xl"
                      >
                        <div className="flex items-center gap-3">
                          <VolumeLow className="size-4.5 text-muted-foreground" />
                          <Slider
                            value={[Math.round(volume * 100)]}
                            max={100}
                            min={0}
                            step={5}
                            onValueChange={handleVolumeChange}
                            className="flex-1"
                          />
                          <VolumeUp3 className="size-4.5 text-muted-foreground" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {visiblePacks.map((packName, index) => {
                    const isActive = pack === packName && enabled;
                    const originalIndex = page * ITEMS_PER_PAGE + index;
                    const colors = getPackColors(packName, originalIndex);

                    return (
                      <motion.div
                        key={packName}
                        variants={menuItemVariants}
                        whileHover={enabled ? { scale: 1.02 } : undefined}
                        whileTap={enabled ? { scale: 0.98 } : undefined}
                        className="relative"
                      >
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleSelectPack(packName)}
                          disabled={!enabled}
                          className={cn(
                            "group flex h-auto w-full flex-col items-center gap-1.5 rounded-lg border px-3 py-2 text-center transition-all duration-200",
                            "hover:bg-transparent",
                            isActive
                              ? [colors.bg, colors.border, "border"]
                              : "border-border/50 bg-muted/20 hover:border-muted-foreground/30 hover:bg-muted/30 hover:text-foreground",
                          )}
                        >
                          <div className="flex h-6 items-end justify-center gap-0.5">
                            {[1, 2, 3, 2, 1].map((height, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "w-1 rounded-full transition-all duration-300",
                                  isActive
                                    ? "bg-primary"
                                    : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50",
                                )}
                                style={{
                                  height: isActive
                                    ? `${height * 4}px`
                                    : `${height * 2}px`,
                                  animationDelay: `${i * 0.1}s`,
                                }}
                              />
                            ))}
                          </div>

                          <span
                            className={cn(
                              "text-xs font-medium capitalize",
                              isActive ? colors.text : "text-foreground",
                            )}
                          >
                            {packName}
                          </span>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>

                <FadeLine className="relative" />

                {/* ─── Pagination Buttons ─────────────── */}
                {totalPages > 1 && (
                  <div className="flex w-full items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={page === 0}
                      onClick={(e) => {
                        e.preventDefault();
                        play("press");
                        setPage((prev) => Math.max(0, prev - 1));
                      }}
                      className={cn(
                        "flex h-auto flex-1 items-center justify-center gap-1.5 rounded-lg border-border/50 bg-muted/20 py-2.5 text-xs font-medium text-muted-foreground transition-all duration-200",
                        "hover:border-muted-foreground/30 hover:bg-muted/30 hover:text-foreground active:scale-[0.98]",
                      )}
                    >
                      <ArrowRight5 className="size-3.5 rotate-180" />
                      <span>Prev</span>
                    </Button>

                    <span className="flex min-w-10 items-center justify-center text-[11px] font-medium text-muted-foreground">
                      {page + 1} / {totalPages}
                    </span>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={page === totalPages - 1}
                      onClick={(e) => {
                        e.preventDefault();
                        play("press");
                        setPage((prev) => Math.min(totalPages - 1, prev + 1));
                      }}
                      className={cn(
                        "flex h-auto flex-1 items-center justify-center gap-1.5 rounded-lg border-border/50 bg-muted/20 py-2.5 text-xs font-medium text-muted-foreground transition-all duration-200",
                        "hover:border-muted-foreground/30 hover:bg-muted/30 hover:text-foreground active:scale-[0.98]",
                      )}
                    >
                      <span>Next</span>
                      <ArrowRight5 className="size-3.5" />
                    </Button>
                  </div>
                )}
              </FramePanel>

              {/* ─── Footer ─────────────────────────── */}
              <div className="flex items-center gap-2 px-5 py-4">
                <motion.a
                  variants={menuItemVariants}
                  href="https://uisfx.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => play("forward")}
                  className="group flex w-max items-center gap-1.5 text-xs font-light tracking-[0.03em] text-muted-foreground transition-colors hover:text-primary"
                >
                  <span>Powered by uisfx.com</span>
                  <ArrowRight5 className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </motion.a>

                {enabled && (
                  <div className="ml-auto flex items-center justify-center gap-2">
                    <span className="relative flex size-1.75">
                      <motion.span
                        className={cn(
                          "absolute inset-0 rounded-full opacity-75",
                          activePackColors.dot,
                        )}
                        animate={{
                          scale: [1, 2, 1],
                          opacity: [0.6, 0, 0.6],
                        }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />

                      <span
                        className={cn(
                          "relative size-1.75 rounded-full",
                          activePackColors.dot,
                        )}
                      />
                    </span>
                    <span className="text-xs font-medium capitalize text-foreground">
                      {pack}
                    </span>
                  </div>
                )}
              </div>
            </Frame>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
