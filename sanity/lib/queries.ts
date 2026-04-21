import { defineQuery } from "next-sanity"

export const QUERY_FEATURED_PROJECTS = defineQuery(`
  *[_type == "project" && featured == true] | order(_createdAt asc){
    name,
    "slug": slug.current,
    description,
    featured,
    url
  }
`)

export const QUERY_ALL_PROJECTS = defineQuery(`
  *[_type == "project"] | order(_createdAt asc){
    name,
    "slug": slug.current,
    description,
    featured,
    url
  }
`)

export const QUERY_GALLERY = defineQuery(`
  *[_type == "gallery"][0]{
    images[]{
      _key,
      caption,
      "image": asset->url,
      alt
    }
  }
`)
