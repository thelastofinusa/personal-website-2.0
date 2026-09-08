/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
/** biome-ignore-all lint/performance/noImgElement: <explanation> */

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { siteConfig } from "@/config/site.config";

export const runtime = "edge";

// ─── Dynamic title sizing ───────────────────────
function getTitleFontSize(title: string): number {
  const len = title.length;
  if (len <= 20) return 62;
  if (len <= 35) return 54;
  if (len <= 50) return 46;
  if (len <= 70) return 40;
  if (len <= 90) return 40;
  return 38;
}

function getTitleLineHeight(fontSize: number): number {
  return fontSize * 1.1;
}

// ─── Colors ──────────────────────────────────────
type Theme = "dark" | "light";

function getColors(theme: Theme) {
  const isDark = theme === "dark";

  return {
    // --background
    bg: isDark ? "#151515" : "#e6e6e6",

    // --card
    panelBg: isDark ? "#0e0e0e" : "#ffffff",

    // --border
    panelBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(10,10,10,0.08)",

    // --foreground
    text: isDark ? "#fafafa" : "#0a0a0a",

    // --muted-foreground
    muted: isDark ? "#a1a1a1" : "#737373",

    // --primary
    accent: isDark ? "#df7754" : "#c96442",

    // Primary with transparency
    accentGlow: isDark ? "rgba(223,119,84,0.15)" : "rgba(201,100,66,0.10)",

    // --muted
    mutedBg: isDark ? "#262626" : "#eeeeee",

    // --secondary
    secondary: isDark ? "#262626" : "#e6e6e6",

    // --accent
    accentBg: isDark ? "#404040" : "#eeeeee",

    // Useful for subtle lines
    line: isDark ? "rgba(255,255,255,0.08)" : "rgba(10,10,10,0.08)",
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams, origin } = new URL(req.url);

    const title = searchParams.get("title") || siteConfig.title;
    const description =
      searchParams.get("description") || siteConfig.description;
    const theme = (searchParams.get("theme") || "dark") as Theme;
    const category = searchParams.get("category") || "Portfolio";

    const isDark = theme === "dark";
    const c = getColors(theme);

    const avatarUrl = siteConfig.author.avatar.startsWith("http")
      ? siteConfig.author.avatar
      : `${origin}${siteConfig.author.avatar}`;

    const displayDomain = (siteConfig.url || origin).replace(
      /^https?:\/\//,
      "",
    );

    const titleSize = getTitleFontSize(title);
    const titleLh = getTitleLineHeight(titleSize);

    return new ImageResponse(
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          backgroundColor: c.bg,
          fontFamily: "Inter, -apple-system, sans-serif",
          padding: "20px",
        }}
      >
        {/* ─── Outer frame ────────────────────── */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            border: `1px solid ${isDark ? "#25282b" : "#e0dcd6"}`,
            borderRadius: "24px",
            zIndex: 2,
          }}
        />

        {/* ─── Inner panel ────────────────────── */}
        <div
          style={{
            position: "absolute",
            left: "20px",
            top: "20px",
            right: "20px",
            bottom: "20px",
            backgroundColor: c.panelBg,
            borderRadius: "22px",
            border: `1px solid ${c.panelBorder}`,
            zIndex: 3,
          }}
        />

        {/* ─── Hero accent shape ──────────────── */}
        <div
          style={{
            position: "absolute",
            right: "-80px",
            top: "-60px",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            background: `radial-gradient(circle at 30% 30%, ${c.accentGlow}, transparent 70%)`,
            filter: "blur(60px)",
            opacity: isDark ? 0.9 : 0.7,
            zIndex: 4,
          }}
        />

        <div
          style={{
            position: "absolute",
            right: "40px",
            top: "40px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
            transform: "rotate(12deg)",
            zIndex: 4,
          }}
        />

        <div
          style={{
            position: "absolute",
            right: "70px",
            top: "70px",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"}`,
            transform: "rotate(-8deg)",
            zIndex: 4,
          }}
        />

        <div
          style={{
            position: "absolute",
            right: "130px",
            top: "130px",
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"}`,
            zIndex: 4,
          }}
        />

        {/* ─── Accent dot cluster ─────────────── */}
        <div
          style={{
            position: "absolute",
            right: "180px",
            top: "190px",
            display: "flex",
            gap: "6px",
            opacity: 0.25,
            zIndex: 5,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={`dot-${i}`}
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                backgroundColor: c.accent,
                opacity: 0.3 + i * 0.25,
              }}
            />
          ))}
        </div>

        {/* ─── Header ─────────────────────────── */}
        <div
          style={{
            position: "absolute",
            left: "72px",
            top: "56px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              border: `2.5px solid ${c.accent}`,
              padding: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={avatarUrl}
              alt=""
              width={40}
              height={40}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: c.text,
              }}
            >
              {siteConfig.author.name} - {siteConfig.author.nickname}
            </span>
            <span
              style={{
                fontSize: "14px",
                color: c.muted,
                marginTop: "1px",
                fontWeight: 300,
              }}
            >
              {siteConfig.slogan}
            </span>
          </div>
        </div>

        {/* ─── Category tag ───────────────────── */}
        <div
          style={{
            position: "absolute",
            right: "72px",
            top: "60px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 400,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: c.muted,
              background: isDark
                ? "rgba(255,255,255,0.04)"
                : "rgba(0,0,0,0.04)",
              padding: "5px 14px",
              borderRadius: "100px",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}`,
            }}
          >
            {category}
          </span>
        </div>

        {/* ─── Main content ───────────────────── */}
        <div
          style={{
            position: "absolute",
            left: "72px",
            right: "72px",
            top: "42px",
            bottom: "104px",
            display: "flex",
            flexDirection: "column",
            marginTop: "144px",
            zIndex: 10,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: `${titleSize}px`,
              lineHeight: `${titleLh}px`,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              maxWidth: "648px",
              color: c.text,
              wordBreak: "break-word",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {title}
          </h1>

          <p
            style={{
              margin: "20px 0 0 0",
              fontSize: "20px",
              lineHeight: 1.5,
              color: c.muted,
              maxWidth: "764px",
              fontWeight: 300,
              display: "flex",
              flexWrap: "wrap",
              wordBreak: "break-word",
            }}
          >
            {description}
          </p>
        </div>

        {/* ─── Footer ─────────────────────────── */}
        <div
          style={{
            position: "absolute",
            left: "72px",
            right: "72px",
            bottom: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "16px",
            borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 300,
              color: c.muted,
              letterSpacing: "0.02em",
            }}
          >
            {displayDomain}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 300,
                color: c.muted,
                letterSpacing: "0.02em",
              }}
            >
              Web3 Frontend Engineer
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 300,
                color: c.muted,
                opacity: 0.4,
              }}
            >
              {new Date().getFullYear()}
            </span>
          </div>
        </div>

        {/* ─── Accent line ────────────────────── */}
        <div
          style={{
            position: "absolute",
            left: "72px",
            bottom: "38px",
            width: "48px",
            height: "2px",
            backgroundColor: c.accent,
            zIndex: 10,
            borderRadius: "2px",
          }}
        />
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error("OG image generation failed:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
