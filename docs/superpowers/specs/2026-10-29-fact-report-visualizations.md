# Fact-report visualizations for the trial topics

Date: 2026-10-29. Status: ready to build. Inputs: `content/drafts/visualization-needs.md`
and the *Visualization plan* sections of the vote-by-mail and Iran
`candidate-data.md` files (branch `bb/deep-research-iran-mail-thr_2svsdu69zv`),
the built voter-ID reports, and the code named below.

## 1. Summary

A fact report can today show only two kinds of chart from its frontmatter: a
time series (`series`, `additionalSeries`) and a bar comparison
(`comparisons`). Everything else the three trial topics need — tables, key
figures, timelines, maps, quotes, estimate ranges — already exists as a
component in `components/report`, but a fact file cannot reach it. Authors
fall back on markdown tables, which render badly and always land after every
chart, so the planned reading order of a report cannot be kept.

This spec adds three things, in order:

- **Phase 1 — one generic `figures` list in fact frontmatter.** Each entry
  names a component and its data, cites the fact's own numbered sources, and
  renders in the order written, interleaved with the existing series and
  comparisons and with each figure's own Observations.
- **Phase 2 — fixes to the components already in use**, found while reading
  the voter-ID reports: a collapsible event key, readable markdown tables,
  axis-label collisions, two labelling bugs, and a `check:figures` that also
  audits chart values and matches figures against the report's own sources.
- **Phase 3 — six new capabilities** no component provides: categorical maps,
  a labelled scatter plot, a focus window on a long series, per-line coverage,
  a "not measured since" band, and estimated or forecast points.

Every new piece keeps the site's rules: the full published range, a source on
every figure, a table behind every graph, never colour alone, and a complete
page with JavaScript off.

---

## 2. Phase 1 — a generic `figures` list in fact frontmatter

### 2.1 What the author writes

A fact may carry `figures`: an ordered list. Each entry has a `kind`. Most
kinds are a library component with its data; four kinds are *references* that
place things the fact already has:

| Kind | Renders | Component |
| --- | --- | --- |
| `series` | the fact's `series`, or one `additionalSeries` by `id` | `components/topic/series-chart.tsx` |
| `comparison` | one entry of `comparisons` by `id` | `components/topic/comparison-chart.tsx` |
| `featured` | the charts of one supporting fact named in `featuredCharts` | as today |
| `section` | one `## Heading {#<fact>--<id>}` section of the body | `Prose` |
| `dataTable` | a sortable table | `DataTable` |
| `keyFigures` | one to six headline numbers | `KeyFigures` |
| `timeline` | dated events with categories | `Timeline` |
| `periodTimeline` | periods per row, with point events | `PeriodTimeline` |
| `tileMap` | US states (or Europe, UK regions) as equal tiles | `TileMap` |
| `barChart` | ungrouped bars in any `ValueFormat` | `BarChart` |
| `compositionBar` | parts of a whole, one bar per row | `CompositionBar` |
| `estimateRange` | estimates with ranges, grouped | `EstimateRange` |
| `quoteComparison` | two to four answers to one question | `QuoteComparison` |
| `pullQuote` | one quote set apart | `PullQuote` |
| `claimCheck` | a well-known claim set against the evidence | `ClaimCheck` |
| `caveatList` | what the figures above do not show | `CaveatList` |

Phase 3 adds `scatterPlot` and `geoMap`, and a categorical mode for `tileMap`.

**Deferred kinds.** `QuoteBrowser`, `SliceExplorer` and `SmallMultiples` are
needed by the Iran plan (R1, R6, R7) but not by the first reports to be
built. They follow the same pattern; see open question 7.

**When `figures` is absent** the fact renders exactly as today (series, then
additional series, then featured charts, then comparisons, then the body).
No existing content changes.

**When `figures` is present** it is the whole reading order of the charts:
every `series`, `additionalSeries`, `comparisons` entry and `featuredCharts`
entry must be referenced exactly once (validation rule F3). Body sections that
are not referenced by a `section` entry and are not an attached Observations
or Subtleties group render after the last figure, as now.

### 2.2 Files

| File | Change |
| --- | --- |
| `lib/content/schema.ts` | figure schemas; `figures` on `factFrontmatterSchema`; `valuesFrom` on readings and comparisons; `itemLabel` on comparisons (Phase 2) |
| `lib/content/types.ts` | `Figure`, `FigureKind`, `FigureOf<K>` |
| `lib/content/sources.ts` (new) | `factSources(fact)`, `seriesSourceNumber(fact, seriesIndex, readingIndex)` — moved out of `fact-article.tsx` (`allSources`, the `sourceOffset` arithmetic) so the renderer, the validator and `check:figures` number sources identically |
| `lib/content/validate.ts` | `figureErrors()`; artifact-id uniqueness includes figure ids; `citationErrors` accepts `chart-<figure id>`; `sourceCount` from `factSources` |
| `lib/content/chart-observations.ts` | `chartObservations` is called with figure ids too; new `bodySections(html, factId, ids)` |
| `lib/content/figure-props.ts` (new) | the adapter from a content figure to component props |
| `lib/content/figure-text.ts` (new) | `figureProse(figure): string[]` and `figureValues(figure)` for `check:figures` |
| `components/topic/fact-figures.tsx` (new) | renders a fact's `figures` in order |
| `components/topic/fact-article.tsx` | `FactBody` uses `FactFigures` when `fact.figures` is set |
| `components/report/*` | small extensions listed in 2.6 |
| `scripts/check-figures.ts`, `scripts/figures.ts` | audit figure text (2.8) |
| `content/AUTHORING.md`, `content/WORKFLOW.md`, `components/report/Introduction.mdx` | document `figures`; drop the "tables render after every chart" and "only SeriesChart and ComparisonChart" limits |

### 2.3 Schema (zod)

Add to `lib/content/schema.ts` after `comparisonChartSchema`. `partialDate`,
`seriesEventSchema` and `FACT_STATUSES` are already in the file.

```ts
/* ----------------------------------------------------------------- figures */

/** A one-based index into the fact's numbered citations (see lib/content/sources.ts). */
const citation = z.number().int().positive();
const slugId = z.string().regex(/^[a-z0-9-]+$/, 'lower-case letters, digits and hyphens only');

/** Mirrors `ValueFormat` in components/report/types.ts. */
export const valueFormatSchema = z
  .object({
    unit: z.enum(['count', 'percent', 'currency', 'number']).default('count'),
    /** ISO 4217, required with unit "currency": USD, GBP, EUR. */
    currency: z.string().regex(/^[A-Z]{3}$/).optional(),
    decimals: z.number().int().min(0).max(4).optional(),
    fixed: z.boolean().optional(),
    compact: z.boolean().optional(),
    signed: z.boolean().optional(),
  })
  .refine((f) => (f.unit === 'currency') === (f.currency !== undefined), {
    message: 'give `currency` with unit "currency", and only then',
  });

/**
 * The figure in the source's own words — "more than 7,200", "probably less
 * than one week". Optional. When given, `check:figures` looks for this text
 * in the cited quote instead of the number, so a figure the source states in
 * words or as a bound stays traceable after it is turned into a number.
 */
const asPublished = z.string().min(1).optional();

/** Fields every component figure shares. */
const figureBase = {
  id: slugId,
  title: z.string().min(1),
  /** The visible one-sentence orientation, and the screen-reader description. */
  description: z.string().min(1),
  /** Citations the whole figure rests on. Kinds whose items each cite a source may leave this empty. */
  sources: z.array(citation).default([]),
  /** Collapsed under "About this data". */
  note: z.string().optional(),
  /**
   * The published table the values are read from, when no quote can hold
   * them all: "EAVS 2024 Overview Table 1, column C4a". Shown in About this
   * data; lets `check:figures` accept unquoted values (Phase 2, 3.7).
   */
  valuesFrom: z.string().min(1).optional(),
};

/* --- references: place things the fact already has ----------------------- */

export const seriesRefSchema = z.object({
  kind: z.literal('series'),
  /** Omit for the fact's `series`; otherwise an `additionalSeries` id. */
  id: slugId.optional(),
});
export const comparisonRefSchema = z.object({ kind: z.literal('comparison'), id: slugId });
export const featuredRefSchema = z.object({ kind: z.literal('featured'), fact: z.string().min(1) });
/** Moves the body section headed `## … {#<fact>--<id>}` to this place. */
export const sectionRefSchema = z.object({ kind: z.literal('section'), id: slugId });

/* --- dataTable ------------------------------------------------------------ */

const plainCell = z.union([z.string(), z.number().finite(), z.null()]);
/** A cell with its own footnotes, rendered as "[n]" links after the text. */
const citedCell = z.object({ value: plainCell, sources: z.array(citation).min(1), asPublished });
export const tableCellSchema = z.union([plainCell, citedCell]);

export const dataTableFigureSchema = z.object({
  kind: z.literal('dataTable'),
  ...figureBase,
  /** What one row is, e.g. "One row per law, bill or ruling". Read first by a screen reader. */
  caption: z.string().min(1),
  columns: z
    .array(
      z.object({
        key: slugId,
        label: z.string().min(1),
        /** 'text' prints as written; use it for year columns, or 1965 prints as "1,965". */
        format: z.union([z.literal('text'), valueFormatSchema]).optional(),
        align: z.enum(['left', 'right']).optional(),
        rowHeader: z.boolean().optional(),
        sortable: z.boolean().optional(),
      })
    )
    .min(2),
  /** Each row maps column keys to cells. A missing key renders "—". */
  rows: z.array(z.record(z.string(), tableCellSchema)).min(1),
  /** Row-header values to set in bold with an accent rule. */
  highlight: z.array(z.string()).default([]),
  defaultSort: z.object({ key: slugId, direction: z.enum(['ascending', 'descending']) }).optional(),
});

/* --- keyFigures ----------------------------------------------------------- */

export const keyFiguresFigureSchema = z.object({
  kind: z.literal('keyFigures'),
  ...figureBase,
  figures: z
    .array(
      z.object({
        value: z.number().finite(),
        format: valueFormatSchema.optional(),
        /** Printed before the number: "more than 7,200". */
        qualifier: z.enum(['about', 'more than', 'at least', 'fewer than', 'at most']).optional(),
        label: z.string().min(1),
        period: partialDate,
        periodLabel: z.string().min(1).optional(),
        asPublished,
        change: z
          .object({ value: z.number().finite(), format: valueFormatSchema.optional(), comparison: z.string().min(1) })
          .optional(),
        source: citation,
      })
    )
    .min(1)
    .max(6),
});

/* --- timeline ------------------------------------------------------------- */

const categorySchema = z.object({ id: slugId, label: z.string().min(1) });

export const timelineFigureSchema = z.object({
  kind: z.literal('timeline'),
  ...figureBase,
  /** Order fixes each category's colour and shape. */
  categories: z.array(categorySchema).min(1),
  events: z
    .array(
      z.object({
        date: partialDate,
        endDate: partialDate.optional(),
        title: z.string().min(1),
        description: z.string().min(1).optional(),
        category: slugId,
        significance: z.enum(['major', 'minor']).optional(),
        source: citation,
      })
    )
    .min(2),
});

/* --- periodTimeline ------------------------------------------------------- */

export const periodTimelineFigureSchema = z.object({
  kind: z.literal('periodTimeline'),
  ...figureBase,
  /** Table heading for the rows: "Measure", "State". */
  rowLabel: z.string().min(1),
  from: partialDate.optional(),
  /** Axis end. Defaults to the topic's `lastUpdated` when any period is open, else the component default. */
  to: partialDate.optional(),
  categories: z.array(categorySchema).default([]),
  rows: z
    .array(
      z.object({
        label: z.string().min(1),
        periods: z
          .array(
            z.object({
              from: partialDate,
              /** Omit for something still in force on the topic's lastUpdated date. */
              to: partialDate.optional(),
              label: z.string().min(1).optional(),
              category: slugId.optional(),
            })
          )
          .min(1),
      })
    )
    .min(1),
  /** Point events: the same shape as series events. */
  events: z.array(seriesEventSchema).default([]),
});

/* --- tileMap -------------------------------------------------------------- */

export const MAP_TILE_PRESETS = ['us-states', 'europe-countries', 'uk-regions'] as const;

const mapDatum = z.union([
  z.number().finite(),
  z.object({ value: z.number().finite(), label: z.string().min(1).optional(), asPublished }),
]);

export const tileMapFigureSchema = z
  .object({
    kind: z.literal('tileMap'),
    ...figureBase,
    map: z.enum(MAP_TILE_PRESETS),
    /** Table heading for the areas: "State". */
    areaLabel: z.string().min(1),
    /** Outlined, never recoloured. */
    highlight: z.array(z.string()).default([]),
    // Numeric mode (Phase 1):
    valueLabel: z.string().min(1).optional(),
    format: valueFormatSchema.optional(),
    scale: z.enum(['sequential', 'diverging']).optional(),
    steps: z.number().int().min(2).max(9).optional(),
    domain: z.tuple([z.number(), z.number()]).optional(),
    breaks: z.array(z.number()).min(2).optional(),
    data: z.record(z.string(), mapDatum).optional(),
    // Categorical mode (Phase 3a) adds `categoryLabel`, `categories`, `areas` here.
  })
  .superRefine((f, ctx) => {
    if (!f.data || !f.valueLabel) ctx.addIssue({ code: 'custom', message: 'a tile map needs `data` and `valueLabel`' });
  });

/* --- barChart ------------------------------------------------------------- */

export const barChartFigureSchema = z.object({
  kind: z.literal('barChart'),
  ...figureBase,
  valueLabel: z.string().min(1),
  /** Table heading for the bar labels. */
  categoryLabel: z.string().min(1).optional(),
  format: valueFormatSchema.optional(),
  /** 'none' keeps the given order, for ordered categories such as age bands. */
  sort: z.enum(['value', 'none']).optional(),
  domainMax: z.number().positive().optional(),
  items: z
    .array(z.object({ label: z.string().min(1), value: z.number().finite(), highlight: z.boolean().optional(), asPublished }))
    .min(2),
});

/* --- compositionBar ------------------------------------------------------- */

export const compositionBarFigureSchema = z.object({
  kind: z.literal('compositionBar'),
  ...figureBase,
  categories: z.array(z.object({ key: slugId, label: z.string().min(1) })).min(2),
  rows: z
    .array(
      z.object({
        label: z.string().min(1),
        values: z.record(z.string(), z.number().finite().nonnegative()),
        /** A row from a different counter cites its own source. */
        source: citation.optional(),
      })
    )
    .min(1),
  showCounts: z.boolean().optional(),
  countFormat: valueFormatSchema.optional(),
  rowLabel: z.string().min(1),
  otherThreshold: z.number().positive().max(50).optional(),
  otherLabel: z.string().min(1).optional(),
});

/* --- estimateRange -------------------------------------------------------- */

export const estimateRangeFigureSchema = z.object({
  kind: z.literal('estimateRange'),
  ...figureBase,
  valueLabel: z.string().min(1),
  format: valueFormatSchema.optional(),
  intervalLabel: z.string().min(1).optional(),
  /** The "no effect" value. `null` for estimates with no natural reference, such as costs. Defaults to 0. */
  nullValue: z.number().nullable().optional(),
  nullLabel: z.string().min(1).optional(),
  domain: z.tuple([z.number(), z.number()]).optional(),
  estimates: z
    .array(
      z.object({
        label: z.string().min(1),
        /** Shown after the label: "May 2025". */
        year: z.union([z.string().min(1), z.number().int()]).optional(),
        estimate: z.number().finite().optional(),
        /** Omit `high` for "at least …", `low` for "at most …". */
        low: z.number().finite().optional(),
        high: z.number().finite().optional(),
        group: z.string().min(1).optional(),
        note: z.string().min(1).optional(),
        asPublished,
        source: citation,
      })
    )
    .min(2),
});

/* --- quotes --------------------------------------------------------------- */

const figureQuoteSchema = z.object({
  /** Verbatim. "…" marks an omission; each fragment must appear in the cited source's quote (rule F11). */
  text: z.string().min(1),
  speaker: z.string().min(1),
  role: z.string().min(1).optional(),
  position: z.string().min(1).optional(),
  date: partialDate.optional(),
  context: z.string().min(1).optional(),
  source: citation,
});

export const quoteComparisonFigureSchema = z.object({
  kind: z.literal('quoteComparison'),
  id: slugId,
  /** The question every quote answers; it is the figure's heading. */
  question: z.string().min(1),
  description: z.string().min(1).optional(),
  note: z.string().optional(),
  quotes: z.array(figureQuoteSchema).min(2).max(4),
});

export const pullQuoteFigureSchema = z.object({
  kind: z.literal('pullQuote'),
  id: slugId,
  description: z.string().min(1).optional(),
  note: z.string().optional(),
  variant: z.enum(['pull', 'inline']).optional(),
  quote: figureQuoteSchema,
});

/* --- claimCheck ----------------------------------------------------------- */

export const claimCheckFigureSchema = z.object({
  kind: z.literal('claimCheck'),
  id: slugId,
  /** Verbatim, checked against `claimSource`'s quote (rule F11). */
  claim: z.string().min(1),
  claimant: z.object({ name: z.string().min(1), role: z.string().min(1).optional() }).optional(),
  date: partialDate.optional(),
  claimSource: citation,
  status: z.enum(FACT_STATUSES),
  /** One or two plain sentences. */
  finding: z.string().min(1),
  sources: z.array(citation).min(1),
  /** Another fact (or a section of one) that sets out the evidence. */
  evidence: z.object({ fact: z.string().min(1), section: z.string().min(1).optional(), label: z.string().min(1).optional() }).optional(),
});

/* --- caveatList ----------------------------------------------------------- */

export const caveatListFigureSchema = z.object({
  kind: z.literal('caveatList'),
  id: slugId,
  heading: z.string().min(1).default('What this does not show'),
  items: z
    .array(z.object({ measure: z.string().min(1), why: z.string().min(1), sources: z.array(citation).default([]) }))
    .min(1),
});

export const figureSchema = z.discriminatedUnion('kind', [
  seriesRefSchema,
  comparisonRefSchema,
  featuredRefSchema,
  sectionRefSchema,
  dataTableFigureSchema,
  keyFiguresFigureSchema,
  timelineFigureSchema,
  periodTimelineFigureSchema,
  tileMapFigureSchema,
  barChartFigureSchema,
  compositionBarFigureSchema,
  estimateRangeFigureSchema,
  quoteComparisonFigureSchema,
  pullQuoteFigureSchema,
  claimCheckFigureSchema,
  caveatListFigureSchema,
]);
```

On `factFrontmatterSchema` add:

```ts
  /** The reading order of the fact's charts and figures; see AUTHORING.md "Figures". */
  figures: z.array(figureSchema).optional(),
```

and on `seriesReadingSchema` and `comparisonChartSchema` add
`valuesFrom: z.string().min(1).optional()` (used by Phase 2, 3.7).

In `lib/content/types.ts`:

```ts
export type Figure = z.infer<typeof figureSchema>;
export type FigureKind = Figure['kind'];
export type FigureOf<K extends FigureKind> = Extract<Figure, { kind: K }>;
/** Kinds that draw a library component, as opposed to references. */
export type ComponentFigure = Exclude<Figure, { kind: 'series' | 'comparison' | 'featured' | 'section' }>;
```

**Check before relying on it:** `tileMapFigureSchema` uses `.superRefine`.
If zod 4.4's `discriminatedUnion` rejects a refined option, move the check
into `figureErrors` (rule F9) and keep the schema a plain object. Either is
acceptable; the test in 2.10 pins the behaviour.

**Acceptance:** every worked example in 2.11 parses with
`factFrontmatterSchema`; a figure with an unknown `kind`, a bad id, a
`currency` without unit `currency`, or a `dataTable` with one column fails to
parse with a path that names the figure index.

### 2.4 Sources

Figures cite the fact's own numbered citations, exactly as `comparisons` do.
The numbering is unchanged and now lives in one place:

```ts
// lib/content/sources.ts
/** Fact sources, then the series source and its reading sources, then each additional series and its reading sources. */
export function factSources(fact: Pick<Fact, 'sources' | 'series' | 'additionalSeries'>): Source[];
/** One-based number of the source a series reading is credited to. seriesIndex -1 = `series`. */
export function seriesSourceNumber(fact: Fact, seriesIndex: number, readingIndex: number): number;
```

`fact-article.tsx` replaces `allSources` and its inline `sourceOffset`
arithmetic with these; `validate.ts` replaces its `sourceCount` expression
with `factSources(f).length`. Behaviour must be byte-identical: the existing
Playwright test that reads `#source-immigration-against-the-long-run-22`
pins it.

**Rendering.** The adapter turns citation `n` into the library's
`SourceCredit`:

```ts
{ label: sources[n - 1].publisher, href: `#source-${fact.id}-${n}`, number: n }
```

so every figure ends in `Source: NCSL [2]; EAC [5]`, each a link to the
quoted reference in the fact's single Sources expando — the same as
`ComparisonChart`. Item-level citations (a key figure, a timeline event, a
quote, a table cell, an estimate, a composition row, a caveat) render as the
same `label [n]` link beside the item. A figure's source line lists the union
of its `sources` and every item-level citation, deduplicated, in ascending
number order.

### 2.5 Reading order and Observations

**DOM ids.** Every component figure's root element gets
`id="<fact>--chart-<figure id>"`, the same scheme as comparisons, so
`#fact-<fact>/chart-<figure id>` citations from viewpoints work and are
validated.

**Observations and Subtleties.** `chartObservations()` is already keyed by
chart id. `FactBody` passes the figure ids (and `section` ids) in its list,
so `## Observations {#<fact>--observations-<figure id>}` and
`## Subtleties {#<fact>--subtleties-<figure id>}` attach beneath that figure,
inside its frame, after its source line and before About this data — the
order `ComparisonChart` uses. To put them there, `ReportFigure`
(`components/report/figure.tsx`) gains one prop:

```ts
/** Rendered after the source line and before "About this data": a figure's Observations. */
footer?: ReactNode;
```

and every component that wraps itself in `ReportFigure` passes a `footer`
prop through (`DataTable`, `KeyFigures`, `Timeline`, `PeriodTimeline`,
`TileMap`, `GeoMap`, `BarChart`, `CompositionBar`, `EstimateRange`,
`QuoteComparison`). `PullQuote`, `ClaimCheck` and `CaveatList` do not use
`ReportFigure`; the adapter wraps them in one (no title) so they get the same
id, description, footer and note.

**Body sections.** New in `lib/content/chart-observations.ts`:

```ts
/** Pull the h2 sections whose id is `<fact>--<id>` out of the body, keyed by id. */
export function bodySections(html: string, factId: string, ids: string[]): { sections: Record<string, string>; bodyHtml: string };
```

Run it after `chartObservations` on the remaining `bodyHtml`. A `section`
figure renders `<Prose html={sections[id] + observations[id]} />`. This is
how prose that must sit between two figures (for example the Freedom to Vote
Act provisions in `federal-and-state-power-over-voting-rules`) is placed.

**Renderer.** New `components/topic/fact-figures.tsx`:

```tsx
export function FactFigures({ fact, observations, subtleties, sections, featured }: {
  fact: Fact;
  observations: Record<string, string>;
  subtleties: Record<string, string>;
  sections: Record<string, string>;
  /** Supporting facts named in featuredCharts, with their rendered bodies. */
  featured: BodiedFact[];
}): ReactNode;
```

It walks `fact.figures` and renders, in order:

- **`series`** → `SeriesChart` with the same props `FactCharts` passes today
  (observations per reading, Method Changes, `seriesSourceNumber`).
- **`comparison`** → `ComparisonChart` as today.
- **`featured`** → that child's own charts (its `figures` if it has them,
  else `FactCharts`), with the child's observation groups.
- **`section`** → `Prose`.
- **component kinds** → `<FactFigure fact figure sources footer />`, a
  `switch` on `kind` that calls the adapter and renders the component.

`FactBody` in `fact-article.tsx` becomes: if `fact.figures`, render
`FactFigures` and pass `featured` to it (not as `afterSeries`); otherwise the
current `FactCharts` path, unchanged.

**Acceptance:**

- A fact with `figures: [series, dataTable x, comparison c]` renders the
  series, then table `x`, then comparison `c`, then the remaining body, and
  `x`'s Observations group sits inside `#<fact>--chart-x`.
- A fact with no `figures` renders byte-identical HTML to before (assert on
  one uk-immigration fact and one voter-ID fact rendered through
  `renderToStaticMarkup` before and after).

### 2.6 Adapter and component extensions

`lib/content/figure-props.ts` holds one pure function per kind. They take
content types and return component props; they never render. Signatures:

```ts
import type * as R from '@/components/report';

export type FigureContext = {
  fact: Fact;
  sources: Source[];          // factSources(fact)
  asOf: string;               // topic.lastUpdated, for open periods
  credit: (n: number) => R.SourceCredit;
};

export function dataTableProps(f: FigureOf<'dataTable'>, c: FigureContext): R.DataTableProps;
export function keyFiguresProps(f: FigureOf<'keyFigures'>, c: FigureContext): R.KeyFiguresProps;
export function timelineProps(f: FigureOf<'timeline'>, c: FigureContext): R.TimelineProps;
export function periodTimelineProps(f: FigureOf<'periodTimeline'>, c: FigureContext): R.PeriodTimelineProps;
export function tileMapProps(f: FigureOf<'tileMap'>, c: FigureContext): R.TileMapProps;
export function barChartProps(f: FigureOf<'barChart'>, c: FigureContext): R.BarChartProps;
export function compositionBarProps(f: FigureOf<'compositionBar'>, c: FigureContext): R.CompositionBarProps;
export function estimateRangeProps(f: FigureOf<'estimateRange'>, c: FigureContext): R.EstimateRangeProps;
export function quoteComparisonProps(f: FigureOf<'quoteComparison'>, c: FigureContext): R.QuoteComparisonProps;
export function pullQuoteProps(f: FigureOf<'pullQuote'>, c: FigureContext): R.PullQuoteProps;
export function claimCheckProps(f: FigureOf<'claimCheck'>, c: FigureContext & { slug: string }): R.ClaimCheckProps;
export function caveatListProps(f: FigureOf<'caveatList'>, c: FigureContext): R.CaveatListProps;
```

Mapping rules that are not one-to-one:

- **Ids.** `id` → `<fact>--chart-<figure id>`. Quote ids →
  `<fact>--<figure id>-<n>` (one-based), so `quoteAnchor` stays unique on the
  page.
- **Map presets.** `'us-states'` → `US_STATE_TILES`, `'europe-countries'` →
  `EUROPE_COUNTRY_TILES`, `'uk-regions'` → `UK_REGION_TILES`. A bare number
  datum becomes `{ value }`.
- **Open periods.** `periodTimeline.to` defaults to `asOf` when any period
  has no `to`.
- **Claim evidence.** `{ fact, section }` → `href: factPath(slug, parentOf(fact)) + '#' + fact + '--' + section`, the same target rule as
  `remarkMarkFactCitations`.
- **Period-timeline events** reuse `stripEvents` from `series-chart.tsx`
  (export it).

Library extensions the adapter needs (each with a story variant and a unit
test in `components/report/*.test.ts`):

| Component | Change |
| --- | --- |
| `figure.tsx` `ReportFigure` | `footer?: ReactNode` (2.5) |
| `data-table.tsx` / `table-sort.ts` | `TableCell` widens to `string \| number \| null \| undefined \| { value: string \| number \| null; sources: SourceCredit[] }`. Sorting compares `.value`. A cited cell renders its text then ` [n]` links with class `sv-footnote` |
| `key-figures.tsx` | `KeyFigure.qualifier?: 'about' \| 'more than' \| 'at least' \| 'fewer than' \| 'at most'`, printed before the value in the same `<dd>`: "more than 7,200" |
| `estimate-range.tsx` / `estimate-layout.ts` | `estimate`, `low`, `high` each optional, at least one present; a lone `low` draws a whisker to the axis end with an arrowhead and reads "at least X"; a lone `high` likewise "at most X"; no `estimate` means no dot ("range only" in the key); `nullValue: number \| null` — `null` draws no reference line, drops the "Includes …?" table column, and stops signing values; `Estimate.source?: SourceCredit` printed after the label; `asPublished` shown in the table's Estimate column when given |
| `composition.ts` | `CompositionRowInput.source?: SourceCredit`, rendered after the row label |
| `caveat-list.tsx` | `Caveat.sources?: SourceCredit[]`, rendered after `why` |

`PeriodTimeline` and `Timeline` need no change. `QuoteComparison`,
`PullQuote` and `ClaimCheck` need none beyond the wrapper.

### 2.7 Validation (`lib/content/validate.ts`)

Add `figureErrors(f: Fact, topic: Topic): string[]`, called from the fact
loop. Messages start `fact <id>: figure <figure id or index>:`. Rules:

| # | Rule |
| --- | --- |
| F1 | Figure ids are unique within the fact and do not collide with `series`, additional-series ids, reading ids or comparison ids (extend the existing `artifactIds` check) |
| F2 | Every citation anywhere in a figure (figure `sources`, item `source`, cell `sources`, event `source`, caveat `sources`, `claimSource`) is between 1 and `factSources(f).length` |
| F3 | When `figures` is present: `{kind: series}` appears once if `series` exists and never otherwise; each additional series, comparison and `featuredCharts` entry is referenced exactly once; no reference names something that does not exist; a `featured` fact must be in `featuredCharts` |
| F4 | A `section` id matches an h2 `{#<fact>--<id>}` in the body |
| F5 | Every figure has at least one citation, at figure or item level (a `caveatList` is exempt: it records absences) |
| F6 | `dataTable`: column keys unique; at most one `rowHeader`; every row key is a column key; cells in a column with a numeric format are numbers or null; `defaultSort.key` is a column; each `highlight` value appears in the row-header column |
| F7 | `timeline`: categories unique; every event's category exists; `endDate` not before `date`. `periodTimeline`: every `to` not before its `from`; categories exist; events inside `from`/`to` when those are given |
| F8 | `keyFigures`: `change.value` finite; at most six figures |
| F9 | `tileMap`: every data key is an id of the preset; `breaks` strictly ascending; `domain[0] < domain[1]`; `highlight` ids exist; **if any preset area has no datum, `note` is required** (it must say why — a missing state reads "No data", and an unexplained gap looks like a selection) |
| F10 | `barChart`: `domainMax` ≥ every value. `compositionBar`: category keys unique; row keys ⊆ categories; every row total > 0. `estimateRange`: `low ≤ estimate ≤ high` wherever present; each estimate has at least one of the three; `domain` covers every present value |
| F11 | Quotes are verbatim: each fragment of a `quoteComparison`/`pullQuote` `text`, and of a `claimCheck` `claim`, split on `…` or `...`, appears in its cited source's `quote`. Normalise both sides: Unicode NFC, curly quotes to straight, whitespace collapsed, case-insensitive. Fragments under four characters are skipped |
| F12 | `claimCheck.evidence.fact` is a fact in the topic; `section`, if given, passes the same test as an inline citation section |

`citationErrors` must accept `chart-<figure id>` as a valid section for any
component figure.

**Acceptance:** one failing test per rule in `lib/content/validate.test.ts`,
each perturbing a sound fact with figures; `pnpm check:integrity` passes on
current content.

### 2.8 How `check:figures` treats figures

Moving a markdown table into frontmatter must not take it out of the audit.
Today the audit reads only markdown bodies (`scripts/check-figures.ts`), so
without this change a converted table would escape it.

- **Text fields are prose.** `lib/content/figure-text.ts` exports
  `figureProse(figure): string[]` returning every reader-facing string:
  `title`, `description`, `note`, `caption`, string table cells (plain or
  cited), column labels, key-figure `label`/`periodLabel`/`change.comparison`,
  event `title`/`description`, period `label`, row labels, estimate
  `label`/`note`, `finding`, caveat `measure`/`why`, `heading`, quote
  `role`/`position`/`context`. It excludes quote `text` and claim `claim`
  (checked verbatim by F11) and `asPublished` (checked in the value audit).
  `check-figures.ts` runs `figuresIn()` over these strings exactly as over a
  body, against the same corpus, and reports misses as
  `fact/<id> figure <figure id>: <figure>`. **Failing**, like bodies.
- **Numeric values are chart values.** `figureValues(figure)` returns one
  entry per number (key figure, bar, map datum, composition value, estimate
  bound, numeric table cell), each with its allowed citations and its
  `asPublished`. They go through the chart-value audit defined in Phase 2,
  3.7, with the same advisory-then-failing status. Whichever of the two PRs
  lands second wires the other's values in.

`check-figures.ts` parses `data.figures` with
`factFrontmatterSchema.shape.figures.safeParse`; on failure it skips the
figures (the loader reports the shape error) rather than crashing.

### 2.9 No-JavaScript behaviour

The page is complete without script; controls only add to it.

| Kind | Without JavaScript |
| --- | --- |
| `dataTable` | Full table in `defaultSort` order (sorted on the server); sort buttons inert |
| `keyFigures`, `pullQuote`, `claimCheck`, `caveatList`, `quoteComparison`, `compositionBar`, `barChart` | Fully static |
| `timeline` | Every event shown; filter chips and "Major only" inert |
| `periodTimeline`, `estimateRange`, `tileMap` | Graph shown; the table in the `<noscript>` "Show the numbers" disclosure that `ChartViewToggle` already renders |

**Acceptance:** a Playwright test with `javaScriptEnabled: false` (2.10)
finds every row of a figure table and every map area in the noscript table.

### 2.10 Tests to add

- **`lib/content/__fixtures__/figure-examples.md`** — one fact file whose
  `figures` holds every worked example in 2.11, with enough `sources` for its
  citations (quotes chosen so F11 passes). Not inside
  `__fixtures__/topics`, so existing load tests keep their counts.
- **`lib/content/schema.test.ts`** — the fixture parses; each bad shape in
  2.3's acceptance fails with a figure path.
- **`lib/content/validate.test.ts`** — rules F1–F12, one test each.
- **`lib/content/sources.test.ts`** — `factSources` order with a series, a
  reading source and two additional series; `seriesSourceNumber` matches the
  old inline arithmetic for each.
- **`lib/content/figure-props.test.ts`** — each adapter: ids prefixed,
  credits built from citation numbers, cited cells mapped, open periods end at
  `asOf`, map presets resolved.
- **`app/topics/[slug]/fact-article.test.ts`** — reading order (indexOf of
  each figure id in rendered HTML), Observations inside their figure, a
  `section` moved, the no-`figures` path unchanged.
- **`components/report/data-table.test.ts`**, **`estimate-layout`**,
  **`key-figures`** — the extensions in 2.6 (render with
  `renderToStaticMarkup`; layout functions directly).
- **`scripts/figures.test.ts`** — a figure-table cell with an unquoted figure
  is reported; a quoted one is not.
- **`tests/fact-figures.spec.ts`** (Playwright) — lands with the first content
  that uses `figures` (see 5): at 390px and 1100px the fact page has no
  horizontal overflow; the figure appears between the two charts it was
  written between; with JavaScript off its rows are in the page.
- **Storybook** — `components/report/stories/fact-figures.stories.tsx`,
  title `Existing/FactFigures`, rendering `FactArticle` for the fixture fact,
  so every kind can be seen in reading order.

### 2.11 Worked examples

Citation numbers below are illustrative: they index the fact's own list.
Values and wording are from the drafts and the built voter-ID reports; quote
text must be re-copied from the fetched source when the report is written.

A fact's `figures` showing references and component figures together
(`federal-and-state-power-over-voting-rules`):

```yaml
figures:
  - kind: comparison
    id: senate-votes
  - kind: dataTable
    id: federal-laws          # its "## Observations {#…--observations-federal-laws}" attaches here
    # … as below
  - kind: section
    id: freedom-to-vote-act-provisions
```

**dataTable** — the voter-ID federal record (today a markdown table):

```yaml
  - kind: dataTable
    id: federal-laws
    title: Federal voting laws and bills on registration and ID, 1965–2026
    description: >-
      The federal laws in force on registration and ID, and the two parties'
      main bills of the past five years, with what became of each.
    caption: One row per law, bill or ruling
    columns:
      - { key: year, label: Year, format: text }
      - { key: measure, label: 'Law, bill or ruling', rowHeader: true }
      - { key: effect, label: What it does on registration and ID, sortable: false }
      - { key: status, label: Status, sortable: false }
    defaultSort: { key: year, direction: ascending }
    rows:
      - year: '1965'
        measure: Voting Rights Act
        effect:
          value: >-
            Section 2 bars voting practices, including registration procedures,
            that discriminate by race, colour or language-minority status
          sources: [16]
        status:
          value: In force; the preclearance formula was struck down in Shelby County (2013)
          sources: [16]
      - year: '2025'
        measure: SAVE Act (Republican)
        effect: { value: Documentary proof of citizenship to register, sources: [24] }
        status: { value: 'Passed House, 220–208, 10 Apr 2025', sources: [24] }
```

**keyFigures** — the Washington audit's own re-check (vote by mail R2):

```yaml
  - kind: keyFigures
    id: audit-recheck
    title: How the State Auditor checked counties' signature decisions, 2020
    description: Auditors re-examined a sample of county decisions to accept or reject a ballot.
    figures:
      - value: 7200
        qualifier: more than
        asPublished: more than 7,200
        format: { unit: count }
        label: signatures re-examined
        period: '2020'
        periodLabel: November 2020 general election
        source: 11
      - value: 98.7
        format: { unit: percent, decimals: 1 }
        label: of county decisions judged appropriate
        period: '2020'
        source: 11
```

**timeline** — court findings and designations (Iran R2):

```yaml
  - kind: timeline
    id: court-record
    title: Court findings, convictions and designations, 1984–2026
    description: >-
      Each dated legal finding or designation about Iranian plots abroad.
      Charges that have not been tried are shown as their own category.
    categories:
      - { id: designation, label: Designation }
      - { id: court-finding, label: Court finding }
      - { id: conviction, label: Conviction }
      - { id: charge, label: Charge only }
    events:
      - { date: '1984-01-19', title: Iran designated a state sponsor of terrorism, category: designation, source: 3 }
      - { date: '2021-02-04', title: Assadi convicted in Antwerp, category: conviction, significance: major, source: 6 }
      - { date: '2024-11', title: Shakeri charged in New York, category: charge, source: 8 }
      - { date: '2026-02-27', title: Wrongful-detention designation, category: designation, source: 9 }
```

**periodTimeline** — ceasefire, blockade and strike pause (Iran R7):

```yaml
  - kind: periodTimeline
    id: war-periods
    title: Ceasefire, blockade, memorandum and strike-pause periods, 2026
    description: >-
      When each arrangement was in force, against the War Powers letters sent
      to Congress. Open bars were still in force on the date of this report.
    rowLabel: Arrangement
    from: '2026-02-28'
    categories:
      - { id: ceasefire, label: Ceasefire }
      - { id: blockade, label: Blockade }
      - { id: agreement, label: Memorandum of understanding }
      - { id: pause, label: Strike pause }
    rows:
      - label: Ceasefire
        periods: [{ from: '2026-04-08', to: '2026-07-07', category: ceasefire, label: Ceasefire }]
      - label: US naval blockade
        periods:
          - { from: '2026-04-13', to: '2026-06-18', category: blockade, label: First blockade }
          - { from: '2026-07-14', category: blockade, label: Second blockade }
      - label: Memorandum of understanding
        periods: [{ from: '2026-06-17', to: '2026-07-08', category: agreement, label: MoU }]
      - label: Strike pause
        periods: [{ from: '2026-10-08', category: pause, label: Pause }]
    events:
      - { period: '2026-05-01', label: 'Letter says hostilities "have terminated"', source: 4 }
    sources: [2, 3, 4]
```

**tileMap** — mail-ballot rejection rate by state (vote by mail R2; the full
51-area table comes from EAVS):

```yaml
  - kind: tileMap
    id: rejection-by-state
    title: Mail ballots rejected, by state, 2024
    description: >-
      Share of returned mail ballots each state rejected in the November 2024
      general election. The eight mostly-mail states and D.C. are outlined.
    map: us-states
    areaLabel: State
    valueLabel: Rejected, % of returned mail ballots
    format: { unit: percent, decimals: 1 }
    breaks: [0, 0.5, 1, 2, 4, 9]
    highlight: [CA, CO, HI, NV, OR, UT, VT, WA, DC]
    valuesFrom: EAVS 2024 Overview Table 1
    sources: [5]
    data:
      AR: { value: 8.8, asPublished: 8.8% }
      DE: 5.1
      OK: 4.3
      VT: 0.2
      ME: 0.2
      IN: 0.2
      # … every other state and D.C.
```

**barChart** — Washington 2020 rejection rate by race (vote by mail R2):

```yaml
  - kind: barChart
    id: wa-by-race
    title: Mail ballots rejected in Washington, by race, 2020
    description: The State Auditor's rates for each group, before any controls for age or county.
    valueLabel: Rejected, % of returned ballots
    categoryLabel: Group
    format: { unit: percent, decimals: 2 }
    sources: [11]
    items:
      - { label: Black, value: 2.49 }
      - { label: Native American, value: 1.59 }
      - { label: Hispanic, value: 1.57 }
      - { label: Asian or Pacific Islander, value: 1.24 }
      - { label: White, value: 0.63 }
```

**compositionBar** — Iranian deaths by counter (Iran R5). Hengaw does not
split military deaths, so its non-civilian count is its own category rather
than being forced into HRANA's:

```yaml
  - kind: compositionBar
    id: deaths-by-counter
    title: Iranian deaths in the war, by counter and category, early April 2026
    description: >-
      Each counter's total split into the categories it publishes. The
      counters use different categories and dates, so compare the splits, not
      only the totals.
    rowLabel: Counter
    showCounts: true
    categories:
      - { key: civilian, label: Civilian }
      - { key: military, label: Military }
      - { key: unclassified, label: Not yet classified }
      - { key: other, label: "Other (Hengaw's category)" }
    rows:
      - { label: 'HRANA, 7 Apr', values: { civilian: 1701, military: 1221, unclassified: 714 }, source: 12 }
      - { label: 'Hengaw, 8 Apr', values: { civilian: 1030, other: 6620 }, source: 13 }
    note: >-
      The government's count (3,375 to 21 July) gives no split and is not
      shown as a bar; it is in the Observations below.
```

**estimateRange** — cost estimates (Iran R5):

```yaml
  - kind: estimateRange
    id: cost-estimates
    title: Estimated cost of the war to the US, by estimator, 2026
    description: >-
      Each published estimate of the cost so far, with its range where the
      estimator gave one. Later estimates cover a longer war.
    valueLabel: Estimated cost, US$ billion
    format: { unit: number, decimals: 1 }
    intervalLabel: Range the estimator published
    nullValue: null
    estimates:
      - { label: AEI, year: 8 Apr 2026, low: 25, high: 35, source: 14 }
      - { label: CSIS, year: Jun 2026, estimate: 40, low: 34, high: 42, source: 15 }
      - { label: CBO, year: 1 Aug 2026, estimate: 38, source: 16 }
      - { label: Department of Defense, year: 3 Sep 2026, estimate: 43.6, source: 17 }
```

**quoteComparison** — damage claims (Iran R1):

```yaml
  - kind: quoteComparison
    id: damage-claims
    question: What did the strikes do to Iran's enriched uranium?
    description: Four answers from the US government, an independent institute and the IAEA.
    quotes:
      - { text: "buried and we're watching it", speaker: Pete Hegseth, role: Secretary of Defense, date: '2026-04', source: 18 }
      - { text: no identifiable route, speaker: Institute for Science and International Security, date: '2026-06', source: 19 }
      - text: cannot provide any information on the current size, composition or whereabouts
        speaker: IAEA Director General
        context: Report to the Board of Governors
        date: '2026-06'
        source: 1
```

**pullQuote** — Carter–Baker (vote by mail R4):

```yaml
  - kind: pullQuote
    id: carter-baker
    description: >-
      The same report found "no evidence of extensive fraud" in US elections.
    quote:
      text: Absentee ballots remain the largest source of potential voter fraud.
      speaker: Commission on Federal Election Reform (Carter–Baker)
      date: '2005-09'
      source: 21
```

**claimCheck** — Rasmussen–Heartland (vote by mail R4):

```yaml
  - kind: claimCheck
    id: one-in-five
    claim: One in five mail-in voters admit they cheated
    claimant: { name: Heartland Institute and Rasmussen Reports }
    date: '2023-12'
    claimSource: 22
    status: not-supported
    finding: >-
      The survey asked an opt-in online panel about behaviour that is not
      always illegal, and measured no fraudulent ballots.
    sources: [22, 23]
    evidence: { fact: mail-ballot-privacy, section: privacy-surveys }
```

**caveatList** — "detected fraud is a floor" (vote by mail R4):

```yaml
  - kind: caveatList
    id: detected-is-a-floor
    heading: Detected fraud is a floor, not a measure
    items:
      - measure: Household pressure
        why: Pressure inside a home is rarely reported, so it rarely becomes a case.
        sources: [24]
      - measure: Signature review
        why: In Cobb County's audit a spouse-signed envelope passed signature review.
        sources: [25]
      - measure: "Heritage's database"
        why: It is a sample of cases its compilers found, not a count of all cases.
        sources: [26]
```

---

## 3. Phase 2 — fixes to components in use

Each item is independent and can be its own commit. `components/topic/*.test.ts`
is not in the `test:unit` glob today; add it (`package.json`), since several
tests below belong there.

### 3.1 EventStrip key collapsible

**Problem.** Five events under one chart make a 15-line key — the block of
text the markers were meant to replace (voter-ID R1's ID-law chart; R6's
confidence charts).

**Change** — `components/report/event-strip.tsx`, `EventKey`:

- Each item with a `description`, `source` or `href` renders as

  ```html
  <li class="sv-event-strip__item">
    <details class="sv-event-strip__details" id="{keyId}-{n}">
      <summary class="sv-event-strip__summary">
        <span class="sv-event-strip__number" aria-hidden="true">{n}</span>
        <span class="sv-event-strip__item-head"><time dateTime="…">{date}</time> {label}</span>
      </summary>
      <div class="sv-event-strip__body">{description} {source line} {href link: "See the evidence"}</div>
    </details>
  </li>
  ```

  closed by default. An item with none of the three stays a plain `<li>`
  carrying the id (nothing to expand). The `id` moves from the `<li>` to the
  `<details>`, so existing `#{keyId}-{n}` links keep working.
- `href` moves out of the summary (a link inside a `<summary>` is a second
  click target in one control) into the body.
- **Opening on click or hash.** Extract `decodeHash` and the
  open-the-ancestor-chain loop from `components/topic/hash-sync.tsx` into
  `components/topic/open-details.ts` (`export function openDetails(el: HTMLDetailsElement): void` and `export function decodeHash(raw: string): string`); `HashSync` imports them, behaviour unchanged. Add
  `components/report/details-target.tsx` (`'use client'`), rendered once
  inside `EventStrip` with the strip's root id: on mount and on `hashchange`
  it opens the `<details>` the hash names if it is inside the strip; on click
  of an `a[href^="#"]` inside the strip it opens the target without
  scrolling (the browser scrolls). It never closes an open item. On fact
  pages and in the sheet, `revealEvidence` already opens a targeted
  `<details>`; the island makes the same true in Storybook and anywhere else.
- **CSS** — `components/report/styles/timelines.css`: move the grid from
  `.sv-event-strip__item` to `.sv-event-strip__summary`; add the `+`/`−`
  marker, hover and focus styles of `.sv-observation > summary`; move
  `:target` highlighting to `.sv-event-strip__details:target`.
- `PeriodTimeline` uses `EventKey` too and gets the same behaviour; that is
  intended.

**Without JavaScript** a marker still jumps to its item, whose summary shows
the date and label; the reader opens it for the detail.

**Tests:**

- `components/report/event-strip.test.ts` — three events, one bare: two
  closed `<details>` with ids `…-1` and `…-2`, the bare one a `<li id="…-3">`;
  each summary contains the formatted date and label.
- `tests/series-chart.spec.ts` — on
  `/topics/us-voter-id/facts/voter-id-rules-in-the-us-and-abroad`, clicking
  marker 3 opens
  `#sv-event-strip-voter-id-rules-in-the-us-and-abroad--states-with-id-events-3`
  and leaves 1, 2, 4, 5 closed; loading the page with that hash opens it.
  (Depends on authored voter-ID content; say so in the test's header comment
  like the others.)

### 3.2 Markdown tables in prose

**Problem.** Body tables have no styles: `.prose-body table` is unstyled (the
needs list calls it `.sv-prose`; the class is `.prose-body`), so header cells
run together ("20202022") and four-column tables push the page sideways at
390px (voter-ID R2, R3, R5).

**Change:**

- `lib/content/markdown.ts` — add `rehypeScrollableTables`, run after
  `rehypeEvidenceSections`, wrapping every `<table>` in
  `<div class="sv-prose-table" role="region" tabindex="0" aria-label="…">`.
  The label is the text of the nearest preceding `h2`, `h3` or `summary` in
  document order, else "Table". The region and tab stop let a keyboard user
  scroll it; a bare `overflow` on the table itself would drop its table
  semantics in some screen readers.
- `app/globals.css`, beside the other `.prose-body` rules:

  ```css
  .prose-body .sv-prose-table { overflow-x: auto; overscroll-behavior-x: contain; margin-block: 1rem 1.25rem; border-top: 1px solid var(--rule-strong); }
  .prose-body .sv-prose-table:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .prose-body table { width: 100%; border-collapse: collapse; font-family: var(--font-sans); font-size: .8125rem; line-height: 1.45; }
  .prose-body th, .prose-body td { padding: .45rem .75rem .45rem 0; text-align: left; vertical-align: top; border-bottom: 1px solid var(--rule); min-width: 6.5rem; max-width: 22rem; }
  .prose-body :is(th, td):last-child { padding-right: 0; }
  .prose-body thead th { color: var(--ink-2); font-weight: 600; }
  ```

  The table scrolls inside its own box, never the page.

**Tests:**

- `lib/content/markdown.test.ts` — a GFM table renders inside
  `div.sv-prose-table[role=region][tabindex=0]` labelled by the preceding
  heading; a table inside an Observations expando is wrapped too.
- `tests/appearance.spec.ts` — at 390×844 on
  `/topics/us-voter-id/facts/federal-and-state-power-over-voting-rules`: no
  page overflow (`scrollWidth <= clientWidth`, as the existing tests check);
  the table's wrapper has `scrollWidth > clientWidth`; adjacent header cells'
  bounding boxes are at least 8px apart.

### 3.3 SeriesChart time-axis labels collide at narrow width

**Problem.** On the 1950–2026 ID-law chart at 390px, `yearTicks` gives
1950, 1960, 1980, 2000, 2020, 2026; "2020" and "2026" are 24px apart, less
than a label's width, and print over each other.

**Change** — `lib/chart/series-chart.ts`:

```ts
/** About 0.6em per digit in the sans tick face, plus a gap. */
export function tickLabelWidth(label: string, fontSize: number): number {
  return label.length * fontSize * 0.6 + 6;
}
/** Drop interior ticks too close to either end tick to fit their labels. The ends are always kept. */
export function dropCrowdedTicks(ticks: TimeTick[], fontSize: number): TimeTick[];
```

`layoutReading` applies it to `timeTicks`. A tick is crowded when the
distance from its x to the first or last tick's x is less than
`(tickLabelWidth(a) + tickLabelWidth(b)) / 2`.

**Tests** — `lib/chart/series-chart.test.ts`: coverage 1950–2026, narrow →
1950, 1960, 1980, 2000, 2026; wide → keeps 2020 (51px from 2026, more than
the 37px needed); 1964–2025 narrow is unchanged from today.

### 3.4 The axis caption lowercases the period label

**Problem.** `series-chart.tsx` writes
`{reading.valueLabel}, by {series.periodLabel.toLowerCase()}`, so "Year of
NCSL count" becomes "by year of ncsl count" and "November general election"
becomes "by november general election". The screen-reader description does
the same to the reading label (`Read as ${reading.label.toLowerCase()}`).

**Change.** Add to `lib/chart/series-chart.ts`:

```ts
/**
 * Lower-case only the first letter, so a label can follow "by" mid-sentence:
 * "Year of NCSL count" → "year of NCSL count". Leaves the label as written
 * when its first word is an acronym (two or more capitals: "EAVS cycle") or
 * a month ("November general election").
 */
export function midSentence(label: string): string;
```

Use it for the caption and the "Read as …" sentence. Table headers keep the
label as written. No content changes are needed; see open question 5.

**Tests** — `lib/chart/series-chart.test.ts`: "Year" → "year"; "Year of
NCSL count" → "year of NCSL count"; "November general election" unchanged;
"EAVS cycle" unchanged; "Survey fieldwork month" → "survey fieldwork month".
`components/topic/series-chart.test.ts`: the rendered caption for the
voter-ID ID-law series contains "by year of NCSL count".

### 3.5 Grouped comparison table header

**Problem.** `comparison-chart.tsx` hard-codes `<th>Country</th>` over the
item column of the "Show all breakdowns" table, so voter-ID R5's case-methods
table heads its methods column "Country".

**Change.** The needs list suggests `groupLabel`, but that names the
*columns* (here "whether an ID check would reach it"), not the rows. So:

- `comparisonChartSchema` gains `itemLabel: z.string().min(1).optional()` —
  what each bar is, e.g. "Method".
- The table header reads `itemLabel ?? 'Category'`, then the group names,
  then "Total"; and the table gets
  `<caption>{title}, by {groupLabel}</caption>` so the column grouping is
  named too.
- `content/AUTHORING.md` (Nationality Breakdowns section) documents
  `itemLabel`.

**Test** — `components/topic/comparison-chart.test.ts`: a grouped chart with
`itemLabel: 'Method'` renders `<th …>Method</th>` and no "Country"; without
`itemLabel` it renders "Category"; the caption contains the `groupLabel`.

### 3.6 `check:figures`: percent forms, dollars, and the report's own sources

**Problems.**

- "1.4%" and "1.4 percent" are treated as different figures, and prose
  written "6.7 percent" (the election-fraud report's claim) is not extracted
  at all: `FIGURE` only knows `%`.
- `FIGURE` only knows `£`, so every dollar figure in the US topics ("$50 to
  $125") goes unchecked.
- A figure counts as quoted if it appears in *any* quote on the topic, so a
  report can borrow a number from another report's sources.

**Change** — `scripts/figures.ts`:

- `FIGURE`: money branch `[£$€]\s?\d…`; percent branch
  `…\s*(?:%|percent\b|per\s?cent\b)`.
- `canonical`: `per cent`, `percent` and `pct` → `%`; trailing decimal zeros
  dropped (`1.0%` → `1%`, `2.50` → `2.5`); currency symbols kept, so `$5` and
  `£5` stay different.
- `QUOTE_NUMBER` accepts `[£$€]?` and the same percent words.

`scripts/check-figures.ts`:

- **Facts** are matched against a corpus built from their own frontmatter
  only (`collectQuotes(item.data)` plus that fact's `verifiedDerivedFigures`).
- **Viewpoints, cruxes and the topic intro** are matched against the union of
  the corpora of the facts they cite (`citedFactIds(body)` from
  `lib/content/markdown.ts`). See open question 3.
- **Principles** stay matched topic-wide: they are shared across topics and
  should carry no figures.
- The report line names the corpus used: `fact/x: 1.4% — not in this
  fact's sources`.

**Tests** — `scripts/figures.test.ts`: "1.4 percent" matches a quote's
"1.4%" and vice versa; "6.7 percent" is extracted; "$50" is extracted and
matches "$50" but not "£50"; "1.0%" matches "1%".
`scripts/check-figures` gets a pure `auditTopic(items)` export and a test
with two facts where a figure quoted only in fact B's source fails in fact
A's body.

**Before landing,** run `heavy run -- pnpm check:figures` and list the new
failures in the PR. Dollar and "percent" figures in the voter-ID reports
were never checked before, so some will surface; fixing them is content work
for whoever owns those files.

### 3.7 Chart-value audit

**Problem.** `check:figures` audits prose only. The hand audit in commit
8cf99fa found one wrong chart value (Gallup 46/48, not 47/49) and one chart
of levels Gallup never published. The drafts show the same risk: the vote-by-
mail plan's "317,191 cured (54.3%)" of 585,457 does not divide out
(317,191 ÷ 585,457 = 54.2%).

**Rule.** Every number a chart draws must be traceable to one of:

1. **its own source's quote** — a series reading's `source` (else the
   series `source`); a comparison's or figure's cited sources; an item's own
   `source` when it has one;
2. **a named table** — the reading, comparison or figure declares
   `valuesFrom` ("EAVS 2024 Overview Table 1"), shown to the reader in About
   this data; or
3. **a verified derivation** — a `derivedFigures` entry on the same fact.

**Change** — new `scripts/chart-values.ts`:

```ts
export type ChartValue = {
  where: string;                // "series reading rejection-rate line Texas 2022"
  renderings: string[];         // forms to try against the quote tokens
  asPublished?: string;
  allowedQuotes: string[];
  valuesFrom?: string;
};
export function chartValues(fact: Fact): ChartValue[];  // series, additionalSeries, comparisons, figures
export type ValueVerdict = 'quoted' | 'derived' | 'table' | 'untraced';
export function auditValue(v: ChartValue, derived: QuoteCorpus): ValueVerdict;
```

- **Renderings.** Series `percent` → `${v}%`; series `count` → the digits
  and `formatTick` ("1.4m"); comparisons `pounds` → `£${v}`; figure values →
  `formatValue(v, format)` with and without `compact`. Each is run through
  `canonical` and tested for membership in `quoteCorpus(allowedQuotes)`.
- **`asPublished`**, when given, must appear (after `canonical`-style
  normalisation of both) as a substring of an allowed quote; the number
  itself is then not tested.
- **Grouped comparisons** audit each `values[i]` as well as the total.
- Small bare integers (under 10) match weakly, because quote tokens include
  every bare number; the audit accepts them but counts them separately in the
  report so a reviewer can look.

`check-figures.ts` prints, per topic, the `untraced` values with their
location, then one advisory line per chart saying how many values rest on a
named table.

**Status: advisory at first.** The audit prints and exits 0, and a
`--strict-values` flag makes `untraced` values fail. Switch CI to strict in
the PR after both trial topics pass (open question 2). Today most series
values come from tables no quote can hold, so a failing audit on day one
would block every content PR until `valuesFrom` is added everywhere.

**Tests** — `scripts/chart-values.test.ts`: a point quoted in its reading's
source passes; the same value quoted only in another fact fails; a value
covered by `valuesFrom` is `table`; a `ratio-percent` derivation is
`derived`; `asPublished: 'more than 7,200'` passes against a quote with
"more than 7,200 signatures"; grouped components are each audited.

---

## 4. Phase 3 — new capabilities

All six follow the same rules: server-rendered SVG or HTML, the two size
variants of `CHART_GEOMETRY` (narrow 360×250 below 34rem, wide 720×300
above, both rendered, CSS shows one), a Table view behind `ChartViewToggle`
with the noscript fallback, never colour alone, and a Storybook story with
fixture data from the drafts. Fixture values the drafts do not contain are
marked `ILLUSTRATIVE` in the fixture's name and doc comment, as
`components/report/stories/fixtures/maps.ts` already does.

### 4.1 (a) Categorical mode for TileMap and GeoMap

**Purpose.** Show a rule or category per area — the ID rule each state
enforces, IDEA's postal voting for all, some or no voters — without coding it
as a number, which would imply a false order and a false legend.

**Needed by.** Voter ID (ID rule by state, 2026); vote by mail R2 (how each
state verifies mail ballots) and R5 (IDEA postal voting by country).

**Props** — new `components/report/geo/categorical.ts`:

```ts
export type MapCategory = {
  id: string;
  label: string;
  /** One to three characters printed on every tile in this category: "SP". The non-colour cue on a tile map. */
  mark: string;
};
export type CategoryAssignment = { category: string; note?: string };
export type CategoryData = Record<string, CategoryAssignment>;
export type CategoryEncoding = {
  /** What the categories are: "ID rule at the polls". Legend and table heading. */
  categoryLabel: string;
  /** In the order the legend and table list them. At most six. */
  categories: MapCategory[];
  categoryData: CategoryData;
};
export function categorySlots(categories: MapCategory[]): Map<string, number>;   // 1..6 in list order
export function categoryCounts(data: CategoryData, areaIds: string[]): Map<string, number>;
export function categorySummary(areas: Array<{ id: string; name: string }>, enc: CategoryEncoding): string;
// "51 areas in 5 categories: No ID document requested, 15; … No data, 0."
```

`TileMapProps` and `GeoMapProps` become `Common & (ValueEncoding | CategoryEncoding)`,
where `ValueEncoding` is today's `data`/`valueLabel`/`format`/`scale`/… with
`categories?: never`, and `CategoryEncoding` has `data?: never`.

**Rendering.**

- **Fill and pattern per slot**, defined once in
  `components/report/styles/maps.css` as custom properties so tiles (CSS
  backgrounds) and GeoMap (SVG `<pattern>`s) match:

  | Slot | Fill | Pattern (in `--sv-series-N`, 1px) |
  | --- | --- | --- |
  | 1 | `color-mix(in srgb, var(--sv-series-1) 30%, var(--paper))` | none |
  | 2 | same mix with series 2 | dots, 6px grid |
  | 3 | series 3 | horizontal lines, 5px |
  | 4 | series 4 | vertical lines, 5px |
  | 5 | series 5 | grid (both) |
  | 6 | series 6 | diagonal at 135° |

  "No data" keeps today's 45° ink-4 hatch on plain paper, so it never looks
  like a category. The palette is categorical even when the categories have
  a natural order; an ordered ramp would read as a measured quantity.
- **TileMap:** each tile prints its code on the first line and its
  category's `mark` on the second (where the value goes in numeric mode).
  Ink text on the 30% tint.
- **GeoMap:** regions fill with `url(#<instance>-cat-<slot>)` patterns from
  a `<defs>` block (ids from `useId`). Small countries rely on the readout,
  the legend counts, the table and the existing `insets` prop.
- **Legend** (`geo/category-legend.tsx`): one entry per category — a
  1.4×0.9rem swatch with fill, pattern and mark, the label, and the count
  "(10)"; then "No data" with its count when any area is missing.
- **Readout:** "Arkansas: Strict photo ID — {note}".

**Table view** (`geo/category-table.tsx`): one `<tbody>` per category, in
category order, headed by `<th colSpan={2} scope="rowgroup">Strict photo ID — 10 states</th>`,
then a row per area (`<th scope="row">` name, `<td>` note), names
alphabetical; "No data" last. Column headers: `{areaLabel}`, "Note".

**Accessibility.** Mark plus pattern plus colour on tiles; pattern plus
colour plus readout on GeoMap; the summary sentence is the screen-reader
description; tiles keep `tabIndex={0}` and `aria-label` "Arkansas: Strict
photo ID"; GeoMap regions likewise.

**No-JS.** Map, legend and counts are static; readout needs script; the
table is in the noscript disclosure.

**Content schema.** `tileMapFigureSchema` gains `categoryLabel`,
`categories: z.array(z.object({ id: slugId, label, mark: z.string().min(1).max(3) })).min(2).max(6)`
and `areas: z.record(z.string(), z.union([slugId, z.object({ category: slugId, note: z.string().optional() })]))`;
the refine becomes "exactly one of numeric (`data` + `valueLabel`) or
categorical (`categories` + `areas` + `categoryLabel`)". New kind
`geoMap`: `figureBase` + `regions: z.enum(['world', 'europe', 'uk-itl1'])`,
`areaLabel`, `highlight`, `insets?: [{ regionIds, label? }]`, and the same
two encodings. Adapter maps `'world'` → `WORLD_COUNTRIES`, `'europe'` →
`EUROPE_COUNTRIES` with `EUROPE_EXTENT`, `'uk-itl1'` → `UK_ITL1_REGIONS`.

**Validation.** Category ids and marks unique; every assignment names a
category; area ids belong to the preset; F9's "missing areas need a note"
applies.

**Tests.** `components/report/geo/categorical.test.ts`: slots in list
order; counts include "No data"; summary text; **contrast** — for each slot,
ink against the 30% mix of that slot's series colour and paper is at least
4.5:1 in both themes (compute from the hex tokens in `app/globals.css` with a
small `contrast()` helper; fail if a token change breaks it).
`tile-map.test.ts`: every tile in a category carries its mark; the table has
one `rowgroup` per category. Playwright with the first content use.

**Stories.**

- `tile-map.stories.tsx` → `CategoricalVoterIdRules`, fixture
  `US_VOTER_ID_RULES_2026` in `fixtures/maps.ts`, from NCSL Table 1 (2026) as
  quoted in `voter-id-rules-in-the-us-and-abroad` source 2:
  - **Strict photo (SP):** AR GA IN KS MS NH NC OH TN WI
  - **Strict non-photo (SN):** AZ IA ND WY
  - **Non-strict photo (P):** AL FL ID KY LA MI MO MT NE RI SC SD TX WV
  - **Non-strict non-photo (N):** AK CO CT DE OK UT VA WA
  - **No document requested (—):** CA DC HI IL MA MD ME MN NJ NM NV NY OR PA VT

  (10 + 4 + 14 + 8 + 15 = 51, matching the report's comparison.)
- `geo-map.stories.tsx` → `CategoricalIdeaPostalVoting`, fixture
  `IDEA_POSTAL_VOTING_2025`: "all voters" for the eleven the draft confirms
  (CA DE IS KR LI LU NZ PL CH GB US), "some voters" for FR and AU, every other
  country "No data", with a story description saying the remaining lists are
  still to be extracted from IDEA's tables.

### 4.2 (b) Labelled scatter plot

**Purpose.** Plot two measures per area against each other, every point
labelled, so the reader can see a relationship (or its absence) instead of
hunting for it in a table.

**Needed by.** Vote by mail R3 (when mail processing may begin, against hours
to count 95% of the vote); a second use is mail share against rejection rate.

**Files.** `lib/chart/scatter.ts` (geometry, scales, label placement — pure,
tested in `lib/chart/scatter.test.ts`); `components/report/scatter-plot.tsx`;
export from `components/report/index.ts` under Data.

**Props:**

```ts
export type ScatterPoint = {
  id: string;
  /** Printed beside the point, one to four characters: "AZ". */
  label: string;
  /** Full name for the readout and the table: "Arizona". */
  name: string;
  x: number;
  y: number;
  group?: string;
  note?: string;
};
export type ScatterAxis = { label: string; format?: ValueFormat; domain?: [number, number]; includeZero?: boolean };
export type ScatterPlotProps = {
  points: ScatterPoint[];
  x: ScatterAxis;
  y: ScatterAxis;
  groups?: Array<{ id: string; label: string }>;
  /** Outlined and labelled in bold; never recoloured. */
  highlight?: string[];
  /** Table heading for the points: "State". */
  pointLabel: string;
  id?: string; title?: string; description?: ReactNode; sources?: SourceCredit[]; note?: ReactNode; footer?: ReactNode;
};
```

**Geometry** — same widths and left/right insets as the series chart so the
two align when stacked; taller, because both axes carry data:

```ts
export const SCATTER_GEOMETRY = {
  narrow: { ...CHART_GEOMETRY.narrow, height: 300, plotHeight: 300 - 12 - 30, pointRadius: 4, labelSize: 10 },
  wide:   { ...CHART_GEOMETRY.wide,   height: 420, plotHeight: 420 - 14 - 34, pointRadius: 5, labelSize: 12 },
};
```

- **Scales:** `niceTicks` (from `lib/chart/series-chart.ts`) on each axis,
  including zero unless `includeZero: false`; `domain` overrides. Hairline
  gridlines both ways; y labels every second tick at narrow width
  (`valueLabelEvery`), x tick labels pass through `dropCrowdedTicks`.
- **Axis labels** are HTML, not SVG: the y label above the plot
  (`sv-chart__axis-label`, as series charts do), the x label below it,
  right-aligned.
- **Marks:** `MarkerShape` per group slot (`shapeForSlot`) in
  `--sv-series-N`; one group → circles in slot 1. Highlighted points get a
  2px ink ring and a bold label.
- **Labels:** `placeLabels(points, geometry)` tries, per point, right, left,
  above, below, then the four diagonals; a candidate is rejected if it leaves
  the plot rectangle or overlaps a placed label or another point (label box =
  `label.length × 0.6 × labelSize` by `labelSize`). Highlighted points are
  placed first, then by ascending x. A point with no free candidate takes the
  least-overlapping one and is drawn with a paper halo
  (`paint-order: stroke`); `placeLabels` returns `crowded: true` for it.
- **No trend line or correlation figure.** A fitted line invites a causal
  reading the chart cannot support; a correlation, if sourced, belongs in an
  Observation.

**Table view:** columns `pointLabel` (name), `x.label`, `y.label`, the group
label when `groups` is set, and "Note" when any point has one; rows by name.

**Accessibility:** the SVG is `role="group"` labelled by the title and
described by a hidden summary ("{n} states. {x.label} from a to b; {y.label}
from c to d." followed by the author's description). Each point is a
`<g tabIndex={0} role="img" aria-label="Arizona: …" data-region={id} data-readout={…}>`,
and the plot sits inside `MapReadout`, which already announces focused or
hovered `[data-readout]` elements in a live region. Groups differ by shape as
well as colour; highlight by ring and weight.

**No-JS:** SVG and labels static; readout inert; table in noscript.

**Content schema** — kind `scatterPlot`: `figureBase` + `pointLabel`,
`x`/`y`: `{ label, format?, domain?, includeZero? }`, `groups?`,
`highlight?`, `points: [{ id: slugId, label: z.string().min(1).max(4), name, x, y, group?, note?, xAsPublished?, yAsPublished? }]` (min 3).
**Validation:** point ids unique; groups exist; `domain`s cover the values;
highlight ids exist.

**Tests** — `lib/chart/scatter.test.ts`: scales include zero by default;
both variants share scales; `placeLabels` is deterministic, keeps labels
inside the plot, and produces no overlaps for the seven-state fixture;
`components/report/scatter-plot.test.ts`: every point has a label element
and an `aria-label`; the table has one row per point.

**Story** — `scatter-plot.stories.tsx`, fixture
`MAIL_COUNT_SPEED_ILLUSTRATIVE`: y = hours to count 95% of the vote in
2024, from the draft's D22 (AZ 147, NV 51, PA 8, GA 5, NC 6); x = days
before Election Day processing may begin, **illustrative** until NCSL Table
16 is read (the story description says so). A second story,
`HighlightAndGroups`, groups the same points by "mostly-mail" and outlines AZ.

### 4.3 (c) Focus window on a full-range series

**Purpose.** Keep the full-range rule for a dense series while letting the
reader see a short period: daily Brent has 9,112 points over 39 years, and
the 2026 shock is under 3% of the plot width.

**Needed by.** Iran R6 (Brent and WTI, daily, 1986/1987–2026).

**Schema** — `seriesSchema` gains:

```ts
  /**
   * A period drawn at readable scale under a small strip of the full range.
   * The full range is still drawn (the strip), still declared (`coverage`)
   * and still tabulated; only the large plot is the window.
   */
  focus: z.object({
    from: partialDate,
    /** Defaults to coverage.to. */
    to: partialDate.optional(),
    /** Names the window in the switch: "Last 12 months". */
    label: z.string().min(1),
  }).optional(),
```

**Validation** — `seriesErrors`: `focus` inside coverage; `from` before
`to`; at least two points of some line fall inside it. The coverage rule is
unchanged: every line still spans `coverage`.

**Rendering** — per reading, top to bottom:

1. **Context strip** (`CONTEXT_GEOMETRY` in `lib/chart/series-chart.ts`):
   narrow 360×56 (left 44, top 6, plotWidth 306, plotHeight 32, fontSize
   10); wide 720×64 (left 56, top 6, plotWidth 650, plotHeight 38, fontSize
   11). Same left inset and width as the main plot, so years line up. Lines
   only, no value labels; year ticks over the full coverage (through
   `dropCrowdedTicks`); breaks as short ticks. The window is a rectangle with
   an accent-wash fill and a 1.5px accent outline, and the HTML line under the
   strip says "Below: 20 Oct 2025 – 20 Oct 2026, of the full range May 1987 –
   Oct 2026" (text, not just the box).
2. **Switch** — `ChoiceGroup` with `focus.label` and "Full range"; client
   only. Both main plots are in the markup; the switch shows one. Without
   JavaScript the window plot shows.
3. **Main plot** — `layoutReading(series, reading, variant, window?)`: x
   domain = window; y domain from `niceTicks` over values inside the window
   plus the nearest point either side, with a `clipPath` at the plot edges.
   Time ticks: whole years when the window spans three years or more,
   otherwise months — every month (wide) or every third month (narrow),
   labelled "Jan 2026" on the first tick and every January and "Apr", "Jul",
   "Oct" between, all through `dropCrowdedTicks`. The full-range plot uses
   today's geometry and ticks.
4. **EventStrip** — new prop `window?: { from: PartialDate; to: PartialDate }`:
   markers only for in-window events; out-of-window events stay in the
   numbered key with "(outside the period shown)" after the date. In the
   full-range view the strip shows all markers.

**Decimation.** `decimate(points, columns): SeriesPoint[]` keeps the first
and last point and the minimum and maximum of each pixel column (so spikes
survive); used for the context strip and the full-range plot whenever a line
has more than twice as many points as the plot is wide. The window plot is not
decimated (a year of daily data is about 260 points).

**Table view:** every point, undecimated, with caption "All 9,112 daily
values, 20 May 1987 – 20 Oct 2026. The graph shows …". Page weight is the
cost; measure it (open question 8).

**Accessibility.** The description adds: "The graph shows {window}; a strip
above it shows the full published range {coverage}." The strip is
`aria-hidden` (the main plot and table carry the data).

**Tests** — `lib/chart/series-chart.test.ts`: window layout puts the window
ends at the plot edges and takes its y domain from in-window values;
`decimate` keeps global min and max and both ends; month ticks for a one-year
window; `validate.test.ts`: a focus outside coverage fails.
`event-strip.test.ts`: with `window`, out-of-window events get no marker but
keep their key item.

**Story** — `series-chart.stories.tsx` → `FocusWindowBrent`, fixture
`fixtures/brent-daily.ts`. Generate it once with a script from EIA's daily
Brent file (`https://www.eia.gov/dnav/pet/hist_xls/RBRTEd.xls`). If the
file cannot be fetched, generate a deterministic synthetic series pinned to
the draft's real anchors (27 Feb 2026 $71.32, 7 Apr 2026 $138.21, 2 Oct
$135.51, 20 Oct $115.22, 3 Jul 2008 $143.95) and name it
`BRENT_DAILY_ILLUSTRATIVE`. Events: 28 Feb, 8 Apr, 13 Apr, 17 Jun, 14 Jul,
1 Sep, 8 Oct 2026.

### 4.4 (d) Per-line coverage within one series

**Purpose.** Put comparable measures on one axis when their sources start in
different years, instead of splitting them into separate charts.

**Needed by.** Iran R6 (Brent from 1987 beside WTI from 1986) and R3 (IHRNGO
executions from 2008 beside Amnesty's Iran figure from 1981).

**Schema** — `seriesLineSchema` gains `coverage: seriesCoverageSchema.optional()`:
"this line's source publishes a different range from the series".

**Validation** — `seriesErrors` (`lib/content/validate.ts`):

- each line's span is `line.coverage ?? series.coverage`; its first and last
  points must equal its span's ends (the existing messages, naming the line's
  own coverage);
- every line span lies inside `series.coverage`;
- `series.coverage.from` equals the earliest span start and `.to` the latest
  span end, so the series still declares the union and the axis cannot be
  stretched past the data.

The full-range rule is unchanged for each line: each still runs its own
source's whole published range.

**Rendering.**

- **Plot:** no geometry change; the x domain is the series coverage, and a
  line simply starts or ends where its span does. Its end marker sits on its
  own last point.
- **Legend:** a line whose span differs from the series gets its range after
  its name: "WTI (from 1986)".
- **Table** (`ReadingTable` in `components/topic/series-chart.tsx`): rows are
  the union of all lines' periods, sorted with `comparePeriods` (today it
  uses only the first line's periods, which would drop the earlier years);
  outside a line's span the cell reads "—", and the caption ends "— : outside
  this source's published range".
- **About this data:** "Full published range" lists each line's span when
  they differ, instead of "Every plotted line runs the whole of it".

**Accessibility.** The description names each line's span.

**Tests** — `validate.test.ts`: a line with its own coverage that ends early
passes; one that stops short of its own coverage fails; a series coverage
wider than the union fails. `lib/chart/series-chart.test.ts`: table rows are
the union. `components/topic/series-chart.test.ts`: legend suffix.

**Story** — `series-chart.stories.tsx` → `PerLineCoverageExecutions`, using
the draft's annual values: IHRNGO 2020–2025 (267, 333, 582, 834, 975, 1,639;
2023 marked unverified in the draft) and Amnesty's Iran figure 2023–2025
(853, 972, 2,159). The story description says the real report runs IHRNGO
from 2008 and Amnesty from its first report.

### 4.5 (e) "Not measured since" band

**Purpose.** Show that a series stops because measurement stopped, not
because the source ends — the gap is a finding.

**Needed by.** Iran R1 (enriched uranium: the IAEA has not verified Iran's
stock since 13 June 2025).

**Schema** — `seriesSchema` gains:

```ts
  notMeasuredSince: z.object({
    /** Short, shown in the band or beside it: "Not verified since IAEA access ended". */
    label: z.string().min(1).max(48),
    /** What stopped and why, in the source's terms. */
    note: z.string().min(1),
    /** Where the band ends. Defaults to the topic's lastUpdated. */
    until: partialDate.optional(),
    source: citation,
  }).optional(),
```

**Validation.** The band starts at `coverage.to` (the last point, by the
coverage rule); `until` (or `lastUpdated`) is after it and not after
`lastUpdated`; events may fall up to `until`, not just `coverage.to` (adjust
the events rule); `source` is a valid citation. This needs the topic in
`seriesErrors`; pass `topic.lastUpdated` in.

**Rendering** (`layoutReading` returns `unmeasured: { x0, x1 } | null`):

- The x domain runs from `coverage.from` to `until`, so the band has room.
- A rectangle from `x(coverage.to)` to `x(until)` over the full plot height,
  filled with an SVG pattern of 45° `--ink-4` hairlines on paper — the same
  mark the maps use for "No data", so hatching means "not measured"
  everywhere.
- The label sits inside the band, top-left, when the band is at least the
  label's width plus 8px; otherwise it moves to the key line below.
- A key line under the plot, always present:
  "Hatched: {label}, {date} – {until}. [Why](#{fact}--{reading}-not-measured)".
- Method Changes gains an entry with that id (extend `methodChanges()` in
  `lib/content/chart-observations.ts`), carrying the `note` and its `[n]`.
- Time ticks cover the extended domain; the last tick is `until`'s year.
- The EventStrip spans to `until`, so "verification stops, 28 Feb 2026" sits
  inside the band.

**Table view:** a final row
`<tr data-unmeasured><th>13 Jun 2025 – 29 Oct 2026</th><td colSpan>Not measured: {label}</td></tr>`.

**Accessibility.** The description adds "No values after {date}: {label}."
The band is marked by hatching and words, not colour.

**Tests** — `lib/chart/series-chart.test.ts`: the band's x0 is the last
point's x and x1 the plot's right edge; `validate.test.ts`: `until` before
`coverage.to` fails, an event inside the band passes;
`components/topic/series-chart.test.ts`: key line, Method Changes entry and
table row present.

**Story** — `series-chart.stories.tsx` → `NotMeasuredSinceUranium`: 60%
enriched uranium from the draft (Aug 2024 164.7 kg, Feb 2025 274.8 kg, May
2025 408.6 kg, 13 Jun 2025 440.9 kg, the last marked as an estimate per
4.6), `until: '2026-10-29'`, events 13 Jun 2025 strikes and 28 Feb 2026
verification stops. The story description says the real series starts in
2021.

### 4.6 (f) Estimated and forecast points

**Purpose.** Let a series run to its source's end honestly when the source
mixes history with estimates and forecasts, instead of dropping those points.

**Needed by.** Iran R6 (EIA's real-price file and STEO forecast from
September 2026); R1 (the IAEA's 13 June 2025 stock is an estimate).

**Schema** — `seriesPointSchema` gains
`status: z.enum(['estimate', 'provisional', 'forecast']).optional()` (absent
= measured).

**Validation.** In each line, `forecast` points form a contiguous tail (no
measured point after a forecast). If any point is a forecast,
`coverage.note` is required and should name the forecast's vintage.

**Rendering** (`splitAtBreaks` becomes `splitRuns`, which also splits at
status changes):

- **Estimate and provisional:** segments touching such a point are drawn
  with a dotted stroke (`1 3`, round caps); points are hollow circles when the
  reading has 120 points or fewer. For lines whose slot already uses a dash
  (slots 5–8), estimate segments keep the slot dash at 60% opacity, and the
  hollow markers carry the cue.
- **Forecast:** a zone from the first forecast period to the plot's right
  edge, filled `--paper-sunk`, labelled "Forecast" at its top-left in text;
  the line through it dotted.
- **Key line** under the plot whenever either is present: "Dotted: estimates
  or provisional values. Shaded: forecasts ({coverage.note})."

**Table view:** the value is followed by "(est.)", "(prov.)" or
"(forecast)" — `<abbr title="estimate">est.</abbr>` and so on.

**Accessibility.** Description adds "{n} values are estimates and {m} are
forecasts from {date}." Never colour alone: dotted stroke, hollow marker,
shaded zone and words.

**Interaction with the audit.** Forecast and estimate values are audited
like any other (3.7).

**Tests** — `lib/chart/series-chart.test.ts`: runs split at status changes;
the forecast zone starts at the first forecast; `validate.test.ts`: a
measured point after a forecast fails; a forecast without `coverage.note`
fails; `components/topic/series-chart.test.ts`: table suffixes and key line.

**Story** — `series-chart.stories.tsx` → `ForecastTail`, fixture
`WTI_MONTHLY_2026_ILLUSTRATIVE`: monthly 2026 values anchored to the
draft's real points (Feb $64.51, May $102.13, Sep $97.31), with Nov–Dec
marked `forecast`; values between anchors are illustrative and named so.

---

## 5. Order of work and PR plan

```
PR A  Phase 2 renderer fixes (3.1–3.5)            independent
PR B  check:figures normalisation + own sources (3.6)   independent
PR C  Phase 1 figures (2.x)                         independent of A, B
PR D  Chart-value audit (3.7)                       after B; adds figure values if C has landed
PR E  First content on figures (voter-ID tables → dataTable)   after C; content owner
PR F  4.4 per-line coverage                         after A (ReadingTable)
PR G  4.6 status points, then 4.5 band              after F
PR H  4.1 categorical maps                          component part any time; content kind after C
PR I  4.2 scatter plot                              component part any time; content kind after C
PR J  4.3 focus window                              after G (shares layoutReading and EventStrip changes)
PR K  Deferred kinds (QuoteBrowser, SliceExplorer, SmallMultiples, numeric geoMap)   after C
```

- **A, B and C can run in parallel**; nothing else blocks on A except F.
- **E is content work.** Another agent is editing
  `content/topics/us-voter-id/facts`; PR E is done by, or with, whoever owns
  those files. It carries `tests/fact-figures.spec.ts` (2.10), which needs
  real content. Good first conversions: the federal record in
  `federal-and-state-power-over-voting-rules` (its Observations id
  `--observations-federal-laws` attaches as-is) and the case table in
  `election-fraud-and-voter-exclusion-history`.
- **Each PR updates the docs it changes:** `content/AUTHORING.md` (a
  "Figures" subsection under Charts, and the build-enforcement table),
  `content/WORKFLOW.md` (remove the fixed items from *Known rendering
  limits*), and the component table in `components/report/Introduction.mdx`.

**Verify each PR** (wrap expensive commands in `heavy`, start slow ones in
the background, and watch memory pressure as the machine-wide rule says):

```bash
heavy run -- pnpm lint
heavy run -- pnpm test:unit
heavy run -- pnpm check:integrity
heavy run -- pnpm check:figures          # PR D: also --strict-values to see the would-be failures
heavy run -- pnpm build
PORT=3111 heavy run -- pnpm test:e2e
heavy serve -- pnpm storybook            # check each new story in light and dark
```

**Screenshots** for the PR description, at 390×844 and 1100×900, light and
dark, from a throwaway Playwright spec that is not committed:

| PR | Pages or stories |
| --- | --- |
| A | voter-ID ID-law chart (key collapsed, one item open; axis at 390); federal-and-state-power (table); election-fraud case-methods table |
| C, E | the fixture fact in Storybook `Existing/FactFigures`; after E, the converted voter-ID facts |
| F–J | each new story; the first content using it |
| H | TileMap categorical in greyscale (`filter: grayscale(1)`) to show the patterns and marks carry it |

Paste the command output for every claim in the PR ("tests pass" means the
output).

---

## 6. Open questions for the human

1. **Must `figures`, once present, place every chart?** Recommended: **yes**
   (rule F3). The alternative — unplaced charts fall back to the old order —
   lets a chart silently drop to the end of a report when an author forgets
   it.
2. **When does the chart-value audit start failing the build?** Recommended:
   **advisory in PR D, failing in the next PR**, once both trial topics have
   `valuesFrom` or quotes for every value. Failing on day one blocks every
   content PR; advisory forever is ignored.
3. **What do viewpoints and cruxes match their figures against?**
   Recommended: **the sources of the facts they cite**. The alternative,
   topic-wide as now, lets a viewpoint state a figure that no fact it cites
   supports. If the narrower rule produces many failures on current content,
   land it advisory for viewpoints first.
4. **The grouped-table header.** The needs list says use `groupLabel`; that
   label names the columns, so this spec adds `itemLabel` for the rows and
   puts `groupLabel` in the caption. Recommended: **accept `itemLabel`**.
5. **Period labels mid-sentence.** Recommended: **`midSentence()`** (lower-case
   the first letter unless the first word is an acronym or a month), which
   needs no content edits. The alternative is to use the label exactly as
   written and rewrite every `periodLabel` in lower case, which also changes
   the table headers.
6. **`barChart` beside `ComparisonChart`.** Two bar components overlap.
   Recommended: **keep both for now** — `barChart` for ungrouped bars in any
   unit (dollars, which `comparisons` cannot format), `comparisons` for
   grouped breakdowns — and decide on merging once the trial topics are built.
7. **Deferred kinds.** Recommended: **build QuoteBrowser, SliceExplorer and
   SmallMultiples (PR K) right after PR C**, before the Iran reports are
   written, since R1, R6 and R7 depend on them.
8. **Page weight of a full daily table.** The Brent table view holds 9,112
   rows (roughly 0.5 MB of HTML before compression). Recommended: **accept
   it** — the full data in the Table view is the rule — and report the
   gzipped size in PR J; revisit only if the fact page exceeds about 300 KB
   gzipped.
9. **Where does a "not measured since" band end?** Recommended: **the
   topic's `lastUpdated` by default, with an optional `until`**, so the band
   claims no more than the date the report was last checked.
