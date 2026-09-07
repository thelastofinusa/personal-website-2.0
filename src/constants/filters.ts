import { Code2, Heart2, StackPerspective, Star2Newicons } from "reicon-react";
import type { IProjectFilters } from "@/types";

export const projectsFilter: IProjectFilters[] = [
  {
    value: "featured",
    direct: "Featured",
    label: "The ones I particularly like",
    icon: Star2Newicons,
  },
  {
    value: "open-source",
    direct: "Open Source",
    label: "Free to inspect and borrow",
    icon: Code2,
  },
  {
    value: "personal",
    direct: "Personal",
    label: "Projects with no client attached",
    icon: Heart2,
  },
] as const;

export const tabFilters = [
  {
    value: "all",
    direct: "Everything",
    label: "Everything I've been up to",
    icon: StackPerspective,
  },
  ...projectsFilter,
];

export type ProjectTab = (typeof projectsFilter)[number]["value"];
