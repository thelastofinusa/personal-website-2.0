import { type NextRequest, NextResponse } from "next/server";

type ImageType = "og" | "favicon";

function getMetaImage(html: string, baseUrl: string) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      try {
        return new URL(match[1], baseUrl).href;
      } catch {
        return match[1];
      }
    }
  }

  return null;
}

function getFavicon(html: string, baseUrl: string) {
  const patterns = [
    /<link[^>]+rel=["'][^"']*\bicon\b[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*\bicon\b[^"']*["'][^>]*>/i,

    /<link[^>]+rel=["'][^"']*\bshortcut\s+icon\b[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*\bshortcut\s+icon\b[^"']*["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      try {
        return new URL(match[1], baseUrl).href;
      } catch {
        return match[1];
      }
    }
  }

  // Standard fallback
  try {
    return new URL("/favicon.ico", baseUrl).href;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const type = request.nextUrl.searchParams.get("type") as ImageType | null;

  if (!url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  const imageType: ImageType = type === "favicon" ? "favicon" : "og";

  try {
    const targetUrl = new URL(url);

    if (!["http:", "https:"].includes(targetUrl.protocol)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const response = await fetch(targetUrl.href, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ProjectPreview/1.0; +https://example.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json({ image: null }, { status: 200 });
    }

    const html = await response.text();

    const image =
      imageType === "favicon"
        ? getFavicon(html, response.url)
        : getMetaImage(html, response.url);

    return NextResponse.json(
      {
        image: image
          ? `/api/og-image/proxy?url=${encodeURIComponent(image)}`
          : null,
        type: imageType,
      },
      {
        headers: {
          "Cache-Control": image
            ? "public, s-maxage=3600, stale-while-revalidate=86400"
            : "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        image: null,
        type: imageType,
      },
      { status: 200 },
    );
  }
}
