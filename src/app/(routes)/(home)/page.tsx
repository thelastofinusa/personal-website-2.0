import { fetchFeaturedProjects } from "@/sanity/queries/project.query";
import { fetchAllProjectFilters } from "@/sanity/queries/projectFilter.query";
import { HomeClientPage } from "./_components/client";

export default async function Home() {
  const projects = await fetchFeaturedProjects();
  const projectFilters = await fetchAllProjectFilters();

  return <HomeClientPage projects={projects} projectFilters={projectFilters} />;
}
