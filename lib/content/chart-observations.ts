import { isComponentFigure } from './types';
import type { Fact } from './types';

/**
 * The ids an `## Observations {#<fact>--observations-<id>}` or
 * `## Subtleties {#<fact>--subtleties-<id>}` group may name: every series
 * reading (the main series' and each additional series'), every comparison,
 * and — once the fact has `figures` — every component figure and placed
 * `section`. A group naming anything else is left where it is in the body.
 */
export function observationTargets(fact: Pick<Fact, 'series' | 'additionalSeries' | 'comparisons' | 'figures'>): string[] {
  return [
    ...(fact.series?.readings.map(r => r.id) ?? []),
    ...(fact.additionalSeries?.flatMap(s => s.readings.map(r => r.id)) ?? []),
    ...(fact.comparisons?.map(c => c.id) ?? []),
    ...(fact.figures ?? []).flatMap(f => (isComponentFigure(f) || f.kind === 'section' ? [f.id] : [])),
  ];
}

/**
 * A separate disclosure for a "not measured since" band: measurement stopped,
 * so the band has no date to mark on the chart as a measurement change has.
 * The key line under the plot links to it. It cites the band's own source
 * rather than the series'.
 */
export function methodChanges(
  factId: string,
  readingId: string,
  unmeasured?: { from: string; until: string; label: string; note: string; source: number },
  /** Where a source footnote leads: by default the fact's own source list. */
  sourceHref: (number: number) => string = number => `#source-${factId}-${number}`,
) {
  if (!unmeasured) return '';
  const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  const entry = (id: string, summary: string, note: string, source: number) => `<details class="sv-observation sv-method-observation" id="${escape(id)}"><summary>${escape(summary)}</summary><div class="sv-observation__body"><p>${escape(note)} <a href="${escape(sourceHref(source))}">[${source}]</a></p></div></details>`;
  const entries = entry(`${factId}--${readingId}-not-measured`, `${unmeasured.from}–${unmeasured.until}: ${unmeasured.label}`, unmeasured.note, unmeasured.source);
  return `<details class="sv-method-changes-group" id="${escape(factId)}--method-changes-${escape(readingId)}"><summary>Method Changes</summary>${entries}</details>`;
}
