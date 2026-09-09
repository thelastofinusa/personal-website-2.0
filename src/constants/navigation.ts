import type { Route } from "next";
import { Code, Ghost, type IconComponent, Pip, UserLaptop } from "reicon-react";

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
    title: "Welcome to the Rabbit Hole",
    description: "A little corner of the internet I decided to build.",
    icon: UserLaptop,
    href: "/",
  },
  {
    eyebrow: "Origin Story",
    title: "Context Nobody Asked For",
    description: "The story, the stack, and a questionable number of commits.",
    icon: Ghost,
    href: "/about",
  },
  {
    eyebrow: "Things I've Built",
    title: "Evidence of Productivity",
    description:
      "Projects, experiments, and things that escaped the localhost.",
    icon: Code,
    href: "/projects",
  },
  {
    eyebrow: "Brain Dump",
    title: "Words Were Eventually Written",
    description:
      "Opinions and occasional technical rambling that somehow became paragraphs",
    icon: Pip,
    href: "/articles",
  },
];

export const navLinksData = (pathname: Route) =>
  navLinks.find((item) => item.href === pathname);
