import { DocumentFilter } from "reicon-react";
import { defineField, defineType } from "sanity";
import { resolveReicon } from "@/lib/icons";

export const projectFilterSchema = defineType({
  name: "projectFilter",
  title: "Project Filters",
  type: "document",
  icon: DocumentFilter,

  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "value",
      title: "Value",
      type: "slug",
      options: {
        source: "name",
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "string",
    }),

    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description: "The name of a Reicon icon.",
      validation: (Rule) => Rule.required(),
    }),
  ],

  preview: {
    select: {
      title: "name",
      subtitle: "description",
      icon: "icon",
    },

    prepare({ title, subtitle, icon }) {
      return {
        title,
        subtitle,
        media: resolveReicon(icon),
      };
    },
  },
});
