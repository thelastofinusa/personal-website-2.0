import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { navLinksData } from "@/constants/navigation";
import { fetchGitHubContributions } from "@/lib/github-contributions";
import { fetchPinnedArticles } from "@/sanity/queries/article.query";
import { fetchAllTimeline } from "@/sanity/queries/timeline.query";
import { AboutPageClient } from "./_components/client";

export const metadata: Metadata = {
  title: navLinksData("/about")?.eyebrow,
  description: navLinksData("/about")?.description,
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
