export const OWNER = "Anuja-jayasinghe";

export type Project = {
  repo: string;
  label: string;
  url?: string; // live site, if any
  monitor?: number; // UptimeRobot monitor ID
};

export const projects: Project[] = [
  { repo: "AnujaJay-com", label: "Portfolio", url: "https://anujajay.com" },
  { repo: "Solar-Analytics-Dashboard", label: "Solar Analytics" },
];
