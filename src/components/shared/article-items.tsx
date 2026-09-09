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
        <div className="flex flex-col overflow-hidden rounded-[20px]! gap-1">
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
        "group relative flex bg-card flex-col gap-4 md:rounded-[20px] md:border p-5 transition-all duration-300 md:grid md:grid-cols-12 md:items-start md:p-6 hover:bg-background",
        className,
      )}
    >
      {/* Left Column (Desktop): Meta & Pinned Status */}
      <div className="flex items-center gap-3 md:col-span-3 md:flex-col md:items-start md:gap-2.5">
        {article.pinned && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2 py-0.75 text-[10px] font-medium uppercase tracking-wider text-primary">
            <Thumbtack className="size-3" />
            <span>Featured</span>
          </span>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          <span className="font-light tracking-wider">
            {formatDate(article.publishedAt as string)}
          </span>
        </div>
      </div>

      {/* Right Column (Desktop): Main Content */}
      <div className="flex flex-col gap-2 md:col-span-9">
        <div className="flex items-center gap-4">
          <h2 className="font-sans flex-1 line-clamp-1 text-lg font-medium tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary md:text-xl">
            {article.title}
          </h2>

          <SquareTopDown className="size-4 group-hover:text-primary shrink-0 transition-colors duration-300" />
        </div>

        <p className="line-clamp-2 font-light leading-relaxed text-muted-foreground/80 text-sm">
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
