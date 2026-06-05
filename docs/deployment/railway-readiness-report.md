# Railway Readiness Report — plumbline-website

**Date:** 2026-06-05 · **Branch:** `railway-static-marketing-site`

## Stack

| Item | Value | Evidence |
|------|-------|----------|
| Framework | React 19 + Vite 6 (SPA, single page) | `package.json`, `vite.config.ts` |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` | `vite.config.ts`, `src/index.css` |
| Language | TypeScript ~5.8 (`tsc --noEmit` as lint) | `tsconfig.json` |
| Package manager | npm (lockfile committed) | `package-lock.json` |
| Node version | `engines: >=20`, `.nvmrc` = 22 | `package.json`, `.nvmrc` |
| Origin | Google AI Studio export, converted to standalone static site | git history `663280f`, removed Gemini/express/dotenv leftovers |

## Build / Start / Output

| | Command | Notes |
|---|---------|-------|
| Build | `npm run build` (= `vite build`) | exit 0 locally; 1682 modules |
| Start | `npm run start` (= `serve -s dist -l tcp://0.0.0.0:${PORT:-4173}`) | binds 0.0.0.0, honors Railway-injected `$PORT`; `-s` = SPA fallback to index.html |
| Output dir | `dist/` | ~344 KB total; JS 290 kB (84 kB gzip), CSS 60 kB (10 kB gzip) |
| Typecheck | `npm run lint` (= `tsc --noEmit`) | exit 0 |

## Railway configuration

`railway.json` (committed):

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": { "builder": "NIXPACKS", "buildCommand": "npm run build" },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

- Project: `plumbline-website` (id `59466b00-15d9-4756-a441-61c397f9bdd7`, workspace "DYAI's Projects")
- Service: `plumbline-website`, environment `production`
- Deployed via `railway up` from CLI (v4.61.1, authenticated)
- **Environment assumptions:** no environment variables required; Railway injects `PORT` only. No secrets anywhere in the repo (`.env.example` documents this).
- Nixpacks note: Nixpacks auto-detects Vite and prepares a Caddy static asset path; the explicit `deploy.startCommand` in `railway.json` takes precedence and uses `serve`.

## Deployment steps (repeatable)

```bash
railway link -p plumbline-website   # or: railway init --name plumbline-website (first time)
railway up --detach                 # build + deploy current directory
railway domain                      # generate/show public domain
railway logs                        # runtime logs
```

Alternative: connect the GitHub repo in the Railway dashboard for auto-deploy on push (build/start config is read from the committed `railway.json`).

## Known risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| `serve` SPA fallback rewrites unknown routes to index.html | low | intended for SPA; no server routes exist |
| Hero stats (86 subagents / 16 skills) + release tag v0.14.0 are point-in-time facts | low | documented in download-strategy.md; re-check on content updates |
| Free/usage-based Railway plan limits (sleep, bandwidth) | low | static site, tiny footprint; monitor via Railway dashboard |
| No CI on this repo yet | medium | follow-up: GitHub Action running `npm ci && npm run lint && npm run build` |
