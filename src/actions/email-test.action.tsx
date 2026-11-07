"use server";

import type { ReactElement } from "react";
import AutoReplyEmail, {
  type AutoReplyPreviewId,
  autoReplyPreviews,
  getAutoReplySubject,
} from "@/emails/auto-reply-email";
import ContactEmail from "@/emails/contact-email";
import TestimonialEmail from "@/emails/testimonial-email";
import { getMailProvider, sendMail } from "@/lib/mailer";

type TestResult = { ok: boolean; message: string };

const STATIC_TEMPLATES = ["contact", "testimonial"] as const;

/**
 * Development helper for the /preview page.
 *
 * - Disabled in production builds.
 * - Always sends to CONTACT_TO_EMAIL, never to an address from the client.
 * - Returns the real provider error so you can see why a send fails.
 */
export async function sendTestEmail(template: unknown): Promise<TestResult> {
  if (process.env.NODE_ENV === "production") {
    return { ok: false, message: "Test emails are disabled in production." };
  }

  const isStatic = STATIC_TEMPLATES.includes(
    template as (typeof STATIC_TEMPLATES)[number],
  );
  const isVariant =
    typeof template === "string" && template in autoReplyPreviews;

  if (!isStatic && !isVariant)
    return { ok: false, message: "Unknown template." };

  const to = process.env.CONTACT_TO_EMAIL;
  const provider = getMailProvider();

  if (!provider || !to) {
    return {
      ok: false,
      message:
        "Set CONTACT_TO_EMAIL plus GMAIL_USER and GMAIL_APP_PASSWORD (or RESEND_API_KEY) in .env.local, then restart the dev server.",
    };
  }

  let subject: string;
  let react: ReactElement;

  if (template === "contact") {
    subject = "[Test] New message from Amara";
    react = <ContactEmail {...ContactEmail.PreviewProps} />;
  } else if (template === "testimonial") {
    subject = "[Test] New testimonial from Amara (needs approval)";
    react = <TestimonialEmail {...TestimonialEmail.PreviewProps} />;
  } else {
    const props = autoReplyPreviews[template as AutoReplyPreviewId];
    subject = `[Test] ${getAutoReplySubject(props)}`;
    react = <AutoReplyEmail {...props} />;
  }

  const result = await sendMail({ to, subject, react });

  if (!result.ok) return { ok: false, message: result.error };

  return {
    ok: true,
    message: `Sent to ${to} via ${provider}. Check your inbox and spam folder.`,
  };
}
