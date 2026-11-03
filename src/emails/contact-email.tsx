import {
  Button,
  Column,
  Hr,
  Link,
  Row,
  Section,
  Text,
} from "@react-email/components";
import ParentEmail from "./parent";

export interface ContactEmailProps {
  name: string;
  email: string;
  message: string;
  from?: string;
  receivedAt: Date;
}

const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export default function ContactEmail({
  name,
  email,
  message,
  from,
  receivedAt,
}: ContactEmailProps) {
  const firstName = name.trim().split(" ")[0];

  const received = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(receivedAt);

  const replyHref = `mailto:${email}?subject=${encodeURIComponent(
    `Re: your message`,
  )}`;

  return (
    <ParentEmail
      preview={`${firstName} sent you a message from your portfolio`}
    >
      <Section style={styles.card}>
        <Text style={styles.title}>New message from {firstName}</Text>
        <Text style={styles.subtitle}>
          Sent through your portfolio contact form.
        </Text>

        <Hr style={styles.hr} />

        <Row style={styles.row}>
          <Column style={styles.label}>Name</Column>
          <Column style={styles.value}>{name}</Column>
        </Row>
        <Row style={styles.row}>
          <Column style={styles.label}>Email</Column>
          <Column style={styles.value}>
            <Link href={`mailto:${email}`} style={styles.link}>
              {email}
            </Link>
          </Column>
        </Row>
        {from ? (
          <Row style={styles.row}>
            <Column style={styles.label}>Sent from</Column>
            <Column style={styles.value}>{from}</Column>
          </Row>
        ) : null}
        <Row style={styles.row}>
          <Column style={styles.label}>Received</Column>
          <Column style={styles.value}>{received} (WAT)</Column>
        </Row>

        <Hr style={styles.hr} />

        <Text style={styles.messageLabel}>Message</Text>
        <Text style={styles.message}>{message}</Text>

        <Section style={styles.buttonWrap}>
          <Button href={replyHref} style={styles.button}>
            Reply to {firstName}
          </Button>
        </Section>
      </Section>

      <Text style={styles.footer}>
        Replying to this email also goes straight to {email}.
      </Text>
    </ParentEmail>
  );
}

ContactEmail.PreviewProps = {
  name: "Amara Okafor",
  email: "amara@example.com",
  message:
    "Hi! I run a small fashion label in Lagos and need a portfolio site. Are you free to chat this week?",
  from: 'from "projects" page',
  receivedAt: new Date("2026-11-01T14:32:00Z"),
} satisfies ContactEmailProps;

const styles = {
  card: {
    backgroundColor: "#ffffff",
    paddingInline: "24px",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 600,
    color: "#111827",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: "14px",
    lineHeight: "20px",
    color: "#6b7280",
  },
  hr: {
    border: "none",
    borderTop: "1px solid #e5e7eb",
    margin: "20px 0",
  },
  row: {
    marginBottom: "8px",
  },
  label: {
    width: "88px",
    verticalAlign: "top",
    fontSize: "13px",
    lineHeight: "20px",
    color: "#6b7280",
  },
  value: {
    verticalAlign: "top",
    fontSize: "14px",
    lineHeight: "20px",
    color: "#111827",
  },
  link: {
    color: "#111827",
    textDecoration: "underline",
  },
  messageLabel: {
    margin: "0 0 8px",
    fontSize: "13px",
    lineHeight: "20px",
    color: "#6b7280",
  },
  message: {
    margin: 0,
    padding: "2px 0 2px 14px",
    borderLeft: "3px solid #111827",
    fontSize: "15px",
    lineHeight: "24px",
    color: "#111827",
    whiteSpace: "pre-wrap",
  },
  buttonWrap: {
    marginTop: "24px",
  },
  button: {
    backgroundColor: "#111827",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "20px",
    padding: "10px 18px",
    borderRadius: "8px",
    textDecoration: "none",
    display: "inline-block",
  },
  footer: {
    margin: "16px 0 0",
    textAlign: "center",
    fontSize: "12px",
    lineHeight: "18px",
    color: "#9ca3af",
  },
} as const;
