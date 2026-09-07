import { defineQuery } from "next-sanity";
import { revalidateOption } from "@/lib/utils";
import type {
  ArticleBySlugQueryResult,
  ArticlesListQueryResult,
} from "~/sanity.types";
import { readClient } from "../lib/client";

const articleList = `
  _id,
  title,
  "slug": slug.current,
  description,
  publishedAt,
  pinned,

  body[] {
    ...,

    _type == "image" => {
      ...,
      "asset": asset-> {
        "_id": _id,
        "url": url,
        "width": metadata.dimensions.width,
        "height": metadata.dimensions.height
      }
    }
  },

  "mainImage": {
    "image": mainImage.asset->url,
    "width": mainImage.asset->metadata.dimensions.width,
    "height": mainImage.asset->metadata.dimensions.height
  },
`;

const articlesListQuery = defineQuery(`
  *[_type == "article"]
    | order(pinned desc, publishedAt desc, _createdAt desc) {
      ${articleList}
    }
`);

const pinnedArticlesQuery = defineQuery(`
  *[_type == "article" && pinned == true]
    | order(publishedAt desc, _createdAt desc)[0...3] {
      ${articleList}
    }
`);

const articleBySlugQuery = defineQuery(`
  *[_type == "article" && slug.current == $slug][0] {
    ${articleList}
  }
`);

const query = {
  all: articlesListQuery,
  pinned: pinnedArticlesQuery,
  slug: articleBySlugQuery,
};

export async function fetchAllArticles(): Promise<ArticlesListQueryResult> {
  return readClient.fetch(query.all, {}, revalidateOption);
}

export async function fetchPinnedArticles(): Promise<ArticlesListQueryResult> {
  return readClient.fetch(query.pinned, {}, revalidateOption);
}

export async function fetchArticleBySlug(slug: string): Promise<{
  article: ArticleBySlugQueryResult | null;
  previousArticle: ArticleBySlugQueryResult | null;
  nextArticle: ArticleBySlugQueryResult | null;
}> {
  const articles = await fetchAllArticles();
  const index = articles.findIndex((article) => article.slug === slug);

  const singleArticle = await readClient.fetch(
    query.slug,
    { slug },
    revalidateOption,
  );

  return {
    article: singleArticle,
    previousArticle: articles[index - 1] ?? null,
    nextArticle: articles[index + 1] ?? null,
  };
}
