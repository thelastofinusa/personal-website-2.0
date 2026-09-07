/** biome-ignore-all lint/suspicious/noArrayIndexKey: ignore */
"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import React from "react";
import type { IconType } from "react-icons";
import { AlarmClock, SquareTopDown, Thumbtack } from "reicon-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/reusable/shadcn/empty";
import { workItemVariants } from "@/constants/variants";
import { useMediaQuery } from "@/hooks/use-media-query";
import { formatDate } from "@/lib/utils";
import type { ArticlesListQueryResult } from "~/sanity.types";
import { useImagePreview } from "../provider/preview";
import { useSoundFx } from "../provider/sound-fx";
import { Frame } from "../reusable/reui/frame";
import { Button } from "../reusable/shadcn/button";
import { StackedPagesIllustration } from "./illustration";

function ArticleSocialLinks({
  links,
}: {
  links: {
    _id: string;
    label: string | null;
    icon: IconType;
    url: string | null;
  }[];
}) {
  const { play } = useSoundFx();
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <div className="wrapper flex w-max flex-wrap items-center gap-1.25">
      {links.map(({ label, url, _id, icon: Icon }) => {
        const iconOnly = isMobile && links.length > 3;

        return (
          <Link key={_id} href={url as Route}>
            <Button
              variant="outline"
              size={iconOnly ? "icon" : "sm"}
              className="bg-background!"
              onClick={() => play("select")}
            >
              <Icon />
              {!iconOnly && <span>{label}</span>}
              <span className="sr-only">{label}</span>
            </Button>
          </Link>
        );
      })}
    </div>
  );
}

function ArticleList({ articles }: { articles: ArticlesListQueryResult }) {
  if (articles.length === 0) {
    return <ArticleEmptyState />;
  }

  return (
    <React.Fragment>
      {/* Desktop */}
      <Frame className="hidden rounded-3xl! md:block">
        <div className="flex flex-col divide-y overflow-hidden rounded-[20px]! border">
          <ArticleItems articles={articles} className="p-6 md:p-8 lg:p-12" />
        </div>
      </Frame>

      {/* Mobile */}
      <div className="block md:hidden">
        <div className="flex flex-col divide-y">
          <ArticleItems articles={articles} className="py-6" />
        </div>
      </div>
    </React.Fragment>
  );
}

function ArticleItems({
  articles,
  className,
}: {
  articles: ArticlesListQueryResult;
  className: string;
}) {
  const { handleMouseEnter, handleMouseLeave } = useImagePreview();

  return (
    <AnimatePresence mode="popLayout">
      {articles.map((article, index) => (
        <motion.div
          key={article.slug}
          custom={index}
          variants={workItemVariants}
          initial="hidden"
          whileInView="visible"
          exit="exit"
          layout
          viewport={{ once: true, margin: "-50px" }}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
        >
          <ArticleItem article={article} className={className} />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

function ArticleItem({
  article,
  className,
}: {
  article: ArticlesListQueryResult[0];
  className: string;
}) {
  const { play } = useSoundFx();

  return (
    <Link
      href={`/articles/${article.slug}`}
      onClick={() => play("forward")}
      className={`group flex w-full items-start gap-2 bg-card md:hover:bg-background ${className} md:gap-4`}
    >
      <div className="flex flex-1 flex-col gap-2 md:gap-3">
        <div className="flex items-start gap-2">
          {article.pinned && (
            <Thumbtack className="mt-0.5 size-4.5 shrink-0 group-hover:text-primary md:mt-1" />
          )}

          <p className="text-base font-light transition-all duration-200 ease-out group-hover:translate-x-2 group-hover:text-primary md:text-lg">
            {article.title}
          </p>
        </div>

        <p className="line-clamp-3 text-sm font-extralight text-muted-foreground md:text-base">
          {article.description}
        </p>

        <div className="flex items-center gap-1.5">
          <AlarmClock className="size-3.5 motion-safe:animate-bell-ring" />

          <p className="text-sm font-light">
            {formatDate(article.publishedAt as string)}
          </p>
        </div>
      </div>

      <SquareTopDown className="hidden size-4.5 md:block" />
    </Link>
  );
}

function ArticleEmptyState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <StackedPagesIllustration />
        </EmptyMedia>

        <EmptyTitle>The notebook is quiet</EmptyTitle>

        <EmptyDescription>
          There aren't any articles here yet. Give me a little time to put some
          thoughts on the page.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export { ArticleItem, ArticleItems, ArticleList, ArticleSocialLinks };
