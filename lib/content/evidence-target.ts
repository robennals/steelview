/**
 * Turn a data panel to the step `id` names or holds, at once, and return that
 * step. The panel's scroll position is what says which step is showing. A
 * source sits on every chart that cites it, so one the reader's chart cites
 * stays on that chart.
 */
export function showPanelStep(root: Element, id: string): HTMLElement | null {
  const target = CSS.escape(id);
  const slides = Array.from(root.querySelectorAll(`[data-observation="${target}"], [data-chart-anchor="${target}"], [data-source-id="${target}"], [id="${target}"]`))
    .flatMap(found => found.closest<HTMLElement>('.sv-walk__slide') ?? []);
  const strip = slides[0]?.parentElement;
  if (!strip) return null;
  const index = (slide: HTMLElement) => Array.from(strip.children).indexOf(slide);
  const showing = Math.round(strip.scrollLeft / strip.clientWidth);
  const slide = slides.find(candidate => index(candidate) === showing) ?? slides[0];
  strip.scrollLeft = index(slide) * strip.clientWidth;
  return slide;
}

/** Reveal a linked section of a report's own page. */
export function revealEvidence(root: HTMLElement, hash: string): boolean {
  let id: string;
  try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return false; }
  root.querySelectorAll('.sv-target').forEach(el => el.classList.remove('sv-target'));
  if (!id) return true;
  // The data panel's step, and the panel brought into view whole, since a
  // chart and its observations are read together.
  const step = showPanelStep(root, id);
  const panel = step?.closest('.sv-walk');
  panel?.scrollIntoView({ block: 'start' });
  if (panel && root.querySelector(`[data-chart-anchor="${CSS.escape(id)}"]`)) return true;
  const target = step?.querySelector<HTMLElement>(`[data-source-id="${CSS.escape(id)}"]`) ?? Array.from(root.querySelectorAll<HTMLElement>('[id]')).find(el => el.id === id);
  if (!target) return false;
  for (let el: HTMLElement | null = target; el && el !== root; el = el.parentElement) {
    if (el instanceof HTMLDetailsElement) el.open = true;
  }
  target.classList.add('sv-target');
  target.tabIndex = -1;
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: panel ? 'nearest' : 'start' });
  return true;
}
