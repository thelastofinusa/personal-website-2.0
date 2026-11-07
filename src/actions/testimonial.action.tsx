"use server";

import { headers } from "next/headers";
import AutoReplyEmail, { getAutoReplySubject } from "@/emails/auto-reply-email";
import TestimonialEmail from "@/emails/testimonial-email";
import { canEmailVisitors, sendMail } from "@/lib/mailer";
import { checkContactRateLimit } from "@/lib/rate-limit";
import {
  type TestimonialActionResult,
  testimonialSchema,
} from "@/lib/validations/testimonial";
import { writeClient } from "@/sanity/lib/client";

const FIELDS: readonly string[] = [
  "name",
  "email",
  "role",
  "content",
  "rating",
  "consentToDisplay",
];

async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return h.get("x-real-ip") ?? forwarded ?? "unknown";
}

export async function submitTestimonial(
  input: unknown,
): Promise<TestimonialActionResult> {
  const parsed = testimonialSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Partial<
      Record<
        "name" | "email" | "role" | "content" | "rating" | "consentToDisplay",
        string
      >
    > = {};

    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && FIELDS.includes(key)) {
        const field = key as
          | "name"
          | "email"
          | "role"
          | "content"
          | "rating"
          | "consentToDisplay";
        fieldErrors[field] ??= issue.message;
      }
    }

    return {
      ok: false,
      error: "invalid",
      message: "Please check your details and try again.",
      fieldErrors,
    };
  }

  const { name, email, role, company, content, rating, url, consentToDisplay } =
    parsed.data;

  const ip = await getClientIp();
  const limit = await checkContactRateLimit(ip);

  if (!limit.allowed) {
    const minutes = Math.ceil(limit.retryAfter / 60);
    return {
      ok: false,
      error: "rate_limited",
      message:
        minutes <= 1
          ? "Too many submissions. Please try again in a minute."
          : `Too many submissions. Please try again in ${minutes} minutes.`,
      retryAfter: limit.retryAfter,
    };
  }

  let createdId: string;

  try {
    const doc = await writeClient.create({
      _type: "testimonial",
      name,
      email,
      role,
      company: company || undefined,
      rating,
      approve: false,
      content,
      consentToDisplay,
      ...(url ? { url } : {}),
    });
    createdId = doc._id;
  } catch (createError) {
    console.error("[testimonial] sanity create failed:", createError);
    return {
      ok: false,
      error: "send_failed",
      message:
        "Something went wrong saving your testimonial. Please try again.",
    };
  }

  const to = process.env.CONTACT_TO_EMAIL;

  // Both emails are best effort. The testimonial is already saved in Sanity,
  // so an email problem must never show the visitor an error.

  // 1. Notification to you, with the "Approve in Sanity" button
  if (to) {
    const notice = await sendMail({
      to,
      replyTo: email,
      subject: `New testimonial from ${name} (needs approval)`,
      react: (
        <TestimonialEmail
          _id={createdId}
          name={name}
          email={email}
          role={role}
          company={company || undefined}
          content={content}
          rating={rating}
          url={url || undefined}
          consentToDisplay={consentToDisplay}
          receivedAt={new Date()}
        />
      ),
    });

    if (!notice.ok) console.error("[testimonial] notify failed:", notice.error);
  }

  // 2. "We got it" email to the visitor. Wording depends on their consent.
  // Never echoes their text back, so this can't be used to relay content.
  if (canEmailVisitors()) {
    const props = {
      variant: "testimonial-received",
      name,
      senderName: process.env.CONTACT_SENDER_NAME ?? "Osilama",
      consentToDisplay,
    } as const;

    const receipt = await sendMail({
      to: email,
      replyTo: to,
      subject: getAutoReplySubject(props),
      react: <AutoReplyEmail {...props} />,
      automatic: true,
    });

    if (!receipt.ok)
      console.error("[testimonial] receipt failed:", receipt.error);
  }

  return { ok: true };
}
