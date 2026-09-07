"use client";

import { useCallback, useRef, useState } from "react";
import { useWebHaptics } from "web-haptics/react";
import { useSoundFx } from "@/components/provider/sound-fx";

export type CopyState = "idle" | "done" | "error";

export type UseCopyToClipboardOptions = {
  onCopySuccess?: (text: string) => void;
  onCopyError?: (error: Error) => void;
  resetDelay?: number;
};

export function useCopyToClipboard({
  onCopySuccess,
  onCopyError,
  resetDelay = 1500,
}: UseCopyToClipboardOptions = {}) {
  const { play } = useSoundFx();
  const [state, setState] = useState<CopyState>("idle");
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { trigger: haptic } = useWebHaptics();

  const copy = useCallback(
    async (text: string | (() => string)) => {
      // Clear any pending reset
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }

      try {
        const finalText = typeof text === "function" ? text() : text;
        await navigator.clipboard.writeText(finalText);

        setState("done");

        haptic("success");
        play("copy");

        onCopySuccess?.(finalText);
      } catch (error) {
        setState("error");

        haptic("error");
        play("error");

        onCopyError?.(
          error instanceof Error ? error : new Error("Copy failed"),
        );
      } finally {
        // Schedule reset to idle
        resetTimeoutRef.current = setTimeout(() => {
          setState("idle");
        }, resetDelay);
      }
    },
    [onCopySuccess, onCopyError, haptic, resetDelay, play],
  );

  return { state, copy } as const;
}
