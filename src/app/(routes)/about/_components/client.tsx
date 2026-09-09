"use client";
import { motion } from "motion/react";
import type { Route } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Pip, Router3 } from "reicon-react";
import { useSoundFx } from "@/components/provider/sound-fx";

const ImagePreviewProvider = dynamic(
  () =>
    import("@/components/provider/preview").then(
      (mod) => mod.ImagePreviewProvider,
    ),
  { ssr: false, loading: () => null },
);

import {
  GitHubContributions,
  GitHubContributionsFallback,
  type GitHubContributionsResult,
} from "@/components/reusable/chanhdai/github-contributions";
import { Timeline } from "@/components/reusable/chanhdai/timeline";
import { Button } from "@/components/reusable/shadcn/button";
import { ArticleList } from "@/components/shared/article-items";
import { Container } from "@/components/shared/container";
import { CurveThingy } from "@/components/shared/curve-thingy";
import { Eyebrow } from "@/components/shared/eyebrow";
import { QuickHero } from "@/components/shared/quick-hero";
import { TextContent } from "@/components/shared/text-content";
import { siteConfig } from "@/config/site.config";
import { navLinksData } from "@/constants/navigation";
import { itemVariants, parentVariants } from "@/constants/variants";
import type { IImagePreviewPortalProps } from "@/types";
import type {
  ArticlesListQueryResult,
  TimelineListQueryResult,
} from "~/sanity.types";

const introduction = `Hey, I’m **${siteConfig.author.name}**, though most people call me **${siteConfig.author.nickname}**.

${siteConfig.author.nickname} is my tribal name, pronounced **oh-see-LAH-ma**, and apparently it means **“requesting something from God.”** I say “apparently” because I have never personally witnessed the naming meeting where my parents decided this was the one.

But I’ve grown into it. It’s a pretty meaningful name, even if it sounds like my parents were submitting a support ticket to heaven.

Anyway, that’s me — ${siteConfig.author.name.split(" ")[0]} on official documents, ${siteConfig.author.nickname} everywhere else, and somewhere in between is where I spend most of my time building things for the web.`;

export const AboutPageClient: React.FC<{
  timeline: TimelineListQueryResult;
  contributions: GitHubContributionsResult;
  articles: ArticlesListQueryResult;
}> = ({ timeline, contributions, articles }) => {
  const { play } = useSoundFx();
  const pathname = usePathname();
  const githubProfileUrl = siteConfig.socials.find(
    (social) => social.platform.toLowerCase() === "github",
  )?.url;

  const articleImages: IImagePreviewPortalProps["images"] = articles.flatMap(
    (project) => {
      const image = project.mainImage;

      if (!image?.image || !image.width || !image.height) return [];

      return [
        {
          alt: project.title ?? undefined,
          url: image.image,
          width: image.width,
          height: image.height,
        },
      ];
    },
  );

  return (
    <div className="flex-1 overflow-x-clip">
      <QuickHero
        eyebrow={{
          icon: navLinksData(pathname as Route)?.icon,
          label: navLinksData(pathname as Route)?.eyebrow as string,
        }}
        title={navLinksData(pathname as Route)?.title as string}
        description={navLinksData(pathname as Route)?.description as string}
        component={{
          content: (
            <React.Suspense fallback={<GitHubContributionsFallback />}>
              <GitHubContributions
                contributions={contributions}
                githubProfileUrl={githubProfileUrl ?? ""}
              />
            </React.Suspense>
          ),
        }}
      />

      <CurveThingy tCurve>
        <TextContent content={introduction} />

        {timeline.length > 0 && (
          <Container size="sm">
            <motion.div
              variants={parentVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-4 md:gap-6"
            >
              <Eyebrow label="Work Experience" icon={Router3} />

              <Timeline className="w-full" items={timeline} />
            </motion.div>
          </Container>
        )}

        {articles.length > 0 && (
          <motion.div
            variants={parentVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-4 md:gap-6"
          >
            <Container size="sm">
              <div className="flex items-center justify-between gap-4">
                <Eyebrow label="Latest Articles" icon={Pip} />

                <motion.div variants={itemVariants}>
                  <Link href="/articles" onClick={() => play("forward")}>
                    <Button variant="outline" size="sm">
                      Explore the rest
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </Container>

            <Container size="md">
              <ImagePreviewProvider images={articleImages}>
                <ArticleList articles={articles} />
              </ImagePreviewProvider>
            </Container>
          </motion.div>
        )}
      </CurveThingy>
    </div>
  );
};
