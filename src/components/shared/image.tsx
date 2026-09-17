"use client";
import Image, { type ImageProps } from "next/image";
import * as React from "react";

type Props = ImageProps & {
  loadingGif?: string;
  fallbackGif?: string;
};

export const CustomImage: React.FC<Props> = ({
  loadingGif = "/loading.gif",
  fallbackGif = "/broken.gif",
  src,
  alt = "",
  ...props
}) => {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);

  // Sync state if the `src` prop changes from the parent component
  React.useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        // Prevent infinite loops in case the fallback image also fails to load
        if (!hasError) {
          setImgSrc(fallbackGif);
          setHasError(true);
        }
      }}
      // Next.js natively handles placeholders and maps them to your width/height props
      placeholder={loadingGif ? "blur" : "empty"}
      blurDataURL={loadingGif}
    />
  );
};
