"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"

export function CodeCollapsibleWrapper({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Collapsible>) {
  const [isOpened, setIsOpened] = React.useState(false)

  return (
    <Collapsible
      open={isOpened}
      onOpenChange={setIsOpened}
      className={cn("group/collapsible relative md:-mx-1", className)}
      {...props}
    >
      <CollapsibleTrigger className="absolute top-1.5 right-9 z-10 flex items-center">
        <div
          className={buttonVariants({
            variant: "ghost",
            size: "xs",
            className: "px-2 text-muted-foreground squircle",
          })}
        >
          {isOpened ? "Collapse" : "Expand"}
        </div>
        <Separator orientation="vertical" className="mx-1.5 mt-1.5 h-4!" />
      </CollapsibleTrigger>
      <CollapsibleContent
        keepMounted
        className="relative mt-6 overflow-hidden data-[state=closed]:max-h-64 data-[state=closed]:[content-visibility:auto] [&>figure]:mt-0 [&>figure]:md:mx-0!"
      >
        {children}
      </CollapsibleContent>
      <CollapsibleTrigger className="from-code/70 to-code absolute inset-x-0 -bottom-2 flex h-20 items-center justify-center rounded-b-lg bg-gradient-to-b text-sm text-muted-foreground group-data-[state=open]/collapsible:hidden">
        {isOpened ? "Collapse" : "Expand"}
      </CollapsibleTrigger>
    </Collapsible>
  )
}
