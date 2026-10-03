"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { getInitials } from "@/lib/utils";
import { useSoundFx } from "../provider/sound-fx";
import { Avatar, AvatarFallback, AvatarImage } from "../reusable/shadcn/avatar";
import { containerVariants } from "./container";
import { MenuToggle } from "./menu-toggle";
import { SoundFXToggle } from "./sound-fx-toggle";
import { ThemeToggle } from "./theme-toggle";

export const Navigation = () => {
  const { play } = useSoundFx();

  return (
    <nav className="pointer-events-none fixed top-0 left-0 z-50 w-full">
      <header
        className={containerVariants({
          size: "md",
          className: "flex items-center justify-between py-4 md:py-6",
        })}
      >
        <Link
          href="/"
          className="pointer-events-auto"
          onClick={() => play("forward")}
        >
          <Avatar size="sm" className="border">
            <AvatarImage
              src={siteConfig.author.avatar}
              alt={siteConfig.author.name}
            />
            <AvatarFallback className="bg-background text-foreground">
              {getInitials(siteConfig.author.name)}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="relative pointer-events-auto flex items-center gap-2">
          <div className="wrapper flex items-center rounded-full">
            <SoundFXToggle variant="inverse" />
          </div>

          <div className="wrapper flex items-center rounded-full">
            <MenuToggle variant="inverse" />
            <ThemeToggle variant="inverse" />
          </div>
        </div>
      </header>
    </nav>
  );
};
