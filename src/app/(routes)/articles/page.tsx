import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { navLinksData } from "@/constants/navigation";
import { getOgImage } from "@/lib/og";
import { fetchAllArticles } from "@/sanity/queries/article.query";
import { fetchAllArticleUrls } from "@/sanity/queries/articleUrl.query";
import { ArticlesPageClient } from "./_components/client";

const nav = navLinksData("/articles");

export const metadata: Metadata = {
  title: nav?.eyebrow,
  description: nav?.description,

  openGraph: {
    title: `${nav?.eyebrow} - ${siteConfig.author.nickname}`,
    description: nav?.description,
    url: nav?.href,
    siteName: siteConfig.title,
    images: [
      {
        url: getOgImage({
          title: `${nav?.eyebrow} - ${siteConfig.author.nickname}`,
          description: nav?.description,
          category: "Articles",
        }),
        width: 1200,
        height: 630,
        alt: `${nav?.eyebrow} - ${siteConfig.author.nickname}`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${nav?.eyebrow} - ${siteConfig.author.nickname}`,
    description: nav?.description,
    images: [
      getOgImage({
        title: `${nav?.eyebrow} - ${siteConfig.author.nickname}`,
        description: nav?.description,
        category: "Articles",
      }),
    ],
  },
};

export default async function Articles() {
  const articles = await fetchAllArticles();
  const articleUrls = await fetchAllArticleUrls();

  return <ArticlesPageClient articles={articles} articleUrls={articleUrls} />;
}
