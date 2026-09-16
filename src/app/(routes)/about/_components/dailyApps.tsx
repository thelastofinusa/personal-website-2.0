import { motion } from "motion/react";
import type React from "react";
import { Blend } from "reicon-react";
import { Frame, FramePanel } from "@/components/reusable/reui/frame";
import { Badge } from "@/components/reusable/shadcn/badge";
import { LocalImg } from "@/components/shared/image";
import { Reicon } from "@/components/shared/reicon";
import { workItemVariants } from "@/constants/variants";
import type { DailyAppListQueryResult } from "~/sanity.types";

export const DailyApps: React.FC<{ apps: DailyAppListQueryResult }> = ({
  apps,
}) => {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {apps.map((app, index) => {
        const content = (
          <Frame className="rounded-[20px]!">
            <FramePanel className="rounded-2xl">
              <div className="flex items-center gap-4">
                {app.logo?.type === "icon" ? (
                  <div className="flex size-14 items-center justify-center bg-secondary rounded-lg">
                    <Reicon
                      name={app.logo.value}
                      className="size-6 text-muted-foreground"
                    />
                  </div>
                ) : app.logo?.value ? (
                  <LocalImg
                    width={56}
                    height={56}
                    src={app.logo.value as string}
                    alt={app.name as string}
                    className="size-14 object-contain"
                    aria-hidden
                  />
                ) : (
                  <div className="flex size-14 items-center justify-center bg-secondary rounded-lg">
                    <Blend className="size-6 text-muted-foreground" />
                  </div>
                )}

                <div className="flex flex-1 flex-col gap-1 rounded-2xl">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                      {app.name}
                    </h3>

                    <Badge
                      variant="secondary"
                      className="text-[10px] font-normal text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    >
                      {app.category}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {app.description}
                  </p>
                </div>
              </div>
            </FramePanel>
          </Frame>
        );

        if (!app.url) {
          return (
            <motion.div
              key={app._id}
              custom={index}
              variants={workItemVariants}
              initial="hidden"
              whileInView="visible"
              exit="exit"
              layout
            >
              {content}
            </motion.div>
          );
        }

        return (
          <motion.a
            key={app._id}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            custom={index}
            variants={workItemVariants}
            initial="hidden"
            whileInView="visible"
            exit="exit"
            layout
            className="group"
          >
            {content}
          </motion.a>
        );
      })}
    </div>
  );
};
