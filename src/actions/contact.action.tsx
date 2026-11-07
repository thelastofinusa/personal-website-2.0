"use server";

import { headers } from "next/headers";
import AutoReplyEmail, { getAutoReplySubject } from "@/emails/auto-reply-email";
import ContactEmail from "@/emails/contact-email";
import { canEmailVisitors, sendMail } from "@/lib/mailer";
import { checkContactRateLimit } from "@/lib/rate-limit";
import {
  type ContactActionResult,
  type ContactField,
  contactSchema,
} from "@/lib/validations/contact";

const FIELDS: readonly string[] = ["name", "email", "urgent", "message"];

async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return h.get("x-real-ip") ?? forwarded ?? "unknown";
}

export async function sendContactMessage(
  input: unknown,
): Promise<ContactActionResult> {
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

  const { name, email, urgent, message, from, website } = parsed.data;

  if (website) return { ok: true };

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

  const to = process.env.CONTACT_TO_EMAIL;

  if (!to) {
    console.error("[contact] CONTACT_TO_EMAIL is missing");
    return {
      ok: false,
      error: "send_failed",
      message: "Something went wrong on my end. Please try again later.",
    };
  }

  const sent = await sendMail({
    to,
    replyTo: email,
    subject: `${urgent ? "[URGENT] " : ""}New message from ${name}`,
    react: (
      <ContactEmail
        name={name}
        email={email}
        message={message}
        urgent={urgent}
        from={from}
        receivedAt={new Date()}
      />
    ),
  });

  if (!sent.ok) {
    console.error("[contact] send failed:", sent.error);
    return {
      ok: false,
      error: "send_failed",
      message: "Your message couldn't be sent. Please try again.",
    };
  }

  if (canEmailVisitors()) {
    const props = {
      variant: "contact-received",
      name,
      senderName: process.env.CONTACT_SENDER_NAME ?? "Osilama",
      urgent,
    } as const;

    const reply = await sendMail({
      to: email,
      replyTo: to,
      subject: getAutoReplySubject(props),
      react: <AutoReplyEmail {...props} />,
      automatic: true,
    });

    if (!reply.ok) console.error("[contact] auto-reply failed:", reply.error);
  }

  return { ok: true };
}
