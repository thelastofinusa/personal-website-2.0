import { defineQuery } from "next-sanity";
import type {
  ArticleBySlugQueryResult,
  ArticlesListQueryResult,
} from "~/sanity.types";
import { NO_STEGA, sanityFetch } from "../lib/live";

const articleList = `
  _id,
  title,
  "slug": slug.current,
  description,
  publishedAt,
  pinned,
  isAiGenerated,

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
  const { data } = await sanityFetch({ query: query.all, ...NO_STEGA });
  return data;
}

export async function fetchPinnedArticles(): Promise<ArticlesListQueryResult> {
  const { data } = await sanityFetch({ query: query.pinned, ...NO_STEGA });
  return data;
}

export async function fetchArticleBySlug(slug: string): Promise<{
  article: ArticleBySlugQueryResult | null;
  previousArticle: ArticleBySlugQueryResult | null;
  nextArticle: ArticleBySlugQueryResult | null;
}> {
  const articles = await fetchAllArticles();
  const index = articles.findIndex((article) => article.slug === slug);

  const { data: singleArticle } = await sanityFetch({
    query: query.slug,
    params: { slug },
    ...NO_STEGA,
  });

  return {
    article: singleArticle,
    previousArticle: articles[index - 1] ?? null,
    nextArticle: articles[index + 1] ?? null,
  };
}
