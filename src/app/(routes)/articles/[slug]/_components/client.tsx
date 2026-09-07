"use client";

import { cn } from "cn";
import Link from "next/link";
import type React from "react";
import { ArrowLeft5, ArrowRight5 } from "reicon-react";
import { useSoundFx } from "@/components/provider/sound-fx";
import { MiddleTruncation } from "@/components/reusable/chanhdai/middle-truncation";
import { Frame } from "@/components/reusable/reui/frame";
import { Container } from "@/components/shared/container";
import { CurveThingy } from "@/components/shared/curve-thingy";
import { Eyebrow } from "@/components/shared/eyebrow";
import { LocalImg } from "@/components/shared/image";
import { PortableText } from "@/components/shared/portable-text";
import { QuickHero } from "@/components/shared/quick-hero";
import type { ArticleBySlugQueryResult } from "~/sanity.types";

export const ArticleDetailsClient: React.FC<{
  article: ArticleBySlugQueryResult;
  previousArticle: ArticleBySlugQueryResult;
  nextArticle: ArticleBySlugQueryResult;
}> = ({ article, nextArticle, previousArticle }) => {
  const { play } = useSoundFx();

  return (
    <article className="flex-1 overflow-x-clip">
      <QuickHero
        eyebrow={{
          label: "Back To Articles",
          href: "/articles",
          icon: ArrowLeft5,
        }}
        title={article?.title as string}
        description={article?.description as string}
        component={{
          content: (
            <Frame className="rounded-[20px]!">
              <div className="border aspect-video rounded-2xl overflow-hidden">
                <LocalImg
                  src={article?.mainImage.image as string}
                  alt={article?.title as string}
                  className="size-full object-cover"
                />
              </div>
            </Frame>
          ),
          maxWidth: "md",
        }}
      />

      <CurveThingy tCurve>
        <Container size="sm">
          <article className="pt-20 sm:pt-30 md:pt-36">
            <PortableText value={article?.body} />
          </article>
        </Container>

        <Container size="md">
          <nav
            aria-label="Article pagination"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t"
          >
            {previousArticle && (
              <Link
                href={`/articles/${previousArticle?.slug}`}
                onClick={() => play("back")}
                className="group flex border min-w-0 rounded-md p-6 flex-col gap-2 hover:border-primary transition-colors"
              >
                <Eyebrow label="Previous Article" icon={ArrowLeft5} />

                <MiddleTruncation className="font-serif text-lg transition-colors group-hover:text-primary">
                  {previousArticle.title as string}
                </MiddleTruncation>
              </Link>
            )}

            {nextArticle && (
              <Link
                href={`/articles/${nextArticle?.slug}`}
                onClick={() => play("forward")}
                className={cn(
                  "group flex border min-w-0 rounded-md p-6 flex-col items-end gap-2 text-right hover:border-primary transition-colors",
                  !previousArticle && "md:col-start-2",
                )}
              >
                <Eyebrow label="Next Article" icon={ArrowRight5} reverse />

                <MiddleTruncation className="font-serif text-lg transition-colors group-hover:text-primary">
                  {nextArticle.title as string}
                </MiddleTruncation>
              </Link>
            )}
          </nav>
        </Container>
      </CurveThingy>
    </article>
  );
};
