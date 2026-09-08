"use client";
import dynamic from "next/dynamic";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import type React from "react";
import {
  ArticleList,
  ArticleSocialLinks,
} from "@/components/shared/article-items";

const ImagePreviewProvider = dynamic(
  () =>
    import("@/components/provider/preview").then(
      (mod) => mod.ImagePreviewProvider,
    ),
  { ssr: false, loading: () => null },
);
import { Container } from "@/components/shared/container";
import { CurveThingy } from "@/components/shared/curve-thingy";
import { QuickHero } from "@/components/shared/quick-hero";
import { navLinksData } from "@/constants/navigation";
import { resolveIcon } from "@/lib/icons";
import type { IImagePreviewPortalProps } from "@/types";
import type {
  ArticlesListQueryResult,
  ArticleUrlsListQueryResult,
} from "~/sanity.types";

export const ArticlesPageClient: React.FC<{
  articles: ArticlesListQueryResult;
  articleUrls: ArticleUrlsListQueryResult;
}> = (props) => {
  const pathname = usePathname();
  const articleImages: IImagePreviewPortalProps["images"] =
    props.articles.flatMap((project) => {
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
    });

  const structuredUrls = props.articleUrls.map((url) => ({
    _id: url._id,
    label: url.name,
    icon: resolveIcon(String(url.name)),
    url: url.url,
  }));

  return (
    <div className="flex-1 overflow-x-clip">
      <QuickHero
        eyebrow={{
          icon: navLinksData(pathname as Route)?.icon,
          label: navLinksData(pathname as Route)?.eyebrow as string,
        }}
        title={navLinksData(pathname as Route)?.title as string}
        description={navLinksData(pathname as Route)?.description as string}
        component={
          props.articleUrls.length > 0
            ? {
                content: <ArticleSocialLinks links={structuredUrls} />,
              }
            : undefined
        }
      />

      <CurveThingy tCurve>
        <div id="everything" className="pt-20 sm:pt-30 md:pt-36">
          <Container size="md">
            <ImagePreviewProvider images={articleImages}>
              <ArticleList articles={props.articles} />
            </ImagePreviewProvider>
          </Container>
        </div>
      </CurveThingy>
    </div>
  );
};
