import { defineField, defineType } from "sanity";
import { navLinksData } from "@/constants/navigation";

export const testimonialSchema = defineType({
  name: "testimonial",
  title: "Testimonials",
  type: "document",
  icon: navLinksData("/about/testimonials")?.icon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      readOnly: process.env.NODE_ENV === "production",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      description: "Client email address.",
      readOnly: process.env.NODE_ENV === "production",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      description: "e.g. Engineering Lead, Founder",
      readOnly: process.env.NODE_ENV === "production",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "company",
      title: "Company",
      type: "string",
      description: "Optional company name.",
      readOnly: process.env.NODE_ENV === "production",
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      description: "Rating score between 1 and 5 (e.g. 5.0, 4.9)",
      readOnly: process.env.NODE_ENV === "production",
      validation: (Rule) => Rule.required().min(1).max(5),
      initialValue: 5,
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "text",
      description: "The testimonial text/quote.",
      readOnly: process.env.NODE_ENV === "production",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      description: "Optional link when clicking the testimonial card.",
      readOnly: process.env.NODE_ENV === "production",
      validation: (Rule) =>
        Rule.uri({
          scheme: ["http", "https"],
        }),
    }),
    defineField({
      name: "consentToDisplay",
      title: "Consent to Display",
      type: "boolean",
      description: "User agreed to show this on the site",
      initialValue: false,
      validation: (Rule) =>
        Rule.required().error("You must agree to show this on the site."),
    }),
    defineField({
      name: "approve",
      title: "Approve Testimonial",
      type: "boolean",
      description: "Approve testimonial to show on website",
      initialValue: false,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      company: "company",
      rating: "rating",
      approve: "approve",
      email: "email",
      consentToDisplay: "consentToDisplay",
    },
    prepare({ title, subtitle, company, rating, approve, consentToDisplay }) {
      return {
        title: [
          title,
          approve ? "✅" : null,
          consentToDisplay ? " - Consent" : null,
        ]
          .filter(Boolean)
          .join(" "),
        subtitle: [
          subtitle,
          company ? `at ${company}` : null,
          rating ? `★ ${rating}` : null,
        ]
          .filter(Boolean)
          .join(" • "),
      };
    },
  },
});
