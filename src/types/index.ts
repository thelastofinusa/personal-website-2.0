import type { MotionValue } from "motion/react";
import type React from "react";
import type { IconComponent } from "reicon-react";
import type { PortableTextBlock } from "sanity";
import type { ProjectsListQueryResult } from "~/sanity.types";
import type { ContainerVariantsType } from "../components/shared/container";

export type TProjectView = "grid" | "list";

export interface IProject {
  href: string;
  name: string;
  date: string;
  asset: {
    image: string; //"image": image.asset->url,
    width: number; //"width": image.asset->metadata.dimensions.width,
    height: number; //"height": image.asset->metadata.dimensions.height,
  };
  description: string;
  badges: string[];
  tabs: IProjectFilters["value"][];
}

export interface IArticle {
  slug: string;
  title: string;
  description: string;
  date: string;
  pinned?: boolean;
  banner: string;
  body: PortableTextBlock[];
}

export interface IProjectFilters {
  value: "featured" | "open-source" | "personal";
  direct: string;
  label: string;
  icon: IconComponent;
}

export interface ISearchFilterProps {
  query: string;
  tab?: string;
  searchValue: string;
  hasActiveFilters: boolean;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  projects: ProjectsListQueryResult;
  view: TProjectView;
  setView: (view: TProjectView) => void;
  onClear: () => void;
}

export interface IQuickHeroProps {
  eyebrow?: {
    label: string;
    icon?: IconComponent;
    href?: string;
  };
  title: string;
  description: string;
  component?: {
    content: React.ReactElement;
    maxWidth?: ContainerVariantsType["size"];
  };
}

export interface IImagePreviewContextType {
  handleMouseEnter: (index: number) => void;
  handleMouseLeave: () => void;
}

export interface IImagePreviewPortalProps {
  springY: MotionValue<number>;
  springX: MotionValue<number>;
  previewRef: React.RefObject<HTMLDivElement | null>;
  maxWidth: number;
  activeIndex: number | null;
  images: {
    alt?: string;
    url: string;
    ogUrl?: string;
    width?: number;
    height?: number;
  }[];
  panelRef: React.RefObject<HTMLDivElement | null>;
  imageTrackRef: React.RefObject<HTMLDivElement | null>;
}

export interface IImagePreviewProviderProps {
  children: React.ReactNode;
  images: {
    alt?: string;
    url: string;
    ogUrl?: string;
    width?: number;
    height?: number;
  }[];
  maxWidth?: number;
}
