import type { Route } from "next";
import {
  Designtools,
  History2,
  type IconComponent,
  PenWriting,
  Story,
  UserLaptop,
} from "reicon-react";

export type NavLink = {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  icon: IconComponent;
  href: Route;
  show?: boolean;
};

export const navLinks: NavLink[] = [
  {
    eyebrow: "The Genesis",
    title: "Home Base",
    description: "My small corner of the web.",
    action: "Step inside",
    icon: UserLaptop,
    href: "/",
    show: true,
  },
  {
    eyebrow: "Origin Story",
    title: "Behind the Screen",
    description: "Who I am, what I use, and how I ended up here.",
    action: "Meet the human",
    icon: Story,
    href: "/about",
    show: true,
  },
  {
    eyebrow: "Things I've Built",
    title: "Selected Projects",
    description:
      "Experiments, apps, and side projects that made it out of localhost.",
    action: "Be the witness",
    icon: Designtools,
    href: "/projects",
    show: true,
  },
  {
    eyebrow: "Brain Dump",
    title: "Notes & Thoughts",
    description:
      "Unfiltered opinions, technical notes, and occasional ramblings.",
    action: "Read hot takes",
    icon: PenWriting,
    href: "/articles",
    show: true,
  },
  {
    eyebrow: "The Lore",
    title: "The Timeline",
    description:
      "A chronological look at milestones, detours, and lessons along the way.",
    action: "Rewind time",
    icon: History2,
    href: "/about/timeline",
    show: false,
  },
];

export const navLinksData = (pathname: Route) =>
  navLinks.find((item) => item.href === pathname);
