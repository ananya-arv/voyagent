"use client"

import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

function Slider({ className, ...props }: SliderPrimitive.Root.Props) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn("relative w-full", className)}
      {...props}
    >
      <SliderPrimitive.Control
        data-slot="slider-control"
        className="flex w-full touch-none items-center py-2 select-none"
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative h-2 w-full grow overflow-hidden rounded-full bg-mist ring-1 ring-line"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-indicator"
            className="absolute h-full rounded-full bg-gradient-to-r from-brand-deep to-teal transition-all duration-300 ease-out"
          />
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            className="size-5 shrink-0 rounded-full border-2 border-brand-deep bg-background shadow-[0_2px_6px_-1px_rgba(7,58,68,0.35)] outline-none transition-all duration-300 ease-out hover:scale-110 focus-visible:ring-4 focus-visible:ring-brand/30 active:scale-95 active:duration-75 disabled:pointer-events-none disabled:opacity-50"
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
