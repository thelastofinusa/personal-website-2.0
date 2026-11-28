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
  DropdownMenuSeparator,
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

export type OptionMenuSection<T extends string = string> = {
  id: string;
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: readonly OptionMenuItem<T>[];
};

type OptionMenuProps<T extends string> = {
  options?: readonly OptionMenuItem<T>[];
  value?: T;
  onValueChange?: (value: T) => void;
  /** Multiple labeled radio groups separated by a divider. */
  sections?: readonly OptionMenuSection<string>[];
  /** Override the trigger icon when using `sections`. */
  triggerIcon?: React.ElementType;
  /** Override the trigger label when using `sections`. */
  triggerLabel?: string;
  /** Heading inside the open menu when using single `options`. */
  label?: string;
  ariaLabel: string;
  /** Extra word after the trigger text on `md+` screens, e.g. "View". */
  suffix?: string;
  /** Shrink the trigger to just its icon (used on mobile). */
  collapsed?: boolean;
  align?: "start" | "center" | "end";
  reverse?: boolean;
};

/** A button that opens a single-choice or multi-section dropdown with sound feedback. */
export function OptionMenu<T extends string>({
  options = [],
  value = "" as T,
  onValueChange = () => {},
  sections,
  triggerIcon,
  triggerLabel,
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
  const ActiveIcon = triggerIcon ?? active?.icon;
  const displayText = triggerLabel ?? active?.short;

  const resolvedSections: readonly OptionMenuSection<string>[] = sections ?? [
    {
      id: "default",
      label: label ?? "",
      value,
      onValueChange: (next) => onValueChange(next as T),
      options,
    },
  ];

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

  const handleSectionValueChange = (
    section: OptionMenuSection<string>,
    next: string,
  ) => {
    const option = section.options.find((item) => item.value === next);
    if (!option) return;

    isSelecting.current = true;
    play("select");
    section.onValueChange(option.value);
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={collapsed ? "icon" : "default"}
          aria-label={ariaLabel}
          className={cn(
            "bg-background! text-foreground text-[10px]",
            reverse && "flex-row-reverse",
          )}
        >
          {ActiveIcon && (
            <ActiveIcon
              aria-hidden="true"
              className="motion-safe:animate-bell-ring size-3.5"
            />
          )}

          <span
            className={cn(
              collapsed &&
                "absolute translate-x-6 opacity-0 transition-all duration-300 ease-in-out",
            )}
          >
            {displayText}
            {suffix && <span className="ml-1">{suffix}</span>}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-56">
        {resolvedSections.map((section, sectionIndex) => (
          <React.Fragment key={section.id}>
            {sectionIndex > 0 && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              {section.label && (
                <DropdownMenuLabel className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                  {section.label}
                </DropdownMenuLabel>
              )}

              <DropdownMenuRadioGroup
                value={section.value}
                onValueChange={(next) =>
                  handleSectionValueChange(section, next)
                }
              >
                {section.options.map(
                  ({ value: itemValue, name, icon: Icon }) => (
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
                  ),
                )}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
