"use client";

import type { PortableTextComponents } from "@portabletext/react";
import { PortableText as PortableTextComponent } from "@portabletext/react";
import { FileIcon } from "@react-symbols/icons/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { CopyButton } from "@/components/reusable/chanhdai/copy-button";
import { cn } from "@/lib/utils";
import { Frame } from "../reusable/reui/frame";
import { Button } from "../reusable/shadcn/button";
import { FadeLine } from "./fade-line";

type Props = {
  value: any;
  className?: string;
};

const CODE_MAX_HEIGHT = 320;

const syntaxTheme = {
  'code[class*="language-"]': {
    color: "var(--foreground)",
    background: "transparent",
  },

  'pre[class*="language-"]': {
    color: "var(--foreground)",
    background: "transparent",
  },

  comment: {
    color: "var(--syntax-comment)",
  },

  punctuation: {
    color: "var(--syntax-punctuation)",
  },

  property: {
    color: "var(--syntax-property)",
  },

  tag: {
    color: "var(--syntax-keyword)",
  },

  boolean: {
    color: "var(--syntax-number)",
  },

  number: {
    color: "var(--syntax-number)",
  },

  constant: {
    color: "var(--syntax-variable)",
  },

  symbol: {
    color: "var(--syntax-variable)",
  },

  selector: {
    color: "var(--syntax-string)",
  },

  "attr-name": {
    color: "var(--syntax-property)",
  },

  string: {
    color: "var(--syntax-string)",
  },

  char: {
    color: "var(--syntax-string)",
  },

  builtin: {
    color: "var(--syntax-class)",
  },

  inserted: {
    color: "var(--syntax-string)",
  },

  operator: {
    color: "var(--syntax-operator)",
  },

  entity: {
    color: "var(--syntax-variable)",
  },

  url: {
    color: "var(--syntax-string)",
  },

  atrule: {
    color: "var(--syntax-keyword)",
  },

  "attr-value": {
    color: "var(--syntax-string)",
  },

  keyword: {
    color: "var(--syntax-keyword)",
  },

  function: {
    color: "var(--syntax-function)",
  },

  "class-name": {
    color: "var(--syntax-class)",
  },

  regex: {
    color: "var(--syntax-string)",
  },

  important: {
    color: "var(--syntax-keyword)",
  },

  variable: {
    color: "var(--syntax-variable)",
  },
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return parsed.pathname.slice(1).split("/")[0] || null;
    }

    if (hostname !== "youtube.com" && hostname !== "m.youtube.com") {
      return null;
    }

    const videoId = parsed.searchParams.get("v");
    if (videoId) return videoId;

    if (parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname.split("/")[2] || null;
    }

    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname.split("/")[2] || null;
    }

    return null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Code block
// ─────────────────────────────────────────────

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  typescript: "ts",
  javascript: "js",
  jsx: "jsx",
  tsx: "tsx",
  css: "css",
  scss: "scss",
  sass: "sass",
  html: "html",
  xml: "xml",
  json: "json",
  markdown: "md",
  python: "py",
  ruby: "rb",
  java: "java",
  csharp: "cs",
  go: "go",
  php: "php",
  sql: "sql",
  mysql: "sql",
  yaml: "yaml",
  bash: "sh",
  sh: "sh",
  batch: "bat",
  groq: "groq",
};

function getLanguageExtension(language?: string) {
  if (!language) return "txt";

  return LANGUAGE_EXTENSIONS[language.toLowerCase()] ?? language;
}

function CodeBlock({
  code,
  language,
  filename,
}: {
  code: string;
  language: string;
  filename?: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  const checkOverflow = useCallback(() => {
    const element = contentRef.current;

    if (!element) return;

    setCanExpand(element.scrollHeight > CODE_MAX_HEIGHT + 1);
  }, []);

  useEffect(() => {
    checkOverflow();

    const element = contentRef.current;

    if (!element) return;

    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkOverflow]);

  return (
    <Frame className="my-8 rounded-[20px]!">
      <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-card">
        {/* Header */}
        <div className="flex min-h-10 items-center justify-between gap-4 border-b border-border px-4 py-2">
          {filename ? (
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center">
                <FileIcon
                  fileName={filename}
                  className="size-4.5"
                  aria-hidden="true"
                />
              </span>

              <span className="truncate font-mono text-xs text-muted-foreground">
                {filename}
              </span>
            </div>
          ) : (
            <span className="text-xs font-mono text-muted-foreground">
              {language}
            </span>
          )}

          <CopyButton
            text={code}
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
          />
        </div>

        {/* Code */}
        <div
          ref={contentRef}
          className={cn(
            "relative overflow-hidden transition-[max-height] duration-300 ease-out",
            !expanded && canExpand && "scroll-fade-b",
          )}
          style={{
            maxHeight: expanded ? undefined : CODE_MAX_HEIGHT,
          }}
        >
          <SyntaxHighlighter
            language={language}
            style={syntaxTheme}
            customStyle={{
              margin: 0,
              padding: "1.25rem",
              background: "transparent",
              fontSize: "0.875rem",
              lineHeight: "1.6",
              fontFamily: "var(--font-mono)",
            }}
            codeTagProps={{
              style: {
                fontFamily: "inherit",
              },
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>

        {/* Expand / collapse */}
        {canExpand && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full rounded-t-none h-12 rounded-b-2xl z-10 hover:bg-background!"
            onClick={() => setExpanded((previous) => !previous)}
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                Collapse
                <ChevronUp className="size-3.5" />
              </>
            ) : (
              <>
                Expand
                <ChevronDown className="size-3.5" />
              </>
            )}
          </Button>
        )}
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────
// Portable Text
// ─────────────────────────────────────────────

export const PortableText = ({ value, className }: Props) => {
  const components: PortableTextComponents = {
    block: {
      normal: ({ children }) => (
        <p className="my-4 text-sm md:text-[15px] leading-relaxed first:mt-0 last:mb-0">
          {children}
        </p>
      ),

      h1: ({ children }) => (
        <h1 className="my-4 text-2xl md:text-3xl font-bold first:mt-0 last:mb-0">
          {children}
        </h1>
      ),

      h2: ({ children }) => (
        <h2 className="my-4 text-xl md:text-2xl font-bold first:mt-0 last:mb-0">
          {children}
        </h2>
      ),

      h3: ({ children }) => (
        <h3 className="my-4 text-lg md:text-xl font-semibold first:mt-0 last:mb-0">
          {children}
        </h3>
      ),

      h4: ({ children }) => (
        <h4 className="my-3 text-[17px] md:text-lg font-semibold first:mt-0 last:mb-0">
          {children}
        </h4>
      ),

      blockquote: ({ children }) => (
        <blockquote className="my-4 border-l-3 border-primary pl-3 py-1 bg-muted/60 italic first:mt-0 last:mb-0">
          {children}
        </blockquote>
      ),
    },

    list: {
      bullet: ({ children }) => (
        <ul className="my-4 list-disc space-y-1 pl-6 first:mt-0 last:mb-0">
          {children}
        </ul>
      ),

      number: ({ children }) => (
        <ol className="my-4 list-decimal space-y-1 pl-6 first:mt-0 last:mb-0">
          {children}
        </ol>
      ),
    },

    listItem: {
      bullet: ({ children }) => (
        <li className="pl-1 leading-6 text-sm md:text-[15px] text-foreground/90">
          {children}
        </li>
      ),

      number: ({ children }) => (
        <li className="pl-1 leading-6 text-sm md:text-[15px] text-foreground/90">
          {children}
        </li>
      ),
    },

    marks: {
      // Bold

      strong: ({ children }) => (
        <strong className="font-semibold text-foreground">{children}</strong>
      ),

      // Italic

      em: ({ children }) => (
        <em className="text-foreground/90 italic">{children}</em>
      ),

      // Underline

      underline: ({ children }) => (
        <span className="underline decoration-current/40 underline-offset-3">
          {children}
        </span>
      ),

      // Strikethrough

      "strike-through": ({ children }) => (
        <del className="text-muted-foreground line-through">{children}</del>
      ),

      code: ({ children }) => (
        <code className="rounded-md border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-sm md:text-[15px] text-foreground">
          {children}
        </code>
      ),

      link: ({ children, value }) => {
        const href = value?.href;

        if (!href) return <>{children}</>;

        const isExternal = /^https?:\/\//.test(href);

        if (isExternal || value?.blank) {
          return (
            <a
              target="_blank"
              href={href}
              rel="noopener noreferrer"
              className="underline"
            >
              {children}
            </a>
          );
        }

        return (
          <Link href={href} className="underline">
            {children}
          </Link>
        );
      },
    },

    types: {
      // ─────────────────────────────────────────
      // Image
      // ─────────────────────────────────────────

      image: ({ value }) => {
        if (!value?.asset) return null;

        return (
          <Frame className="my-10 rounded-[20px]!">
            <figure className="w-full">
              <div className="overflow-hidden bg-card rounded-2xl border border-border">
                <Image
                  src={value.asset.url}
                  alt={value.alt || ""}
                  className="h-auto w-full object-cover"
                  width={value.asset.width}
                  height={value.asset.height}
                />
              </div>

              {value.caption && (
                <figcaption className="px-4 py-2.5 text-center text-sm text-muted-foreground">
                  {value.caption}
                </figcaption>
              )}
            </figure>
          </Frame>
        );
      },

      // ─────────────────────────────────────────
      // Code
      // ─────────────────────────────────────────

      code: ({ value }) => {
        if (!value?.code) return null;

        const language = value.language || "plaintext";

        return (
          <CodeBlock
            code={value.code}
            language={language}
            filename={`code-example.${getLanguageExtension(language)}`}
          />
        );
      },

      // ─────────────────────────────────────────
      // YouTube
      // ─────────────────────────────────────────

      youtube: ({ value }) => {
        if (!value?.url) return null;

        const videoId = getYouTubeVideoId(value.url);

        if (!videoId) return null;

        return (
          <Frame className="my-10 rounded-[20px]!">
            <figure className="w-full">
              <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-card">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?controls=1&rel=0`}
                  title={value.caption || "YouTube video"}
                  className="size-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>

              {value.caption && (
                <figcaption className="px-4 py-2.5 text-center text-sm text-muted-foreground">
                  {value.caption}
                </figcaption>
              )}
            </figure>
          </Frame>
        );
      },

      divider: () => (
        <div className="relative my-8! h-4">
          <FadeLine className="w-[80%] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2" />
        </div>
      ),

      // ─────────────────────────────────────────
      // Hard breaks
      // ─────────────────────────────────────────
      hardBreak: () => <br />,
    },
  };

  return (
    <div
      className={cn(
        "text-foreground",
        "prose-headings:tracking-tight",
        "prose-p:text-foreground/90",
        "prose-strong:text-foreground",
        "prose-li:text-foreground/90",
        "prose-blockquote:text-muted-foreground",
        "prose-hr:border-border",
        "prose-a:text-primary",
        className,
      )}
    >
      <PortableTextComponent value={value} components={components} />
    </div>
  );
};
