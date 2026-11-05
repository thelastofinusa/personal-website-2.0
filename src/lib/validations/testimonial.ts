import * as z from "zod";

/**
 * Single source of truth for testimonial submission validation.
 * Imported by the client form (instant feedback) AND the server action
 * (the only validation that actually counts).
 */

export const TESTIMONIAL_LIMITS = {
  name: { min: 2, max: 100 },
  role: { min: 1, max: 100 },
  email: { min: 5, max: 254 }, // 254 is the practical max length of an email address
  company: { max: 100 },
  content: { min: 10, max: 500 },
  rating: { min: 0.5, max: 5 },
} as const;

// Letters (any language), combining marks, space, apostrophes, dots, hyphens.
const NAME_REGEX = /^[\p{L}\p{M}][\p{L}\p{M} '’.-]*$/u;

const hasControlChars = (value: string) => {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code === 127) return true;
    if (code < 32) return true;
  }
  return false;
};

/**
 * Users never submit an avatar. The avatar is generated on the server from
 * the user's email (Dicebear) and stored as a Sanity image asset.
 */
export const testimonialSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(TESTIMONIAL_LIMITS.name.min, "Name must be at least 2 chars.")
    .max(TESTIMONIAL_LIMITS.name.max, "Name must be at most 100 chars.")
    .regex(NAME_REGEX, "Use letters, spaces, hyphens and apostrophes only."),

  role: z
    .string()
    .trim()
    .min(TESTIMONIAL_LIMITS.role.min, "Role is required.")
    .max(TESTIMONIAL_LIMITS.role.max, "Role must be at most 100 chars."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(TESTIMONIAL_LIMITS.email.min, "Email must be at least 5 chars.")
    .max(TESTIMONIAL_LIMITS.email.max, "That email is too long.")
    .email("That email doesn't look right."),

  company: z
    .string()
    .trim()
    .max(TESTIMONIAL_LIMITS.company.max, "Company must be at most 100 chars.")
    .optional(),

  content: z
    .string()
    .trim()
    .min(
      TESTIMONIAL_LIMITS.content.min,
      "Testimonial must be at least 10 chars.",
    )
    .max(
      TESTIMONIAL_LIMITS.content.max,
      "Testimonial must be at most 500 chars.",
    )
    .refine((v) => !hasControlChars(v), "Testimonial has invalid characters."),

  rating: z
    .number()
    .min(TESTIMONIAL_LIMITS.rating.min, "Rating must be between 0.5 and 5.")
    .max(TESTIMONIAL_LIMITS.rating.max, "Rating must be between 0.5 and 5."),

  url: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) =>
        !v || z.url().safeParse(v).success || /^@[a-zA-Z0-9_.-]{1,30}$/.test(v),
      "Enter a valid URL or a handle like @yourname",
    ),

  // Honeypot: hidden from humans. Bots tend to fill it in.
  website: z.string().max(200).optional(),
});

export type TestimonialFormValues = z.infer<typeof testimonialSchema>;

export type TestimonialActionResult =
  | { ok: true }
  | {
      ok: false;
      error: "invalid";
      message: string;
      fieldErrors: Partial<
        Record<"name" | "email" | "role" | "content" | "rating", string>
      >;
    }
  | {
      ok: false;
      error: "rate_limited";
      message: string;
      retryAfter: number; // seconds
    }
  | { ok: false; error: "send_failed"; message: string };
