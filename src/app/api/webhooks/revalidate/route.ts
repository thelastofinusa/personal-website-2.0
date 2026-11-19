import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ ok: false }, { status: 500 });

  const { isValidSignature } = await parseBody(req, secret);
  if (!isValidSignature) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Expire immediately so the next visit gets fresh content
  revalidateTag("sanity", { expire: 0 });
  return NextResponse.json({ ok: true });
}
