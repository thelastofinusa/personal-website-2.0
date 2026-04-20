import localFont from "next/font/local"

import { cn } from "@/lib/utils"

const fontSans = localFont({
  src: "./GoogleSans/GoogleSans-VariableFont_GRAD,opsz,wght.ttf",
  variable: "--font-sans",
  preload: true,
})

const fontMono = localFont({
  src: [
    {
      path: "./LiberationMono/LiberationMono-Bold.ttf",
      weight: "700",
    },
    {
      path: "./LiberationMono/LiberationMono-Regular.ttf",
      weight: "400",
    },
  ],
  variable: "--font-mono",
  preload: true,
})

const fontVariable = (className?: string) =>
  cn(fontSans.variable, fontMono.variable, className)

export { fontVariable }
