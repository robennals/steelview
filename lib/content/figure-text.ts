import type { Figure, FigureOf, FigureValueFormat } from './types';

/**
 * What `check:figures` audits in a fact's `figures`, so that moving a
 * markdown table into frontmatter does not take it out of the audit.
 *
 * - `figureProse` is every reader-facing string, audited like a body.
 * - `figureValues` is every number a figure draws, audited like a chart value.
 *
 * Quote `text` and a claim check's `claim` are not prose here: they are
 * checked verbatim against their source (validate.ts, rule F11). A quote's
 * `translation` is prose — the report's words, or a translator's.
 * `asPublished` travels with its value instead.
 */

/**
 * The text of a chart's About this data: its note, then the named table its
 * values are read from. One wording for component figures, series readings
 * and comparisons alike.
 */
export function aboutThisDataNote(f: { note?: string; valuesFrom?: string }): string | undefined {
  const parts = [f.note, f.valuesFrom && `Values from ${f.valuesFrom}.`].filter(Boolean);
  return parts.length ? parts.join(' ') : undefined;
}

/** Every reader-facing string in a figure. References (`series`, `comparison`, `featured`, `section`) have none of their own. */
export function figureProse(figure: Figure): string[] {
  const strings = ((): Array<string | undefined> => {
    switch (figure.kind) {
      case 'series':
      case 'comparison':
      case 'featured':
      case 'section':
        return [];
      case 'dataTable':
        return [
          ...base(figure),
          figure.caption,
          ...figure.columns.map(c => c.label),
          ...figure.rows.flatMap(row =>
            Object.values(row).map(cell => {
              const value = cell !== null && typeof cell === 'object' ? cell.value : cell;
              return typeof value === 'string' ? value : undefined;
            }),
          ),
        ];
      case 'keyFigures':
        return [...base(figure), ...figure.figures.flatMap(f => [f.label, f.periodLabel, f.change?.comparison])];
      case 'timeline':
        return [...base(figure), ...figure.events.flatMap(e => [e.title, e.description])];
      case 'periodTimeline':
        return [
          ...base(figure),
          ...figure.rows.flatMap(row => [row.label, ...row.periods.map(p => p.label)]),
          ...figure.events.flatMap(e => [e.label, e.note]),
        ];
      case 'tileMap':
        return mapProse(figure);
      case 'geoMap':
        return [...mapProse(figure), ...(figure.insets ?? []).map(inset => inset.label)];
      case 'scatterPlot':
        return [
          ...base(figure),
          ...(figure.groups ?? []).map(g => g.label),
          ...figure.points.flatMap(p => [p.name, p.note]),
        ];
      case 'barChart':
        return [
          ...base(figure),
          ...(figure.series ?? []).map(s => s.label),
          ...figure.items.flatMap(item => [item.label, ...Object.values(item.labels ?? {})]),
        ];
      case 'sliceExplorer': {
        const dimensionKeys = new Set(figure.dimensions.map(d => d.key));
        return [
          ...base(figure),
          ...figure.dimensions.flatMap(d => [d.label, d.plural]),
          ...figure.measures.map(m => m.label),
          // Each distinct value of a dimension is a label the reader sees, once however many rows carry it.
          ...new Set(figure.rows.flatMap(row => Object.entries(row).flatMap(([key, cell]) => (dimensionKeys.has(key) && typeof cell === 'string' ? [cell] : [])))),
        ];
      }
      case 'smallMultiples':
        return [...base(figure), figure.valueLabel, figure.periodLabel, figure.coverage.note, ...figure.panels.flatMap(p => [p.name, p.coverage?.note])];
      case 'compositionBar':
        return [...base(figure), ...figure.rows.map(row => row.label)];
      case 'estimateRange':
        return [...base(figure), ...figure.estimates.flatMap(e => [e.label, e.note])];
      case 'quotes':
        return [
          figure.question,
          figure.description,
          figure.note,
          figure.categoryLabel,
          ...(figure.categories ?? []).map(c => c.label),
          ...figure.quotes.flatMap(q => [...quoteProse(q), q.translation]),
        ];
      case 'pullQuote':
        return [figure.description, figure.note, ...quoteProse(figure.quote)];
      case 'claimCheck':
        return [figure.finding];
      case 'caveatList':
        return [figure.heading, ...figure.items.flatMap(item => [item.measure, item.why])];
    }
  })();
  return strings.filter((s): s is string => typeof s === 'string' && s.length > 0);
}

function base(figure: { title: string; description: string; note?: string }) {
  return [figure.title, figure.description, figure.note];
}

/** A map's title, description and note, and in categorical mode each category's label and each area's note. */
function mapProse(figure: FigureOf<'tileMap'> | FigureOf<'geoMap'>) {
  return [
    ...base(figure),
    ...(figure.categories ?? []).map(c => c.label),
    ...Object.values(figure.areas ?? {}).map(a => (typeof a === 'string' ? undefined : a.note)),
  ];
}

function quoteProse(quote: { role?: string; position?: string; context?: string }) {
  return [quote.role, quote.position, quote.context];
}

/** One number a figure draws, with what it may be traced to. */
export type FigureValue = {
  /** Where the reader sees it: `bar "Black"`, `table row "Voting Rights Act" column year`. */
  where: string;
  value: number;
  format?: FigureValueFormat;
  /** The item's own citations if it has any (every one may hold the number), else the figure's `sources`. */
  citations: number[];
  /** The figure in the source's own words, looked for instead of the number. */
  asPublished?: string;
  /** The published table the figure's values are read from. */
  valuesFrom?: string;
};

/** A number as content writes it: bare, qualified (`{ value, qualifier, asPublished }`) or a range (`{ low, high, asPublished }`). */
type WrittenNumber = number | { value: number; asPublished?: string } | { low: number; high: number; asPublished?: string };

/**
 * A written number as audited values: one for a bare or qualified number,
 * two for a range, since both ends are figures the source must state. The
 * number's own `asPublished` takes the place of the item's.
 */
function numberValues(where: string, n: WrittenNumber, rest: Omit<FigureValue, 'where' | 'value'>): FigureValue[] {
  if (typeof n === 'number') return [{ ...rest, asPublished: rest.asPublished, where, value: n }];
  const asPublished = n.asPublished ?? rest.asPublished;
  if ('low' in n) return [{ ...rest, asPublished, where: `${where} low`, value: n.low }, { ...rest, asPublished, where: `${where} high`, value: n.high }];
  return [{ ...rest, asPublished, where, value: n.value }];
}

/** Every number a figure draws: key figures, bars, map data, scatter coordinates, slice rows, small-multiple points, composition parts, estimate bounds, numeric table cells — both ends of a range. */
export function figureValues(figure: Figure): FigureValue[] {
  switch (figure.kind) {
    case 'series':
    case 'comparison':
    case 'featured':
    case 'section':
    case 'timeline':
    case 'periodTimeline':
    case 'quotes':
    case 'pullQuote':
    case 'claimCheck':
    case 'caveatList':
      return [];
    case 'dataTable': {
      const header = (figure.columns.find(c => c.rowHeader) ?? figure.columns[0]).key;
      return figure.rows.flatMap((row, i) => {
        const headerCell = row[header];
        const rowName = String((headerCell !== null && typeof headerCell === 'object' ? headerCell.value : headerCell) ?? i + 1);
        // A date column's years are dates, not figures.
        return figure.columns.filter(column => column.format !== 'date').flatMap(column => {
          const cell = row[column.key];
          const cited = cell !== null && typeof cell === 'object' ? cell : undefined;
          const written: WrittenNumber | undefined = cited
            ? cited.low !== undefined && cited.high !== undefined ? { low: cited.low, high: cited.high } : typeof cited.value === 'number' ? { value: cited.value } : undefined
            : typeof cell === 'number' ? cell : undefined;
          if (written === undefined) return [];
          return numberValues(`table row "${rowName}" column ${column.key}`, written, {
            format: typeof column.format === 'object' ? column.format : undefined,
            citations: cited?.sources ?? figure.sources,
            asPublished: cited?.asPublished,
            valuesFrom: figure.valuesFrom,
          });
        });
      });
    }
    case 'keyFigures':
      return figure.figures.flatMap(f => [
        ...numberValues(`key figure "${f.label}"`, f.value, { format: f.format, citations: f.sources, asPublished: f.asPublished, valuesFrom: figure.valuesFrom }),
        ...(f.change
          ? [{
            where: `key figure "${f.label}" change`,
            value: f.change.value,
            // KeyFigures' own default for a change.
            format: f.change.format ?? { unit: 'percent' as const, decimals: 0, signed: true },
            citations: f.sources,
            valuesFrom: figure.valuesFrom,
          }]
          : []),
      ]);
    // A categorical map draws no numbers; its `data` is absent.
    case 'tileMap':
    case 'geoMap':
      return Object.entries(figure.data ?? {}).flatMap(([area, datum]) =>
        numberValues(`map area ${area}`, datum, { format: figure.format, citations: figure.sources, valuesFrom: figure.valuesFrom }),
      );
    case 'scatterPlot':
      return figure.points.flatMap(p =>
        (['x', 'y'] as const).flatMap(axis =>
          numberValues(`point "${p.name}" ${axis}`, p[axis], {
            format: figure[axis].format,
            citations: figure.sources,
            asPublished: axis === 'x' ? p.xAsPublished : p.yAsPublished,
            valuesFrom: figure.valuesFrom,
          }),
        ),
      );
    case 'barChart':
      return figure.items.flatMap(item => {
        const rest = { format: figure.format, citations: figure.sources, valuesFrom: figure.valuesFrom };
        if (item.value !== undefined) return numberValues(`bar "${item.label}"`, item.value, { ...rest, asPublished: item.asPublished });
        // A paired row: one value per series, `null` where the source publishes none.
        return Object.entries(item.values ?? {}).flatMap(([key, value]) => (value === null ? [] : numberValues(`bar "${item.label}" ${key}`, value, rest)));
      });
    case 'sliceExplorer':
      return figure.rows.flatMap(row => {
        const name = figure.dimensions.map(d => row[d.key]).join(', ');
        return figure.measures.flatMap(m => {
          const value = row[m.key];
          return typeof value === 'number' ? numberValues(`slice row "${name}" ${m.key}`, value, { format: m.format, citations: figure.sources, valuesFrom: figure.valuesFrom }) : [];
        });
      });
    case 'smallMultiples':
      return figure.panels.flatMap(panel =>
        panel.points.flatMap(point =>
          numberValues(`panel "${panel.name}" ${point.period}`, point.value, {
            format: figure.format,
            citations: panel.sources.length > 0 ? panel.sources : figure.sources,
            valuesFrom: figure.valuesFrom,
          }),
        ),
      );
    case 'compositionBar':
      return figure.rows.flatMap(row => {
        const rest = { format: figure.countFormat, citations: row.sources.length > 0 ? row.sources : figure.sources, valuesFrom: figure.valuesFrom };
        return [
          ...Object.entries(row.values).flatMap(([key, value]) => numberValues(`composition row "${row.label}" ${key}`, value, rest)),
          ...(row.total === undefined ? [] : numberValues(`composition row "${row.label}" total`, row.total, rest)),
        ];
      });
    case 'estimateRange':
      return figure.estimates.flatMap(e =>
        (['estimate', 'low', 'high'] as const).flatMap(bound => {
          const value = e[bound];
          if (value === undefined) return [];
          return numberValues(`estimate "${e.label}" ${bound}`, value, { format: figure.format, citations: e.sources, asPublished: e.asPublished, valuesFrom: figure.valuesFrom });
        }),
      );
  }
}
