/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
"use client";

import Image, { type ImageProps as NextImageProps } from "next/image";
import { forwardRef, type ReactEventHandler, useEffect, useState } from "react";

interface LocalImgProps
  extends Omit<NextImageProps, "src" | "onError" | "onLoad"> {
  src?: string;
  fallbackSrc?: string;
  loadingGif?: string;
  ogUrl?: string;
  onError?: ReactEventHandler<HTMLImageElement>;
  onLoad?: ReactEventHandler<HTMLImageElement>;
}

/**
 * Returns true when the URL resolves to the current origin.
 * Relative URLs (e.g. "/logo.png") are treated as local.
 */
function isLocalUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return true;
  }
}

/**
 * Rewrites external image URLs to go through our same-origin proxy
 * so they bypass the strict `img-src` CSP. Local URLs (including
 * already-proxied /api/... routes) pass through untouched.
 */
function getProxiedUrl(src?: string): string | undefined {
  if (!src) return undefined;

  // Relative URLs — leave alone
  if (src.startsWith("/") && !src.startsWith("//")) {
    return src;
  }

  // Already same-origin (proxy route, sanity CDN, etc.)
  if (isLocalUrl(src)) {
    return src;
  }

  // External → proxy through our own origin
  return `/api/og-image/proxy?url=${encodeURIComponent(src)}`;
}

export const LocalImg = forwardRef<HTMLImageElement, LocalImgProps>(
  (
    {
      src,
      fallbackSrc = "/broken.gif",
      loadingGif = "/loading.gif",
      ogUrl,
      onError,
      onLoad,
      width = 800,
      height = 600,
      alt = "",
      quality = 70,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    // The only thing that still needs a network round trip up front is
    // resolving an OG screenshot when `ogUrl` is provided — everything
    // else (loading state, broken state) is handled by next/image itself.
    const [ogSrc, setOgSrc] = useState<string | null | undefined>(
      ogUrl ? undefined : null,
    );
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
      if (!ogUrl) {
        setOgSrc(null);
        return;
      }

      let cancelled = false;
      setOgSrc(undefined);

      fetch(`/api/og-image?url=${encodeURIComponent(ogUrl)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { image?: string | null } | null) => {
          if (!cancelled) setOgSrc(data?.image ?? null);
        })
        .catch(() => {
          if (!cancelled) setOgSrc(null);
        });

      return () => {
        cancelled = true;
      };
    }, [ogUrl]);

    const stillResolvingOg = Boolean(ogUrl) && ogSrc === undefined;
    const resolvedSrc = ogSrc || getProxiedUrl(src);

    // Reset load/error state whenever the effective source changes so a
    // new image (e.g. after filtering/pagination) gets its own lifecycle.
    useEffect(() => {
      setLoaded(false);
      setFailed(false);
    }, [resolvedSrc]);

    const finalSrc = failed
      ? fallbackSrc
      : stillResolvingOg
        ? loadingGif
        : resolvedSrc || fallbackSrc;

    const handleLoad: ReactEventHandler<HTMLImageElement> = (event) => {
      setLoaded(true);
      onLoad?.(event);
    };

    const handleError: ReactEventHandler<HTMLImageElement> = (event) => {
      // First failure: fall back to the broken-image placeholder.
      // Second failure (the fallback itself somehow errors): bubble up.
      if (!failed) {
        setFailed(true);
        return;
      }
      onError?.(event);
    };

    const isLoading = !loaded && !failed && !stillResolvingOg;

    return (
      <Image
        {...props}
        ref={ref}
        src={finalSrc}
        alt={alt}
        aria-label={alt || undefined}
        data-loading={isLoading}
        data-error={failed}
        width={width}
        height={height}
        quality={quality}
        className={className}
        style={{
          transition: "opacity 0.2s ease",
          opacity: isLoading ? 0 : 1,
          ...style,
        }}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  },
);

LocalImg.displayName = "LocalImg";
