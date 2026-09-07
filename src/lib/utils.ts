export { cn } from "cn";

import { format } from "date-fns";
import type { FilteredResponseQueryOptions } from "next-sanity";

export function decodeString(value: string) {
  return atob(value);
}

export function getInitials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export function formatDate(date: string | Date) {
  return format(new Date(date), "dd MMMM yyyy");
}

export function getRandomImage(seed: string, width = 800) {
  const min = 500;
  const max = 800;
  const height = Math.floor(Math.random() * (max - min + 1)) + min;

  return `https://placehold.co/${width}x${height}?text=${encodeURIComponent(seed)}`;
}

export async function sleep(duration = 1500, name = "Timer"): Promise<void> {
  await new Promise((resolve) => setTimeout(() => resolve({ name }), duration));
}

export function assertValue<T>(
  value: T | null | undefined,
  message: string,
): T {
  if (value == null || value === "") {
    throw new Error(message);
  }

  return value;
}

export const revalidateOption: FilteredResponseQueryOptions = {
  next: {
    revalidate: 60 * 60 * 24, // 24 hours
  },
};
