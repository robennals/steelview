/** Move explicitly addressed observation groups beside their graphs. */
export function chartObservations(html: string, factId: string, chartIds: string[]) {
  const observations: Record<string, string> = {};
  const subtleties: Record<string, string> = {};
  const bodyHtml = html.replace(/<h2\b[^>]*>[\s\S]*?(?=<h2\b|$)/g, section => {
    const id = section.match(/^<h2\b[^>]*\bid="([^"]+)"/)?.[1];
    const kind = id?.startsWith(`${factId}--subtleties-`) ? "subtleties" : "observations";
    const chartId = chartIds.find(key => id === `${factId}--${kind}-${key}`);
    if (!chartId) return section;

    const content = section.replace(/^<h2\b[^>]*>[\s\S]*?<\/h2>/, '');
    const number = (content.match(/<summary>/g) ?? []).length;
    if (kind === "subtleties") {
      subtleties[chartId] = `<details class="sv-subtleties-group" id="${id}"><summary>Subtleties</summary>${content}</details>`;
      return "";
    }
    observations[chartId] = `<details class="sv-observations-group" id="${id}"><summary>Observations <span class="sv-observations-count">${number}</span></summary>${content}</details>`;
    return '';
  });
  return { observations, subtleties, bodyHtml };
}

/**
 * A separate disclosure for the methods used by each graph. A "not measured
 * since" band is a change in measurement too — it stopped — so it gets an
 * entry here, which the key line under the plot links to, citing its own
 * source rather than the series'.
 */
export function methodChanges(
  factId: string,
  readingId: string,
  breaks: { period: string; label: string; note: string }[],
  sourceNumber: number,
  unmeasured?: { from: string; until: string; label: string; note: string; source: number }
) {
  if (!breaks.length && !unmeasured) return '';
  const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  const entry = (id: string, summary: string, note: string, source: number) => `<details class="sv-observation sv-method-observation" id="${escape(id)}"><summary>${escape(summary)}</summary><div class="sv-observation__body"><p>${escape(note)} <a href="#source-${escape(factId)}-${source}">[${source}]</a></p></div></details>`;
  const entries = breaks.map((gap) => entry(`${factId}--${readingId}-method-${gap.period}`, `${gap.period}: ${gap.label}`, gap.note, sourceNumber)).join('')
    + (unmeasured ? entry(`${factId}--${readingId}-not-measured`, `${unmeasured.from}–${unmeasured.until}: ${unmeasured.label}`, unmeasured.note, unmeasured.source) : '');
  return `<details class="sv-method-changes-group" id="${escape(factId)}--method-changes-${escape(readingId)}"><summary>Method Changes</summary>${entries}</details>`;
}
