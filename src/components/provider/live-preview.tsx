/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
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
import { Button } from "../reusable/shadcn/button";
import { FadeLine } from "../shared/fade-line";
import { LocalImg } from "../shared/image";
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

  // Handle the Genie Minimize Animation & Drag Reset
  useEffect(() => {
    if (isMinimized) {
      const targetX = window.innerWidth / 2 - 80;
      const targetY = window.innerHeight / 2 - 40;

      animate(x, targetX, {
        type: "spring",
        stiffness: 250,
        damping: 25,
      } as any);
      animate(y, targetY, {
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

  // Play continuous loading sound when iframe starts loading & clean up on unload
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
      e?: React.MouseEvent | MouseEvent,
    ) => {
      // Check for Control (Windows/Linux) or Command (Mac) key to redirect/open in new tab
      if (e && (e.ctrlKey || e.metaKey)) {
        window.open(nextProject.url as string, "_blank", "noopener,noreferrer");
        return;
      }

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
                {/* Backdrop overlay for expanded mode */}
                {expanded && !isMinimized && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-80 hidden bg-black/40 backdrop-blur-sm md:block"
                    onClick={closePreview}
                  />
                )}

                {/* Main Preview Window */}
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
                    "fixed z-100 hidden flex-col overflow-hidden rounded-2xl border border-border/60 bg-background md:flex",
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
                        {/* Red Button: Close */}
                        <button
                          type="button"
                          onClick={closePreview}
                          aria-label="Close preview"
                          title="Close"
                          className="flex size-3 items-center justify-center rounded-full border border-[#e0443e] bg-[#ff5f57] transition-transform active:scale-90"
                        >
                          <Xmark className="size-2 opacity-0 text-black transition-opacity group-hover/btn:opacity-100 stroke-2" />
                        </button>

                        {/* Yellow Button: Minimize */}
                        <button
                          type="button"
                          onClick={minimizePreview}
                          aria-label="Minimize preview"
                          title="Minimize"
                          className="flex size-3 items-center justify-center rounded-full border border-[#d89e24] bg-[#febc2e] transition-transform active:scale-90"
                        >
                          <Minus className="size-2 opacity-0 text-black transition-opacity group-hover/btn:opacity-100 stroke-2" />
                        </button>

                        {/* Green Button: Expand / Restore Size */}
                        <button
                          type="button"
                          onClick={() => {
                            play(expanded ? "collapse" : "expand");
                            setExpanded((prev) => !prev);
                          }}
                          aria-label={
                            expanded ? "Restore size" : "Expand preview"
                          }
                          title={expanded ? "Restore size" : "Expand"}
                          className="flex size-3 items-center justify-center rounded-full border border-[#1aab29] bg-[#28c840] transition-transform active:scale-90"
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
                              !iframeLoaded &&
                                project.embeddable !== false &&
                                "animate-spin",
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
                    {project.embeddable === false ? (
                      <div className="relative flex size-full flex-col items-center justify-center overflow-hidden bg-background p-6">
                        {/* Glowing Background Blob */}
                        <div className="pointer-events-none absolute size-96 rounded-full bg-primary/15 blur-3xl animate-pulse" />

                        {/* Fine-line architectural frame */}
                        <div className="relative bg-background flex w-full max-w-md flex-col items-start p-8 md:p-10">
                          {/* Corner Crosshairs */}
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

                          {/* Header Status */}
                          <div className="flex w-full items-center justify-between font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase">
                            <span>01 / FRAME_RESTRICTED</span>
                            <span className="size-1.5 rounded-full bg-primary/60" />
                          </div>

                          {/* Content */}
                          <h3 className="mt-8 font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl">
                            {project.name}
                          </h3>

                          <p className="mt-3 text-xs font-light leading-relaxed text-muted-foreground/80">
                            Direct preview blocked by host header policy. Launch
                            the project directly in a primary window.
                          </p>

                          {/* Footer Action */}
                          <div className="mt-8 flex w-full items-center justify-between border-t border-border/40 pt-6">
                            <Link
                              href={project.url as Route}
                              target="_blank"
                              rel="noreferrer"
                              onClick={closePreview}
                              className="group inline-flex items-center gap-3 font-mono text-xs tracking-wider text-foreground transition-colors hover:text-primary"
                            >
                              <span className="relative py-0.5 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 group-hover:after:w-full">
                                LAUNCH PROJECT
                              </span>
                              <SquareTopDown className="size-3.5 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                            </Link>

                            <span className="font-mono text-[10px] text-muted-foreground/40">
                              SEC_403
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Embeddable / Loading State */
                      <>
                        {!iframeLoaded && (
                          <motion.div
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 z-10 overflow-hidden bg-background"
                          >
                            {/* Fake page */}
                            <div className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-10">
                              {/* Fake navigation */}
                              <div className="flex items-center justify-between">
                                <motion.div
                                  animate={{ opacity: [0.35, 0.7, 0.35] }}
                                  transition={{
                                    duration: 1.8,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: "easeInOut",
                                  }}
                                  className="h-7 w-7 rounded-md bg-muted"
                                />

                                <div className="flex items-center gap-2">
                                  {[48, 36, 52].map((width, index) => (
                                    <motion.div
                                      key={width}
                                      initial={{ opacity: 0.3 }}
                                      animate={{ opacity: [0.25, 0.55, 0.25] }}
                                      transition={{
                                        duration: 1.8,
                                        delay: index * 0.15,
                                        repeat: Number.POSITIVE_INFINITY,
                                        ease: "easeInOut",
                                      }}
                                      className="h-2 rounded-full bg-muted"
                                      style={{ width }}
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Hero */}
                              <div className="mt-24 max-w-2xl">
                                <motion.div
                                  animate={{ width: ["35%", "55%", "35%"] }}
                                  transition={{
                                    duration: 2.4,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: "easeInOut",
                                  }}
                                  className="h-3 rounded-full bg-muted"
                                />

                                <div className="mt-5 space-y-3">
                                  {[100, 88, 62].map((width, index) => (
                                    <motion.div
                                      key={width}
                                      animate={{ opacity: [0.25, 0.55, 0.25] }}
                                      transition={{
                                        duration: 1.8,
                                        delay: index * 0.12,
                                        repeat: Number.POSITIVE_INFINITY,
                                        ease: "easeInOut",
                                      }}
                                      className="h-2 rounded-full bg-muted"
                                      style={{ width: `${width}%` }}
                                    />
                                  ))}
                                </div>

                                {/* Fake buttons */}
                                <div className="mt-8 flex gap-3">
                                  <motion.div
                                    animate={{ opacity: [0.3, 0.65, 0.3] }}
                                    transition={{
                                      duration: 1.6,
                                      repeat: Number.POSITIVE_INFINITY,
                                      ease: "easeInOut",
                                    }}
                                    className="h-9 w-24 rounded-md bg-muted"
                                  />

                                  <motion.div
                                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                                    transition={{
                                      duration: 1.6,
                                      delay: 0.2,
                                      repeat: Number.POSITIVE_INFINITY,
                                      ease: "easeInOut",
                                    }}
                                    className="h-9 w-20 rounded-md border border-border"
                                  />
                                </div>
                              </div>

                              {/* Fake cards */}
                              <div className="mt-24 grid grid-cols-3 gap-4">
                                {[1, 2, 3].map((card, index) => (
                                  <motion.div
                                    key={card}
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{
                                      duration: 2,
                                      delay: index * 0.2,
                                      repeat: Number.POSITIVE_INFINITY,
                                      ease: "easeInOut",
                                    }}
                                    className="overflow-hidden rounded-xl border border-border/60"
                                  >
                                    <div className="aspect-video bg-muted/60" />

                                    <div className="space-y-3 p-4">
                                      <div className="h-2.5 w-2/3 rounded-full bg-muted" />
                                      <div className="h-2 w-full rounded-full bg-muted/70" />
                                      <div className="h-2 w-4/5 rounded-full bg-muted/70" />
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            {/* Subtle loading message */}
                            {expanded && !iframeSlow && (
                              <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                                <motion.div
                                  animate={{ opacity: [0.45, 1, 0.45] }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: "easeInOut",
                                  }}
                                  className="flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur"
                                >
                                  <span className="size-1.5 rounded-full bg-current" />
                                  Preparing {project.name}
                                </motion.div>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {iframeSlow && !iframeLoaded && (
                          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-background/95 px-3 py-2 text-xs text-muted-foreground border-t border-border/60 z-20">
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
                      className="fixed bottom-5 right-5 z-100"
                      aria-label={`Restore live preview of ${project.name}`}
                    >
                      <Button
                        size="sm"
                        variant="default"
                        aria-label={`Restore live preview of ${project.name}`}
                        className={cn(
                          "shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
                        )}
                      >
                        <span className="relative flex size-2">
                          <span className="absolute inset-0 rounded-full bg-white opacity-75 animate-ping" />
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
