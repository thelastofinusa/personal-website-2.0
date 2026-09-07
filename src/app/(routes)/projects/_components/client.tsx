/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { ImagePreviewProvider } from "@/components/provider/preview";
import { useSoundFx } from "@/components/provider/sound-fx";
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
import type { ISearchFilterProps } from "@/types";
import type {
  ProjectFiltersListQueryResult,
  ProjectsListQueryResult,
} from "~/sanity.types";
import { SearchFilter } from "./search-filter";
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

  const hasActiveFilters = Boolean(query) || Boolean(tab && tab !== "all");

  const tabFilters = React.useMemo(
    () => [
      {
        _id: "first-all",
        slug: "all",
        name: "Everything",
        description: "Everything I've been up to",
        icon: "StackPerspective",
      },
      ...props.filters,
    ],
    [props.filters],
  );

  // Local search input state. This is the single source of truth for what's
  // typed and for what's filtered — the URL is just a (debounced) mirror of
  // it, not the other way around.
  const [searchValue, setSearchValue] = React.useState(query);

  // Tracks the last URL search string *we* pushed, so the "external nav"
  // sync effect below can tell the difference between "the URL changed
  // because we just pushed it" and "the URL changed because the user hit
  // back/forward or landed on a link with a query param".
  const lastParamsRef = React.useRef<string>(searchParams.toString());

  // Filter projects based on tab + the live input value (not the URL).
  // This is what makes typing feel instant instead of waiting on a
  // debounced router.push + re-render round trip.
  const filteredProjects = React.useMemo(() => {
    return props.initialProjects.filter((project) => {
      const matchesTab =
        !tab || tab === "all" || project.filters?.includes(tab);
      if (!matchesTab) return false;
      return projectMatchesSearch(project, searchValue);
    });
  }, [props.initialProjects, tab, searchValue]);

  // Imperative smooth scroll to the showcase section. We deliberately don't
  // rely on pushing a `#showcase` URL hash for this: Next's own hash
  // navigation snaps the page to the fragment as part of the route commit,
  // which either races with or completely overrides any CSS
  // (`scroll-behavior: smooth`) animation already in progress — that's the
  // "jumps instead of scrolling" symptom. Calling scrollIntoView ourselves
  // guarantees the animation actually plays.
  const scrollToShowcase = React.useCallback(() => {
    document
      .getElementById("showcase")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Update URL when tab changes
  const handleTabChange = React.useCallback(
    (newTab: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newTab === "all") {
        params.delete("tab");
      } else {
        params.set("tab", newTab);
      }

      if (view === "list") {
        params.delete("view");
      } else {
        params.set("view", view);
      }

      if (searchValue) {
        params.set("query", searchValue);
      } else {
        params.delete("query");
      }

      const newParamsStr = params.toString();

      lastParamsRef.current = newParamsStr;

      router.push(`/projects?${newParamsStr}`, {
        scroll: false,
      });

      if (newTab !== "all") {
        scrollToShowcase();
      }
    },
    [router, searchParams, view, searchValue, scrollToShowcase],
  );

  // Update URL when view changes
  const handleViewChange = React.useCallback(
    (newView: ISearchFilterProps["view"]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newView === "list") {
        params.delete("view");
      } else {
        params.set("view", newView);
      }
      if (tab && tab !== "all") params.set("tab", tab);
      if (searchValue) params.set("query", searchValue);
      const newParamsStr = params.toString();
      lastParamsRef.current = newParamsStr;
      router.push(`/projects?${newParamsStr}`, { scroll: false });
      scrollToShowcase();
    },
    [router, searchParams, tab, searchValue, scrollToShowcase],
  );

  // Debounced: mirror the live searchValue into the URL after 250ms of
  // inactivity, so the search is shareable/bookmarkable without making
  // every keystroke fight a navigation.
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue) {
        params.set("query", searchValue);
      } else {
        params.delete("query");
      }
      if (tab && tab !== "all") params.set("tab", tab);
      if (view !== "list") params.set("view", view);

      const newParamsStr = params.toString();
      if (newParamsStr !== lastParamsRef.current) {
        lastParamsRef.current = newParamsStr;
        router.push(`/projects?${newParamsStr}`, { scroll: false });
        scrollToShowcase();
      }
    }, 250);

    return () => clearTimeout(timeout);
    // Only re-arm the debounce on searchValue changes — tab/view pushes
    // happen immediately via their own handlers above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, scrollToShowcase]);

  // Sync searchValue FROM the URL only on genuine external navigation
  // (back/forward, or landing on a link with ?query=...) — never as a
  // reaction to local typing. The guard against lastParamsRef is what
  // makes that distinction: if this params string is one we just pushed
  // ourselves, there's nothing to sync.
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
          className="pt-20 sm:pt-30 md:pt-36 flex flex-col gap-8 md:gap-12"
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
              onClear={handleClearFilters}
            />
          </Container>

          {filteredProjects.length > 0 ? (
            <ImagePreviewProvider images={images}>
              <ProjectsView
                projects={filteredProjects}
                view={view}
                activeTab={tab ?? "all"}
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
                  <EmptyDescription>{emptyState.description}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </Container>
          )}
        </div>

        {filteredProjects.length > 0 && (
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm text-center font-extralight italic text-muted-foreground/60 md:text-base">
              The shelf isn’t full yet. <br />
              There are a few more things being built and rebuilt.
            </p>
          </div>
        )}
      </CurveThingy>
    </div>
  );
};
