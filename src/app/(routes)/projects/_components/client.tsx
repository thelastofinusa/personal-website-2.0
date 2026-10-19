/** biome-ignore-all lint/correctness/useExhaustiveDependencies: just ignore */
"use client";

import type { Route } from "next";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useSoundFx } from "@/components/provider/sound-fx";

const LivePreviewProvider = dynamic(
  () =>
    import("@/components/provider/live-preview").then(
      (mod) => mod.LivePreviewProvider,
    ),
  { ssr: false, loading: () => <ProjectsPageSkeleton /> },
);

const ImagePreviewProvider = dynamic(
  () =>
    import("@/components/provider/preview").then(
      (mod) => mod.ImagePreviewProvider,
    ),
  { ssr: false, loading: () => null },
);

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/reusable/shadcn/empty";
import { Container } from "@/components/shared/container";
import { CurveThingy } from "@/components/shared/curve-thingy";
import { StackedPagesIllustration } from "@/components/shared/illustration";
import { ProjectsView } from "@/components/shared/projects-view";
import { QuickHero } from "@/components/shared/quick-hero";
import { navLinksData } from "@/constants/navigation";
import { projectMatchesSearch } from "@/lib/project-search";
import {
  DEFAULT_PROJECT_SORT,
  isProjectSort,
  type ProjectSort,
  sortProjects,
} from "@/lib/project-sort";
import type { ISearchFilterProps } from "@/types";
import type {
  ProjectFiltersListQueryResult,
  ProjectsListQueryResult,
} from "~/sanity.types";
import { SearchFilter } from "./search-filter";
import { ProjectsPageSkeleton } from "./skeleton";
import { TabFilter } from "./tab-filter";

export const ProjectsPageClient: React.FC<{
  initialProjects: ProjectsListQueryResult;
  filters: ProjectFiltersListQueryResult;
}> = (props) => {
  const { play } = useSoundFx();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read query params with defaults
  const tab = searchParams.get("tab") ?? undefined;
  const query = searchParams.get("query") ?? "";
  const view =
    (searchParams.get("view") as ISearchFilterProps["view"]) ?? "list";

  const sortParam = searchParams.get("sort");
  const sort = isProjectSort(sortParam) ? sortParam : DEFAULT_PROJECT_SORT;

  const hasActiveFilters =
    Boolean(query) ||
    Boolean(tab && tab !== "all") ||
    sort !== DEFAULT_PROJECT_SORT;

  const tabFilters = React.useMemo(
    () => [
      {
        _id: "first-all",
        slug: "all",
        name: "All",
        description: "Everything I’ve built",
        icon: "StackPerspective",
      },
      ...props.filters,
    ],
    [props.filters],
  );

  const [searchValue, setSearchValue] = React.useState(query);

  const lastParamsRef = React.useRef<string>(searchParams.toString());

  const filteredProjects = React.useMemo(() => {
    const matches = props.initialProjects.filter((project) => {
      const matchesTab =
        !tab || tab === "all" || project.filters?.includes(tab);
      if (!matchesTab) return false;
      return projectMatchesSearch(project, searchValue);
    });

    return sortProjects(matches, sort);
  }, [props.initialProjects, tab, searchValue, sort]);

  const scrollToShowcase = React.useCallback(() => {
    document
      .getElementById("showcase")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Builds the query string for the next URL. It starts from the current params
  // (so their order is preserved) and drops anything that equals its default.
  const buildParams = (
    next: Partial<{
      tab: string;
      view: ISearchFilterProps["view"];
      sort: ProjectSort;
      query: string;
    }> = {},
  ) => {
    const merged = { tab, view, sort, query: searchValue, ...next };
    const params = new URLSearchParams(searchParams.toString());

    const sync = (key: string, value?: string) => {
      if (value) params.set(key, value);
      else params.delete(key);
    };

    sync("query", merged.query);
    sync("tab", merged.tab && merged.tab !== "all" ? merged.tab : undefined);
    sync("view", merged.view !== "list" ? merged.view : undefined);
    sync(
      "sort",
      merged.sort !== DEFAULT_PROJECT_SORT ? merged.sort : undefined,
    );

    return params.toString();
  };

  const pushParams = (paramsStr: string) => {
    lastParamsRef.current = paramsStr;
    router.push(`/projects?${paramsStr}`, { scroll: false });
  };

  const handleTabChange = (newTab: string) => {
    pushParams(buildParams({ tab: newTab }));
    if (newTab !== "all") scrollToShowcase();
  };

  const handleViewChange = (newView: ISearchFilterProps["view"]) => {
    pushParams(buildParams({ view: newView }));
    scrollToShowcase();
  };

  const handleSortChange = (newSort: ProjectSort) => {
    pushParams(buildParams({ sort: newSort }));
    scrollToShowcase();
  };

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      const newParamsStr = buildParams();
      if (newParamsStr !== lastParamsRef.current) {
        pushParams(newParamsStr);
        scrollToShowcase();
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchValue, scrollToShowcase]);

  React.useEffect(() => {
    const currentParams = searchParams.toString();
    if (currentParams === lastParamsRef.current) return;

    lastParamsRef.current = currentParams;
    setSearchValue(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Determine empty state
  const emptyState = React.useMemo(() => {
    if (props.initialProjects.length === 0) {
      return {
        title: "The shelf is empty",
        description:
          "Nothing to see here yet. I'm still putting things on the shelf.",
      };
    }
    if (searchValue) {
      return {
        title: "Nothing came up",
        description: `Couldn't find anything matching “${searchValue}”.`,
      };
    }
    if (tab && tab !== "all") {
      const filter = tabFilters.find((item) => item.slug === tab);
      return {
        title: `No ${filter?.name ?? "projects"} project yet`,
        description: "This corner of the shelf is looking suspiciously empty.",
      };
    }
    return {
      title: "No projects",
      description: "Apparently I have misplaced the entire shelf.",
    };
  }, [props.initialProjects.length, searchValue, tab, tabFilters]);

  const handleClearFilters = React.useCallback(() => {
    setSearchValue("");
    lastParamsRef.current = "";

    router.push("/projects", { scroll: false });

    play("back");
  }, [router]);

  // Extract images for preview
  const images = filteredProjects.map((project) => ({
    alt: project.name ?? undefined,
    url: project.mainImage?.image ?? "",
    ogUrl: project.url ?? undefined,
  }));

  return (
    <LivePreviewProvider projects={filteredProjects}>
      <div className="flex-1 overflow-x-clip">
        <QuickHero
          eyebrow={{
            icon: navLinksData(pathname as Route)?.icon,
            label: navLinksData(pathname as Route)?.eyebrow as string,
          }}
          title={navLinksData(pathname as Route)?.title as string}
          description={navLinksData(pathname as Route)?.description as string}
          component={
            props.filters.length > 0
              ? {
                  content: (
                    <TabFilter
                      activeTab={tab || "all"}
                      filters={tabFilters}
                      onTabChange={handleTabChange}
                    />
                  ),
                }
              : undefined
          }
        />
        <CurveThingy tCurve hash="showcase">
          <div
            id="showcase"
            className="flex flex-col gap-8 pt-20 sm:pt-30 md:gap-12 md:pt-36"
          >
            <Container size={view === "list" ? "sm" : "md"}>
              <SearchFilter
                query={query}
                tab={tab}
                hasActiveFilters={hasActiveFilters}
                projects={filteredProjects}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                view={view}
                setView={handleViewChange}
                sort={sort}
                setSort={handleSortChange}
                onClear={handleClearFilters}
              />
            </Container>

            {filteredProjects.length > 0 ? (
              <ImagePreviewProvider images={images}>
                <ProjectsView
                  projects={filteredProjects}
                  view={view}
                  activeTab={tab ?? "all"}
                  tabFilters={tabFilters}
                />
              </ImagePreviewProvider>
            ) : (
              <Container size="sm">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia>
                      <StackedPagesIllustration />
                    </EmptyMedia>
                    <EmptyTitle>{emptyState.title}</EmptyTitle>
                    <EmptyDescription>
                      {emptyState.description}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </Container>
            )}
          </div>

          {filteredProjects.length > 0 && (
            <div className="flex flex-col items-center justify-center gap-3 px-6">
              <span className="h-px w-8 bg-border" />

              <p className="text-center font-extralight text-muted-foreground/60 text-sm italic md:text-base">
                More things are being built.
                <br />
                They’ll show up when they’re ready.
              </p>
            </div>
          )}
        </CurveThingy>
      </div>
    </LivePreviewProvider>
  );
};
