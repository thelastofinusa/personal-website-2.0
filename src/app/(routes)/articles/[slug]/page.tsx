import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOgImage } from "@/lib/og";
import { fetchArticleBySlug } from "@/sanity/queries/article.query";
import { ArticleDetailsClient } from "./_components/client";

export async function generateMetadata(
  props: PageProps<"/articles/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;

  if (!slug) notFound();

  const { article } = await fetchArticleBySlug(slug);

  if (!article) notFound();

  const ogImage = getOgImage({
    title: article.title as string,
    description: article.description as string,
    category: "Article",
  });

  return {
    title: article.title as string,
    description: article.description as string,

    openGraph: {
      type: "article",
      title: article.title as string,
      description: article.description as string,
      url: `/articles/${slug}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title as string,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: article.title as string,
      description: article.description as string,
      images: [ogImage],
    },
  };
}

export default async function ArticleDetails(
  props: PageProps<"/articles/[slug]">,
) {
  const { slug } = await props.params;
  if (!slug) notFound();

  const slugData = await fetchArticleBySlug(slug);
  if (!slugData.article) notFound();

  return <ArticleDetailsClient {...slugData} />;
}
