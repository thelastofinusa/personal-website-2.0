import { defineQuery } from "next-sanity";
import { revalidateOption } from "@/lib/utils";
import type { ArticleUrlsListQueryResult } from "~/sanity.types";
import { readClient } from "../lib/client";

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
  const result = await readClient.fetch(query.all, {}, revalidateOption);
  return result;
}
