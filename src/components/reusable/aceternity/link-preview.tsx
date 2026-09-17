"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";
import { encode } from "qss";
import React from "react";

import { cn } from "@/lib/utils";
import { Frame } from "../reui/frame";

type LinkPreviewProps = {
  children: React.ReactNode;
  href: string;
  target?: string;
  rel?: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  layout?: string;
  side?: React.ComponentProps<typeof HoverCardPrimitive.Content>["side"];
  align?: React.ComponentProps<typeof HoverCardPrimitive.Content>["align"];
  sideOffset?: React.ComponentProps<
    typeof HoverCardPrimitive.Content
  >["sideOffset"];
} & (
  | { isStatic: true; imageSrc: string }
  | { isStatic?: false; imageSrc?: never }
);

export const LinkPreview = ({
  children,
  href,
  rel,
  target,
  className,
  width = 200,
  height = 125,
  quality = 50,
  layout = "fixed",
  side = "top",
  align = "center",
  sideOffset = 10,
  isStatic = false,
  imageSrc = "",
}: LinkPreviewProps) => {
  let src: string;

  if (!isStatic) {
    const params = encode({
      url: href,
      screenshot: true,
      meta: false,
      embed: "screenshot.url",
      colorScheme: "dark",
      "viewport.isMobile": true,
      "viewport.deviceScaleFactor": 1,
      "viewport.width": width * 3,
      "viewport.height": height * 3,
    });

    src = `https://api.microlink.io/?${params}`;
  } else {
    src = imageSrc;
  }

  const [isOpen, setOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const x = useMotionValue(0);

  const translateX = useSpring(x, {
    stiffness: 180,
    damping: 18,
    mass: 0.7,
  });

  const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const centerX = rect.width / 2;

    const offset = (mouseX - centerX) * 0.35;

    x.set(offset);
  };

  const handleMouseLeave = () => {
    x.set(0);
  };

  return (
    <>
      {isMounted && (
        <img
          src={src}
          width={width}
          height={height}
          alt=""
          aria-hidden="true"
          className="hidden"
        />
      )}

      <HoverCardPrimitive.Root
        openDelay={50}
        closeDelay={100}
        onOpenChange={setOpen}
      >
        <HoverCardPrimitive.Trigger asChild>
          <a
            href={href}
            target={target}
            rel={rel}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn("inline text-black dark:text-white", className)}
          >
            {children}
          </a>
        </HoverCardPrimitive.Trigger>

        {/*
          Portal is required here: without it Radix renders Content in
          place in the DOM tree. Since <LinkPreview> is used as an inline
          mark inside portable-text <p> blocks, the Frame/div inside
          Content would end up nested inside that <p> — invalid HTML and
          a hydration error. The Portal teleports it to document.body.
        */}
        <HoverCardPrimitive.Portal>
          <HoverCardPrimitive.Content
            side={side}
            align={align}
            sideOffset={sideOffset}
            className="z-50 [transform-origin:var(--radix-hover-card-content-transform-origin)]"
          >
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 24,
                    scale: 0.65,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: 18,
                    scale: 0.7,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 18,
                    mass: 0.7,
                  }}
                  style={{
                    x: translateX,
                  }}
                >
                  <Frame variant="ghost" className="rounded-[20px]!">
                    <a
                      href={href}
                      target={target}
                      rel={rel}
                      className="block rounded-2xl bg-card p-1"
                      style={{ fontSize: 0 }}
                    >
                      <img
                        src={isStatic ? imageSrc : src}
                        width={width}
                        height={height}
                        className="rounded-lg"
                        alt="Preview"
                      />
                    </a>
                  </Frame>
                </motion.div>
              )}
            </AnimatePresence>
          </HoverCardPrimitive.Content>
        </HoverCardPrimitive.Portal>
      </HoverCardPrimitive.Root>
    </>
  );
};
