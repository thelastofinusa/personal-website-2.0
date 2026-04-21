import { DocumentTextIcon } from "@sanity/icons"
import { defineField, defineType } from "sanity"

export const projectType = defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "name",
      title: "Project Name",
      type: "string",
      description: "The display name of the project shown in lists and UI.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "URL-friendly identifier generated from the project name.",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description:
        "A short summary of the project. Supports markdown-style formatting in the frontend.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured Project",
      type: "boolean",
      description:
        "Mark this project as featured to highlight it in the featured section.",
      initialValue: false,
    }),
    defineField({
      name: "url",
      title: "Project URL",
      type: "url",
      description:
        "External link to the project (GitHub, live site, documentation, etc.).",
      validation: (Rule) =>
        Rule.uri({
          scheme: ["http", "https"],
        }),
    }),
  ],
  preview: {
    select: {
      title: "name",
      featured: "featured",
    },
    prepare({ title, featured }) {
      return {
        title,
        subtitle: featured ? "Featured project" : "Project",
      }
    },
  },
})
