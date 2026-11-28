"use client";

import gsap from "gsap";
import { motion, useMotionValue, useSpring } from "motion/react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { BrowserWindow } from "@/components/shared/browser-window";
import { CustomImage } from "@/components/shared/image";
import type {
  IImagePreviewContextType,
  IImagePreviewPortalProps,
  IImagePreviewProviderProps,
} from "@/types";
import { Frame, FramePanel } from "../reusable/reui/frame";
import { useSoundFx } from "./sound-fx";

const ImagePreviewContext = createContext<IImagePreviewContextType | null>(
  null,
);

export const useImagePreview = () => {
  const context = useContext(ImagePreviewContext);
  if (!context) {
    throw new Error(
      "useImagePreview must be used within a ImagePreviewProvider",
    );
  }
  return context;
};

export const ImagePreviewProvider = ({
  children,
  images,
  maxWidth = 380,
}: IImagePreviewProviderProps) => {
  const { play } = useSoundFx();
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const imageTrackRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(-maxWidth);
  const mouseY = useMotionValue(-200);

  const springX = useSpring(mouseX, { stiffness: 300, damping: 35, mass: 3 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 35, mass: 3 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseX.set(event.clientX + 20);
      mouseY.set(event.clientY + 20);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (activeIndex === null || !imageTrackRef.current || !panelRef.current)
      return;

    const track = imageTrackRef.current;
    const targetImage = track.children[activeIndex] as HTMLElement;
    if (!targetImage) return;

    gsap.to(track, {
      y: -targetImage.offsetTop,
      duration: 0.8,
      ease: "power4.out",
      overwrite: true,
    });

    gsap.to(panelRef.current, {
      height: targetImage.offsetHeight,
      duration: 0.8,
      ease: "power4.out",
      overwrite: true,
    });
  }, [activeIndex]);

  const handleMouseEnter = React.useCallback(
    (index: number) => {
      setActiveIndex(index);
      play("hover");

      if (!previewRef.current) return;

      gsap.killTweensOf(previewRef.current);
      gsap.to(previewRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.35,
        ease: "power3.out",
        overwrite: true,
      });
    },
    [play],
  );

  const handleMouseLeave = React.useCallback(() => {
    setActiveIndex(null);

    if (!previewRef.current) return;

    gsap.killTweensOf(previewRef.current);
    gsap.to(previewRef.current, {
      opacity: 0,
      scale: 0.92,
      duration: 0.25,
      ease: "power2.out",
      overwrite: true,
    });
  }, []);

  const portalProps: IImagePreviewPortalProps = {
    images,
    activeIndex,
    imageTrackRef,
    maxWidth,
    panelRef,
    previewRef,
    springX,
    springY,
  };

  return (
    <ImagePreviewContext.Provider
      value={{ handleMouseEnter, handleMouseLeave }}
    >
      {children}
      {mounted && createPortal(<ImagePortal {...portalProps} />, document.body)}
    </ImagePreviewContext.Provider>
  );
};

const ImagePortal: React.FC<IImagePreviewPortalProps> = ({
  springY,
  springX,
  previewRef,
  maxWidth,
  activeIndex,
  images,
  panelRef,
  imageTrackRef,
}) => {
  const activeImage = activeIndex !== null ? images[activeIndex] : undefined;

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      className="pointer-events-none fixed top-0 left-0 z-50 hidden md:block"
    >
      <Frame ref={previewRef} className="rounded-[20px]! opacity-0">
        <div
          style={{ width: `${maxWidth}px` }}
          className="border-border/60 bg-background overflow-hidden rounded-2xl border"
        >
          <BrowserWindow
            variant="compact"
            title={
              activeImage?.alt || (activeIndex !== null ? "Preview" : "New tab")
            }
            url={activeImage?.url || activeImage?.ogUrl}
          />

          <FramePanel
            ref={panelRef}
            className="bg-card relative h-28 overflow-hidden rounded-none border-0!"
          >
            <div ref={imageTrackRef} className="absolute top-0 left-0 w-full">
              {images.map((img, index) => (
                <div
                  key={`${img.url}-${img.alt ?? index}`}
                  className="relative h-auto w-full"
                >
                  <CustomImage
                    src={img.url}
                    ogUrl={img.ogUrl}
                    alt={img.alt ?? img.url}
                    className="block h-auto w-full object-cover"
                    width={img.width}
                    height={img.height}
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </FramePanel>
        </div>
      </Frame>
    </motion.div>
  );
};
