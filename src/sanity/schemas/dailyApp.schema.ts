import { Router3 } from "reicon-react";
import { defineField, defineType } from "sanity";
import { resolveReicon } from "@/lib/icons";

export const dailyAppSchema = defineType({
  name: "dailyApp",
  title: "Daily Apps",
  type: "document",
  icon: Router3,

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
      type: "text",
    }),

    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (Rule) =>
        Rule.uri({
          scheme: ["http", "https"],
        }),
    }),

    defineField({
      name: "logo",
      title: "Logo",
      type: "object",
      description: "Choose a logo, either upload, add image url or Reicon",
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

      options: {
        collapsible: true,
        collapsed: false,
      },

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

    // Button configuration
    defineField({
      name: "button",
      title: "Button",
      type: "object",
      description: "Customize the action button shown for this app.",
      fields: [
        defineField({
          name: "label",
          title: "Label",
          type: "string",
          description: 'Optional. Defaults to "Launch App" when left empty.',
          validation: (Rule) => Rule.max(30),
        }),

        defineField({
          name: "backgroundColor",
          title: "Background Color",
          type: "color",
          description: "Background color of the action button.",
        }),

        defineField({
          name: "textColor",
          title: "Text Color",
          type: "color",
          description: "Text color of the action button.",
        }),
      ],

      options: {
        collapsible: true,
        collapsed: false,
      },
    }),
  ],

  preview: {
    select: {
      title: "name",
      subtitle: "description",
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
