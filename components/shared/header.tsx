"use client"
import React from "react"
import { usePathname } from "next/navigation"

import { siteConfig } from "@/config/site.config"
import { NavAction } from "@/components/shared/nav-action"
import { ModeSwitcher } from "@/components/shared/mode-switcher"
import { DownloadResume } from "@/components/shared/download-resume"
import Link from "next/link"

export const Header: React.FC<{ title: string }> = ({ title }) => {
  const pathname = usePathname()
  const isNotHome = pathname !== "/"

  return (
    <React.Fragment>
      <header className="flex items-center gap-4">
        <Link href="/" className="font-mono text-xs">
          <span>{siteConfig.username}/</span>
          <span className="font-semibold uppercase">
            {title.split(" ").join("_")}
          </span>
          <span>.md</span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <ModeSwitcher />
          <DownloadResume />
        </div>
      </header>

      {isNotHome && <NavAction />}
    </React.Fragment>
  )
}
