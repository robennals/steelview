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

export const topicFrontmatterSchema = z.object({
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
