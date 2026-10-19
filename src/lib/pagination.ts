export type PageItem = number | "start-ellipsis" | "end-ellipsis";

type PageItemsOptions = {
  /** Pages shown either side of the current one. */
  siblings?: number;
  /** Up to this many pages, show every page with no ellipsis. */
  showAllUpTo?: number;
};

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

/**
 * Page numbers (1-based) to render. Above `showAllUpTo` pages it shows the
 * first page, the last page and `siblings` pages either side of the current
 * one, with an ellipsis wherever pages are skipped.
 *
 * With `showAllUpTo: 5` and `siblings: 1`:
 *   getPageItems(1, 5)   → 1 2 3 4 5
 *   getPageItems(1, 10)  → 1 2 … 10
 *   getPageItems(5, 10)  → 1 … 4 5 6 … 10
 *   getPageItems(10, 10) → 1 … 9 10
 */
export function getPageItems(
  current: number,
  total: number,
  { siblings = 1, showAllUpTo = 5 }: PageItemsOptions = {},
): PageItem[] {
  if (total <= showAllUpTo) return range(1, total);

  const visible = [
    ...new Set([
      1,
      total,
      ...range(
        Math.max(1, current - siblings),
        Math.min(total, current + siblings),
      ),
    ]),
  ].sort((a, b) => a - b);

  const items: PageItem[] = [];
  visible.forEach((page, i) => {
    if (i > 0 && page - visible[i - 1] > 1) {
      items.push(page <= current ? "start-ellipsis" : "end-ellipsis");
    }
    items.push(page);
  });

  return items;
}
