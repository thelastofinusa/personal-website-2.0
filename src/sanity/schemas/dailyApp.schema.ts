import { Cpu3 } from "reicon-react";
import { defineField, defineType } from "sanity";
import { resolveReicon } from "@/lib/icons";

export const dailyAppSchema = defineType({
  name: "dailyApp",
  title: "Daily Apps",
  type: "document",
  icon: Cpu3,

  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Productivity", value: "Productivity" },
          { title: "Developer Tools", value: "Developer Tools" },
          { title: "Design & Creative", value: "Design & Creative" },
          { title: "Utilities", value: "Utilities" },
          { title: "AI", value: "AI" },
          { title: "Finance", value: "Finance" },
          { title: "Business", value: "Business" },
          { title: "Education", value: "Education" },
          { title: "Entertainment", value: "Entertainment" },
          { title: "Social & Communication", value: "Social & Communication" },
          { title: "Photography & Video", value: "Photography & Video" },
          { title: "Audio & Music", value: "Audio & Music" },
          { title: "Writing", value: "Writing" },
          { title: "Security", value: "Security" },
          { title: "System & Customization", value: "System & Customization" },
          { title: "Internet & Browsers", value: "Internet & Browsers" },
          { title: "Games", value: "Games" },
          { title: "Lifestyle", value: "Lifestyle" },
          { title: "Other", value: "Other" },
        ],
        layout: "dropdown",
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "string",
    }),

    defineField({
      name: "logo",
      title: "Logo",
      type: "object",
      fields: [
        defineField({
          name: "type",
          title: "Logo Source",
          type: "string",
          options: {
            list: [
              { title: "URL", value: "url" },
              { title: "Upload", value: "upload" },
              { title: "Icon", value: "icon" },
            ],
            layout: "radio",
          },
          initialValue: "url",
        }),

        defineField({
          name: "url",
          title: "Logo URL",
          type: "url",
          hidden: ({ parent }) => parent?.type !== "url",
          validation: (Rule) =>
            Rule.uri({
              scheme: ["http", "https"],
            }),
        }),

        defineField({
          name: "image",
          title: "Logo Image",
          type: "image",
          options: {
            hotspot: true,
          },
          hidden: ({ parent }) => parent?.type !== "upload",
        }),

        defineField({
          name: "icon",
          title: "Logo Icon",
          type: "string",
          description:
            "The name of a Reicon icon. Example: Code, GraduationCap, BriefcaseBusiness.",
          hidden: ({ parent }) => parent?.type !== "icon",
        }),
      ],
      preview: {
        select: {
          type: "type",
          url: "url",
          image: "image",
          icon: "icon",
        },
        prepare({ type, url, image, icon }) {
          return {
            title:
              type === "upload"
                ? "Uploaded logo"
                : type === "icon"
                  ? icon || "Logo Icon"
                  : url || "Logo URL",
            media:
              type === "icon"
                ? resolveReicon(icon)
                : type === "upload"
                  ? image
                  : undefined,
          };
        },
      },
    }),

    defineField({
      name: "url",
      title: "Url",
      type: "url",
      validation: (Rule) =>
        Rule.uri({
          scheme: ["http", "https"],
        }),
    }),
  ],

  preview: {
    select: {
      title: "name",
      subtitle: "description",

      // Correct path: icon is inside logo
      logoType: "logo.type",
      logoUrl: "logo.url",
      logoImage: "logo.image",
      logoIcon: "logo.icon",
    },

    prepare({ title, subtitle, logoType, logoUrl, logoImage, logoIcon }) {
      return {
        title: title || "Untitled Daily App",
        subtitle: subtitle || "",

        media:
          logoType === "icon"
            ? resolveReicon(logoIcon)
            : logoType === "upload"
              ? logoImage
              : undefined,
      };
    },
  },
});
