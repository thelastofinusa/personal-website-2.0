import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface AutoReplyEmailProps {
  name: string;
  senderName: string;
}

const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export default function AutoReplyEmail({
  name,
  senderName,
}: AutoReplyEmailProps) {
  const firstName = name.trim().split(" ")[0];

  return (
    <Html lang="en">
      <Head />
      <Preview>Thanks for reaching out. I'll reply within 48 hours.</Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.card}>
            <Text style={styles.title}>
              Thanks for reaching out, {firstName}
            </Text>

            <Text style={styles.text}>
              Your message has landed in my inbox. I read every one personally
              and will get back to you within 48 hours.
            </Text>

            <Text style={styles.text}>
              If it's urgent or you forgot to mention something, just reply to
              this email and it will come straight to me.
            </Text>

            <Text style={styles.signoff}>
              Talk soon,
              <br />
              {senderName}
            </Text>

            <Hr style={styles.hr} />

            <Text style={styles.note}>
              This is an automatic confirmation that your message was received.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

AutoReplyEmail.PreviewProps = {
  name: "Amara Okafor",
  senderName: "Holiday",
} satisfies AutoReplyEmailProps;

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
  card: {
    backgroundColor: "#ffffff",
    paddingInline: "24px",
  },
  title: {
    margin: "0 0 16px",
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 600,
    color: "#111827",
  },
  text: {
    margin: "0 0 14px",
    fontSize: "15px",
    lineHeight: "24px",
    color: "#374151",
  },
  signoff: {
    margin: "20px 0 0",
    fontSize: "15px",
    lineHeight: "24px",
    color: "#111827",
  },
  hr: {
    border: "none",
    borderTop: "1px solid #e5e7eb",
    margin: "24px 0 16px",
  },
  note: {
    margin: 0,
    fontSize: "12px",
    lineHeight: "18px",
    color: "#9ca3af",
  },
} as const;
