/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "cn";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max];

  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "relative grow overflow-hidden rounded-full bg-secondary",
            "ring-1 ring-border/40",
            "transition-[height] duration-200",
            "data-horizontal:h-1.5 data-horizontal:w-full",
            "data-vertical:h-full data-vertical:w-1.5",
          )}
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className={cn(
              "bg-primary rounded-full",
              "shadow-[0_0_10px_-3px_var(--primary)]",
              "transition-[background-color,box-shadow]",
              "data-horizontal:h-full data-vertical:w-full",
            )}
          />
        </SliderPrimitive.Track>

        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className={cn(
              "relative block size-4 shrink-0 rounded-full",
              "border-2 border-background bg-primary",
              "shadow-sm shadow-black/20",
              "ring-1 ring-border/50",
              "transition-[transform,box-shadow]",
              "hover:scale-110",
              "focus-visible:scale-110",
              "focus-visible:ring-4 focus-visible:ring-primary/20",
              "active:scale-95",
              "select-none",
              "after:absolute after:-inset-2",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
