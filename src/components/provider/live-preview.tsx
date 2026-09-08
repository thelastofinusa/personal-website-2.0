"use client";

import { AnimatePresence, motion } from "motion/react";
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
  ArrowLeft,
  ArrowRight,
  ArrowRotate,
  Loader,
  Lock,
  Plus,
  SquareTopDown,
  Xmark,
} from "reicon-react";
import { siteConfig } from "@/config/site.config";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { LocalImg } from "../shared/image";

interface ILivePreviewProject {
  name: string;
  url: string;
}

interface ILivePreviewContextType {
  openPreview: (project: ILivePreviewProject, anchor: DOMRect) => void;
  closePreview: () => void;
}

const LivePreviewContext = createContext<ILivePreviewContextType | null>(null);

export const useLivePreview = () => {
  const context = useContext(LivePreviewContext);
  if (!context) {
    throw new Error("useLivePreview must be used within a LivePreviewProvider");
  }
  return context;
};

const PEEK_WIDTH = 480;
const PEEK_HEIGHT = 560;
const MARGIN = 16;

function getPeekPosition(anchor: DOMRect | null) {
  if (typeof window === "undefined" || !anchor) {
    return { top: 96, left: 96 };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = anchor.left;
  let top = anchor.bottom + 12;

  if (left + PEEK_WIDTH + MARGIN > vw) {
    left = Math.max(MARGIN, vw - PEEK_WIDTH - MARGIN);
  }

  if (top + PEEK_HEIGHT + MARGIN > vh) {
    top = Math.max(MARGIN, anchor.top - PEEK_HEIGHT - 12);
  }

  return { top, left };
}

export const LivePreviewProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [mounted, setMounted] = useState(false);
  const [project, setProject] = useState<ILivePreviewProject | null>(null);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeSlow, setIframeSlow] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  const closePreview = useCallback(() => {
    setProject(null);
    setAnchor(null);
    setExpanded(false);
    setIframeLoaded(false);
    setIframeSlow(false);
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
  }, []);

  const openPreview = useCallback(
    (nextProject: ILivePreviewProject, nextAnchor: DOMRect) => {
      if (!isDesktop) return;

      setProject(nextProject);
      setAnchor(nextAnchor);
      setExpanded(false);
      setIframeLoaded(false);
      setIframeSlow(false);

      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      slowTimerRef.current = setTimeout(() => setIframeSlow(true), 4000);
    },
    [isDesktop],
  );

  const handleReload = useCallback(() => {
    setIframeLoaded(false);
    setReloadKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!isDesktop && project) closePreview();
  }, [isDesktop, project, closePreview]);

  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePreview();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project, closePreview]);

  const value: ILivePreviewContextType = { openPreview, closePreview };
  const position = getPeekPosition(anchor);

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
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={
                    !expanded
                      ? {
                          top: position.top,
                          left: position.left,
                          width: PEEK_WIDTH,
                          height: PEEK_HEIGHT,
                        }
                      : undefined
                  }
                  className={cn(
                    "fixed z-100 hidden flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl md:flex",
                    expanded && "top-[6vh] left-[6vw] h-[88vh] w-[88vw]",
                  )}
                  role="dialog"
                  aria-modal="true"
                  aria-label={`Live preview of ${project.name}`}
                >
                  {/* Browser Chrome Header */}
                  <div className="flex shrink-0 flex-col border-b bg-muted/70 backdrop-blur-md">
                    {/* Tab Bar */}
                    <div className="flex h-9 items-center gap-2 px-3 pt-1.5">
                      {/* Window Action Dots (Traffic Lights) */}
                      <div className="flex items-center gap-1.5 pr-2">
                        {/* RED: Close */}
                        <button
                          type="button"
                          onClick={closePreview}
                          aria-label="Close preview"
                          title="Close"
                          className="group/btn flex size-3 items-center justify-center rounded-full border border-[#e0443e] bg-[#ff5f57] transition-transform active:scale-90"
                        >
                          <Xmark className="size-2 text-black/70 opacity-0 transition-opacity group-hover/btn:opacity-100" />
                        </button>

                        {/* YELLOW: Shrink / Minimize */}
                        <button
                          type="button"
                          onClick={() => setExpanded(false)}
                          aria-label="Shrink preview"
                          title="Shrink preview"
                          className="group/btn flex size-3 items-center justify-center rounded-full border border-[#d89e24] bg-[#febc2e] transition-transform active:scale-90"
                        >
                          <span className="h-[1.5px] w-1.5 bg-black/70 opacity-0 transition-opacity group-hover/btn:opacity-100" />
                        </button>

                        {/* GREEN: Expand / Maximize */}
                        <button
                          type="button"
                          onClick={() => setExpanded(true)}
                          aria-label="Expand preview"
                          title="Expand preview"
                          className="group/btn flex size-3 items-center justify-center rounded-full border border-[#1aab29] bg-[#28c840] transition-transform active:scale-90"
                        >
                          <span className="size-1 rounded-[0.5px] border border-black/70 opacity-0 transition-opacity group-hover/btn:opacity-100" />
                        </button>
                      </div>

                      {/* Active Tab */}
                      <div className="relative flex h-7 max-w-48 flex-1 items-center gap-1.5 rounded-t-lg bg-background px-2.5 shadow-sm">
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
                          className="ml-auto flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Xmark className="size-2.5" />
                        </button>
                        <span className="absolute -bottom-1 left-0 h-2 w-full bg-background" />
                      </div>

                      {/* Open in New Tab Button */}
                      <button
                        type="button"
                        onClick={() => window.open(project.url, "_blank")}
                        className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
                        title="Open in new tab"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>

                    {/* Address Toolbar */}
                    <div className="flex h-8 items-center gap-1.5 border-t border-border/40 bg-background px-2.5 py-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <button
                          type="button"
                          disabled
                          className="flex size-5 items-center justify-center rounded text-muted-foreground/30"
                        >
                          <ArrowLeft className="size-3" />
                        </button>
                        <button
                          type="button"
                          disabled
                          className="flex size-5 items-center justify-center rounded text-muted-foreground/30"
                        >
                          <ArrowRight className="size-3" />
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

                      {/* Address URL Input */}
                      <div className="flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded-md bg-muted/60 px-2.5 text-xs">
                        <Lock className="size-2.5 shrink-0 text-muted-foreground" />
                        <span className="truncate text-[11px] text-muted-foreground">
                          {project.url}
                        </span>
                      </div>

                      {/* External Link */}
                      <a
                        href={project.url}
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
                        {/* Top Browser Loading Bar */}
                        <div className="h-0.5 w-full overflow-hidden bg-muted">
                          <div className="h-full w-1/3 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-primary to-transparent" />
                        </div>

                        {/* Webpage Wireframe Skeleton */}
                        <div className="flex-1 space-y-5 p-6 opacity-60">
                          {/* Mock Nav Header */}
                          <div className="flex items-center justify-between border-b border-border/40 pb-4">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                            <div className="flex gap-3">
                              <div className="h-3 w-10 animate-pulse rounded bg-muted" />
                              <div className="h-3 w-10 animate-pulse rounded bg-muted" />
                              <div className="h-3 w-10 animate-pulse rounded bg-muted" />
                            </div>
                          </div>

                          {/* Mock Hero Title & Subtitle */}
                          <div className="space-y-3 pt-2">
                            <div className="h-7 w-2/3 animate-pulse rounded-lg bg-muted" />
                            <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted/80" />
                          </div>

                          {/* Mock Hero Banner */}
                          <div className="h-36 w-full animate-pulse rounded-xl border border-border/30 bg-muted/50" />

                          {/* Mock Cards Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="h-20 animate-pulse rounded-lg bg-muted/40" />
                            <div className="h-20 animate-pulse rounded-lg bg-muted/40" />
                          </div>
                        </div>

                        {/* Bottom Browser Status Indicator */}
                        <div className="absolute bottom-3 left-4 flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground shadow-xs">
                          <Loader className="size-3 animate-spin text-primary" />
                          <span className="truncate max-w-50">
                            Waiting for{" "}
                            {project.url.replace(/^https?:\/\//, "")}...
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
                          href={project.url}
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
                      src={project.url}
                      title={`Live preview of ${project.name}`}
                      onLoad={() => setIframeLoaded(true)}
                      className="size-full border-0"
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
