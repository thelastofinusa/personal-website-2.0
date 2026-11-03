import { Body, Container, Head, Html, Preview } from "@react-email/components";
import type React from "react";

const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export default function ParentEmail(props: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html lang="en">
      <Head />
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
    paddingBottom: "12px",
    fontFamily,
  },
  container: {
    maxWidth: "520px",
    margin: "0 auto",
  },
} as const;
