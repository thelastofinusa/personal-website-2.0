import { SUPPORTED_LANGUAGES } from "@sanity/code-input";
import {
  DEFAULT_ANNOTATIONS,
  DEFAULT_DECORATORS,
  defineArrayMember,
  defineField,
  defineType,
} from "sanity";

export const blockContentType = defineType({
  name: "blockContent",
  title: "Block Content",
  type: "array",

  of: [
    // ─────────────────────────────────────────────
    // Rich Text
    // ─────────────────────────────────────────────

    defineArrayMember({
      type: "block",

      styles: [
        {
          title: "Normal",
          value: "normal",
        },
        {
          title: "H1",
          value: "h1",
        },
        {
          title: "H2",
          value: "h2",
        },
        {
          title: "H3",
          value: "h3",
        },
        {
          title: "H4",
          value: "h4",
        },
        {
          title: "Quote",
          value: "blockquote",
        },
      ],

      lists: [
        {
          title: "Bullet",
          value: "bullet",
        },
        {
          title: "Numbered",
          value: "number",
        },
      ],

      marks: {
        // Keep Sanity's default decorators.
        decorators: [...DEFAULT_DECORATORS],

        // Keep Sanity's default annotations.
        annotations: [
          ...DEFAULT_ANNOTATIONS,

          // Custom link annotation.
          {
            name: "link",
            title: "Link",
            type: "object",

            fields: [
              defineField({
                name: "href",
                title: "URL",
                type: "url",

                validation: (Rule) =>
                  Rule.required().uri({
                    allowRelative: true,
                    scheme: ["http", "https", "mailto", "tel"],
                  }),
              }),

              defineField({
                name: "blank",
                title: "Open in new tab",
                type: "boolean",
                initialValue: true,
              }),
            ],

            preview: {
              select: {
                title: "href",
              },
            },
          },
        ],
      },
    }),

    // ─────────────────────────────────────────────
    // Image
    // ─────────────────────────────────────────────

    defineArrayMember({
      name: "image",
      title: "Image",
      type: "image",

      options: {
        hotspot: true,
      },

      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",
          description:
            "Describe the image for screen readers and accessibility.",
          validation: (Rule) => Rule.required(),
        }),

        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
          description: "Optional caption displayed below the image.",
        }),
      ],

      preview: {
        select: {
          title: "caption",
          media: "asset",
          alt: "alt",
        },

        prepare({ title, media, alt }) {
          return {
            title: title || alt || "Image",
            subtitle: alt ? `Alt: ${alt}` : undefined,
            media,
          };
        },
      },
    }),

    // ─────────────────────────────────────────────
    // Code Block
    // ─────────────────────────────────────────────

    defineArrayMember({
      type: "code",
      title: "Code",

      options: {
        language: "typescript",
        languageAlternatives: SUPPORTED_LANGUAGES,
        withFilename: true,
      },
    }),

    // ─────────────────────────────────────────────
    // YouTube
    // ─────────────────────────────────────────────

    defineArrayMember({
      name: "youtube",
      title: "YouTube Video",
      type: "object",

      fields: [
        defineField({
          name: "url",
          title: "YouTube URL",
          type: "url",

          validation: (Rule) =>
            Rule.required().uri({
              scheme: ["http", "https"],
            }),
        }),

        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
        }),
      ],

      preview: {
        select: {
          title: "url",
          subtitle: "caption",
        },

        prepare({ title, subtitle }) {
          return {
            title: "YouTube Video",
            subtitle: subtitle || title,
          };
        },
      },
    }),

    // ─────────────────────────────────────────────
    // Divider
    // ─────────────────────────────────────────────

    defineArrayMember({
      name: "divider",
      title: "Divider",
      type: "object",

      // Sanity requires object types to have at least one field.
      // This hidden field gives the object a valid schema
      // without adding anything to the Studio UI.
      fields: [
        defineField({
          name: "type",
          title: "Type",
          type: "string",
          hidden: true,
          initialValue: "divider",
        }),
      ],

      preview: {
        prepare() {
          return {
            title: "Divider",
          };
        },
      },
    }),
  ],
});
