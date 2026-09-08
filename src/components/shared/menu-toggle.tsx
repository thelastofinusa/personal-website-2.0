"use client";

import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { AnimatePresence, motion } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ArrowRight5, Discover2, Menu4, Xmark } from "reicon-react";
import { siteConfig } from "@/config/site.config";
import { MENU_KEY } from "@/constants/keys";
import { navLinks } from "@/constants/navigation";
import { menuItemVariants, menuVariants } from "@/constants/variants";
import { useOnClickOutside } from "@/hooks/use-click-outside";
import { resolveIcon } from "@/lib/icons";
import { decodeString, getInitials } from "@/lib/utils";
import { useSoundFx } from "../provider/sound-fx";
import { useToggle } from "../provider/toggle";
import { IconSwap, IconSwapItem } from "../reusable/chanhdai/icon-swap";
import { Frame, FramePanel } from "../reusable/reui/frame";
import { Avatar, AvatarFallback, AvatarImage } from "../reusable/shadcn/avatar";
import { Button, type buttonVariants } from "../reusable/shadcn/button";
import { Skeleton } from "../reusable/shadcn/skeleton";

export const MenuToggle: React.FC<
  ButtonPrimitive.Props & VariantProps<typeof buttonVariants>
> = ({ variant = "default", size = "sm", ...props }) => {
  const { play } = useSoundFx();
  const pathname = usePathname();
  const { isOpen: openMenu, toggle, close: closeMenu } = useToggle("menu");

  const email = decodeString(siteConfig.author.email);
  const phone = decodeString(siteConfig.author.phone);

  const [mounted, setMounted] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const toggleOpenMenu = React.useCallback(() => {
    const next = !openMenu;
    play(next ? "toggle-on" : "toggle-off");
    toggle();
  }, [play, openMenu, toggle]);

  useOnClickOutside(containerRef, closeMenu, openMenu);

  useHotkeys(MENU_KEY, toggleOpenMenu);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!openMenu) return;

    const handleScroll = () => {
      closeMenu();
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [openMenu, closeMenu]);

  const isRouteActive = React.useCallback(
    (to: string) => {
      if (to === "/") {
        return pathname === "/";
      }

      return pathname === to || pathname.startsWith(`${to}/`);
    },
    [pathname],
  );

  if (!mounted) {
    return <Skeleton className="h-8 w-20.75 rounded-full" />;
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
      >
        <span>Menu</span>

        <IconSwap>
          <IconSwapItem key={openMenu ? "close" : "open"}>
            {openMenu ? (
              <Xmark className="size-4" />
            ) : (
              <Menu4 className="size-4" />
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
              <FramePanel className="flex flex-col gap-1 p-2 bg-background">
                {navLinks.map((route) => {
                  const isActive = isRouteActive(route.href);
                  const Icon = route.icon;

                  return (
                    <motion.div key={route.href} variants={menuItemVariants}>
                      <Link
                        href={route.href}
                        onClick={() => {
                          closeMenu();
                          play("forward");
                        }}
                        className="group block"
                        title={`${route.eyebrow} - ${route.title}`}
                        aria-describedby={`${route.href}-description`}
                      >
                        <div
                          className={cn(
                            "relative flex items-center justify-between rounded-lg p-3 transition-all duration-200",
                            "hover:bg-muted/60",
                            isActive
                              ? "bg-muted font-medium text-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              {route.href === "/" ? (
                                <Avatar size="xs" className="size-4!">
                                  <AvatarImage
                                    src={siteConfig.author.avatar}
                                    alt={siteConfig.author.name}
                                  />

                                  <AvatarFallback className="border">
                                    {getInitials(siteConfig.author.name)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <Icon className="size-4" />
                              )}

                              <span className="text-sm font-medium leading-none transition-transform duration-200 group-hover:translate-x-0.5">
                                {route.eyebrow}
                              </span>
                            </div>

                            <span
                              id={`${route.href}-description`}
                              className="text-xs font-light text-muted-foreground"
                            >
                              {route.title}
                            </span>
                          </div>

                          {isActive ? (
                            <Discover2 className="size-4 text-primary motion-safe:animate-bell-ring" />
                          ) : (
                            <ArrowRight5
                              className={cn(
                                "size-4 -translate-x-2 opacity-0 transition-all duration-200",
                                "group-hover:translate-x-0 group-hover:opacity-100",
                              )}
                            />
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </FramePanel>

              <div className="flex flex-col gap-3 px-5.5 py-4">
                <div className="flex items-center gap-3">
                  {siteConfig.socials.map((social) => {
                    const Icon = resolveIcon(social.platform);

                    return (
                      <motion.div
                        key={social.platform}
                        variants={menuItemVariants}
                      >
                        <Link
                          href={social.url as Route}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group"
                          title={social.platform}
                          aria-label={social.platform}
                          onClick={() => play("forward")}
                        >
                          <Icon className="size-4.5 group-hover:text-primary" />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="space-y-px">
                  <motion.a
                    variants={menuItemVariants}
                    href={`mailto:${email}`}
                    onClick={() => play("forward")}
                    className="flex w-max items-center gap-1.5 text-sm font-extralight tracking-[0.03em] hover:text-primary"
                  >
                    {email}
                  </motion.a>

                  <motion.a
                    variants={menuItemVariants}
                    href={`tel:${phone}`}
                    onClick={() => play("forward")}
                    className="flex w-max items-center gap-1.5 text-sm font-extralight tracking-[0.03em] hover:text-primary"
                  >
                    {phone}
                  </motion.a>
                </div>
              </div>
            </Frame>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
