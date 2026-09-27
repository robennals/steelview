'use client';
import { useState, type ReactNode } from 'react';
import type { Fact, Source } from '@/lib/content/types';

type Comparison = NonNullable<Fact['comparisons']>[number];

export function ComparisonChart({ fact, chart, sources, observations }: { fact: Fact; chart: Comparison; sources: Source[]; observations?: ReactNode }) {
  const [selected, setSelected] = useState(chart.defaultGroup ?? -1);
  const groupLabel = chart.groupLabel ?? 'group';
  const allGroupsLabel = chart.allGroupsLabel ?? 'All groups';
  const items = chart.groups ? chart.items.map(item => ({ ...item, value: selected < 0 ? item.value : item.values![selected] })).sort((a, b) => b.value - a.value) : chart.items;
  const min = Math.min(0, ...items.map(item => item.value));
  const max = Math.max(0, chart.domainMax ?? 0, ...items.map(item => item.value));
  const range = max - min || 1;
  const zero = -min / range * 100;
  const format = (value: number) => value > 0 && value < .01 ? `<0.01${chart.unit === 'percent' ? '%' : ''}` : `${value < 0 ? '−' : ''}${chart.unit === 'pounds' ? '£' : ''}${Math.abs(value).toLocaleString('en-GB', { maximumFractionDigits: 2 })}${chart.unit === 'percent' ? '%' : ''}`;
  const formatShare = (value: number) => chart.shareTotal ? `${(value / chart.shareTotal * 100).toLocaleString('en-GB', { maximumFractionDigits: 1 })}%` : null;
  return <figure className="sv-chart sv-comparison" id={`${fact.id}--chart-${chart.id}`}>
    <figcaption className="sv-chart__caption">
      <h2 className="sv-graph-heading">{chart.title}</h2>
      <p className="sv-chart__desc">{chart.description}</p>
    </figcaption>
    {chart.groups && <fieldset className="sv-comparison-controls"><legend>Compare by {groupLabel}</legend>
      {[...chart.groups, allGroupsLabel].map((label, index) => { const value = index === chart.groups!.length ? -1 : index; return <button type="button" key={label} aria-pressed={selected === value} onClick={() => setSelected(value)}>{label}</button>; })}
    </fieldset>}
    <p className="sv-chart__axis-label" aria-live="polite">{chart.groups ? `${selected < 0 ? allGroupsLabel : chart.groups[selected]} · ` : ''}{chart.valueLabel}</p>
    <ol className="sv-comparison__rows" data-dense={chart.items.length > 12 || undefined}>
      {items.map((item, index) => <li key={`${chart.id}-${index}`}>
        <div className="sv-comparison__label"><span>{item.label}</span><span>{format(item.value)}{formatShare(item.value) && <span className="sv-comparison__share"> · {formatShare(item.value)}</span>}</span></div>
        <div className="sv-comparison__track" aria-hidden="true">
          <span className="sv-comparison__zero" style={{ left: `${zero}%` }} />
          {chart.groups && selected < 0 ? item.values!.map((value, i) => <span key={i} className="sv-comparison__bar" style={{ background: `var(--sv-group-${i})`, left: `${item.values!.slice(0, i).reduce((a, b) => a + b, 0) / range * 100}%`, width: `${value / range * 100}%` }} />) : <span className="sv-comparison__bar" data-highlight={item.highlight || undefined} style={{ left: `${(Math.min(0, item.value) - min) / range * 100}%`, width: `${Math.abs(item.value) / range * 100}%` }} /> }
        </div>
      </li>)}
    </ol>
    {chart.groups && selected < 0 && <div className="sv-comparison-legend">{chart.groups.map((label, i) => <span key={label}><i style={{ background: `var(--sv-group-${i})` }} />{label}</span>)}</div>}
    {chart.groups && <details className="sv-chart__data"><summary>Show all breakdowns</summary><div className="sv-breakdown-table"><table><thead><tr><th>Country</th>{chart.groups.map(group => <th key={group}>{group}</th>)}<th>Total</th></tr></thead><tbody>{chart.items.map(item => <tr key={item.label}><th>{item.label}</th>{item.values!.map((value, i) => <td key={i}>{format(value)}</td>)}<td>{format(item.value)}</td></tr>)}</tbody></table></div></details>}
    <p className="sv-comparison__scale" aria-hidden="true"><span>{format(min)}</span><span>{format(max)}</span></p>
    <p className="sv-chart__credit">Source: {chart.sources.map((n, i) => <span key={n}>{i > 0 && '; '}<a href={`#source-${fact.id}-${n}`}>{sources[n - 1].publisher} [{n}]</a></span>)}</p>
    {observations}
    {chart.note && <details className="sv-chart__methodology"><summary>About this data</summary><p>{chart.note}</p></details>}
  </figure>;
}
