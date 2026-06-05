# Plan: Railway static marketing site for Plumbline

**Date:** 2026-06-05
**Branch:** `railway-static-marketing-site`
**Repo:** https://github.com/DYAI2025/plumbline-website (cloned at `48d1dd6`)

## Verified facts (evidence-first ground truth)

| Fact | Value | Evidence |
|------|-------|----------|
| Main repo URL | `https://github.com/DYAI2025/Plumbline` | `git remote -v` in local main-repo checkout |
| Latest release | `v0.14.0` (2026-06-04) | `gh release list --repo DYAI2025/Plumbline` |
| Release ZIP downloadable | yes (HTTP 200) | `curl -L .../archive/refs/tags/v0.14.0.zip` |
| `releases/latest` resolves | yes (302 → tag page) | `curl -w %{http_code}` |
| GitHub Sponsors profile | **NOT live** — `github.com/sponsors/DYAI2025` redirects to org profile | `curl -L -w %{url_effective}` → `https://github.com/DYAI2025` |
| Buy Me a Coffee / Patreon / Ko-fi | none found in main repo | `grep -ri` over main repo |
| Agent count | 86 files with `name:` frontmatter (excl. config/docs/metrics/explorer) | `find + grep` count |
| Vendored skills | 16 (17 dir entries minus `agent-learning-loop.json`) | `ls config/claude/skills/` |
| Install command | `git clone https://github.com/DYAI2025/Plumbline plumbline && cd plumbline && ./config/claude/install.sh` | `SETUP.md` §1 |
| Plumbline requirements | Claude Code (hard), `git`, `jq` (hook registration), `python3` (metrics/validators), bash | `SETUP.md` §2 |
| Update process | `/plumbline-update check|apply` with verified-or-revert semantics; rollback via `plumbline rollback` | `config/claude/commands/plumbline-update.md` |
| Real commands | /agileteam, /agileteam-bench, /bench-oracle, /concilium, /honest-status, /merge-when-true, /plumbline-update, /reflect, /reflect-skills | `ls config/claude/commands/` |
| prefers-reduced-motion | already implemented via GravityPointerContext (`matchMedia`), particle budget 5/25/85 | `src/context/GravityPointerContext.tsx:44` |

## Defects found (current site)

1. **Fake sponsor flow** — 3 tiers ($12/$80/$450) → mock dialog ("Unwired mock API", "Confirm PLEDGE"). Violates no-fake-buttons rule.
2. **Fake "Read Setup Guide" button** — toast only, no destination.
3. **Fabricated agent commands** in explorer: `/ledgertrace`, `/honeststatus`, `/secops`, `/smokecheck` do not exist.
4. **Fabricated version** "v1.0.4" in install terminal mock (real: v0.14.0).
5. **No download CTA** anywhere.
6. **No Requirements / Update-process sections.**
7. **AI Studio leftovers:** `@google/genai`, `express`, `dotenv`, `tsx` deps; GEMINI_API_KEY in `.env.example`; README boilerplate; `package.json` name "react-example"; metadata.json claims server-side Gemini.
8. **No Railway config** (no railway.json, no static serve strategy, no Node pin).
9. `animate-pulse` on Patronage headline (distracting; minor).

## Definition of Done (each bullet names its proving check)

| # | DoD item | Proving check |
|---|----------|---------------|
| D1 | Repo builds locally without errors | `npm ci && npm run build` exit 0 |
| D2 | Typecheck clean | `npm run lint` (tsc --noEmit) exit 0 |
| D3 | Railway deployment publicly reachable | `curl -I <live-url>` → 200 |
| D4 | GitHub link works | `curl` 200 on `github.com/DYAI2025/Plumbline` + present in built HTML/JS |
| D5 | Download CTA works | link → `releases/latest` (verified 302→200); rendered on page |
| D6 | Install/Requirements/Update sections present & factual | section IDs in DOM; commands match SETUP.md |
| D7 | No fake-active buttons | link-button-audit.md: 0 PLACEHOLDER-as-active; sponsor mock removed (grep for sponsorDialog = gone) |
| D8 | Every CTA/link audited | `docs/deployment/link-button-audit.md` complete matrix |
| D9 | QA report exists with evidence classes | `docs/deployment/qa-report.md` |
| D10 | Railway config documented | `railway.json` + `docs/deployment/railway-readiness-report.md` |
| D11 | Download strategy documented | `docs/deployment/download-strategy.md` |
| D12 | README rewritten (dev/build/deploy/live URL) | file content |
| D13 | Live smoke test of nav/CTAs/mobile | curl + browser checks documented in qa-report |
| D14 | No secrets committed | `git diff` review; .env.example sanitized |

## Task slices

1. **T2 Railway-ability:** `railway.json` (NIXPACKS or default builder; build `npm run build`; start static serve of `dist/` honoring `$PORT`), remove unused deps, pin Node via `engines` + `.nvmrc`, sanitize `.env.example`, fix package.json name/version.
2. **T3 Content:** remove fake sponsor flow → honest "sponsoring not yet open" note (no active buttons); "Read Setup Guide" → real link (main repo SETUP.md); Download CTA → releases/latest; new sections: Requirements, Updates; real command list in explorer; version string fix; hero CTA set per spec.
3. **T4 Motion:** verify reduced-motion paths (mostly done), remove `animate-pulse` headline, focus-visible states on interactive elements.
4. **T5 Docs:** README + 4 deployment docs.
5. **T6 Independent review** (code-reviewer agent on diff).
6. **T7 Local QA** (install/lint/build/preview/linkcheck/sizes).
7. **T8 Deploy Railway** (CLI authed as DYAI ✓), domain, logs.
8. **T9 Live smoke** + qa-report.
9. **T10 Push + PR.**

## Risks

- Railway builder choice: static serve needs a server honoring `$PORT` → use `serve` package (`npx serve -s dist -l $PORT` equivalent: `serve -s dist -l tcp://0.0.0.0:$PORT`).
- Sponsor section removal changes nav ("PATRONAGE" item) — keep section but honest, or drop nav item; decided: keep section, honest copy, no fake buttons.
- Cost: new Railway project may incur usage — flag before `railway init` (stop-rule: no plan changes without human confirm; deploying a service on existing account assumed OK per task instruction "Nutze Railway gemäß vorhandener Authentifizierung").
