import { Link, Text } from "@react-email/components";
import { siteConfig } from "@/config/site.config";
import ParentEmail from "./parent";
import { emailStyles as s } from "./theme";

export interface TestimonialEmailProps {
  _id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  content: string;
  rating: number;
  url?: string;
  consentToDisplay: boolean;
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
  consentToDisplay,
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
      <Text className="em-text" style={s.p}>
        <strong>{name}</strong> ({role}
        {company ? `, ${company}` : ""}) sent you a testimonial and rated you{" "}
        {rating} out of 5:
      </Text>

      <Text className="em-text" style={s.message}>
        {content}
      </Text>

      <Text className="em-text" style={s.p}>
        It&apos;s waiting for your approval.{" "}
        <Link className="em-link" href={studioUrl} style={s.link}>
          Approve it in Sanity
        </Link>
        .
      </Text>

      <Text className="em-muted" style={s.small}>
        Email:{" "}
        <Link className="em-link" href={`mailto:${email}`} style={s.link}>
          {email}
        </Link>
        <br />
        {url ? (
          <>
            Site:{" "}
            <Link className="em-link" href={url} style={s.link}>
              {url}
            </Link>
            <br />
          </>
        ) : null}
        Display: {consentToDisplay ? "Allowed on the site" : "Keep private"}
      </Text>

      <Text className="em-muted" style={s.footnote}>
        Received {received} (WAT). This testimonial was saved with{" "}
        <strong>approve = false</strong>. Toggle &quot;Approve Testimonial&quot;
        in Sanity and click Publish. The author gets an email automatically.
        {consentToDisplay
          ? ""
          : " They chose to keep it private, so it will not appear on the site."}
      </Text>
    </ParentEmail>
  );
}

const base = {
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
} satisfies Omit<TestimonialEmailProps, "consentToDisplay">;

export const testimonialEmailPreviews = {
  testimonial: { ...base, consentToDisplay: true },
  "testimonial-private": { ...base, consentToDisplay: false },
} satisfies Record<string, TestimonialEmailProps>;

export type TestimonialEmailPreviewId = keyof typeof testimonialEmailPreviews;

// Shown by `bun email:dev`
TestimonialEmail.PreviewProps = testimonialEmailPreviews[
  "testimonial"
] satisfies TestimonialEmailProps;
