"use client";

import { Analytics } from "@vercel/analytics/react";
import type { LenisRef } from "lenis/react";
import { ReactLenis } from "lenis/react";
import { cancelFrame, frame } from "motion/react";
import NextJsToploader from "nextjs-toploader";
import * as React from "react";
import { ThemeProvider } from "@/components/provider/theme";
import { ScrollProgress } from "@/components/reusable/magicui/scroll-progress";
import { Toaster } from "@/components/reusable/shadcn/toast";
import { TooltipProvider } from "@/components/reusable/shadcn/tooltip";
import { Footer } from "@/components/shared/footer";
import { Navigation } from "@/components/shared/navigation";
import { SoundFxProvider } from "./sound-fx";

export const GlobalProvider: React.FC<React.PropsWithChildren> = (props) => {
  const lenisRef = React.useRef<LenisRef>(null);

  React.useEffect(() => {
    function update(data: { timestamp: number }) {
      const time = data.timestamp;
      lenisRef.current?.lenis?.raf(time);
    }

    frame.update(update, true);

    return () => cancelFrame(update);
  }, []);

  return (
    <SoundFxProvider>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <NextJsToploader color="var(--primary)" showSpinner={false} />
          <ScrollProgress />

          <Navigation />
          <main className="min-h-full flex flex-col">
            <div className="relative z-20 flex-1">{props.children}</div>
          </main>
          <Footer />

          <Toaster />
          <ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />
          {process.env.NODE_ENV === "production" && <Analytics />}
        </TooltipProvider>
      </ThemeProvider>
    </SoundFxProvider>
  );
};
