# repo-status-next-cf

Static dashboard: CI status, activity, and uptime for ~5 selected projects.

## Constraints
- Next.js `output: 'export'`. No API routes, middleware, or server runtime.
- Server components fetch at BUILD time. Rebuilt every 30 min by GitHub Actions.
- `projects.ts` is the only registry. No per-repo config files.
- No database, no auth, no client-side data fetching (tokens must not reach the browser).
- Deployed to Cloudflare Pages via wrangler from CI, not via Git integration.

## Deliberately absent
No compliance scoring, no check runner, no CLI, no historical data, no filters.
This was scoped down from a much larger design on purpose. Ask before adding.

## Gotchas
- Use each repo's `default_branch` for the Actions runs query, never hardcoded `main`.
- Dependabot 403 means alerts are disabled — that's `null`, not an error, and not 0.
- UptimeRobot v2 is form-encoded POST; `monitors` is hyphen-separated; check `stat === "ok"`.
- Never cache `.next/` in CI — it serves stale fetch results.
- Rows sort stalest-first by design.
