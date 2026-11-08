import { Body, Container, Head, Html, Preview } from "@react-email/components";
import type React from "react";

const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/**
 * Shared shell for every email.
 *
 * It's laid out like a normal personal email: left aligned, plain text on
 * the mail app's own background, no cards, banners or full-width buttons.
 * Mail apps add their own padding, so there is none here.
 *
 * Because there is no background, text colors must flip in dark mode.
 * Inline styles are the light defaults; these classes swap them when the mail
 * app reports a dark color scheme (Apple Mail, iOS Mail and Outlook.com honour
 * it; Gmail's app does its own color inversion instead).
 *
 * Classes: em-text, em-muted, em-link
 *
 * Keep exactly one prefers-color-scheme query in this file: the /preview page
 * swaps it to force light or dark.
 */
const darkCss = `
@media (prefers-color-scheme: dark) {
  .em-text { color: #f3f4f6 !important; }
  .em-muted { color: #9ca3af !important; }
  .em-link { color: #f3f4f6 !important; }
}
`;

export default function ParentEmail(props: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{darkCss}</style>
      </Head>
      <Preview>{props.preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>{props.children}</Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    margin: 0,
    padding: "0 14px 12px",
    fontFamily,
  },
  container: {
    maxWidth: "560px",
    margin: 0,
  },
} as const;
