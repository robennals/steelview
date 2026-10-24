import type { ReactNode } from 'react';
import { ChartViewToggle } from '@/components/topic/chart-view-toggle';
import { tickLabels } from './bar-layout';
import { formatDate, formatValue } from './format';
import { layoutPanels, type PanelInput } from './small-multiples-layout';
import type { SourceCredit, ValueFormat } from './types';
import { ReportFigure } from './figure';

export type { PanelInput as SmallMultiplesPanel, PanelPoint as SmallMultiplesPoint } from './small-multiples-layout';

export type SmallMultiplesProps = {
  panels: PanelInput[];
  format?: ValueFormat;
  /** What every line measures: "Long-term immigrants, year ending December". */
  valueLabel: string;
  /** Header for the period column in the table view. Defaults to "Period". */
  periodLabel?: string;
  /**
   * Give each panel its own y-scale. Off by default: shared scales are what
   * make panels comparable. Turn it on only when the text is about shape,
   * not size — and the figure says so in its description.
   */
  independentScales?: boolean;
  /** Start every y-axis at zero (default). Turn off only for measures where zero is meaningless, such as an index. */
  zeroBased?: boolean;
  id?: string;
  title?: string;
  description?: ReactNode;
  sources?: SourceCredit[];
  note?: ReactNode;
};

/**
 * One small line chart per category, all on the same time range and — by
 * default — the same value scale, so the eye compares honestly across a
 * grid instead of untangling seven lines on one plot. Each panel names its
 * category and prints its latest value, so nothing depends on reading a
 * tiny axis.
 *
 * Text is HTML around a stretched SVG line, not SVG text: panels change
 * width with the grid, and HTML type stays the same size while a viewBox
 * would scale it.
 */
export function SmallMultiples({
  panels,
  format,
  valueLabel,
  periodLabel = 'Period',
  independentScales = false,
  zeroBased = true,
  id,
  title,
  description,
  sources,
  note,
}: SmallMultiplesProps) {
  const layout = layoutPanels(panels, { independentScales, zeroBased });
  const first = layout.periods[0];
  const last = layout.periods.at(-1);

  const graph = (
    <ul className="sv-multiples__grid">
      {layout.panels.map((panel, index) => {
        const source = panels[index];
        const latest = panel.last?.point;
        return (
          <li key={panel.name} className="sv-multiples__panel">
            <h3 className="sv-multiples__name">{panel.name}</h3>
            <p className="sv-multiples__latest">
              {latest ? (
                <>
                  <span className="sv-multiples__latest-value">{formatValue(latest.value, format)}</span>{' '}
                  <span className="sv-multiples__latest-period">in {formatDate(latest.period)}</span>
                </>
              ) : (
                'No data'
              )}
            </p>
            <div
              className="sv-multiples__plot"
              role="img"
              aria-label={`${panel.name}: ${source.points.map(p => `${formatDate(p.period)} ${formatValue(p.value, format)}`).join(', ')}`}
            >
              {tickLabels(panel.ticks.map(t => t.value), format).map((tick, i) => (
                <span key={tick.value} className="sv-multiples__tick" style={{ top: `${panel.ticks[i].y}%` }} aria-hidden="true">
                  {tick.label !== null && <span className="sv-multiples__tick-label">{tick.label}</span>}
                </span>
              ))}
              <svg className="sv-multiples__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <path className="sv-multiples__line" d={panel.path} vectorEffect="non-scaling-stroke" />
              </svg>
              {panel.last && (
                <span className="sv-multiples__end" style={{ left: `${panel.last.x}%`, top: `${panel.last.y}%` }} aria-hidden="true" />
              )}
            </div>
            <p className="sv-multiples__range" aria-hidden="true">
              <span>{first && formatDate(first)}</span>
              <span>{last && formatDate(last)}</span>
            </p>
          </li>
        );
      })}
    </ul>
  );

  const byPanel = panels.map(panel => new Map(panel.points.map(point => [point.period, point.value])));
  const table = (
    <div className="sv-chart__table-scroll">
      <table className="sv-chart__table">
        <caption>{title ? `${title}: ${valueLabel}` : valueLabel}</caption>
        <thead>
          <tr>
            <th scope="col" className="sv-data__th-text">{periodLabel}</th>
            {panels.map(panel => <th key={panel.name} scope="col">{panel.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {layout.periods.map(period => (
            <tr key={period}>
              <th scope="row">{formatDate(period)}</th>
              {byPanel.map((values, i) => {
                const value = values.get(period);
                return <td key={panels[i].name}>{value === undefined ? '—' : formatValue(value, format)}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} className="sv-multiples">
      <p className="sv-chart__axis-label">
        {valueLabel}
        {independentScales ? ' · each panel has its own scale' : ' · all panels share one scale'}
      </p>
      <ChartViewToggle label={title ?? valueLabel} graph={graph} table={table} />
    </ReportFigure>
  );
}
