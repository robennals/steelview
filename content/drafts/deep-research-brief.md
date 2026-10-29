# Brief: deep research for a trial topic

You are taking one Steelview trial topic from "stage 4 drafted" to "deeply
researched": every argument each viewpoint makes is either grounded in a fact
confirmed at its source, or explicitly marked as unsupported, and every planned
report has a concrete visualization plan. Today is 2026-10-26.

Repo root: /Users/robennals/.bb/plugins/environment-git-worktree/host-data/worktrees/thr_2svsdu69zv-1/steelview

## Read first
- content/WORKFLOW.md (all stages; the crux rule in 4a; the "Brief for a report builder" appendix — its sourcing rules apply to you).
- content/AUTHORING.md, especially Data, Sourcing, Charts.
- Your topic's content/drafts/<slug>/outline.md and candidate-data.md.
- The component library: components/report/index.ts, components/report/Introduction.mdx and the stories in components/report/stories/ (read the component props). These are the visualizations available: KeyFigures, BarChart, SliceExplorer, CompositionBar, SmallMultiples, EstimateRange, DataTable, GeoMap, TileMap (incl. US state tiles), Timeline, PeriodTimeline, EventStrip, QuoteBrowser, PullQuote, QuoteComparison, ClaimCheck, CaveatList, plus the existing SeriesChart and ComparisonChart. **Important:** today only SeriesChart and ComparisonChart can be used from a fact file's frontmatter (lib/content/schema.ts); EventStrip is being wired in now as series `events`. Any other component would need wiring before a report can use it — so say which ones each report needs.
- For a worked example of a built report to this standard, see content/topics/us-voter-id/facts/ (seven reports built from verbatim quotes).

## Your job
1. **Verify at source.** For every candidate that a viewpoint argument or a planned observation relies on, fetch the primary source with `curl -sL` (PDFs to text), confirm the figure and its exact wording, and record the verbatim quote (≤ 3 sentences) with URL, publisher and date. Never take a figure from memory, a search snippet or WebFetch's summary. If you cannot reach a source, try an archived copy (web.archive.org) and then an official mirror; otherwise list it as blocked. Mark each candidate **verified**, **corrected** (figure differs — give the right one), **unverifiable** (and why) or **dropped**. Prioritise depth on the candidates the viewpoints most rely on; skip candidates no argument uses.
2. **Ground each viewpoint.** Add a section `## Viewpoint grounding` to candidate-data.md: for each viewpoint id, each argument from outline.md with the verified fact(s) it rests on (candidate number, the confirmed figure), and its strongest well-supported concession. Mark any argument left without a verified fact as **unsupported** — and then apply stage 4a: revise outline.md so each viewpoint asserts only what is supported (drop or narrow), adding the strongest arguments the verified data makes available, and record the changes in its Revision notes. Apply the crux rule strictly: an open question is a crux only if its answer would change which viewpoint has the better case.
3. **Plan the visualizations.** Add `## Visualization plan`: for each combined report in 3c, its artifacts in reading order, each with the component it uses, the data it needs (with the source and its full published range), and why that component. Readability rules apply to the plan: the opening is a brief overview of two or three short sentences; statistics appear in visualizations, not recited in prose; paragraphs are at most four lines; dated events or policy changes go on an EventStrip under the chart rather than in a block of text.
4. **List what's missing.** Add `## Visualizations needed`: (a) library components the plan uses that are not yet wired into fact frontmatter, and (b) any visualization the data needs that no library component provides, with a one-paragraph spec (what it shows, inputs, why no existing component fits).

## Rules
- Use web search sparingly: a per-turn search budget is shared with other agents. Prefer `curl` on known URLs, and archived copies. You may delegate verification to at most three subagents of your own; give each an explicit list of candidates.
- **Never send the user's email address, name or credentials to any service**, including research APIs that ask for a contact email.
- Edit only your topic's outline.md and candidate-data.md (and create files only under content/drafts/<slug>/). Do not touch content/topics, principles, code, or other topics' drafts. Do not commit.

## Final reply (under 400 words)
Counts (verified / corrected / unverifiable / dropped); the biggest corrections; per viewpoint, whether it is now well grounded, thin, or rests mainly on values; changes made to the outline; the visualization needs (wiring and genuinely new components); blocked sources for a human to fetch.
