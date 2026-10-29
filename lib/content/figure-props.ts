import type * as R from '@/components/report';
import { stripEvents } from '@/components/topic/series-chart';
import { aboutThisDataNote } from './figure-text';
import { geoRegions, mapTiles } from './map-presets';
import { factSources, figureCitations } from './sources';
import { factPath } from './types';
import type { Fact, Figure, FigureOf, FigureValueFormat, Source } from './types';

/**
 * The adapter from a content figure (fact frontmatter) to the props of the
 * report component that draws it. One pure function per kind: they take
 * content types and return props, and never render, so each mapping can be
 * tested on its own and the renderer (components/topic/fact-figures.tsx)
 * stays a switch.
 */

export type FigureContext = {
  fact: Fact;
  /** factSources(fact): what citation `n` refers to. */
  sources: Source[];
  /** The topic's `lastUpdated`: where a period still in force stops. Absent, the component's own default applies. */
  asOf?: string;
  credit: (n: number) => R.SourceCredit;
  /** Drawn in a data panel, where the fact's source list is not on the page: every credit links to the source itself. */
  panel?: boolean;
};

export function figureContext(fact: Fact, asOf?: string, { panel = false } = {}): FigureContext {
  const sources = factSources(fact);
  return {
    fact,
    sources,
    asOf,
    panel,
    // validate.ts rejects a citation past the end of the list (rule F2); the
    // fallback only keeps an unvalidated draft rendering in the dev server.
    credit: n => {
      const source = sources[n - 1];
      return { label: source?.publisher ?? `Source ${n}`, href: panel && source ? source.url : `#source-${fact.id}-${n}`, number: n };
    },
  };
}

/** The DOM id of a component figure: the same scheme as comparisons, so `#fact-<fact>/chart-<id>` resolves. */
export function figureDomId(fact: Pick<Fact, 'id'>, figureId: string): string {
  return `${fact.id}--chart-${figureId}`;
}

/** The figure's source line: its `sources` and every item-level citation, deduplicated, in ascending order. */
export function figureCredits(figure: Figure, c: FigureContext): R.SourceCredit[] {
  const credits = [...new Set(figureCitations(figure))].sort((a, b) => a - b).map(c.credit);
  // A panel's source line names its sources; there is no numbered list to point into.
  return c.panel ? credits.map(({ label, href }) => ({ label, href })) : credits;
}

/** The content format (unit always present, currency checked by the schema) as the library's `ValueFormat`. */
export function toValueFormat(format: FigureValueFormat): R.ValueFormat;
export function toValueFormat(format: FigureValueFormat | undefined): R.ValueFormat | undefined;
export function toValueFormat(format: FigureValueFormat | undefined): R.ValueFormat | undefined {
  if (!format) return undefined;
  const { unit, currency, ...rest } = format;
  if (unit !== 'currency') return { ...rest, unit };
  if (!currency) throw new Error('a currency format needs `currency`');
  return { ...rest, unit, currency };
}

/** The fields every ReportFigure-framed component takes. */
function frame(f: Extract<Figure, { title: string }>, c: FigureContext) {
  return {
    id: figureDomId(c.fact, f.id),
    title: f.title,
    description: f.description,
    sources: figureCredits(f, c),
    note: aboutThisDataNote(f),
    panel: c.panel,
  };
}

export function dataTableProps(f: FigureOf<'dataTable'>, c: FigureContext): R.DataTableProps {
  return {
    ...frame(f, c),
    caption: f.caption,
    columns: f.columns.map(column => ({
      key: column.key,
      label: column.label,
      format: column.format === undefined || column.format === 'text' || column.format === 'date' ? column.format : toValueFormat(column.format),
      align: column.align,
      rowHeader: column.rowHeader,
      sortable: column.sortable,
    })),
    rows: f.rows.map(row =>
      Object.fromEntries(
        Object.entries(row).map(([key, cell]) => [
          key,
          cell !== null && typeof cell === 'object' ? tableCell(cell, c) : cell,
        ]),
      ),
    ),
    highlight: f.highlight,
    defaultSort: f.defaultSort,
    width: f.width,
  };
}

type ContentCell = Exclude<FigureOf<'dataTable'>['rows'][number][string], string | number | null>;

/** A content cell object as the table takes it: text, a qualified number or a range, with its footnotes as credits. */
function tableCell(cell: ContentCell, c: FigureContext): R.CitedCell {
  const sources = cell.sources?.map(c.credit);
  if (cell.low !== undefined && cell.high !== undefined) return { low: cell.low, high: cell.high, asPublished: cell.asPublished, sources };
  if (typeof cell.value === 'number') return { value: cell.value, qualifier: cell.qualifier, asPublished: cell.asPublished, sources };
  return { value: cell.value ?? null, sources };
}

/**
 * A key figure's number with its qualifier: the sibling `qualifier` and
 * `asPublished` (the older shape) fold into the value, so the component
 * sees one shape. The validator refuses a qualifier given in both places.
 */
function keyFigureValue(figure: FigureOf<'keyFigures'>['figures'][number]): R.FigureNumber {
  const { value, qualifier, asPublished } = figure;
  if (typeof value !== 'number') return value;
  return qualifier ? { value, qualifier, asPublished } : value;
}

export function keyFiguresProps(f: FigureOf<'keyFigures'>, c: FigureContext): R.KeyFiguresProps {
  return {
    ...frame(f, c),
    figures: f.figures.map(figure => ({
      value: keyFigureValue(figure),
      format: toValueFormat(figure.format),
      label: figure.label,
      period: figure.period,
      periodLabel: figure.periodLabel,
      change: figure.change && { value: figure.change.value, format: toValueFormat(figure.change.format), comparison: figure.change.comparison },
      sources: figure.sources.map(c.credit),
    })),
  };
}

export function timelineProps(f: FigureOf<'timeline'>, c: FigureContext): R.TimelineProps {
  return {
    ...frame(f, c),
    categories: f.categories,
    events: f.events.map(event => ({
      date: event.date,
      endDate: event.endDate,
      title: event.title,
      description: event.description,
      category: event.category,
      significance: event.significance,
      sources: event.sources.map(c.credit),
    })),
  };
}

export function periodTimelineProps(f: FigureOf<'periodTimeline'>, c: FigureContext): R.PeriodTimelineProps {
  const open = f.rows.some(row => row.periods.some(period => period.to === undefined));
  return {
    ...frame(f, c),
    rowLabel: f.rowLabel,
    from: f.from,
    to: f.to ?? (open ? c.asOf : undefined),
    asOf: c.asOf,
    categories: f.categories,
    rows: f.rows.map(row => ({
      label: row.label,
      periods: row.periods.map(period => ({ from: period.from, to: period.to, label: period.label, category: period.category, sources: period.sources.map(c.credit) })),
    })),
    events: stripEvents(f, c.fact.id, c.sources, c.panel),
  };
}

/**
 * A map figure's shading, numeric or categorical, as the components take it.
 * A bare category slug becomes `{ category }`; a bare number `{ value }`.
 */
function mapEncoding(f: FigureOf<'tileMap'> | FigureOf<'geoMap'>): R.MapEncoding {
  if (f.categories) {
    // The schema refuses a categorical map without all three; the check narrows the types.
    if (!f.categoryLabel || !f.areas) throw new Error(`map ${f.id} needs \`categoryLabel\`, \`categories\` and \`areas\``);
    return {
      categoryLabel: f.categoryLabel,
      categories: f.categories,
      categoryData: Object.fromEntries(
        Object.entries(f.areas).map(([area, a]) => [area, typeof a === 'string' ? { category: a } : { category: a.category, note: a.note }]),
      ),
    };
  }
  if (!f.data || !f.valueLabel) throw new Error(`map ${f.id} needs \`data\` and \`valueLabel\``);
  return {
    data: Object.fromEntries(
      Object.entries(f.data).map(([area, datum]) => [area, typeof datum === 'number' ? { value: datum } : datum]),
    ),
    valueLabel: f.valueLabel,
    format: toValueFormat(f.format),
    scale: f.scale,
    steps: f.steps,
    domain: f.domain,
    breaks: f.breaks,
  };
}

export function tileMapProps(f: FigureOf<'tileMap'>, c: FigureContext): R.TileMapProps {
  return {
    ...frame(f, c),
    tiles: mapTiles(f.map),
    areaLabel: f.areaLabel,
    highlight: f.highlight,
    ...mapEncoding(f),
  };
}

export function geoMapProps(f: FigureOf<'geoMap'>, c: FigureContext): R.GeoMapProps {
  const { regions, extent } = geoRegions(f.regions);
  return {
    ...frame(f, c),
    regions,
    extent,
    areaLabel: f.areaLabel,
    highlight: f.highlight,
    insets: f.insets,
    ...mapEncoding(f),
  };
}

export function scatterPlotProps(f: FigureOf<'scatterPlot'>, c: FigureContext): R.ScatterPlotProps {
  const axis = (a: FigureOf<'scatterPlot'>['x']): R.ScatterAxis => ({ label: a.label, format: toValueFormat(a.format), domain: a.domain, includeZero: a.includeZero });
  return {
    ...frame(f, c),
    pointLabel: f.pointLabel,
    x: axis(f.x),
    y: axis(f.y),
    groups: f.groups,
    highlight: f.highlight,
    points: f.points.map(p => ({ id: p.id, label: p.label, name: p.name, x: p.x, y: p.y, group: p.group, note: p.note })),
  };
}

export function barChartProps(f: FigureOf<'barChart'>, c: FigureContext): R.BarChartProps {
  return {
    ...frame(f, c),
    valueLabel: f.valueLabel,
    categoryLabel: f.categoryLabel,
    format: toValueFormat(f.format),
    sort: f.sort,
    domainMax: f.domainMax,
    items: f.items.map(item => {
      // The schema refuses a row without `value` unless the chart has `series`; the check narrows the type.
      if (item.value === undefined) throw new Error(`bar chart ${f.id} row "${item.label}" needs \`value\``);
      return { label: item.label, value: item.value, highlight: item.highlight };
    }),
  };
}

/** A bar chart with `series`: a measure per series in each row, paired or as a dumbbell. */
export function pairedBarChartProps(f: FigureOf<'barChart'>, c: FigureContext): R.PairedBarChartProps {
  if (!f.series) throw new Error(`bar chart ${f.id} needs \`series\` to be paired`);
  return {
    ...frame(f, c),
    series: f.series,
    style: f.style,
    valueLabel: f.valueLabel,
    categoryLabel: f.categoryLabel,
    format: toValueFormat(f.format),
    sort: f.sort,
    domainMax: f.domainMax,
    items: f.items.map(item => ({ label: item.label, values: item.values ?? {}, labels: item.labels, highlight: item.highlight })),
  };
}

export function sliceExplorerProps(f: FigureOf<'sliceExplorer'>, c: FigureContext): R.SliceExplorerProps {
  return {
    ...frame(f, c),
    rows: f.rows,
    dimensions: f.dimensions,
    measures: f.measures.map(m => ({ key: m.key, label: m.label, format: toValueFormat(m.format), aggregation: m.aggregation })),
    defaultBreakdown: f.defaultBreakdown,
    defaultSplit: f.defaultSplit,
    defaultMeasure: f.defaultMeasure,
    defaultFilters: f.defaultFilters,
    splitLayout: f.splitLayout,
  };
}

export function compositionBarProps(f: FigureOf<'compositionBar'>, c: FigureContext): R.CompositionBarProps {
  return {
    ...frame(f, c),
    categories: f.categories,
    rows: f.rows.map(row => ({ label: row.label, values: row.values, total: row.total, sources: row.sources.length > 0 ? row.sources.map(c.credit) : undefined })),
    unit: f.unit,
    showCounts: f.showCounts,
    countFormat: toValueFormat(f.countFormat),
    rowLabel: f.rowLabel,
    otherThreshold: f.otherThreshold,
    otherLabel: f.otherLabel,
  };
}

export function estimateRangeProps(f: FigureOf<'estimateRange'>, c: FigureContext): R.EstimateRangeProps {
  return {
    ...frame(f, c),
    valueLabel: f.valueLabel,
    itemLabel: f.itemLabel,
    format: toValueFormat(f.format),
    intervalLabel: f.intervalLabel,
    nullValue: f.nullValue,
    nullLabel: f.nullLabel,
    domain: f.domain,
    estimates: f.estimates.map(e => ({
      label: e.label,
      year: e.year,
      estimate: e.estimate,
      low: e.low,
      high: e.high,
      group: e.group,
      note: e.note,
      asPublished: e.asPublished,
      sources: e.sources.map(c.credit),
    })),
  };
}

type FigureQuote = FigureOf<'pullQuote'>['quote'] | FigureOf<'quotes'>['quotes'][number];

/** Quote ids are `<fact>--<figure id>-<n>`, one-based, so `quoteAnchor` stays unique on the page. */
function quote(q: FigureQuote, n: number, f: { id: string }, c: FigureContext): R.Quote {
  return {
    id: `${c.fact.id}--${f.id}-${n}`,
    text: q.text,
    speaker: q.speaker,
    role: q.role,
    date: q.date,
    context: q.context,
    sources: q.sources.map(c.credit),
  };
}

/** Up to this many quotes are set side by side (QuoteComparison); more become a filterable list (QuoteBrowser). */
export const SIDE_BY_SIDE_QUOTES = 4;

/** A `quotes` figure's quotes, each with its stance's label as its position. */
function quotesOf(f: FigureOf<'quotes'>, c: FigureContext): R.Quote[] {
  const labelOf = new Map((f.categories ?? []).map(category => [category.id, category.label]));
  return f.quotes.map((q, i) => ({
    ...quote(q, i + 1, f, c),
    position: q.stance && labelOf.get(q.stance),
    lang: q.lang,
    translation: q.translation,
  }));
}

/** A `quotes` figure of up to four, side by side in the order written. */
export function quoteComparisonProps(f: FigureOf<'quotes'>, c: FigureContext): R.QuoteComparisonProps {
  return {
    id: figureDomId(c.fact, f.id),
    question: f.question,
    description: f.description,
    note: f.note,
    sources: figureCredits(f, c),
    panel: c.panel,
    quotes: quotesOf(f, c),
  };
}

/**
 * A `quotes` figure of more than four, as a list in date order with filters
 * by category and speaker. Category chips stay alphabetical (QuoteBrowser's
 * default), so no side is listed first by the author's ordering.
 */
export function quoteBrowserProps(f: FigureOf<'quotes'>, c: FigureContext): R.QuoteBrowserProps {
  return {
    id: figureDomId(c.fact, f.id),
    title: f.question,
    description: f.description,
    note: f.note,
    sources: figureCredits(f, c),
    panel: c.panel,
    positionLabel: f.categoryLabel ?? 'Category',
    quotes: quotesOf(f, c),
  };
}

/** The quote alone; the renderer frames it (id, description, Observations, note) in a ReportFigure. */
export function pullQuoteProps(f: FigureOf<'pullQuote'>, c: FigureContext): R.PullQuoteProps {
  return { quote: { ...quote(f.quote, 1, f, c), position: f.quote.position }, variant: f.variant };
}

/**
 * The claim alone; the renderer frames it. `facts` are the topic's, so an
 * evidence link to a supporting fact lands on its parent's page, the same
 * target rule as an inline citation (remarkMarkFactCitations).
 */
export function claimCheckProps(f: FigureOf<'claimCheck'>, c: FigureContext & { slug: string; facts: Pick<Fact, 'id' | 'supports'>[] }): R.ClaimCheckProps {
  return {
    claim: f.claim,
    claimant: f.claimant,
    date: f.date,
    claimSource: c.credit(f.claimSource),
    status: f.status,
    finding: f.finding,
    sources: f.sources.map(c.credit),
    evidence: f.evidence && { href: evidenceHref(f.evidence, c.slug, c.facts), label: f.evidence.label },
  };
}

function evidenceHref({ fact: id, section }: { fact: string; section?: string }, slug: string, facts: Pick<Fact, 'id' | 'supports'>[]): string {
  const parent = facts.find(fact => fact.id === id)?.supports;
  const anchor = section ? `${id}--${section}` : parent ? `evidence-${id}` : '';
  return factPath(slug, parent ?? id) + (anchor ? `#${anchor}` : '');
}

/** The list alone; the renderer frames it. */
export function caveatListProps(f: FigureOf<'caveatList'>, c: FigureContext): R.CaveatListProps {
  return {
    heading: f.heading,
    items: f.items.map(item => ({ measure: item.measure, why: item.why, sources: item.sources.map(c.credit) })),
  };
}
