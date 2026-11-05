"use server";

import { Resend } from "resend";
import AutoReplyEmail from "@/emails/auto-reply-email";
import ContactEmail from "@/emails/contact-email";
import TestimonialEmail from "@/emails/testimonial-email";

type TestResult = { ok: boolean; message: string };

/**
 * Development helper for the /email-preview page.
 *
 * - Disabled in production builds.
 * - Always sends to CONTACT_TO_EMAIL, never to an address from the client.
 * - Returns Resend's real error text so you can see why a send fails.
 */
export async function sendTestEmail(template: unknown): Promise<TestResult> {
  if (process.env.NODE_ENV === "production") {
    return { ok: false, message: "Test emails are disabled in production." };
  }

  if (
    template !== "contact" &&
    template !== "auto-reply" &&
    template !== "testimonial"
  ) {
    return { ok: false, message: "Unknown template." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !to) {
    return {
      ok: false,
      message:
        "Set RESEND_API_KEY and CONTACT_TO_EMAIL in .env.local, then restart the dev server.",
    };
  }

  const from =
    process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";

  try {
    const { data, error } = await new Resend(apiKey).emails.send({
      from,
      to: [to],
      subject:
        template === "contact"
          ? "[Test] New message from Amara"
          : template === "auto-reply"
            ? "[Test] Thanks for reaching out"
            : "[Test] New testimonial from Amara (needs approval)",
      react:
        template === "contact" ? (
          <ContactEmail {...ContactEmail.PreviewProps} />
        ) : template === "auto-reply" ? (
          <AutoReplyEmail {...AutoReplyEmail.PreviewProps} />
        ) : (
          <TestimonialEmail {...TestimonialEmail.PreviewProps} />
        ),
    });

    if (error) return { ok: false, message: `${error.name}: ${error.message}` };

    return {
      ok: true,
      message: `Sent to ${to} (id ${data?.id}). Check your inbox and spam folder.`,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
