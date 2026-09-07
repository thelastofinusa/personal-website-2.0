import type { Activity } from "./contribution-graph";

type GitHubContributionsResponse = {
  contributions: Activity[];
};

export const getCachedContributions = async (username: string) => {
  const res = await fetch(
    `${process.env.GITHUB_CONTRIBUTIONS_API_URL || `https://github-contributions-api.jogruber.de`}/v4/${username}?y=last`,
  );
  if (!res.ok) {
    return [];
  }
  const data = (await res.json()) as GitHubContributionsResponse;
  return data.contributions ?? [];
};
