import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { siteConfig } from "@/config/site.config";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams, origin } = new URL(req.url);

    // Dynamic parameters with fallback defaults
    const title = searchParams.get("title") || siteConfig.title;
    const description =
      searchParams.get("description") || siteConfig.description;
    const theme = searchParams.get("theme") || "dark";
    const category = searchParams.get("category") || "Portfolio";

    const isDark = theme === "dark";

    // Guarantee avatar URL is absolute
    const avatarUrl = siteConfig.author.avatar.startsWith("http")
      ? siteConfig.author.avatar
      : `${origin}${siteConfig.author.avatar}`;

    // Clean display domain for footer (e.g., localhost:3000 or yourdomain.com)
    const displayDomain = (siteConfig.url || origin).replace(
      /^https?:\/\//,
      "",
    );

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          backgroundColor: isDark ? "#09090b" : "#ffffff",
          color: isDark ? "#f4f4f5" : "#09090b",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={siteConfig.author.name}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  letterSpacing: "-0.02em",
                }}
              >
                {siteConfig.author.name}
              </span>
              <span
                style={{
                  fontSize: "15px",
                  color: isDark ? "#71717a" : "#a1a1aa",
                }}
              >
                {siteConfig.slogan}
              </span>
            </div>
          </div>

          <span
            style={{
              fontSize: "16px",
              fontWeight: "600",
              padding: "6px 16px",
              borderRadius: "9999px",
              backgroundColor: isDark ? "#27272a" : "#f4f4f5",
              color: isDark ? "#a1a1aa" : "#52525b",
            }}
          >
            {category}
          </span>
        </div>

        {/* Main Title & Description */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1
            style={{
              fontSize: "52px",
              fontWeight: "800",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              margin: 0,
              maxWidth: "1040px",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: "24px",
              lineHeight: 1.4,
              color: isDark ? "#a1a1aa" : "#71717a",
              margin: 0,
              maxWidth: "920px",
            }}
          >
            {description}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}`,
            paddingTop: "24px",
            fontSize: "18px",
            color: isDark ? "#71717a" : "#a1a1aa",
          }}
        >
          <span>{displayDomain}</span>
          <span>Web3 Frontend Engineer</span>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (_error) {
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
