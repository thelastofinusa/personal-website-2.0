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
  *[_type == "testimonial" && approve == true] | order(_createdAt desc)[0...6] {
    ${testimonialFields}
  }
`);

const query = {
  all: testimonialsListQuery,
  latest: latestTestimonialsQuery,
};

// const testimonials: TestimonialsListQueryResult = [
//   {
//     _id: "testimonial-1",
//     approve: true,
//     company: "Apex Labs",
//     content:
//       "Osilama delivered exceptional work on our frontend architecture. His attention to detail with type safety, clean code, and UI performance made a massive difference in our shipping speed.",
//     name: "Marcus Vance",
//     rating: 5,
//     role: "Product Manager",
//     url: null,
//   },
//   {
//     _id: "testimonial-2",
//     approve: true,
//     company: "Nexus Protocol",
//     content:
//       "Working with him was a breeze. He took complex Web3 mechanics and abstracted them into seamless UI patterns that our users genuinely enjoy using.",
//     name: "Elena Rostova",
//     rating: 5,
//     role: "Lead Blockchain Architect",
//     url: null,
//   },
//   {
//     _id: "testimonial-3",
//     approve: true,
//     company: "Studio Craft",
//     content:
//       "Top-tier developer experience and great communication. The custom component library he built for us cut our feature implementation time in half.",
//     name: "David Chen",

//     rating: 4.9,
//     role: "Design Director",
//     url: "https://example.com",
//   },
//   {
//     _id: "testimonial-4",
//     approve: true,
//     company: "Vanguard Tech",
//     content:
//       "Extremely reliable engineer. He transformed our messy Next.js codebase into a clean, maintainable, and highly responsive web application.",
//     name: "Sarah Jenkins",

//     rating: 5,
//     role: "VP of Engineering",
//     url: "https://example.com",
//   },
//   {
//     _id: "testimonial-5",
//     approve: true,
//     company: "Pulse Media",
//     content:
//       "Not only is he proficient with modern tools like Next.js and Tailwind, but his problem-solving skills and independent drive are outstanding.",
//     name: "Amara Okezie",

//     rating: 4.8,
//     role: "Founder & CEO",
//     url: "https://example.com",
//   },
//   {
//     _id: "testimonial-6",
//     approve: true,
//     company: "Flow State Interactive",
//     content:
//       "The level of polish on user interfaces is top class. Micro-interactions, crisp responsiveness, and solid TypeScript architecture across the board.",
//     name: "Liam Thorne",

//     rating: 5,
//     role: "Senior UX Engineer",
//     url: "https://example.com",
//   },
//   {
//     _id: "testimonial-7",
//     approve: true,
//     company: "Hyperion Systems",
//     content:
//       "He onboarded quickly, understood the project requirements with zero hand-holding, and delivered a production-ready dApp frontend ahead of schedule.",
//     name: "Sophia Martinez",

//     rating: 5,
//     role: "Operations Lead",
//     url: "https://example.com",
//   },
//   {
//     _id: "testimonial-8",
//     approve: true,
//     company: "Kuro Digital",
//     content:
//       "One of the most intuitive frontend developers I've collaborated with. He bridges the gap between design vision and technical execution effortlessly.",
//     name: "Kenji Sato",

//     rating: 4.7,
//     role: "Creative Director",
//     url: "https://example.com",
//   },
//   {
//     _id: "testimonial-9",
//     approve: true,
//     company: "Sovereign Labs",
//     content:
//       "His work on user onboarding flows directly improved our conversion metrics. Outstanding developer experience and great intuition for product design.",
//     name: "Rachel Adams",

//     rating: 5,
//     role: "Head of Growth",
//     url: "https://example.com",
//   },
//   {
//     _id: "testimonial-10",
//     approve: true,
//     company: "Gada Studios",
//     content:
//       "A masterclass in modern Web3 frontend development. Highly structured, proactive, and consistently delivers high-quality user experiences.",
//     name: "Alexander Wright",

//     rating: 5,
//     role: "Technical Lead",
//     url: "https://example.com",
//   },
//   {
//     _id: "testimonial-11",
//     approve: true,
//     company: "Gada Studios",
//     content:
//       "A masterclass in modern Web3 frontend development. Highly structured, proactive, and consistently delivers high-quality user experiences.",
//     name: "Alexander Wright",

//     rating: 5,
//     role: "Technical Lead",
//     url: "https://example.com",
//   },
// ];

export async function fetchAllTestimonials(): Promise<TestimonialsListQueryResult> {
  return sanityQuery<TestimonialsListQueryResult>({ query: query.all });
  // return testimonials;
}

export async function fetchLatestTestimonials(): Promise<TestimonialsListQueryResult> {
  return sanityQuery<TestimonialsListQueryResult>({ query: query.latest });
  // return testimonials.slice(0, 5).filter((item) => item.approve === true);
}
