"use client"

import Link from "next/link"
import ReactMarkdown from "react-markdown"

type WorkListProps = {
  title?: string
  description?: string
  featured?: boolean
}

const projects = [
  {
    name: "Bitterms",
    slug: "bitterms",
    description:
      "BitTerms solves the problem of Bitcoin education being **too technical and confusing for everyday people**.",
    featured: true,
  },
  {
    name: "Trezo",
    slug: "trezo",
    description:
      "Trezo makes building modern dApps simpler by **unifying type-safe contract interactions, wallet integrations, and Web3 state into one modular, cross-chain toolkit**.",
    featured: true,
  },
  {
    name: "Bitcoin Design Adoption Network",
    slug: "bdan",
    description:
      "BDAN trains African designers to create sovereign, human-centred Bitcoin experiences for the next wave of users through open, decentralized design.",
    featured: true,
  },
  {
    name: "Ekimedo Atelier",
    slug: "ekimedo",
    description:
      "Ekimedo Atelier is a premium ecommerce platform focused on **bespoke fashion**, allowing customers to **browse collections, customize orders, schedule consultations, and purchase high-end fashion items online**.",
    featured: true,
  },
]

export const WorkList = ({
  title,
  description,
  featured = true,
}: WorkListProps) => {
  const filteredProjects = featured
    ? projects.filter((project) => project.featured)
    : projects

  return (
    <div className="space-y-4">
      {title && <p className="font-semibold">{title}</p>}
      {description && <p>{description}</p>}

      <ul className="list-disc space-y-1 pl-5">
        {filteredProjects.map((project) => (
          <li key={project.name} className="pl-1">
            <Link
              href={`/work/${project.slug}`}
              className="font-medium text-primary underline underline-offset-4"
            >
              {project.name}
            </Link>{" "}
            -{" "}
            <ReactMarkdown
              components={{
                p: ({ children }) => <span>{children}</span>,
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    {children}
                  </code>
                ),
              }}
            >
              {project.description}
            </ReactMarkdown>
          </li>
        ))}
      </ul>
    </div>
  )
}
