import { defineField, defineType } from "sanity"
import { RiGalleryFill } from "react-icons/ri"

export const galleryType = defineType({
  name: "gallery",
  title: "Gallery",
  type: "document",
  icon: RiGalleryFill,
  fields: [
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      description:
        "Upload images for this gallery. These will be displayed in a masonry-style layout on the frontend.",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              description:
                "Short description of the image for accessibility and SEO.",
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.min(1).warning("Add at least one image"),
    }),
  ],
  preview: {
    select: {
      title: "images.0.alt",
      media: "images.0",
      imagesCount: "images",
    },
    prepare({ title, media, imagesCount }) {
      const count = imagesCount?.length || 0
      return {
        title: title || "Untitled Gallery",
        subtitle: `${count} image${count === 1 ? "" : "s"}`,
        media,
      }
    },
  },
})
