import { OWNER, type Project } from "@/projects";
import type { ProjectStatus } from "@/lib/types";

const API = "https://api.github.com";

export class FatalGithubError extends Error {}

function headers() {
  const token = process.env.GH_TOKEN;
  if (!token) {
    throw new FatalGithubError(
      "GH_TOKEN environment variable is not set. Set it in repo secrets before building."
    );
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "repo-status-next-cf",
  };
}

async function githubGet(path: string): Promise<Response> {
  const res = await fetch(`${API}${path}`, { headers: headers() });
  if (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0") {
    throw new FatalGithubError(`GitHub API rate limit exhausted while fetching ${path}`);
  }
  return res;
}

async function fetchProjectStatusInner(project: Project): Promise<ProjectStatus> {
  const errors: string[] = [];
  const base: ProjectStatus = {
    repo: project.repo,
    label: project.label,
    url: project.url,
    description: null,
    archived: false,
    isFork: false,
    language: null,
    lastPushed: null,
    ci: null,
    dependabotOpen: null,
    uptime: null,
    errors,
  };

  const repoRes = await githubGet(`/repos/${OWNER}/${project.repo}`);
  if (repoRes.status === 404) {
    errors.push("repo not found — renamed or deleted?");
    return base;
  }
  if (!repoRes.ok) {
    errors.push(`repo fetch failed: HTTP ${repoRes.status}`);
    return base;
  }
  const repoData = await repoRes.json();
  base.description = repoData.description ?? null;
  base.archived = Boolean(repoData.archived);
  base.isFork = Boolean(repoData.fork);
  base.language = repoData.language ?? null;
  base.lastPushed = repoData.pushed_at ?? null;
  const defaultBranch: string = repoData.default_branch ?? "main";

  const [runsRes, alertsRes] = await Promise.all([
    githubGet(
      `/repos/${OWNER}/${project.repo}/actions/runs?branch=${encodeURIComponent(
        defaultBranch
      )}&per_page=1&status=completed`
    ),
    githubGet(`/repos/${OWNER}/${project.repo}/dependabot/alerts?state=open&per_page=100`),
  ]);

  if (runsRes.ok) {
    const runsData = await runsRes.json();
    const run = runsData.workflow_runs?.[0];
    base.ci = run
      ? { conclusion: run.conclusion ?? null, runUrl: run.html_url ?? null, at: run.updated_at ?? null }
      : null;
  } else {
    errors.push(`CI runs fetch failed: HTTP ${runsRes.status}`);
  }

  if (alertsRes.status === 403) {
    base.dependabotOpen = null; // disabled on this repo, not an error
  } else if (alertsRes.ok) {
    const alerts = await alertsRes.json();
    base.dependabotOpen = Array.isArray(alerts) ? alerts.length : null;
  } else {
    errors.push(`Dependabot alerts fetch failed: HTTP ${alertsRes.status}`);
  }

  return base;
}

// Wraps the per-project fetch so a single repo's transient failure
// (network blip, unexpected 5xx) renders as a row error instead of
// vanishing the whole dashboard. Fatal conditions (missing token,
// rate limit) still propagate — those mean something is wrong with
// every row, not just this one.
export async function fetchProjectStatus(project: Project): Promise<ProjectStatus> {
  try {
    return await fetchProjectStatusInner(project);
  } catch (e) {
    if (e instanceof FatalGithubError) throw e;
    return {
      repo: project.repo,
      label: project.label,
      url: project.url,
      description: null,
      archived: false,
      isFork: false,
      language: null,
      lastPushed: null,
      ci: null,
      dependabotOpen: null,
      uptime: null,
      errors: [`fetch failed: ${(e as Error).message}`],
    };
  }
}
