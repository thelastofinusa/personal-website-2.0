"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  ArrowRotate,
  ChevronLeft,
  ChevronRight,
  Lock,
  Plus,
  SquareTopDown,
  Xmark,
} from "reicon-react";
import { CustomImage } from "@/components/shared/image";
import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";

export type BrowserStyle = "auto" | "chrome" | "safari";
export type ResolvedBrowserStyle = "chrome" | "safari";

export type WindowTrafficButton = {
  label: string;
  title: string;
  className: string;
  icon?: React.ReactNode;
  onClick: () => void;
};

type BrowserWindowProps = {
  title: string;
  url?: string;
  variant?: "compact" | "window";
  browser?: BrowserStyle;
  isDraggable?: boolean;
  onHeaderPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  trafficButtons?: readonly WindowTrafficButton[];
  onCloseTab?: () => void;
  onNewTab?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onReload?: () => void;
  isReloading?: boolean;
  onOpenExternal?: () => void;
  className?: string;
};

const DEFAULT_TRAFFIC_DOTS: readonly WindowTrafficButton[] = [
  {
    label: "Close",
    title: "Close",
    className: "border-[#e0443e] bg-[#ff5f57]",
    onClick: () => {},
  },
  {
    label: "Minimize",
    title: "Minimize",
    className: "border-[#d89e24] bg-[#febc2e]",
    onClick: () => {},
  },
  {
    label: "Expand",
    title: "Expand",
    className: "border-[#1aab29] bg-[#28c840]",
    onClick: () => {},
  },
];

function detectBrowserStyle(): ResolvedBrowserStyle {
  if (typeof window === "undefined") return "chrome";

  const uaDataBrands = (
    navigator as Navigator & {
      userAgentData?: { brands?: Array<{ brand: string }> };
    }
  ).userAgentData?.brands;

  if (uaDataBrands?.length) {
    const isChromiumBrand = uaDataBrands.some(({ brand }) =>
      /chromium|google chrome|microsoft edge|brave|opera|vivaldi/i.test(brand),
    );
    if (isChromiumBrand) return "chrome";
  }

  const ua = navigator.userAgent;
  const isSafari =
    /safari/i.test(ua) &&
    !/chrome|chromium|crios|fxios|edg|opr|brave/i.test(ua);

  return isSafari ? "safari" : "chrome";
}

export const BrowserWindow: React.FC<BrowserWindowProps> = ({
  title,
  url,
  variant = "compact",
  browser = "auto",
  isDraggable = false,
  onHeaderPointerDown,
  trafficButtons,
  onCloseTab,
  onNewTab,
  hasPrev = false,
  hasNext = false,
  onPrev,
  onNext,
  onReload,
  isReloading = false,
  onOpenExternal,
  className,
}) => {
  const [detectedBrowser, setDetectedBrowser] =
    useState<ResolvedBrowserStyle>("chrome");

  useEffect(() => {
    if (browser === "auto") {
      setDetectedBrowser(detectBrowserStyle());
    }
  }, [browser]);

  const resolvedBrowser: ResolvedBrowserStyle =
    browser === "auto" ? detectedBrowser : browser;
  const isSafari = resolvedBrowser === "safari";
  const isWindow = variant === "window";
  const dots =
    isWindow && trafficButtons ? trafficButtons : DEFAULT_TRAFFIC_DOTS;
  const displayUrl = url
    ? url.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "preview.local";

  const renderTrafficLights = () => (
    <div
      className={cn(
        "flex shrink-0 items-center",
        isWindow ? "group/btn cursor-default gap-1.5" : "gap-1",
      )}
    >
      {dots.map((button) =>
        isWindow ? (
          <button
            key={button.title}
            type="button"
            onClick={button.onClick}
            aria-label={button.label}
            title={button.title}
            className={cn(
              "flex size-3 items-center justify-center rounded-full border transition-transform active:scale-90",
              button.className,
            )}
          >
            {button.icon}
          </button>
        ) : (
          <span
            key={button.title}
            aria-hidden="true"
            className={cn("size-2 rounded-full border", button.className)}
          />
        ),
      )}
    </div>
  );

  const renderNavButtons = () =>
    isWindow ? (
      <div className="text-muted-foreground flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="Previous project"
          title={hasPrev ? "Previous project" : "First project"}
          className="hover:bg-muted/80 hover:text-foreground flex size-6 items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Next project"
          title={hasNext ? "Next project" : "Last project"}
          className="hover:bg-muted/80 hover:text-foreground flex size-6 items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    ) : (
      <div className="text-muted-foreground/60 flex shrink-0 items-center gap-0.5">
        <ChevronLeft className="size-3" />
        <ChevronRight className="size-3 opacity-35" />
      </div>
    );

  const renderWindowActions = () =>
    isWindow ? (
      <div className="flex shrink-0 items-center gap-0.5">
        {onOpenExternal && (
          <button
            type="button"
            onClick={onOpenExternal}
            aria-label="Open in new window"
            title="Open in new window"
            className="text-muted-foreground hover:bg-muted/80 hover:text-foreground flex size-6 items-center justify-center rounded-md transition-colors"
          >
            <SquareTopDown className="size-3.5" />
          </button>
        )}
        {onNewTab && (
          <button
            type="button"
            onClick={onNewTab}
            aria-label="Open in new tab"
            title="Open in new tab"
            className="text-muted-foreground hover:bg-muted/80 hover:text-foreground flex size-6 items-center justify-center rounded-md transition-colors"
          >
            <Plus className="size-3.5" />
          </button>
        )}
      </div>
    ) : null;

  if (isSafari) {
    return (
      <div
        onPointerDown={onHeaderPointerDown}
        className={cn(
          "bg-muted/50 border-border/50 flex shrink-0 items-center justify-between gap-2 border-b backdrop-blur-md select-none",
          isWindow ? "h-10 px-3" : "h-8 px-2.5",
          isDraggable && "cursor-grab active:cursor-grabbing",
          className,
        )}
      >
        <div className="flex shrink-0 items-center gap-2">
          {renderTrafficLights()}
          {renderNavButtons()}
        </div>

        {/* Clean Safari pill bar */}
        <div
          className={cn(
            "bg-background/90 border-border/60 flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border px-3 shadow-2xs",
            isWindow ? "h-6.5 max-w-sm" : "h-5.5",
          )}
        >
          <Lock className="text-muted-foreground/70 size-2.5 shrink-0" />
          <span
            className={cn(
              "text-foreground truncate font-medium",
              isWindow ? "text-[11px]" : "text-[9.5px]",
            )}
          >
            {title || displayUrl}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {isWindow ? (
            <>
              <button
                type="button"
                onClick={onReload}
                aria-label="Reload frame"
                title="Reload frame"
                className="text-muted-foreground hover:bg-muted/80 hover:text-foreground flex size-6 items-center justify-center rounded-md transition-colors"
              >
                <ArrowRotate
                  className={cn("size-3", isReloading && "animate-spin")}
                />
              </button>
              {renderWindowActions()}
            </>
          ) : (
            <ArrowRotate className="text-muted-foreground/60 size-2.5" />
          )}
        </div>
      </div>
    );
  }

  // Clean Chrome / Chromium layout
  return (
    <div
      onPointerDown={onHeaderPointerDown}
      className={cn(
        "bg-muted/60 flex shrink-0 flex-col select-none",
        isWindow && "border-b backdrop-blur-md",
        isDraggable && "cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      {/* Tab strip */}
      <div
        className={cn(
          "flex items-end gap-1.5 px-2.5",
          isWindow ? "h-8.5 pt-1.5" : "h-6.5 pt-1",
        )}
      >
        <div className={cn("self-center", isWindow ? "mr-1" : "mr-0.5")}>
          {renderTrafficLights()}
        </div>

        <div
          className={cn(
            "bg-background border-border/50 flex min-w-0 flex-1 items-center gap-1.5 rounded-t-lg border-t border-x px-2.5",
            isWindow ? "h-7 max-w-44" : "h-5.5 max-w-30",
          )}
        >
          <CustomImage
            src={siteConfig.author.avatar}
            alt={siteConfig.author.name}
            width={10}
            height={10}
            className="size-2.5 shrink-0 rounded-full"
          />
          <span
            className={cn(
              "text-foreground flex-1 truncate font-medium",
              isWindow ? "text-[11px]" : "text-[9px]",
            )}
          >
            {title}
          </span>
          {isWindow && onCloseTab && (
            <button
              type="button"
              onClick={onCloseTab}
              aria-label="Close tab"
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-3.5 cursor-pointer items-center justify-center rounded-full"
            >
              <Xmark className="size-2" />
            </button>
          )}
        </div>

        {isWindow && onNewTab && (
          <button
            type="button"
            onClick={onNewTab}
            aria-label="Open in new tab"
            title="Open in new tab"
            className="text-muted-foreground hover:bg-background/70 hover:text-foreground mb-0.5 flex size-5.5 items-center justify-center rounded-full transition-colors"
          >
            <Plus className="size-3" />
          </button>
        )}
      </div>

      {/* Pill omnibox bar */}
      <div
        className={cn(
          "bg-background border-border/40 flex items-center gap-1.5 border-t px-2.5",
          isWindow ? "h-8" : "h-7",
        )}
      >
        {renderNavButtons()}

        {isWindow ? (
          <button
            type="button"
            onClick={onReload}
            aria-label="Reload frame"
            title="Reload frame"
            className="text-muted-foreground hover:bg-muted/80 hover:text-foreground flex size-5.5 shrink-0 items-center justify-center rounded-full transition-colors"
          >
            <ArrowRotate
              className={cn("size-3", isReloading && "animate-spin")}
            />
          </button>
        ) : (
          <ArrowRotate className="text-muted-foreground/60 size-2.5 shrink-0" />
        )}

        <div
          className={cn(
            "bg-muted/60 flex min-w-0 flex-1 items-center gap-1.5 rounded-full px-2.5",
            isWindow ? "h-6" : "h-5",
          )}
        >
          <Lock className="text-muted-foreground/70 size-2.5 shrink-0" />
          <span
            className={cn(
              "text-muted-foreground truncate",
              isWindow ? "text-[11px]" : "text-[9px]",
            )}
          >
            {displayUrl}
          </span>
        </div>

        {renderWindowActions()}
      </div>
    </div>
  );
};
