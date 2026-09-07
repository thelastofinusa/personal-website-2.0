import { type NextRequest, NextResponse } from "next/server";

function getOgImage(html: string, baseUrl: string) {
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

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
    const image = getOgImage(html, response.url);

    return NextResponse.json(
      { image },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return NextResponse.json({ image: null }, { status: 200 });
  }
}
