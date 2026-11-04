import { defineQuery } from "next-sanity";
import type { TestimonialsListQueryResult } from "~/sanity.types";
import { sanityQuery } from "../lib/fetch";

const testimonialFields = `
  _id,
  name,
  role,
  company,
  rating,
  pinned,
  content,
  "avatar": avatar.asset->url,
  url
`;

const testimonialsListQuery = defineQuery(`
  *[_type == "testimonial"] | order(pinned desc, _createdAt desc) {
    ${testimonialFields}
  }
`);

const pinnedTestimonialsQuery = defineQuery(`
  *[_type == "testimonial" && pinned == true] | order(_createdAt desc) {
    ${testimonialFields}
  }
`);

const query = {
  all: testimonialsListQuery,
  pinned: pinnedTestimonialsQuery,
};

export async function fetchAllTestimonials(): Promise<TestimonialsListQueryResult> {
  return sanityQuery<TestimonialsListQueryResult>({ query: query.all });
}

export async function fetchPinnedTestimonials(): Promise<TestimonialsListQueryResult> {
  return sanityQuery<TestimonialsListQueryResult>({ query: query.pinned });
}
