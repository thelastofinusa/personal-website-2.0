function StackedPagesIllustration() {
  return (
    <div className="relative h-24 w-64" aria-hidden="true">
      {/* Back page */}
      <div className="absolute inset-x-8 top-0 h-7 rotate-[-4deg] opacity-80 rounded-t-lg border bg-background" />

      {/* Middle page */}
      <div className="absolute inset-x-4 top-3 h-7 rotate-2 rounded-t-lg border bg-background" />

      {/* Front page */}
      <div className="absolute inset-x-0 top-6 flex h-16 items-center gap-3 rounded-lg border border-border bg-background px-4 shadow-xs">
        <div className="size-8 shrink-0 rounded bg-muted" />

        <div className="flex flex-1 flex-col gap-1.5">
          <div className="h-2.5 w-3/4 rounded bg-muted" />
          <div className="h-2 w-1/2 rounded bg-muted/60" />
        </div>
      </div>
    </div>
  );
}

export { StackedPagesIllustration };
