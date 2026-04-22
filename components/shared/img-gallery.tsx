import { sanityFetch } from "@/sanity/lib/live"
import { QUERY_GALLERY } from "@/sanity/lib/queries"
import { ImgGalleryClient } from "./img-gallery-client"

export const ImgGallery = async () => {
  const { data: gallery } = await sanityFetch({
    query: QUERY_GALLERY,
  })

  return (
    <ImgGalleryClient
      images={
        gallery?.images as {
          _key: string
          image: string
          alt: string
          width: number
          height: number
        }[]
      }
    />
  )
}
