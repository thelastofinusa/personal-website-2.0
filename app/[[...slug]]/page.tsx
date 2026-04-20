import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { source } from "@/lib/source"
import { absoluteUrl } from "@/lib/utils"
import { mdxComponents } from "@/mdx-components"
import { Header } from "../../components/shared/header"
import { Footer } from "../../components/shared/footer"

export const revalidate = false
export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(
  props: PageProps<"/[[...slug]]">
): Promise<Metadata> {
  const params = await props.params

  const page = source.getPage(params.slug)
  if (!page) return notFound()

  const doc = page.data
  if (!doc.title || !doc.description) return notFound()

  return {
    title: doc.title,
    description: doc.description,
    openGraph: {
      title: doc.title,
      description: doc.description,
      type: "article",
      url: absoluteUrl(page.url),
      images: [
        {
          url: `/og?title=${encodeURIComponent(
            doc.title
          )}&description=${encodeURIComponent(doc.description)}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description: doc.description,
      images: [
        {
          url: `/og?title=${encodeURIComponent(
            doc.title
          )}&description=${encodeURIComponent(doc.description)}`,
        },
      ],
      creator: "@shadcn",
    },
  }
}

export default async function Page(props: PageProps<"/[[...slug]]">) {
  const params = await props.params

  const page = source.getPage(params.slug)
  if (!page) return notFound()

  const doc = page.data
  const MDX = doc.body

  return (
    <div
      suppressHydrationWarning
      className="flex justify-center gap-4 bg-background sm:bg-secondary/10 sm:p-4 md:gap-6 md:p-6 lg:gap-8 lg:p-8"
    >
      <main className="flex max-w-4xl flex-1 flex-col gap-4 bg-background p-5 text-sm sm:rounded-2xl sm:border sm:shadow-xl sm:squircle md:p-6">
        <Header title={doc.title} />
        <MDX components={mdxComponents} />
        <Footer />
      </main>
    </div>
  )
}
