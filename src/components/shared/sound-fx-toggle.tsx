/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ArrowRight5, Soundwave, VolumeUp, VolumeX } from "reicon-react";
import { type PackName, packNames } from "uisfx";
import { SOUND_KEY } from "@/constants/keys";
import { menuItemVariants, menuVariants } from "@/constants/variants";
import { useOnClickOutside } from "@/hooks/use-click-outside";
import { useSoundFx } from "../provider/sound-fx";
import { useToggle } from "../provider/toggle";
import { IconSwap, IconSwapItem } from "../reusable/chanhdai/icon-swap";
import { Frame, FramePanel } from "../reusable/reui/frame";
import { Button, type buttonVariants } from "../reusable/shadcn/button";
import { Skeleton } from "../reusable/shadcn/skeleton";
import { FadeLine } from "./fade-line";

// ─── Generate a color per pack dynamically ──────
// Updated to a new, diverse color palette
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
  const { enabled, pack, toggle, setEnabled, setPack, play } = useSoundFx();

  const [mounted, setMounted] = React.useState(false);
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

  useOnClickOutside(containerRef, closeMenu, openMenu);

  useHotkeys(SOUND_KEY, toggleOpenMenu);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!openMenu) {
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

  if (!mounted) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  const activePackIndex = allPacks.indexOf(pack);
  const activePackColors =
    activePackIndex >= 0
      ? getPackColors(pack, activePackIndex)
      : PACK_COLORS[0];

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
        <IconSwap>
          <IconSwapItem key={enabled ? "volume-up" : "volume-x"}>
            {enabled ? (
              <VolumeUp className="size-4" />
            ) : (
              <VolumeX className="size-4" />
            )}
          </IconSwapItem>
        </IconSwap>
      </Button>

      <AnimatePresence>
        {openMenu && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={cn(
              "absolute right-0 top-full z-40 mt-3 w-80 origin-top-right rounded-[20px]!",
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
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2.5">
                    <Soundwave className="size-4.5 text-muted-foreground" />
                    <span className="text-sm font-medium">Sound Effects</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-light w-3 text-muted-foreground">
                      {enabled ? "On" : "Off"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        toggle();
                        play(enabled ? "remove-from-cart" : "add-to-cart");
                      }}
                      className={cn(
                        "relative h-5 w-9 rounded-full transition-colors duration-200",
                        enabled ? "bg-primary" : "bg-muted-foreground/30",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 h-4 w-4 left-0 rounded-full bg-white shadow-sm transition-transform duration-200",
                          enabled ? "translate-x-4.5" : "translate-x-0.5",
                        )}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {visiblePacks.map((packName, index) => {
                    const isActive = pack === packName && enabled;
                    // Keep colors consistent with their original index
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
                            "group flex h-auto w-full flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-200",
                            "hover:bg-transparent",
                            isActive
                              ? [colors.bg, colors.border, "border"]
                              : "border-border/50 bg-muted/20 hover:border-muted-foreground/30 hover:bg-muted/30 hover:text-foreground",
                          )}
                        >
                          {/* Waveform / visual indicator */}
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
                      disabled={!enabled || page === 0}
                      onClick={(e) => {
                        e.preventDefault();
                        play("press");
                        setPage((prev) => Math.max(0, prev - 1));
                      }}
                      className={cn(
                        "flex h-auto flex-1 items-center justify-center gap-1.5 rounded-xl border-border/50 bg-muted/20 py-2.5 text-xs font-medium text-muted-foreground transition-all duration-200",
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
                      disabled={!enabled || page === totalPages - 1}
                      onClick={(e) => {
                        e.preventDefault();
                        play("press");
                        setPage((prev) => Math.min(totalPages - 1, prev + 1));
                      }}
                      className={cn(
                        "flex h-auto flex-1 items-center justify-center gap-1.5 rounded-xl border-border/50 bg-muted/20 py-2.5 text-xs font-medium text-muted-foreground transition-all duration-200",
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
