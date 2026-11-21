import { Fragment, type ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { crossesNull, estimateScale, whiskerSpan, type EstimateAxis } from './estimate-layout';
import { EstimateGroupSwitch } from './estimate-group-switch';
import { ReportFigure, SourceCredits } from './figure';
import { formatValue } from './format';
import { pointValue, qualificationOf, qualifiedLabel, qualifiedText, type QualifiedPoint } from './qualified';
import { COMPACT_PREVIEW_ITEMS } from './ranked-columns';
import { DetailRow, RowDetailHint } from './row-detail';
import type { FigurePreview, SourceCredit, ValueFormat } from './types';

export type Estimate = {
  /** The study or model: "Dustmann, Frattini & Preston". */
  label: string;
  /** Shown when the row is opened, and in the table. */
  year?: number | string;
  /** The central estimate, qualified if the source says "about". Omit for a source that publishes only a range: no dot is drawn. */
  estimate?: number | QualifiedPoint;
  /**
   * Lower and upper bounds of the reported interval (state which interval in
   * `intervalLabel`). Omit `high` for "at least …" and `low` for "at most …"
   * or an upper confidence bound quoted alone: the line is then a short
   * dashed tail from the published bound, ending in an arrowhead, and the
   * table does not say whether it includes no effect unless the bound settles
   * it. At least one of `estimate`, `low` and `high` is required.
   */
  low?: number;
  high?: number;
  /** Rows sharing a group are set under one subheading, in first-appearance order, or shown one group at a time with `switchGroups`. */
  group?: string;
  /** Shown when the row is opened, and in the table. */
  note?: string;
  /** The estimate in the source's own words, shown when the row is opened and in the table's Value column: "$25–35bn". */
  asPublished?: string;
  /** This estimate's own sources, shown when the row is opened and in the table. */
  sources?: SourceCredit[];
};

export type EstimateRangeProps = {
  estimates: Estimate[];
  format?: ValueFormat;
  /** What each estimate measures: "Effect on wages of the lowest-paid, % per 1pp rise in migrant share". */
  valueLabel: string;
  /** What one row is, heading the table's first column: "Study", "Source". Defaults to "Estimate". */
  itemLabel?: string;
  /** Which interval the whiskers show: "95% confidence interval". Said on the figure, because 90% and 95% intervals are not interchangeable. */
  intervalLabel?: string;
  /** What the dot is, in the key: "Central estimate" (the default), or "Rate multiple" where there is no interval to be central in. */
  pointLabel?: string;
  /**
   * The value meaning "no effect". Defaults to 0; use 1 for ratios. `null` for
   * estimates with no natural reference, such as costs: no reference line,
   * no "Includes …?" column, and values are not signed.
   */
  nullValue?: number | null;
  nullLabel?: string;
  /** Fix the axis, e.g. to keep two figures comparable. Values outside are drawn at the edge with an arrowhead showing they continue. */
  domain?: [number, number];
  /** `log` spaces values by ratio, for multiples: 0.5 and 2 sit the same distance either side of 1. Every value must be above zero. */
  axis?: EstimateAxis;
  /**
   * Show one group at a time, picked from a dropdown named `groupLabel`
   * ("Compare"), instead of every group under its own subheading. For groups
   * that answer different questions on the same measure, which would be one
   * long list otherwise. The table still lists every row of every group.
   */
  switchGroups?: boolean;
  groupLabel?: string;
  /** With `switchGroups`, the group shown first; defaults to the first. */
  defaultGroup?: string;
  id?: string;
  title?: string;
  /** A short line under the title: the period, cases or source (see ReportFigure). */
  subtitle?: string;
  description?: ReactNode;
  sources?: SourceCredit[];
  note?: ReactNode;
  /** Rendered after the source line and before "About this data": the figure's Observations. */
  footer?: ReactNode;
  /** Drawn in a data panel: filling the panel, its description and note folded into one line. */
  panel?: boolean;
  /**
   * Draw the compact preview: the linked title, every estimate and the axis.
   * The key, value label and each row's disclosure stay on the full figure.
   */
  preview?: FigurePreview;
};

/**
 * A forest plot: one row per study, a dot for its central estimate and a
 * line for its interval, against a marked no-effect line. It shows the
 * shape of an evidence base in one look — whether studies agree on a
 * direction, how far their intervals overlap, and how many cross zero —
 * which a single quoted estimate cannot. Whether each interval includes no
 * effect is also written in words in the table, never left to position alone.
 *
 * A row is one name, the plot and one short figure, so the plot stays
 * readable however much a study has to say: the year, the full interval, the
 * source's wording, the note and the sources open under the row.
 */
export function EstimateRange({
  estimates,
  format = { unit: 'number', decimals: 2 },
  valueLabel,
  itemLabel = 'Estimate',
  intervalLabel = 'Interval',
  pointLabel = 'Central estimate',
  nullValue = 0,
  nullLabel = 'No effect',
  domain,
  axis = 'linear',
  switchGroups = false,
  groupLabel = 'Show',
  defaultGroup,
  id,
  title,
  subtitle,
  description,
  sources,
  note,
  footer,
  panel,
  preview,
}: EstimateRangeProps) {
  // Layout reads the central estimate's number; its qualifier is for the text.
  const bounds = (e: Estimate) => ({ low: e.low, high: e.high, estimate: e.estimate === undefined ? undefined : pointValue(e.estimate) });
  // Signs say which side of "no effect" a value is on; with no such value — or on a ratio axis, where 1 is no effect and nothing is negative — they say nothing.
  const signed: ValueFormat = nullValue === null || axis === 'log' ? format : { ...format, signed: true };
  const groups = [...new Set(estimates.map(e => e.group ?? ''))];
  // On a log axis the values are multiples, and say so: "1.69×".
  const times = axis === 'log' ? '×' : '';
  const show = (value: number | QualifiedPoint | undefined) => (value === undefined ? '—' : `${qualifiedLabel(value, signed)}${times}`);
  const intervalText = (e: Estimate) =>
    e.low !== undefined && e.high !== undefined ? `${show(e.low)} to ${show(e.high)}`
      : e.low !== undefined ? `at least ${show(e.low)}`
        : e.high !== undefined ? `at most ${show(e.high)}`
          : undefined;
  // The figure printed on the row: the central estimate, or the range where the source gives only that.
  const rowValue = (e: Estimate) => (e.estimate === undefined ? intervalText(e) ?? '' : show(e.estimate));
  const detailFor = (e: Estimate) => {
    const lines: Array<[string, ReactNode]> = [
      ['Year', e.year],
      ['Interval', e.estimate === undefined ? undefined : intervalText(e)],
      ['As published', e.asPublished],
      ['Note', e.note],
      ['Source', e.sources?.length ? <SourceCredits sources={e.sources} /> : undefined],
    ];
    const present = lines.filter(([, text]) => text !== undefined);
    if (present.length === 0) return undefined;
    return <dl className="sv-row-detail__facts">{present.map(([term, text]) => <Fragment key={term}><dt>{term}</dt><dd>{text}</dd></Fragment>)}</dl>;
  };
  const nullText = nullLabel.toLowerCase();
  const shownFirst = switchGroups ? (groups.includes(defaultGroup ?? '') ? defaultGroup ?? '' : groups[0]) : undefined;

  /** The plot of `rows`: every estimate, or with `switchGroups` one group's, on an axis fitted to them unless `domain` fixes it. */
  const drawGraph = (rows: Estimate[]) => {
    const scale = estimateScale(rows.map(bounds), nullValue, domain, axis);
    const hasDetail = !preview && rows.some(detailFor);
    // In rem, not ch: the preview sets its rows and its axis in different sizes, and the two must share this column.
    const widths = { '--sv-estimates-value': `${(Math.max(3, ...rows.map(e => rowValue(e).length)) + 1) * 0.5}rem` };
    const rangeOnly = rows.some(e => e.estimate === undefined);
    const approximate = rows.some(e => e.estimate !== undefined && qualificationOf(e.estimate) === 'approximate');
    const spans = rows.map(e => whiskerSpan(bounds(e), scale));
    const openBound = spans.some(span => span?.start === 'open' || span?.end === 'open');
    const beyondAxis = spans.some(span => span?.start === 'clipped' || span?.end === 'clipped')
      || rows.some(e => { const central = bounds(e).estimate; return central !== undefined && scale.beyond(central) !== undefined; });
    const rowGroups = switchGroups ? [''] : [...new Set(rows.map(e => e.group ?? ''))];
    /** The tick labels, above the plot as well as below it, so a long list can be read without scrolling to its foot. */
    const axisRow = (position: 'top' | 'bottom') => (
      <div className="sv-estimates__axis" data-position={position} data-crowded={scale.ticks.length > 6 || undefined} aria-hidden="true">
        <span className="sv-estimates__ticks">
          {scale.ticks.map((tick, i) => (
            <span
              key={tick}
              className="sv-bars__tick"
              data-edge={i === 0 ? 'start' : i === scale.ticks.length - 1 ? 'end' : undefined}
              // On a log axis, the ticks between powers of ten ("5×") can give way on a narrow screen.
              data-minor={axis === 'log' && !Number.isInteger(Math.log10(tick)) || undefined}
              style={{ left: `${scale.x(tick)}%` }}
            >
              {formatValue(tick, tick === nullValue ? format : signed)}{times}
            </span>
          ))}
        </span>
      </div>
    );
    return (
      <div className="sv-estimates" data-compact={(preview && rows.length > COMPACT_PREVIEW_ITEMS) || undefined} style={widths}>
        {!preview && <p className="sv-estimates__key" aria-hidden="true">
          <span className="sv-estimates__key-item"><i className="sv-estimates__key-dot" />{pointLabel}</span>
          {spans.some(Boolean) && <span className="sv-estimates__key-item"><i className="sv-estimates__key-line" />{intervalLabel}</span>}
          {approximate && <span className="sv-estimates__key-item"><i className="sv-estimates__key-dot" data-qualification="approximate" />Hollow: an approximate value</span>}
          {rangeOnly && <span className="sv-estimates__key-item"><i className="sv-estimates__key-line" />Range only: no dot where no central estimate was published</span>}
          {openBound && <span className="sv-estimates__key-item"><i className="sv-estimates__key-line" data-open="" />Dashed: only this bound was published</span>}
          {beyondAxis && <span className="sv-estimates__key-item"><i className="sv-estimates__key-arrow" />Arrow: continues beyond the axis</span>}
          {nullValue !== null && <span className="sv-estimates__key-item"><i className="sv-estimates__key-null" />{nullLabel}</span>}
        </p>}
        {hasDetail && <RowDetailHint />}
        {!preview && rows.length > 8 && axisRow('top')}
        {rowGroups.map(group => (
          <Fragment key={group || 'all'}>
            {group && <h3 className="sv-estimates__group">{group}</h3>}
            <div className="sv-estimates__plot">
            {/* A gridline at every tick, drawn once behind all the rows and laid out
                like the axis, so a mark can be read against it from any row. */}
            <div className="sv-estimates__axis sv-estimates__gridlines" aria-hidden="true">
              <span className="sv-estimates__ticks">
                {scale.ticks.map((tick, i) => (
                  <span key={tick} className="sv-estimates__grid" data-edge={i === scale.ticks.length - 1 ? 'end' : undefined} style={{ left: `${scale.x(tick)}%` }} />
                ))}
                {scale.zero !== undefined && <span className="sv-estimates__null" style={{ left: `${scale.zero}%` }} />}
              </span>
            </div>
            <ol className="sv-estimates__rows">
              {rows
                .map((e, i) => ({ e, whisker: spans[i] }))
                .filter(({ e }) => switchGroups || (e.group ?? '') === group)
                .map(({ e, whisker }, i) => {
                  const crosses = crossesNull(bounds(e), nullValue);
                  const central = bounds(e).estimate;
                  const cells = (
                    <>
                      <span className="sv-estimates__label">{e.label}</span>
                      <span className="sv-estimates__value">
                        {rowValue(e)}
                        {crosses !== undefined && (
                          <span className="sv-visually-hidden">
                            {crosses ? `; interval includes ${nullText}` : `; interval excludes ${nullText}`}
                          </span>
                        )}
                      </span>
                      <span className="sv-estimates__track" aria-hidden="true">
                        {whisker && (
                          <span
                            className="sv-estimates__whisker"
                            data-start={whisker.start}
                            data-end={whisker.end}
                            style={{ left: `${whisker.left}%`, width: `${Math.max(0, whisker.right - whisker.left)}%` }}
                          />
                        )}
                        {central !== undefined && e.estimate !== undefined && (
                          <span
                            className="sv-estimates__dot"
                            data-beyond={scale.beyond(central)}
                            data-qualification={qualificationOf(e.estimate) === 'approximate' ? 'approximate' : undefined}
                            style={{ left: `${scale.x(central)}%` }}
                          />
                        )}
                      </span>
                    </>
                  );
                  const detail = preview ? undefined : detailFor(e);
                  return detail
                    ? <li key={`${e.label}-${i}`} data-row={e.label}><DetailRow rowClass="sv-estimates__row" summary={cells}>{detail}</DetailRow></li>
                    : <li key={`${e.label}-${i}`} className="sv-estimates__row" data-row={e.label}>{cells}</li>;
                })}
            </ol>
            </div>
          </Fragment>
        ))}
        {axisRow('bottom')}
      </div>
    );
  };
  const inGroup = (group: string) => estimates.filter(e => (e.group ?? '') === group);
  const graph = drawGraph(shownFirst === undefined ? estimates : inGroup(shownFirst));

  if (preview) return <ReportFigure id={id} title={title} subtitle={subtitle} preview={preview} className="sv-estimate-range">{graph}</ReportFigure>;

  const hasNote = estimates.some(e => e.note);
  const table = (
    <div className="sv-chart__table-scroll">
      <table className="sv-chart__table">
        <caption>{valueLabel}</caption>
        <thead>
          <tr>
            <th scope="col" className="sv-data__th-text">{itemLabel}</th>
            <th scope="col">Year</th>
            <th scope="col">Value</th>
            <th scope="col">Low</th>
            <th scope="col">High</th>
            {nullValue !== null && <th scope="col" className="sv-data__th-text">Includes {nullText}?</th>}
            {hasNote && <th scope="col" className="sv-data__th-text">Note</th>}
          </tr>
        </thead>
        <tbody>
          {estimates.map((e, i) => (
            <tr key={`${e.label}-${i}`}>
              <th scope="row">
                {e.group ? `${e.group}: ` : ''}
                {e.label}
                {e.sources && <SourceCredits sources={e.sources} />}
              </th>
              <td>{e.year ?? '—'}</td>
              <td>{e.asPublished ?? (e.estimate === undefined ? '—' : qualifiedText(e.estimate, signed))}</td>
              <td>{show(e.low)}</td>
              <td>{show(e.high)}</td>
              {nullValue !== null && <td className="sv-data__td-text">{yesNo(crossesNull(bounds(e), nullValue))}</td>}
              {hasNote && <td className="sv-data__td-text sv-data__td-long">{e.note ?? '—'}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <ReportFigure id={id} title={title} subtitle={subtitle} description={description} measure={valueLabel} sources={sources} note={note} footer={footer} panel={panel} className="sv-estimate-range">
      {shownFirst === undefined
        ? <ChartViewToggle label={title ?? valueLabel} graph={graph} table={table} />
        : <EstimateGroupSwitch label={title ?? valueLabel} groupLabel={groupLabel} defaultGroup={shownFirst} table={table} graphs={groups.map(group => ({ group, graph: drawGraph(inGroup(group)) }))} />}
    </ReportFigure>
  );
}

function yesNo(answer: boolean | undefined) {
  return answer === undefined ? '—' : answer ? 'Yes' : 'No';
}
