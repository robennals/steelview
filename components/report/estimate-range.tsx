import { Fragment, type ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { crossesNull, estimateScale, whiskerSpan } from './estimate-layout';
import { ReportFigure, SourceCredits } from './figure';
import { formatValue } from './format';
import { COMPACT_PREVIEW_ITEMS } from './ranked-columns';
import type { FigurePreview, SourceCredit, ValueFormat } from './types';

export type Estimate = {
  /** The study or model: "Dustmann, Frattini & Preston". */
  label: string;
  year?: number | string;
  /** The central estimate. Omit for a source that publishes only a range: no dot is drawn. */
  estimate?: number;
  /**
   * Lower and upper bounds of the reported interval (state which interval in
   * `intervalLabel`). Omit `high` for "at least …" and `low` for "at most …":
   * the line then runs to that end of the axis with an arrowhead. At least one
   * of `estimate`, `low` and `high` is required.
   */
  low?: number;
  high?: number;
  /** Rows sharing a group are set under one subheading, in first-appearance order. */
  group?: string;
  note?: string;
  /** The estimate in the source's own words, shown in the table's Estimate column: "$25–35bn". */
  asPublished?: string;
  /** This estimate's own sources, printed after its label. */
  sources?: SourceCredit[];
};

export type EstimateRangeProps = {
  estimates: Estimate[];
  format?: ValueFormat;
  /** What each estimate measures: "Effect on wages of the lowest-paid, % per 1pp rise in migrant share". */
  valueLabel: string;
  /** Which interval the whiskers show: "95% confidence interval". Said on the figure, because 90% and 95% intervals are not interchangeable. */
  intervalLabel?: string;
  /**
   * The value meaning "no effect". Defaults to 0; use 1 for ratios. `null` for
   * estimates with no natural reference, such as costs: no reference line,
   * no "Includes …?" column, and values are not signed.
   */
  nullValue?: number | null;
  nullLabel?: string;
  /** Fix the axis, e.g. to keep two figures comparable. Values outside are clipped and marked. */
  domain?: [number, number];
  id?: string;
  title?: string;
  description?: ReactNode;
  sources?: SourceCredit[];
  note?: ReactNode;
  /** Rendered after the source line and before "About this data": the figure's Observations. */
  footer?: ReactNode;
  /** Drawn in a data panel: filling the panel, its description and note folded into one line. */
  panel?: boolean;
  /**
   * Draw the compact preview: the linked title, every estimate and the axis.
   * The key, value label, per-row notes and sources stay on the full figure.
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
 */
export function EstimateRange({
  estimates,
  format = { unit: 'number', decimals: 2 },
  valueLabel,
  intervalLabel = 'Interval',
  nullValue = 0,
  nullLabel = 'No effect',
  domain,
  id,
  title,
  description,
  sources,
  note,
  footer,
  panel,
  preview,
}: EstimateRangeProps) {
  const scale = estimateScale(estimates, nullValue, domain);
  // Signs say which side of "no effect" a value is on; with no such value they say nothing.
  const signed: ValueFormat = nullValue === null ? format : { ...format, signed: true };
  const groups = [...new Set(estimates.map(e => e.group ?? ''))];
  const show = (value: number | undefined) => (value === undefined ? '—' : formatValue(value, signed));
  const rangeText = (e: Estimate) => {
    const interval =
      e.low !== undefined && e.high !== undefined ? `${show(e.low)} to ${show(e.high)}`
        : e.low !== undefined ? `at least ${show(e.low)}`
          : e.high !== undefined ? `at most ${show(e.high)}`
            : undefined;
    if (e.estimate === undefined) return interval ?? '';
    return interval ? `${show(e.estimate)} (${interval})` : show(e.estimate);
  };
  const rangeOnly = estimates.some(e => e.estimate === undefined);
  const nullText = nullLabel.toLowerCase();

  const graph = (
    <div className="sv-estimates" data-compact={(preview && estimates.length > COMPACT_PREVIEW_ITEMS) || undefined}>
      {!preview && <p className="sv-estimates__key" aria-hidden="true">
        <span className="sv-estimates__key-item"><i className="sv-estimates__key-dot" />Central estimate</span>
        <span className="sv-estimates__key-item"><i className="sv-estimates__key-line" />{intervalLabel}</span>
        {rangeOnly && <span className="sv-estimates__key-item"><i className="sv-estimates__key-line" />Range only: no dot where no central estimate was published</span>}
        {nullValue !== null && <span className="sv-estimates__key-item"><i className="sv-estimates__key-null" />{nullLabel}</span>}
      </p>}
      {groups.map(group => (
        <Fragment key={group || 'all'}>
          {group && <h3 className="sv-estimates__group">{group}</h3>}
          <ol className="sv-estimates__rows">
            {estimates
              .filter(e => (e.group ?? '') === group)
              .map((e, i) => {
                const whisker = whiskerSpan(e, scale.x);
                const crosses = crossesNull(e, nullValue);
                return (
                  <li key={`${e.label}-${i}`} className="sv-estimates__row">
                    <span className="sv-estimates__label">
                      <span className="sv-estimates__name">
                        {e.label}
                        {e.year !== undefined && <span className="sv-estimates__year"> {e.year}</span>}
                        {e.sources && !preview && <SourceCredits sources={e.sources} />}
                      </span>
                      <span className="sv-estimates__value">
                        {rangeText(e)}
                        {crosses !== undefined && (
                          <span className="sv-visually-hidden">
                            {crosses ? `; interval includes ${nullText}` : `; interval excludes ${nullText}`}
                          </span>
                        )}
                      </span>
                      {e.note && !preview && <span className="sv-estimates__note">{e.note}</span>}
                    </span>
                    <span className="sv-estimates__track" aria-hidden="true">
                      {scale.zero !== undefined && <span className="sv-estimates__null" style={{ left: `${scale.zero}%` }} />}
                      {whisker && (
                        <span
                          className="sv-estimates__whisker"
                          data-clip-start={whisker.openStart || (domain && e.low !== undefined && e.low < domain[0]) ? '' : undefined}
                          data-clip-end={whisker.openEnd || (domain && e.high !== undefined && e.high > domain[1]) ? '' : undefined}
                          style={{ left: `${whisker.left}%`, width: `${Math.max(0, whisker.right - whisker.left)}%` }}
                        />
                      )}
                      {e.estimate !== undefined && <span className="sv-estimates__dot" style={{ left: `${scale.x(e.estimate)}%` }} />}
                    </span>
                  </li>
                );
              })}
          </ol>
        </Fragment>
      ))}
      <div className="sv-estimates__axis" aria-hidden="true">
        <span className="sv-estimates__ticks">
          {scale.ticks.map((tick, i) => (
            <span
              key={tick}
              className="sv-bars__tick"
              data-edge={i === 0 ? 'start' : i === scale.ticks.length - 1 ? 'end' : undefined}
              style={{ left: `${scale.x(tick)}%` }}
            >
              {formatValue(tick, tick === nullValue ? format : signed)}
            </span>
          ))}
        </span>
      </div>
    </div>
  );

  if (preview) return <ReportFigure id={id} title={title} preview={preview} className="sv-estimate-range">{graph}</ReportFigure>;

  const table = (
    <div className="sv-chart__table-scroll">
      <table className="sv-chart__table">
        <caption>{valueLabel}</caption>
        <thead>
          <tr>
            <th scope="col" className="sv-data__th-text">Study</th>
            <th scope="col">Year</th>
            <th scope="col">Estimate</th>
            <th scope="col">Low</th>
            <th scope="col">High</th>
            {nullValue !== null && <th scope="col" className="sv-data__th-text">Includes {nullText}?</th>}
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
              <td>{e.asPublished ?? show(e.estimate)}</td>
              <td>{show(e.low)}</td>
              <td>{show(e.high)}</td>
              {nullValue !== null && <td className="sv-data__td-text">{yesNo(crossesNull(e, nullValue))}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} footer={footer} panel={panel} className="sv-estimate-range">
      <p className="sv-chart__axis-label">{valueLabel}</p>
      <ChartViewToggle label={title ?? valueLabel} graph={graph} table={table} />
    </ReportFigure>
  );
}

function yesNo(answer: boolean | undefined) {
  return answer === undefined ? '—' : answer ? 'Yes' : 'No';
}
