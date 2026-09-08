"use client";

import type { LenisRef } from "lenis/react";
import { ReactLenis } from "lenis/react";
import { cancelFrame, frame } from "motion/react";
import * as React from "react";

export const LenisSmoothScroll: React.FC = () => {
  const lenisRef = React.useRef<LenisRef>(null);

  React.useEffect(() => {
    function update(data: { timestamp: number }) {
      const time = data.timestamp;
      lenisRef.current?.lenis?.raf(time);
    }

    frame.update(update, true);

    return () => cancelFrame(update);
  }, []);

  return <ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />;
};
