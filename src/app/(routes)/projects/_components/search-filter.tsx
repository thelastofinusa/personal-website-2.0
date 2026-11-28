import React from "react";
import { BiSortAZ, BiSortDown, BiSortUp, BiSortZA } from "react-icons/bi";
import {
  Filter,
  Layers,
  SliderHorizontal2,
  SliderVertical2,
  Sparkles,
  Xmark,
} from "reicon-react";
import { Button } from "@/components/reusable/shadcn/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/reusable/shadcn/input-group";
import { Kbd } from "@/components/reusable/shadcn/kbd";
import { usePeekShortcut } from "@/hooks/use-peek-shortcut";
import type { ProjectSort } from "@/lib/project-sort";
import type {
  ISearchFilterProps,
  TProjectImportanceFilter,
  TProjectView,
} from "@/types";
import {
  OptionMenu,
  type OptionMenuItem,
  type OptionMenuSection,
} from "./option-menu";

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

const importanceOptions: OptionMenuItem<TProjectImportanceFilter>[] = [
  {
    value: "all",
    name: "Everything",
    short: "All",
    icon: Filter,
  },
  {
    value: "important",
    name: "The Highlights",
    short: "Important",
    icon: Sparkles,
  },
  {
    value: "less-important",
    name: "Side Quests",
    short: "Less Important",
    icon: Layers,
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
  importance,
  hasActiveFilters,
  setView,
  setSort,
  setImportance,
  onClear,
}) => {
  const { canPeek, modifierLabel } = usePeekShortcut();

  const activeSort = sorts.find((item) => item.value === sort) ?? sorts[0];
  const activeImportance =
    importanceOptions.find((item) => item.value === importance) ??
    importanceOptions[0];

  const rightSections: readonly OptionMenuSection<string>[] = React.useMemo(
    () => [
      {
        id: "sort",
        label: "Pecking Order",
        value: sort,
        onValueChange: (val) => setSort(val as ProjectSort),
        options: sorts,
      },
      {
        id: "importance",
        label: "Priority Tier",
        value: importance,
        onValueChange: (val) => setImportance(val as TProjectImportanceFilter),
        options: importanceOptions,
      },
    ],
    [sort, importance, setSort, setImportance],
  );

  const rightTriggerLabel =
    importance !== "all"
      ? `${activeSort.short} · ${activeImportance.short}`
      : activeSort.short;

  const resultText = React.useMemo(() => {
    if (!query && !tab && importance === "all" && view === "list") {
      return `${projects.length} in total`;
    }

    if (projects.length === 0) {
      return "No results";
    }

    return `${projects.length} ${projects.length === 1 ? "result" : "results"}`;
  }, [projects.length, query, tab, importance, view]);

  return (
    <div className="flex w-full flex-col gap-2.5 md:gap-2">
      {canPeek && (
        <p className="text-muted-foreground hidden px-4 text-xs leading-relaxed font-medium md:block">
          <span className="text-foreground font-semibold">Pro tip:</span> Hold{" "}
          <Kbd>{modifierLabel}</Kbd> and click on any project to peek at a live
          preview
        </p>
      )}

      <div className="flex w-full flex-col gap-2 md:flex-row md:items-center">
        {/* Desktop: View + Search together | Mobile: Full-width Search row */}
        <div className="wrapper flex w-full items-center md:w-auto md:max-w-md md:flex-1">
          <div className="hidden md:flex md:items-center">
            <OptionMenu
              options={views}
              value={view}
              onValueChange={setView}
              label="Fancy Arrangement"
              ariaLabel="Change project view"
              suffix="View"
              align="start"
            />
          </div>

          <InputGroup className="bg-background! text-foreground w-full rounded-full">
            <InputGroupInput
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
              }}
              placeholder="Search the collection.."
              aria-label="Search projects"
              className="shadow-none!"
            />

            <InputGroupAddon align="inline-end">
              <InputGroupText className="text-xs">{resultText}</InputGroupText>
            </InputGroupAddon>
          </InputGroup>

          {hasActiveFilters && (
            <Button
              type="button"
              onClick={onClear}
              variant="ghost"
              size="icon"
              aria-label="Clear filters"
              className="shrink-0 rounded-full"
            >
              <Xmark aria-hidden="true" />
            </Button>
          )}
        </div>

        {/* Mobile: View (left) + Sort/Importance (right) | Desktop: Right menu */}
        <div className="flex w-full items-center justify-between gap-2 md:ml-auto md:w-auto md:justify-end">
          <div className="wrapper flex items-center md:hidden">
            <OptionMenu
              options={views}
              value={view}
              onValueChange={setView}
              label="Fancy Arrangement"
              ariaLabel="Change project view"
              suffix="View"
              align="start"
            />
          </div>

          <div className="wrapper ml-auto flex items-center">
            <OptionMenu
              sections={rightSections}
              triggerIcon={activeSort.icon}
              triggerLabel={rightTriggerLabel}
              ariaLabel="Sort and filter projects by importance"
              align="end"
              reverse
            />
          </div>
        </div>
      </div>
    </div>
  );
};
