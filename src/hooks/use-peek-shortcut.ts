"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { isMacPlatform } from "@/lib/utils";

export function usePeekShortcut() {
  const isWide = useMediaQuery("(min-width: 768px)");
  const hasMouse = useMediaQuery("(hover: hover) and (pointer: fine)");

  // Set after mount so server and client markup match.
  const [modifierLabel, setModifierLabel] = useState("Ctrl");
  useEffect(() => {
    setModifierLabel(isMacPlatform() ? "⌘" : "Ctrl");
  }, []);

  return { canPeek: isWide && hasMouse, modifierLabel };
}
