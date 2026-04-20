import { Metadata } from "next"
import { Analytics } from "@vercel/analytics/react"
import NextJsToploader from "nextjs-toploader"

import "./globals.css"
import { fontVariable } from "@/fonts"
import { siteConfig } from "@/config/site.config"
import { ThemeProvider } from "@/components/provider/theme.provider"
import { CONST_META_THEME_COLORS, CONST_SITE_URL } from "@/lib/constants"
import { ActiveThemeProvider } from "@/components/shared/active-theme"
import { TailwindIndicator } from "@/components/shared/tailwind-indicator"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} - ${siteConfig.description}`,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(CONST_SITE_URL as string),
  authors: [
    {
      name: "Holiday",
      url: "https://x.com/thelastofinusa",
    },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: CONST_SITE_URL,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${CONST_SITE_URL}/opengraph.png`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${CONST_SITE_URL}/opengraph.png`],
    creator: `@${siteConfig.username}`,
  },
  icons: {
    shortcut: "/favicon/favicon.ico",
    icon: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: `${CONST_SITE_URL}/site.webmanifest`,
}

export default function RootLayout(props: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${CONST_META_THEME_COLORS.dark}')
                }
                if (localStorage.layout) {
                  document.documentElement.classList.add('layout-' + localStorage.layout)
                }
              } catch (_) {}
            `,
          }}
        />
        <meta name="theme-color" content={CONST_META_THEME_COLORS.light} />
      </head>
      <body
        className={fontVariable(
          "group/body overscroll-none bg-background font-sans text-foreground antialiased"
        )}
      >
        <ThemeProvider>
          <ActiveThemeProvider>
            <NextJsToploader showSpinner={false} color="var(--primary)" />
            <TooltipProvider delay={0}>
              {props.children}
              <Toaster position="top-center" />
            </TooltipProvider>
            <TailwindIndicator />
            <Analytics />
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
