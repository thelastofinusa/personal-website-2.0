"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { getInitials } from "@/lib/utils";
import { useSoundFx } from "../provider/sound-fx";
import { Avatar, AvatarFallback, AvatarImage } from "../reusable/shadcn/avatar";
import { containerVariants } from "./container";
import { MenuToggle } from "./menu-toggle";
import { SoundFXSheet } from "./sound-fx-sheet";
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

        <div className="pointer-events-auto wrapper flex relative items-center rounded-full">
          <SoundFXSheet className="bg-background text-foreground hover:bg-background/90" />
          <MenuToggle className="bg-background text-foreground hover:bg-background/90" />
          <ThemeToggle className="bg-background text-foreground hover:bg-background/90" />
        </div>
      </header>
    </nav>
  );
};
