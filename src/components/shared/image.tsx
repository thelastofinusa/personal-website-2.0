/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
"use client";

import Image, { type ImageProps as NextImageProps } from "next/image";
import { forwardRef, type ReactEventHandler, useEffect, useState } from "react";

type ImageType = "og" | "favicon";

interface CustomImageProps
  extends Omit<NextImageProps, "src" | "onError" | "onLoad"> {
  src?: string;
  fallbackSrc?: string;
  loadingGif?: string;

  /**
   * URL of the website to resolve an image from.
   */
  ogUrl?: string;

  /**
   * Image source to resolve from the provided URL.
   * Defaults to "og".
   */
  imageType?: ImageType;

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
 * Rewrites external image URLs to go through our same-origin proxy.
 */
function getProxiedUrl(src?: string): string | undefined {
  if (!src) return undefined;

  // Relative URLs
  if (src.startsWith("/") && !src.startsWith("//")) {
    return src;
  }

  // Already same-origin
  if (isLocalUrl(src)) {
    return src;
  }

  // External → same-origin proxy
  return `/api/og-image/proxy?url=${encodeURIComponent(src)}`;
}

export const CustomImage = forwardRef<HTMLImageElement, CustomImageProps>(
  (
    {
      src,
      fallbackSrc = "/broken.gif",
      loadingGif = "/loading.gif",
      ogUrl,
      imageType = "og",
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
    const [resolvedImage, setResolvedImage] = useState<
      string | null | undefined
    >(ogUrl ? undefined : null);

    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
      if (!ogUrl) {
        setResolvedImage(null);
        return;
      }

      let cancelled = false;

      setResolvedImage(undefined);
      setLoaded(false);
      setFailed(false);

      const params = new URLSearchParams({
        url: ogUrl,
        type: imageType,
      });

      fetch(`/api/og-image?${params.toString()}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { image?: string | null } | null) => {
          if (!cancelled) {
            setResolvedImage(data?.image ?? null);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setResolvedImage(null);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [ogUrl, imageType]);

    const resolving = Boolean(ogUrl) && resolvedImage === undefined;

    const resolvedSrc = resolvedImage || getProxiedUrl(src) || fallbackSrc;

    const finalSrc = failed
      ? fallbackSrc
      : resolving
        ? loadingGif
        : resolvedSrc;

    const handleLoad: ReactEventHandler<HTMLImageElement> = (event) => {
      setLoaded(true);
      setFailed(false);
      onLoad?.(event);
    };

    const handleError: ReactEventHandler<HTMLImageElement> = (event) => {
      if (!failed) {
        setFailed(true);
        setLoaded(false);
        return;
      }

      onError?.(event);
    };

    const isLoading = resolving || (!loaded && !failed);

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

CustomImage.displayName = "CustomImage";
