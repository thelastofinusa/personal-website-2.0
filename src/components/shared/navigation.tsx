import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { soundFx } from "@/lib/uisfx";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../reusable/shadcn/avatar";
import { containerVariants } from "./container";
import { MenuToggle } from "./menu-toggle";
import { ThemeToggle } from "./theme-toggle";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 pointer-events-none">
      <header
        className={containerVariants({
          size: "md",
          className: "py-4 md:py-6 flex items-center justify-between",
        })}
      >
        <Link
          href="/"
          className="pointer-events-auto"
          onClick={() => soundFx.play("forward")}
          onMouseEnter={() => soundFx.play("hover")}
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

        <div className="wrapper pointer-events-auto flex items-center rounded-full">
          <MenuToggle className="bg-background text-foreground hover:bg-background/90" />
          <ThemeToggle className="bg-background text-foreground hover:bg-background/90" />
        </div>
      </header>
    </nav>
  );
};
