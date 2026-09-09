"use client";

import { Analytics } from "@vercel/analytics/react";
import dynamic from "next/dynamic";
import NextJsToploader from "nextjs-toploader";
import type * as React from "react";
import { ThemeProvider } from "@/components/provider/theme";
import { Toaster } from "@/components/reusable/shadcn/toast";
import { TooltipProvider } from "@/components/reusable/shadcn/tooltip";
import { Footer } from "@/components/shared/footer";
import { Navigation } from "@/components/shared/navigation";
import { SoundFxProvider } from "./sound-fx";
import { ToggleProvider } from "./toggle";

const LenisSmoothScroll = dynamic(
  () => import("./lenis").then((mod) => mod.LenisSmoothScroll),
  { ssr: false, loading: () => null },
);

export const GlobalProvider: React.FC<React.PropsWithChildren> = (props) => {
  return (
    <SoundFxProvider>
      <ThemeProvider defaultTheme="system">
        <ToggleProvider>
          <TooltipProvider>
            <NextJsToploader color="var(--primary)" showSpinner={false} />

            <Navigation />
            <main className="min-h-full flex flex-col">
              <div className="relative z-20 flex-1">{props.children}</div>
            </main>
            <Footer />

            <Toaster />
            <LenisSmoothScroll />
            {process.env.NODE_ENV === "production" && <Analytics />}
          </TooltipProvider>
        </ToggleProvider>
      </ThemeProvider>
    </SoundFxProvider>
  );
};
