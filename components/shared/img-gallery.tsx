import { sanityFetch } from "@/sanity/lib/live"
import { QUERY_GALLERY } from "@/sanity/lib/queries"
import Image from "next/image"

export const ImgGallery = async () => {
  const { data: gallery } = await sanityFetch({
    query: QUERY_GALLERY,
  })

  return (
    <div className="mt-2 columns-2 gap-4 sm:columns-3">
      {gallery?.images?.map((img) => (
        <div
          key={img.alt || img.image || img._key}
          className="group mb-4 break-inside-avoid overflow-hidden sm:rounded-xl sm:border sm:shadow-xl sm:squircle"
        >
          <Image
            src={img.image || "/placeholder.svg"}
            alt={img.alt || ""}
            width={880}
            height={200}
            loading="lazy"
            priority={false}
            className="h-auto object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-80"
          />
        </div>
      ))}
    </div>
  )
}
