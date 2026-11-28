/** biome-ignore-all lint/correctness/useExhaustiveDependencies: just ignore */
/** biome-ignore-all lint/suspicious/noExplicitAny: just ignore */
"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
} from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ChevronExpandY, Minus, SquareTopDown, Xmark } from "reicon-react";
import {
  BrowserWindow,
  type WindowTrafficButton,
} from "@/components/shared/browser-window";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { ProjectsListQueryResult } from "~/sanity.types";
import { Button } from "../reusable/shadcn/button";
import { Skeleton } from "../reusable/shadcn/skeleton";
import { FadeLine } from "../shared/fade-line";
import { useSoundFx } from "./sound-fx";

interface ILivePreviewContextType {
  currentProject: ProjectsListQueryResult[number] | null;
  openPreview: (
    project: ProjectsListQueryResult[number],
    anchor?: DOMRect,
    projects?: ProjectsListQueryResult,
    e?: React.MouseEvent | MouseEvent,
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
  const [isMinimized, setIsMinimized] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeSlow, setIframeSlow] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingSoundRef = useRef<ReturnType<typeof play> | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (projects.length > 0) {
      setProjectsList(projects);
    }
  }, [projects]);

  useEffect(() => {
    if (isMinimized) {
      animate(x, window.innerWidth / 2 - 80, {
        type: "spring",
        stiffness: 250,
        damping: 25,
      } as any);
      animate(y, window.innerHeight / 2 - 40, {
        type: "spring",
        stiffness: 200,
        damping: 25,
      } as any);
    } else {
      const springTransition = { type: "spring", stiffness: 300, damping: 30 };
      animate(x, 0, springTransition as any);
      animate(y, 0, springTransition as any);
    }
  }, [expanded, project, isMinimized, x, y]);

  useEffect(() => {
    if (project && !iframeLoaded && project.embeddable !== false) {
      loadingSoundRef.current = play("connecting");

      return () => {
        if (
          loadingSoundRef.current &&
          "stop" in loadingSoundRef.current &&
          typeof loadingSoundRef.current.stop === "function"
        ) {
          loadingSoundRef.current.stop();
        }
        loadingSoundRef.current = null;
      };
    }
  }, [project, reloadKey, iframeLoaded, play]);

  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true);
    play("complete");
  }, [play]);

  const closePreview = useCallback(() => {
    setProject(null);
    setExpanded(false);
    setIsMinimized(false);
    setIframeLoaded(false);
    setIframeSlow(false);
    setIsDragging(false);
    play("close");
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
  }, [play]);

  const minimizePreview = useCallback(() => {
    setIsMinimized(true);
    play("queued");
  }, [play]);

  const restorePreview = useCallback(() => {
    setIsMinimized(false);
    play("expand");
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
      setIsMinimized(false);
      setIframeLoaded(false);
      setIframeSlow(false);
      setIsDragging(false);

      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      if (nextProject.embeddable !== false) {
        slowTimerRef.current = setTimeout(() => setIframeSlow(true), 10000);
      }
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
      setIsMinimized(false);
      setIframeLoaded(false);
      setIframeSlow(false);

      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      if (nextProject.embeddable !== false) {
        slowTimerRef.current = setTimeout(() => setIframeSlow(true), 4000);
      }
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

  const handleOpenExternal = useCallback(() => {
    if (!project?.url) return;
    window.open(project.url, "_blank", "noopener,noreferrer");
    closePreview();
  }, [project?.url, closePreview]);

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

  const windowButtons: WindowTrafficButton[] = [
    {
      label: "Close preview",
      title: "Close",
      className: "border-[#e0443e] bg-[#ff5f57]",
      icon: (
        <Xmark className="size-2 stroke-2 text-black opacity-0 transition-opacity group-hover/btn:opacity-100" />
      ),
      onClick: closePreview,
    },
    {
      label: "Minimize preview",
      title: "Minimize",
      className: "border-[#d89e24] bg-[#febc2e]",
      icon: (
        <Minus className="size-2 stroke-2 text-black opacity-0 transition-opacity group-hover/btn:opacity-100" />
      ),
      onClick: minimizePreview,
    },
    {
      label: expanded ? "Restore size" : "Expand preview",
      title: expanded ? "Restore size" : "Expand",
      className: "border-[#1aab29] bg-[#28c840]",
      icon: (
        <ChevronExpandY className="size-2 -rotate-45 stroke-2 text-black opacity-0 transition-opacity group-hover/btn:opacity-100" />
      ),
      onClick: () => {
        play(expanded ? "collapse" : "expand");
        setExpanded((prev) => !prev);
      },
    },
  ];

  return (
    <LivePreviewContext.Provider
      value={{ currentProject: project, openPreview, closePreview }}
    >
      {children}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {project && (
              <React.Fragment key={project.url}>
                {expanded && !isMinimized && (
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
                  drag={!expanded && !isMinimized}
                  dragControls={dragControls}
                  dragListener={false}
                  dragMomentum={false}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: isMinimized ? 0 : 1,
                    scale: isMinimized ? 0.05 : 1,
                    filter: isMinimized ? "blur(4px)" : "blur(0px)",
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={cn(
                    "border-border/60 bg-background fixed z-100 hidden flex-col overflow-hidden rounded-2xl border md:flex",
                    "shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)]",
                    expanded
                      ? "top-[6vh] left-[6vw] h-[88vh] w-[88vw]"
                      : "top-[calc(50vh-280px)] left-[calc(50vw-240px)] h-140 w-120",
                    isMinimized && "pointer-events-none",
                  )}
                  role="dialog"
                  aria-modal="true"
                  aria-label={`Live preview of ${project.name}`}
                >
                  <BrowserWindow
                    variant="window"
                    title={project.name || "Preview"}
                    url={project.url ?? undefined}
                    isDraggable={!expanded}
                    onHeaderPointerDown={handleHeaderPointerDown}
                    trafficButtons={windowButtons}
                    onCloseTab={closePreview}
                    onNewTab={handleOpenExternal}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    onReload={handleReload}
                    isReloading={!iframeLoaded && project.embeddable !== false}
                    onOpenExternal={handleOpenExternal}
                  />

                  {/* Viewport */}
                  <div className="bg-card relative flex-1">
                    {project.embeddable === false ? (
                      <div className="bg-background relative flex size-full flex-col items-center justify-center overflow-hidden p-6">
                        <div className="bg-primary/15 pointer-events-none absolute size-96 animate-pulse rounded-full blur-3xl" />

                        <div className="bg-background relative flex w-full max-w-md flex-col items-start p-8 md:p-10">
                          <FadeLine
                            orientation="horizontal"
                            className="top-0 -mx-6"
                          />
                          <FadeLine
                            orientation="horizontal"
                            className="bottom-0 -mx-6"
                          />
                          <FadeLine
                            orientation="vertical"
                            className="left-0 -my-6"
                          />
                          <FadeLine
                            orientation="vertical"
                            className="right-0 -my-6"
                          />

                          <div className="text-muted-foreground/60 flex w-full items-center justify-between font-mono text-[10px] tracking-widest uppercase">
                            <span>01 / FRAME_RESTRICTED</span>
                            <span className="bg-primary/60 size-1.5 rounded-full" />
                          </div>

                          <h3 className="text-foreground mt-8 font-serif text-3xl font-light tracking-tight md:text-4xl">
                            {project.name}
                          </h3>

                          <p className="text-muted-foreground/80 mt-3 text-xs leading-relaxed font-light">
                            Direct preview blocked by host header policy. Launch
                            the project directly in a primary window.
                          </p>

                          <div className="border-border/40 mt-8 flex w-full items-center justify-between border-t pt-6">
                            <Link
                              href={project.url as Route}
                              target="_blank"
                              rel="noreferrer"
                              onClick={closePreview}
                              className="group text-foreground hover:text-primary inline-flex items-center gap-3 font-mono text-xs tracking-wider transition-colors"
                            >
                              <span className="after:bg-primary relative py-0.5 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:transition-all after:duration-300 group-hover:after:w-full">
                                LAUNCH PROJECT
                              </span>
                              <SquareTopDown className="text-muted-foreground group-hover:text-primary size-3.5 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>

                            <span className="text-muted-foreground/40 font-mono text-[10px]">
                              SEC_403
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {!iframeLoaded && (
                          <div className="bg-background absolute inset-0 z-10 overflow-hidden p-8">
                            <div className="mx-auto flex max-w-2xl flex-col gap-6">
                              <div className="flex items-center justify-between">
                                <Skeleton className="h-6 w-24 rounded-full" />
                                <Skeleton className="h-6 w-36 rounded-full" />
                              </div>
                              <Skeleton className="h-44 w-full rounded-2xl" />
                              <div className="grid grid-cols-3 gap-4">
                                <Skeleton className="h-24 rounded-xl" />
                                <Skeleton className="h-24 rounded-xl" />
                                <Skeleton className="h-24 rounded-xl" />
                              </div>
                            </div>

                            {expanded && !iframeSlow && (
                              <div className="border-border/60 bg-background/85 text-muted-foreground absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] shadow-sm backdrop-blur">
                                <span className="bg-primary size-1.5 animate-pulse rounded-full" />
                                Preparing {project.name}
                              </div>
                            )}
                          </div>
                        )}

                        {iframeSlow && !iframeLoaded && (
                          <div className="border-border/60 bg-background/95 text-muted-foreground absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t px-3 py-2 text-xs">
                            <span>
                              This site may not allow being previewed here.
                            </span>
                            <a
                              href={project.url as string}
                              target="_blank"
                              rel="noreferrer"
                              onClick={closePreview}
                              className="text-primary shrink-0 font-medium underline underline-offset-2"
                            >
                              Open in new tab
                            </a>
                          </div>
                        )}

                        <iframe
                          key={`${project.url}-${reloadKey}`}
                          src={project.url as string}
                          title={`Live preview of ${project.name}`}
                          onLoad={handleIframeLoad}
                          className={cn(
                            "size-full border-0",
                            isDragging && "pointer-events-none",
                          )}
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        />
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Minimized Dock Floating Button */}
                <AnimatePresence>
                  {isMinimized && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 40 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5, y: 40 }}
                      onClick={restorePreview}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                        delay: isMinimized ? 0.15 : 0,
                      }}
                      className="fixed right-5 bottom-5 z-100"
                      aria-label={`Restore live preview of ${project.name}`}
                    >
                      <Button
                        size="sm"
                        variant="default"
                        aria-label={`Restore live preview of ${project.name}`}
                        className="shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                      >
                        <span className="relative flex size-2">
                          <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-75" />
                          <span className="relative size-2 rounded-full bg-white" />
                        </span>
                        <span className="text-xs font-medium">
                          {project.name}
                        </span>
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </React.Fragment>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </LivePreviewContext.Provider>
  );
};
