import { defineQuery } from "next-sanity";
import type { ArticleUrlsListQueryResult } from "~/sanity.types";
import { sanityQuery } from "../lib/fetch";

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
  return sanityQuery<ArticleUrlsListQueryResult>({ query: query.all });
}
