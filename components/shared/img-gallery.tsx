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
          key={img.alt || img.caption || img.image || img._key}
          className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border squircle"
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

/**
 *  <div
              key={item._id}
              onClick={() => setSelectedIndex(index)}
              className="group bg-background/5 border-border/20 relative mb-3 w-full cursor-pointer break-inside-avoid-column overflow-hidden border shadow-xs sm:mb-4 md:mb-5"
            >
              <Image
                src={item.image || "/placeholder.svg"}
                alt=""
                width={880}
                height={200}
                loading="lazy"
                priority={false}
                className="h-auto object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-80"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-b from-transparent via-black/20 to-black/70 p-4 duration-500 sm:p-6 md:px-8">
                <span className="text-background mb-1 text-xs font-medium tracking-widest uppercase md:mb-2 md:text-sm">
                  {item.category?.name?.replace("-", " ")}
                </span>
              </div>
            </div>
 */
