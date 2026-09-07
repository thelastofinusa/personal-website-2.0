import { cn } from "cn";

export function FadeLine({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute bg-border",
        orientation === "horizontal"
          ? "mask-[linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] inset-x-0 h-px"
          : "mask-[linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] inset-y-0 w-px",
        className,
      )}
    />
  );
}
