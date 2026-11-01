"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import AutoReplyEmail from "@/emails/auto-reply-email";
import ContactEmail from "@/emails/contact-email";
import { checkContactRateLimit } from "@/lib/rate-limit";
import {
  type ContactActionResult,
  type ContactField,
  contactSchema,
} from "@/lib/validations/contact";

const SEND_TIMEOUT_MS = 15_000;
const FIELDS: readonly string[] = ["name", "email", "message"];

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
 * Server actions are public POST endpoints. Anyone can call this with any
 * payload, so the input type is `unknown` and nothing is trusted until
 * it has passed the zod schema.
 *
 * Order matters:
 *   1. validate  (cheap, no network)
 *   2. honeypot  (bots get a fake success, so they don't adapt)
 *   3. rate limit (one Redis round trip, only for well-formed requests)
 *   4. send
 */
export async function sendContactMessage(
  input: unknown,
): Promise<ContactActionResult> {
  // 1. Strict validation
  const parsed = contactSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<ContactField, string>> = {};

    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && FIELDS.includes(key)) {
        const field = key as ContactField;
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

  const { name, email, message, from, website } = parsed.data;

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
          ? "Too many messages. Please try again in a minute."
          : `Too many messages. Please try again in ${minutes} minutes.`,
      retryAfter: limit.retryAfter,
    };
  }

  // 4. Send
  const to = process.env.CONTACT_TO_EMAIL;
  const fromAddress =
    process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";

  if (!resend || !to) {
    console.error("[contact] RESEND_API_KEY or CONTACT_TO_EMAIL is missing");
    return {
      ok: false,
      error: "send_failed",
      message: "Something went wrong on my end. Please try again later.",
    };
  }

  try {
    const { error } = await withTimeout(
      resend.emails.send({
        from: fromAddress,
        to: [to],
        replyTo: email,
        subject: `New message from ${name}`,
        react: (
          <ContactEmail
            name={name}
            email={email}
            message={message}
            from={from}
            receivedAt={new Date()}
          />
        ),
        // Stops Gmail from threading every contact email together
        headers: { "X-Entity-Ref-ID": crypto.randomUUID() },
      }),
      SEND_TIMEOUT_MS,
    );

    if (error) {
      console.error("[contact] Resend error:", error.name, error.message);
      return {
        ok: false,
        error: "send_failed",
        message: "Your message couldn't be sent. Please try again.",
      };
    }

    // Confirmation to the visitor. Best effort: your inbox already has the
    // message, so a failure here must never show the visitor an error.
    //
    // Deliberately does NOT echo their message back. This endpoint can be
    // pointed at any address, so it should never relay visitor-written text.
    try {
      // The test sender (onboarding@resend.dev) can only deliver to your own
      // Resend account email, so skip the confirmation until a verified
      // sender is set in CONTACT_FROM_EMAIL.
      if (!process.env.CONTACT_FROM_EMAIL) return { ok: true };

      const { error: replyError } = await withTimeout(
        resend.emails.send({
          from: fromAddress,
          to: [email],
          replyTo: to,
          subject: "Thanks for reaching out",
          react: (
            <AutoReplyEmail
              name={name}
              senderName={process.env.CONTACT_SENDER_NAME ?? "Holiday"}
            />
          ),
          headers: {
            // Tells mail systems this is automatic, so autoresponders don't loop
            "Auto-Submitted": "auto-replied",
            "X-Auto-Response-Suppress": "All",
            "X-Entity-Ref-ID": crypto.randomUUID(),
          },
        }),
        10_000,
      );

      if (replyError) {
        console.error(
          "[contact] auto-reply error:",
          replyError.name,
          replyError.message,
        );
      }
    } catch (replyError) {
      console.error("[contact] auto-reply failed:", replyError);
    }

    return { ok: true };
  } catch (error) {
    console.error("[contact] send failed:", error);
    return {
      ok: false,
      error: "send_failed",
      message: "Your message couldn't be sent. Please try again.",
    };
  }
}
