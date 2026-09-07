import type { Metadata } from "next";
import { navLinksData } from "@/constants/navigation";
import { fetchAllArticles } from "@/sanity/queries/article.query";
import { fetchAllArticleUrls } from "@/sanity/queries/articleUrl.query";
import { ArticlesPageClient } from "./_components/client";

export const metadata: Metadata = {
  title: navLinksData("/articles")?.eyebrow,
  description: navLinksData("/articles")?.description,
};

export default async function Articles() {
  const articles = await fetchAllArticles();
  const articleUrls = await fetchAllArticleUrls();

  return <ArticlesPageClient articles={articles} articleUrls={articleUrls} />;
}
