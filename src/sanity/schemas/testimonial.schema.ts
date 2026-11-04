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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      description: "e.g. Engineering Lead, Founder",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "company",
      title: "Company",
      type: "string",
      description: "Optional company name.",
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      description: "Rating score between 1 and 5 (e.g. 5.0, 4.9)",
      validation: (Rule) => Rule.required().min(1).max(5),
      initialValue: 5,
    }),
    defineField({
      name: "pinned",
      title: "Pin to top",
      type: "boolean",
      description: "Pin this testimonial to feature it on the About page.",
      initialValue: false,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "text",
      description: "The testimonial text/quote.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "avatar",
      title: "Avatar / Image",
      type: "image",
      description: "Optional profile picture or logo.",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      description: "Optional link when clicking the testimonial card.",
      validation: (Rule) =>
        Rule.uri({
          scheme: ["http", "https"],
        }),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      company: "company",
      rating: "rating",
      pinned: "pinned",
      media: "avatar",
    },
    prepare({ title, subtitle, company, rating, pinned, media }) {
      return {
        title,
        subtitle: [
          pinned && "📌 Pinned",
          subtitle,
          company ? `at ${company}` : null,
          rating ? `★ ${rating}` : null,
        ]
          .filter(Boolean)
          .join(" • "),
        media,
      };
    },
  },
});
