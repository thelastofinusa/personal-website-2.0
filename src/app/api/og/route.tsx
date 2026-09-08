/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
/** biome-ignore-all lint/performance/noImgElement: <explanation> */

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { siteConfig } from "@/config/site.config";
import { getInitials } from "@/lib/utils";

export const runtime = "nodejs";

// ─── Google Fonts loader (Satori needs raw TTF/OTF bytes, not a stylesheet) ───
// Passing `text=` subsets the request, which is also what makes Google's
// CSS2 endpoint respond with a plain `format('truetype')` src instead of
// woff2 — Satori can only parse ttf/otf, not woff2.
const FONT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?'\"-–—:;()&/@#%+";

const fontCache = new Map<number, Promise<ArrayBuffer>>();

function loadGoogleFont(weight: number): Promise<ArrayBuffer> {
  if (!fontCache.has(weight)) {
    fontCache.set(
      weight,
      (async () => {
        const url = `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@${weight}&text=${encodeURIComponent(FONT_CHARSET)}`;
        const css = await (await fetch(url)).text();
        const match = css.match(
          /src: url\((.+)\) format\('(opentype|truetype)'\)/,
        );
        if (!match) {
          throw new Error(`Could not find font source for weight ${weight}`);
        }
        const res = await fetch(match[1]);
        if (!res.ok) {
          throw new Error(`Failed to fetch font file for weight ${weight}`);
        }
        return res.arrayBuffer();
      })(),
    );
  }
  // biome-ignore lint/style/noNonNullAssertion: just set above if absent
  return fontCache.get(weight)!;
}

// ─── Dynamic title sizing ───────────────────────
function getTitleFontSize(title: string): number {
  const len = title.length;
  if (len <= 20) return 64;
  if (len <= 35) return 56;
  if (len <= 50) return 48;
  if (len <= 70) return 42;
  if (len <= 90) return 38;
  return 34;
}

function getTitleLineHeight(fontSize: number): number {
  return Math.round(fontSize * 1.08);
}

// ─── Colors ──────────────────────────────────────
type Theme = "dark" | "light";

function getColors(theme: Theme) {
  const isDark = theme === "dark";

  return {
    bg: isDark ? "#151515" : "#ffffff",
    text: isDark ? "#fafafa" : "#0a0a0a",
    muted: isDark ? "#a1a1a1" : "#737373",
    accent: isDark ? "#df7754" : "#c96442",
    accentText: isDark ? "#151515" : "#ffffff",
    line: isDark ? "rgba(255,255,255,0.08)" : "rgba(10,10,10,0.08)",
    subtleLine: isDark ? "rgba(255,255,255,0.04)" : "rgba(10,10,10,0.05)",
    panelLine: isDark ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.08)",
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

    const c = getColors(theme);

    const [light, regular, semibold, bold] = await Promise.all([
      loadGoogleFont(300),
      loadGoogleFont(400),
      loadGoogleFont(600),
      loadGoogleFont(700),
    ]);

    const avatarUrl = siteConfig.author.avatar.startsWith("http")
      ? siteConfig.author.avatar
      : `${origin}${siteConfig.author.avatar}`;

    const displayDomain = (siteConfig.url || origin).replace(
      /^https?:\/\//,
      "",
    );

    const titleSize = getTitleFontSize(title);
    const titleLh = getTitleLineHeight(titleSize);
    const initials = getInitials(siteConfig.author.name);

    return new ImageResponse(
      <div
        tw="flex w-[1200px] h-[630px]"
        style={{ backgroundColor: c.bg, fontFamily: "Bricolage Grotesque" }}
      >
        {/* ─── Left: content ─────────────────────── */}
        <div tw="flex flex-col justify-between w-[800px] h-full px-[64px] py-[56px]">
          {/* Header */}
          <div
            tw="flex items-center justify-between w-full"
            style={{
              paddingBottom: "22px",
              borderBottom: `1px solid ${c.line}`,
            }}
          >
            {/* Identity */}

            <div tw="flex items-center">
              {/* Avatar frame */}

              <div
                tw="flex items-center justify-center"
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "11px",
                  border: `1px solid ${c.line}`,
                  padding: "3px",
                  marginRight: "12px",
                }}
              >
                <img
                  src={avatarUrl}
                  alt=""
                  width={36}
                  height={36}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div tw="flex flex-col">
                <span
                  tw="text-[15px] font-semibold"
                  style={{
                    color: c.text,
                    letterSpacing: "-0.025em",
                  }}
                >
                  {siteConfig.author.name}
                </span>

                <span
                  tw="text-xs font-light"
                  style={{
                    color: c.muted,
                    marginTop: "1px",
                    letterSpacing: "0.01em",
                  }}
                >
                  @{siteConfig.author.username}
                </span>
              </div>
            </div>

            {/* Category */}

            <span
              tw="text-[11px] font-normal uppercase"
              style={{
                color: c.muted,
                letterSpacing: "0.08em",
              }}
            >
              {category}
            </span>
          </div>

          {/* Title + description */}
          <div tw="flex flex-col" style={{ maxWidth: "660px" }}>
            <h1
              tw="flex flex-wrap font-medium m-0"
              style={{
                fontSize: `${titleSize}px`,
                lineHeight: `${titleLh}px`,
                letterSpacing: "-0.015em",
                color: c.text,
                wordBreak: "break-word",
              }}
            >
              {title}
            </h1>

            <p
              tw="flex flex-wrap font-light max-w-xl mt-[20px] m-0 mt-6"
              style={{
                fontSize: "19px",
                lineHeight: 1.5,
                color: c.muted,
                wordBreak: "break-word",
              }}
            >
              {description}
            </p>
          </div>

          {/* Footer */}
          <div
            tw="flex items-center justify-between w-full pt-[20px]"
            style={{ borderTop: `1px solid ${c.line}` }}
          >
            <span
              tw="text-[13px] font-light"
              style={{ color: c.muted, letterSpacing: "0.02em" }}
            >
              {displayDomain}
            </span>

            <div tw="flex items-center">
              <span
                tw="text-[12px] font-light mr-[16px]"
                style={{ color: c.muted, letterSpacing: "0.02em" }}
              >
                {siteConfig.author.position}
              </span>
              <span
                tw="text-[12px] font-light"
                style={{ color: c.muted, opacity: 0.5 }}
              >
                {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Right: accent monogram panel ──────── */}
        <div
          tw="flex items-center justify-center w-[400px] h-full relative"
          style={{ backgroundColor: c.accent }}
        >
          <div
            tw="absolute w-full h-full flex flex-col justify-between"
            style={{ padding: "40px" }}
          >
            <div
              tw="flex w-full"
              style={{ borderTop: `1px solid ${c.line}` }}
            />
            <div
              tw="flex w-full"
              style={{ borderTop: `1px solid ${c.line}` }}
            />
          </div>

          <span
            tw="font-bold flex"
            style={{
              fontSize: "220px",
              color: c.accentText,
              letterSpacing: "-0.05em",
              opacity: 0.92,
            }}
          >
            {initials}
          </span>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Bricolage Grotesque",
            data: light,
            weight: 300,
            style: "normal",
          },
          {
            name: "Bricolage Grotesque",
            data: regular,
            weight: 400,
            style: "normal",
          },
          {
            name: "Bricolage Grotesque",
            data: semibold,
            weight: 600,
            style: "normal",
          },
          {
            name: "Bricolage Grotesque",
            data: bold,
            weight: 700,
            style: "normal",
          },
        ],
      },
    );
  } catch (error) {
    console.error("OG image generation failed:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
