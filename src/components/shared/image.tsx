/** biome-ignore-all lint/performance/noImgElement: <explanation> */
"use client";

import Image, { type ImageProps } from "next/image";

type Props = ImageProps & {
  custom?: boolean;
  loadingGif?: string;
  fallbackGif?: string;
};

export const CustomImage: React.FC<Props> = ({
  custom = false,
  loadingGif = "/loading.gif",
  fallbackGif = "/broken.gif",
  src,
  alt = "",
  ...props
}) => {
  if (custom) {
    const imageSrc = typeof src === "string" ? src : src;

    return <img {...props} src={imageSrc as string} alt={alt} />;
  }

  return <Image {...props} src={src} alt={alt} />;
};
