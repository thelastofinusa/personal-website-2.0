"use client"

import { useState } from "react"
import Image from "next/image"
import Lightbox from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import Captions from "yet-another-react-lightbox/plugins/captions"
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails"
import "yet-another-react-lightbox/styles.css"
import "yet-another-react-lightbox/plugins/captions.css"
import "yet-another-react-lightbox/plugins/thumbnails.css"

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

  const slides = images.map((img) => ({
    src: img.image,
    alt: img.alt,
    width: img.width,
    height: img.height,
    description: img.alt, // optional, for toolbar
  }))

  return (
    <>
      <div className="mt-2 columns-2 gap-3 sm:columns-3">
        {images.map((img, index) => (
          <div
            key={img._key}
            className="group mb-4 cursor-pointer break-inside-avoid overflow-hidden border bg-background text-foreground sm:rounded-xl sm:shadow-xl sm:squircle dark:bg-muted"
            onClick={() => {
              setPhotoIndex(index)
              setLightboxOpen(true)
            }}
          >
            <Image
              src={img.image}
              alt={img.alt}
              width={img.width}
              height={img.height}
              quality={100}
              priority={index < 4}
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
        plugins={[Zoom, Captions, Thumbnails]}
        carousel={{ finite: images.length <= 1 }}
        zoom={{ maxZoomPixelRatio: 3 }}
        captions={{ showToggle: false }} // always show captions
      />
    </>
  )
}
