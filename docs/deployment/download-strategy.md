# Download Strategy — Plumbline

**Date:** 2026-06-05

## Chosen strategy: GitHub Releases (Variant 1)

The main repo `DYAI2025/Plumbline` publishes releases via release-please.
The website's "Download Plumbline" CTA links to the **evergreen** URL:

```
https://github.com/DYAI2025/Plumbline/releases/latest
```

**Evidence (2026-06-05):**
- `gh release list --repo DYAI2025/Plumbline` → `v0.14.0 (Latest, 2026-06-04)`, `v0.13.1`, `v0.13.0`
- `curl -w %{http_code}` on `releases/latest` → 302 → release tag page (expected GitHub behavior)
- `curl -L .../archive/refs/tags/v0.14.0.zip` → HTTP 200 (ZIP downloadable)

## Why not the alternatives

- **Variant 2 (repo ZIP of main):** unnecessary — releases exist and are versioned.
- **Variant 3 (local artifact in this repo):** rejected — would duplicate the release artifact, drift from upstream versions, and bloat this repo.

## Versioning / update process

- The CTA uses `releases/latest`, so **no website change is needed when a new Plumbline version ships** — GitHub resolves it.
- The only version literal on the page is the illustrative terminal caption `v0.14.0` (section 07). It matches the latest release at publish time and is labeled "output illustrative — commands real". **On significant releases:** grep the site for the old tag (`grep -rn "v0\." src/`) and bump.
- Hero stats ("86 Subagents", "16 Vendored Skills") are point-in-time counts (methodology in `docs/plans/2026-06-05-railway-static-marketing-site.md`). Re-count when the main repo's agent library changes materially.

## Risks

| Risk | Mitigation |
|------|------------|
| Release flow on main repo changes/stops | `releases/latest` would 404 → caught by the linkcheck in the QA process (see qa-report.md) |
| Version literal on page goes stale | grep + bump as part of any content update; the literal is cosmetic, not a download target |
