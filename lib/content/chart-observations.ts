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
 * Move explicitly addressed observation groups beside their graphs. A chart's
 * More text (`## More {#<fact>--more-<id>}`) goes with its Subtleties, a
 * disclosure of its own.
 */
export function chartObservations(html: string, factId: string, chartIds: string[]) {
  const observations: Record<string, string> = {};
  const subtleties: Record<string, string> = {};
  const bodyHtml = html.replace(/<h2\b[^>]*>[\s\S]*?(?=<h2\b|$)/g, section => {
    const id = section.match(/^<h2\b[^>]*\bid="([^"]+)"/)?.[1];
    const kind = (['subtleties', 'more'] as const).find(group => id?.startsWith(`${factId}--${group}-`)) ?? 'observations';
    const chartId = chartIds.find(key => id === `${factId}--${kind}-${key}`);
    if (!chartId) return section;

    const content = section.replace(/^<h2\b[^>]*>[\s\S]*?<\/h2>/, '');
    const number = (content.match(/<summary>/g) ?? []).length;
    if (kind !== 'observations') {
      subtleties[chartId] = `${subtleties[chartId] ?? ''}<details class="sv-subtleties-group" id="${id}"><summary>${kind === 'more' ? 'More' : 'Subtleties'}</summary>${content}</details>`;
      return '';
    }
    observations[chartId] = `<details class="sv-observations-group" id="${id}"><summary>Observations <span class="sv-observations-count">${number}</span></summary>${content}</details>`;
    return '';
  });
  return { observations, subtleties, bodyHtml };
}

/**
 * Pull the h2 and h3 sections whose id is `<fact>--<id>` out of the body,
 * keyed by id, so a `section` figure can place prose between two figures.
 *
 * An h3 with an id is already a `<section>` holding its content up to the
 * next h1–h3 (rehypeEvidenceSections), so it moves whole. The h3s go first:
 * one placed on its own leaves its h2, which may be placed too, behind.
 */
export function bodySections(html: string, factId: string, ids: string[]): { sections: Record<string, string>; bodyHtml: string } {
  const sections: Record<string, string> = {};
  const keyOf = (id: string | undefined) => ids.find(key => id === `${factId}--${key}`);
  const withoutH3s = html.replace(/<section\b[^>]*\bid="([^"]+)"[^>]*>[\s\S]*?<\/section>/g, (section, id: string) => {
    const key = keyOf(id);
    if (!key) return section;
    sections[key] = section;
    return '';
  });
  const bodyHtml = withoutH3s.replace(/<h2\b[^>]*>[\s\S]*?(?=<h2\b|$)/g, section => {
    const key = keyOf(section.match(/^<h2\b[^>]*\bid="([^"]+)"/)?.[1]);
    if (!key) return section;
    sections[key] = section;
    return '';
  });
  return { sections, bodyHtml };
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
