export const PROJECT_SORTS = ["latest", "oldest", "az", "za"] as const;

export type ProjectSort = (typeof PROJECT_SORTS)[number];

/** Matches the order the Sanity query already returns (`date desc`). */
export const DEFAULT_PROJECT_SORT: ProjectSort = "latest";

export const isProjectSort = (value: unknown): value is ProjectSort =>
  PROJECT_SORTS.includes(value as ProjectSort);

type Sortable = { name: string | null; date: string | null };

const collator = new Intl.Collator("en", {
  sensitivity: "base",
  numeric: true,
});

const toTime = (date: string | null) => {
  const time = date ? Date.parse(date) : Number.NaN;
  return Number.isNaN(time) ? null : time;
};

/** Compares two possibly-missing values; missing ones always sink to the end. */
function compareNullable<V>(
  a: V | null,
  b: V | null,
  compare: (a: V, b: V) => number,
  direction: 1 | -1,
) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return compare(a, b) * direction;
}

const byDate = (direction: 1 | -1) => (a: Sortable, b: Sortable) =>
  compareNullable(toTime(a.date), toTime(b.date), (x, y) => x - y, direction);

const byName = (direction: 1 | -1) => (a: Sortable, b: Sortable) =>
  compareNullable(
    a.name?.trim() || null,
    b.name?.trim() || null,
    collator.compare,
    direction,
  );

const comparators: Record<ProjectSort, (a: Sortable, b: Sortable) => number> = {
  latest: byDate(-1),
  oldest: byDate(1),
  az: byName(1),
  za: byName(-1),
};

/** Returns a sorted copy; ties keep their original order (the sort is stable). */
export function sortProjects<T extends Sortable>(
  projects: readonly T[],
  sort: ProjectSort,
): T[] {
  return [...projects].sort(comparators[sort]);
}
