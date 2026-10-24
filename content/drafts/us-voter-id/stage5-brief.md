# Stage 5 brief: building one voter-ID data report

You are building ONE combined data report (a "fact" file) for the Steelview topic `us-voter-id`, as stage 5 of content/WORKFLOW.md. Six other agents are building the other six reports in parallel in the same directory. Today is 2026-10-23.

Repo root: /Users/robennals/.bb/plugins/environment-git-worktree/host-data/worktrees/thr_2svsdu69zv-1/steelview

## Read first (all of it)
- content/WORKFLOW.md — especially stages 3–5.
- content/AUTHORING.md — the standard your file must meet. Read every section; the Data, Sourcing, Charts and Prose style sections and the Checklist are binding.
- lib/content/schema.ts — the exact frontmatter schema (series, additionalSeries, comparisons, sources, dataStillNeeded, relatedFacts).
- content/topics/uk-immigration/facts/incoming-immigration-composition.md and content/topics/uk-immigration/facts/how-people-actually-arrive.md — worked examples of the file format, including `## Observations {#id--observations-<reading-or-comparison-id>}` groups and `### Finding {#id--finding-slug}` headings, footnotes `[n](#source-<fact-id>-<n>)`, and glossary links.
- content/drafts/us-voter-id/outline.md — the viewpoints (draft 4) with their stable ids, and the crux candidates.
- content/drafts/us-voter-id/candidate-data.md — the "Stage-4 review decisions" section, your report's entry in 3c (artifacts, observations by viewpoint), the candidates it lists in 3b, and 3d.

## Your job
Write content/topics/us-voter-id/facts/<your-fact-id>.md implementing your report's plan in 3c:
- **Every source quote fetched and copied verbatim.** Fetch with `curl -sL` (WebFetch paraphrases — never use its output as a quote). For PDFs, curl to $TMPDIR and extract text (e.g. `pdftotext` if present, or python). Never write a quote, figure or date from memory or from the candidate file — the candidate file's figures are leads, many marked unverified. If a figure cannot be confirmed verbatim at source, either drop it or say in the body that it could not be confirmed.
- **Series span the source's full published range** (`coverage.from/to`), with `breaks` for definitional changes. Snapshot comparisons use `comparisons`. Use only the existing chart shapes; do not touch components or lib code.
- **Observations beneath each artifact**, each `###` with a stable id, short scannable summary heading, then detail and footnotes. These are what viewpoints will link to, so make one for each observation listed for each viewpoint in your 3c entry (including the "Against" ones), worded neutrally as findings — the report serves all viewpoints, not one.
- **Neutral Title Case `title`; detailed `claim`** with `claimSources`; status per the 90% test (expect `well-supported` for most; narrow rather than contest).
- **Context**: show the longer run, comparators, denominators, the rest of the record and the mechanism wherever your plan calls for them. Missing comparisons need a stated reason.
- **`dataStillNeeded`** for material gaps (exact measure + why it matters). Only flag a gap as a possible crux in your final reply if its answer would change which viewpoint has the better case.
- **`relatedFacts`** may reference the other six report ids (listed in the candidate file's review-decisions table) where genuinely related.
- **Glossary:** do not edit lib/content/glossary.ts (shared). Only use glossary ids that already exist there. List terms you'd like added in your final reply.
- Bias check before finishing: does every viewpoint that touches your area find its strongest well-supported slice here, and its strongest counter-evidence too?

## Checks
Run `heavy run -- pnpm check:figures` (needs the sandbox disabled: tsx opens a local pipe the sandbox blocks). Every money/percent/thousands figure in prose must appear in a source quote on this topic, or be a validated `derivedFigures` entry. Other agents' files may be mid-edit — fix only errors in your own file; if the loader fails on someone else's file, wait a minute and retry. Also run `heavy run -- pnpm test:unit` once at the end. Do not run e2e tests or the dev server.

## Do not
Touch any other report file, outline, candidate-data file, principle, viewpoint, code, or commit. Do not create viewpoints or cruxes.

## Final reply (under 300 words)
1. The file path and status.
2. Every observation id with a one-line summary, grouped by which viewpoint id(s) it serves (this is what the viewpoints will link to).
3. Planned items you dropped or could not verify, and why.
4. Sources still blocked (for a human to download).
5. Gaps that would actually swing the balance between viewpoints (crux candidates) — if any.
6. Glossary terms wanted.
7. Anything in WORKFLOW.md or AUTHORING.md that was unclear or got in the way.
