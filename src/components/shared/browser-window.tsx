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

/**
 * Rendering engine the frame imitates.
 * - webkit   → Safari-like (Safari, and every browser on iOS)
 * - chromium → Chrome-like (Chrome, Edge, Brave, Opera, Vivaldi, Arc…)
 * - firefox  → Firefox-like (Gecko)
 * "chrome" / "safari" are kept as deprecated aliases of chromium / webkit.
 */
export type BrowserStyle =
  | "auto"
  | "webkit"
  | "chromium"
  | "firefox"
  | "chrome"
  | "safari";
export type ResolvedBrowserStyle = "webkit" | "chromium" | "firefox";

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
  if (typeof window === "undefined") return "chromium";

  const ua = navigator.userAgent;

  // Every browser on iOS/iPadOS is WebKit under the hood.
  const isIOS =
    /iphone|ipad|ipod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) return "webkit";

  // Gecko
  if (/firefox|fxios/i.test(ua)) return "firefox";

  // Blink
  const brands = (
    navigator as Navigator & {
      userAgentData?: { brands?: Array<{ brand: string }> };
    }
  ).userAgentData?.brands;
  if (
    brands?.some(({ brand }) =>
      /chromium|google chrome|microsoft edge|brave|opera|vivaldi/i.test(brand),
    ) ||
    /chrome|chromium|crios|edg|opr|brave/i.test(ua)
  ) {
    return "chromium";
  }

  // Desktop Safari and other WebKit builds
  if (/safari|applewebkit/i.test(ua)) return "webkit";

  return "chromium";
}

function resolveEngine(
  browser: BrowserStyle,
  detected: ResolvedBrowserStyle,
): ResolvedBrowserStyle {
  switch (browser) {
    case "auto":
      return detected;
    case "safari":
    case "webkit":
      return "webkit";
    case "firefox":
      return "firefox";
    default:
      return "chromium";
  }
}

/* -------------------------------------------------------------------------- */
/*  Shared bits                                                               */
/* -------------------------------------------------------------------------- */

function TrafficLights({
  buttons,
  interactive,
}: {
  buttons: readonly WindowTrafficButton[];
  interactive: boolean;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center",
        interactive ? "group/btn cursor-default gap-2" : "gap-1.5",
      )}
    >
      {buttons.map((button) =>
        interactive ? (
          <button
            key={button.title}
            type="button"
            onClick={button.onClick}
            aria-label={button.label}
            title={button.title}
            className={cn(
              "flex size-3 items-center justify-center rounded-full border shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)] transition-transform active:scale-90",
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
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

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
    useState<ResolvedBrowserStyle>("chromium");

  useEffect(() => {
    if (browser === "auto") {
      setDetectedBrowser(detectBrowserStyle());
    }
  }, [browser]);

  const engine = resolveEngine(browser, detectedBrowser);
  const isWindow = variant === "window";
  const dots =
    isWindow && trafficButtons ? trafficButtons : DEFAULT_TRAFFIC_DOTS;

  const displayUrl = url
    ? url.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "preview.local";
  const displayHost = displayUrl.split("/")[0];

  const dragProps = {
    onPointerDown: onHeaderPointerDown,
  };

  /* ------------------------------------------------------------------------ */
  /*  WebKit (Safari): one unified, translucent toolbar. Host centred in a quiet pill. */
  /* ------------------------------------------------------------------------ */
  if (engine === "webkit") {
    const safariBtn = cn(
      "flex items-center justify-center rounded-md text-[#6e6e73] transition-colors hover:bg-black/6 hover:text-[#1d1d1f] disabled:pointer-events-none disabled:opacity-30 dark:text-[#98989d] dark:hover:bg-white/10 dark:hover:text-white",
      "size-6",
    );

    return (
      <div
        {...dragProps}
        className={cn(
          "grid w-full shrink-0 items-center gap-3 select-none",
          "border-b border-black/10 bg-[#f5f5f7]/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#2c2c2e]/90",
          isWindow
            ? "h-11 grid-cols-[1fr_minmax(0,30rem)_1fr] px-3.5"
            : "h-8 grid-cols-[1fr_minmax(0,13rem)_1fr] px-2.5",
          isDraggable && "cursor-grab active:cursor-grabbing",
          className,
        )}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <TrafficLights buttons={dots} interactive={isWindow} />
          {isWindow && (
            <div className="flex items-center">
              <button
                type="button"
                onClick={onPrev}
                disabled={!hasPrev}
                aria-label="Previous project"
                title={hasPrev ? "Previous project" : "First project"}
                className={safariBtn}
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={!hasNext}
                aria-label="Next project"
                title={hasNext ? "Next project" : "Last project"}
                className={safariBtn}
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>

        {/* Centre: address pill */}
        <div
          title={title}
          className={cn(
            "relative flex min-w-0 items-center justify-center rounded-lg bg-black/5 text-[#1d1d1f] dark:bg-white/8 dark:text-[#f5f5f7]",
            isWindow ? "h-7 px-8 text-[12px]" : "h-5 px-5 text-[9px]",
          )}
        >
          <Lock
            className={cn(
              "mr-1.5 shrink-0 text-[#86868b]",
              isWindow ? "size-3" : "size-2",
            )}
          />
          <span className="truncate font-medium tracking-[-0.01em]">
            {displayHost}
          </span>
          {isWindow && onReload ? (
            <button
              type="button"
              onClick={onReload}
              aria-label="Reload frame"
              title="Reload frame"
              className="absolute right-1 flex size-5 items-center justify-center rounded-md text-[#86868b] transition-colors hover:bg-black/6 hover:text-[#1d1d1f] dark:hover:bg-white/10 dark:hover:text-white"
            >
              <ArrowRotate
                className={cn("size-3", isReloading && "animate-spin")}
              />
            </button>
          ) : (
            <ArrowRotate
              className={cn(
                "absolute shrink-0 text-[#86868b]",
                isWindow ? "right-2.5 size-3" : "right-1.5 size-2",
              )}
            />
          )}
        </div>

        {/* Right */}
        <div className="flex items-center justify-end gap-0.5">
          {isWindow && onOpenExternal && (
            <button
              type="button"
              onClick={onOpenExternal}
              aria-label="Open in new window"
              title="Open in new window"
              className={safariBtn}
            >
              <SquareTopDown className="size-3.5" />
            </button>
          )}
          {isWindow && onNewTab && (
            <button
              type="button"
              onClick={onNewTab}
              aria-label="Open in new tab"
              title="Open in new tab"
              className={safariBtn}
            >
              <Plus className="size-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*  Gecko (Firefox): floating rounded tab, squarer controls, flat URL bar   */
  /* ------------------------------------------------------------------------ */
  if (engine === "firefox") {
    const ffBtn = cn(
      "flex shrink-0 items-center justify-center rounded-md text-[#5b5b66] transition-colors hover:bg-[#0000001a] disabled:pointer-events-none disabled:opacity-35 dark:text-[#fbfbfe] dark:hover:bg-[#ffffff1a]",
      isWindow ? "size-7" : "size-5",
    );

    return (
      <div
        {...dragProps}
        className={cn(
          "flex shrink-0 flex-col select-none",
          "[--f-frame:#f0f0f4] [--f-tab:#ffffff] [--f-bar:#f9f9fb] [--f-field:#f0f0f4]",
          "dark:[--f-frame:#1c1b22] dark:[--f-tab:#42414d] dark:[--f-bar:#2b2a33] dark:[--f-field:#1c1b22]",
          "bg-(--f-frame)",
          isDraggable && "cursor-grab active:cursor-grabbing",
          className,
        )}
      >
        {/* Tab strip */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5",
            isWindow ? "h-10 py-1.5" : "h-7.5 py-1",
          )}
        >
          <div className={cn(isWindow ? "mr-2" : "mr-1")}>
            <TrafficLights buttons={dots} interactive={isWindow} />
          </div>

          <div
            className={cn(
              "flex h-full min-w-0 flex-1 items-center gap-2 rounded-md bg-(--f-tab) shadow-[0_1px_2px_rgba(0,0,0,0.18)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.45)]",
              isWindow ? "max-w-52 px-2.5" : "max-w-34 px-2",
            )}
          >
            <CustomImage
              src={siteConfig.author.avatar}
              alt={siteConfig.author.name}
              width={14}
              height={14}
              className={cn(
                "shrink-0 rounded-sm",
                isWindow ? "size-3.5" : "size-2.5",
              )}
            />
            <span
              className={cn(
                "flex-1 truncate text-[#15141a] dark:text-[#fbfbfe]",
                isWindow ? "text-[12px]" : "text-[9px]",
              )}
            >
              {title}
            </span>
            {isWindow && onCloseTab && (
              <button
                type="button"
                onClick={onCloseTab}
                aria-label="Close tab"
                className="flex size-4.5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-[#5b5b66] transition-colors hover:bg-[#0000001a] dark:text-[#fbfbfe] dark:hover:bg-[#ffffff1a]"
              >
                <Xmark className="size-2.5" />
              </button>
            )}
          </div>

          {isWindow && onNewTab && (
            <button
              type="button"
              onClick={onNewTab}
              aria-label="Open in new tab"
              title="Open in new tab"
              className={ffBtn}
            >
              <Plus className="size-3.5" />
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div
          className={cn(
            "flex items-center gap-1 bg-(--f-bar) px-2",
            isWindow
              ? "h-10 border-y border-black/10 dark:border-white/10"
              : "h-8 border-t border-black/10 dark:border-white/10",
          )}
        >
          <button
            type="button"
            onClick={onPrev}
            disabled={!isWindow || !hasPrev}
            aria-label="Previous project"
            title={hasPrev ? "Previous project" : "First project"}
            className={cn(ffBtn, !isWindow && "opacity-50")}
          >
            <ChevronLeft className={isWindow ? "size-4" : "size-3"} />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!isWindow || !hasNext}
            aria-label="Next project"
            title={hasNext ? "Next project" : "Last project"}
            className={cn(ffBtn, !isWindow && "opacity-50")}
          >
            <ChevronRight className={isWindow ? "size-4" : "size-3"} />
          </button>
          <button
            type="button"
            onClick={onReload}
            disabled={!isWindow}
            aria-label="Reload frame"
            title="Reload frame"
            className={cn(ffBtn, !isWindow && "opacity-50")}
          >
            <ArrowRotate
              className={cn(
                isWindow ? "size-3.5" : "size-2.5",
                isReloading && "animate-spin",
              )}
            />
          </button>

          {/* URL bar */}
          <div
            className={cn(
              "mx-1 flex min-w-0 flex-1 items-center rounded-md bg-(--f-field) text-[#15141a] dark:text-[#fbfbfe]",
              isWindow ? "h-7 gap-2 px-2.5" : "h-5 gap-1.5 px-1.5",
            )}
          >
            <Lock
              className={cn(
                "shrink-0 text-[#5b5b66] dark:text-[#cfcfd8]",
                isWindow ? "size-3" : "size-2",
              )}
            />
            <span
              className={cn(
                "truncate",
                isWindow ? "text-[12px]" : "text-[9px]",
              )}
            >
              {displayUrl}
            </span>
          </div>

          {isWindow && onOpenExternal && (
            <button
              type="button"
              onClick={onOpenExternal}
              aria-label="Open in new window"
              title="Open in new window"
              className={ffBtn}
            >
              <SquareTopDown className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*  Chromium (Chrome): tab strip + toolbar share one surface via an inverted-corner tab */
  /* ------------------------------------------------------------------------ */
  const chromeBtn = cn(
    "flex shrink-0 items-center justify-center rounded-full text-[#5f6368] transition-colors hover:bg-black/8 dark:text-[#bdc1c6] dark:hover:bg-white/10",
    isWindow ? "size-6.5" : "size-5",
  );

  // radius of the concave tab corners
  const corner = isWindow ? "size-2" : "size-1.5";

  return (
    <div
      {...dragProps}
      className={cn(
        "flex shrink-0 flex-col select-none",
        "[--c-frame:#dee1e6] [--c-surface:#ffffff] [--c-field:#f1f3f4]",
        "dark:[--c-frame:#202124] dark:[--c-surface:#35363a] dark:[--c-field:#202124]",
        "bg-(--c-frame)",
        isDraggable && "cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      {/* Tab strip */}
      <div
        className={cn(
          "flex items-end gap-1 px-3 pt-1.5",
          isWindow ? "h-9.5" : "h-7",
        )}
      >
        <div className={cn("self-center", isWindow ? "mr-2" : "mr-1")}>
          <TrafficLights buttons={dots} interactive={isWindow} />
        </div>

        {/* Active tab */}
        <div
          className={cn(
            "relative flex min-w-0 flex-1 items-center gap-2 rounded-t-md bg-(--c-surface)",
            isWindow ? "h-full max-w-56 px-3" : "h-full max-w-36 px-2",
          )}
        >
          {/* concave corners */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute bottom-0 -left-2",
              corner,
            )}
            style={{
              backgroundImage:
                "radial-gradient(circle at 0 0, transparent 70%, var(--c-surface) 72%)",
            }}
          />
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute bottom-0 -right-2",
              corner,
            )}
            style={{
              backgroundImage:
                "radial-gradient(circle at 100% 0, transparent 70%, var(--c-surface) 72%)",
            }}
          />

          <CustomImage
            src={siteConfig.author.avatar}
            alt={siteConfig.author.name}
            width={14}
            height={14}
            className={cn(
              "shrink-0 rounded-full",
              isWindow ? "size-3.5" : "size-2.5",
            )}
          />
          <span
            className={cn(
              "flex-1 truncate font-normal text-[#202124] dark:text-[#e8eaed]",
              isWindow ? "text-[12px]" : "text-[9px]",
            )}
          >
            {title}
          </span>
          {isWindow && onCloseTab && (
            <button
              type="button"
              onClick={onCloseTab}
              aria-label="Close tab"
              className="flex size-4.5 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#5f6368] transition-colors hover:bg-black/10 dark:text-[#bdc1c6] dark:hover:bg-white/15"
            >
              <Xmark className="size-2.5" />
            </button>
          )}
        </div>

        {isWindow && onNewTab && (
          <button
            type="button"
            onClick={onNewTab}
            aria-label="Open in new tab"
            title="Open in new tab"
            className={cn(chromeBtn, "mb-1 ml-1")}
          >
            <Plus className="size-3.5" />
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div
        className={cn(
          "flex items-center gap-1 bg-(--c-surface) px-2.5",
          isWindow ? "h-10 border-b border-black/8 dark:border-white/8" : "h-8",
        )}
      >
        <button
          type="button"
          onClick={onPrev}
          disabled={!isWindow || !hasPrev}
          aria-label="Previous project"
          title={hasPrev ? "Previous project" : "First project"}
          className={cn(
            chromeBtn,
            "disabled:pointer-events-none",
            isWindow ? "disabled:opacity-35" : "opacity-50",
          )}
        >
          <ChevronLeft className={isWindow ? "size-4" : "size-3"} />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isWindow || !hasNext}
          aria-label="Next project"
          title={hasNext ? "Next project" : "Last project"}
          className={cn(
            chromeBtn,
            "disabled:pointer-events-none",
            isWindow ? "disabled:opacity-35" : "opacity-50",
          )}
        >
          <ChevronRight className={isWindow ? "size-4" : "size-3"} />
        </button>
        <button
          type="button"
          onClick={onReload}
          disabled={!isWindow}
          aria-label="Reload frame"
          title="Reload frame"
          className={cn(
            chromeBtn,
            !isWindow && "pointer-events-none opacity-50",
          )}
        >
          <ArrowRotate
            className={cn(
              isWindow ? "size-3.5" : "size-2.5",
              isReloading && "animate-spin",
            )}
          />
        </button>

        {/* Omnibox */}
        <div
          className={cn(
            "mx-1 flex min-w-0 flex-1 items-center rounded-full bg-(--c-field)",
            isWindow ? "h-7 gap-2 pr-3 pl-1" : "h-5 gap-1.5 pr-2 pl-0.5",
          )}
        >
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full bg-black/6 text-[#5f6368] dark:bg-white/10 dark:text-[#bdc1c6]",
              isWindow ? "size-5.5" : "size-4",
            )}
          >
            <Lock className={isWindow ? "size-3" : "size-2"} />
          </span>
          <span
            className={cn(
              "truncate text-[#202124] dark:text-[#e8eaed]",
              isWindow ? "text-[12px]" : "text-[9px]",
            )}
          >
            {displayUrl}
          </span>
        </div>

        {isWindow && (
          <div className="flex shrink-0 items-center gap-0.5">
            {onOpenExternal && (
              <button
                type="button"
                onClick={onOpenExternal}
                aria-label="Open in new window"
                title="Open in new window"
                className={chromeBtn}
              >
                <SquareTopDown className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
