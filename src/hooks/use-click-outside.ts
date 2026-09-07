"use client";

import * as React from "react";

type RefLike = React.RefObject<HTMLElement | null>;

export function useOnClickOutside(
  refs: RefLike | RefLike[],
  handler: (event: PointerEvent) => void,
  enabled = true,
) {
  React.useEffect(() => {
    if (!enabled) return;

    const list = Array.isArray(refs) ? refs : [refs];

    const listener = (event: PointerEvent) => {
      const target = event.target as Node;
      const clickedInside = list.some((ref) => ref.current?.contains(target));
      if (clickedInside) return;
      handler(event);
    };

    // pointerdown fires before click, feels snappier for "tap anywhere to dismiss"
    document.addEventListener("pointerdown", listener);
    return () => document.removeEventListener("pointerdown", listener);
  }, [refs, handler, enabled]);
}
