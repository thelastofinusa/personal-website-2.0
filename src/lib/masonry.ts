export type MasonryEntry<T> = {
  item: T;
  /** Position in the source array, for stable keys, numbering and stagger delays. */
  originalIndex: number;
};

/**
 * Deals items out round-robin into `columnCount` columns (item 0 → col 0,
 * item 1 → col 1, …) so a masonry layout reads left-to-right.
 */
export function splitIntoColumns<T>(
  items: readonly T[],
  columnCount: number,
): MasonryEntry<T>[][] {
  const count = Math.max(1, Math.floor(columnCount));
  const columns: MasonryEntry<T>[][] = Array.from({ length: count }, () => []);

  items.forEach((item, originalIndex) => {
    columns[originalIndex % count].push({ item, originalIndex });
  });

  return columns;
}
