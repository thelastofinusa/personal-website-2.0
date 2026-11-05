"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import TestimonialEmail from "@/emails/testimonial-email";
import { checkContactRateLimit } from "@/lib/rate-limit";
import {
  type TestimonialActionResult,
  testimonialSchema,
} from "@/lib/validations/testimonial";
import { writeClient } from "@/sanity/lib/client";

const SEND_TIMEOUT_MS = 15_000;
const FIELDS: readonly string[] = [
  "name",
  "email",
  "role",
  "content",
  "rating",
];

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

async function getClientIp(): Promise<string> {
  const h = await headers();
  // On Vercel these are set by the platform, not by the client.
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return h.get("x-real-ip") ?? forwarded ?? "unknown";
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Timed out")), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Converts a Dicebear data URI into a Blob so it can be uploaded as a Sanity
 * image asset.
 */
function dataUriToBlob(dataUri: string): Blob {
  const [header, base64] = dataUri.split(",");
  const mime = header?.match(/:(.*?);/)?.[1] ?? "application/octet-stream";
  const bytes = atob(base64);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    buffer[i] = bytes.charCodeAt(i);
  }
  return new Blob([buffer], { type: mime });
}

/**
 * Server action for testimonial submissions.
 *
 * Order matters:
 *   1. validate  (cheap, no network)
 *   2. honeypot  (bots get a fake success, so they don't adapt)
 *   3. rate limit (only for well-formed requests)
 *   4. create the testimonial document (approve = false, pending review)
 *   5. send notification email
 */
export async function submitTestimonial(
  input: unknown,
): Promise<TestimonialActionResult> {
  // 1. Strict validation
  const parsed = testimonialSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Partial<
      Record<"name" | "email" | "role" | "content" | "rating", string>
    > = {};

    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && FIELDS.includes(key)) {
        const field = key as "name" | "email" | "role" | "content" | "rating";
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

  const { name, email, role, company, content, rating, url, website } =
    parsed.data;

  // 2. Honeypot: pretend it worked, send nothing
  if (website) return { ok: true };

  // 3. Rate limit
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

  // 4. Create the testimonial document (unapproved, pending review)
  try {
    await writeClient.create({
      _type: "testimonial",
      name,
      role,
      company: company || undefined,
      rating,
      approve: false,
      content,
      ...(url ? { url } : {}),
    });
  } catch (createError) {
    console.error("[testimonial] sanity create failed:", createError);
    return {
      ok: false,
      error: "send_failed",
      message:
        "Something went wrong saving your testimonial. Please try again.",
    };
  }

  // 5. Send notification email (best effort: the submission is already saved)
  const to = process.env.CONTACT_TO_EMAIL;
  const fromAddress =
    process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";

  if (resend && to) {
    try {
      const { error } = await withTimeout(
        resend.emails.send({
          from: fromAddress,
          to: [to],
          subject: `New testimonial from ${name} (needs approval)`,
          react: (
            <TestimonialEmail
              name={name}
              email={email}
              role={role}
              company={company || undefined}
              content={content}
              rating={rating}
              url={url || undefined}
              receivedAt={new Date()}
            />
          ),
          headers: { "X-Entity-Ref-ID": crypto.randomUUID() },
        }),
        SEND_TIMEOUT_MS,
      );

      if (error) {
        console.error("[testimonial] Resend error:", error.name, error.message);
      }
    } catch (sendError) {
      console.error("[testimonial] send failed:", sendError);
    }
  }

  return { ok: true };
}
