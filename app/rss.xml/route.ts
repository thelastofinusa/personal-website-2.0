import { NextResponse } from "next/server"

import { siteConfig } from "@/config/site.config"
import { source } from "@/lib/source"

export const revalidate = false

export async function GET() {
  const items = source
    .getPages()
    .map((page) => {
      const data = page.data
      const date = page.date?.toUTCString() ?? new Date().toUTCString()
      const link = `${siteConfig.url}/docs/${page.slugs.join("/")}`

      return `    <item>
      <title><![CDATA[${data.title}]]></title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description><![CDATA[${data.description || ""}]]></description>
      <pubDate>${date}</pubDate>
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name}</title>
    <link>${siteConfig.url}</link>
    <description>${siteConfig.description}</description>
    <language>en-us</language>
    <atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  })
}
