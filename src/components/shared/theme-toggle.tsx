/** biome-ignore-all lint/suspicious/noArrayIndexKey: just ignore */
"use client";

import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { FaLinux, FaWindows } from "react-icons/fa";
import { HiOutlineCheck } from "react-icons/hi";
import { IoInvertModeOutline } from "react-icons/io5";
import { MdLaptopMac } from "react-icons/md";
import { PiMoon, PiSun } from "react-icons/pi";
import { RiComputerLine } from "react-icons/ri";
import { THEME_KEY } from "@/constants/keys";
import { menuItemVariants, menuVariants } from "@/constants/variants";
import { useOnClickOutside } from "@/hooks/use-click-outside";
import { useSoundFx } from "../provider/sound-fx";
import { useTheme } from "../provider/theme";
import { useToggle } from "../provider/toggle";
import { IconSwap, IconSwapItem } from "../reusable/chanhdai/icon-swap";
import { Frame, FramePanel } from "../reusable/reui/frame";
import { Button, type buttonVariants } from "../reusable/shadcn/button";
import { Skeleton } from "../reusable/shadcn/skeleton";

type ThemeOption = "light" | "dark" | "system";

interface ThemeItem {
  id: ThemeOption;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ThemeToggle: React.FC<
  ButtonPrimitive.Props & VariantProps<typeof buttonVariants>
> = ({ variant = "default", size = "icon-sm", ...props }) => {
  const { isOpen: openMenu, toggle: toggleMenu } = useToggle("theme");
  const { play } = useSoundFx();
  const { theme, resolvedTheme, setTheme, mounted } = useTheme();
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Dynamic OS Icon State
  const [systemIcon, setSystemIcon] = React.useState<
    React.ComponentType<{ className?: string }>
  >(() => RiComputerLine);

  React.useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes("win")) {
      setSystemIcon(() => FaWindows);
    } else if (userAgent.includes("mac")) {
      setSystemIcon(() => MdLaptopMac);
    } else if (userAgent.includes("linux")) {
      setSystemIcon(() => FaLinux);
    }
  }, []);

  const themeOptions: ThemeItem[] = React.useMemo(
    () => [
      {
        id: "light",
        label: "Light",
        description: "Clean & bright appearance",
        icon: PiSun,
      },
      {
        id: "dark",
        label: "Dark",
        description: "Optimized for low-light",
        icon: PiMoon,
      },
      {
        id: "system",
        label: "System",
        description: "Syncs with your OS settings",
        icon: systemIcon,
      },
    ],
    [systemIcon],
  );

  const toggleOpenMenu = React.useCallback(() => {
    const next = !openMenu;
    play(next ? "toggle-on" : "toggle-off");
    toggleMenu();
  }, [play, openMenu, toggleMenu]);

  useOnClickOutside(containerRef, toggleOpenMenu, openMenu);
  useHotkeys(THEME_KEY, toggleOpenMenu);

  const handleSelectTheme = (selectedTheme: ThemeOption) => {
    setTheme(selectedTheme);
  };

  if (!mounted) return <Skeleton className="h-8 w-8 rounded-full" />;

  const activeTheme = themeOptions.find((item) => theme === item.id);

  const ActiveIcon = themeOptions.find(
    (item) => resolvedTheme === item.id,
  )?.icon;

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
        aria-label="Theme settings"
      >
        <IconSwap>
          <IconSwapItem key={theme}>
            {ActiveIcon ? (
              <ActiveIcon aria-hidden="true" />
            ) : (
              <IoInvertModeOutline aria-hidden="true" />
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
              "absolute top-full right-0 z-40 mt-3 w-80 origin-top-right rounded-[20px]",
              "shadow-[0_5px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_5px_20px_rgba(0,0,0,0.8)]",
            )}
          >
            <Frame
              variant="inverse"
              className="bg-background dark:bg-card rounded-[20px]"
            >
              <FramePanel className="bg-background flex flex-col gap-4 overflow-y-auto overscroll-contain rounded-2xl p-3">
                <div className="grid grid-cols-3 gap-2">
                  {themeOptions.map((item) => {
                    const isActive = theme === item.id;
                    const Icon = item.icon;

                    return (
                      <motion.div
                        key={item.id}
                        variants={menuItemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectTheme(item.id)}
                          className="flex w-full cursor-pointer flex-col items-start gap-1.5 border-0 outline-0 focus-visible:ring-0"
                        >
                          <ThemePreview mode={item.id} isActive={isActive} />

                          <div className="text-muted-foreground flex items-center gap-1.5 px-0.5">
                            <Icon className="size-3.5 shrink-0" />
                            <span className="truncate text-xs font-medium">
                              {item.label}
                            </span>
                          </div>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </FramePanel>

              {/* Footer */}
              <div className="relative flex w-full items-center justify-between gap-2 px-3.5 py-2.5">
                <span className="group text-muted-foreground! flex w-max items-center gap-1.5 text-xs font-light tracking-[0.03em]">
                  {activeTheme?.icon && (
                    <activeTheme.icon className="size-3.5" />
                  )}{" "}
                  {activeTheme?.label}: {activeTheme?.description}
                </span>
              </div>
            </Frame>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function ThemePreview({
  mode,
  isActive,
}: {
  mode: ThemeOption;
  isActive: boolean;
}) {
  if (mode === "light")
    return (
      <div className="relative grid h-16 w-full grid-cols-2 overflow-hidden rounded-md border">
        <div className="col-span-2 flex size-full items-end justify-end bg-[#fafafa] text-[#0a0a0a]">
          <div className="size-[75%] rounded-tl-sm border-t border-l border-[#eeeeee] bg-[#ffffff] pt-1 pl-2">
            <p className="text-left text-sm font-medium">Aa</p>
          </div>
        </div>

        {isActive && (
          <span className="bg-primary absolute right-1.5 bottom-1.5 z-2 flex size-4 items-center justify-center rounded-full">
            <HiOutlineCheck className="text-primary-foreground size-3" />
          </span>
        )}
      </div>
    );

  if (mode === "dark")
    return (
      <div className="relative grid h-16 w-full grid-cols-2 overflow-hidden rounded-md border">
        <div className="col-span-2 flex size-full items-end justify-end bg-[#0e0e0e] text-[#fafafa]">
          <div className="size-[75%] rounded-tl-sm border-t border-l border-[#262626] bg-[#151515] pt-1 pl-2">
            <p className="text-left text-sm font-medium">Aa</p>
          </div>
        </div>

        {isActive && (
          <span className="bg-primary absolute right-1.5 bottom-1.5 z-2 flex size-4 items-center justify-center rounded-full">
            <HiOutlineCheck className="text-primary-foreground size-3" />
          </span>
        )}
      </div>
    );

  return (
    <div className="relative grid h-16 w-full grid-cols-2 overflow-hidden rounded-md border">
      <div className="flex size-full items-end justify-end bg-[#fafafa] text-[#0a0a0a]">
        <div className="size-[75%] rounded-tl-sm border-t border-l border-[#eeeeee] bg-[#ffffff] pt-1 pl-2">
          <p className="text-left text-sm font-medium">Aa</p>
        </div>
      </div>
      <div className="flex size-full items-end justify-end bg-[#0e0e0e] text-[#fafafa]">
        <div className="size-[75%] rounded-tl-sm border-t border-l border-[#262626] bg-[#151515] pt-1 pl-2">
          <p className="text-left text-sm font-medium">Aa</p>
        </div>
      </div>

      {isActive && (
        <span className="bg-primary absolute right-1.5 bottom-1.5 z-2 flex size-4 items-center justify-center rounded-full">
          <HiOutlineCheck className="text-primary-foreground size-3" />
        </span>
      )}
    </div>
  );
}
