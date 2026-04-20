import { createMDX } from "fumadocs-mdx/next"

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["mdx", "ts", "tsx"],
  typedRoutes: true,
  experimental: {
    typedEnv: true,
    mdxRs: { mdxType: "gfm" },
  },
}

const withMDX = createMDX({})

export default withMDX(nextConfig)
