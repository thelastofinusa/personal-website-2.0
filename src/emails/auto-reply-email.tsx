import { Hr, Section, Text } from "@react-email/components";
import ParentEmail from "./parent";

export interface AutoReplyEmailProps {
  name: string;
  senderName: string;
}

export default function AutoReplyEmail({
  name,
  senderName,
}: AutoReplyEmailProps) {
  const firstName = name.trim().split(" ")[0];

  return (
    <ParentEmail preview="Thanks for reaching out. I’ll reply within 48 hours.">
      <Section>
        <Text className="em-text" style={styles.title}>
          Thanks for reaching out, {firstName}
        </Text>

        <Text className="em-text" style={styles.text}>
          Your message has landed in my inbox. I read every one personally and
          will get back to you within 48 hours.
        </Text>

        <Text className="em-text" style={styles.text}>
          If it’s urgent or you forgot to mention something, just reply to this
          email and it will come straight to me.
        </Text>

        <Text className="em-text" style={styles.signoff}>
          Talk soon,
          <br />
          {senderName}
        </Text>

        <Hr className="em-rule" style={styles.hr} />

        <Text className="em-muted" style={styles.note}>
          This is an automatic confirmation that your message was received.
        </Text>
      </Section>
    </ParentEmail>
  );
}

AutoReplyEmail.PreviewProps = {
  name: "Amara Okafor",
  senderName: "Holiday",
} satisfies AutoReplyEmailProps;

const styles = {
  title: {
    margin: "0 0 16px",
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 600,
    color: "#111827",
  },
  text: {
    margin: "0 0 14px",
    fontSize: "16px",
    lineHeight: "25px",
    color: "#111827",
  },
  signoff: {
    margin: "20px 0 0",
    fontSize: "16px",
    lineHeight: "25px",
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
