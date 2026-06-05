# Link & Button Audit — plumbline-website

**Date:** 2026-06-05 · **Audited build:** commit `HEAD` of `railway-static-marketing-site`, live at
https://plumbline-website-production.up.railway.app
**Method:** headless-Chromium DOM extraction of every `<a>`/`<button>` on the LIVE site + `curl -L` on every external target + scroll verification of in-page anchors. All in-page anchors machine-checked: **0 unresolved** (`UNRESOLVED_ANCHORS: []`).

## Links

| Element | Typ | Ziel/Funktion | Status | Mehrwert | Evidence | Entscheidung |
|---------|-----|---------------|--------|----------|----------|--------------|
| Nav "The Gap" | anchor | `#gap` | WORKING | section orientation | id present in live DOM | keep |
| Nav "The Ledger" | anchor | `#ledger` | WORKING | section orientation | id present | keep |
| Nav "Machine Room" | anchor | `#machine` | WORKING | section orientation | id present | keep |
| Nav "Benchmarks" | anchor | `#bench` | WORKING | section orientation | id present | keep |
| Nav "Install" | anchor | `#install` | WORKING | primary user goal | id present | keep |
| Nav "Requirements" | anchor | `#requirements` | WORKING | user goal (req. understanding) | scroll-to verified: top=196px after click | keep |
| Nav "Updates" | anchor | `#updates` | WORKING | user goal (update process) | scroll-to verified: top=196px | keep |
| Nav "Sponsor" | anchor | `#support` | WORKING | honest patronage info | id present | keep |
| Nav "GitHub" | extern | `github.com/DYAI2025/Plumbline` | WORKING | primary CTA | curl -L → 200 | keep |
| Mobile header "Install" | anchor | `#install` | WORKING | mobile primary CTA | live mobile DOM (390px) | keep |
| Hero "View on GitHub" | extern | repo | WORKING | primary CTA | curl 200 + live DOM | keep |
| Hero "Download Plumbline" | extern | `releases/latest` | WORKING | primary CTA, evergreen | curl -L → 200; release v0.14.0 exists | keep |
| Hero "See the install" | anchor | `#install` | WORKING | primary CTA | id present | keep |
| Hero "Explore the agents" | anchor | `#machine` | WORKING | secondary CTA | id present | keep |
| Install "Read Setup Guide" | extern | `…/blob/main/SETUP.md` | WORKING | real docs (was fake toast) | curl -L → 200 | **fixed** (was PLACEHOLDER) |
| Install "Download Latest" | extern | `releases/latest` | WORKING | download | curl 200 | keep |
| Install "Open GitHub Repo" | extern | repo | WORKING | CTA | curl 200 | keep |
| Install "Launch Agent Explorer" | anchor | `#machine` | WORKING | in-page nav | id present | keep |
| Support "Star the repo" | extern | repo | WORKING | real support action | curl 200 | keep |
| Support "Watch releases" | extern | `…/releases` | WORKING | real support action | curl -L → 200 | keep |
| Manifesto "View on GitHub" | extern | repo | WORKING | closing CTA (was fake toast btn) | curl 200 | **fixed** |
| Manifesto "Install locally" | anchor | `#install` | WORKING | closing CTA | id present | keep |
| Footer "github.com/DYAI2025/Plumbline" | extern | repo | WORKING | reference (was plain text) | curl 200 | **fixed** |

## Buttons (non-link interactive elements)

| Element | Typ | Ziel/Funktion | Status | Mehrwert | Evidence | Entscheidung |
|---------|-----|---------------|--------|----------|----------|--------------|
| Vertical section nav (10×, 00–09) | button | smooth-scroll to section | WORKING | page orientation | present in live DOM, scroll behavior code-reviewed | keep |
| Claim deconstructors (5×: tested/reviewed/merged/approved/done) | button | toggle forensic explanation | WORKING | core interactive metaphor | live DOM + state code-reviewed | keep |
| Explorer filters (4×: All/Core/Process/Governance) | button | filter command list | WORKING | explore real commands | live DOM | keep |
| Explorer search input | input | filter command list | WORKING | explore | live DOM | keep |
| TerminalBlock "Copy" (2×) | button | copy install command to clipboard | WORKING | install convenience | code-reviewed (clipboard API; not verifiable headless) | keep |

## Removed in this change set (fake/mock elements)

| Element | War | Status | Entscheidung |
|---------|-----|--------|--------------|
| Sponsor tier "Select" (3×, $12/$80/$450) | button → mock dialog "Unwired mock API" | REMOVED | replaced by honest "no payment channel live yet" + real star/watch links |
| Sponsor "Confirm PLEDGE" modal | fake payment flow | REMOVED | — |
| "Read Setup Guide" toast | button → toast only | REMOVED (replaced by real link) | — |
| Manifesto "Explore Plumbline" toast | button → toast only | REMOVED (replaced by real `<a>`) | — |
| Toast system (`showToast`) | dead UI feedback | REMOVED | no remaining caller |

## Summary

| Status | Count | Notes |
|--------|------:|-------|
| WORKING | 23 links + 21 buttons/inputs | every target curl-200 or DOM-resolved |
| BROKEN | 0 | |
| PLACEHOLDER | 0 | |
| REMOVED | 5 element groups | all former fakes |
| DEFERRED | 1 | active sponsor/payment button — deferred until GitHub Sponsors profile for DYAI2025 is approved (currently redirects to org page; verified 2026-06-05) |

**TODO (sponsor follow-up):** when `github.com/sponsors/DYAI2025` goes live → add real sponsor button in section 08, remove "not-wired" tag, update this audit.
