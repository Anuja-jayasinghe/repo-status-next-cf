# repo-status

Static dashboard showing CI status, activity, and uptime for a hand-picked list of projects.

![CI](https://github.com/Anuja-jayasinghe/repo-status-next-cf/actions/workflows/refresh.yml/badge.svg)

## Quickstart

```bash
npm install
GH_TOKEN=... UPTIMEROBOT_KEY=... npm run build
npx serve out
```

`projects.ts` is the only hand-maintained input — add or remove a repo there.

## Deployed

Cloudflare Pages, rebuilt on a 30-minute cron by `.github/workflows/refresh.yml`. Deployed via
`wrangler` from GitHub Actions, not via Cloudflare's Git integration — see `CLAUDE.md` for why.

## License

MIT
