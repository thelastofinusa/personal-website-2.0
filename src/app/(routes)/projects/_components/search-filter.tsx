import React from "react";
import { BiSortAZ, BiSortDown, BiSortUp, BiSortZA } from "react-icons/bi";
import { SliderHorizontal2, SliderVertical2, Xmark } from "reicon-react";
import { Button } from "@/components/reusable/shadcn/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/reusable/shadcn/input-group";
import { Kbd } from "@/components/reusable/shadcn/kbd";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useOperatingSystem } from "@/hooks/use-operating-system";
import type { ProjectSort } from "@/lib/project-sort";
import type { ISearchFilterProps, TProjectView } from "@/types";
import { OptionMenu, type OptionMenuItem } from "./option-menu";

const views: OptionMenuItem<TProjectView>[] = [
  {
    value: "list",
    name: "Nice & Neat",
    short: "List",
    icon: SliderVertical2,
  },
  {
    value: "grid",
    name: "Spread 'Em Out",
    short: "Grid",
    icon: SliderHorizontal2,
  },
];

// Add an entry here (and to `comparators` in lib/project-sort.ts) to add a sort.
const sorts: OptionMenuItem<ProjectSort>[] = [
  {
    value: "latest",
    name: "Fresh Off the Press",
    short: "Latest",
    icon: BiSortDown,
  },
  {
    value: "oldest",
    name: "Dusty Classics",
    short: "Oldest",
    icon: BiSortUp,
  },
  { value: "az", name: "A to Z", short: "A–Z", icon: BiSortAZ },
  { value: "za", name: "Z to A", short: "Z–A", icon: BiSortZA },
];

export const SearchFilter: React.FC<ISearchFilterProps> = ({
  searchValue,
  setSearchValue,
  projects,
  query,
  tab,
  view,
  sort,
  hasActiveFilters,
  setView,
  setSort,
  onClear,
}) => {
  const os = useOperatingSystem();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const modifierKey = os === "mac" ? "⌘" : "Ctrl";
  const collapsed = isMobile && hasActiveFilters;

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
    <div className="flex w-full flex-col gap-2">
      <p className="hidden px-4 font-medium text-muted-foreground text-xs leading-relaxed md:block">
        <span className="font-semibold text-foreground">Pro tip:</span> Hold{" "}
        <Kbd>{modifierKey}</Kbd> and click on any project to peek at a live
        preview
      </p>

      <div className="flex w-full items-center gap-2">
        <div className="wrapper flex w-full max-w-md items-center">
          {/* View selector */}
          <OptionMenu
            options={views}
            value={view}
            onValueChange={setView}
            label="Fancy Arrangement"
            ariaLabel="Change project view"
            suffix="View"
            collapsed={collapsed}
          />

          {/* Search */}
          <InputGroup className="rounded-full bg-background! text-foreground">
            <InputGroupInput
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
              }}
              placeholder={
                isMobile ? "Type to search..." : "Search the collection..."
              }
              aria-label="Search projects"
              className="shadow-none!"
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
              variant="ghost"
              size="icon"
              aria-label="Clear filters"
            >
              <Xmark aria-hidden="true" />
            </Button>
          )}
        </div>

        {/* Sort selector */}
        <div className="wrapper ml-auto flex items-center">
          <OptionMenu
            options={sorts}
            value={sort}
            onValueChange={setSort}
            label="Pecking Order"
            ariaLabel="Sort projects"
            collapsed={collapsed}
            align="end"
            reverse
          />
        </div>
      </div>
    </div>
  );
};
