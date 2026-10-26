import { Fragment, type ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { crossesNull, estimateScale } from './estimate-layout';
import { ReportFigure } from './figure';
import { formatValue } from './format';
import type { SourceCredit, ValueFormat } from './types';

export type Estimate = {
  /** The study or model: "Dustmann, Frattini & Preston". */
  label: string;
  year?: number | string;
  estimate: number;
  /** Lower and upper bounds of the reported interval (state which interval in `intervalLabel`). */
  low: number;
  high: number;
  /** Rows sharing a group are set under one subheading, in first-appearance order. */
  group?: string;
  note?: string;
};

export type EstimateRangeProps = {
  estimates: Estimate[];
  format?: ValueFormat;
  /** What each estimate measures: "Effect on wages of the lowest-paid, % per 1pp rise in migrant share". */
  valueLabel: string;
  /** Which interval the whiskers show: "95% confidence interval". Said on the figure, because 90% and 95% intervals are not interchangeable. */
  intervalLabel?: string;
  /** The value meaning "no effect". Defaults to 0; use 1 for ratios. */
  nullValue?: number;
  nullLabel?: string;
  /** Fix the axis, e.g. to keep two figures comparable. Values outside are clipped and marked. */
  domain?: [number, number];
  id?: string;
  title?: string;
  description?: ReactNode;
  sources?: SourceCredit[];
  note?: ReactNode;
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
}: EstimateRangeProps) {
  const scale = estimateScale(estimates, nullValue, domain);
  const signed: ValueFormat = { ...format, signed: true };
  const groups = [...new Set(estimates.map(e => e.group ?? ''))];
  const rangeText = (e: Estimate) => `${formatValue(e.estimate, signed)} (${formatValue(e.low, signed)} to ${formatValue(e.high, signed)})`;

  const graph = (
    <div className="sv-estimates">
      <p className="sv-estimates__key" aria-hidden="true">
        <span className="sv-estimates__key-item"><i className="sv-estimates__key-dot" />Central estimate</span>
        <span className="sv-estimates__key-item"><i className="sv-estimates__key-line" />{intervalLabel}</span>
        <span className="sv-estimates__key-item"><i className="sv-estimates__key-null" />{nullLabel}</span>
      </p>
      {groups.map(group => (
        <Fragment key={group || 'all'}>
          {group && <h3 className="sv-estimates__group">{group}</h3>}
          <ol className="sv-estimates__rows">
            {estimates
              .filter(e => (e.group ?? '') === group)
              .map((e, i) => {
                const low = scale.x(e.low);
                const high = scale.x(e.high);
                return (
                  <li key={`${e.label}-${i}`} className="sv-estimates__row">
                    <span className="sv-estimates__label">
                      <span className="sv-estimates__name">
                        {e.label}
                        {e.year !== undefined && <span className="sv-estimates__year"> {e.year}</span>}
                      </span>
                      <span className="sv-estimates__value">
                        {rangeText(e)}
                        <span className="sv-visually-hidden">
                          {crossesNull(e, nullValue) ? `; interval includes ${nullLabel.toLowerCase()}` : `; interval excludes ${nullLabel.toLowerCase()}`}
                        </span>
                      </span>
                      {e.note && <span className="sv-estimates__note">{e.note}</span>}
                    </span>
                    <span className="sv-estimates__track" aria-hidden="true">
                      <span className="sv-estimates__null" style={{ left: `${scale.zero}%` }} />
                      <span
                        className="sv-estimates__whisker"
                        data-clip-start={domain && e.low < domain[0] ? '' : undefined}
                        data-clip-end={domain && e.high > domain[1] ? '' : undefined}
                        style={{ left: `${low}%`, width: `${Math.max(0, high - low)}%` }}
                      />
                      <span className="sv-estimates__dot" style={{ left: `${scale.x(e.estimate)}%` }} />
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
            <th scope="col" className="sv-data__th-text">Includes {nullLabel.toLowerCase()}?</th>
          </tr>
        </thead>
        <tbody>
          {estimates.map((e, i) => (
            <tr key={`${e.label}-${i}`}>
              <th scope="row">
                {e.group ? `${e.group}: ` : ''}
                {e.label}
              </th>
              <td>{e.year ?? '—'}</td>
              <td>{formatValue(e.estimate, signed)}</td>
              <td>{formatValue(e.low, signed)}</td>
              <td>{formatValue(e.high, signed)}</td>
              <td className="sv-data__td-text">{crossesNull(e, nullValue) ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} className="sv-estimate-range">
      <p className="sv-chart__axis-label">{valueLabel}</p>
      <ChartViewToggle label={title ?? valueLabel} graph={graph} table={table} />
    </ReportFigure>
  );
}
