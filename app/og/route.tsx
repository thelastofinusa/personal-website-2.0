import { siteConfig } from "@/config/site.config"
import { ImageResponse } from "next/og"

export async function GET(request: Request) {
  const { searchParams, host } = new URL(request.url)
  const title = searchParams.get("title")
  const description = searchParams.get("description")

  return new ImageResponse(
    <div tw="flex h-full w-full bg-[#0d1117] text-[#f0fcf6]">
      <div tw="flex border absolute border-[#252a31] border-dashed inset-y-0 left-16 w-[1px]" />
      <div tw="flex border absolute border-[#252a31] border-dashed inset-y-0 right-16 w-[1px]" />
      <div tw="flex border absolute border-[#252a31] inset-x-0 h-[1px] top-16" />
      <div tw="flex border absolute border-[#252a31] inset-x-0 h-[1px] bottom-16" />
      <div tw="flex flex-col p-32 justify-between">
        <div tw="flex flex-col">
          <div
            tw="tracking-tight flex flex-col justify-center"
            style={{
              textWrap: "balance",
              fontWeight: 600,
              fontSize: title && title.length > 20 ? 64 : 80,
            }}
          >
            {title?.toLowerCase() === "readme" ? siteConfig.nickname : title}
          </div>
          <div
            tw="text-[36px] text-[#9198a1]"
            style={{
              fontWeight: 500,
              textWrap: "balance",
            }}
          >
            {description}
          </div>
        </div>

        <div tw="flex flex-col text-[#4493f8] underline text-[24px]">
          {host}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  )
}
