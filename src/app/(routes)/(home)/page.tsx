import { CurveThingy } from "@/components/shared/curve-thingy";
import { TextContent } from "@/components/shared/text-content";
import { fetchFeaturedProjects } from "@/sanity/queries/project.query";
import { fetchAllProjectFilters } from "@/sanity/queries/projectFilter.query";
import { ContactComp } from "./_components/contact";
import { HomeHero } from "./_components/hero";
import { ProjectsComp } from "./_components/projects";

const aboutContent = `
I work across **Frontend**, **Web3**, and **Developer Experience** — building interfaces, wiring up APIs and smart contracts, and spending a fair amount of time wondering why that one thing suddenly stopped working.

Lately, I’ve been exploring **AI**, building **open-source** and **dev tools**, and experimenting with new ways to make software more useful and enjoyable to work with.

Always curious. Always learning. Always... forgot what to say. 😅
`;

export default async function Home() {
  const projects = await fetchFeaturedProjects();
  const projectFilters = await fetchAllProjectFilters();

  return (
    <div className="flex-1 overflow-x-clip bg-background">
      <HomeHero />
      <CurveThingy tCurve tMargin>
        <TextContent hash="about" content={aboutContent} />
        <ProjectsComp projects={projects} filters={projectFilters} />
        <ContactComp />
      </CurveThingy>
    </div>
  );
}
