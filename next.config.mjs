import { createMDX } from "fumadocs-mdx/next"

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["mdx", "ts", "tsx"],
  typedRoutes: true,
  experimental: {
    typedEnv: true,
    mdxRs: { mdxType: "gfm" },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: `/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/**`,
      },
    ],
    formats: ["image/webp", "image/avif"],
    qualities: [100, 80],
  },
}

const withMDX = createMDX({})

export default withMDX(nextConfig)
