import { Button, Hr, Section, Text } from "@react-email/components";
import ParentEmail from "./parent";

/**
 * The one template every visitor-facing email uses.
 *
 *   contact-received      contact form submitted
 *   testimonial-received  testimonial submitted (copy depends on consent)
 *   testimonial-approved  you approved it in Sanity (copy depends on consent)
 *
 * Only the words change. Layout, styling and sign-off stay identical.
 */
export type AutoReplyEmailProps =
  | {
      variant: "contact-received";
      name: string;
      senderName: string;
    }
  | {
      variant: "testimonial-received";
      name: string;
      senderName: string;
      consentToDisplay: boolean;
    }
  | {
      variant: "testimonial-approved";
      name: string;
      senderName: string;
      consentToDisplay: boolean;
      /** Where the "see it live" button points. */
      testimonialsUrl: string;
    };

type Copy = {
  subject: string;
  preview: string;
  title: string;
  paragraphs: string[];
  cta?: { label: string; href: string };
  note: string;
};

function getCopy(props: AutoReplyEmailProps): Copy {
  const firstName = props.name.trim().split(" ")[0];

  switch (props.variant) {
    case "contact-received":
      return {
        subject: "Thanks for reaching out",
        preview: "Thanks for reaching out. I’ll reply within 48 hours.",
        title: `Thanks for reaching out, ${firstName}`,
        paragraphs: [
          "Your message has landed in my inbox. I read every one personally and will get back to you within 48 hours.",
          "If it’s urgent or you forgot to mention something, just reply to this email and it will come straight to me.",
        ],
        note: "This is an automatic confirmation that your message was received.",
      };

    case "testimonial-received":
      return props.consentToDisplay
        ? {
            subject: "Thanks for your testimonial",
            preview: "I’ve got your testimonial and will review it soon.",
            title: `Thank you, ${firstName}`,
            paragraphs: [
              "Your testimonial has been submitted. I review each one personally before it goes live.",
              "Since you’re happy for it to be shown, it will appear on my site with your name and role once I approve it. I’ll send you another email the moment it’s up.",
            ],
            note: "This is an automatic confirmation that your testimonial was received.",
          }
        : {
            subject: "Thanks for your testimonial",
            preview: "I’ve got your testimonial and it will stay private.",
            title: `Thank you, ${firstName}`,
            paragraphs: [
              "Your testimonial has been submitted, and it means a lot.",
              "You chose not to have it shown publicly, so it will stay private. I’ll read it, but it won’t appear on my site.",
              "Changed your mind? Just reply to this email and I’ll sort it out.",
            ],
            note: "This is an automatic confirmation that your testimonial was received.",
          };

    case "testimonial-approved":
      return props.consentToDisplay
        ? {
            subject: "Your testimonial is live",
            preview:
              "Your testimonial has been approved and is now on my site.",
            title: `It’s live, ${firstName}`,
            paragraphs: [
              "I’ve approved your testimonial and it’s now on my site, shown with your name and role.",
              "Thank you for taking the time to write it.",
            ],
            cta: { label: "See it on the site", href: props.testimonialsUrl },
            note: "This is an automatic notification that your testimonial was approved.",
          }
        : {
            subject: "Your testimonial was approved",
            preview: "Your testimonial was approved and will stay private.",
            title: `Approved, ${firstName}`,
            paragraphs: [
              "I’ve read and approved your testimonial. Thank you for writing it.",
              "As you asked, it won’t be shown on my site. It stays private with me.",
              "If you ever want it displayed, just reply to this email.",
            ],
            note: "This is an automatic notification that your testimonial was approved.",
          };
  }
}

export function getAutoReplySubject(props: AutoReplyEmailProps): string {
  return getCopy(props).subject;
}

export default function AutoReplyEmail(props: AutoReplyEmailProps) {
  const copy = getCopy(props);

  return (
    <ParentEmail preview={copy.preview}>
      <Section>
        <Text className="em-text" style={styles.title}>
          {copy.title}
        </Text>

        {copy.paragraphs.map((paragraph) => (
          <Text key={paragraph} className="em-text" style={styles.text}>
            {paragraph}
          </Text>
        ))}

        {copy.cta ? (
          <Button className="em-btn" href={copy.cta.href} style={styles.button}>
            {copy.cta.label}
          </Button>
        ) : null}

        <Text className="em-text" style={styles.signoff}>
          Talk soon,
          <br />
          {props.senderName}
        </Text>

        <Hr className="em-rule" style={styles.hr} />

        <Text className="em-muted" style={styles.note}>
          {copy.note}
        </Text>
      </Section>
    </ParentEmail>
  );
}

/** Every variant, for the /preview page and test sends. */
export const autoReplyPreviews = {
  "contact-received": {
    variant: "contact-received",
    name: "Amara Okafor",
    senderName: "Osilama",
  },
  "testimonial-received-public": {
    variant: "testimonial-received",
    name: "Amara Okafor",
    senderName: "Osilama",
    consentToDisplay: true,
  },
  "testimonial-received-private": {
    variant: "testimonial-received",
    name: "Amara Okafor",
    senderName: "Osilama",
    consentToDisplay: false,
  },
  "testimonial-approved-public": {
    variant: "testimonial-approved",
    name: "Amara Okafor",
    senderName: "Osilama",
    consentToDisplay: true,
    testimonialsUrl: "https://example.com/about/testimonials",
  },
  "testimonial-approved-private": {
    variant: "testimonial-approved",
    name: "Amara Okafor",
    senderName: "Osilama",
    consentToDisplay: false,
    testimonialsUrl: "https://example.com/about/testimonials",
  },
} satisfies Record<string, AutoReplyEmailProps>;

export type AutoReplyPreviewId = keyof typeof autoReplyPreviews;

// Shown by `bun email:dev`
AutoReplyEmail.PreviewProps = autoReplyPreviews[
  "testimonial-received-public"
] satisfies AutoReplyEmailProps;

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
