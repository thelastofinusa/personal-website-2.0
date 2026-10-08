import type { Activity } from "@/components/reusable/chanhdai/contribution-graph";

export function withScaledLevels(activities: Activity[]): Activity[] {
  const max = Math.max(0, ...activities.map((a) => a.count));

  if (max === 0) {
    return activities.map((a) => ({ ...a, level: 0 }));
  }

  const scale = Math.log(max + 1);

  return activities.map((a) => {
    if (a.count === 0) return { ...a, level: 0 };

    const ratio = Math.log(a.count + 1) / scale;
    const level = ratio <= 0.25 ? 1 : ratio <= 0.5 ? 2 : ratio <= 0.75 ? 3 : 4;

    return { ...a, level };
  });
}
