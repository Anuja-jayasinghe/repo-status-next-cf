const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["week", 7 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });

export function relativeTime(iso: string | null): string {
  if (!iso) return "unknown";
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  if (abs < 60_000) return "just now";
  for (const [unit, ms] of UNITS) {
    if (abs >= ms) {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
  return "just now";
}
