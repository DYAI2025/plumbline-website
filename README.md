# Plumbline Website

Public marketing site for **[Plumbline](https://github.com/DYAI2025/Plumbline)** — an
evidence-first agent framework for Claude Code, built to separate "looks done" from
"is done".

This repo contains only the static marketing site (React 19 + Vite 6 + Tailwind 4).
The Plumbline framework itself lives in
[`DYAI2025/Plumbline`](https://github.com/DYAI2025/Plumbline).

**Live site:** see `docs/deployment/qa-report.md` for the current Railway URL and its
verification evidence.

## Local development

```bash
npm install
npm run dev        # vite dev server on :3000
```

Requirements: Node.js ≥ 20 (`.nvmrc` = 22), npm. No environment variables needed.

## Build & checks

```bash
npm run lint       # tsc --noEmit
npm run build      # vite build → dist/
npm run start      # serve dist/ (production command; honors $PORT)
```

## Railway deployment

Configuration is committed in [`railway.json`](railway.json)
(NIXPACKS · build `npm run build` · start `npm run start`). Deploy:

```bash
railway link -p plumbline-website   # once per machine
railway up --detach
railway domain
```

Full details, risks, and repeatable steps:
[`docs/deployment/railway-readiness-report.md`](docs/deployment/railway-readiness-report.md).

## Maintenance / update process

- **Plumbline releases:** the Download CTA points at `releases/latest` — no site change
  needed per release. Cosmetic version literals: see
  [`docs/deployment/download-strategy.md`](docs/deployment/download-strategy.md).
- **Content changes:** edit `src/App.tsx`, run `npm run lint && npm run build`, deploy
  via `railway up` (or GitHub auto-deploy if connected).
- **Link health:** every CTA/link is inventoried in
  [`docs/deployment/link-button-audit.md`](docs/deployment/link-button-audit.md) —
  re-run the curl checks there after content changes.
- **QA evidence:** [`docs/deployment/qa-report.md`](docs/deployment/qa-report.md).

## House rule

This site markets an honesty framework — so it has to be honest itself.
**No CTA without a real destination, no claim without a verified source.** The sponsor
section deliberately ships *without* payment buttons until a real sponsoring channel is
live.
