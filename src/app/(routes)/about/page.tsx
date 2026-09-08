import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { navLinksData } from "@/constants/navigation";
import { fetchGitHubContributions } from "@/lib/github-contributions";
import { getOgImage } from "@/lib/og";
import { fetchPinnedArticles } from "@/sanity/queries/article.query";
import { fetchAllTimeline } from "@/sanity/queries/timeline.query";
import { AboutPageClient } from "./_components/client";

const nav = navLinksData("/about");

export const metadata: Metadata = {
  title: nav?.eyebrow,
  description: nav?.description,
  openGraph: {
    title: nav?.eyebrow,
    description: nav?.description,
    url: "/about",
    images: [
      {
        url: getOgImage({
          title: nav?.eyebrow ?? "About",
          description: nav?.description,
          category: "About",
        }),
        width: 1200,
        height: 630,
        alt: nav?.eyebrow ?? "About",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: nav?.eyebrow,
    description: nav?.description,
    images: [
      getOgImage({
        title: nav?.eyebrow ?? "About",
        description: nav?.description,
        category: "About",
      }),
    ],
  },
};

export default async function About() {
  const timeline = await fetchAllTimeline();
  const articles = await fetchPinnedArticles();
  const contributions = await fetchGitHubContributions(
    siteConfig.author.username,
  );

  return (
    <AboutPageClient
      timeline={timeline}
      articles={articles}
      contributions={contributions}
    />
  );
}
