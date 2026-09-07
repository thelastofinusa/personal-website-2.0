import type {
  GitHubContributionsResponse,
  GitHubContributionsResult,
} from "@/components/reusable/chanhdai/github-contributions";
import { revalidateOption } from "@/lib/utils";
import { handleError, handleErrorCode } from "./error";

export async function fetchGitHubContributions(
  username: string,
): Promise<GitHubContributionsResult> {
  const apiUrl =
    process.env.GITHUB_CONTRIBUTIONS_API_URL ||
    "https://github-contributions-api.jogruber.de";

  const url = new URL(`/v4/${username}`, apiUrl);
  url.searchParams.set("y", "last");

  try {
    const response = await fetch(url, revalidateOption);

    if (!response.ok) {
      return {
        data: [],
        error: handleErrorCode(response.status),
      };
    }

    const result = (await response.json()) as GitHubContributionsResponse;

    return {
      data: (result.contributions ?? []).filter(
        ({ date }) => date >= "2020-01-01",
      ),
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error: handleError(error),
    };
  }
}
