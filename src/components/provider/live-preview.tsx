"use client";

import { Loader } from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
} from "motion/react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowRotate,
  ChevronExpandY,
  ChevronLeft,
  ChevronRight,
  Lock,
  Minus,
  Plus,
  SquareTopDown,
  Xmark,
} from "reicon-react";
import { siteConfig } from "@/config/site.config";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { ProjectsListQueryResult } from "~/sanity.types";
import { Skeleton } from "../reusable/shadcn/skeleton";
import { LocalImg } from "../shared/image";
import { useSoundFx } from "./sound-fx";

interface ILivePreviewContextType {
  currentProject: ProjectsListQueryResult[number] | null;
  openPreview: (
    project: ProjectsListQueryResult[number],
    anchor?: DOMRect,
    projects?: ProjectsListQueryResult,
  ) => void;
  closePreview: () => void;
}

interface LivePreviewProviderProps extends React.PropsWithChildren {
  projects?: ProjectsListQueryResult;
}

const LivePreviewContext = createContext<ILivePreviewContextType | null>(null);

export const useLivePreview = () => {
  const context = useContext(LivePreviewContext);
  if (!context) {
    throw new Error("useLivePreview must be used within a LivePreviewProvider");
  }
  return context;
};

export const LivePreviewProvider: React.FC<LivePreviewProviderProps> = ({
  children,
  projects = [],
}) => {
  const [mounted, setMounted] = useState(false);
  const [project, setProject] = useState<
    ProjectsListQueryResult[number] | null
  >(null);
  const { play } = useSoundFx();
  const [projectsList, setProjectsList] =
    useState<ProjectsListQueryResult>(projects);
  const [expanded, setExpanded] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeSlow, setIframeSlow] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (projects.length > 0) {
      setProjectsList(projects);
    }
  }, [projects]);

  // Smoothly return the transform to 0 so it doesn't conflict with the `layout` projection
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const springTransition = { type: "spring", stiffness: 300, damping: 30 };
    animate(x, 0, springTransition as any);
    animate(y, 0, springTransition as any);
  }, [expanded, project, x, y]);

  const closePreview = useCallback(() => {
    setProject(null);
    setExpanded(false);
    setIframeLoaded(false);
    setIframeSlow(false);
    setIsDragging(false);
    play("close");
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
  }, [play]);

  const openPreview = useCallback(
    (
      nextProject: ProjectsListQueryResult[number],
      _nextAnchor?: DOMRect,
      overrideProjects?: ProjectsListQueryResult,
    ) => {
      if (!isDesktop) return;

      const list =
        overrideProjects && overrideProjects.length > 0
          ? overrideProjects
          : projects.length > 0
            ? projects
            : [nextProject];

      setProjectsList(list);
      setProject(nextProject);
      setExpanded(false);
      setIframeLoaded(false);
      setIframeSlow(false);
      setIsDragging(false);

      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      slowTimerRef.current = setTimeout(() => setIframeSlow(true), 4000);
    },
    [isDesktop, projects],
  );

  const currentIndex = project
    ? projectsList.findIndex((p) => p.url === project.url)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < projectsList.length - 1;

  const navigateToProject = useCallback(
    (nextProject: ProjectsListQueryResult[number]) => {
      setProject(nextProject);
      setIframeLoaded(false);
      setIframeSlow(false);

      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      slowTimerRef.current = setTimeout(() => setIframeSlow(true), 4000);
    },
    [],
  );

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      navigateToProject(projectsList[currentIndex - 1]);
    }
  }, [hasPrev, projectsList, currentIndex, navigateToProject]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      navigateToProject(projectsList[currentIndex + 1]);
    }
  }, [hasNext, projectsList, currentIndex, navigateToProject]);

  const handleReload = useCallback(() => {
    setIframeLoaded(false);
    setReloadKey((prev) => prev + 1);
  }, []);

  const handleHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (expanded) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    dragControls.start(e);
  };

  useEffect(() => {
    if (!isDesktop && project) closePreview();
  }, [isDesktop, project, closePreview]);

  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePreview();
      } else if (event.key === "ArrowLeft") {
        handlePrev();
      } else if (event.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project, closePreview, handlePrev, handleNext]);

  const value: ILivePreviewContextType = {
    currentProject: project,
    openPreview,
    closePreview,
  };

  return (
    <LivePreviewContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {project && (
              <React.Fragment key={project.url}>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-80 hidden bg-black/40 backdrop-blur-sm md:block"
                    onClick={closePreview}
                  />
                )}

                <motion.div
                  layout
                  style={{ x, y }}
                  drag={!expanded}
                  dragControls={dragControls}
                  dragListener={false}
                  dragMomentum={false}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={cn(
                    "fixed z-100 hidden flex-col overflow-hidden rounded-2xl border border-border/60 bg-background md:flex",
                    "shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)]",
                    expanded
                      ? "top-[6vh] left-[6vw] h-[88vh] w-[88vw]"
                      : "top-[calc(50vh-280px)] left-[calc(50vw-240px)] h-140 w-120",
                  )}
                  role="dialog"
                  aria-modal="true"
                  aria-label={`Live preview of ${project.name}`}
                >
                  {/* Browser Chrome Header */}
                  <div
                    onPointerDown={handleHeaderPointerDown}
                    className={cn(
                      "flex shrink-0 select-none flex-col border-b bg-muted/70 backdrop-blur-md",
                      !expanded && "cursor-grab active:cursor-grabbing",
                    )}
                  >
                    {/* Tab Bar */}
                    <div className="flex h-9 items-center gap-2 px-3 pt-1.5">
                      <div className="flex items-center group/btn cursor-default gap-1.5 pr-2">
                        <button
                          type="button"
                          onClick={closePreview}
                          aria-label="Close preview"
                          title="Close"
                          className="flex size-3 items-center justify-center rounded-full border border-[#e0443e] bg-[#ff5f57] transition-transform active:scale-90 disabled:pointer-events-none disabled:opacity-50"
                        >
                          <Xmark className="size-2 opacity-0 text-black transition-opacity group-hover/btn:opacity-100 stroke-2" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            play(expanded ? "collapse" : "expand");
                            setExpanded(false);
                          }}
                          disabled={!expanded}
                          aria-label="Shrink preview"
                          title="Shrink preview"
                          className="flex size-3 items-center justify-center rounded-full border border-[#d89e24] bg-[#febc2e] transition-transform active:scale-90 disabled:pointer-events-none disabled:opacity-50"
                        >
                          <Minus className="size-2 opacity-0 text-black transition-opacity group-hover/btn:opacity-100 stroke-2" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            play(expanded ? "collapse" : "expand");
                            setExpanded((prev) => !prev);
                          }}
                          aria-label="Expand preview"
                          title="Expand preview"
                          className="flex size-3 items-center justify-center rounded-full border border-[#1aab29] bg-[#28c840] transition-transform active:scale-90 disabled:pointer-events-none disabled:opacity-50"
                        >
                          <ChevronExpandY className="size-2 opacity-0 text-black transition-opacity group-hover/btn:opacity-100 stroke-2 -rotate-45" />
                        </button>
                      </div>

                      {/* Active Tab */}
                      <div className="relative flex h-7 max-w-48 flex-1 cursor-default items-center gap-1.5 rounded-t-lg bg-background px-2.5 shadow-sm">
                        <LocalImg
                          src={siteConfig.author.avatar}
                          alt={siteConfig.author.name}
                          className="size-2.5 rounded-sm"
                        />
                        <span className="truncate text-[11px] font-medium text-foreground">
                          {project.name}
                        </span>
                        <button
                          type="button"
                          onClick={closePreview}
                          className="ml-auto flex size-4 items-center cursor-pointer justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Xmark className="size-2.5" />
                        </button>
                        <span className="absolute -bottom-1 left-0 h-2 w-full bg-background" />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          window.open(project.url as string, "_blank")
                        }
                        className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
                        title="Open in new tab"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>

                    {/* Address Toolbar */}
                    <div className="flex h-8 items-center gap-1.5 border-t cursor-default border-border/40 bg-background px-2.5 py-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <button
                          type="button"
                          onClick={handlePrev}
                          disabled={!hasPrev}
                          aria-label="Previous project"
                          title={hasPrev ? "Previous project" : "First project"}
                          className="flex size-5 items-center justify-center rounded transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                        >
                          <ChevronLeft className="size-3" />
                        </button>

                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={!hasNext}
                          aria-label="Next project"
                          title={hasNext ? "Next project" : "Last project"}
                          className="flex size-5 items-center justify-center rounded transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                        >
                          <ChevronRight className="size-3" />
                        </button>

                        <button
                          type="button"
                          onClick={handleReload}
                          title="Reload frame"
                          className="flex size-5 items-center justify-center rounded transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <ArrowRotate
                            className={cn(
                              "size-3",
                              !iframeLoaded && "animate-spin",
                            )}
                          />
                        </button>
                      </div>

                      <div className="flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded-md bg-muted/60 px-2.5 text-xs">
                        <Lock className="size-2.5 shrink-0 text-muted-foreground" />
                        <span className="truncate text-[11px] text-muted-foreground">
                          {project.url}
                        </span>
                      </div>

                      <a
                        href={project.url as string}
                        target="_blank"
                        rel="noreferrer"
                        onClick={closePreview}
                        title="Open in new window"
                        className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <SquareTopDown className="size-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Browser Viewport */}
                  <div className="relative flex-1 bg-card">
                    {!iframeLoaded && (
                      <div className="absolute inset-0 z-10 flex flex-col bg-background/90 backdrop-blur-xs transition-opacity duration-300">
                        <div className="h-0.5 w-full overflow-hidden bg-muted">
                          <div className="h-full w-1/3 animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-primary to-transparent" />
                        </div>

                        <div className="flex-1 space-y-5 p-6 opacity-60">
                          <div className="flex items-center justify-between border-b border-border/40 pb-4">
                            <Skeleton className="h-4 w-24 rounded" />
                            <div className="flex gap-3">
                              <Skeleton className="h-3 w-10 rounded" />
                              <Skeleton className="h-3 w-10 rounded" />
                              <Skeleton className="h-3 w-10 rounded" />
                            </div>
                          </div>

                          <div className="space-y-3 pt-2">
                            <Skeleton className="h-7 w-2/3 rounded-lg" />
                            <Skeleton className="h-4 w-1/2 rounded-md" />
                          </div>

                          <Skeleton className="h-36 w-full rounded-xl border border-border/30" />

                          <div className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-20 rounded-lg" />
                            <Skeleton className="h-20 rounded-lg" />
                          </div>
                        </div>

                        <div className="absolute bottom-3 left-4 flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground shadow-xs">
                          <Loader className="size-3 animate-spin text-primary" />
                          <span className="truncate max-w-50">
                            Waiting for{" "}
                            {project.url?.replace(/^https?:\/\//, "")}...
                          </span>
                        </div>
                      </div>
                    )}

                    {iframeSlow && !iframeLoaded && (
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-background/95 px-3 py-2 text-xs text-muted-foreground border-t border-border/60">
                        <span>
                          This site may not allow being previewed here.
                        </span>
                        <a
                          href={project.url as string}
                          target="_blank"
                          rel="noreferrer"
                          onClick={closePreview}
                          className="shrink-0 font-medium text-primary underline underline-offset-2"
                        >
                          Open in new tab
                        </a>
                      </div>
                    )}

                    <iframe
                      key={`${project.url}-${reloadKey}`}
                      src={project.url as string}
                      title={`Live preview of ${project.name}`}
                      onLoad={() => setIframeLoaded(true)}
                      className={cn(
                        "size-full border-0",
                        isDragging && "pointer-events-none",
                      )}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                  </div>
                </motion.div>
              </React.Fragment>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </LivePreviewContext.Provider>
  );
};
