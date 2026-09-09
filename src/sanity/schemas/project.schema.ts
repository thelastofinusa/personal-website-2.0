import { defineField, defineType } from "sanity";
import { navLinksData } from "@/constants/navigation";
import { formatDate } from "@/lib/utils";

export const projectTags = [
  "Open Source",
  "Web3",
  "Blockchain",
  "Smart Contracts",
  "AI",
  "LLM",
  "Generative AI",
  "Developer",
  "Developer Tools",
  "CLI",
  "SDK",
  "API",
  "SaaS",
  "E-commerce",
  "Education",
  "UI",
  "UX",
  "Frontend",
  "Backend",
  "Full Stack",
  "React",
  "Next.js",
  "Browser Extension",
] as const;

export const projectSchema = defineType({
  name: "project",
  title: "Projects",
  type: "document",
  icon: navLinksData("/projects")?.icon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Project Name",
    }),
    defineField({
      name: "featured",
      type: "boolean",
      title: "Featured",
      description: "Show this project in the featured projects section.",
      initialValue: false,
    }),
    defineField({
      name: "url",
      type: "url",
      title: "Project Url",
    }),
    defineField({
      name: "embeddable",
      type: "boolean",
      title: "Allow live preview",
      description:
        'Turn this off if the site blocks being shown in an iframe (sends an X-Frame-Options or CSP frame-ancestors header). This skips the preview attempt entirely and shows an "open in new tab" card instead — no failed load, no wasted wait.',
      initialValue: true,
    }),
    defineField({
      name: "mainImage",
      type: "image",
      title: "Main Image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "date",
      type: "datetime",
      title: "When was this project built?",
    }),
    defineField({
      name: "description",
      type: "text",
      title: "A brief about this project",
    }),
    defineField({
      name: "tags",
      type: "array",
      title: "Tags",
      of: [{ type: "string" }],
      options: {
        list: projectTags.map((tag) => ({
          title: tag,
          value: tag,
        })),
      },
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .max(5)
          .error("You can select between 1 and 5 tags"),
    }),
    defineField({
      name: "filters",
      title: "Project Filters",
      type: "array",
      of: [{ type: "reference", to: [{ type: "projectFilter" }] }],
      options: { layout: "tags" },
      validation: (Rule) => Rule.max(3).error("You can add up to 3 filters"),
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "mainImage",
      date: "date",
      featured: "featured",
    },
    prepare({ title, media, date, featured }) {
      return {
        title,
        subtitle: [
          featured ? "✅ Featured" : null,
          date ? formatDate(date) : null,
        ]
          .filter(Boolean)
          .join(" • "),
        media,
      };
    },
  },
});
