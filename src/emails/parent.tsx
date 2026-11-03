import { Body, Container, Head, Html, Preview } from "@react-email/components";
import type React from "react";

const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/**
 * Shared shell for every email.
 *
 * No background or card on purpose: mail apps add their own padding and
 * background, especially on mobile.
 *
 * Because there is no background, text colors must flip in dark mode.
 * Inline styles are the light defaults; these classes swap them when the mail
 * app reports a dark color scheme (Apple Mail, iOS Mail and Outlook.com honour
 * it; Gmail's app does its own color inversion instead).
 *
 * Classes: em-text, em-muted, em-link, em-rule, em-quote, em-btn
 */
const darkCss = `
@media (prefers-color-scheme: dark) {
  .em-text { color: #f3f4f6 !important; }
  .em-muted { color: #9ca3af !important; }
  .em-link { color: #f3f4f6 !important; }
  .em-rule { border-color: #374151 !important; }
  .em-quote { border-left-color: #09679C !important; }
  .em-btn { background-color: #09679C !important; color: #ffffff !important; }
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
    maxWidth: "520px",
    margin: "0 auto",
  },
} as const;
