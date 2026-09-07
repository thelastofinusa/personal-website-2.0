import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.author.nickname} - ${siteConfig.slogan}`,
    template: `%s - ${siteConfig.author.nickname}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url as string),
  authors: [{ name: siteConfig.title }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    siteName: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: "/opengraph.png",
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/opengraph.png"],
  },
  icons: siteConfig.author.avatar,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout(props: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="h-full antialiased">{props.children}</body>
    </html>
  );
}
