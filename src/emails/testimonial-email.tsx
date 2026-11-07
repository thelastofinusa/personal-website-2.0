import {
  Button,
  Column,
  Hr,
  Link,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { siteConfig } from "@/config/site.config";
import ParentEmail from "./parent";

export interface TestimonialEmailProps {
  _id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  content: string;
  rating: number;
  url?: string;
  receivedAt: Date;
}

export default function TestimonialEmail({
  _id,
  name,
  email,
  role,
  company,
  content,
  rating,
  url,
  receivedAt,
}: TestimonialEmailProps) {
  const firstName = name.trim().split(" ")[0];

  const received = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    dateStyle: "long",
    timeStyle: "short",
  }).format(receivedAt);

  const studioUrl = `${siteConfig.url}/studio/structure/testimonial;${_id}`;

  return (
    <ParentEmail
      preview={`New testimonial from ${firstName} awaiting your approval`}
    >
      <Section>
        <Text className="em-muted" style={styles.eyebrow}>
          Testimonial submission
        </Text>
        <Text className="em-text" style={styles.title}>
          {firstName} sent you a testimonial
        </Text>

        <Text className="em-text em-quote" style={styles.message}>
          {content}
        </Text>

        <Button className="em-btn" href={studioUrl} style={styles.button}>
          Approve in Sanity
        </Button>

        {url ? (
          <Text style={styles.subLinkWrapper}>
            <Link className="em-link" href={url} style={styles.subLink}>
              Visit {name}&apos;s site →
            </Link>
          </Text>
        ) : null}

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
            Role
          </Column>
          <Column className="em-text" style={styles.value}>
            {role}
          </Column>
        </Row>
        {company ? (
          <Row style={styles.row}>
            <Column className="em-muted" style={styles.label}>
              Company
            </Column>
            <Column className="em-text" style={styles.value}>
              {company}
            </Column>
          </Row>
        ) : null}
        <Row style={styles.row}>
          <Column className="em-muted" style={styles.label}>
            Rating
          </Column>
          <Column className="em-text" style={styles.value}>
            {rating} / 5
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
        This testimonial was saved with <strong>approve = false</strong>. Review
        it in Sanity and toggle "Approve Testimonial" to show it on the site.
      </Text>
    </ParentEmail>
  );
}

TestimonialEmail.PreviewProps = {
  _id: "AZy6BeWaA4r6kdvrkhoxpe",
  name: "Amara Okafor",
  email: "amara@example.com",
  role: "Fashion Designer",
  company: "Lagos Label",
  content:
    "Amazing work! The portfolio site really captures my brand. Highly recommended.",
  rating: 5,
  url: "https://example.com",
  receivedAt: new Date("2026-11-05T09:15:00Z"),
} satisfies TestimonialEmailProps;

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
  subLinkWrapper: {
    margin: "10px 0 0",
    textAlign: "right" as const,
  },
  subLink: {
    fontSize: "12px",
    color: "#09679C",
    textDecoration: "none",
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
