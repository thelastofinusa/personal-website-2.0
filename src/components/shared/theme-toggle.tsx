"use client";

import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";
import type React from "react";
import { MoonFog, SunFog3 } from "reicon-react";
import { useTheme } from "../provider/theme";
import { IconSwap, IconSwapItem } from "../reusable/chanhdai/icon-swap";
import { Button, type buttonVariants } from "../reusable/shadcn/button";
import { Skeleton } from "../reusable/shadcn/skeleton";

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
            <SunFog3 aria-hidden="true" />
          ) : (
            <MoonFog aria-hidden="true" />
          )}
        </IconSwapItem>
      </IconSwap>

      <span className="sr-only">{switchText}</span>
    </Button>
  );
};
