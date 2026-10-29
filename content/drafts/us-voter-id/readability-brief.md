# Brief: readability rewrite of voter-ID reports

The human read the voter-ID reports rendered and found them hard to read: the
first report opens with a wall of text, and the mail-ballot rejection chart
was followed by a block of text about when the laws changed. Your job is to
rewrite your assigned report files so they meet the new rules, without losing
any finding or source. Today is 2026-10-26.

Repo root: /Users/robennals/.bb/plugins/environment-git-worktree/host-data/worktrees/thr_2svsdu69zv-1/steelview

## Read first
- content/AUTHORING.md: the new **Readability** section, the `claim` guidance
  under "Titles and opening findings", and "Events are marked, not narrated"
  in Charts.
- lib/content/schema.ts: series now take `events` (period, label, optional
  note, optional `source` citation number). See how
  content/topics/us-voter-id/facts/burdens-of-id-and-citizenship-rules.md
  marks SB 1 and SB 202 on its rejection chart.

## Rules
1. **Overview:** rewrite `claim` as two or three short sentences (≤ 70 words)
   saying what the report covers and what it mainly finds. Keep it true; keep
   `claimSources` accurate.
2. **No paragraph over four lines (~60 words).** Split or turn into a list.
3. **Statistics live in visualizations.** Where an observation recites
   numbers that a chart already shows, say what to notice instead. Where a
   finding rests on several numbers that no chart shows, add a chart using
   the existing shapes (`comparisons` for snapshots, `series` /
   `additionalSeries` for time series) or a compact markdown table, built
   only from figures already quoted in the file's sources. Keep at most one
   or two figures in any paragraph.
4. **Dated events on the timeline.** Where an observation narrates when laws
   or policies changed beside a series, add them as `events` on that series
   (source = the citation number that dates it) and cut the narration.
5. **Keep observation ids stable** (`{#...}` on every `###`): viewpoints will
   link to them. Shorten headings and bodies, but do not merge or delete
   observations. Keep every footnote that supports a remaining sentence.
6. Move long methodology into About this data (series `coverage.note`,
   reading `note`, comparison `note`) or Subtleties; keep Subtleties short too.
7. Don't change statuses, sources, quotes or figures. Don't touch any file
   other than your assigned reports.

## Check
- `python3 /tmp/claude/readability.py <your files>`: the claim must pass and
  no paragraph should be flagged, except unavoidable ones you justify in your
  reply.
- `heavy run -- pnpm check:figures` (sandbox disabled) and
  `heavy run -- pnpm test:unit` must pass.
- Look at the result rendered: a dev server is running at
  http://localhost:3017; the fact page is
  /topics/us-voter-id/facts/<fact-id>. Screenshot with Playwright if you can
  (e.g. node with `@playwright/test`'s chromium, run from the repo root) and
  check the page reads well at 390px and 1100px wide.

## Reply (under 200 words)
For each file: claim word count before/after, flagged paragraphs before/after,
charts or events added, anything you could not fix and why.
