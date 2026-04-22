import React, { ComponentPropsWithoutRef } from "react"
import Link from "next/link"
import { Route } from "next"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/ui/accordion"
import { CopyButton } from "./components/shared/copy-button"
import { CodeBlockCommand } from "./components/shared/code-block-command"
import { cn } from "./lib/utils"
import { Kbd, KbdGroup } from "./components/ui/kbd"
import { Button } from "./components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert"
import { AspectRatio } from "./components/ui/aspect-ratio"
import { CodeTabs } from "./components/shared/code-tabs"
import { CodeCollapsibleWrapper } from "./components/shared/code-collapsible-wrapper"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { getIconForLanguageExtension } from "./components/shared/icons"
import { NavAction } from "./components/shared/nav-action"
import { WorkList } from "./components/shared/work-list"
import { BadgeGroup } from "./components/shared/badge-group"
import { ImgGallery } from "./components/shared/img-gallery"

type HeadingProps = ComponentPropsWithoutRef<"h1">
type ParagraphProps = ComponentPropsWithoutRef<"p">
type ListProps = ComponentPropsWithoutRef<"ul">
type ListItemProps = ComponentPropsWithoutRef<"li">
type AnchorProps = ComponentPropsWithoutRef<"a">
type BlockquoteProps = ComponentPropsWithoutRef<"blockquote">

export const mdxComponents = {
  h3: (props: HeadingProps) => (
    <h3 className="text-[17px] font-bold" {...props} />
  ),
  h4: (props: HeadingProps) => (
    <h4 className="text-sm font-medium" {...props} />
  ),
  p: (props: ParagraphProps) => <p className="leading-snug" {...props} />,
  ol: (props: ListProps) => (
    <ol className="list-decimal space-y-2 pl-5" {...props} />
  ),
  ul: (props: ListProps) => (
    <ul className="list-disc space-y-1 pl-5" {...props} />
  ),
  li: (props: ListItemProps) => <li className="pl-1" {...props} />,
  em: (props: ComponentPropsWithoutRef<"em">) => (
    <em className="font-medium" {...props} />
  ),
  figure: ({ className, ...props }: React.ComponentProps<"figure">) => {
    return <figure className={cn(className)} {...props} />
  },
  figcaption: ({
    className,
    children,
    ...props
  }: React.ComponentProps<"figcaption">) => {
    const iconExtension =
      "data-language" in props && typeof props["data-language"] === "string"
        ? getIconForLanguageExtension(props["data-language"])
        : null

    return (
      <figcaption
        className={cn(
          "text-code-foreground [&_svg]:text-code-foreground flex items-center gap-2 [&_svg]:size-4 [&_svg]:opacity-70",
          className
        )}
        {...props}
      >
        {iconExtension}
        {children}
      </figcaption>
    )
  },
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-medium" {...props} />
  ),
  a: ({ href, children, ...props }: AnchorProps) => {
    const className = "text-primary"
    if (href?.startsWith("/")) {
      return (
        <Link
          href={href as Route}
          className={cn("underline underline-offset-4", className)}
          {...props}
        >
          {children}
        </Link>
      )
    }
    if (href?.startsWith("#")) {
      return (
        <a href={href} className={cn("", className)} {...props}>
          {children}
        </a>
      )
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("underline underline-offset-4", className)}
        {...props}
      >
        {children}
      </a>
    )
  },
  code: ({
    className,
    __raw__,
    __src__,
    __npm__,
    __yarn__,
    __pnpm__,
    __bun__,
    ...props
  }: React.ComponentProps<"code"> & {
    __raw__?: string
    __src__?: string
    __npm__?: string
    __yarn__?: string
    __pnpm__?: string
    __bun__?: string
  }) => {
    // Inline Code.
    if (typeof props.children === "string") {
      return (
        <code
          className={cn(
            "relative bg-muted px-[0.4rem] py-[0.2rem] font-mono text-[0.8rem] wrap-break-word outline-none squircle",
            className
          )}
          {...props}
        />
      )
    }

    // npm command.
    const isNpmCommand = __npm__ && __yarn__ && __pnpm__ && __bun__
    if (isNpmCommand) {
      return (
        <CodeBlockCommand
          __npm__={__npm__}
          __yarn__={__yarn__}
          __pnpm__={__pnpm__}
          __bun__={__bun__}
        />
      )
    }

    // Default codeblock.
    return (
      <>
        {__raw__ && <CopyButton value={__raw__} src={__src__} />}
        <code {...props} />
      </>
    )
  },
  Step: ({ className, ...props }: React.ComponentProps<"h3">) => (
    <h3
      className={cn(
        "font-heading mt-8 scroll-m-32 text-lg font-medium tracking-tight",
        className
      )}
      {...props}
    />
  ),
  Steps: ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
      className={cn(
        "steps [&>h3]:step mb-12 [counter-reset:step] md:ml-4 md:border-l md:pl-8",
        className
      )}
      {...props}
    />
  ),
  Image: ({
    src,
    className,
    width,
    height,
    alt,
    ...props
  }: React.ComponentProps<"img">) => (
    <Image
      className={cn("", className)}
      src={(src as string) || ""}
      width={Number(width)}
      height={Number(height)}
      alt={alt || ""}
      {...props}
    />
  ),
  Tabs: ({ className, ...props }: React.ComponentProps<typeof Tabs>) => {
    return <Tabs className={cn("relative mt-6 w-full", className)} {...props} />
  },
  TabsList: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsList>) => (
    <TabsList
      className={cn(
        "justify-start gap-4 rounded-none bg-transparent px-0",
        className
      )}
      {...props}
    />
  ),
  TabsTrigger: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsTrigger>) => (
    <TabsTrigger
      className={cn(
        "rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 text-base text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none! dark:data-[state=active]:border-primary dark:data-[state=active]:bg-transparent",
        className
      )}
      {...props}
    />
  ),
  TabsContent: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsContent>) => (
    <TabsContent
      className={cn(
        "relative [&_h3.font-heading]:text-base [&_h3.font-heading]:font-medium *:[figure]:first:mt-0 [&>.steps]:mt-6",
        className
      )}
      {...props}
    />
  ),
  Tab: ({ className, ...props }: React.ComponentProps<"div">) => (
    <div className={cn(className)} {...props} />
  ),
  table: ({ className, ...props }: React.ComponentProps<"table">) => (
    <div className="my-6 no-scrollbar w-full overflow-y-auto border squircle">
      <table
        className={cn(
          "relative w-full overflow-hidden border-none text-sm [&_tbody_tr:last-child]:border-b-0",
          className
        )}
        {...props}
      />
    </div>
  ),
  tr: ({ className, ...props }: React.ComponentProps<"tr">) => (
    <tr className={cn("m-0 border-b", className)} {...props} />
  ),
  th: ({ className, ...props }: React.ComponentProps<"th">) => (
    <th
      className={cn(
        "px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right",
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.ComponentProps<"td">) => (
    <td
      className={cn(
        "px-4 py-3 text-left whitespace-nowrap [[align=center]]:text-center [[align=right]]:text-right",
        className
      )}
      {...props}
    />
  ),
  hr: ({ ...props }: React.ComponentProps<"hr">) => (
    <hr className="my-2" {...props} />
  ),
  pre: ({ className, children, ...props }: React.ComponentProps<"pre">) => {
    return (
      <pre
        className={cn(
          "no-scrollbar min-w-0 overflow-x-auto overflow-y-auto overscroll-x-contain overscroll-y-auto px-4 py-3.5 outline-none has-data-highlighted-line:px-0 has-data-line-numbers:px-0 has-data-[slot=tabs]:p-0",
          className
        )}
        {...props}
      >
        {children}
      </pre>
    )
  },
  blockquote: (props: BlockquoteProps) => (
    <blockquote
      className="ml-[0.075em] border-l-3 pl-4 text-muted-foreground"
      {...props}
    />
  ),
  Button,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertTitle,
  AlertDescription,
  AspectRatio,
  CodeTabs,
  CodeCollapsibleWrapper,
  WorkList,
  KbdGroup,
  Kbd,
  NavAction,
  BadgeGroup,
  ImgGallery,
  Link: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn("font-medium underline underline-offset-4", className)}
      {...props}
    />
  ),
  LinkedCard: ({ className, ...props }: React.ComponentProps<typeof Link>) =>
    props.href ? (
      <Link
        className={cn(
          "text-surface-foreground flex w-full flex-col items-center bg-card p-6 ring-1 ring-border transition-all duration-500 ease-out squircle hover:-translate-y-1 hover:scale-[102%] sm:p-10",
          className
        )}
        {...props}
      />
    ) : (
      <div
        className={cn(
          "text-surface-foreground pointer-events-none flex w-full flex-col items-center bg-card p-6 opacity-50 ring-1 ring-border transition-colors squircle sm:p-10",
          className
        )}
      >
        {props.children}
      </div>
    ),
}
