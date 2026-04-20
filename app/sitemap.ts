import { CONST_SITE_URL } from "@/lib/constants"

export default async function sitemap() {
  const routes = ["", "/work", "/about", "/contact"].map((route) => ({
    url: `${CONST_SITE_URL}${route}`,
    lastModified: new Date().toISOString(),
  }))

  return [...routes]
}
