"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { IoInvertMode } from "react-icons/io5"
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { buttonVariants } from "../ui/button"
import { Skeleton } from "../ui/skeleton"

export function ModeSwitcher() {
  const { setTheme, resolvedTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

  if (!mounted) return <Skeleton className="size-6 rounded-lg squircle" />

  return (
    <Tooltip>
      <TooltipTrigger>
        <div
          onClick={toggleTheme}
          className={buttonVariants({
            size: "icon-sm",
            variant: "ghost",
          })}
        >
          {theme === "light" ? (
            <MdOutlineDarkMode className="size-4 cursor-pointer" />
          ) : theme === "dark" ? (
            <MdOutlineLightMode className="size-4 cursor-pointer" />
          ) : (
            <IoInvertMode className="size-4 cursor-pointer" />
          )}
          <span className="sr-only capitalize">Toggle theme</span>
        </div>
      </TooltipTrigger>
      <TooltipContent align="center" side="bottom">
        <p className="font-medium capitalize">Toggle theme</p>
      </TooltipContent>
    </Tooltip>
  )
}
