"use client";
import type React from "react";
import { Button } from "@/components/reusable/shadcn/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/reusable/shadcn/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/reusable/shadcn/tooltip";
import { Reicon } from "@/components/shared/reicon";
import { useMediaQuery } from "@/hooks/use-media-query";
import { soundFx } from "@/lib/uisfx";
import type { ProjectFiltersListQueryResult } from "~/sanity.types";

export const TabFilter: React.FC<{
  filters: ProjectFiltersListQueryResult;
  activeTab: string;
  onTabChange: (value: string) => void;
}> = (props) => {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return !isMobile ? (
    <div className="flex-wrap w-max items-center gap-2 flex">
      {props.filters.map((filter, index) => {
        const isActive = props.activeTab === filter.slug;

        const align =
          index === 0
            ? "start"
            : index === props.filters.length - 1
              ? "end"
              : "center";

        return (
          <Tooltip key={filter._id}>
            <TooltipTrigger
              render={
                <Button
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => {
                    props.onTabChange(filter.slug as string);
                    soundFx.play("select");
                  }}
                >
                  <Reicon name={filter.icon} />
                  <span>{filter.name}</span>
                </Button>
              }
            />

            <TooltipContent side="bottom" align={align}>
              <span className="text-xs">{filter.description}</span>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  ) : (
    <div className="wrapper w-max">
      <Select
        value={props.activeTab}
        onValueChange={(e) => {
          props.onTabChange(e as string);
          soundFx.play("select");
        }}
      >
        <SelectTrigger className="rounded-full bg-background! hover:bg-background/90!">
          <SelectValue>
            {(() => {
              const activeFilter =
                props.filters.find(
                  (filter) => filter.slug === props.activeTab,
                ) ?? props.filters[0];

              return (
                <span className="flex items-center gap-2">
                  <Reicon name={activeFilter.icon} />
                  <span className="text-sm">{activeFilter.name}</span>
                </span>
              );
            })()}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            {props.filters.map((filter) => {
              return (
                <SelectItem key={filter._id} value={filter.slug}>
                  <div className="flex items-start gap-2">
                    <Reicon name={filter.icon} className="mt-0.5" />

                    <div className="flex flex-col items-start gap-px">
                      <span className="font-medium">{filter.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {filter.description}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
