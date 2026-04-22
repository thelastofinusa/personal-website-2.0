"use client"
import React from "react"
import { RiDownload2Line } from "react-icons/ri"
import { buttonVariants } from "../ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { siteConfig } from "@/config/site.config"
import { Loader } from "lucide-react"

export const DownloadResume = () => {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleDownload = async () => {
    setIsLoading(true)

    try {
      const res = await fetch("/resume.pdf")
      const blob = await res.blob()

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${siteConfig.name.split(" ").join("_")}_Resume.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger onClick={handleDownload}>
        <div
          className={buttonVariants({
            size: "icon-sm",
            variant: "ghost",
            className: isLoading && "pointer-events-none opacity-50",
          })}
        >
          {isLoading ? (
            <Loader className="animate-spin" />
          ) : (
            <RiDownload2Line />
          )}
          <span className="sr-only">
            {isLoading ? "Downloading..." : "Download Resume"}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent align="end" side="bottom">
        <p className="font-medium">
          {isLoading ? "Downloading..." : "Download Resume"}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}
