import type { useRouter } from 'next/navigation';

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

/** Reveal a linked section without scrolling the topic behind an open dialog. */
export function revealEvidence(root: HTMLElement, hash: string): boolean {
  let id: string;
  try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return false; }
  root.querySelectorAll('.sv-target').forEach(el => el.classList.remove('sv-target'));
  const article = root.querySelector<HTMLElement>('.sv-factpage') ?? root.closest<HTMLElement>('.sv-factpage');
  if (!id) {
    if (article) focusViz(article, null);
    return true;
  }
  // On a report's own page: the data panel's step, and the panel brought into
  // view whole, since a chart and its observations are read together.
  const step = showPanelStep(root, id);
  const panel = step?.closest('.sv-walk');
  panel?.scrollIntoView({ block: 'start' });
  if (panel && root.querySelector(`[data-chart-anchor="${CSS.escape(id)}"]`)) return true;
  const found = step?.querySelector<HTMLElement>(`[data-source-id="${CSS.escape(id)}"]`) ?? Array.from(root.querySelectorAll<HTMLElement>('[id]')).find(el => el.id === id);
  if (!found) return false;
  // An old anchor of prose a figure replaced stands in for that figure.
  const aliasFor = found.dataset.aliasFor;
  const target = (aliasFor && Array.from(root.querySelectorAll<HTMLElement>('[id]')).find(el => el.id === aliasFor)) || found;
  // A target inside one visualization shows that visualization on its own;
  // anything else but a source, which every view keeps, shows the whole report.
  if (article && !target.closest('.sv-references, .sv-chart__sources')) focusViz(article, ownViz(target));
  // A whole visualization is not a finding to pick out: start at its tabs.
  if (target.hasAttribute('data-viz')) {
    root.querySelector('.sv-modal__scroll')?.scrollTo(0, 0);
    return true;
  }
  for (let el: HTMLElement | null = target; el && el !== root; el = el.parentElement) {
    if (el instanceof HTMLDetailsElement) el.open = true;
  }
  target.classList.add('sv-target');
  target.tabIndex = -1;
  target.focus({ preventScroll: true });
  const scroll = root.querySelector<HTMLElement>('.sv-modal__scroll');
  if (scroll) scroll.scrollTop += target.getBoundingClientRect().top - scroll.getBoundingClientRect().top - 24;
  else target.scrollIntoView({ block: panel ? 'nearest' : 'start' });
  return true;
}

/** Reveal a section in an open fact sheet, and point its own-page links at it. */
export function showEvidenceInSheet(dialog: HTMLElement, hash: string) {
  dialog.querySelectorAll<HTMLAnchorElement>('a[data-fact-expand]').forEach((link) => {
    if (link.pathname === location.pathname) link.hash = hash;
  });
  revealEvidence(dialog, hash);
}

/**
 * Move an open fact sheet to another section of the same fact. The URL
 * follows without a new history entry, so Close still returns to the topic in
 * one step, and `scroll: false` leaves the scrolling to the reveal.
 */
export function moveSheetToEvidence(dialog: HTMLElement, hash: string, router: ReturnType<typeof useRouter>) {
  if (location.hash !== hash) router.replace(location.pathname + hash, { scroll: false });
  showEvidenceInSheet(dialog, hash);
}

/**
 * The collection's own visualizations, in reading order: those of its
 * featured charts included, those of the related collections nested under it
 * not, since those are separate collections with views of their own.
 */
export function collectionVizzes(article: HTMLElement): HTMLElement[] {
  return Array.from(article.querySelectorAll<HTMLElement>('[data-viz]')).filter(el => !el.closest('.sv-supporting'));
}

/** The collection visualization `el` sits in, if any. */
function ownViz(el: HTMLElement): HTMLElement | null {
  const viz = el.closest<HTMLElement>('[data-viz]');
  return viz && !viz.closest('.sv-supporting') ? viz : null;
}

/**
 * Show one visualization of a data collection on its own, or with `null` the
 * whole report. CSS hides everything else while `data-focus` is set on the
 * article; `VizTabs` follows the attribute to mark its current tab.
 */
export function focusViz(article: HTMLElement, viz: HTMLElement | null) {
  article.querySelectorAll('[data-viz-active]').forEach(el => el.removeAttribute('data-viz-active'));
  article.toggleAttribute('data-whole', !viz);
  if (!viz) {
    article.removeAttribute('data-focus');
    return;
  }
  viz.setAttribute('data-viz-active', '');
  article.setAttribute('data-focus', viz.id);
}
