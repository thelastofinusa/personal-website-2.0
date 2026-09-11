import { History3 } from "reicon-react";
import { defineField, defineType } from "sanity";
import { resolveReicon } from "@/lib/icons";

export const timelineSchema = defineType({
  name: "timeline",
  title: "Timeline",
  type: "document",
  icon: History3,

  fields: [
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Experience", value: "experience" },
          { title: "Education", value: "education" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "organization",
      title: "Organization",
      type: "string",
      description: "Company, university, school, or institution.",
      validation: (Rule) => Rule.required(),
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
      ],
      preview: {
        select: {
          type: "type",
          url: "url",
          image: "image",
        },
        prepare({ type, url, image }) {
          return {
            title: type === "upload" ? "Uploaded logo" : url || "Logo URL",
            media: type === "upload" ? image : undefined,
          };
        },
      },
    }),

    defineField({
      name: "website",
      title: "Website",
      type: "url",
      validation: (Rule) =>
        Rule.uri({
          scheme: ["http", "https"],
        }),
    }),

    defineField({
      name: "isCurrent",
      title: "Current",
      type: "boolean",
      description:
        "Mark this organization as current. This displays the active indicator.",
      initialValue: false,
    }),

    defineField({
      name: "items",
      title: "Timeline Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              description: "Job title, degree, certification, position, etc.",
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: "period",
              title: "Period",
              type: "object",
              fields: [
                defineField({
                  name: "start",
                  title: "Start",
                  type: "date",
                  validation: (Rule) => Rule.required(),
                  options: {
                    dateFormat: "MM.YYYY",
                  },
                }),

                defineField({
                  name: "end",
                  title: "End",
                  type: "date",
                  description:
                    "Leave empty for an ongoing position or education.",
                  options: {
                    dateFormat: "MM.YYYY",
                  },
                }),
              ],

              preview: {
                select: {
                  start: "start",
                  end: "end",
                },
                prepare({ start, end }) {
                  const formatPeriod = (date?: string) => {
                    if (!date) return undefined;

                    return new Intl.DateTimeFormat("en-US", {
                      month: "2-digit",
                      year: "numeric",
                    }).format(new Date(date));
                  };

                  const formattedStart = formatPeriod(start);
                  const formattedEnd = formatPeriod(end);

                  return {
                    title: formattedStart
                      ? formattedEnd
                        ? `${formattedStart} — ${formattedEnd}`
                        : `${formattedStart} — Present`
                      : "No period",
                  };
                },
              },
            }),

            defineField({
              name: "type",
              title: "Type",
              type: "string",
              options: {
                list: [
                  // Experience
                  "Full-time",
                  "Part-time",
                  "Contract",
                  "Freelance",
                  "Internship",
                  "Temporary",
                  "Volunteer",

                  // Education
                  "Degree",
                  "Diploma",
                  "Certificate",
                  "Course",
                  "Bootcamp",
                  "Training",
                ],
                layout: "dropdown",
              },
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: "icon",
              title: "Icon",
              type: "string",
              description:
                "The name of a Reicon icon. Example: Code, GraduationCap, BriefcaseBusiness.",
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: "description",
              title: "Description",
              type: "blockContent",
              description:
                "Describe the role, education, responsibilities, achievements, or highlights.",
            }),

            defineField({
              name: "skills",
              title: "Skills",
              type: "array",
              of: [{ type: "string" }],
              options: {
                layout: "tags",
              },
            }),

            defineField({
              name: "isExpanded",
              title: "Expanded by Default",
              type: "boolean",
              initialValue: false,
            }),
          ],

          preview: {
            select: {
              title: "title",
              type: "type",
              icon: "icon",
              start: "period.start",
              end: "period.end",
            },
            prepare({ title, type, icon, start, end }) {
              return {
                title,
                subtitle: [
                  type,
                  icon ? `Icon: ${icon}` : undefined,
                  end ? `${start} — ${end}` : `${start} — Present`,
                ]
                  .filter(Boolean)
                  .join(" · "),
                media: resolveReicon(icon),
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),
  ],

  preview: {
    select: {
      title: "organization",
      media: "logo",
      category: "category",
      isCurrent: "isCurrent",
    },
    prepare({ title, media, category, isCurrent }) {
      return {
        title,
        subtitle: [
          category === "education" ? "Education" : "Experience",
          isCurrent ? "Current" : undefined,
        ]
          .filter(Boolean)
          .join(" · "),
        media,
      };
    },
  },
});
