import { Link, Text } from "@react-email/components";
import ParentEmail from "./parent";
import { emailStyles as s } from "./theme";

export interface ContactEmailProps {
  name: string;
  email: string;
  message: string;
  urgent?: boolean;
  /** Reads naturally after "from", e.g. "the projects page". */
  from?: string;
  receivedAt: Date;
}

export default function ContactEmail({
  name,
  email,
  message,
  urgent,
  from,
  receivedAt,
}: ContactEmailProps) {
  const firstName = name.trim().split(" ")[0];

  const received = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    dateStyle: "long",
    timeStyle: "short",
  }).format(receivedAt);

  return (
    <ParentEmail
      preview={`${urgent ? "[URGENT] " : ""}${firstName}: ${message}`}
    >
      {urgent ? <Text style={s.urgent}>Marked as urgent</Text> : null}

      <Text className="em-text" style={s.p}>
        <strong>{name}</strong> (
        <Link className="em-link" href={`mailto:${email}`} style={s.link}>
          {email}
        </Link>
        ) sent you a message{from ? ` from ${from}` : ""}:
      </Text>

      <Text className="em-text" style={s.message}>
        {message}
      </Text>

      <Text className="em-text" style={s.p}>
        Just reply to this email to answer {firstName}.
      </Text>

      <Text className="em-muted" style={s.footnote}>
        Received {received} (WAT)
        {urgent ? " · Priority: urgent" : ""}
      </Text>
    </ParentEmail>
  );
}

export const contactEmailPreviews = {
  contact: {
    name: "Amara Okafor",
    email: "amara@example.com",
    message:
      "Hi! I run a small fashion label in Lagos and need a portfolio site. Are you free to chat this week?",
    urgent: false,
    from: "the projects page",
    receivedAt: new Date("2026-11-01T14:32:00Z"),
  },
  "contact-urgent": {
    name: "Amara Okafor",
    email: "amara@example.com",
    message:
      "Hi! My launch is on Friday and my current site just went down. Can we talk today?",
    urgent: true,
    from: "the projects page",
    receivedAt: new Date("2026-11-01T14:32:00Z"),
  },
} satisfies Record<string, ContactEmailProps>;

export type ContactEmailPreviewId = keyof typeof contactEmailPreviews;

// Shown by `bun email:dev`
ContactEmail.PreviewProps = contactEmailPreviews[
  "contact-urgent"
] satisfies ContactEmailProps;
