import { SquareShare } from "reicon-react";
import { defineField, defineType } from "sanity";
import { resolveIcon } from "@/lib/icons";

export const articleUrlSchema = defineType({
  name: "articleUrl",
  title: "Article Urls",
  type: "document",
  icon: SquareShare,

  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "url",
      title: "Url",
      type: "url",
    }),
  ],

  preview: {
    select: {
      title: "name",
      subtitle: "url",
    },

    prepare({ title, subtitle }) {
      return {
        title,
        subtitle,
        media: resolveIcon(String(title).toLowerCase()),
      };
    },
  },
});
