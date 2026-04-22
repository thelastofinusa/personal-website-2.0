"use client"

import { useState } from "react"
import Image from "next/image"
import Lightbox from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails"
import "yet-another-react-lightbox/styles.css"

interface ImgGalleryClientProps {
  images: Array<{
    _key: string
    image: string
    alt: string
    width: number
    height: number
  }>
}

export const ImgGalleryClient = ({ images }: ImgGalleryClientProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)

  // Prepare slides for the lightbox
  const slides = images.map((img) => ({
    src: img.image,
    alt: img.alt,
    width: img.width,
    height: img.height,
  }))

  return (
    <>
      <div className="mt-2 columns-2 gap-3 sm:columns-3">
        {images?.map((img, index) => (
          <div
            key={img._key}
            className="group mb-4 cursor-pointer break-inside-avoid overflow-hidden border bg-muted text-foreground sm:rounded-xl sm:shadow-xl sm:squircle"
            onClick={() => {
              setPhotoIndex(index)
              setLightboxOpen(true)
            }}
          >
            <Image
              src={img.image || "/placeholder.svg"}
              alt={img.alt || ""}
              width={img.width}
              height={img.height}
              loading="lazy"
              className="h-auto w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
            />
          </div>
        ))}
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={photoIndex}
        slides={slides}
        plugins={[Zoom]}
        carousel={{ finite: images.length <= 1 }}
        zoom={{ maxZoomPixelRatio: 3 }}
      />
    </>
  )
}
