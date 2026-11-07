import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { createElement } from "react";
import { siteConfig } from "@/config/site.config";
import AutoReplyEmail, { getAutoReplySubject } from "@/emails/auto-reply-email";
import { canEmailVisitors, sendMail } from "@/lib/mailer";
import { writeClient } from "@/sanity/lib/client";

/**
 * Called by a Sanity webhook when you click "Send approval email" on a
 * testimonial in Studio (that button sets approvalEmailRequestedAt).
 * Emails the author using the same template as the other visitor emails.
 * Clicking again later resends it.
 *
 * Sanity setup (sanity.io/manage -> your project -> API -> Webhooks):
 *   URL:        https://<your-site>/api/webhooks/testimonial-approved
 *   Dataset:    production
 *   Trigger on: Update only
 *   Filter:     _type == "testimonial" && approve == true && defined(approvalEmailRequestedAt) && delta::changedAny(approvalEmailRequestedAt)
 *   Projection: {_id}
 *   Method:     POST
 *   Drafts:     off
 *   Secret:     same value as SANITY_WEBHOOK_SECRET
 */

type Payload = { _id?: string };

type TestimonialDoc = {
  _id: string;
  name: string;
  email: string;
  approve: boolean;
  consentToDisplay?: boolean;
  approvalEmailRequestedAt?: string;
  approvalEmailSentAt?: string;
};

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[approval] SANITY_WEBHOOK_SECRET is missing");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const { isValidSignature, body } = await parseBody<Payload>(req, secret);

  if (!isValidSignature) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const id = body?._id;
  if (!id) return NextResponse.json({ ok: true, skipped: "no id" });

  // Never trust the webhook body for anything but the id. Read the real
  // document, so a stale or replayed payload can't trigger a wrong email.
  const doc = await writeClient.fetch<TestimonialDoc | null>(
    `*[_type == "testimonial" && _id == $id][0]{
      _id, name, email, approve, consentToDisplay,
      approvalEmailRequestedAt, approvalEmailSentAt
    }`,
    { id },
    { cache: "no-store" },
  );

  if (!doc) return NextResponse.json({ ok: true, skipped: "not found" });
  if (!doc.approve)
    return NextResponse.json({ ok: true, skipped: "not approved" });

  // Idempotency: Sanity retries failed deliveries. Send only when the latest
  // request is newer than the last send. A fresh button click is newer, so it
  // resends; a retry of an already-handled request is not.
  const requestedAt = doc.approvalEmailRequestedAt;
  if (!requestedAt) {
    return NextResponse.json({ ok: true, skipped: "not requested" });
  }
  if (doc.approvalEmailSentAt && doc.approvalEmailSentAt >= requestedAt) {
    return NextResponse.json({ ok: true, skipped: "already sent" });
  }

  if (!canEmailVisitors()) {
    console.warn("[approval] no sender that can email visitors; skipped");
    return NextResponse.json({ ok: true, skipped: "no visitor sender" });
  }

  const props = {
    variant: "testimonial-approved",
    name: doc.name,
    senderName: process.env.CONTACT_SENDER_NAME ?? "Holiday",
    // Missing means false: never claim it is public without consent
    consentToDisplay: doc.consentToDisplay === true,
    testimonialsUrl: `${siteConfig.url}/about/testimonials`,
  } as const;

  const sent = await sendMail({
    to: doc.email,
    replyTo: process.env.CONTACT_TO_EMAIL,
    subject: getAutoReplySubject(props),
    react: createElement(AutoReplyEmail, props),
    automatic: true,
  });

  if (!sent.ok) {
    console.error("[approval] email failed:", sent.error);
    // 500 makes Sanity retry later
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // Mark as sent. This patch doesn't change approvalEmailRequestedAt, so the
  // webhook filter (delta::changedAny) won't fire again.
  try {
    await writeClient
      .patch(doc._id)
      .set({ approvalEmailSentAt: new Date().toISOString() })
      .commit();
  } catch (error) {
    console.error("[approval] could not stamp approvalEmailSentAt:", error);
  }

  return NextResponse.json({ ok: true });
}
