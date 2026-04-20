"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { RiContractLeftLine, RiContractRightLine } from "react-icons/ri"
import type { Route } from "next"
import { cn } from "@/lib/utils"

type NavActionProps = {
  label?: string
  direction?: "prev" | "next"
  href?: Route
  className?: string
}

export const NavAction = ({
  label = "Go Back",
  direction = "prev",
  href,
  className,
}: NavActionProps) => {
  const router = useRouter()

  const content = (
    <>
      {direction === "prev" && <RiContractLeftLine className="mr-1 size-4.5" />}
      <span>{label}</span>
      {direction === "next" && (
        <RiContractRightLine className="ml-1 size-4.5" />
      )}
    </>
  )

  const baseStyles =
    "inline-flex w-max cursor-pointer text-primary items-center text-xs font-semibold uppercase hover:underline underline-offset-4"

  if (href) {
    return (
      <Link href={href} className={cn(baseStyles, className)}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={cn(baseStyles, className)}
    >
      {content}
    </button>
  )
}
