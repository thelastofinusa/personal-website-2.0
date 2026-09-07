"use client";

import React from "react";
import { resolveReicon } from "@/lib/icons";

export function Reicon({
  name,
  ...props
}: {
  name?: string | null;
  className?: string;
  size?: number | string;
}) {
  const Icon = React.useMemo(() => {
    return resolveReicon(name);
  }, [name]);

  if (!Icon) return null;

  return <Icon {...props} />;
}
