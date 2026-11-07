/** biome-ignore-all lint/a11y/noLabelWithoutControl: skipped */
"use client";

import { cn } from "cn";
import type * as React from "react";

function Label({
  className,
  required,
  ...props
}: React.ComponentProps<"label"> & { required?: boolean }) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex select-none items-center gap-1.5 font-normal text-[13px] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        className,
      )}
      {...props}
    >
      <span>{props.children}</span>
      {required && <span className="text-destructive">*</span>}
    </label>
  );
}

export { Label };
