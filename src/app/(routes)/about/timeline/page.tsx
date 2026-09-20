import { ArrowLeft5 } from "reicon-react";
import { Timeline } from "@/components/reusable/chanhdai/timeline";
import { Container } from "@/components/shared/container";
import { CurveThingy } from "@/components/shared/curve-thingy";
import { Eyebrow } from "@/components/shared/eyebrow";
import { fetchTimeline } from "@/sanity/queries/timeline.query";

export default async function TimelinePage() {
  const timeline = await fetchTimeline();

  return (
    <div className="flex-1 overflow-x-clip">
      <CurveThingy>
        <Container size="sm" className="pt-20 sm:pt-30 md:pt-36">
          <div className="flex flex-col gap-10">
            <Eyebrow
              label="Abort Exploration"
              href="/about"
              icon={ArrowLeft5}
              className="mb-4"
            />

            <Timeline className="w-full" items={timeline} />
          </div>
        </Container>
      </CurveThingy>
    </div>
  );
}
