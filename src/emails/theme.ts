import type { CSSProperties } from "react";

/**
 * The palette every email shares. These are the same colors the emails
 * already used; only the layout around them changed.
 *
 * Dark mode counterparts live in `parent.tsx` (the em-* classes).
 */
export const colors = {
  text: "#111827",
  muted: "#6b7280",
  faint: "#9ca3af",
  accent: "#09679C",
  rule: "#e5e7eb",
  urgent: "#dc2626",
} as const;

/**
 * Plain-letter styles. Pair each with its class so dark mode can swap colors:
 *   p, message, signoff  -> em-text
 *   small, footnote      -> em-muted
 *   link                 -> em-link
 */
export const emailStyles = {
  p: {
    margin: "0 0 14px",
    fontSize: "15px",
    lineHeight: "24px",
    color: colors.text,
  },
  message: {
    margin: "0 0 14px",
    padding: "14px 0",
    borderBlock: "1px solid black",
    borderBlockColor: colors.faint,
    fontSize: "15px",
    lineHeight: "24px",
    color: colors.text,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  signoff: {
    margin: "22px 0 0",
    fontSize: "15px",
    lineHeight: "24px",
    color: colors.text,
  },
  small: {
    margin: "0 0 14px",
    fontSize: "13px",
    lineHeight: "21px",
    color: colors.muted,
  },
  footnote: {
    margin: "28px 0 0",
    fontSize: "12px",
    lineHeight: "18px",
    color: colors.faint,
  },
  link: {
    color: colors.accent,
    textDecoration: "underline",
  },
  urgent: {
    margin: "0 0 14px",
    fontSize: "15px",
    lineHeight: "24px",
    fontWeight: 700,
    color: colors.urgent,
  },
} satisfies Record<string, CSSProperties>;
