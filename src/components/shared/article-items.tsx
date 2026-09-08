/** biome-ignore-all lint/suspicious/noArrayIndexKey: ignore */
"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import React from "react";
import type { IconType } from "react-icons";
import { Clock, SquareTopDown, Thumbtack } from "reicon-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/reusable/shadcn/empty";
import { workItemVariants } from "@/constants/variants";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn, formatDate } from "@/lib/utils";
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
          <Link key={_id} target="_blank" href={url as Route}>
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
      className={cn(
        "group relative bg-card flex flex-col gap-6 transition-colors duration-300 md:hover:bg-background",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          {article.pinned && (
            <>
              <Thumbtack className="size-3.5 transition-colors group-hover:text-primary" />
              <span className="text-xs font-light uppercase tracking-[0.12em]">
                Pinned
              </span>
              <span className="size-1.25 rounded-full bg-secondary" />
            </>
          )}

          <Clock className="size-3.5 shrink-0 motion-safe:animate-bell-ring" />

          <span className="text-xs font-light uppercase tracking-[0.12em]">
            {formatDate(article.publishedAt as string)}
          </span>
        </div>

        <SquareTopDown className="size-4 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-primary group-hover:translate-x-0.5" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-base font-normal leading-snug tracking-tight transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:text-primary md:text-xl">
          {article.title}
        </h2>

        <p className="line-clamp-2 text-sm font-extralight leading-relaxed text-muted-foreground md:text-base">
          {article.description}
        </p>
      </div>
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
