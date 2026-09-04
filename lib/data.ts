import { projects } from "@/projects";
import { fetchProjectStatus } from "@/lib/github";
import { fetchUptimeByMonitorId } from "@/lib/uptime";
import type { DashboardData } from "@/lib/types";

export async function getAllStatuses(): Promise<DashboardData> {
  const statuses = await Promise.all(projects.map(fetchProjectStatus));

  const monitorIds = projects
    .map((p) => p.monitor)
    .filter((id): id is number => typeof id === "number");
  const { byId, warning } = await fetchUptimeByMonitorId(monitorIds);

  for (let i = 0; i < projects.length; i++) {
    const monitor = projects[i].monitor;
    if (typeof monitor === "number") {
      statuses[i].uptime = byId.get(monitor) ?? null;
    }
  }

  return { statuses, uptimeWarning: warning };
}
