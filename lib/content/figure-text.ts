import type { Figure, FigureOf, FigureValueFormat } from './types';

/**
 * What `check:figures` audits in a fact's `figures`, so that moving a
 * markdown table into frontmatter does not take it out of the audit.
 *
 * - `figureProse` is every reader-facing string, audited like a body.
 * - `figureValues` is every number a figure draws, audited like a chart value.
 *
 * Quote `text` and a claim check's `claim` are not prose here: they are
 * checked verbatim against their source (validate.ts, rule F11). `asPublished`
 * travels with its value instead.
 */

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
        return [...base(figure), ...figure.items.map(item => item.label)];
      case 'compositionBar':
        return [...base(figure), ...figure.rows.map(row => row.label)];
      case 'estimateRange':
        return [...base(figure), ...figure.estimates.flatMap(e => [e.label, e.note])];
      case 'quoteComparison':
        return [figure.question, figure.description, figure.note, ...figure.quotes.flatMap(quoteProse)];
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
  /** The item's own citation if it has one, else the figure's `sources`. */
  citations: number[];
  /** The figure in the source's own words, looked for instead of the number. */
  asPublished?: string;
  /** The published table the figure's values are read from. */
  valuesFrom?: string;
};

/** Every number a figure draws: key figures, bars, map data, scatter coordinates, composition parts, estimate bounds, numeric table cells. */
export function figureValues(figure: Figure): FigureValue[] {
  switch (figure.kind) {
    case 'series':
    case 'comparison':
    case 'featured':
    case 'section':
    case 'timeline':
    case 'periodTimeline':
    case 'quoteComparison':
    case 'pullQuote':
    case 'claimCheck':
    case 'caveatList':
      return [];
    case 'dataTable': {
      const header = (figure.columns.find(c => c.rowHeader) ?? figure.columns[0]).key;
      return figure.rows.flatMap((row, i) => {
        const headerCell = row[header];
        const rowName = String((headerCell !== null && typeof headerCell === 'object' ? headerCell.value : headerCell) ?? i + 1);
        return figure.columns.flatMap(column => {
          const cell = row[column.key];
          const cited = cell !== null && typeof cell === 'object' ? cell : undefined;
          const value = cited ? cited.value : cell;
          if (typeof value !== 'number') return [];
          return [{
            where: `table row "${rowName}" column ${column.key}`,
            value,
            format: typeof column.format === 'object' ? column.format : undefined,
            citations: cited ? cited.sources : figure.sources,
            asPublished: cited?.asPublished,
            valuesFrom: figure.valuesFrom,
          }];
        });
      });
    }
    case 'keyFigures':
      return figure.figures.flatMap(f => [
        { where: `key figure "${f.label}"`, value: f.value, format: f.format, citations: [f.source], asPublished: f.asPublished, valuesFrom: figure.valuesFrom },
        ...(f.change
          ? [{
            where: `key figure "${f.label}" change`,
            value: f.change.value,
            // KeyFigures' own default for a change.
            format: f.change.format ?? { unit: 'percent' as const, decimals: 0, signed: true },
            citations: [f.source],
            valuesFrom: figure.valuesFrom,
          }]
          : []),
      ]);
    // A categorical map draws no numbers; its `data` is absent.
    case 'tileMap':
    case 'geoMap':
      return Object.entries(figure.data ?? {}).map(([area, datum]) => ({
        where: `map area ${area}`,
        value: typeof datum === 'number' ? datum : datum.value,
        format: figure.format,
        citations: figure.sources,
        asPublished: typeof datum === 'number' ? undefined : datum.asPublished,
        valuesFrom: figure.valuesFrom,
      }));
    case 'scatterPlot':
      return figure.points.flatMap(p =>
        (['x', 'y'] as const).map(axis => ({
          where: `point "${p.name}" ${axis}`,
          value: p[axis],
          format: figure[axis].format,
          citations: figure.sources,
          asPublished: axis === 'x' ? p.xAsPublished : p.yAsPublished,
          valuesFrom: figure.valuesFrom,
        })),
      );
    case 'barChart':
      return figure.items.map(item => ({
        where: `bar "${item.label}"`,
        value: item.value,
        format: figure.format,
        citations: figure.sources,
        asPublished: item.asPublished,
        valuesFrom: figure.valuesFrom,
      }));
    case 'compositionBar':
      return figure.rows.flatMap(row =>
        Object.entries(row.values).map(([key, value]) => ({
          where: `composition row "${row.label}" ${key}`,
          value,
          format: figure.countFormat,
          citations: row.source === undefined ? figure.sources : [row.source],
          valuesFrom: figure.valuesFrom,
        })),
      );
    case 'estimateRange':
      return figure.estimates.flatMap(e =>
        (['estimate', 'low', 'high'] as const).flatMap(bound => {
          const value = e[bound];
          if (value === undefined) return [];
          return [{
            where: `estimate "${e.label}" ${bound}`,
            value,
            format: figure.format,
            citations: [e.source],
            asPublished: e.asPublished,
            valuesFrom: figure.valuesFrom,
          }];
        }),
      );
  }
}
