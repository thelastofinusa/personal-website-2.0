function StackedPagesIllustration() {
  return (
    <div className="relative h-24 w-64" aria-hidden="true">
      {/* Back page */}
      <div className="bg-background absolute inset-x-8 top-0 h-7 rotate-[-4deg] rounded-t-lg border opacity-80" />

      {/* Middle page */}
      <div className="bg-background absolute inset-x-4 top-3 h-7 rotate-2 rounded-t-lg border" />

      {/* Front page */}
      <div className="border-border bg-background absolute inset-x-0 top-6 flex h-16 items-center gap-3 rounded-lg border px-4 shadow-xs">
        <div className="bg-muted size-8 shrink-0 rounded" />

        <div className="flex flex-1 flex-col gap-1.5">
          <div className="bg-muted h-2.5 w-3/4 rounded" />
          <div className="bg-muted/60 h-2 w-1/2 rounded" />
        </div>
      </div>
    </div>
  );
}

export { StackedPagesIllustration };
