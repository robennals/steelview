import { z } from 'zod';
import { glossary } from './glossary';
import { APPROXIMATE_DATE, PARTIAL_DATE } from './period';

export const FACT_STATUSES = [
  'well-supported',
  'contested',
  'not-supported',
  'complicated',
  'unknown',
] as const;

export const SOURCE_STANCES = ['supports', 'contests', 'complicates'] as const;

export const CRUX_KINDS = ['prediction', 'assumption', 'tradeoff', 'priority'] as const;

// Dates are strings, not Date objects: frontmatter dates are deliberately
// imprecise ("2024-11" for a monthly release).
//
// YAML coerces bare scalars before we ever see them: `2024-11-28` arrives as
// a JS Date and `2024` as a number. Normalize both back to the string forms
// the content model uses, so authors never have to remember to quote a date.
const fromYamlScalar = (value: unknown): unknown => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'number') return String(value);
  return value;
};

// Bounded, not just positional: month must be 01-12 and day 01-31, so
// `2024-13-45` fails instead of passing on shape alone. A wrong date on a
// citation is exactly what this project is judged on. Partial dates use
// PARTIAL_DATE (lib/content/period.ts), which the validator shares.
const MONTH = '(0[1-9]|1[0-2])';
const DAY = '(0[1-9]|[12]\\d|3[01])';

const partialDate = z.preprocess(
  fromYamlScalar,
  z
    .string()
    .regex(PARTIAL_DATE, 'must be YYYY, YYYY-MM or YYYY-MM-DD')
);

/**
 * A timeline event's date: a partial date, or one the source gives only
 * roughly — a decade ("1850s") or a circa year ("c. 1888"), shown as
 * written and placed at the decade's start or the year.
 */
const eventDate = z.union([
  partialDate,
  z.string().regex(APPROXIMATE_DATE, 'must be YYYY, YYYY-MM, YYYY-MM-DD, a decade ("1850s") or a circa year ("c. 1888"); a span of decades is a period timeline'),
]);

const httpUrl = z.string().regex(/^https?:\/\/\S+$/, 'must be an http(s) URL');

/**
 * Files a browser downloads or shows as raw text, and machine endpoints that
 * serve them. A reader following a source must land on something they can
 * read, so these belong in `fileUrl`, with `url` on the publisher's own page.
 * PDFs are fine: they open in the browser.
 */
const RAW_FILE_URL =
  /\.(xlsx?|ods|csv|tsv|zip|docx?|xml|json)([?#]|$)|\/api\/|\/\/api\.|^https?:\/\/(sdmx\.oecd\.org|stat\.link)\/|\/generator\?|\/file\?uri=/i;

export const sourceSchema = z.object({
  stance: z.enum(SOURCE_STANCES),
  quote: z.string().min(1),
  /** The unit of a quoted table's bare numbers, which `check:figures` reads them in. */
  quoteUnit: z.enum(['$', '%']).optional(),
  title: z.string().min(1),
  url: httpUrl.refine(url => !RAW_FILE_URL.test(url), {
    error: 'must be a page a reader can open, not a data file: link the page that publishes it and put the file in fileUrl',
  }),
  /** The exact file or query the content was read from. Never shown: it is how a maintainer re-checks the source. */
  fileUrl: httpUrl.optional(),
  /** Our copy of `fileUrl`, relative to the main checkout. Git-ignored: we may not redistribute these files. */
  localFile: z.string().regex(/^datasets\/\S+$/, 'must be a path under datasets/').optional(),
  publisher: z.string().min(1),
  date: partialDate,
});

/** A one-based index into the fact's numbered citations (see lib/content/sources.ts). */
const citation = z.number().int().positive();

/**
 * An item's own citations: `source: n`, or `sources: [n, …]` for an item
 * that rests on several. Spread `citationFields` into the item, refine with
 * `citationRule` and transform with `toSources`: the parse turns either form
 * into `sources`, so the renderer, the validator and `check:figures` see one
 * shape. Giving both is refused rather than merged — an author who wrote
 * both meant one of them.
 */
const citationFields = { source: citation.optional(), sources: z.array(citation).min(1).optional() };
type Citations = { source?: number; sources?: number[] };

function citationRule({ required }: { required: boolean }) {
  return (item: Citations, ctx: z.RefinementCtx) => {
    if (item.source !== undefined && item.sources !== undefined) ctx.addIssue({ code: 'custom', message: 'give `source` or `sources`, not both' });
    else if (required && item.source === undefined && item.sources === undefined) ctx.addIssue({ code: 'custom', message: 'give `source: n` or `sources: [n, …]`' });
  };
}

function toSources<T extends Citations>({ source, sources, ...rest }: T) {
  const list: number[] = sources ?? (source === undefined ? [] : [source]);
  return { ...rest, sources: list };
}

/* ------------------------------------------------------------------ series */

/**
 * One observation. `period` is a partial date like every other date on the
 * page, so a series can be annual ("1964"), monthly ("2021-06") or daily.
 *
 * `value` is a plain number in the reading's own unit: people for a `count`
 * reading, *percentage points* for a `percent` one — `0.39` means 0.39%, not
 * 39%. Storing the number the reader is shown keeps the frontmatter checkable
 * against the source table by eye, which is the point of publishing it.
 */
export const seriesPointSchema = z.object({
  period: partialDate,
  value: z.number(),
  /**
   * Absent means measured. A source that mixes history with estimates or
   * forecasts is drawn to its end honestly — dotted, hollow-marked or shaded
   * — instead of having those points dropped. Forecasts form the line's tail.
   */
  status: z.enum(['estimate', 'provisional', 'forecast']).optional(),
});

/**
 * The full range the *source* publishes — not the range the author chose to
 * plot. Every line must run end to end across it (checked in validate.ts),
 * which is what stops the chart from becoming the cherry-pick it exists to
 * expose.
 */
export const seriesCoverageSchema = z.object({
  from: partialDate,
  to: partialDate,
  /** Why the range stops where it does, and any vintage caveat on the numbers. */
  note: z.string().optional(),
});

/** One line on the chart: immigration, emigration and net migration are three. */
export const seriesLineSchema = z.object({
  name: z.string().min(1),
  /**
   * This line's source publishes a different range from the series — Brent
   * from 1987 beside WTI from 1986. The line must run the whole of its own
   * range, and the series coverage is the union of every line's.
   */
  coverage: seriesCoverageSchema.optional(),
  /** A glossary entry defining what this line measures, opened from its legend key. */
  glossary: z.string().refine(key => key in glossary, { error: issue => `unknown glossary term "${String(issue.input)}"` }).optional(),
  /**
   * This line's own source, when it comes from a different publisher from
   * the rest of the reading — a second country's statistics office. Credited
   * in the chart's source line, and the chart-value audit traces this line's
   * points to its quote.
   */
  source: sourceSchema.optional(),
  points: z
    .array(seriesPointSchema)
    .min(2, 'a series line needs at least two points — one point is not a trend'),
});

/**
 * One *reading* of the same data. The owner asked for migration both in
 * absolute numbers and as a share of the UK population, and both are needed:
 * a raw count in a growing population is its own misleading framing, and a
 * share alone hides that the growth is mostly in the numerator. So a series
 * carries one or more readings and the chart draws every one of them, rather
 * than offering a control that lets an author ship the flattering default.
 *
 * A reading may carry its own `source` on top of the series' — the
 * share-of-population reading rests on a population series the migration
 * workbook does not publish, and that denominator is a factual claim too.
 */
export const seriesReadingSchema = z.object({
  id: z.string().min(1),
  /** What this reading is called in the UI: "In people", "As a share of the UK population". */
  label: z.string().min(1),
  /** `count` formats 1,441,000 and 1.4m; `percent` formats 2.10%. */
  unit: z.enum(['count', 'percent']),
  /** The value-axis label — what one unit on the vertical axis means. */
  valueLabel: z.string().min(1),
  /** Anything the reader must know to read this reading honestly, e.g. that it is derived. */
  note: z.string().optional(),
  source: sourceSchema.optional(),
  /**
   * The published table the values are read from, when no quote can hold
   * them all: "EAVS 2024 Overview Table 1, column C4a". Lets `check:figures`
   * accept values no quote states.
   */
  valuesFrom: z.string().min(1).optional(),
  lines: z.array(seriesLineSchema).min(1),
});

/**
 * A definitional discontinuity: the point at which the source changed what it
 * was measuring or how. The series still runs end to end — the break is
 * annotated and drawn as a break, never smoothed over or trimmed away.
 */
export const seriesBreakSchema = z.object({
  period: partialDate,
  /** Short name for the break, e.g. "LTIM replaces IPS-alone". */
  label: z.string().min(1),
  /** What actually changed, in the source's own terms. */
  note: z.string().min(1),
});

/**
 * A dated real-world event shown on a numbered strip under the chart — a law
 * taking effect, a policy announced. Unlike a break, the measurement did not
 * change; the strip marks when something happened so the reader can look
 * for it in the line, without the chart claiming it caused anything.
 */
export const seriesEventSchema = z.object({
  period: partialDate,
  /** Short name shown in the numbered key, e.g. "SB 1 takes effect". */
  label: z.string().min(1),
  /** One or two sentences on what changed. */
  note: z.string().min(1).optional(),
  // `source` / `sources`: the fact's numbered citations that date the event.
  ...citationFields,
}).superRefine(citationRule({ required: false })).transform(toSources);

export const seriesSchema = z.object({
  title: z.string().min(1),
  /**
   * What the chart shows, in words. This is the screen-reader description and
   * the sighted reader's orientation, so it is required rather than derived
   * from the data: a generated sentence would say what the numbers are, not
   * what they mean.
   */
  description: z.string().min(1),
  /**
   * The source's period wording, used in descriptions and the data table.
   * SeriesChart itself always labels its visible x-axis in calendar years.
   */
  periodLabel: z.string().min(1),
  coverage: seriesCoverageSchema,
  /**
   * The series stops because measurement stopped, not because the source
   * ends — the gap is a finding. Drawn as a hatched band from the last point
   * to `until`.
   */
  notMeasuredSince: z.object({
    /** Short, shown in the band or beside it: "Not verified since IAEA access ended". */
    label: z.string().min(1).max(48),
    /** What stopped and why, in the source's terms. */
    note: z.string().min(1),
    /** Where the band ends. Defaults to the topic's lastUpdated (filled in by the loader). */
    until: partialDate.optional(),
    /** The fact's numbered citation for the note. */
    source: z.number().int().positive(),
  }).optional(),
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
  breaks: z.array(seriesBreakSchema).default([]),
  events: z.array(seriesEventSchema).default([]),
  readings: z.array(seriesReadingSchema).min(1),
  /**
   * A chart is a factual assertion, and nothing on this page is asserted
   * without a quoted source behind it. Same shape as a fact's sources, so it
   * renders the same way and `check-figures.ts` audits its quote the same way.
   */
  source: sourceSchema,
});

/** Snapshot comparisons use the fact's existing numbered citations. */
export const comparisonChartSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().min(1),
  unit: z.enum(['count', 'percent', 'pounds']),
  valueLabel: z.string().min(1),
  /** When values are slices of a shared total, show each bar's share alongside its value. */
  shareTotal: z.number().positive().optional(),
  /** A fixed upper bound prevents a percentage comparison from visually filling its scale at (say) 22%. */
  domainMax: z.number().positive().optional(),
  sources: z.array(z.number().int().positive()).min(1),
  note: z.string().optional(),
  /**
   * The published table the values are read from, when no quote can hold
   * them all: "EAVS 2024 Overview Table 1, column C4a". Lets `check:figures`
   * accept values no quote states.
   */
  valuesFrom: z.string().min(1).optional(),
  /** Labels for an optional grouped comparison. Kept in content so the shared UI never assumes a subject such as nationality. */
  groupLabel: z.string().min(1).optional(),
  /** What each bar is, e.g. "Method": heads the item column of the breakdown table. `groupLabel` names the columns. */
  itemLabel: z.string().min(1).optional(),
  allGroupsLabel: z.string().min(1).optional(),
  groups: z.array(z.string().min(1)).min(2).optional(),
  defaultGroup: z.number().int().nonnegative().optional(),
  items: z.array(z.object({
    label: z.string().min(1),
    value: z.number().finite(),
    highlight: z.boolean().optional(),
    values: z.array(z.number().finite().nonnegative()).optional(),
    /** What the one-line `label` leaves out: period, sample size, coverage. Opens under the row. */
    detail: z.string().min(1).optional(),
  })).min(2),
});

/* ----------------------------------------------------------------- figures */

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

/** How a source qualifies a number. Mirrors `Qualifier` in components/report/qualified.ts. */
export const QUALIFIERS = ['about', 'at least', 'at most', 'more than', 'fewer than', 'under', 'over', 'nearly'] as const;
const qualifierSchema = z.enum(QUALIFIERS);

const qualifiedPointFields = { value: z.number().finite(), qualifier: qualifierSchema.optional(), asPublished };
const qualifiedRangeFields = { low: z.number().finite(), high: z.number().finite(), asPublished };
const lowToHigh = { check: (r: { low: number; high: number }) => r.low <= r.high, message: 'a range runs from `low` up to `high`' };

/** `{ value: 159, qualifier: at least, asPublished: "At least 159" }`: one number, as the source qualifies it. */
export const qualifiedPointSchema = z.strictObject(qualifiedPointFields);
/** `{ low: 4, high: 6, asPublished: "4–6%" }`: a range the source publishes instead of one number. */
export const qualifiedRangeSchema = z.strictObject(qualifiedRangeFields).refine(lowToHigh.check, lowToHigh.message);

/**
 * A number a figure draws: bare (`159`), qualified, or a published range.
 * Strict objects, so a misspelt key or a `value` beside `low` and `high`
 * fails instead of being dropped. See components/report/qualified.ts for
 * how each kind draws a qualification.
 */
export const figureNumberSchema = z.union([z.number().finite(), qualifiedPointSchema, qualifiedRangeSchema]);

/**
 * The body anchors this figure stands in for, when prose with its own
 * `{#<fact>--<anchor>}` became this figure: each becomes an alias at the
 * figure, so links written as `#fact-<fact>/<anchor>` still land on it.
 */
const replaces = z.array(slugId).min(1).optional();

/** Fields every component figure shares. */
const figureBase = {
  id: slugId,
  replaces,
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

// An unquoted `2024-06-12` in YAML arrives as a Date; in a table it can only be a date, so it becomes one again.
const plainCell = z.preprocess(
  value => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.union([z.string(), z.number().finite(), z.null()]),
);
/**
 * A cell object: a value with its own footnotes (`sources`, rendered as "[n]"
 * links after the text), a qualified number (`qualifier`), a published range
 * (`low` and `high` instead of `value`), or any of these together.
 */
const cellObject = z
  .object({
    value: plainCell.optional(),
    qualifier: qualifierSchema.optional(),
    low: z.number().finite().optional(),
    high: z.number().finite().optional(),
    sources: z.array(citation).min(1).optional(),
    asPublished,
  })
  .superRefine((cell, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: 'custom', message });
    if (cell.low !== undefined || cell.high !== undefined) {
      if (cell.low === undefined || cell.high === undefined || cell.value !== undefined) issue('a range cell gives `low` and `high`, and no `value`');
      else if (!lowToHigh.check({ low: cell.low, high: cell.high })) issue(lowToHigh.message);
      if (cell.qualifier) issue('a range takes no `qualifier`: its ends are the qualification');
    } else if (cell.value === undefined) {
      issue('a cell object needs `value`, or `low` and `high`');
    } else if (cell.qualifier && typeof cell.value !== 'number') {
      issue('a `qualifier` qualifies a number');
    }
  });
export const tableCellSchema = z.union([plainCell, cellObject]);

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
        /**
         * 'text' prints as written; use it for year columns, or 1965 prints as "1,965".
         * 'date' holds YYYY, YYYY-MM or YYYY-MM-DD and prints "2026", "Jun 2026", "12 Jun 2026",
         * sorting by date, a coarser date before the finer dates inside it.
         */
        format: z.union([z.literal('text'), z.literal('date'), valueFormatSchema]).optional(),
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
  /** Omit for a table. 'cards' sets each row as a card; 'timeline' strings the cards along a rule, for rows in order of time. */
  layout: z.enum(['cards', 'timeline']).optional(),
  /** With `layout`: the column set as each card's main text. */
  leadColumn: slugId.optional(),
  /** With `layout`: the column printed above each card's title, usually when it happened. */
  dateColumn: slugId.optional(),
  /** `wide` runs past the text column on a wide screen; the default for more than three columns. */
  width: z.enum(['text', 'wide']).optional(),
});

/* --- keyFigures ----------------------------------------------------------- */

export const keyFiguresFigureSchema = z.object({
  kind: z.literal('keyFigures'),
  ...figureBase,
  figures: z
    .array(
      z.object({
        value: figureNumberSchema,
        format: valueFormatSchema.optional(),
        /** Printed before the number: "more than 7,200". The same as a qualified `value`'s; give it in one place. */
        qualifier: qualifierSchema.optional(),
        label: z.string().min(1),
        period: partialDate,
        periodLabel: z.string().min(1).optional(),
        asPublished,
        change: z
          .object({ value: z.number().finite(), format: valueFormatSchema.optional(), comparison: z.string().min(1) })
          .optional(),
        ...citationFields,
      }).superRefine(citationRule({ required: true })).transform(toSources)
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
        date: eventDate,
        endDate: partialDate.optional(),
        title: z.string().min(1),
        description: z.string().min(1).optional(),
        category: slugId,
        significance: z.enum(['major', 'minor']).optional(),
        ...citationFields,
      }).superRefine(citationRule({ required: true })).transform(toSources)
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
              // `source` / `sources`: a period dated by a source of its own.
              ...citationFields,
            }).superRefine(citationRule({ required: false })).transform(toSources)
          )
          .min(1),
      })
    )
    .min(1),
  /** Point events: the same shape as series events. */
  events: z.array(seriesEventSchema).default([]),
});

/* --- maps: map, and its older spellings tileMap and geoMap ---------------- */

/** The area sets a `map` draws, each in real shapes and as tiles. */
export const MAP_PRESETS = ['us-states', 'europe', 'uk-regions', 'world'] as const;
/** A map's two drawings; the third view, the table, is never the default. */
export const MAP_VIEWS = ['map', 'tiles'] as const;
type MapPreset = (typeof MAP_PRESETS)[number];
const TILE_MAP_PRESETS = ['us-states', 'europe-countries', 'uk-regions'] as const;
const GEO_MAP_PRESETS = ['world', 'europe', 'uk-itl1'] as const;
/** `tileMap`'s preset names, and the `map` preset each is. */
const TILE_MAP_PRESET: Record<(typeof TILE_MAP_PRESETS)[number], MapPreset> = { 'us-states': 'us-states', 'europe-countries': 'europe', 'uk-regions': 'uk-regions' };
/** `geoMap`'s preset names, and the `map` preset each is. */
const GEO_MAP_PRESET: Record<(typeof GEO_MAP_PRESETS)[number], MapPreset> = { world: 'world', europe: 'europe', 'uk-itl1': 'uk-regions' };

/** An area's number: bare, qualified or a range, with an optional `label` that replaces the formatted value ("<0.1"). */
const mapDatum = z.union([
  z.number().finite(),
  z.strictObject({ ...qualifiedPointFields, label: z.string().min(1).optional() }),
  z.strictObject({ ...qualifiedRangeFields, label: z.string().min(1).optional() }).refine(lowToHigh.check, lowToHigh.message),
]);

/** An area's category: its slug alone, or the slug with a note for the readout and table. */
const categoryAssignment = z.union([slugId, z.object({ category: slugId, note: z.string().min(1).optional() })]);

/**
 * How a map is shaded: by a number (`data` + `valueLabel`, with `format`,
 * `scale`, `steps`, `domain`, `breaks`) or by a category (`categoryLabel` +
 * `categories` + `areas`). Exactly one; `mapEncodingRule` enforces it.
 */
const mapEncodingFields = {
  // Numeric:
  valueLabel: z.string().min(1).optional(),
  format: valueFormatSchema.optional(),
  scale: z.enum(['sequential', 'diverging']).optional(),
  steps: z.number().int().min(2).max(9).optional(),
  domain: z.tuple([z.number(), z.number()]).optional(),
  breaks: z.array(z.number()).min(2).optional(),
  data: z.record(z.string(), mapDatum).optional(),
  // Categorical:
  /** What the categories are: "ID rule at the polls". Legend and table heading. */
  categoryLabel: z.string().min(1).optional(),
  /** In legend order; the order fixes each category's fill and pattern. `mark` is printed on every tile in the category: "SP". `quiet` draws one category as neutral background. */
  categories: z
    .array(z.object({ id: slugId, label: z.string().min(1), mark: z.string().min(1).max(3), quiet: z.boolean().optional() }))
    .min(2)
    .max(6)
    .optional(),
  /** Area id → category slug, or `{ category, note }`. An area left out reads "No data". */
  areas: z.record(z.string(), categoryAssignment).optional(),
};

const NUMERIC_KEYS = ['valueLabel', 'format', 'scale', 'steps', 'domain', 'breaks', 'data'] as const;
const CATEGORICAL_KEYS = ['categoryLabel', 'categories', 'areas'] as const;
type MapEncodingInput = { [K in keyof typeof mapEncodingFields]?: unknown };

/**
 * Exactly one of numeric (`data` + `valueLabel`) or categorical
 * (`categoryLabel` + `categories` + `areas`). A numeric option such as
 * `scale` on a categorical map counts as mixing the two.
 */
function mapEncodingRule(what: 'map' | 'tile map' | 'geo map') {
  const either = '`data` and `valueLabel`, or `categoryLabel`, `categories` and `areas`';
  return (f: MapEncodingInput, ctx: z.RefinementCtx) => {
    const numeric = NUMERIC_KEYS.some(key => f[key] !== undefined);
    const categorical = CATEGORICAL_KEYS.some(key => f[key] !== undefined);
    let message: string | undefined;
    if (numeric && categorical) message = `a ${what} is shaded by a number or by a category, not both: give ${either}`;
    else if (categorical && !CATEGORICAL_KEYS.every(key => f[key] !== undefined)) message = `a categorical ${what} needs \`categoryLabel\`, \`categories\` and \`areas\``;
    else if (!categorical && (f.data === undefined || f.valueLabel === undefined)) message = `a ${what} needs ${either}`;
    if (message) ctx.addIssue({ code: 'custom', message });
  };
}

const mapFields = {
  ...figureBase,
  /** Table heading for the areas: "State". */
  areaLabel: z.string().min(1),
  /** Outlined, never recoloured. */
  highlight: z.array(z.string()).default([]),
  /** Areas too small to see at full scale, redrawn enlarged beside the real-shape view. */
  insets: z.array(z.object({ regionIds: z.array(z.string().min(1)).min(1), label: z.string().min(1).optional() })).optional(),
  ...mapEncodingFields,
};

/**
 * One dataset over a preset's areas, drawn both in real shapes and as equal
 * tiles from the same legend, with a Map / Tiles / Table switch. `default`
 * picks the view shown first, which is also the one a reader without
 * JavaScript sees beside the table.
 */
export const mapFigureSchema = z
  .object({
    kind: z.literal('map'),
    preset: z.enum(MAP_PRESETS),
    default: z.enum(MAP_VIEWS).default('map'),
    ...mapFields,
  })
  .superRefine(mapEncodingRule('map'));

/** The older spelling of a `map` that opens on its tiles: `map: europe-countries` is `preset: europe, default: tiles`. */
export const tileMapFigureSchema = z
  .object({
    kind: z.literal('tileMap'),
    map: z.enum(TILE_MAP_PRESETS),
    ...mapFields,
  })
  .superRefine(mapEncodingRule('tile map'))
  .transform(({ map, ...rest }) => ({ ...rest, kind: 'map' as const, preset: TILE_MAP_PRESET[map], default: 'tiles' as const }));

/** The older spelling of a `map` that opens on its real shapes: `regions: uk-itl1` is `preset: uk-regions, default: map`. */
export const geoMapFigureSchema = z
  .object({
    kind: z.literal('geoMap'),
    regions: z.enum(GEO_MAP_PRESETS),
    ...mapFields,
  })
  .superRefine(mapEncodingRule('geo map'))
  .transform(({ regions, ...rest }) => ({ ...rest, kind: 'map' as const, preset: GEO_MAP_PRESET[regions], default: 'map' as const }));

/* --- barChart ------------------------------------------------------------- */

/** A row's end label in a dumbbell: a year, so YAML's bare 1958 is accepted and kept as text. */
const endLabel = z.preprocess(value => (typeof value === 'number' ? String(value) : value), z.string().min(1));

export const barChartFigureSchema = z
  .object({
    kind: z.literal('barChart'),
    ...figureBase,
    valueLabel: z.string().min(1),
    /** Table heading for the bar labels. */
    categoryLabel: z.string().min(1).optional(),
    format: valueFormatSchema.optional(),
    /** 'none' keeps the given order, for ordered categories such as age bands. With `series`, 'value' ranks by the first measure. */
    sort: z.enum(['value', 'none']).optional(),
    domainMax: z.number().positive().optional(),
    /**
     * Two or more measures per row, in the same unit: each row then gives
     * `values` (series key → number) instead of `value`. Drawn side by side,
     * never stacked, so no measure is read as a part of another.
     */
    series: z.array(z.object({ key: slugId, label: z.string().min(1) })).min(2).optional(),
    /** With `series`: `paired` bars (the default), or a `dumbbell` — two dots joined by a line — for exactly two. */
    style: z.enum(['paired', 'dumbbell']).optional(),
    items: z
      .array(
        z.object({
          label: z.string().min(1),
          value: figureNumberSchema.optional(),
          /** With `series`: every series key, `null` where the source publishes no figure. */
          values: z.record(z.string(), figureNumberSchema.nullable()).optional(),
          /** A dumbbell's end labels by series key, when the measures' dates differ by row: `{ earlier: 1958, latest: 1964 }`. */
          labels: z.record(z.string(), endLabel).optional(),
          highlight: z.boolean().optional(),
          /** What the one-line `label` leaves out: period, sample size, coverage. Opens under the row and fills the table's Detail column. */
          detail: z.string().min(1).optional(),
          asPublished,
        }),
      )
      .min(2),
  })
  .superRefine((f, ctx) => {
    const issue = (message: string, path: PropertyKey[] = []) => ctx.addIssue({ code: 'custom', message, path });
    if (f.style && !f.series) issue('`style` draws `series`; a bar chart without them has one bar a row', ['style']);
    f.items.forEach((item, i) => {
      if (f.series) {
        if (item.values === undefined || item.value !== undefined) issue('with `series`, a row gives `values` (series key → number), not `value`', ['items', i]);
        if (item.asPublished !== undefined) issue('with `series`, give each value its own `asPublished`', ['items', i, 'asPublished']);
      } else {
        if (item.value === undefined || item.values !== undefined) issue('a row gives `value`; `values` needs `series`', ['items', i]);
        if (item.labels !== undefined) issue('`labels` name a dumbbell\'s ends', ['items', i, 'labels']);
      }
    });
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
        /** Part sizes by category key. A qualified part ("about 30") keeps its words in the labels and table. */
        values: z.record(z.string(), figureNumberSchema),
        /** The total the source states for the row; the parts must add up to it, within rounding (rule F10). */
        total: z.number().positive().optional(),
        // `source` / `sources`: a row from a different counter cites its own.
        ...citationFields,
      }).superRefine(citationRule({ required: false })).transform(toSources)
    )
    .min(1),
  /**
   * `percent`: the values are the source's percentages — labels print them as
   * published, and a row without a `total` must add up to 100. `count`: they
   * are counts, labelled by their computed share.
   */
  unit: z.enum(['percent', 'count']).optional(),
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
  /** What one row is, heading the table's first column: "Study", "Source". Defaults to "Estimate". */
  itemLabel: z.string().min(1).optional(),
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
        /** Shown when the row is opened, and in the table: "May 2025". */
        year: z.union([z.string().min(1), z.number().int()]).optional(),
        /** A central estimate the source qualifies ("about 40") may say so; a range is `low` and `high`. */
        estimate: z.union([z.number().finite(), qualifiedPointSchema]).optional(),
        /** Omit `high` for "at least …", `low` for "at most …" or an upper confidence bound quoted alone. */
        low: z.number().finite().optional(),
        high: z.number().finite().optional(),
        group: z.string().min(1).optional(),
        note: z.string().min(1).optional(),
        asPublished,
        ...citationFields,
      }).superRefine(citationRule({ required: true })).transform(toSources)
    )
    .min(2),
});

/* --- scatterPlot ---------------------------------------------------------- */

const scatterAxisSchema = z.object({
  label: z.string().min(1),
  format: valueFormatSchema.optional(),
  /** Fix the axis ends exactly; must cover every point. */
  domain: z.tuple([z.number(), z.number()]).optional(),
  /** Defaults to true. */
  includeZero: z.boolean().optional(),
});

export const scatterPlotFigureSchema = z.object({
  kind: z.literal('scatterPlot'),
  ...figureBase,
  /** Table heading for the points: "State". */
  pointLabel: z.string().min(1),
  x: scatterAxisSchema,
  y: scatterAxisSchema,
  /** In legend order; each takes the next series colour and marker shape. */
  groups: z.array(categorySchema).optional(),
  /** Point ids to outline and label in bold; never recoloured. */
  highlight: z.array(slugId).default([]),
  points: z
    .array(
      z.object({
        id: slugId,
        /** Printed beside the point: "AZ". */
        label: z.string().min(1).max(4),
        /** For the readout and the table: "Arizona". */
        name: z.string().min(1),
        /** Qualified coordinates keep their words in the readout; no ranges, since a dot at a midpoint claims a figure the source never gave. */
        x: z.union([z.number().finite(), qualifiedPointSchema]),
        y: z.union([z.number().finite(), qualifiedPointSchema]),
        group: slugId.optional(),
        note: z.string().min(1).optional(),
        xAsPublished: asPublished,
        yAsPublished: asPublished,
      })
    )
    .min(3),
});

/* --- sliceExplorer ------------------------------------------------------- */

export const sliceExplorerFigureSchema = z.object({
  kind: z.literal('sliceExplorer'),
  ...figureBase,
  /**
   * What each row is classified by, singular and sentence case: party,
   * position, roll call. Mirrors `SliceDimension` in components/report/slice.ts.
   */
  dimensions: z
    .array(
      z.object({
        key: slugId,
        label: z.string().min(1),
        /** The values in their natural order (dates, bands); when given, every row's value must be one of them. */
        values: z.array(z.string().min(1)).min(1).optional(),
        sort: z.enum(['value', 'none']).optional(),
        /** Residual values kept last however the bars rank: "Other". */
        last: z.array(z.string().min(1)).optional(),
        /** Lower-case plural for the status line: "roll calls". */
        plural: z.string().min(1).optional(),
        /** `false`: never add its values together or average them — separate votes or polls. The reader sees one at a time. */
        combinable: z.boolean().optional(),
      }),
    )
    .min(1),
  /** The numbers each row carries. `aggregation: mean` for rates, which do not add up. */
  measures: z
    .array(z.object({ key: slugId, label: z.string().min(1), format: valueFormatSchema.optional(), aggregation: z.enum(['sum', 'mean']).optional() }))
    .min(1),
  /** Tidy data: one row per combination of dimension values, a string for each dimension and a number for each measure. */
  rows: z.array(z.record(z.string(), z.union([z.string(), z.number().finite()]))).min(1),
  defaultBreakdown: slugId.optional(),
  defaultSplit: slugId.optional(),
  defaultMeasure: slugId.optional(),
  /** Dimension key → the values selected at first; for a dimension that may not be combined, the one shown first. */
  defaultFilters: z.record(z.string(), z.array(z.string().min(1)).min(1)).optional(),
  splitLayout: z.enum(['stacked', 'grouped']).optional(),
});

/* --- smallMultiples ------------------------------------------------------ */

export const smallMultiplesFigureSchema = z.object({
  kind: z.literal('smallMultiples'),
  ...figureBase,
  /** What every panel's line measures: "Ships a day, monthly average". */
  valueLabel: z.string().min(1),
  format: valueFormatSchema.optional(),
  /** Heads the period column of the table: "Month". */
  periodLabel: z.string().min(1).optional(),
  /**
   * The full range the source publishes, as for a series: every panel runs
   * end to end across it (or its own `coverage`), so no panel is the
   * cherry-picked stretch. `note` is shown in About this data.
   */
  coverage: seriesCoverageSchema,
  /** A y-scale per panel. Off by default: a shared scale is what makes panels comparable; say so in `description` when on. */
  independentScales: z.boolean().optional(),
  /** Start every y-axis at zero (default). */
  zeroBased: z.boolean().optional(),
  panels: z
    .array(
      z.object({
        name: z.string().min(1),
        /** Set in bold with its line in the accent: the panel the text is about. */
        highlight: z.boolean().optional(),
        /** This panel's source publishes a shorter range; its points run end to end across it. */
        coverage: seriesCoverageSchema.optional(),
        points: z.array(z.object({ period: partialDate, value: z.number().finite() })).min(2, 'a panel needs at least two points — one point is not a trend'),
        // `source` / `sources`: a panel from a different publisher cites its own.
        ...citationFields,
      }).superRefine(citationRule({ required: false })).transform(toSources),
    )
    .min(2),
});

/* --- quotes --------------------------------------------------------------- */

/** What every quote on the page gives: the words, who said them, when and where, and where to check. */
const quoteFields = {
  /** Verbatim. "…" marks an omission; each fragment must appear in a cited source's quote (rule F11). */
  text: z.string().min(1),
  speaker: z.string().min(1),
  role: z.string().min(1).optional(),
  date: partialDate.optional(),
  context: z.string().min(1).optional(),
  ...citationFields,
};

const figureQuoteSchema = z.object({
  ...quoteFields,
  position: z.string().min(1).optional(),
}).superRefine(citationRule({ required: true })).transform(toSources);

/** One quote of a `quotes` figure. */
const quotesItemSchema = z.object({
  ...quoteFields,
  /** A `categories` id: the side, body or kind of view the quote speaks for. Labels the quote and filters a long list. */
  stance: slugId.optional(),
  /** The words in English when `text` is not: shown beside the quote, marked as a translation, never in quotation marks. */
  translation: z.string().min(1).optional(),
  /** The language of `text` when it is not English, as a BCP 47 tag ("de"), so a screen reader pronounces it in that language. */
  lang: z.string().regex(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/, 'a BCP 47 language tag such as "de" or "pt-BR"').optional(),
}).superRefine(citationRule({ required: true })).transform(toSources);

const quotesFields = {
  id: slugId,
  replaces,
  /** The question every quote answers; it is the figure's heading. */
  question: z.string().min(1),
  description: z.string().min(1).optional(),
  note: z.string().optional(),
  /** What `categories` sort the quotes by, naming the filter: "Who is speaking". Defaults to "Category". */
  categoryLabel: z.string().min(1).optional(),
  /** The ids a quote's `stance` may name; each must be used. */
  categories: z.array(categorySchema).min(2).optional(),
  /** Two or more. Up to four are set side by side in the order given; more become a list in date order that a reader can filter. */
  quotes: z.array(quotesItemSchema).min(2),
};

export const quotesFigureSchema = z.object({ kind: z.literal('quotes'), ...quotesFields });

/** The kind's earlier name, from when it took at most four quotes: parses, and is validated, as `quotes`. */
export const quoteComparisonFigureSchema = z
  .object({ kind: z.literal('quoteComparison'), ...quotesFields })
  .transform(figure => ({ ...figure, kind: 'quotes' as const }));

export const pullQuoteFigureSchema = z.object({
  kind: z.literal('pullQuote'),
  id: slugId,
  replaces,
  description: z.string().min(1).optional(),
  note: z.string().optional(),
  variant: z.enum(['pull', 'inline']).optional(),
  quote: figureQuoteSchema,
});

/* --- claimCheck ----------------------------------------------------------- */

export const claimCheckFigureSchema = z.object({
  kind: z.literal('claimCheck'),
  id: slugId,
  replaces,
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
  replaces,
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
  mapFigureSchema,
  tileMapFigureSchema,
  geoMapFigureSchema,
  barChartFigureSchema,
  compositionBarFigureSchema,
  estimateRangeFigureSchema,
  scatterPlotFigureSchema,
  sliceExplorerFigureSchema,
  smallMultiplesFigureSchema,
  quotesFigureSchema,
  quoteComparisonFigureSchema,
  pullQuoteFigureSchema,
  claimCheckFigureSchema,
  caveatListFigureSchema,
]);

/**
 * The part of its chart an observation is about, picked out when a reader
 * reaches it, so every observation can be checked by eye against the data.
 * Together these say a region (`from`, `to`), a point (`at`), a subset of
 * lines (`lines`) or a subset of rows (`rows`); a line chart can combine them.
 */
export const observationMarkSchema = z.strictObject({
  from: partialDate.optional(),
  to: partialDate.optional(),
  at: partialDate.optional(),
  lines: z.array(z.string().min(1)).min(1).optional(),
  rows: z.array(z.string().min(1)).min(1).optional(),
  /** The observation is about the chart as a whole, so nothing in it recedes. */
  whole: z.literal(true).optional(),
}).refine(mark => Object.keys(mark).length > 0, 'must pick out part of the chart');

export const factFrontmatterSchema = z.object({
  title: z.string().min(1).optional(),
  claim: z.string().min(1),
  claimSources: z.array(z.number().int().positive()).optional(),
  assessedClaim: z.string().optional(),
  status: z.enum(FACT_STATUSES),
  /*
   * There is deliberately no `order` field. A hand-assigned rank on a fact is
   * one editor's opinion of what matters, and on a page whose whole claim is
   * even-handedness that opinion is exactly what must not decide which three
   * facts a reader sees first. The reading order is derived instead, by
   * round-robin across the viewpoints' own rankings — see rank-facts.ts.
   */
  /**
   * Legacy grouping: present this smaller fact within a broader fact rather
   * than as a separate top-level row. The UI calls these Related Data;
   * the relationship can qualify or contextualise the broader claim.
   * Grouping stays one level deep. Use relatedFacts for other cross-links.
   */
  supports: z.string().min(1).optional(),
  sources: z.array(sourceSchema).default([]),
  /**
   * A time series for a fact whose claim is about a number.
   *
   * Optional, because some facts are point-in-time and have no series to
   * show. Where one exists it is not optional *in effect*: a single year is
   * the easiest way to mislead honestly, and `check-figures.ts` already
   * reports a fact with a figure in its claim and no series here.
   */
  series: seriesSchema.optional(),
  /** Additional datasets with their own coverage and methods; reading IDs must be unique. */
  additionalSeries: z.array(seriesSchema.extend({ id: z.string().regex(/^[a-z0-9-]+$/) })).optional(),
  comparisons: z.array(comparisonChartSchema).optional(),
  featuredCharts: z.array(z.string()).optional(),
  /** Contextual connections, including qualifications and contrasting evidence. */
  relatedFacts: z.array(z.string()).optional(),
  /**
   * Old body anchors whose section now lives on a chart: anchor (without the
   * `<fact>--`) to the chart it moved to, by the id its Observations are filed
   * under. A link to the anchor opens that chart.
   */
  movedAnchors: z.record(slugId, slugId).optional(),
  /**
   * Specific measurements that would materially improve this report but are
   * not currently published in a compatible form. Kept separate from the
   * findings so an absence of data is never presented as a finding.
   */
  dataStillNeeded: z.array(z.object({
    measure: z.string().min(1),
    why: z.string().min(1),
  })).optional(),
  /** What each observation picks out on its chart, by observation id; see AUTHORING.md "Marks". */
  observationMarks: z.record(z.string(), observationMarkSchema).optional(),
  /** The reading order of the fact's charts and figures; see AUTHORING.md "Figures". */
  figures: z.array(figureSchema).optional(),
});

export const viewpointFrontmatterSchema = z.object({
  name: z.string().min(1),
  /** A few words naming the viewpoint where its full `name` will not fit, as above a crux column. */
  shortName: z.string().min(1),
  summary: z.string().min(1),
  /**
   * Where this viewpoint sits in the Viewpoints section. Required and
   * explicit, because the alternative — sorting by id — let a retitle
   * silently reorder the sides and decide which viewpoint the section opens
   * on. The editorial rule for choosing it (alternate across the spectrum,
   * never group one side together) is in the design spec.
  */
  order: z.number().int(),
  // Accepted only so existing topic files can migrate gradually. New
  // viewpoints derive all relationships from inline citations instead.
  citesFacts: z.array(z.string()).optional(),
  acknowledges: z.array(z.string()).optional(),
  setsAside: z.array(z.string()).optional(),
  principles: z.array(z.string()).optional(),
  /**
   * Every claim this viewpoint marks `[claim](#needed)`, quoted exactly as
   * the link text reads. Readers see those claims as plain prose, so this is
   * where the research queue is read from; `pnpm check:integrity` keeps it
   * and the marks in the body in step.
   */
  researchNeeded: z.array(z.string().min(1)).optional(),
});

// Shared definitions must not carry topic-specific viewpoint relationships.
export const principleFrontmatterSchema = z.strictObject({
  name: z.string().min(1),
});

export const cruxPositionSchema = z.object({
  viewpoint: z.string().min(1),
  holds: z.string().min(1),
});

export const cruxFrontmatterSchema = z.object({
  /** What is at issue: the things being weighed, or what is in doubt. */
  title: z.string().min(1),
  /** In a sentence or two, why it divides people. A crux has no body. */
  tension: z.string().min(1),
  kind: z.enum(CRUX_KINDS),
  divides: z.array(z.string()).min(2, 'a crux divides at least two viewpoints'),
  positions: z.array(cruxPositionSchema).min(2),
});

/** One chart in a topic's home-page preview: a fact and the id of one of its charts. */
export const previewChartSchema = z.object({
  fact: z.string().min(1),
  /**
   * `series`, an `additionalSeries` id, a `comparisons` id, or the id of a
   * graph-like figure (`PREVIEW_FIGURE_KINDS`, lib/content/preview.ts) on that fact.
   */
  chart: z.string().min(1),
  /**
   * For a series, which one reading the slide shows (default: its first). A
   * preview is one chart; the full chart, a click away, still draws every
   * reading.
   */
  reading: z.string().min(1).optional(),
});

const fullDate = z.preprocess(
  fromYamlScalar,
  z.string().regex(new RegExp(`^\\d{4}-${MONTH}-${DAY}$`), 'must be YYYY-MM-DD')
);

export const topicFrontmatterSchema = z.object({
  /**
   * Categories such as "UK", "USA" or "Voting", shown on the topic's home-page
   * row so readers can later drill down to other topics in the same category.
   */
  tags: z.array(z.string().min(1)).min(1, 'a topic needs at least one tag').refine(
    (tags) => new Set(tags).size === tags.length,
    'tags must be unique'
  ),
  /**
   * The charts the home page previews, in order. The first shows how big the
   * issue is; together they must represent every viewpoint with one of the
   * strong charts it relies on (AUTHORING.md, "Home-page preview charts").
   */
  previewCharts: z.array(previewChartSchema).min(1, 'a topic needs at least one preview chart'),
  /** Explicit reader-facing order for headline Data collections. */
  dataOrder: z.array(z.string().min(1)).default([]).refine(
    (ids) => new Set(ids).size === ids.length,
    'dataOrder references must be unique'
  ),
  principles: z.array(z.string().min(1)).default([]).refine(
    (ids) => new Set(ids).size === ids.length,
    'principle references must be unique'
  ),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  /** When the topic first went up. The home page lists the newest first. */
  firstPublished: fullDate,
  lastUpdated: fullDate,
});
