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

    React.useEffect(() => {
      let cancelled = false;

      // Helper: test if an image URL loads successfully
      const testImage = (url: string): Promise<boolean> => {
        return new Promise((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });
      };

      const resolveImage = async () => {
        if (cancelled) return;
        setIsLoading(true);
        setImageSrc(loadingGif);

        // 1. Try Open Graph image via API first
        if (ogUrl) {
          try {
            const response = await fetch(
              `/api/og-image?url=${encodeURIComponent(ogUrl)}`,
            );
            if (response.ok) {
              const data: { image?: string | null } = await response.json();
              if (data.image) {
                const works = await testImage(data.image);
                if (cancelled) return;
                if (works) {
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

        // 2. Fall back to direct src
        if (src) {
          const works = await testImage(src);
          if (cancelled) return;
          if (works) {
            setImageSrc(src);
            setIsLoading(false);
            return;
          }
        }

        // 3. Fallback to broken image
        if (!cancelled) {
          setImageSrc(fallbackSrc);
          setIsLoading(false);
        }
      };

      resolveImage();

      return () => {
        cancelled = true;
      };
    }, [src, ogUrl, fallbackSrc, loadingGif, attempt]); // attempt triggers re-run on error

    const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
      // If the current image is not the fallback, retry the entire chain once
      if (imageSrc !== fallbackSrc) {
        setAttempt((prev) => prev + 1);
        return;
      }
      // Otherwise, propagate the error
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
        unoptimized
        onLoad={onLoad}
        onError={handleError}
        width={width}
        height={height}
      />
    );
  },
);

LocalImg.displayName = "LocalImg";
