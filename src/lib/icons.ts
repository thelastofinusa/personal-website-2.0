import type { IconType } from "react-icons";
import { BsWikipedia } from "react-icons/bs";
import { CgNpm } from "react-icons/cg";
import { FaTelegramPlane } from "react-icons/fa";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaMedium,
  FaProductHunt,
  FaXTwitter,
} from "react-icons/fa6";
import { FiChrome } from "react-icons/fi";
import { IoLogoGithub } from "react-icons/io5";
import { RiReactjsFill, RiVercelFill } from "react-icons/ri";
import { SiDailydotdev } from "react-icons/si";
import { TbBrandNextjs } from "react-icons/tb";
import * as Reicons from "reicon-react";
import { Drop, Paperclip2Newicons } from "reicon-react";

type IconMatcher = {
  keywords: string[];
  icon: IconType;
};

const DEFAULT_ICONS: IconMatcher[] = [
  {
    keywords: ["medium", "medium.com"],
    icon: FaMedium,
  },
  {
    keywords: ["producthunt", "www.producthunt.com", "producthunt.com"],
    icon: FaProductHunt,
  },
  {
    keywords: ["localhost"],
    icon: FiChrome,
  },
  {
    keywords: ["npm", "npmjs.org"],
    icon: CgNpm,
  },
  {
    keywords: ["github", "github.com", "gist.github.com"],
    icon: IoLogoGithub,
  },
  {
    keywords: ["react"],
    icon: RiReactjsFill,
  },
  {
    keywords: ["packmd", "pack-md"],
    icon: Drop,
  },
  {
    keywords: ["facebook", "facebook.com"],
    icon: FaFacebook,
  },
  {
    keywords: ["instagram", "instagram.com"],
    icon: FaInstagram,
  },
  {
    keywords: ["linkedin", "linkedin.com"],
    icon: FaLinkedinIn,
  },
  {
    keywords: ["wikipedia", "wikipedia.org"],
    icon: BsWikipedia,
  },
  {
    keywords: ["twitter", "twitter.com", "x.com"],
    icon: FaXTwitter,
  },
  {
    keywords: ["vercel", "vercel.com", "vercel.app"],
    icon: RiVercelFill,
  },
  {
    keywords: ["next.js", "nextjs"],
    icon: TbBrandNextjs,
  },
  {
    keywords: ["telegram", "t.me"],
    icon: FaTelegramPlane,
  },
  {
    keywords: ["daily"],
    icon: SiDailydotdev,
  },
];

export function resolveIcon(value: string): IconType {
  const input = value.toLowerCase();

  const match = [...DEFAULT_ICONS].find(({ keywords }) =>
    keywords.some((keyword) => input.includes(keyword.toLowerCase())),
  );

  return match?.icon ?? Paperclip2Newicons;
}

export type ReiconComponent = React.ComponentType<any>;

export function resolveReicon(
  name: string | null | undefined,
): ReiconComponent | null {
  if (!name) return null;

  const icon = Reicons[name as keyof typeof Reicons];

  if (!icon) return null;

  return icon as ReiconComponent;
}
