import type { Route } from "next";
import { FolderLink, type IconComponent, Pip, UserLaptop } from "reicon-react";

export type NavLink = {
  eyebrow: string;
  title: string;
  description: string;
  icon: IconComponent;
  href: Route;
};

export const navLinks: NavLink[] = [
  {
    eyebrow: "The Genesis",
    title: "You are here. Ground Zero. Probably.",
    description: "A little corner of the internet I decided to build.",
    icon: UserLaptop,
    href: "/",
  },
  {
    eyebrow: "Origin Story",
    title: "Context Nobody Asked For",
    description: "The story, the stack, and a questionable number of commits.",
    icon: UserLaptop,
    href: "/about",
  },
  {
    eyebrow: "Things I Built",
    title: "They Work on My Machine",
    description:
      "Projects, experiments, and things that escaped the localhost.",
    icon: FolderLink,
    href: "/projects",
  },
  {
    eyebrow: "Brain Dump",
    title: "Thoughts that escaped",
    description:
      "Opinions and occasional technical rambling that somehow became paragraphs",
    icon: Pip,
    href: "/articles",
  },
];

export const navLinksData = (pathname: Route) =>
  navLinks.find((item) => item.href === pathname);
