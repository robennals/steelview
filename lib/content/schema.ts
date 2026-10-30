import { z } from 'zod';

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
// citation is exactly what this project is judged on.
const MONTH = '(0[1-9]|1[0-2])';
const DAY = '(0[1-9]|[12]\\d|3[01])';

const partialDate = z.preprocess(
  fromYamlScalar,
  z
    .string()
    .regex(new RegExp(`^\\d{4}(-${MONTH}(-${DAY})?)?$`), 'must be YYYY, YYYY-MM or YYYY-MM-DD')
);

export const sourceSchema = z.object({
  stance: z.enum(SOURCE_STANCES),
  quote: z.string().min(1),
  title: z.string().min(1),
  url: z.string().regex(/^https?:\/\/\S+$/, 'must be an http(s) URL'),
  publisher: z.string().min(1),
  date: partialDate,
});

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
  /** The fact's numbered citation that dates the event. */
  source: z.number().int().positive().optional(),
});

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
  })).min(2),
});

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

/* --- maps: tileMap and geoMap --------------------------------------------- */

export const MAP_TILE_PRESETS = ['us-states', 'europe-countries', 'uk-regions'] as const;
export const GEO_MAP_PRESETS = ['world', 'europe', 'uk-itl1'] as const;

const mapDatum = z.union([
  z.number().finite(),
  z.object({ value: z.number().finite(), label: z.string().min(1).optional(), asPublished }),
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
  /** In legend order; the order fixes each category's fill and pattern. `mark` is printed on every tile in the category: "SP". */
  categories: z
    .array(z.object({ id: slugId, label: z.string().min(1), mark: z.string().min(1).max(3) }))
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
function mapEncodingRule(what: 'tile map' | 'geo map') {
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

export const tileMapFigureSchema = z
  .object({
    kind: z.literal('tileMap'),
    ...figureBase,
    map: z.enum(MAP_TILE_PRESETS),
    /** Table heading for the areas: "State". */
    areaLabel: z.string().min(1),
    /** Outlined, never recoloured. */
    highlight: z.array(z.string()).default([]),
    ...mapEncodingFields,
  })
  .superRefine(mapEncodingRule('tile map'));

export const geoMapFigureSchema = z
  .object({
    kind: z.literal('geoMap'),
    ...figureBase,
    /** The outline set: the world's countries, Europe and its neighbours, or the UK's twelve ITL1 regions. */
    regions: z.enum(GEO_MAP_PRESETS),
    /** Table heading for the areas: "Country". */
    areaLabel: z.string().min(1),
    /** Outlined, never recoloured. */
    highlight: z.array(z.string()).default([]),
    /** Areas too small to see at full scale, redrawn enlarged beside the map. */
    insets: z.array(z.object({ regionIds: z.array(z.string().min(1)).min(1), label: z.string().min(1).optional() })).optional(),
    ...mapEncodingFields,
  })
  .superRefine(mapEncodingRule('geo map'));

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
        x: z.number().finite(),
        y: z.number().finite(),
        group: slugId.optional(),
        note: z.string().min(1).optional(),
        xAsPublished: asPublished,
        yAsPublished: asPublished,
      })
    )
    .min(3),
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
  geoMapFigureSchema,
  barChartFigureSchema,
  compositionBarFigureSchema,
  estimateRangeFigureSchema,
  scatterPlotFigureSchema,
  quoteComparisonFigureSchema,
  pullQuoteFigureSchema,
  claimCheckFigureSchema,
  caveatListFigureSchema,
]);

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
   * Specific measurements that would materially improve this report but are
   * not currently published in a compatible form. Kept separate from the
   * findings so an absence of data is never presented as a finding.
   */
  dataStillNeeded: z.array(z.object({
    measure: z.string().min(1),
    why: z.string().min(1),
  })).optional(),
  /** The reading order of the fact's charts and figures; see AUTHORING.md "Figures". */
  figures: z.array(figureSchema).optional(),
});

export const viewpointFrontmatterSchema = z.object({
  name: z.string().min(1),
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
  question: z.string().min(1),
  kind: z.enum(CRUX_KINDS),
  divides: z.array(z.string()).min(2, 'a crux divides at least two viewpoints'),
  positions: z.array(cruxPositionSchema).min(2),
});

/** One chart in a topic's home-page preview: a fact and the id of one of its charts. */
export const previewChartSchema = z.object({
  fact: z.string().min(1),
  /** `series`, an `additionalSeries` id, or a `comparisons` id on that fact. */
  chart: z.string().min(1),
  /**
   * For a series, which one reading the slide shows (default: its first). A
   * preview is one chart; the full chart, a click away, still draws every
   * reading.
   */
  reading: z.string().min(1).optional(),
});

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
  lastUpdated: z.preprocess(
    fromYamlScalar,
    z.string().regex(new RegExp(`^\\d{4}-${MONTH}-${DAY}$`), 'must be YYYY-MM-DD')
  ),
});
