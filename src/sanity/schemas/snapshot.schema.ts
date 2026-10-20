import { GalleryWide } from "reicon-react";
import { defineField, defineType } from "sanity";

export const snapshotSchema = defineType({
  name: "snapshot",
  title: "Snapshots",
  type: "document",
  icon: GalleryWide,
  fields: [
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      description: "Photos you want to display on the about page",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
      options: {
        layout: "list",
      },
      validation: (Rule) => Rule.max(5),
    }),
  ],
  preview: {
    select: {
      firstImage: "images.0",
    },
    prepare({ firstImage }) {
      return {
        title: "Snapshots",
        media: firstImage,
      };
    },
  },
});
