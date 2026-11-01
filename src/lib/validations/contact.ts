import * as z from "zod";

/**
 * Single source of truth for contact form validation.
 * Imported by the client form (instant feedback) AND the server action
 * (the only validation that actually counts).
 *
 * No "server-only" import here on purpose: the client needs it too.
 */

export const CONTACT_LIMITS = {
  name: { min: 5, max: 32 },
  email: { min: 5, max: 254 }, // 254 is the practical max length of an email address
  message: { min: 10, max: 100 },
  from: { max: 80 },
  maxLinksInMessage: 2,
} as const;

// Letters (any language), combining marks, space, apostrophes, dots, hyphens.
const NAME_REGEX = /^[\p{L}\p{M}][\p{L}\p{M} '’.-]*$/u;

/**
 * Rejects ASCII control characters. Checked via char codes (not a regex)
 * so linters don't flag control characters in a pattern.
 * Newlines are only allowed where `allowNewlines` is true.
 */
const hasControlChars = (value: string, allowNewlines = false) => {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const isNewline = code === 10 || code === 13;
    if (code === 127) return true;
    if (code < 32 && !(allowNewlines && isNewline)) return true;
  }
  return false;
};

const countLinks = (value: string) =>
  (value.match(/https?:\/\/|www\./gi) ?? []).length;

export const contactSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(CONTACT_LIMITS.name.min, "Name must be at least 5 chars.")
    .max(CONTACT_LIMITS.name.max, "Name must be at most 32 chars.")
    .regex(NAME_REGEX, "Use letters, spaces, hyphens and apostrophes only."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(CONTACT_LIMITS.email.min, "Email must be at least 5 chars.")
    .max(CONTACT_LIMITS.email.max, "That email is too long.")
    .email("That email doesn't look right."),

  message: z
    .string()
    .trim()
    .min(CONTACT_LIMITS.message.min, "Message must be at least 10 chars.")
    .max(CONTACT_LIMITS.message.max, "Message must be at most 100 chars.")
    .refine((v) => !hasControlChars(v, true), "Message has invalid characters.")
    .refine(
      (v) => countLinks(v) <= CONTACT_LIMITS.maxLinksInMessage,
      "Please include at most two links.",
    ),

  // Page the visitor came from (set by the form, never typed by the user)
  from: z
    .string()
    .trim()
    .max(CONTACT_LIMITS.from.max)
    .refine((v) => !hasControlChars(v), "Invalid value.")
    .optional(),

  // Honeypot: hidden from humans. Bots tend to fill it in.
  website: z.string().max(200).optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
export type ContactField = "name" | "email" | "message";

export type ContactActionResult =
  | { ok: true }
  | {
      ok: false;
      error: "invalid";
      message: string;
      fieldErrors: Partial<Record<ContactField, string>>;
    }
  | {
      ok: false;
      error: "rate_limited";
      message: string;
      retryAfter: number; // seconds
    }
  | { ok: false; error: "send_failed"; message: string };
