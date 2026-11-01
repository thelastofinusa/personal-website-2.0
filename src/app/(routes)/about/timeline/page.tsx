import type { Metadata } from "next";
import { ArrowLeft5 } from "reicon-react";
import { Timeline } from "@/components/reusable/chanhdai/timeline";
import { ContactComp } from "@/components/shared/contact";
import { Container } from "@/components/shared/container";
import { CurveThingy } from "@/components/shared/curve-thingy";
import { Eyebrow } from "@/components/shared/eyebrow";
import { siteConfig } from "@/config/site.config";
import { navLinksData } from "@/constants/navigation";
import { getOgImage } from "@/lib/og";
import { fetchTimeline } from "@/sanity/queries/timeline.query";

const nav = navLinksData("/about/timeline");

export const metadata: Metadata = {
  title: nav?.eyebrow,
  description: nav?.description,
  openGraph: {
    title: `${nav?.eyebrow} • ${siteConfig.author.nickname}`,
    description: nav?.description,
    url: nav?.href,
    siteName: siteConfig.title,
    images: [
      {
        url: getOgImage({
          title: `${nav?.eyebrow} • ${siteConfig.author.nickname}`,
          description: nav?.description,
          category: "About",
        }),
        width: 1200,
        height: 630,
        alt: `${nav?.eyebrow} • ${siteConfig.author.nickname}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${nav?.eyebrow} • ${siteConfig.author.nickname}`,
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

export default async function TimelinePage() {
  const timeline = await fetchTimeline();

  return (
    <div className="flex-1 overflow-x-clip">
      <CurveThingy hideHash>
        <Container size="sm" className="pt-20 sm:pt-30 md:pt-36">
          <div className="flex flex-col gap-6 md:gap-10">
            <Eyebrow
              label="Abort Exploration"
              href="/about"
              icon={ArrowLeft5}
              className="mb-4"
            />

            <Timeline className="w-full" items={timeline} />
          </div>
        </Container>

        <ContactComp from="Timeline" />
      </CurveThingy>
    </div>
  );
}
