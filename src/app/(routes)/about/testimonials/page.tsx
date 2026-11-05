import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Undo } from "reicon-react";
import { ContactComp } from "@/components/shared/contact";
import { Container } from "@/components/shared/container";
import { CurveThingy } from "@/components/shared/curve-thingy";
import { Eyebrow } from "@/components/shared/eyebrow";
import { siteConfig } from "@/config/site.config";
import { navLinksData } from "@/constants/navigation";
import { getOgImage } from "@/lib/og";
import { fetchAllTestimonials } from "@/sanity/queries/testimonial.query";
import { AddReview } from "../_components/add-review";
import { Testimonial } from "../_components/testimonial";

const nav = navLinksData("/about/testimonials");

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

export default async function TestimonialsPage() {
  const testimonials = await fetchAllTestimonials();

  if (!testimonials.length) redirect("/about");

  return (
    <div className="flex-1 overflow-x-clip">
      <CurveThingy hideHash>
        <div className="pt-20 sm:pt-30 md:pt-36">
          <div className="flex flex-col gap-6 md:gap-10">
            <Container size="sm">
              <Eyebrow
                label="Take me back"
                href="/about"
                icon={Undo}
                className="mb-4"
              />
            </Container>

            <Container size="md">
              <div className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3">
                <AddReview />

                {testimonials.map((item) => (
                  <Testimonial key={item._id} testimonial={item} />
                ))}
              </div>
            </Container>
          </div>
        </div>

        <ContactComp from="Testimonials" />
      </CurveThingy>
    </div>
  );
}
