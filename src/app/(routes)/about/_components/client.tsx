/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Route } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useState } from "react";
import { useSoundFx } from "@/components/provider/sound-fx";

const ImagePreviewProvider = dynamic(
  () =>
    import("@/components/provider/preview").then(
      (mod) => mod.ImagePreviewProvider,
    ),
  { ssr: false, loading: () => null },
);

import { Router3 } from "reicon-react";
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
import { CustomImage } from "@/components/shared/image";
import { ImageLightbox } from "@/components/shared/lightbox";
import { QuickHero } from "@/components/shared/quick-hero";
import { TextContent } from "@/components/shared/text-content";
import { siteConfig } from "@/config/site.config";
import { navLinksData } from "@/constants/navigation";
import { parentVariants, workItemVariants } from "@/constants/variants";
import type { IImagePreviewPortalProps } from "@/types";
import type {
  ArticlesListQueryResult,
  DailyAppListQueryResult,
  SnapshotQueryResult,
  TimelineListQueryResult,
} from "~/sanity.types";
import { DailyApps } from "./dailyApps";

const introduction = `Hey, I’m **${siteConfig.author.name}**, though most people call me **${siteConfig.author.nickname}** [🔊](pronunciation) or **${siteConfig.author.nicknameShorten}**.

${siteConfig.author.nickname} is my tribal name. It means **“requesting something from God.”** Apparently. I’ve never personally witnessed the naming meeting.

But I’ve grown into it. It’s meaningful, even if it sounds like my parents were submitting a support ticket to heaven.

Anyway, that’s me — ${siteConfig.author.name.split(" ")[0]} on official documents, ${siteConfig.author.nickname} everywhere else, and somewhere in between is where I build things for the web.`;

const moreContent = `So that's the official-ish version of the story.

The rest is mostly me making things, breaking things, fixing things, and occasionally deciding that the problem would be easier to solve if I built an entirely new system around it.

Naturally, this has resulted in a collection of side projects, tiny experiments, and apps that probably didn't need to exist.

Made it this far? [come find me on Telegram](https://t.me/thelastofinusa).`;

export const AboutPageClient: React.FC<{
  timeline: TimelineListQueryResult;
  contributions: GitHubContributionsResult;
  articles: ArticlesListQueryResult;
  dailyApps: DailyAppListQueryResult;
  snapshots: SnapshotQueryResult;
}> = ({ timeline, contributions, articles, dailyApps, snapshots }) => {
  const { play } = useSoundFx();
  const pathname = usePathname();
  const rotations = [-12, -6, 0, 6, 12];
  const verticalOffsets = [20, 4, 0, 4, 20];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const articleRoute = navLinksData("/articles");
  const Icon = articleRoute?.icon;
  const timelineRoute = navLinksData("/about/timeline");
  const TimelineIcon = timelineRoute?.icon;

  const openLightbox = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    play("expand");
    setActiveIndex(idx);
  };

  const closeLightbox = useCallback(() => {
    play("collapse");
    setActiveIndex(null);
  }, [play]);

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
        <motion.div
          variants={parentVariants}
          initial="hidden"
          whileInView="visible"
          className="flex flex-col gap-16 pt-20 sm:pt-30 md:pt-36"
        >
          {snapshots?.images && snapshots.images.length > 0 && (
            <Container size="md">
              <div className="flex items-center justify-center">
                {snapshots.images.map((image, idx) => (
                  <motion.button
                    type="button"
                    onClick={(e) => openLightbox(e, idx)}
                    key={`images${idx}`}
                    style={{
                      rotate: rotations[idx % rotations.length],
                      y: verticalOffsets[idx % verticalOffsets.length],
                    }}
                    whileHover={{
                      scale: 1.1,
                      rotate: 0,
                      zIndex: 100,
                    }}
                    whileTap={{
                      scale: 1.1,
                      rotate: 0,
                      zIndex: 100,
                    }}
                    className="mt-4 -mr-4 shrink-0 overflow-hidden rounded-lg bg-card p-1"
                  >
                    <CustomImage
                      src={image.url as string}
                      alt={`Travel photo ${idx + 1}`}
                      width={500}
                      height={500}
                      className="h-24 w-24 shrink-0 rounded-md object-cover sm:h-32 sm:w-32 md:h-40 md:w-40"
                    />
                  </motion.button>
                ))}
              </div>
            </Container>
          )}
          <Container size="xs">
            <TextContent
              content={introduction}
              namePronunciationUrl={siteConfig.author.namePronunciationUrl}
            />
          </Container>
        </motion.div>

        {/* Unified Timeline Container */}
        {timeline.length > 0 && (
          <Container size="sm">
            <motion.div
              variants={parentVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-6 md:gap-8"
            >
              <Timeline className="w-full" items={timeline} />

              <AnimatePresence mode="popLayout">
                <motion.div
                  variants={workItemVariants}
                  initial="hidden"
                  whileInView="visible"
                  exit="exit"
                  layout
                  className="relative"
                >
                  <Link
                    href={timelineRoute?.href as Route}
                    onClick={() => play("forward")}
                    className="wrapper mx-auto flex w-max items-center"
                  >
                    <Button variant="inverse">
                      <span>{timelineRoute?.action}</span>
                    </Button>
                    <Button variant="inverse" size="icon">
                      {TimelineIcon && <TimelineIcon />}
                    </Button>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </Container>
        )}

        {/* Apps Section */}
        {dailyApps.length > 0 && (
          <motion.div
            variants={parentVariants}
            initial="hidden"
            whileInView="visible"
            className="flex flex-col gap-6"
          >
            <Container size="sm">
              <Eyebrow label="My Little Rectangle Friends" icon={Router3} />
            </Container>

            <Container size="md">
              <DailyApps apps={dailyApps} />
            </Container>
          </motion.div>
        )}

        <motion.div
          variants={parentVariants}
          initial="hidden"
          whileInView="visible"
          className="flex flex-col gap-6"
        >
          <Container size="xs">
            <TextContent content={moreContent} />
          </Container>
        </motion.div>

        {/* Articles Section */}
        {articles.length > 0 && (
          <motion.div
            variants={parentVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6 md:gap-8"
          >
            <Container size="md">
              <div className="flex flex-col gap-8 md:gap-12">
                <ImagePreviewProvider images={articleImages}>
                  <ArticleList articles={articles} />
                </ImagePreviewProvider>

                <AnimatePresence mode="popLayout">
                  <motion.div
                    variants={workItemVariants}
                    initial="hidden"
                    whileInView="visible"
                    exit="exit"
                    layout
                    className="relative"
                  >
                    <Link
                      href={articleRoute?.href as Route}
                      onClick={() => play("forward")}
                      className="wrapper mx-auto flex w-max items-center"
                    >
                      <Button variant="inverse">
                        <span>{articleRoute?.action}</span>
                      </Button>
                      <Button variant="inverse" size="icon">
                        {Icon && <Icon />}
                      </Button>
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
            </Container>
          </motion.div>
        )}

        {/* Lightbox (portals to document.body so transforms above can't break `fixed`) */}
        <AnimatePresence>
          {snapshots?.images &&
            snapshots.images.length > 0 &&
            activeIndex !== null && (
              <ImageLightbox
                images={snapshots?.images}
                initialIndex={activeIndex}
                onClose={closeLightbox}
              />
            )}
        </AnimatePresence>
      </CurveThingy>
    </div>
  );
};
