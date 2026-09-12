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

/** A separate disclosure for the methods used by each graph. */
export function methodChanges(factId: string, readingId: string, breaks: { period: string; label: string; note: string }[], sourceNumber: number) {
  if (!breaks.length) return '';
  const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  const entries = breaks.map((gap) => `<details class="sv-observation sv-method-observation" id="${escape(factId)}--${escape(readingId)}-method-${escape(gap.period)}"><summary>${escape(gap.period)}: ${escape(gap.label)}</summary><div class="sv-observation__body"><p>${escape(gap.note)} <a href="#source-${escape(factId)}-${sourceNumber}">[${sourceNumber}]</a></p></div></details>`).join('');
  return `<details class="sv-method-changes-group" id="${escape(factId)}--method-changes-${escape(readingId)}"><summary>Method Changes</summary>${entries}</details>`;
}
