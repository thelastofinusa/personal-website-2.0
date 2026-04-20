import path from "path"
import { promises as fs } from "fs"
import { CONST_SITE_URL } from "@/lib/constants"

async function getNoteSlugs(dir: string) {
  const entries = await fs.readdir(dir, {
    recursive: true,
    withFileTypes: true,
  })
  return entries
    .filter((entry) => entry.isFile() && entry.name === "page.mdx")
    .map((entry) => {
      const relativePath = path.relative(
        dir,
        path.join(entry.parentPath, entry.name)
      )
      return path.dirname(relativePath)
    })
    .map((slug) => slug.replace(/\\/g, "/"))
}

export default async function sitemap() {
  const notesDirectory = path.join(process.cwd(), "app", "n")
  const slugs = await getNoteSlugs(notesDirectory)

  const notes = slugs.map((slug) => ({
    url: `${CONST_SITE_URL}/n/${slug}`,
    lastModified: new Date().toISOString(),
  }))

  const routes = ["", "/work"].map((route) => ({
    url: `${CONST_SITE_URL}${route}`,
    lastModified: new Date().toISOString(),
  }))

  return [...routes, ...notes]
}
