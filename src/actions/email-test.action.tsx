"use server";

import { getEmailTemplate } from "@/emails/registry";
import { getMailProvider, sendMail } from "@/lib/mailer";

type TestResult = { ok: boolean; message: string };

/**
 * Development helper for the /preview page.
 *
 * - Disabled in production builds.
 * - Always sends to CONTACT_TO_EMAIL, never to an address from the client.
 * - Returns the real provider error so you can see why a send fails.
 * - Knows every template through the registry, so new emails show up here
 *   automatically.
 */
export async function sendTestEmail(template: unknown): Promise<TestResult> {
  if (process.env.NODE_ENV === "production") {
    return { ok: false, message: "Test emails are disabled in production." };
  }

  const entry = getEmailTemplate(template);
  if (!entry) return { ok: false, message: "Unknown template." };

  const to = process.env.CONTACT_TO_EMAIL;
  const provider = getMailProvider();

  if (!provider || !to) {
    return {
      ok: false,
      message:
        "Set CONTACT_TO_EMAIL plus GMAIL_USER and GMAIL_APP_PASSWORD (or RESEND_API_KEY) in .env.local, then restart the dev server.",
    };
  }

  const result = await sendMail({
    to,
    subject: `[Test] ${entry.subject}`,
    react: entry.render(),
  });

  if (!result.ok) return { ok: false, message: result.error };

  return {
    ok: true,
    message: `Sent to ${to} via ${provider}. Check your inbox and spam folder.`,
  };
}
