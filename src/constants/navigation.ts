import type { Route } from "next";
import {
  Designtools,
  History3,
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
    title: "Welcome to the Rabbit Hole",
    description: "A little corner of the internet I decided to build.",
    action: "There's more down here",
    icon: UserLaptop,
    href: "/",
    show: true,
  },
  {
    eyebrow: "Origin Story",
    title: "Context Nobody Asked For",
    description: "The story, the stack, and a questionable number of commits.",
    action: "There's more to the story",
    icon: Story,
    href: "/about",
    show: true,
  },
  {
    eyebrow: "Things I've Built",
    title: "Evidence of Productivity",
    description:
      "Projects, experiments, and things that escaped the localhost.",
    action: "See the rest of the evidence",
    icon: Designtools,
    href: "/projects",
    show: true,
  },
  {
    eyebrow: "Brain Dump",
    title: "Words Were Eventually Written",
    description:
      "Opinions and occasional technical rambling that somehow became paragraphs",
    action: "There's more where that came from",
    icon: PenWriting,
    href: "/articles",
    show: true,
  },
  {
    eyebrow: "The Lore",
    title: "It All Makes Sense Eventually",
    description:
      "A timeline of places I've been, things I've built, and plot twists I definitely did not plan for",
    action: "There's more to the lore",
    icon: History3,
    href: "/about/timeline",
    show: false,
  },
];

export const navLinksData = (pathname: Route) =>
  navLinks.find((item) => item.href === pathname);
