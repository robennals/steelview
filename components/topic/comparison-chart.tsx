'use client';
import { useState, type ReactNode } from 'react';
import { aboutThisDataNote } from '@/lib/content/figure-text';
import type { Fact, Source } from '@/lib/content/types';
import { ChartAbout } from '@/components/report/chart-about';
import { ObservationBar } from './observation-bar';
import { PanelSources } from './sources-slot';
import { COMPACT_PREVIEW_ITEMS, RankedColumns, fitsRankedColumns } from '@/components/report/ranked-columns';
import { DetailRow, RowDetailHint } from '@/components/report/row-detail';
import type { PreviewFit } from '@/lib/chart/series-chart';

type Comparison = NonNullable<Fact['comparisons']>[number];

/** How a compact preview is drawn, and where its title leads. */
export type ChartPreview = {
  /** Where the title links. Without one the title is plain text, as in a step whose whole chart is clickable. */
  href?: string;
  /** For a series, the one reading to draw (default: the first). */
  reading?: string;
  /** For a series, the shape of the space it sits in (default: wide, as a carousel slide is). */
  fit?: PreviewFit;
};

/**
 * Only the fact's id is used. Passing just that keeps a fact's body and other
 * charts out of the payload sent to the browser for this client component.
 */
export function ComparisonChart({ fact, chart, sources, observations, preview, panel }: {
  fact: Pick<Fact, 'id'>;
  chart: Comparison;
  sources: Source[];
  observations?: ReactNode;
  preview?: ChartPreview;
  /** Drawn in a data panel, with its sources row in place of the source credit. */
  panel?: boolean;
}) {
  const [selected, setSelected] = useState(chart.defaultGroup ?? -1);
  const groupLabel = chart.groupLabel ?? 'group';
  const allGroupsLabel = chart.allGroupsLabel ?? 'All groups';
  const items = chart.groups ? chart.items.map(item => ({ ...item, value: selected < 0 ? item.value : item.values![selected] })).sort((a, b) => b.value - a.value) : chart.items;
  const min = Math.min(0, ...items.map(item => item.value));
  const max = Math.max(0, chart.domainMax ?? 0, ...items.map(item => item.value));
  const range = max - min || 1;
  const zero = -min / range * 100;
  const format = (value: number) => value > 0 && value < .01 ? `<0.01${chart.unit === 'percent' ? '%' : ''}` : `${value < 0 ? '−' : ''}${chart.unit === 'pounds' ? '£' : ''}${Math.abs(value).toLocaleString('en-GB', { maximumFractionDigits: 2 })}${chart.unit === 'percent' ? '%' : ''}`;
  const aboutText = aboutThisDataNote(chart);
  const formatShare = (value: number) => chart.shareTotal ? `${(value / chart.shareTotal * 100).toLocaleString('en-GB', { maximumFractionDigits: 1 })}%` : null;
  const at = (hash: string) => `${preview?.href ?? ''}#${hash}`;
  const Heading = preview ? 'h3' : 'h2';
  // A long preview becomes one thin column per item, ranked from highest,
  // unless it has a group breakdown to show (see fitsRankedColumns).
  const columns = Boolean(preview) && !chart.groups && fitsRankedColumns(items);
  const hasDetail = chart.items.some(item => item.detail);
  return <figure className="sv-chart sv-comparison" id={`${fact.id}--chart-${chart.id}`} data-preview={preview ? true : undefined} data-panel-chart={panel ? true : undefined}>
    <figcaption className="sv-chart__caption">
      <Heading className="sv-graph-heading">{preview?.href ? <a href={preview.href}>{chart.title}</a> : chart.title}</Heading>
      {!preview && (panel
        ? <ChartAbout description={chart.description}>{aboutText && <p>{aboutText}</p>}</ChartAbout>
        : <p className="sv-chart__desc">{chart.description}</p>)}
    </figcaption>
    {panel && <ObservationBar />}
    {chart.groups && !preview && <fieldset className="sv-comparison-controls"><legend>Compare by {groupLabel}</legend>
      {[...chart.groups, allGroupsLabel].map((label, index) => { const value = index === chart.groups!.length ? -1 : index; return <button type="button" key={label} aria-pressed={selected === value} onClick={() => setSelected(value)}>{label}</button>; })}
    </fieldset>}
    {!preview && <p className="sv-chart__axis-label" aria-live="polite">{chart.groups ? `${selected < 0 ? allGroupsLabel : chart.groups[selected]} · ` : ''}{chart.valueLabel}</p>}
    {!preview && hasDetail && <RowDetailHint />}
    {columns ? <RankedColumns items={items} max={max} format={format} />
     : <ol className="sv-comparison__rows" data-dense={preview || chart.items.length > 12 || undefined} data-compact={(preview && items.length > COMPACT_PREVIEW_ITEMS) || undefined} style={{ '--sv-row-count': items.length }}>
      {items.map((item, index) => {
        const cells = <>
          <span className="sv-comparison__label"><span title={preview ? item.label : undefined}>{item.label}</span><span>{format(item.value)}{formatShare(item.value) && <span className="sv-comparison__share"> · {formatShare(item.value)}</span>}</span></span>
          <span className="sv-comparison__track" aria-hidden="true">
            <span className="sv-comparison__zero" style={{ left: `${zero}%` }} />
            {chart.groups && selected < 0 ? item.values!.map((value, i) => <span key={i} className="sv-comparison__bar" style={{ background: `var(--sv-group-${i})`, left: `${item.values!.slice(0, i).reduce((a, b) => a + b, 0) / range * 100}%`, width: `${value / range * 100}%` }} />) : <span className="sv-comparison__bar" data-highlight={item.highlight || undefined} style={{ left: `${(Math.min(0, item.value) - min) / range * 100}%`, width: `${Math.abs(item.value) / range * 100}%` }} /> }
          </span>
        </>;
        return item.detail && !preview
          ? <li key={`${chart.id}-${index}`} data-row={item.label}><DetailRow rowClass="sv-comparison__row" summary={cells}>{item.detail}</DetailRow></li>
          : <li key={`${chart.id}-${index}`} className="sv-comparison__row" data-row={item.label}>{cells}</li>;
      })}
    </ol>}
    {chart.groups && selected < 0 && <div className="sv-comparison-legend">{chart.groups.map((label, i) => <span key={label}><i style={{ background: `var(--sv-group-${i})` }} />{label}</span>)}</div>}
    {chart.groups && !preview && <details className="sv-chart__data"><summary>Show all breakdowns</summary><div className="sv-breakdown-table"><table><caption>{chart.title}, by {groupLabel}</caption><thead><tr><th scope="col">{chart.itemLabel ?? 'Category'}</th>{chart.groups.map(group => <th key={group}>{group}</th>)}<th>Total</th>{hasDetail && <th>Detail</th>}</tr></thead><tbody>{chart.items.map(item => <tr key={item.label}><th>{item.label}</th>{item.values!.map((value, i) => <td key={i}>{format(value)}</td>)}<td>{format(item.value)}</td>{hasDetail && <td>{item.detail ?? '—'}</td>}</tr>)}</tbody></table></div></details>}
    {!preview && <p className="sv-comparison__scale" aria-hidden="true"><span>{format(min)}</span><span>{format(max)}</span></p>}
    {panel ? <PanelSources /> : !preview && <p className="sv-chart__credit">Source: {chart.sources.map((n, i) => <span key={n}>{i > 0 && '; '}<a href={at(`source-${fact.id}-${n}`)}>{sources[n - 1].publisher} [{n}]</a></span>)}</p>}
    {observations}
    {aboutText && !preview && !panel && <details className="sv-chart__methodology"><summary>About this data</summary><p>{aboutText}</p></details>}
  </figure>;
}
