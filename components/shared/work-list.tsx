import {
  QUERY_ALL_PROJECTS,
  QUERY_FEATURED_PROJECTS,
} from "@/sanity/lib/queries"
import { WorkListClient } from "./work-list-client"
import { sanityFetch } from "@/sanity/lib/live"

type WorkListProps = {
  title?: string
  description?: string
  featured?: boolean
}

import { Project } from "@/sanity.types"

export type ProjectType = {
  slug: string
} & Project

export const WorkList = async ({
  title,
  description,
  featured = true,
}: WorkListProps) => {
  const { data: projects } = await sanityFetch({
    query: featured ? QUERY_FEATURED_PROJECTS : QUERY_ALL_PROJECTS,
  })

  return (
    <WorkListClient
      title={title}
      description={description}
      featured={featured}
      projects={projects as ProjectType[]}
    />
  )
}
