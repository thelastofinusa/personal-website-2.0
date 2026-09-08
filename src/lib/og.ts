import { siteConfig } from "@/config/site.config";

type OGOptions = {
  title: string;
  description?: string;
  category?: string;
};

export function getOgImage({
  title,
  description,
  category = "Portfolio",
}: OGOptions) {
  const url = new URL("/api/og", siteConfig.url);

  url.searchParams.set("title", title);

  if (description) {
    url.searchParams.set("description", description);
  }

  if (category) {
    url.searchParams.set("category", category);
  }

  url.searchParams.set("theme", "dark");

  return url.toString();
}
