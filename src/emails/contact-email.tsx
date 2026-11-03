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
    dateStyle: "long",
    timeStyle: "short",
  }).format(receivedAt);

  const replyHref = `mailto:${email}?subject=${encodeURIComponent(
    "Re: your message",
  )}`;

  return (
    <ParentEmail preview={`${firstName}: ${message}`}>
      <Section>
        <Text className="em-muted" style={styles.eyebrow}>
          Portfolio contact form
        </Text>
        <Text className="em-text" style={styles.title}>
          {firstName} sent you a message
        </Text>

        <Text className="em-text em-quote" style={styles.message}>
          {message}
        </Text>

        <Button className="em-btn" href={replyHref} style={styles.button}>
          Reply to {firstName}
        </Button>

        <Hr className="em-rule" style={styles.hr} />

        <Row style={styles.row}>
          <Column className="em-muted" style={styles.label}>
            Name
          </Column>
          <Column className="em-text" style={styles.value}>
            {name}
          </Column>
        </Row>
        <Row style={styles.row}>
          <Column className="em-muted" style={styles.label}>
            Email
          </Column>
          <Column className="em-text" style={styles.value}>
            <Link
              className="em-link"
              href={`mailto:${email}`}
              style={styles.link}
            >
              {email}
            </Link>
          </Column>
        </Row>
        {from ? (
          <Row style={styles.row}>
            <Column className="em-muted" style={styles.label}>
              Sent from
            </Column>
            <Column className="em-text" style={styles.value}>
              {from}
            </Column>
          </Row>
        ) : null}
        <Row style={styles.row}>
          <Column className="em-muted" style={styles.label}>
            Received
          </Column>
          <Column className="em-text" style={styles.value}>
            {received} (WAT)
          </Column>
        </Row>
      </Section>

      <Text className="em-muted" style={styles.footer}>
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
  eyebrow: {
    margin: "0 0 2px",
    fontSize: "13px",
    lineHeight: "20px",
    color: "#6b7280",
  },
  title: {
    margin: "0 0 16px",
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 600,
    color: "#111827",
  },
  message: {
    margin: 0,
    padding: "2px 0 2px 14px",
    borderLeft: "3px solid #09679C",
    fontSize: "16px",
    color: "#111827",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  button: {
    display: "block",
    boxSizing: "border-box",
    width: "100%",
    marginTop: "20px",
    padding: "12px 18px",
    backgroundColor: "#09679C",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "20px",
    textAlign: "center",
    textDecoration: "none",
    borderRadius: "8px",
  },
  hr: {
    border: "none",
    borderTop: "1px solid #e5e7eb",
    margin: "24px 0 16px",
  },
  row: {
    marginBottom: "6px",
  },
  label: {
    width: "76px",
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
    wordBreak: "break-word",
  },
  link: {
    color: "#09679C",
    textDecoration: "underline",
  },
  footer: {
    margin: "20px 0 0",
    fontSize: "12px",
    lineHeight: "18px",
    color: "#9ca3af",
  },
} as const;
