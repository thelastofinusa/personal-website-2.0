import { useToast } from "@sanity/ui/toast";
import React from "react";
import { type DocumentActionComponent, useClient } from "sanity";
import { apiVersion } from "../env";

type PublishedTestimonial = {
  approve?: boolean;
  approvalEmailSentAt?: string;
} | null;

/**
 * "Send approval email" button in the document menu of a testimonial.
 *
 * It only stamps approvalEmailRequestedAt on the PUBLISHED document. The
 * Sanity webhook sees that change and calls /api/webhooks/testimonial-approved,
 * which sends the email. Only a signed-in Studio editor can write this field.
 */
export const sendApprovalEmailAction: DocumentActionComponent = (props) => {
  const client = useClient({ apiVersion });
  const toast = useToast();
  const [busy, setBusy] = React.useState(false);

  if (props.type !== "testimonial") return null;

  const published = props.published as PublishedTestimonial;
  const alreadySent = Boolean(published?.approvalEmailSentAt);

  let hint: string | undefined;
  if (!published) hint = "Publish this testimonial first.";
  else if (!published.approve) hint = "Turn on Approve and publish first.";

  return {
    label: busy
      ? "Sending..."
      : alreadySent
        ? "Resend approval email"
        : "Send approval email",
    tone: "positive",
    disabled: busy || Boolean(hint),
    title: hint,
    onHandle: async () => {
      setBusy(true);

      try {
        await client
          .patch(props.id) // props.id is the published id
          .set({ approvalEmailRequestedAt: new Date().toISOString() })
          .commit();

        toast.push({
          status: "success",
          title: "Approval email requested",
          description:
            "It sends in a few seconds. 'Approval email sent at' fills in once it goes out.",
        });
      } catch (error) {
        toast.push({
          status: "error",
          title: "Couldn't request the email",
          description: error instanceof Error ? error.message : undefined,
        });
      } finally {
        setBusy(false);
        props.onComplete();
      }
    },
  };
};
