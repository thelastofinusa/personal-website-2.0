import { defineQuery } from "next-sanity"

export const QUERY_FEATURED_PROJECTS = defineQuery(`
  *[_type == "project" && featured == true] | order(_createdAt asc){
    _id,
    name,
    "slug": slug.current,
    description,
    featured,
    url,
    order
  }
`)

export const QUERY_ALL_PROJECTS = defineQuery(`
  *[_type == "project"] | order(order asc){
    _id,
    name,
    "slug": slug.current,
    description,
    featured,
    url,
    order
  }
`)

export const QUERY_GALLERY = defineQuery(`
 *[_type == "gallery"][0]{
    images[]{
      _key,
      "image": asset->url,
      alt,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height,
    }
  }
`)
