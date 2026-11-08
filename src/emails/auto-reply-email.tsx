import { Link, Text } from "@react-email/components";
import ParentEmail from "./parent";
import { emailStyles as s } from "./theme";

/**
 * The one template every visitor-facing email uses.
 *
 *   contact-received      contact form submitted (supports urgent flag)
 *   testimonial-received  testimonial submitted (copy depends on consent)
 *   testimonial-approved  you approved it in Sanity (copy depends on consent)
 *
 * Only the words change. It always reads like a short personal email:
 * greeting, a few paragraphs, a sign-off and one small note.
 */
export type AutoReplyEmailProps =
  | {
      variant: "contact-received";
      name: string;
      senderName: string;
      urgent?: boolean;
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
      /** Where the "see it live" link points. */
      testimonialsUrl: string;
    };

type Copy = {
  subject: string;
  preview: string;
  paragraphs: string[];
  link?: { label: string; href: string };
  note: string;
};

function getCopy(props: AutoReplyEmailProps): Copy {
  switch (props.variant) {
    case "contact-received":
      return props.urgent
        ? {
            subject: "Thanks for reaching out (Urgent)",
            preview:
              "I've received your urgent message and will get back to you shortly.",
            paragraphs: [
              "Thanks for reaching out. Your urgent message has landed directly at the top of my inbox, and I’ll review it and get back to you as soon as possible.",
              "If you need to add anything else, just reply directly to this email.",
            ],
            note: "This is an automatic confirmation that your urgent message was received.",
          }
        : {
            subject: "Thanks for reaching out",
            preview: "Thanks for reaching out. I’ll reply within 48 hours.",
            paragraphs: [
              "Thanks for reaching out. Your message has landed in my inbox. I read every one personally and will get back to you within 48 hours.",
              "If it’s urgent or you forgot to mention something, just reply to this email and it will come straight to me.",
            ],
            note: "This is an automatic confirmation that your message was received.",
          };

    case "testimonial-received":
      return props.consentToDisplay
        ? {
            subject: "Thanks for your testimonial",
            preview: "I’ve got your testimonial and will review it soon.",
            paragraphs: [
              "Thank you for your testimonial. I review each one personally before it goes live.",
              "Since you’re happy for it to be shown, it will appear on my site with your name and role once I approve it. I’ll send you another email the moment it’s up.",
            ],
            note: "This is an automatic confirmation that your testimonial was received.",
          }
        : {
            subject: "Thanks for your testimonial",
            preview: "I’ve got your testimonial and it will stay private.",
            paragraphs: [
              "Thank you for your testimonial, it means a lot.",
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
            paragraphs: [
              "Good news: I’ve approved your testimonial and it’s now live on my site, shown with your name and role.",
              "Thank you for taking the time to write it.",
            ],
            link: { label: "See it on the site", href: props.testimonialsUrl },
            note: "This is an automatic notification that your testimonial was approved.",
          }
        : {
            subject: "Your testimonial was approved",
            preview: "Your testimonial was approved and will stay private.",
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
  const firstName = props.name.trim().split(" ")[0];

  return (
    <ParentEmail preview={copy.preview}>
      <Text className="em-text" style={s.p}>
        Hi {firstName},
      </Text>

      {copy.paragraphs.map((paragraph) => (
        <Text key={paragraph} className="em-text" style={s.p}>
          {paragraph}
        </Text>
      ))}

      {copy.link ? (
        <Text className="em-text" style={s.p}>
          <Link className="em-link" href={copy.link.href} style={s.link}>
            {copy.link.label}
          </Link>
        </Text>
      ) : null}

      <Text className="em-text" style={s.signoff}>
        Best,
        <br />
        {props.senderName}
      </Text>

      <Text className="em-muted" style={s.footnote}>
        {copy.note}
      </Text>
    </ParentEmail>
  );
}

/** Every variant, for the /preview page and test sends. */
export const autoReplyPreviews = {
  "contact-received": {
    variant: "contact-received",
    name: "Amara Okafor",
    senderName: "Osilama",
    urgent: false,
  },
  "contact-received-urgent": {
    variant: "contact-received",
    name: "Amara Okafor",
    senderName: "Osilama",
    urgent: true,
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
