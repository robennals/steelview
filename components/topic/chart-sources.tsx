import { factSources, sourcesSummary } from '@/lib/content/sources';
import type { Fact } from '@/lib/content/types';

type ChartSourcesProps = {
  fact: Fact;
  /** The fact's numbered sources this chart lists. */
  numbers: number[];
  /** Those whose `#source-<fact>-<n>` address lands here without script: one chart's, on a report's own page. */
  anchored?: number[];
};

/**
 * A chart's sources as one line, "Sources: Home Office, ONS and 2 more", which
 * opens to each source in full. Every source a reader can reach is on the row of
 * a chart that cites it; `data-source-id` is how a `#source-` link finds it.
 */
export function ChartSources({ fact, numbers, anchored = [] }: ChartSourcesProps) {
  const sources = factSources(fact);
  const shown = numbers.flatMap(number => (sources[number - 1] ? [{ number, source: sources[number - 1] }] : []));
  if (shown.length === 0) return null;
  const { label, names, more } = sourcesSummary(shown.map(({ source }) => source));
  return (
    <details className="sv-chart__sources">
      <summary>
        <span className="sv-chart__sources-label">{label}:</span>
        <span className="sv-chart__sources-names">{names}</span>
        {more > 0 && <span className="sv-chart__sources-more">and {more} more</span>}
        <span className="sv-chart__sources-toggle" aria-hidden="true" />
      </summary>
      <ol>
        {shown.map(({ number, source }) => {
          const address = `source-${fact.id}-${number}`;
          return (
            <li key={number} className="sv-source" value={number} id={anchored.includes(number) ? address : undefined} data-source-id={address}>
              <a href={source.url} target="_blank" rel="noreferrer noopener">{source.title}</a>
              <p>{source.publisher}, {source.date} · {source.stance}</p>
              <blockquote cite={source.url}>{source.quote}</blockquote>
            </li>
          );
        })}
      </ol>
    </details>
  );
}
