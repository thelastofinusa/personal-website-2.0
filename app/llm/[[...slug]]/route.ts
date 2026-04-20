import { notFound } from "next/navigation"
import { NextResponse, type NextRequest } from "next/server"
import { source } from "@/lib/source"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const [{ slug }] = await Promise.all([params])
  const page = source.getPage(slug)

  if (!page) notFound()

  const raw = await page.data.getText("raw")

  return new NextResponse(raw, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}

export function generateStaticParams() {
  return source.generateParams()
}
