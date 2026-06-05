# QA Report — plumbline-website Railway deployment

**Date:** 2026-06-05 · **Branch:** `railway-static-marketing-site`
**Live URL:** https://plumbline-website-production.up.railway.app
**Railway project:** `plumbline-website` (`59466b00-15d9-4756-a441-61c397f9bdd7`), service `plumbline-website`, env `production`

## Executed checks

| Check | Command/Method | Result | Evidence class | Limitation |
|-------|----------------|--------|----------------|------------|
| Dependency install | `npm install` (lockfile generated) | PASS, 0 vulnerabilities | local | — |
| Lockfile consistency | `npm ci --dry-run` (independent reviewer) | PASS | local | — |
| Typecheck | `npm run lint` (`tsc --noEmit`) | PASS (exit 0) | local | no ESLint configured (follow-up) |
| Unit tests | — | **MISSING** | — | no test suite exists in this repo; risk low for a static marketing page, follow-up: add a smoke/render test |
| Build | `npm run build` | PASS, 1682 modules, dist 344 KB (JS 291 kB/84 kB gz, CSS 60 kB/10 kB gz) | local | — |
| Local prod serve | `PORT=4199 npm run start` + curl | PASS (200, PORT honored, 0.0.0.0 bound) | local | — |
| Deploy | `railway up --service plumbline-website` | PASS (service Online) | production | — |
| **Deployed artifact = HEAD** | live JS bundle hash == local build hash (`index-DDzCC-_O.js`) | PASS | **production-verified** | — |
| Live root | `curl` → 200, correct `<title>` | PASS | production-verified | — |
| Live assets | JS + CSS curl → 200 | PASS | production-verified | — |
| SPA fallback | `curl /some/route` → 200 index.html | PASS | production-verified | — |
| robots.txt | `curl /robots.txt` → 200 text file | PASS | production-verified | — |
| Runtime logs | `railway logs` | clean; 200s in 1–8 ms | production-verified | — |
| External links (all 4 targets) | `curl -L` each | all 200 (repo, SETUP.md, /releases, /releases/latest) | real-boundary | GitHub availability at check time |
| In-page anchors | headless Chromium: every `href="#…"` vs. DOM ids | **0 unresolved** | production-verified | — |
| No fake CTAs | live DOM extraction of all `<a>`/`<button>` + audit matrix | PASS — every element has real target/effect | production-verified | see link-button-audit.md |
| Content sections | live DOM markers: What-is, Requirements, Updates, install commands, 7 core concepts, honest sponsor state | all PRESENT | production-verified | — |
| Anchor scroll | headless click `#requirements`/`#updates` → element at top≈196px | PASS | production-verified | — |
| Hero headline | aria-label + resolved text = "Does it hang true?" | PASS | production-verified | split-flap needs ~5 s to resolve (by design) |
| Console errors | pageerror/console-error listeners during full load | none | production-verified | headless Chromium |
| Mobile usability | headless 390×844: no horizontal overflow, Install CTA present, visual screenshot clean | PASS | production-verified | emulated device, not physical |
| Reduced motion | code path review (`matchMedia('(prefers-reduced-motion: reduce)')` gates particles/cursor/headline; CSS `motion-reduce:` on decorative pulses) | PASS | code-reviewed | not exercised in live browser |
| Lighthouse | `lighthouse@12`, headless Chromium, 6 runs total | see below | real-boundary (lab) | local machine under load → run variance |

## Lighthouse (live URL, lab conditions)

Final build (runs 5–6, after CLS fix):

| Category | Run 5 | Run 6 | Target | Verdict |
|----------|------:|------:|-------:|---------|
| Performance | **86** | **84** | ≥85 | **borderline met** (median ≈85, ±2 machine-noise band) |
| Accessibility | **98** | 98 | ≥90 | PASS |
| Best Practices | **100** | 100 | ≥90 | PASS |
| SEO | **100** | 100 | ≥90 | PASS |

Optimization trail (all measured on the live site):
1. Baseline: perf 81 / seo 82 — missing meta description, robots.txt 404→HTML, fonts via render-blocking CSS `@import`, unused Material Symbols family.
2. Fix 1 (fonts→`<link>`+preconnect, meta, OG, robots.txt): SEO 82→**100**, FCP 3.1→1.9 s — but exposed font-swap CLS (0.27–0.58 across runs).
3. Fix 2 (preload above-the-fold woff2): insufficient alone — CLS dominated by the split-flap headline animation reflowing the hero.
4. Fix 3 (lock split-flap layout to final glyphs, scramble as absolute overlay): **CLS 0.27–0.58 → 0.001–0.004**, perf 56–81 → 84–86. Brand animation fully preserved.

## Open defects / risks

| Issue | Severity | Status | Next action |
|-------|----------|--------|-------------|
| Perf score sits at the 85 boundary (FCP ~3 s, SPA JS boot) | low | OPEN | optional: route-level code-split or pre-render hero HTML; re-measure on quiet machine/PageSpeed |
| No automated tests / CI in this repo | medium | OPEN | follow-up: GitHub Action `npm ci && lint && build` + a render smoke test |
| Sponsor channel deliberately absent | info | DEFERRED | activate when github.com/sponsors/DYAI2025 is approved (see link-button-audit.md TODO) |
| Stats (86 agents/16 skills) + v0.14.0 literal are point-in-time | low | DOCUMENTED | see download-strategy.md update process |
| Lighthouse run variance on loaded dev machine | info | DOCUMENTED | re-verify with PageSpeed Insights for stable lab numbers |

## Evidence class of this report

**PRODUCTION-OBSERVED** for: reachability, artifact identity (hash match), links, anchors, content sections, mobile layout, console cleanliness, runtime logs.
**Lab-measured** for Lighthouse. **Code-reviewed** for reduced-motion paths. **MISSING** for automated unit tests (none exist).
