/** biome-ignore-all lint/suspicious/noArrayIndexKey: ignore */
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
import { ContactComp } from "@/components/shared/contact";
import { Container } from "@/components/shared/container";
import { CurveThingy } from "@/components/shared/curve-thingy";
import { Eyebrow } from "@/components/shared/eyebrow";
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
  TestimonialsListQueryResult,
  TimelineListQueryResult,
} from "~/sanity.types";
import { AddReview } from "./add-review";
import { DailyApps } from "./dailyApps";
import { SnapshotsGallery } from "./snapshots";
import { Testimonial } from "./testimonial";

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
  testimonials: TestimonialsListQueryResult;
}> = ({
  timeline,
  contributions,
  articles,
  dailyApps,
  snapshots,
  testimonials,
}) => {
  const { play } = useSoundFx();
  const pathname = usePathname();

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const articleRoute = navLinksData("/articles");
  const timelineRoute = navLinksData("/about/timeline");
  const testimonialsRoute = navLinksData("/about/testimonials");

  const openLightbox = useCallback(
    (idx: number) => {
      play("expand");
      setActiveIndex(idx);
    },
    [play],
  );

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
          className="flex flex-col gap-6 pt-20 sm:pt-30 md:gap-8 md:pt-36 lg:gap-16"
        >
          {snapshots?.images && snapshots.images.length > 0 && (
            <Container size="md">
              <SnapshotsGallery
                images={snapshots.images}
                altPrefix={`${siteConfig.author.nickname}'s photo`}
                action={openLightbox}
              />
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
                      {timelineRoute?.icon && <timelineRoute.icon />}
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
            className="flex flex-col gap-6 md:gap-8"
          >
            <Container size="sm">
              <Eyebrow label="My Little Rectangle Friends" icon={Router3} />
            </Container>

            <Container size="md">
              <DailyApps apps={dailyApps} />
            </Container>
          </motion.div>
        )}

        {/* Articles Section */}
        {articles.length > 0 && (
          <motion.div
            variants={parentVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6 md:gap-8"
          >
            <Container size="sm">
              <Eyebrow
                label={articleRoute?.title ?? "Articles & Writings"}
                icon={articleRoute?.icon}
              />
            </Container>

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
                        {articleRoute?.icon && <articleRoute.icon />}
                      </Button>
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
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

        {/* Testimonial section */}
        <motion.div
          variants={parentVariants}
          initial="hidden"
          whileInView="visible"
          className="flex flex-col gap-6 md:gap-8"
        >
          <Container size="sm">
            <Eyebrow
              label={testimonialsRoute?.title ?? "Kind Words"}
              icon={testimonialsRoute?.icon}
            />
          </Container>

          <Container size="md">
            <div className="flex flex-col gap-8 md:gap-12">
              <div className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3">
                {testimonials.map((item) => (
                  <Testimonial key={item._id} testimonial={item} />
                ))}

                <AddReview />
              </div>

              {testimonials.length > 5 && (
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
                      href={testimonialsRoute?.href as Route}
                      onClick={() => play("forward")}
                      className="wrapper mx-auto flex w-max items-center"
                    >
                      <Button variant="inverse" className="flex-1">
                        <span>{testimonialsRoute?.action}</span>
                      </Button>
                      <Button variant="inverse" size="icon">
                        {testimonialsRoute?.icon && <testimonialsRoute.icon />}
                      </Button>
                    </Link>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </Container>
        </motion.div>

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

        <ContactComp from="About" />
      </CurveThingy>
    </div>
  );
};
