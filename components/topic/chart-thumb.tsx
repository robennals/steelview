import type { Fact } from '@/lib/content/types';
import { layoutReading, pathFor, seriesStrokeDash } from '@/lib/chart/series-chart';

/**
 * A chart's silhouette, for a collapsed home-page row: the shape of the data
 * with no axes or text. It is decoration beside the chart's label — the chart
 * itself, with its years, readings and source, is one click away — so it is
 * hidden from assistive technology.
 *
 * A series reading is drawn from the same layout as `SeriesChart`'s narrow plot,
 * cropped to the plot area; a comparison as one column per item, every item.
 */
export function ChartThumb({ fact, chart, reading }: { fact: Fact; chart: string; reading?: string }) {
  const series = chart === 'series' ? fact.series : fact.additionalSeries?.find(s => s.id === chart);
  if (series) {
    const layout = layoutReading(series, series.readings.find(r => r.id === reading) ?? series.readings[0], 'narrow');
    const g = layout.geometry;
    return (
      <svg className="sv-thumb" viewBox={`${g.left} ${g.top} ${g.plotWidth} ${g.plotHeight}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {layout.lines.flatMap(line => line.runs.map((run, i) => (
          <path key={`${line.name}-${i}`} d={pathFor(run.points)} fill="none" stroke={`var(--sv-series-${line.slot})`} strokeWidth="2" strokeDasharray={seriesStrokeDash(line.slot)} vectorEffect="non-scaling-stroke" />
        )))}
      </svg>
    );
  }
  const comparison = fact.comparisons?.find(c => c.id === chart);
  if (!comparison) return null;
  const max = Math.max(...comparison.items.map(item => Math.abs(item.value))) || 1;
  return (
    <div className="sv-thumb sv-thumb--columns" aria-hidden="true">
      {comparison.items.map((item, i) => (
        <span key={i} className="sv-thumb__column" data-highlight={item.highlight || undefined} style={{ height: `${Math.abs(item.value) / max * 100}%` }} />
      ))}
    </div>
  );
}
