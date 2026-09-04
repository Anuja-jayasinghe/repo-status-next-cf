import { OWNER } from "@/projects";
import type { DashboardData, ProjectStatus } from "@/lib/types";
import { relativeTime } from "@/lib/relativeTime";

function sortStalestFirst(statuses: ProjectStatus[]): ProjectStatus[] {
  return [...statuses].sort((a, b) => {
    if (!a.lastPushed && !b.lastPushed) return 0;
    if (!a.lastPushed) return 1;
    if (!b.lastPushed) return -1;
    return new Date(a.lastPushed).getTime() - new Date(b.lastPushed).getTime();
  });
}

function CiDot({ ci }: { ci: ProjectStatus["ci"] }) {
  if (!ci) {
    return <span className="text-neutral-400 dark:text-neutral-600">—</span>;
  }
  const color =
    ci.conclusion === "success"
      ? "bg-emerald-500"
      : ci.conclusion === "failure"
      ? "bg-red-500"
      : "bg-neutral-400 dark:bg-neutral-600";
  const label = ci.conclusion ?? "unknown";
  const dot = <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} aria-hidden />;
  if (!ci.runUrl) {
    return (
      <span className="inline-flex items-center gap-2" title={label}>
        {dot} <span className="capitalize">{label}</span>
      </span>
    );
  }
  return (
    <a
      href={ci.runUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 hover:underline"
      title={label}
    >
      {dot} <span className="capitalize">{label}</span>
    </a>
  );
}

function AlertsCell({ dependabotOpen }: { dependabotOpen: number | null }) {
  if (dependabotOpen === null) {
    return <span className="text-neutral-400 dark:text-neutral-600">—</span>;
  }
  return (
    <span className={dependabotOpen > 0 ? "font-medium text-amber-600 dark:text-amber-400" : ""}>
      {dependabotOpen}
    </span>
  );
}

function UptimeCell({ uptime }: { uptime: ProjectStatus["uptime"] }) {
  if (!uptime || uptime.ratio30d === null) return null;
  return <span>{uptime.ratio30d.toFixed(2)}%</span>;
}

function LiveDot({ uptime }: { uptime: ProjectStatus["uptime"] }) {
  if (!uptime || uptime.status === null) return null;
  const down = uptime.status === 8 || uptime.status === 9;
  const up = uptime.status === 2;
  const color = up ? "bg-emerald-500" : down ? "bg-red-500" : "bg-neutral-400 dark:bg-neutral-600";
  const label = up ? "up" : down ? "down" : "unknown";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} title={label} aria-hidden />;
}

function ProjectLink({ row }: { row: ProjectStatus }) {
  return (
    <>
      <a
        href={`https://github.com/${OWNER}/${row.repo}`}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-neutral-900 hover:underline dark:text-neutral-100"
      >
        {row.label}
      </a>
      {row.archived && (
        <span className="ml-2 text-xs text-neutral-400 dark:text-neutral-600">archived</span>
      )}
      {row.errors.length > 0 && (
        <div className="mt-0.5 text-xs text-red-500">{row.errors.join("; ")}</div>
      )}
    </>
  );
}

function ProjectCard({ row }: { row: ProjectStatus }) {
  return (
    <div
      className={`rounded-lg border border-neutral-200 p-4 dark:border-neutral-800 ${
        row.archived || row.errors.length > 0 ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <ProjectLink row={row} />
        </div>
        <LiveDot uptime={row.uptime} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-neutral-500 dark:text-neutral-400">CI</dt>
          <dd className="mt-0.5">
            <CiDot ci={row.ci} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500 dark:text-neutral-400">Last commit</dt>
          <dd className="mt-0.5 text-neutral-600 dark:text-neutral-400">
            {relativeTime(row.lastPushed)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500 dark:text-neutral-400">Alerts</dt>
          <dd className="mt-0.5">
            <AlertsCell dependabotOpen={row.dependabotOpen} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500 dark:text-neutral-400">Uptime</dt>
          <dd className="mt-0.5 text-neutral-600 dark:text-neutral-400">
            <UptimeCell uptime={row.uptime} />
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default function Dashboard({ data, generatedAt }: { data: DashboardData; generatedAt: string }) {
  const rows = sortStalestFirst(data.statuses);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-2xl">
          Repo status
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          CI, activity, and uptime for {OWNER}&apos;s active projects. Sorted stalest first.
        </p>
      </header>

      {data.uptimeWarning && (
        <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
          {data.uptimeWarning}
        </div>
      )}

      {/* Cards below sm; table at sm and up. */}
      <div className="space-y-3 sm:hidden">
        {rows.map((row) => (
          <ProjectCard key={row.repo} row={row} />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 sm:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">CI</th>
              <th className="px-4 py-3 font-medium">Last commit</th>
              <th className="px-4 py-3 font-medium">Alerts</th>
              <th className="px-4 py-3 font-medium">Uptime</th>
              <th className="px-4 py-3 font-medium">Live</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {rows.map((row) => (
              <tr
                key={row.repo}
                className={row.archived || row.errors.length > 0 ? "opacity-50" : ""}
              >
                <td className="px-4 py-3">
                  <ProjectLink row={row} />
                </td>
                <td className="px-4 py-3">
                  <CiDot ci={row.ci} />
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                  {relativeTime(row.lastPushed)}
                </td>
                <td className="px-4 py-3">
                  <AlertsCell dependabotOpen={row.dependabotOpen} />
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                  <UptimeCell uptime={row.uptime} />
                </td>
                <td className="px-4 py-3">
                  <LiveDot uptime={row.uptime} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="mt-6 text-xs text-neutral-400 dark:text-neutral-600">
        Generated {relativeTime(generatedAt)}
      </footer>
    </main>
  );
}
