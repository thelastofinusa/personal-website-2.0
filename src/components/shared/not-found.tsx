"use client";
import { cn } from "cn";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { type IconComponent, SquareTopDown } from "reicon-react";
import { siteConfig } from "@/config/site.config";
import { navLinks } from "@/constants/navigation";
import { getInitials } from "@/lib/utils";
import { useSoundFx } from "../provider/sound-fx";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "../reusable/reui/autocomplete";
import { Avatar, AvatarFallback, AvatarImage } from "../reusable/shadcn/avatar";
import { Button } from "../reusable/shadcn/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../reusable/shadcn/empty";
import { Separator } from "../reusable/shadcn/separator";
import { toast } from "../reusable/shadcn/toast";
import { CurveThingy } from "./curve-thingy";

type PageItem = {
  eyebrow: string;
  title: string;
  description: string;
  icon: IconComponent;
  to: string;
};

export const NotFoundComp = () => {
  const { play } = useSoundFx();
  const router = useRouter();

  const [query, setQuery] = React.useState("");

  /* ------------------------------------------------------------------------ */
  /* Page items                                                               */
  /* ------------------------------------------------------------------------ */

  const pageItems = React.useMemo<PageItem[]>(() => {
    return navLinks.map((page) => ({
      description: page.description,
      title: page.title,
      icon: page.icon,
      eyebrow: page.eyebrow,
      to: page.href,
    }));
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Search                                                                   */
  /* ------------------------------------------------------------------------ */

  const filteredItems = React.useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return pageItems;
    }

    const normalizedSearch = search.startsWith("/") ? search.slice(1) : search;

    return pageItems.filter((item) => {
      const eyebrow =
        item.eyebrow.toLowerCase() ||
        item.title.toLowerCase() ||
        item.description.toLowerCase();
      const path = item.to.toLowerCase();

      const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

      return (
        eyebrow.includes(normalizedSearch) ||
        path.includes(search) ||
        normalizedPath.includes(normalizedSearch)
      );
    });
  }, [query, pageItems]);

  /* ------------------------------------------------------------------------ */
  /* Navigation                                                               */
  /* ------------------------------------------------------------------------ */

  const navigateToPage = React.useCallback(
    (path: string) => {
      setQuery("");

      router.push(path as Route);
    },
    [router],
  );

  /* ------------------------------------------------------------------------ */
  /* Enter key                                                                */
  /* ------------------------------------------------------------------------ */

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") {
        return;
      }

      const search = query.trim();

      if (!search) {
        toast.add({
          type: "error",
          title: "Look at you",
          description: "You need to provide a search query",
        });
        return;
      }

      if (filteredItems.length === 1) {
        event.preventDefault();

        navigateToPage(filteredItems[0].to);
      }
    },
    [query, filteredItems, navigateToPage],
  );

  return (
    <div className="flex-1 flex flex-col justify-center overflow-x-clip">
      <CurveThingy hideHash className="h-dvh">
        <Empty>
          <EmptyHeader>
            <EmptyMedia className="h-auto w-[80%]">
              <SVG404 />
            </EmptyMedia>

            <EmptyTitle className="mt-2">
              That's weird. What brings you here?
            </EmptyTitle>

            <EmptyDescription>
              Looks like you've wandered into the internet equivalent of a dead
              end. The last time I checked, the website has only{" "}
              <strong>{navLinks.length}</strong> pages.
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent>
            <div className="w-full wrapper flex items-center">
              <Autocomplete
                value={query}
                onValueChange={setQuery}
                items={filteredItems}
                itemToStringValue={(item: PageItem) => item.eyebrow}
              >
                <AutocompleteInput
                  placeholder="Search for a page.."
                  showTrigger
                  showClear
                  autoFocus
                  onKeyDown={handleKeyDown}
                  className="bg-background! rounded-full h-9 px-3"
                />

                <AutocompleteContent>
                  <AutocompleteEmpty>No pages found.</AutocompleteEmpty>

                  <AutocompleteList scrollFade className="py-0.5!">
                    {(item: PageItem) => (
                      <AutocompleteItem
                        key={item.to}
                        value={item}
                        onClick={() => navigateToPage(item.to)}
                        className={cn(
                          "relative flex items-end justify-between p-3 transition-all duration-200",
                          "hover:bg-muted/60 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {item.to === "/" ? (
                              <Avatar size="xs" className="size-4!">
                                <AvatarImage
                                  src={siteConfig.author.avatar}
                                  alt={siteConfig.author.name}
                                />
                                <AvatarFallback className="border">
                                  {getInitials(siteConfig.author.name)}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <item.icon className="size-4" />
                            )}
                            <span className="text-sm font-medium leading-none">
                              {item.eyebrow}
                            </span>
                          </div>

                          <span className="text-xs font-light text-muted-foreground">
                            {item.title}
                          </span>
                        </div>

                        <span className="ml-auto text-xs text-muted-foreground">
                          {item.to === "/" ? "/home" : item.to}
                        </span>
                      </AutocompleteItem>
                    )}
                  </AutocompleteList>
                </AutocompleteContent>
              </Autocomplete>

              <Button
                size="icon"
                className="bg-background text-foreground hover:bg-background/90"
              >
                <SquareTopDown className="motion-safe:animate-bell-ring" />
              </Button>
            </div>

            <Separator
              orientation="horizontal"
              className="my-6 mx-auto w-[75%]!"
            />

            <EmptyDescription>
              Well, this is awkward.{" "}
              <button
                type="button"
                onClick={() => {
                  router.back();
                  play("back");
                }}
                className="cursor-pointer underline underline-offset-4 hover:text-primary"
              >
                Take me back
              </button>{" "}
              or{" "}
              <Link href="/" onClick={() => play("forward")}>
                Pretend this never happened
              </Link>
              .
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      </CurveThingy>
    </div>
  );
};

function SVG404() {
  return (
    <svg viewBox="0 0 550 198" fill="none">
      <title>Page Not Found</title>
      <path
        d="M103.743 190.125V151.515H8.52948V130.455L88.595 1.125H130.521V128.025H157.57V151.515H130.521V190.125H103.743ZM38.0131 128.025H105.095V18.945H104.013L38.0131 128.025ZM378.184 110.903C371.304 158.87 330.284 193.556 283.18 193.966L279.964 178.358L278.347 170.514L275.651 157.435L288.982 138.227L303.325 117.563L263.504 73.899L293.925 47.8103L299.939 42.6533L294.753 24.8378L292.363 16.6275L287.688 0.5625C290.432 0.72 293.186 0.99675 295.956 1.39275C348.957 8.96625 385.773 57.996 378.184 110.903Z"
        className="fill-foreground"
      />
      <path
        d="M270.278 158.965L283.18 193.968C278.323 194.741 273.413 195.147 268.495 195.183C214.955 195.581 171.23 152.582 170.827 99.1395C170.448 48.4875 209.122 6.63303 258.743 2.05878L277.146 41.8545L245.787 78.174L291.685 115.418L270.278 158.965Z"
        className="fill-card"
      />
      <path
        d="M360.895 76.5023C358.223 66.3751 353.608 56.8617 347.305 48.4898C341.023 40.1018 333.171 33.0106 324.182 27.6098C314.466 21.7621 303.625 18.021 292.366 16.6298L294.755 24.8378C303.741 26.3678 312.36 29.5655 320.165 34.2653C328.294 39.1515 335.395 45.5655 341.077 53.1518C346.778 60.7221 350.953 69.3256 353.368 78.4845C355.88 87.9766 356.445 97.8771 355.032 107.593C353.676 117.141 350.442 126.328 345.517 134.625C340.592 142.922 334.072 150.165 326.333 155.939C318.748 161.629 310.129 165.795 300.954 168.208C293.586 170.153 285.957 170.93 278.347 170.512L279.963 178.358C287.709 178.587 295.448 177.699 302.94 175.721C313.086 173.054 322.617 168.446 331.003 162.153C339.56 155.768 346.768 147.758 352.214 138.584C357.66 129.409 361.236 119.251 362.736 108.693C364.298 97.9484 363.672 86.9995 360.895 76.5023Z"
        className="fill-card"
      />
      <path
        d="M277.669 179.01C274.586 179.382 271.485 179.58 268.38 179.602C257.504 179.704 246.719 177.615 236.671 173.459C226.976 169.456 218.151 163.612 210.686 156.251C203.203 148.912 197.218 140.194 193.064 130.579C188.748 120.612 186.493 109.878 186.432 99.0202C186.33 88.1639 188.425 77.3987 192.59 67.3695C196.6 57.6926 202.453 48.8845 209.825 41.4338C217.178 33.9622 225.914 27.9866 235.549 23.8388C245.102 19.7171 255.363 17.4785 265.767 17.2463L269.358 25.0087C258.805 24.7597 248.324 26.7954 238.635 30.9757C229.921 34.7262 222.02 40.1294 215.37 46.8855C208.702 53.6238 203.407 61.5898 199.778 70.3418C196.015 79.4112 194.124 89.1455 194.218 98.9618C194.271 108.779 196.309 118.485 200.209 127.499C203.968 136.195 209.382 144.081 216.15 150.719C223.024 157.495 231.171 162.85 240.124 166.473C249.078 170.097 258.66 171.919 268.321 171.835C270.53 171.817 272.723 171.704 274.899 171.495L277.669 179.01ZM485.659 190.125V151.515H390.446V130.455L470.512 1.125H512.438V128.025H539.487V151.515H512.438V190.125H485.659ZM419.93 128.025H487.012V18.945H485.93L419.93 128.025Z"
        className="fill-foreground"
      />
    </svg>
  );
}
