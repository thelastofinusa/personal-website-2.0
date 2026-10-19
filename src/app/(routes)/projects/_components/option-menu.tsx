"use client";

import React from "react";
import { useSoundFx } from "@/components/provider/sound-fx";
import { Button } from "@/components/reusable/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/reusable/shadcn/dropdown-menu";
import { cn } from "@/lib/utils";

export type OptionMenuItem<T extends string> = {
  value: T;
  /** Shown in the menu. */
  name: string;
  /** Shown on the trigger button. */
  short: string;
  icon: React.ElementType;
};

type OptionMenuProps<T extends string> = {
  options: readonly OptionMenuItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** Heading inside the open menu. */
  label: string;
  ariaLabel: string;
  /** Extra word after the trigger text on `md+` screens, e.g. "View". */
  suffix?: string;
  /** Shrink the trigger to just its icon (used on mobile). */
  collapsed?: boolean;
  align?: "start" | "center" | "end";
  reverse?: boolean;
};

/** A button that opens a single-choice dropdown with sound feedback. */
export function OptionMenu<T extends string>({
  options,
  value,
  onValueChange,
  label,
  ariaLabel,
  suffix,
  collapsed = false,
  align = "start",
  reverse = false,
}: OptionMenuProps<T>) {
  const { play } = useSoundFx();
  const [open, setOpen] = React.useState(false);
  const isSelecting = React.useRef(false);

  const active = options.find((option) => option.value === value) ?? options[0];
  const ActiveIcon = active.icon;

  const handleOpenChange = (next: boolean) => {
    // Picking an item closes the menu; its "select" sound already played.
    if (!next && isSelecting.current) {
      isSelecting.current = false;
      setOpen(false);
      return;
    }

    play(next ? "toggle-on" : "toggle-off");
    setOpen(next);
  };

  const handleValueChange = (next: string) => {
    const option = options.find((item) => item.value === next);
    if (!option) return;

    isSelecting.current = true;
    play("select");
    onValueChange(option.value);
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={collapsed ? "icon" : "default"}
          aria-label={ariaLabel}
          className={cn(
            "bg-background! text-foreground",
            reverse && "flex-row-reverse",
          )}
        >
          <ActiveIcon
            aria-hidden="true"
            className="motion-safe:animate-bell-ring"
          />

          <span
            className={cn(
              collapsed &&
                "absolute translate-x-6 opacity-0 transition-all duration-300 ease-in-out",
            )}
          >
            {active.short}
            {suffix && (
              <span className="ml-1 hidden md:inline-block">{suffix}</span>
            )}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>

          <DropdownMenuRadioGroup
            value={value}
            onValueChange={handleValueChange}
          >
            {options.map(({ value: itemValue, name, icon: Icon }) => (
              <DropdownMenuRadioItem
                key={itemValue}
                value={itemValue}
                // Re-picking the current item doesn't fire onValueChange, but
                // still closes the menu, so mark it as a selection too.
                onClick={() => {
                  isSelecting.current = true;
                }}
              >
                <Icon />
                <span>{name}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
