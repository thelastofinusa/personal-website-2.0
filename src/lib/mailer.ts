import "server-only";

import { render } from "@react-email/components";
import nodemailer, { type Transporter } from "nodemailer";
import type React from "react";
import { Resend } from "resend";

/**
 * One place that sends every email, so the actions don't care who delivers.
 *
 * Provider choice (first match wins):
 *   1. Gmail SMTP  -> set GMAIL_USER + GMAIL_APP_PASSWORD.
 *      Works WITHOUT owning a domain and can email anyone.
 *   2. Resend      -> set RESEND_API_KEY.
 *      Without a verified domain Resend only delivers to your own account
 *      email, so visitor emails are skipped unless CONTACT_FROM_EMAIL is set
 *      (that address must be on a domain verified in Resend).
 *
 * Later, when you buy a domain: verify it in Resend, set CONTACT_FROM_EMAIL,
 * and delete the two GMAIL_* variables. No code changes needed.
 */

export type MailInput = {
  to: string;
  subject: string;
  react: React.ReactElement;
  replyTo?: string;
  /** Marks the message as automatic so autoresponders never loop. */
  automatic?: boolean;
};

export type MailResult = { ok: true } | { ok: false; error: string };

const TIMEOUT_MS = 15_000;

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
const senderName = process.env.CONTACT_SENDER_NAME ?? "Osilama";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Survives hot reloads in dev so we don't open a new SMTP pool on every save.
const globalRef = globalThis as unknown as { __mailTransport?: Transporter };

function getTransport(): Transporter | null {
  if (!gmailUser || !gmailPass) return null;

  // biome-ignore lint/suspicious/noAssignInExpressions: cache on globalThis
  return (globalRef.__mailTransport ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: gmailUser, pass: gmailPass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  }));
}

export type MailProvider = "gmail" | "resend" | null;

export function getMailProvider(): MailProvider {
  if (gmailUser && gmailPass) return "gmail";
  if (resend) return "resend";
  return null;
}

/**
 * Can we email an arbitrary visitor right now?
 * Resend's test sender (onboarding@resend.dev) cannot, so we say no.
 */
export function canEmailVisitors(): boolean {
  const provider = getMailProvider();
  if (provider === "gmail") return true;
  if (provider === "resend") return Boolean(process.env.CONTACT_FROM_EMAIL);
  return false;
}

function fromAddress(provider: Exclude<MailProvider, null>): string {
  if (provider === "gmail") return `${senderName} <${gmailUser}>`;
  return process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";
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

export async function sendMail(input: MailInput): Promise<MailResult> {
  const provider = getMailProvider();

  if (!provider) {
    return {
      ok: false,
      error: "No mail provider configured (GMAIL_* or RESEND_API_KEY).",
    };
  }

  const headers: Record<string, string> = {
    // Stops Gmail from threading every notification together
    "X-Entity-Ref-ID": crypto.randomUUID(),
    ...(input.automatic
      ? {
          "Auto-Submitted": "auto-replied",
          "X-Auto-Response-Suppress": "All",
        }
      : {}),
  };

  try {
    if (provider === "gmail") {
      const transport = getTransport();
      if (!transport) return { ok: false, error: "Gmail transport missing." };

      // Send a plain-text part too: better deliverability, and some clients
      // (and spam filters) prefer it.
      const [html, text] = await Promise.all([
        render(input.react),
        render(input.react, { plainText: true }),
      ]);

      await withTimeout(
        transport.sendMail({
          from: fromAddress("gmail"),
          to: input.to,
          replyTo: input.replyTo,
          subject: input.subject,
          html,
          text,
          headers,
        }),
        TIMEOUT_MS,
      );

      return { ok: true };
    }

    // Resend
    const { error } = await withTimeout(
      // biome-ignore lint/style/noNonNullAssertion: provider === "resend" implies resend exists
      resend!.emails.send({
        from: fromAddress("resend"),
        to: [input.to],
        replyTo: input.replyTo,
        subject: input.subject,
        react: input.react,
        headers,
      }),
      TIMEOUT_MS,
    );

    if (error) return { ok: false, error: `${error.name}: ${error.message}` };
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
