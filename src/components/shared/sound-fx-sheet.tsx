"use client";

import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ArrowRight5, Discover2, Play3, VolumeUp, VolumeX } from "reicon-react";
import { packNames, type PackName as UISFXPackName } from "uisfx";
import { SOUND_KEY } from "@/constants/keys";
import { menuItemVariants, menuVariants } from "@/constants/variants";
import { useOnClickOutside } from "@/hooks/use-click-outside";
import { useSoundFx } from "../provider/sound-fx";
import { IconSwap, IconSwapItem } from "../reusable/chanhdai/icon-swap";
import { Frame, FramePanel } from "../reusable/reui/frame";
import { Button, type buttonVariants } from "../reusable/shadcn/button";
import { Skeleton } from "../reusable/shadcn/skeleton";

export const SoundFXSheet: React.FC<
  ButtonPrimitive.Props & VariantProps<typeof buttonVariants>
> = ({ variant = "default", size = "icon-sm", ...props }) => {
  const { enabled, pack, toggle, setEnabled, setPack, play } = useSoundFx();

  const [mounted, setMounted] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const closeMenu = React.useCallback(() => {
    setOpenMenu(false);
  }, []);

  const toggleOpenMenu = React.useCallback(() => {
    setOpenMenu((prev) => {
      const next = !prev;
      play(next ? "toggle-on" : "toggle-off");
      if (next) {
        window.dispatchEvent(
          new CustomEvent("nav:menu-open", { detail: "soundfx" }),
        );
      }
      return next;
    });
  }, [play]);

  useOnClickOutside(containerRef, closeMenu, openMenu);

  useHotkeys(SOUND_KEY, toggleOpenMenu);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for navigation menu events to close this sheet when another menu opens
  React.useEffect(() => {
    const handleOtherMenuOpen = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail !== "soundfx") {
        setOpenMenu(false);
      }
    };

    window.addEventListener("nav:menu-open", handleOtherMenuOpen);
    return () => {
      window.removeEventListener("nav:menu-open", handleOtherMenuOpen);
    };
  }, []);

  React.useEffect(() => {
    if (!openMenu) return;

    // Ignore scroll events originating inside the menu container
    const handleScroll = (event: Event) => {
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }
      setOpenMenu(false);
    };

    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [openMenu]);

  const handleSelectPack = (selectedPack: UISFXPackName) => {
    setPack(selectedPack);
    if (!enabled) setEnabled(true);
    play("achievement");
  };

  if (!mounted) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

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
              {/* Header Toggle Row */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Audio Effects
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {enabled ? "Enabled" : "Muted"}
                  </span>
                </div>

                <Button
                  type="button"
                  variant={enabled ? "default" : "outline"}
                  size="sm"
                  className="h-7 rounded-full px-3 text-xs"
                  onClick={() => {
                    toggle();
                  }}
                >
                  {enabled ? "Mute" : "Enable"}
                </Button>
              </div>

              {/* Sound Packs List */}
              <FramePanel className="grid grid-cols-2 gap-1 overflow-y-auto overscroll-contain bg-background p-2">
                {packNames.map((packName) => {
                  const isActive = pack === packName && enabled;

                  return (
                    <motion.div key={packName} variants={menuItemVariants}>
                      <button
                        type="button"
                        onClick={() => handleSelectPack(packName)}
                        className="group w-full text-left disabled:pointer-events-none disabled:opacity-50"
                        disabled={!enabled}
                      >
                        <div
                          className={cn(
                            "relative flex items-center justify-between rounded-lg p-2.5 transition-all duration-200",
                            "hover:bg-muted/60",
                            isActive
                              ? "bg-muted font-medium text-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <span className="text-sm font-medium capitalize transition-transform duration-200 group-hover:translate-x-0.5">
                            {packName}
                          </span>

                          <div className="relative flex size-4 items-center justify-center">
                            {isActive ? (
                              <>
                                <Discover2 className="size-4 text-primary motion-safe:animate-bell-ring group-hover:hidden" />
                                <Play3 className="hidden size-4 text-primary group-hover:block" />
                              </>
                            ) : (
                              <Play3
                                className={cn(
                                  "size-4 -translate-x-2 text-primary opacity-0 transition-all duration-200",
                                  "group-hover:translate-x-0 group-hover:opacity-100",
                                )}
                              />
                            )}
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </FramePanel>

              {/* External Reference Footer */}
              <div className="flex flex-col gap-2 px-5 py-4">
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
              </div>
            </Frame>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
