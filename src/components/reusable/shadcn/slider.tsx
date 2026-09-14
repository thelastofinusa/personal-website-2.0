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
      className={cn(
        "group flex items-center data-horizontal:w-full data-vertical:h-full data-vertical:flex-col",
        className,
      )}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      // "center" alignment prevents dynamic scaling from clipping or jittering at 0% and 100%
      thumbAlignment="center"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "relative grow overflow-hidden rounded-full bg-secondary/50 backdrop-blur-sm",
            "ring-1 ring-inset ring-border/20",
            // Track thickens dynamically on hover and active states
            "transition-[height,width] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            "group-hover:bg-secondary/70",
            "data-horizontal:h-2 data-horizontal:w-full data-horizontal:group-hover:h-2.5 data-horizontal:group-active:h-3",
            "data-vertical:h-full data-vertical:w-2 data-vertical:group-hover:w-2.5 data-vertical:group-active:w-3",
          )}
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className={cn(
              "bg-gradient-to-r from-primary/80 to-primary rounded-full",
              "shadow-[0_0_12px_0_var(--primary)]",
              "transition-all duration-300",
              "data-horizontal:h-full data-vertical:w-full",
            )}
          />
        </SliderPrimitive.Track>

        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className={cn(
              "relative block size-5 shrink-0 rounded-full",
              "bg-background border-[3px] border-primary",
              "shadow-md shadow-primary/20",
              // Spring physics for all transformations
              "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
              "hover:scale-125 hover:border-primary/80",
              "focus-visible:scale-125 focus-visible:ring-4 focus-visible:ring-primary/20",
              // Directional squish: stretches along the drag axis, compresses on the perpendicular
              "data-horizontal:active:scale-x-[1.4] data-horizontal:active:scale-y-[0.75]",
              "data-vertical:active:scale-y-[1.4] data-vertical:active:scale-x-[0.75]",
              "active:bg-primary active:border-primary active:shadow-lg active:shadow-primary/40",
              "select-none",
              // Expanded invisible hit area for better touch UX without inflating visible size
              "after:absolute after:-inset-4",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
