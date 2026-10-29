import type * as R from '@/components/report';
import { stripEvents } from '@/components/topic/series-chart';
import { mapTiles } from './map-presets';
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
};

export function figureContext(fact: Fact, asOf?: string): FigureContext {
  const sources = factSources(fact);
  return {
    fact,
    sources,
    asOf,
    // validate.ts rejects a citation past the end of the list (rule F2); the
    // fallback only keeps an unvalidated draft rendering in the dev server.
    credit: n => ({ label: sources[n - 1]?.publisher ?? `Source ${n}`, href: `#source-${fact.id}-${n}`, number: n }),
  };
}

/** The DOM id of a component figure: the same scheme as comparisons, so `#fact-<fact>/chart-<id>` resolves. */
export function figureDomId(fact: Pick<Fact, 'id'>, figureId: string): string {
  return `${fact.id}--chart-${figureId}`;
}

/** The figure's source line: its `sources` and every item-level citation, deduplicated, in ascending order. */
export function figureCredits(figure: Figure, c: FigureContext): R.SourceCredit[] {
  return [...new Set(figureCitations(figure))].sort((a, b) => a - b).map(c.credit);
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

/** The note, with the named table the values come from, for "About this data". */
function figureNote(f: { note?: string; valuesFrom?: string }): string | undefined {
  const parts = [f.note, f.valuesFrom && `Values from ${f.valuesFrom}.`].filter(Boolean);
  return parts.length ? parts.join(' ') : undefined;
}

/** The fields every ReportFigure-framed component takes. */
function frame(f: Extract<Figure, { title: string }>, c: FigureContext) {
  return {
    id: figureDomId(c.fact, f.id),
    title: f.title,
    description: f.description,
    sources: figureCredits(f, c),
    note: figureNote(f),
  };
}

export function dataTableProps(f: FigureOf<'dataTable'>, c: FigureContext): R.DataTableProps {
  return {
    ...frame(f, c),
    caption: f.caption,
    columns: f.columns.map(column => ({
      key: column.key,
      label: column.label,
      format: column.format === undefined || column.format === 'text' ? column.format : toValueFormat(column.format),
      align: column.align,
      rowHeader: column.rowHeader,
      sortable: column.sortable,
    })),
    rows: f.rows.map(row =>
      Object.fromEntries(
        Object.entries(row).map(([key, cell]) => [
          key,
          cell !== null && typeof cell === 'object' ? { value: cell.value, sources: cell.sources.map(c.credit) } : cell,
        ]),
      ),
    ),
    highlight: f.highlight,
    defaultSort: f.defaultSort,
  };
}

export function keyFiguresProps(f: FigureOf<'keyFigures'>, c: FigureContext): R.KeyFiguresProps {
  return {
    ...frame(f, c),
    figures: f.figures.map(figure => ({
      value: figure.value,
      format: toValueFormat(figure.format),
      qualifier: figure.qualifier,
      label: figure.label,
      period: figure.period,
      periodLabel: figure.periodLabel,
      change: figure.change && { value: figure.change.value, format: toValueFormat(figure.change.format), comparison: figure.change.comparison },
      source: c.credit(figure.source),
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
      source: c.credit(event.source),
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
    categories: f.categories,
    rows: f.rows,
    events: stripEvents(f, c.fact.id, c.sources),
  };
}

export function tileMapProps(f: FigureOf<'tileMap'>, c: FigureContext): R.TileMapProps {
  // The schema refuses a tile map without these; the check narrows the types.
  if (!f.data || !f.valueLabel) throw new Error(`tile map ${f.id} needs \`data\` and \`valueLabel\``);
  return {
    ...frame(f, c),
    tiles: mapTiles(f.map),
    data: Object.fromEntries(
      Object.entries(f.data).map(([area, datum]) => [area, typeof datum === 'number' ? { value: datum } : { value: datum.value, label: datum.label }]),
    ),
    valueLabel: f.valueLabel,
    areaLabel: f.areaLabel,
    highlight: f.highlight,
    format: toValueFormat(f.format),
    scale: f.scale,
    steps: f.steps,
    domain: f.domain,
    breaks: f.breaks,
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
    items: f.items.map(item => ({ label: item.label, value: item.value, highlight: item.highlight })),
  };
}

export function compositionBarProps(f: FigureOf<'compositionBar'>, c: FigureContext): R.CompositionBarProps {
  return {
    ...frame(f, c),
    categories: f.categories,
    rows: f.rows.map(row => ({ label: row.label, values: row.values, source: row.source === undefined ? undefined : c.credit(row.source) })),
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
      source: c.credit(e.source),
    })),
  };
}

type FigureQuote = FigureOf<'pullQuote'>['quote'];

/** Quote ids are `<fact>--<figure id>-<n>`, one-based, so `quoteAnchor` stays unique on the page. */
function quote(q: FigureQuote, n: number, f: { id: string }, c: FigureContext): R.Quote {
  return {
    id: `${c.fact.id}--${f.id}-${n}`,
    text: q.text,
    speaker: q.speaker,
    role: q.role,
    position: q.position,
    date: q.date,
    context: q.context,
    source: c.credit(q.source),
  };
}

export function quoteComparisonProps(f: FigureOf<'quoteComparison'>, c: FigureContext): R.QuoteComparisonProps {
  return {
    id: figureDomId(c.fact, f.id),
    question: f.question,
    description: f.description,
    note: f.note,
    sources: figureCredits(f, c),
    quotes: f.quotes.map((q, i) => quote(q, i + 1, f, c)),
  };
}

/** The quote alone; the renderer frames it (id, description, Observations, note) in a ReportFigure. */
export function pullQuoteProps(f: FigureOf<'pullQuote'>, c: FigureContext): R.PullQuoteProps {
  return { quote: quote(f.quote, 1, f, c), variant: f.variant };
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
