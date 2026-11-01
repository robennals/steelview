# Visualization components, round 2

Date: 2026-10-29. Status: agreed with the owner, building. Inputs: the gaps
and component issues found converting every report to `figures` (branch
`bb/migrate-reports-to-new-visualization-components-thr_549rhhx7zr`), and
the owner's answers to them.

## Summary

Converting all 37 reports to `figures` showed where the components fall short
of what the reports need. This round fixes that in five layers, then
re-converts the reports to use what the layers add:

1. **Data model** — every item may cite several sources; one shape for a
   qualified number ("at least 159") used by every kind; a date column format
   and approximate dates; composition rows must add up.
2. **Layout and reading order** — lead text first, `###` sections placeable,
   anchors preserved when prose becomes a figure, tables that say when data
   is hidden, period-timeline labels that stay on their row.
3. **Kinds** — one `quotes` kind with no limit, paired and dumbbell bars,
   `sliceExplorer` and `smallMultiples` reachable from content.
4. **Maps** — every area of a preset drawable, tiles that span several cells,
   one `map` kind with a real-shape / tile switch, a world tile layout.
5. **Fixes** — the component and check-script bugs listed below.

**One dataset, one report.** A dataset appears in exactly one report of a
topic; other reports link to its figure (`#fact-<fact>/chart-<id>`). No
mechanism for showing one figure in two reports is added, and the two
existing duplicates (SAVE key figures in voter ID; NCSL mail-rule counts in
vote by mail) are removed in the content layer. `featuredCharts` — a
supporting fact's charts shown inside its parent — is unchanged.

Every layer keeps the site's rules: the full published range, a source on
every figure, a table behind every graph, never colour alone, and a complete
page with JavaScript off. Each layer updates `content/AUTHORING.md` (Figures
section and the build-enforcement table), `content/WORKFLOW.md` (known
rendering limits), `components/report/Introduction.mdx`, the Storybook
stories and fixtures, and `lib/content/__fixtures__/figure-examples.md`.

---

## 1. Data model

### 1.1 Several sources per item

Everywhere an item takes `source: n` it may instead take `sources: [n, …]`
(one or more): timeline events, period-timeline periods and events, key
figures, estimates, composition rows, quotes, series events. `source: n`
stays valid and means `sources: [n]`; the adapter normalises to an array.
A series **line** gains an optional `source` (a full source object, as a
reading's), credited in the chart's source line and used by the chart-value
audit for that line's points.

Rendering: an item's footnotes list every citation (`[34] [50]`); the
figure's source line lists all citations, deduplicated, ascending, as now.
Validation (F2) checks every number in every array.

### 1.2 Qualified numbers

One value shape, accepted wherever a figure takes a number (table numeric
cells, key figures, bar values, composition values, map data, scatter x/y,
estimate values):

```yaml
value: 159                    # still accepted: a bare number
value: { value: 159, qualifier: at least, asPublished: "At least 159" }
value: { low: 4, high: 6, asPublished: "4–6%" }   # a published range
```

- `qualifier`: `about`, `at least`, `at most`, `more than`, `fewer than`,
  `under`, `over`, `nearly`. Key figures' existing `qualifier` field keeps
  working and accepts the new words.
- A range has `low` and `high` and no `value`; the drawn position is the
  range itself (a whisker), the sort key its midpoint.
- `asPublished` is the source's wording. It is **displayed** where the number
  is read as text (table cells, key figures, readouts, map table), not only
  used by `check:figures`.

Rendering per kind:

| Kind | Bound (`at least`, `more than`, `over`) | Bound (`at most`, `fewer than`, `under`) | `about`, `nearly` | Range |
| --- | --- | --- | --- | --- |
| dataTable | published wording; sorts by the number | same | same | "4–6" ; sorts by midpoint |
| keyFigures | qualifier word before the number (as now) | same | same | "4–6%" |
| barChart / comparison bars | bar to the value, ending in an open arrowhead pointing right | bar to the value with an arrowhead pointing left at its end | bar with a dotted end segment | bar to `low`, whisker to `high` |
| map (numeric) | colour of the value, plus ▲ on the tile/area label and a stipple texture | colour, ▼, texture | colour, texture | colour of the midpoint, texture |

Legends explain each mark that appears ("▲ at least this many", "Stippled:
approximate or a bound"). Never colour alone: the glyph and texture carry
the meaning in greyscale.

### 1.3 Dates

- dataTable column `format: date`. Cells hold `YYYY`, `YYYY-MM` or
  `YYYY-MM-DD` strings; display "2026", "Jun 2026", "12 Jun 2026"; sort
  chronologically, a coarser date sorting before finer dates inside it.
- Timeline event `date` additionally accepts approximate forms: `1850s`
  (decade), `c. 1888` (circa a year), `1880s–1890s` is **not** accepted (use
  a period timeline). Displayed as written; placed at the decade's start or
  the year.

### 1.4 Compositions must add up

A compositionBar row's values must sum to its stated `total` (new optional
field) or, without a total, to 100 when `unit: percent`, within a rounding
tolerance of half a unit in the last published place times the number of
parts. Otherwise the validator fails with the row, the sum and the expected
total. Labels show the published values; bar widths are proportional.

---

## 2. Layout and reading order

- **Lead text first.** Body text before the first heading renders after the
  claim and before the first figure.
- **`section` places `###` too.** A `section` entry may name any heading
  (`##` or `###`) with an explicit `{#<fact>--<id>}` anchor; the heading and
  its content up to the next heading of the same or higher level move.
- **Anchors survive a conversion.** Figures take an optional
  `replaces: [<anchor>, …]`; each old anchor becomes an alias element at the
  figure, so existing links (`#fact-<fact>/<anchor>`) land on it, and the
  validator accepts those anchors as link targets.
- **Tables say when data is hidden.** A table of up to 15 rows renders in
  full. Longer tables show their first 10 rows, a fade, and a "Show all N
  rows" button (no-JS: the full table inside `<details>` opened by default,
  or simply full). Horizontal overflow shows an edge shadow on the hidden
  side. On wide screens a table with more than three columns may break out
  of the text column to the page width (`width: wide`, the default for >3
  columns).
- **Period-timeline labels stay on their row.** A label goes inside its bar
  if it fits; else immediately right of the bar if that space is free on the
  row; else it is omitted from the graph (the legend colour, hover/focus
  readout and table name it). Never a separate line. Spans under 18 months
  get month ticks. A period with no `to` reads "to <axis end>" unless the
  axis end is the topic's `lastUpdated`, when it reads "still in force".

---

## 3. Kinds

- **`quotes`** replaces `quoteComparison` (kept as an alias that validates
  as `quotes`). Any number of quotes ≥ 2, each with speaker, role, date,
  optional `stance` (a category id from optional `categories`), `context`,
  optional `translation` (shown beside a non-English verbatim quote) and
  `sources`. Up to four render side by side; more render as a browsable
  list with filter by category and speaker and sort by date (the
  `QuoteBrowser` component); with JS off, the full list.
- **Paired and dumbbell bars.** `barChart` gains `series` (two or more named
  measures) with `values` per row, drawn side by side (`style: paired`,
  default) or as two dots joined by a line (`style: dumbbell`). Never
  stacked. A dumbbell row may label each end (`labels: { a: 1958, b: 1964 }`)
  when the measures' periods differ by row. The table view has one column per
  measure.
- **`sliceExplorer`** — the `SliceExplorer` component: rows × dimensions × a
  measure, e.g. votes by chamber × party × position.
- **`smallMultiples`** — the `SmallMultiples` component: one small series
  panel per item on a shared or free scale, each panel's points from the
  fact's sources.

Both new kinds follow the existing pattern: schema, adapter in
`figure-props.ts`, switch arm in `fact-figures.tsx`, validation rules,
`check:figures` value traversal, a fixture example and tests.

---

## 4. Maps

- **Every area drawable.** World: Liechtenstein, Monaco, San Marino,
  Andorra, Vatican, Malta, Micronesia, the Marshall Islands, Palau, Nauru,
  Tuvalu and other microstates missing from the outlines are drawn as dots
  at their location (with a hit area). Europe tiles: Liechtenstein and any
  other EU+/EFTA member missing. US tiles: an optional territories row (PR,
  VI, GU, AS, MP) enabled by data for them.
- **Tiles may span cells.** A tile layout entry may give `w` and `h` (in
  cells); the US layout uses this where it keeps neighbours closer to their
  geography (e.g. TX, CA, MT, AK as larger tiles), without breaking the
  every-area-same-visual-weight purpose for small areas — spans are kept
  modest and documented in the layout file.
- **One `map` kind with both views.** `map` with `preset` (`us-states`,
  `europe`, `uk-regions`, `world`) draws the real-shape view and the tile
  view from the same data and legend, with a switch (Map / Tiles / Table).
  `default` picks the first view. `tileMap` and `geoMap` remain accepted
  and validate as `map` with the matching default view.
- **World tile layout.** One tile per sovereign state in a geographic grid,
  so small states are as visible and clickable as large ones.
- Numeric maps take qualified values (1.2).

---

## 5. Fixes

- Compact number format keeps `decimals` at any magnitude ($43.6bn).
- `check:figures` traces comparison and figure values against the same
  source list the validator accepts (`factSources`), and a series reading's
  source **adds to** the series source rather than replacing it.
- `valuesFrom` and a line's `coverage.note` are shown in About this data for
  series and comparisons, as they are for component figures.
- estimateRange: an upper bound alone does not report "Includes no effect";
  the graph shows `asPublished`; the header is configurable (`itemLabel`,
  default "Estimate"); marks beyond the axis are clamped with an arrow
  showing they continue.
- A multi-panel series shows its event key once, after the last panel.
- `check:figures` reads space-grouped thousands ("1 000", "3 200 000") and
  reports, rather than throws on, a derived figure whose input is not quoted.
- Key figures' doc comment matches the schema (one to six).
- The fixture claimCheck points at a fact the fixtures contain.

## 6. Content

Re-convert reports to use 1–4 and remove the two duplicated datasets.
