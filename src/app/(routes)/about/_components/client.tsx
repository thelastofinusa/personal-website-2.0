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
import {
  parentVariants,
  snapshotImageVariants,
  workItemVariants,
} from "@/constants/variants";
import type { IImagePreviewPortalProps } from "@/types";
import type {
  ArticlesListQueryResult,
  DailyAppListQueryResult,
  SnapshotQueryResult,
  TimelineListQueryResult,
} from "~/sanity.types";
import { DailyApps } from "./dailyApps";

const introduction = `Hey, I’m **${siteConfig.author.name}**—though most people just call me **${siteConfig.author.nickname}** [🔊](pronunciation) or **${siteConfig.author.nicknameShorten}**.

${siteConfig.author.nickname} is my tribal name, which translates to **“requesting something from God.”** I missed the naming meeting, but I’ve grown into it.

It’s deeply meaningful, even if it occasionally sounds like my parents were filing a support ticket straight to heaven.

Anyway, that’s me: ${siteConfig.author.name.split(" ")[0]} on government forms, ${siteConfig.author.nickname} everywhere else, and somewhere in that mix is where I build things for the web.`;

const moreContent = `That’s the official-ish rundown.

The rest of the time, I’m usually building things, breaking them, fixing them, or convincing myself that a minor problem is best solved by designing an entirely new system from scratch.

Unsurprisingly, this loop has produced a mountain of side projects, tiny experiments, and apps that probably had no business existing.

Made it this far? [come say hi on Telegram](https://t.me/thelastofinusa).`;

export const AboutPageClient: React.FC<{
  timeline: TimelineListQueryResult;
  contributions: GitHubContributionsResult;
  articles: ArticlesListQueryResult;
  dailyApps: DailyAppListQueryResult;
  snapshots: SnapshotQueryResult;
}> = ({ timeline, contributions, articles, dailyApps, snapshots }) => {
  const { play } = useSoundFx();
  const pathname = usePathname();
  const _rotations = [-12, -6, 0, 6, 12];
  const _verticalOffsets = [20, 4, 0, 4, 20];
  const imageHeights = [
    "h-24 md:h-32",
    "h-28 md:h-38",
    "h-32 md:h-44",
    "h-28 md:h-38",
    "h-24 md:h-32",
  ];

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
              <div className="flex items-end justify-center">
                {snapshots.images.map((image, idx) => (
                  <motion.button
                    type="button"
                    onClick={(e) => openLightbox(e, idx)}
                    key={`images${idx}`}
                    variants={snapshotImageVariants}
                    initial="hidden"
                    animate="visible"
                    custom={idx} // Passes index dynamically into the variant function
                    style={{
                      zIndex: idx === 2 ? 10 : idx === 1 || idx === 3 ? 5 : 0,
                    }}
                    whileHover={{
                      scale: 1.2,
                      rotate: 0,
                      zIndex: 20,
                    }}
                    whileTap={{
                      scale: 1.1,
                      rotate: 0,
                      zIndex: 20,
                    }}
                    className="-mr-4 shrink-0 overflow-hidden rounded-[12px] border bg-card p-0.5 md:p-1"
                  >
                    <CustomImage
                      src={image.url as string}
                      alt={`${siteConfig.author.nickname}'s ${idx + 1}`}
                      width={500}
                      height={500}
                      className={`w-24 md:w-40 ${imageHeights[idx % imageHeights.length]} shrink-0 rounded-[9px] object-cover`}
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
