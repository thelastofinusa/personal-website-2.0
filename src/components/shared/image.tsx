/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
"use client";

import Image, { type ImageProps as NextImageProps } from "next/image";
import React from "react";

interface LocalImgProps
  extends Omit<NextImageProps, "src" | "onError" | "onLoad"> {
  src?: string;
  fallbackSrc?: string;
  loadingGif?: string;
  ogUrl?: string;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
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

  // Relative URLs вАФ leave alone
  if (src.startsWith("/") && !src.startsWith("//")) {
    return src;
  }

  // Already same-origin (proxy route, sanity CDN, etc.)
  if (isLocalUrl(src)) {
    return src;
  }

  // External вЖТ proxy through our own origin
  return `/api/og-image/proxy?url=${encodeURIComponent(src)}`;
}

export const LocalImg = React.forwardRef<HTMLImageElement, LocalImgProps>(
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
      loading = "lazy",
      alt = "",
      ...props
    },
    ref,
  ) => {
    const [imageSrc, setImageSrc] = React.useState<string>(loadingGif);
    const [isLoading, setIsLoading] = React.useState(true);
    const [attempt, setAttempt] = React.useState(0);

    // Reset attempt when src or ogUrl changes (new image)
    React.useEffect(() => {
      setAttempt(0);
    }, [src, ogUrl]);

    const resolvedKeyRef = React.useRef<string | null>(null);

    React.useEffect(() => {
      let cancelled = false;
      const key = `${src ?? ""}|${ogUrl ?? ""}`;

      const testImage = (url: string): Promise<boolean> =>
        new Promise((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });

      const resolveImage = async () => {
        if (cancelled) return;

        // Already resolved this exact src/ogUrl pair
        if (resolvedKeyRef.current === key && imageSrc !== loadingGif) {
          return;
        }

        setIsLoading(true);
        setImageSrc(loadingGif);

        // вФАвФАвФА 1. Prefer OG image when ogUrl is provided вФАвФАвФА
        if (ogUrl) {
          try {
            const response = await fetch(
              `/api/og-image?url=${encodeURIComponent(ogUrl)}`,
            );
            if (response.ok) {
              const data: { image?: string | null } = await response.json();
              if (data.image) {
                // /api/og-image already returns a same-origin proxy path
                const works = await testImage(data.image);
                if (cancelled) return;
                if (works) {
                  resolvedKeyRef.current = key;
                  setImageSrc(data.image);
                  setIsLoading(false);
                  return;
                }
              }
            }
          } catch (error) {
            console.warn("OG image fetch failed:", error);
          }
        }

        // вФАвФАвФА 2. Fall back to src вАФ proxied if external вФАвФАвФА
        const proxiedSrc = getProxiedUrl(src);
        if (proxiedSrc) {
          const works = await testImage(proxiedSrc);
          if (cancelled) return;
          if (works) {
            resolvedKeyRef.current = key;
            setImageSrc(proxiedSrc);
            setIsLoading(false);
            return;
          }
        }

        // вФАвФАвФА 3. Final fallback вФАвФАвФА
        if (!cancelled) {
          resolvedKeyRef.current = key;
          setImageSrc(fallbackSrc);
          setIsLoading(false);
        }
      };

      resolveImage();

      return () => {
        cancelled = true;
      };
    }, [src, ogUrl, fallbackSrc, loadingGif, attempt, imageSrc]);

    const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
      // If the current image is not the fallback, retry the entire chain once
      if (imageSrc !== fallbackSrc) {
        setAttempt((prev) => prev + 1);
        return;
      }
      onError?.(event);
    };

    return (
      <Image
        {...props}
        ref={ref}
        src={imageSrc}
        alt={alt}
        aria-label={alt || undefined}
        data-loading={isLoading}
        loading={loading}
        onLoad={onLoad}
        onError={handleError}
        width={width}
        height={height}
      />
    );
  },
);

LocalImg.displayName = "LocalImg";
