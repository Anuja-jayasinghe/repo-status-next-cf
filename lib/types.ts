export type ProjectStatus = {
  repo: string;
  label: string;
  url?: string;
  description: string | null;
  archived: boolean;
  isFork: boolean;
  language: string | null;
  lastPushed: string | null; // ISO 8601
  ci: {
    conclusion: string | null; // success | failure | cancelled | skipped | null
    runUrl: string | null;
    at: string | null;
  } | null;
  dependabotOpen: number | null; // null = disabled or not permitted
  uptime: {
    ratio30d: number | null;
    status: number | null; // 0 paused, 1 not checked, 2 up, 8 seems down, 9 down
  } | null;
  errors: string[]; // human-readable, rendered as a row-level warning
};

export type DashboardData = {
  statuses: ProjectStatus[];
  uptimeWarning: string | null;
};
