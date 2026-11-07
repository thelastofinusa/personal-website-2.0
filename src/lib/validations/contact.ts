import * as z from "zod";

/**
 * Single source of truth for contact form validation.
 * Imported by the client form (instant feedback) AND the server action
 * (the only validation that actually counts).
 */

export const CONTACT_LIMITS = {
  name: { min: 5, max: 32 },
  email: { min: 5, max: 254 },
  message: { min: 10, max: 200 },
  from: { max: 80 },
  maxLinksInMessage: 2,
} as const;

const NAME_REGEX = /^[\p{L}\p{M}][\p{L}\p{M} '’.-]*$/u;

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
    .email("That email doesn't look right.")
    .trim()
    .toLowerCase()
    .min(CONTACT_LIMITS.email.min, "Email must be at least 5 chars.")
    .max(CONTACT_LIMITS.email.max, "That email is too long."),

  urgent: z.boolean().default(false),

  message: z
    .string()
    .trim()
    .min(CONTACT_LIMITS.message.min, "Message must be at least 10 chars.")
    .max(CONTACT_LIMITS.message.max, "Message must be at most 200 chars.")
    .refine((v) => !hasControlChars(v, true), "Message has invalid characters.")
    .refine(
      (v) => countLinks(v) <= CONTACT_LIMITS.maxLinksInMessage,
      "Please include at most two links.",
    ),

  from: z
    .string()
    .trim()
    .max(CONTACT_LIMITS.from.max)
    .refine((v) => !hasControlChars(v), "Invalid value.")
    .optional(),

  website: z.string().max(200).optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
export type ContactField = "name" | "email" | "urgent" | "message";

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
      retryAfter: number;
    }
  | { ok: false; error: "send_failed"; message: string };
