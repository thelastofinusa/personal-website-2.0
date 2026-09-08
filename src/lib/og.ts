import { siteConfig } from "@/config/site.config";

type Theme = "light" | "dark";

type OGOptions = {
  title: string;
  description?: string;
  category?: string;
  theme?: Theme;
};

export function getOgImage({
  title,
  description,
  category = "Portfolio",
  theme = "dark",
}: OGOptions) {
  const url = new URL("/api/og", siteConfig.url);

  url.searchParams.set("title", title);

  if (description) {
    url.searchParams.set("description", description);
  }

  url.searchParams.set("category", category);
  url.searchParams.set("theme", theme);

  return url.toString();
}
