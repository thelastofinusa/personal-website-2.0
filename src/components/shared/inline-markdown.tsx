"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Defined once at module level so it is not re-created on every render.
const components: Components = {
  p: ({ children }) => <>{children}</>,
  strong: ({ children }) => (
    <strong className="text-foreground font-medium">{children}</strong>
  ),
  em: ({ children }) => <em>{children}</em>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="hover:text-primary underline underline-offset-4 transition-colors"
      // These sit inside a clickable project card, so don't trigger it.
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </a>
  ),
};

/** Renders short Markdown (bold, italic, links) inline, without block wrappers. */
export function InlineMarkdown({ children }: { children?: string | null }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children ?? ""}
    </ReactMarkdown>
  );
}
