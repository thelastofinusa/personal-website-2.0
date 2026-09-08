"use client";

import gsap from "gsap";
import { EllipsisVerticalIcon } from "lucide-react";
import { motion, useMotionValue, useSpring } from "motion/react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowRotate,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
  Plus,
  Xmark,
} from "reicon-react";
import { siteConfig } from "@/config/site.config";
import type {
  IImagePreviewContextType,
  IImagePreviewPortalProps,
  IImagePreviewProviderProps,
} from "@/types";
import { Frame, FramePanel } from "../reusable/reui/frame";
import { LocalImg } from "../shared/image";
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

    // Slide track vertically to active image
    gsap.to(track, {
      y: -targetImage.offsetTop,
      duration: 0.8,
      ease: "power4.out",
      overwrite: true,
    });

    // Dynamically adjust container height to match active image height
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

  const previewProvider: IImagePreviewContextType = {
    handleMouseEnter,
    handleMouseLeave,
  };

  return (
    <ImagePreviewContext.Provider value={previewProvider}>
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
}) => (
  <motion.div
    style={{ x: springX, y: springY }}
    className="pointer-events-none fixed left-0 top-0 z-50 hidden md:block"
  >
    <Frame ref={previewRef} className="opacity-0 rounded-[20px]!">
      <div
        style={{ width: `${maxWidth}px` }}
        className="overflow-hidden rounded-2xl border border-border/60 bg-background"
      >
        {/* Browser chrome */}
        <div className="bg-muted/70">
          {/* Tab */}
          <div className="flex pt-1 pb-0.5 items-center px-2.5">
            <div className="flex items-center mr-2 gap-1">
              <span className="size-2 rounded-full border border-[#e0443e] bg-[#ff5f57]" />
              <span className="size-2 rounded-full border border-[#d89e24] bg-[#febc2e]" />
              <span className="size-2 rounded-full border border-[#1aab29] bg-[#28c840]" />
            </div>

            <div className="flex h-6 max-w-32.5 relative flex-1 items-center gap-1.5 rounded-t-sm bg-card px-2">
              <LocalImg
                src={siteConfig.author.avatar}
                alt={siteConfig.author.name}
                className="size-2.5 rounded-sm"
              />

              <span className="truncate text-[9px] flex-1 font-medium text-muted-foreground">
                {activeIndex !== null
                  ? images[activeIndex]?.alt || "Preview"
                  : "New tab"}
              </span>

              <Xmark className="text-muted-foreground ml-auto size-3" />

              <span className="absolute -bottom-1 left-0 w-full h-2 bg-inherit" />
            </div>

            <Plus className="size-3 text-muted-foreground ml-2 my-auto" />

            <div className="size-5 bg-card rounded-sm flex ml-auto items-center justify-center">
              <ChevronDown className="size-3 text-muted-foreground" />
            </div>
          </div>

          {/* Address bar */}
          <div className="flex items-center bg-card gap-2 px-2 py-1.5">
            <ChevronLeft className="size-3 text-muted-foreground" />
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <ArrowRotate className="size-3 text-muted-foreground" />

            <div className="flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded-sm bg-muted px-2">
              <Lock className="size-2.5 shrink-0 text-muted-foreground" />

              <span className="min-w-0 flex-1 truncate overflow-hidden text-[10px] font-light text-muted-foreground">
                {activeIndex !== null
                  ? images[activeIndex]?.url || images[activeIndex]?.ogUrl
                  : "preview.local"}
              </span>
            </div>

            <div className="size-5 flex ml-auto shrink-0 items-center justify-center">
              <EllipsisVerticalIcon className="size-3 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Browser viewport */}
        <FramePanel
          ref={panelRef}
          className="relative overflow-hidden h-28 rounded-none border-0! bg-card"
        >
          <div ref={imageTrackRef} className="absolute left-0 top-0 w-full">
            {images.map((img) => (
              <div key={img.alt ?? img.url} className="relative h-auto w-full">
                <LocalImg
                  src={img.url}
                  ogUrl={img.ogUrl}
                  alt={img.alt ?? img.url}
                  className="block h-auto w-full object-cover"
                  width={img.width}
                  height={img.height}
                />
              </div>
            ))}
          </div>
        </FramePanel>
      </div>
    </Frame>
  </motion.div>
);
