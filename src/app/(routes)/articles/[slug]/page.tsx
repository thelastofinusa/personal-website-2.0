import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchArticleBySlug } from "@/sanity/queries/article.query";
import { ArticleDetailsClient } from "./_components/client";

export async function generateMetadata(
  props: PageProps<"/articles/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  if (!slug) notFound();

  const { article } = await fetchArticleBySlug(slug);
  if (!article) notFound();

  return {
    title: article.title,
    description: article.description,
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
