import { defineQuery } from "next-sanity";
import type { TestimonialsListQueryResult } from "~/sanity.types";
import { sanityQuery } from "../lib/fetch";

const testimonialFields = `
  _id,
  name,
  role,
  company,
  rating,
  approve,
  content,
  url
`;

// Filters strictly for testimonials where approve is true
const testimonialsListQuery = defineQuery(`
  *[_type == "testimonial" && approve == true] | order(_createdAt desc) {
    ${testimonialFields}
  }
`);

// Filters strictly for approved testimonials, orders by newest first, and slices the first 6
const latestTestimonialsQuery = defineQuery(`
  *[_type == "testimonial" && approve == true] | order(_createdAt desc)[0...5] {
    ${testimonialFields}
  }
`);

const query = {
  all: testimonialsListQuery,
  latest: latestTestimonialsQuery,
};

export async function fetchAllTestimonials(): Promise<TestimonialsListQueryResult> {
  return sanityQuery<TestimonialsListQueryResult>({ query: query.all });
}

export async function fetchLatestTestimonials(): Promise<TestimonialsListQueryResult> {
  return sanityQuery<TestimonialsListQueryResult>({ query: query.latest });
}
