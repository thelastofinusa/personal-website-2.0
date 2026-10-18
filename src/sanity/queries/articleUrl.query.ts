import { defineQuery } from "next-sanity";
import type { ArticleUrlsListQueryResult } from "~/sanity.types";
import { NO_STEGA, sanityFetch } from "../lib/live";

const articleUrlsList = `
_id,
name,
url,
`;

const articleUrlsListQuery = defineQuery(`
*[_type == "articleUrl"] | order(_createdAt asc) {
  ${articleUrlsList}
}`);

const query = {
  all: articleUrlsListQuery,
};

export async function fetchAllArticleUrls(): Promise<ArticleUrlsListQueryResult> {
  const { data } = await sanityFetch({ query: query.all, ...NO_STEGA });
  return data;
}
