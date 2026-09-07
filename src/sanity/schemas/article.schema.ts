import { defineField, defineType } from "sanity";
import { navLinksData } from "@/constants/navigation";

export const articleSchema = defineType({
  name: "article",
  title: "Articles",
  type: "document",
  icon: navLinksData("/articles")?.icon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "mainImage",
      title: "Main image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "pinned",
      title: "Pin to top",
      type: "boolean",
      initialValue: false,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Article Content",
      type: "blockContent",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      pinned: "pinned",
      media: "mainImage",
    },
    prepare(selection) {
      const { pinned } = selection;
      return { ...selection, subtitle: pinned && "Article pinned to top ✅" };
    },
  },
});
