import type { ReactElement } from "react";
import AutoReplyEmail, {
  type AutoReplyPreviewId,
  autoReplyPreviews,
  getAutoReplySubject,
} from "./auto-reply-email";
import ContactEmail, {
  type ContactEmailPreviewId,
  contactEmailPreviews,
} from "./contact-email";
import TestimonialEmail, {
  type TestimonialEmailPreviewId,
  testimonialEmailPreviews,
} from "./testimonial-email";

/**
 * Every email the site can send, in one list.
 *
 * The /preview page and the "send test" action both read from here, so a new
 * template or variant only has to be added in this file.
 */
export type EmailTemplateId =
  | ContactEmailPreviewId
  | TestimonialEmailPreviewId
  | AutoReplyPreviewId;

export type EmailGroup = "to-you" | "to-visitor";

export type EmailTemplate = {
  id: EmailTemplateId;
  group: EmailGroup;
  label: string;
  description: string;
  subject: string;
  /** Sender name shown in the simulated mail header. */
  from: string;
  /** Recipient shown in the simulated mail header ("me" for your own inbox). */
  to: string;
  render: () => ReactElement;
};

export const EMAIL_GROUPS: readonly { id: EmailGroup; label: string }[] = [
  { id: "to-you", label: "Sent to you" },
  { id: "to-visitor", label: "Sent to visitors" },
];

const visitor = "Amara Okafor";

export const EMAIL_TEMPLATES: readonly EmailTemplate[] = [
  {
    id: "contact",
    group: "to-you",
    label: "New message",
    description: "Someone used the contact form",
    subject: "New message from Amara Okafor",
    from: "Amara Okafor",
    to: "me",
    render: () => <ContactEmail {...contactEmailPreviews.contact} />,
  },
  {
    id: "contact-urgent",
    group: "to-you",
    label: "New message (urgent)",
    description: "Same, with Urgent ticked",
    subject: "[URGENT] New message from Amara Okafor",
    from: "Amara Okafor",
    to: "me",
    render: () => <ContactEmail {...contactEmailPreviews["contact-urgent"]} />,
  },
  {
    id: "testimonial",
    group: "to-you",
    label: "New testimonial",
    description: "Waiting for approval, public",
    subject: "New testimonial from Amara Okafor (needs approval)",
    from: "Amara Okafor",
    to: "me",
    render: () => (
      <TestimonialEmail {...testimonialEmailPreviews.testimonial} />
    ),
  },
  {
    id: "testimonial-private",
    group: "to-you",
    label: "New testimonial (private)",
    description: "Waiting for approval, keep private",
    subject: "New testimonial from Amara Okafor (needs approval)",
    from: "Amara Okafor",
    to: "me",
    render: () => (
      <TestimonialEmail {...testimonialEmailPreviews["testimonial-private"]} />
    ),
  },
  ...(
    [
      {
        id: "contact-received",
        label: "Message received",
        description: "Auto-reply to the contact form",
      },
      {
        id: "contact-received-urgent",
        label: "Message received (urgent)",
        description: "Auto-reply when Urgent was ticked",
      },
      {
        id: "testimonial-received-public",
        label: "Testimonial received (public)",
        description: "Confirmation, they allow display",
      },
      {
        id: "testimonial-received-private",
        label: "Testimonial received (private)",
        description: "Confirmation, they want it private",
      },
      {
        id: "testimonial-approved-public",
        label: "Testimonial approved (public)",
        description: "Sent from Sanity, now live",
      },
      {
        id: "testimonial-approved-private",
        label: "Testimonial approved (private)",
        description: "Sent from Sanity, stays private",
      },
    ] as const satisfies readonly {
      id: AutoReplyPreviewId;
      label: string;
      description: string;
    }[]
  ).map(
    (item): EmailTemplate => ({
      ...item,
      group: "to-visitor",
      subject: getAutoReplySubject(autoReplyPreviews[item.id]),
      from: autoReplyPreviews[item.id].senderName,
      to: visitor,
      render: () => <AutoReplyEmail {...autoReplyPreviews[item.id]} />,
    }),
  ),
];

export function getEmailTemplate(id: unknown): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find((template) => template.id === id);
}
