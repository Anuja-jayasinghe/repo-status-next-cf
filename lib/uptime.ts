export type UptimeInfo = { ratio30d: number | null; status: number | null };

// Maps UptimeRobot monitor ID -> parsed uptime info. Returns null (with a
// warning) if the API call itself fails; a repo simply not being monitored
// is represented by the caller never looking it up, not by an entry here.
export async function fetchUptimeByMonitorId(
  monitorIds: number[]
): Promise<{ byId: Map<number, UptimeInfo>; warning: string | null }> {
  const byId = new Map<number, UptimeInfo>();
  if (monitorIds.length === 0) return { byId, warning: null };

  const apiKey = process.env.UPTIMEROBOT_KEY;
  if (!apiKey) {
    return { byId, warning: "UPTIMEROBOT_KEY not set — uptime data unavailable" };
  }

  try {
    const res = await fetch("https://api.uptimerobot.com/v2/getMonitors", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_key: apiKey,
        format: "json",
        custom_uptime_ratios: "30",
        monitors: monitorIds.join("-"),
      }),
    });

    if (!res.ok) {
      return { byId, warning: `UptimeRobot API returned HTTP ${res.status}` };
    }

    const data = await res.json();
    if (data.stat !== "ok") {
      return { byId, warning: `UptimeRobot API returned stat=${data.stat ?? "unknown"}` };
    }

    for (const monitor of data.monitors ?? []) {
      const ratioRaw = String(monitor.custom_uptime_ratio ?? "").split("-")[0];
      const ratio = ratioRaw ? Number.parseFloat(ratioRaw) : NaN;
      byId.set(monitor.id, {
        ratio30d: Number.isFinite(ratio) ? ratio : null,
        status: typeof monitor.status === "number" ? monitor.status : null,
      });
    }
    return { byId, warning: null };
  } catch (e) {
    return { byId, warning: `UptimeRobot fetch failed: ${(e as Error).message}` };
  }
}
