"use client";

import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";
import type React from "react";
import { Moon, Sun } from "reicon-react";

import { THEME_KEY } from "@/constants/keys";
import { useTheme } from "../provider/theme";
import { IconSwap, IconSwapItem } from "../reusable/chanhdai/icon-swap";
import { Button, type buttonVariants } from "../reusable/shadcn/button";
import { Skeleton } from "../reusable/shadcn/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../reusable/shadcn/tooltip";

export const ThemeToggle: React.FC<
  ButtonPrimitive.Props & VariantProps<typeof buttonVariants>
> = ({ variant = "default", size = "icon-sm", ...props }) => {
  const { setTheme, resolvedTheme, mounted } = useTheme();

  if (!mounted) {
    return <Skeleton className="size-8 rounded-full" />;
  }

  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";

  const switchText =
    nextTheme === "dark" ? "Put the sun in timeout" : "Let the sun back in";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant={variant}
            size={size}
            {...props}
            onClick={() => setTheme(nextTheme)}
            aria-label={`Switch to ${nextTheme} mode`}
            title={switchText}
          >
            <IconSwap>
              <IconSwapItem key={resolvedTheme}>
                {resolvedTheme === "dark" ? (
                  <Sun aria-hidden="true" />
                ) : (
                  <Moon aria-hidden="true" />
                )}
              </IconSwapItem>
            </IconSwap>

            <span className="sr-only">{switchText}</span>
          </Button>
        }
      />

      <TooltipContent align="end" side="bottom" sideOffset={6}>
        <p className="text-xs">
          Press{" "}
          <span className="font-mono uppercase font-[11px]">{THEME_KEY}</span>{" "}
          to toggle theme
        </p>
      </TooltipContent>
    </Tooltip>
  );
};
