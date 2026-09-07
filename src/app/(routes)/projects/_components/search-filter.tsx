import { cn } from "cn";
import React from "react";
import { CarouselH, SliderVertical2, Xmark } from "reicon-react";

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/reusable/shadcn/input-group";
import { useMediaQuery } from "@/hooks/use-media-query";
import { soundFx } from "@/lib/uisfx";
import type { ISearchFilterProps, TProjectView } from "@/types";

const views = [
  {
    value: "list",
    name: "Nice & Neat",
    default: "List",
    icon: SliderVertical2,
  },
  {
    value: "grid",
    name: "Spread 'Em Out",
    default: "Grid",
    icon: CarouselH,
  },
];

export const SearchFilter: React.FC<ISearchFilterProps> = ({
  searchValue,
  setSearchValue,
  projects,
  query,
  tab,
  view,
  hasActiveFilters,
  setView,
  onClear,
}) => {
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [openMenu, setOpenMenu] = React.useState(false);
  const isSelectingView = React.useRef(false);

  const ButtonIcon = views.find((item) => item.value === view)?.icon;

  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!open && isSelectingView.current) {
      isSelectingView.current = false;
      setOpenMenu(false);
      return;
    }

    soundFx.play(open ? "toggle-on" : "toggle-off");
    setOpenMenu(open);
  }, []);

  const handleViewChange = React.useCallback(
    (value: string) => {
      if (value !== "grid" && value !== "list") return;

      isSelectingView.current = true;
      setView(value as TProjectView);
      soundFx.play("select");
    },
    [setView],
  );

  const resultText = React.useMemo(() => {
    if (!query && !tab && view === "list") {
      return `${projects.length} in total`;
    }

    if (projects.length === 0) {
      return "No results";
    }

    return `${projects.length} ${projects.length === 1 ? "result" : "results"}`;
  }, [projects.length, query, tab, view]);

  return (
    <div className="wrapper flex w-full max-w-md items-center">
      {/* View selector */}
      <DropdownMenu open={openMenu} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={isMobile && hasActiveFilters ? "icon" : "default"}
            aria-label="Change project view"
            className="bg-background! text-foreground"
          >
            {ButtonIcon && (
              <ButtonIcon
                aria-hidden="true"
                className="motion-safe:animate-bell-ring"
              />
            )}

            <p
              className={cn(
                isMobile &&
                  hasActiveFilters &&
                  "absolute translate-x-6 opacity-0 transition-all duration-300 ease-in-out",
              )}
            >
              <span>{views.find((item) => item.value === view)?.default}</span>

              <span className="ml-1 hidden md:inline-block">View</span>
            </p>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Fancy Arrangement</DropdownMenuLabel>

            <DropdownMenuRadioGroup
              value={view}
              onValueChange={handleViewChange}
            >
              {views.map((item) => {
                const Icon = item.icon;

                return (
                  <DropdownMenuRadioItem
                    key={item.value}
                    value={item.value}
                    onClick={() => {
                      isSelectingView.current = true;
                      soundFx.play("select");
                    }}
                  >
                    <Icon />
                    <span>{item.name}</span>
                  </DropdownMenuRadioItem>
                );
              })}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Search */}
      <InputGroup className="rounded-full bg-background! text-foreground">
        <InputGroupInput
          value={searchValue}
          onChange={(event) => {
            setSearchValue(event.target.value);
          }}
          placeholder="Poke around the shelf"
          aria-label="Search projects"
        />

        <InputGroupAddon align="inline-end">
          <InputGroupText className="text-xs">{resultText}</InputGroupText>
        </InputGroupAddon>
      </InputGroup>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          type="button"
          onClick={onClear}
          variant="outline"
          size="icon"
          aria-label="Clear filters"
        >
          <Xmark aria-hidden="true" />
        </Button>
      )}
    </div>
  );
};
