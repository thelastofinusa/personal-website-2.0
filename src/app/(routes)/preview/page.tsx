import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmailPreview } from "./email-preview";

export const metadata: Metadata = {
  title: "Email preview",
  robots: { index: false, follow: false },
};

export default function EmailPreviewPage() {
  // Dev-only tool. Vercel preview and production builds both use NODE_ENV=production.
  if (process.env.NODE_ENV === "production") notFound();

  return <EmailPreview />;
}
